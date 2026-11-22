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

  // ---- Lightbox: click a gallery item to view it large; video opens with sound ----
  var lb = document.querySelector('.lb');
  if (lb) {
    var stage = lb.querySelector('.lb-stage');
    var items = [], idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var el = items[idx];
      stage.innerHTML = '';
      var node;
      if (el.tagName === 'VIDEO') {
        node = document.createElement('video');
        node.src = el.getAttribute('data-full') || el.currentSrc || el.src;
        node.poster = el.poster || '';
        node.controls = true; node.autoplay = true; node.playsInline = true; node.loop = true;
        node.muted = false;
        var p = node.play && node.play();
        if (p && p.catch) p.catch(function () { node.muted = true; node.play(); });
      } else {
        node = document.createElement('img');
        node.src = el.currentSrc || el.src;
        node.alt = el.alt || '';
      }
      node.className = 'lb-media';
      stage.appendChild(node);
      lb.querySelector('.lb-prev').hidden = items.length < 2;
      lb.querySelector('.lb-next').hidden = items.length < 2;
    }
    function open(list, i) {
      items = list; lastFocus = document.activeElement;
      // pause small previews while the big one plays
      Array.prototype.forEach.call(document.querySelectorAll('.shots video'), function (v) { v.pause(); });
      lb.hidden = false; document.body.classList.add('lb-open');
      show(i);
      lb.querySelector('.lb-close').focus();
    }
    function close() {
      stage.innerHTML = '';
      lb.hidden = true; document.body.classList.remove('lb-open');
      Array.prototype.forEach.call(document.querySelectorAll('.shots video'), function (v) { v.play && v.play().catch(function(){}); });
      if (lastFocus) lastFocus.focus();
    }
    Array.prototype.forEach.call(document.querySelectorAll('.shots'), function (row) {
      var list = Array.prototype.slice.call(row.querySelectorAll('.shot'));
      list.forEach(function (el, i) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.addEventListener('click', function () { open(list, i); });
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(list, i); } });
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
    // swipe on touch screens
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }
})();
