(function () {
  var listEl = document.getElementById('list');
  var infoEl = document.getElementById('info');
  var alphaEl = document.getElementById('alpha');
  var qEl = document.getElementById('q');
  var modeEl = document.getElementById('mode');
  var verEl = document.getElementById('ver');
  var sortEl = document.getElementById('sort');
  var hapaxEl = document.getElementById('hapax');
  var data = null;
  var MAXLOCS = 12;

  function visibleLocs(e, ver) {
    return ver === 'both' ? e.locs : e.locs.filter(function (l) { return l.v === ver; });
  }

  function locLink(l) {
    var a = document.createElement('a');
    a.href = 'index.html#' + l.id + '-z' + l.z;
    a.textContent = l.l + '·' + (l.v === 'low' ? 'L' : 'H') + l.z;
    a.title = 'Θεματοεπιστολή ' + l.l + ', ' + l.v + ', Zeile ' + l.z;
    return a;
  }

  function entryEl(e, locs) {
    var div = document.createElement('div');
    div.className = 'entry';
    var head = document.createElement('div');
    head.className = 'ehead';
    var w = document.createElement('strong');
    w.textContent = e.norm;
    var n = document.createElement('span');
    n.className = 'n';
    n.textContent = locs.length;
    head.appendChild(w); head.appendChild(n);
    var forms = Object.keys(e.forms).sort(function (a, b) { return e.forms[b] - e.forms[a]; });
    if (forms.length > 1 || forms[0] !== e.norm) {
      var f = document.createElement('span');
      f.className = 'forms';
      f.textContent = forms.map(function (x) { return e.forms[x] > 1 ? x + ' (' + e.forms[x] + ')' : x; }).join(', ');
      head.appendChild(f);
    }
    div.appendChild(head);
    var ls = document.createElement('div');
    ls.className = 'locs';
    function fill(all) {
      ls.innerHTML = '';
      var shown = all ? locs : locs.slice(0, MAXLOCS);
      shown.forEach(function (l) { ls.appendChild(locLink(l)); ls.appendChild(document.createTextNode(' ')); });
      if (!all && locs.length > MAXLOCS) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = '+ ' + (locs.length - MAXLOCS) + ' weitere';
        b.addEventListener('click', function () { fill(true); });
        ls.appendChild(b);
      }
    }
    fill(false);
    div.appendChild(ls);
    return div;
  }

  function render() {
    var q = ThemaWords.normalize(qEl.value);
    var mode = modeEl.value, ver = verEl.value, sort = sortEl.value;
    var rows = [];
    data.entries.forEach(function (e) {
      var locs = visibleLocs(e, ver);
      if (!locs.length) return;
      if (q) {
        var hit = mode === 'prefix' ? e.norm.indexOf(q) === 0
          : mode === 'suffix' ? e.norm.slice(-q.length) === q
          : e.norm.indexOf(q) !== -1;
        if (!hit) return;
      }
      if (hapaxEl.checked && locs.length !== 1) return;
      rows.push({ e: e, locs: locs });
    });
    if (sort === 'freq') {
      rows.sort(function (a, b) { return b.locs.length - a.locs.length || (a.e.norm < b.e.norm ? -1 : 1); });
    }
    var tokens = rows.reduce(function (s, r) { return s + r.locs.length; }, 0);
    infoEl.textContent = rows.length + ' Wortformen, ' + tokens + ' Belege';

    var frag = document.createDocumentFragment();
    var lastLetter = '';
    var letters = [];
    rows.forEach(function (r) {
      if (sort === 'alpha') {
        var ch = r.e.norm.charAt(0);
        if (ch !== lastLetter) {
          lastLetter = ch;
          letters.push(ch);
          var h = document.createElement('h2');
          h.id = 'buchstabe-' + ch;
          h.textContent = ch.toUpperCase() + ' ' + ch + (/[a-z]/.test(ch) ? ' (lateinisch)' : '');
          frag.appendChild(h);
        }
      }
      frag.appendChild(entryEl(r.e, r.locs));
    });
    listEl.innerHTML = '';
    listEl.appendChild(frag);
    alphaEl.innerHTML = '';
    letters.forEach(function (ch) {
      var a = document.createElement('a');
      a.href = '#buchstabe-' + ch;
      a.textContent = ch;
      alphaEl.appendChild(a);
    });
  }

  var timer;
  function later() { clearTimeout(timer); timer = setTimeout(render, 150); }
  qEl.addEventListener('input', later);
  [modeEl, verEl, sortEl, hapaxEl].forEach(function (el) { el.addEventListener('change', render); });

  fetch('edition/thematoepistulae.xml')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (t) {
      var xml = new DOMParser().parseFromString(t, 'application/xml');
      data = ThemaWords.buildIndex(xml);
      document.getElementById('tokens').textContent = data.tokens;
      document.getElementById('types').textContent = data.entries.length;
      render();
    })
    .catch(function (err) { listEl.textContent = 'Der Index konnte nicht erstellt werden: ' + err.message; });
})();
