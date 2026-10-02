/*
 * Gemeinsame Logik fuer Wortindex und Zeilenanker.
 *
 * Zeilenzaehlung (muss in buildIndex und addLineAnchors identisch sein):
 *   Eine Fassung (div2) beginnt mit Zeile 1. Jeder Zeilenumbruch (lb), vor dem schon
 *   Text der Fassung stand, beginnt eine neue Zeile. Zeilenumbrueche vor dem ersten
 *   Text zaehlen nicht. "Text" ist jedes Nicht-Leerzeichen, auch in Tilgungen,
 *   Noten und Abkuerzungen.
 *
 * Anker: <id der Fassung>-z<Zeile>, z.B. thema6_low-z3
 */
var ThemaWords = (function () {
  var TEI = 'http://www.tei-c.org/ns/1.0';

  // Normalisierung: ohne Akzente, Spiritus, Iota subscriptum; Kleinbuchstaben;
  // Schluss-Sigma = Sigma; nur Buchstaben
  function normalize(s) {
    return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/ς/g, 'σ').replace(/[^\p{L}]/gu, '');
  }

  var APOS = '\u2019\'\u02bc\u1fbd';

  function surface(s) {
    return s.normalize('NFC').toLowerCase()
      .replace(/^[^\p{L}\p{M}]+|[^\p{L}\p{M}\u2019'\u02bc\u1fbd]+$/gu, '');
  }

  // Elision: Wort endet auf Apostroph (Satzzeichen danach ignoriert)
  function isElided(raw) {
    return /[\u2019'\u02bc\u1fbd][^\p{L}\p{M}]*$/u.test(raw);
  }

  // Schluessel im Index. Lateinische Woerter (Zusaetze von Crusius) -> null.
  // Elidierte Formen: laut Tabelle zur Vollform, sonst eigener Eintrag "xyz\u2019".
  function indexKey(raw, elisions) {
    var k = normalize(raw);
    if (!k || /^[a-z]+$/.test(k)) return null;
    if (isElided(raw)) return (elisions && elisions[k]) || (k + '\u2019');
    return k;
  }

  function tokensOf(div2) {
    var st = { seen: false, line: 1, cur: '', curLine: 1, lbFlag: false, curAfterLb: false, toks: [] };

    function flush() {
      if (st.cur) {
        st.toks.push({ raw: st.cur, line: st.curLine, afterLb: st.curAfterLb });
        st.cur = '';
      }
    }
    function seen(str) { if (/\S/.test(str)) st.seen = true; }
    function text(str) {
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i);
        if (/\s/.test(c)) { flush(); continue; }
        st.seen = true;
        if (!st.cur) { st.curLine = st.line; st.curAfterLb = st.lbFlag; st.lbFlag = false; }
        st.cur += c;
      }
    }
    function walk(node) {
      for (var n = node.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3) { text(n.nodeValue); continue; }
        if (n.nodeType !== 1) continue;
        var name = n.localName;
        if (name === 'lb') { flush(); if (st.seen) st.line++; st.lbFlag = true; }
        else if (name === 'space' || name === 'pb') { flush(); }
        else if (name === 'note' || name === 'del' || name === 'abbr') { seen(n.textContent); }
        else if (name === 'c') { seen(n.textContent); flush(); }
        else if (name === 'ab' || name === 's' || name === 'seg') {
          flush(); if (name === 'ab') st.lbFlag = false; walk(n); flush();
        }
        else walk(n);
      }
    }
    walk(div2);
    flush();

    // Worttrennung am Zeilenende: "proθ-" lb "υμίας" -> ein Wort
    var out = [];
    st.toks.forEach(function (t) {
      var prev = out[out.length - 1];
      if (t.afterLb && prev && /\p{L}\p{M}*-$/u.test(prev.raw)) {
        prev.raw = prev.raw.slice(0, -1) + t.raw;
      } else {
        out.push(t);
      }
    });
    return out;
  }

  // Index ueber alle Fassungen (elisions: Tabelle aus elisionen.json, optional): { entries: [{norm, count, forms:{}, locs:[{l,v,z,id}]}], tokens }
  function buildIndex(xml, elisions) {
    var map = {}, total = 0;
    var divs = xml.getElementsByTagNameNS(TEI, 'div1');
    for (var i = 0; i < divs.length; i++) {
      var d1 = divs[i];
      var nr = parseInt(d1.getAttribute('n'), 10);
      var versions = d1.getElementsByTagNameNS(TEI, 'div2');
      for (var j = 0; j < versions.length; j++) {
        var d2 = versions[j];
        var type = d2.getAttribute('type');
        var id = d2.getAttributeNS('http://www.w3.org/XML/1998/namespace', 'id');
        tokensOf(d2).forEach(function (t) {
          var k = indexKey(t.raw, elisions);
          if (!k) return;
          total++;
          var e = map[k] || (map[k] = { norm: k, forms: {}, locs: [] });
          var f = surface(t.raw);
          e.forms[f] = (e.forms[f] || 0) + 1;
          e.locs.push({ l: nr, v: type, z: t.line, id: id });
        });
      }
    }
    var entries = Object.keys(map).map(function (k) { return map[k]; });
    entries.sort(function (a, b) { return a.norm < b.norm ? -1 : a.norm > b.norm ? 1 : 0; });
    return { entries: entries, tokens: total };
  }

  // Zeilenanker im gerenderten HTML (article.version) einfuegen
  function addLineAnchors(root) {
    var arts = root.querySelectorAll('article.version');
    Array.prototype.forEach.call(arts, function (art) {
      var line = 1, seen = false;
      function marker(n) {
        var m = document.createElement('span');
        m.className = 'zl';
        m.id = art.id + '-z' + n;
        return m;
      }
      var label = art.querySelector('.vlabel');
      var nodes = [], tw = document.createTreeWalker(art, NodeFilter.SHOW_ALL, null);
      while (tw.nextNode()) nodes.push(tw.currentNode);
      var first = marker(1);
      art.insertBefore(first, label ? label.nextSibling : art.firstChild);
      nodes.forEach(function (n) {
        if (n.nodeType === 3) {
          if (label && label.contains(n)) return;
          if (/\S/.test(n.nodeValue)) seen = true;
        } else if (n.nodeType === 1 && n.classList.contains('lb')) {
          if (seen) {
            line++;
            n.parentNode.insertBefore(marker(line), n.nextSibling);
          }
        }
      });
    });
  }

  return { normalize: normalize, buildIndex: buildIndex, addLineAnchors: addLineAnchors };
})();
