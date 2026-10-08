/* VisionInclusiva — mejoras progresivas (la página funciona sin JS) */
(function () {
  'use strict';

  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, String(value));
    } catch (e) {}
  }

  /* ---------- Tamaño de texto ---------- */
  var SCALES = [0.875, 1, 1.125, 1.25, 1.5, 1.75, 2];

  function currentScale() {
    var s = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale'));
    return isNaN(s) ? 1 : s;
  }

  function setScale(s) {
    if (s === 1) root.style.removeProperty('--font-scale');
    else root.style.setProperty('--font-scale', s);
    store('vi-font-scale', s === 1 ? null : s);
  }

  document.querySelectorAll('[data-font]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-font');
      var cur = currentScale();
      var i = SCALES.indexOf(cur);
      if (i === -1) i = 1;
      if (action === 'up') setScale(SCALES[Math.min(i + 1, SCALES.length - 1)]);
      else if (action === 'down') setScale(SCALES[Math.max(i - 1, 0)]);
      else setScale(1);
    });
  });

  /* ---------- Tema ---------- */
  var themeBtns = document.querySelectorAll('[data-theme-set]');

  function syncThemeButtons() {
    var t = root.getAttribute('data-theme');
    themeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-set') === t));
    });
  }

  themeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = btn.getAttribute('data-theme-set');
      // Pulsar el tema activo vuelve a seguir la preferencia del sistema
      if (root.getAttribute('data-theme') === t) {
        root.removeAttribute('data-theme');
        store('vi-theme', null);
      } else {
        root.setAttribute('data-theme', t);
        store('vi-theme', t);
      }
      syncThemeButtons();
    });
  });
  syncThemeButtons();

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.hidden = false;

    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
  }

  /* ---------- Sección activa en el menú ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var ticking = false;

  // La sección activa es la última cuyo borde superior ha pasado el 40 % de la ventana
  function updateCurrent() {
    ticking = false;
    var line = window.innerHeight * 0.4;
    var current = null;
    sections.forEach(function (s) {
      if (s.getBoundingClientRect().top <= line) current = s.id;
    });
    // Al llegar al final de la página, se marca la última sección
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }
    links.forEach(function (a) {
      if (byId[current] === a) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateCurrent);
    }
  }

  if (sections.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateCurrent();
  }

  /* ---------- Carrusel de noticias ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (box) {
    var track = box.querySelector('.news-track');
    var items = track ? Array.prototype.slice.call(track.children) : [];
    if (items.length < 2) return;

    box.classList.add('is-enhanced');
    box.setAttribute('role', 'region');
    box.setAttribute('aria-roledescription', 'carrusel');
    box.setAttribute('aria-label', 'Noticias del proyecto');
    items.forEach(function (it, i) {
      it.setAttribute('role', 'group');
      it.setAttribute('aria-roledescription', 'diapositiva');
      it.setAttribute('aria-label', (i + 1) + ' de ' + items.length);
    });

    var controls = document.createElement('div');
    controls.className = 'news-controls';
    controls.innerHTML =
      '<button type="button" class="news-btn" data-dir="-1">Anterior</button>' +
      '<button type="button" class="news-btn" data-dir="1">Siguiente</button>' +
      '<p class="news-status" aria-live="polite"></p>';
    box.appendChild(controls);

    var prev = controls.querySelector('[data-dir="-1"]');
    var next = controls.querySelector('[data-dir="1"]');
    var status = controls.querySelector('.news-status');
    var announce = false;

    // Primera noticia que no está completamente a la izquierda de la vista
    function firstVisible() {
      var left = track.scrollLeft;
      for (var i = 0; i < items.length; i++) {
        if (items[i].offsetLeft + items[i].offsetWidth / 2 > left) return i;
      }
      return items.length - 1;
    }

    function update() {
      var i = firstVisible();
      var maxScroll = track.scrollWidth - track.clientWidth;
      // Si caben todas las noticias, los controles sobran
      controls.hidden = maxScroll <= 1;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= maxScroll - 1;
      var shown = 0;
      items.forEach(function (it) {
        var vis = it.offsetLeft + it.offsetWidth > track.scrollLeft + 4 &&
                  it.offsetLeft < track.scrollLeft + track.clientWidth - 4;
        if (vis) shown++;
        // Las noticias fuera de vista no reciben foco ni se leen
        if (vis) it.removeAttribute('inert'); else it.setAttribute('inert', '');
      });
      var text = 'Noticia ' + (i + 1) + ' de ' + items.length;
      if (shown > 1) text = 'Noticias ' + (i + 1) + '–' + Math.min(i + shown, items.length) + ' de ' + items.length;
      status.textContent = announce ? text : '';
      if (!announce) status.setAttribute('data-text', text);
    }

    function go(dir) {
      announce = true;
      var target = Math.max(0, Math.min(items.length - 1, firstVisible() + dir));
      track.scrollTo({ left: items[target].offsetLeft, behavior: 'auto' });
      // 'auto' respeta scroll-behavior de CSS (suave salvo movimiento reducido)
      update();
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
    status.textContent = status.getAttribute('data-text') || '';
  });

  /* ---------- Estado de las fases según la fecha actual ---------- */
  var today = new Date();
  document.querySelectorAll('.phase[data-start][data-end]').forEach(function (phase) {
    var start = new Date(phase.getAttribute('data-start') + 'T00:00:00');
    var end = new Date(phase.getAttribute('data-end') + 'T23:59:59');
    var status = phase.querySelector('.phase__status');
    if (!status) return;
    if (today > end) {
      status.textContent = 'Completada';
    } else if (today >= start) {
      status.textContent = 'En curso';
      phase.classList.add('is-current');
    } else {
      status.textContent = 'Próximamente';
    }
  });
})();
