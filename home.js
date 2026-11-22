// Orbeka Games site: hero orbit animation + app galleries. No dependencies.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Language (EN / TR): default from browser, remembered in localStorage ----
  var T = {
    en: {
      tag: 'Indie studio making games & apps',
      games: 'Our games',
      do_tag: 'No health bar. Just odds.',
      do_desc: 'An isometric zombie survival game. No health bar: every hit is a roll of the dice.',
      privacy: 'Privacy Policy', terms: 'Terms of Use',
      privacy_s: 'Privacy', terms_s: 'Terms', delete_acc: 'Account deletion',
      soon: 'More games coming soon',
      legal: 'Privacy & legal'
    },
    tr: {
      tag: 'Oyun ve uygulama geliştiren bağımsız stüdyo',
      games: 'Oyunlarımız',
      do_tag: 'Can barı yok. Sadece şans.',
      do_desc: 'İzometrik bir zombi hayatta kalma oyunu. Can barı yok: her temasta zar atılır.',
      privacy: 'Gizlilik Politikası', terms: 'Kullanım Şartları',
      privacy_s: 'Gizlilik', terms_s: 'Şartlar', delete_acc: 'Hesap silme',
      soon: 'Yeni oyunlar yolda',
      legal: 'Gizlilik ve şartlar'
    }
  };
  function setLang(l, persist) {
    if (!T[l]) l = 'en';
    document.documentElement.lang = l;
    Array.prototype.forEach.call(document.querySelectorAll('[data-i18n]'), function (el) {
      var v = T[l][el.getAttribute('data-i18n')];
      if (v) el.textContent = v;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-set-lang') === l ? 'true' : 'false');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-shot]'), function (im) {
      im.src = im.getAttribute('data-shot').replace('{lang}', l);
    });
    if (persist) { try { localStorage.setItem('lang', l); } catch (e) {} }
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-set-lang]'), function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang'), true); });
  });
  // <head> script already picked the language (saved choice, else browser language)
  setLang(document.documentElement.lang === 'tr' ? 'tr' : 'en', false);

  // ---- Stars / dust ----
  var stars = document.getElementById('stars');
  if (stars) {
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 70; i++) {
      var s = document.createElementNS(NS, 'circle');
      s.setAttribute('cx', (rnd() * 1600).toFixed(1));
      s.setAttribute('cy', (rnd() * 600).toFixed(1));
      s.setAttribute('r', (0.6 + rnd() * 1.6).toFixed(2));
      s.setAttribute('fill', rnd() < 0.35 ? '#ff7a63' : '#ffffff');
      s.setAttribute('class', 'star');
      s.style.animationDelay = (rnd() * 6).toFixed(2) + 's';
      s.setAttribute('opacity', (0.15 + rnd() * 0.5).toFixed(2));
      stars.appendChild(s);
    }
  }

  // ---- Comet on the orbit ----
  var orbit = document.getElementById('orbitPath');
  var comet = document.getElementById('comet');
  var trailG = document.getElementById('trail');
  if (orbit && comet && trailG) {
    var cx = 1180, cy = 300, rx = 360, ry = 165;
    var N = 46, dots = [];
    for (var k = 0; k < N; k++) {
      var d = document.createElementNS(NS, 'circle');
      var f = 1 - k / N;
      d.setAttribute('r', (2 + 13 * f * f).toFixed(2));
      d.setAttribute('fill', k < 6 ? '#ffd2c4' : '#ff5a45');
      d.setAttribute('opacity', (0.75 * f * f).toFixed(3));
      trailG.appendChild(d);
      dots.push(d);
    }
    var PERIOD = 12000;          // ms per lap
    var start = performance.now() - PERIOD * 0.62; // begin top-right
    function place(t) {
      var a = (t / PERIOD) * Math.PI * 2;
      comet.setAttribute('cx', (cx + rx * Math.cos(a)).toFixed(1));
      comet.setAttribute('cy', (cy + ry * Math.sin(a)).toFixed(1));
      for (var j = 0; j < N; j++) {
        var b = a - j * 0.012;
        dots[j].setAttribute('cx', (cx + rx * Math.cos(b)).toFixed(1));
        dots[j].setAttribute('cy', (cy + ry * Math.sin(b)).toFixed(1));
      }
    }
    if (reduce) {
      place(PERIOD * 0.62);
    } else {
      var frame = function (now) { place(now - start); requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    }
  }

  // ---- Galleries: arrows scroll one item; hide arrows at the ends ----
  var galleries = document.querySelectorAll('.gallery');
  Array.prototype.forEach.call(galleries, function (g) {
    var row = g.querySelector('.shots');
    var prev = g.querySelector('.prev');
    var next = g.querySelector('.next');
    function step() {
      var item = row.querySelector('.shot');
      var gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : row.clientWidth * 0.8;
    }
    function update() {
      var max = row.scrollWidth - row.clientWidth - 2;
      prev.hidden = row.scrollLeft <= 2;
      next.hidden = row.scrollLeft >= max;
    }
    prev.addEventListener('click', function () { row.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { row.scrollBy({ left: step(), behavior: 'smooth' }); });
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
