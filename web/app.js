(function () {
  var root = document.getElementById('edition');
  var prefs = { view: 'both', lines: true, linenos: true, expan: true, colors: true };
  try { var s = JSON.parse(localStorage.getItem('thema-prefs')); if (s) for (var k in s) prefs[k] = s[k]; } catch (e) {}

  function save() { try { localStorage.setItem('thema-prefs', JSON.stringify(prefs)); } catch (e) {} }

  function apply() {
    root.classList.remove('view-low', 'view-high');
    if (prefs.view !== 'both') root.classList.add('view-' + prefs.view);
    root.classList.toggle('lines', prefs.lines);
    root.classList.toggle('no-linenos', !prefs.linenos);
    root.classList.toggle('hide-expan', !prefs.expan);
    root.classList.toggle('plain', !prefs.colors);
    document.getElementById('c-view').value = prefs.view;
    document.getElementById('c-lines').checked = prefs.lines;
    document.getElementById('c-linenos').checked = prefs.linenos;
    document.getElementById('c-expan').checked = prefs.expan;
    document.getElementById('c-colors').checked = prefs.colors;
  }

  function bind(id, key, isCheck) {
    document.getElementById(id).addEventListener('change', function (e) {
      prefs[key] = isCheck ? e.target.checked : e.target.value;
      save(); apply();
    });
  }

  function fetchXml(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.text();
    }).then(function (t) { return new DOMParser().parseFromString(t, 'application/xml'); });
  }

  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function buildNav() {
    var ol = document.querySelector('nav.letters ol');
    document.querySelectorAll('section.letter').forEach(function (sec) {
      var li = document.createElement('li');
      li.dataset.id = sec.id;
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.textContent = sec.dataset.nr;
      li.appendChild(a);
      ol.appendChild(li);
    });
  }

  function setupSearch() {
    var input = document.getElementById('q');
    var count = document.getElementById('count');
    var letters = Array.prototype.slice.call(document.querySelectorAll('section.letter'));
    var texts = letters.map(function (l) { return norm(l.textContent); });
    input.addEventListener('input', function () {
      var q = norm(input.value.trim());
      var n = 0;
      letters.forEach(function (l, i) {
        var hit = !q || texts[i].indexOf(q) !== -1;
        l.classList.toggle('hidden', !hit);
        var li = document.querySelector('nav.letters li[data-id="' + l.id + '"]');
        if (li) li.classList.toggle('hidden', !hit);
        if (hit) n++;
      });
      count.textContent = q ? n + ' von ' + letters.length + ' Briefen' : '';
    });
  }

  function linkImages() {
    document.querySelectorAll('.imgref').forEach(function (el) {
      var url = 'edition/' + el.dataset.img;
      fetch(url, { method: 'HEAD' }).then(function (r) {
        if (!r.ok) return;
        var a = document.createElement('a');
        a.className = 'imgref';
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        a.title = 'Handschriftenbild öffnen';
        while (el.firstChild) a.appendChild(el.firstChild);
        el.parentNode.replaceChild(a, el);
      }).catch(function () {});
    });
  }

  bind('c-view', 'view', false);
  bind('c-lines', 'lines', true);
  bind('c-linenos', 'linenos', true);
  bind('c-expan', 'expan', true);
  bind('c-colors', 'colors', true);
  apply();

  Promise.all([fetchXml('edition/thematoepistulae.xml'), fetchXml('web/edition.xsl')])
    .then(function (docs) {
      var proc = new XSLTProcessor();
      proc.importStylesheet(docs[1]);
      var frag = proc.transformToFragment(docs[0], document);
      root.innerHTML = '';
      root.appendChild(frag);
      buildNav(); setupSearch(); linkImages();
      if (location.hash) {
        var t = document.getElementById(location.hash.slice(1));
        if (t) t.scrollIntoView();
      }
    })
    .catch(function (err) {
      root.textContent = 'Die Edition konnte nicht geladen werden: ' + err.message;
    });
})();
