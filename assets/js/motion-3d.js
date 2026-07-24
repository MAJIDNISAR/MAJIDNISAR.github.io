/* ============================================
   Motion 3D — site-wide 3D treatment
   Built on Motion One (window.Motion)

   Features:
   - Page-level 3D stage (perspective on body)
   - Hero spring entrance with 3D depth + idle float
   - Spring-physics 3D tilt with glare on cards
   - Scroll-linked depth on sections
   - Stagger reveal upgrade with springs
   - Page transitions (View Transitions + fallback)
   - 3D button press feedback
   - Photo lift in 3D space
   - prefers-reduced-motion + touch-aware

   Safety-first: never pre-hides DOM via CSS. If Motion fails to load,
   the page renders normally (no invisible content regression).
   ============================================ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var MOTION_SRC = '/assets/js/vendor/motion.min.js';
  var isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  var isMobile = window.innerWidth < 768;

  // Fallback easing (cubic-bezier) used when spring is unavailable
  var FALLBACK_EASING = [0.16, 1, 0.3, 1];

  // Helper to get spring easing - handles both Motion One v1 (object) and v2 (array)
  function getSpringEasing(M, options) {
    if (!M || !M.spring) return FALLBACK_EASING;
    // Guard against undefined/null options
    if (!options || typeof options !== 'object') return FALLBACK_EASING;
    try {
      // Ensure options have valid numeric values
      var safeOptions = {};
      for (var key in options) {
        if (Object.prototype.hasOwnProperty.call(options, key) && typeof options[key] === 'number' && !isNaN(options[key])) {
          safeOptions[key] = options[key];
        }
      }
      // If no valid options remain, use fallback
      if (Object.keys(safeOptions).length === 0) return FALLBACK_EASING;
      
      var result = M.spring(safeOptions);
      // v2 returns array, v1 returns easing object (check if result is array-like)
      if (Array.isArray(result) && result.length > 0) return result;
      // If result is an object with duration, it's v1 - use fallback
      if (result && typeof result === 'object') return FALLBACK_EASING;
      // Guard against undefined result
      return FALLBACK_EASING;
    } catch (e) {
      // If spring throws an error, fall back to cubic-bezier
      return FALLBACK_EASING;
    }
  }

  function loadMotion(cb) {
    if (window.Motion) return cb();
    var s = document.createElement('script');
    s.src = MOTION_SRC;
    s.async = true;
    s.onload = function () { cb(); };
    s.onerror = function () { console.warn('[motion-3d] Motion failed to load — site falls back to flat.'); };
    document.head.appendChild(s);
  }

  // ---------- 0. Page-level 3D stage ----------
  function pageStage() {
    document.documentElement.classList.add('m3d-active');
  }

  // ---------- 1. Hero entrance — depth + spring, never hides DOM ----------
  function heroEntrance(M) {
    var panels = document.querySelectorAll('.gateway-panel');
    if (!panels.length) return;

    try {
      panels.forEach(function (panel, i) {
        panel.dataset.m3dHandled = '1';
        var fromX = panel.classList.contains('gateway-panel--systems') ? -50 : 50;
        var fromRotY = panel.classList.contains('gateway-panel--systems') ? -10 : 10;

        // Motion's keyframes [from, to] override CSS at first frame, so no pre-hide CSS needed.
        M.animate(
          panel,
          {
            opacity: [0, 1],
            x: [fromX, 0],
            y: [50, 0],
            rotateY: [fromRotY, 0],
            rotateX: [8, 0],
            scale: [0.92, 1]
          },
          {
            duration: 1.2,
            delay: 0.1 + i * 0.18,
            easing: getSpringEasing(M, { stiffness: 80, damping: 16 })
          }
        );
      });

      // Idle gentle 3D float — continuous after entrance (skip on mobile)
      if (!isMobile) {
        setTimeout(function () {
          panels.forEach(function (panel, i) {
            var dir = panel.classList.contains('gateway-panel--systems') ? 1 : -1;
            M.animate(
              panel,
              {
                y: [0, -6, 0],
                rotateX: [0, dir * 0.6, 0],
                rotateY: [0, dir * 0.4, 0]
              },
              {
                duration: 7 + i * 0.5,
                repeat: Infinity,
                easing: 'ease-in-out'
              }
            );
          });
        }, 1600);
      }
    } catch (e) {
      console.warn('[motion-3d] hero-entrance', e);
      // Fallback: show panels without animation
      panels.forEach(function (panel) {
        panel.style.opacity = '1';
        panel.style.transform = 'none';
      });
    }
  }

  // ---------- 2. Spring-physics 3D tilt with glare ----------
  function springTilt(M) {
    if (isTouch || isMobile) return;
    // Targets that DON'T conflict with renaissance.js's tilt
    var selector = [
      '.exec-card',
      '.pillar-card',
      '.photo-card',
      '.poem-card',
      '.writing-topic-card',
      '.writing-item',
      '.speaking-card',
      '.identity-card',
      '.exec-focus__block',
      '.testimonial-card',
      '.m3d-spring-tilt'
    ].join(', ');

    document.querySelectorAll(selector).forEach(function (card) {
      if (card.dataset.m3d === 'on') return;
      card.dataset.m3d = 'on';
      card.classList.add('m3d-card');

      if (!card.querySelector('.m3d-glare')) {
        var glare = document.createElement('span');
        glare.className = 'm3d-glare';
        glare.setAttribute('aria-hidden', 'true');
        card.appendChild(glare);
      }

      var rect = null;
      var rafId = null;

      function onEnter() { rect = card.getBoundingClientRect(); }

      function onMove(e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotY = (x - 0.5) * 14;
        var rotX = (0.5 - y) * 14;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(function () {
          M.animate(
            card,
            { rotateX: rotX, rotateY: rotY, z: 30 },
            { duration: 0.5, easing: getSpringEasing(M, { stiffness: 220, damping: 22 }) }
          );
          card.style.setProperty('--mx', (x * 100) + '%');
          card.style.setProperty('--my', (y * 100) + '%');
        });
      }

      function onLeave() {
        rect = null;
        M.animate(
          card,
          { rotateX: 0, rotateY: 0, z: 0 },
          { duration: 0.9, easing: getSpringEasing(M, { stiffness: 100, damping: 20 }) }
        );
      }

      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }

  // ---------- 3. Scroll-linked 3D depth on sections ----------
  function scrollDepth(M) {
    if (!M || !M.scroll) return;
    if (isMobile) return; // scroll-driven 3D feels heavy on small screens

    var sections = document.querySelectorAll(
      '.exec-focus, .case-studies, .gateway-hero, [data-m3d-scroll], section.m3d-depth'
    );

    sections.forEach(function (section) {
      try {
        M.scroll(
          function (info) {
            var p = info.progress;
            var lift = Math.sin(p * Math.PI) * 18;
            var rotX = (0.5 - p) * 3;
            section.style.transform =
              'translate3d(0, ' + (-lift) + 'px, 0) rotateX(' + rotX + 'deg)';
          },
          { target: section, offset: ['start end', 'end start'] }
        );
      } catch (e) {
        console.warn('[motion-3d] scroll-depth', e);
      }
    });
  }

  // ---------- 4. Stagger reveal upgrade ----------
  function staggerReveal(M) {
    if (!M || !M.inView) return;

    document.querySelectorAll('.reveal-stagger').forEach(function (group) {
      var items = Array.prototype.filter.call(group.children, function (c) {
        return c.dataset.m3dHandled !== '1';
      });
      if (!items.length) {
        // All children already handled (e.g. hero) — just mark group visible
        group.classList.add('is-visible', 'revealed');
        return;
      }

      try {
        M.inView(
          group,
          function () {
            M.animate(
              items,
              { opacity: [0, 1], y: [24, 0], z: [-30, 0] },
              {
                duration: 0.7,
                delay: M.stagger ? M.stagger(0.08) : function (i) { return i * 0.08; },
                easing: getSpringEasing(M, { stiffness: 100, damping: 18 })
              }
            );
            group.classList.add('is-visible', 'revealed');
          },
          { margin: '0px 0px -8% 0px' }
        );
      } catch (e) {
        console.warn('[motion-3d] stagger-reveal group', e);
        // Fallback: just show the element
        group.classList.add('is-visible', 'revealed');
      }
    });

    document.querySelectorAll('.reveal:not(.reveal-stagger)').forEach(function (el) {
      if (el.dataset.m3dHandled === '1') return;
      // Skip if this element is a CHILD of a .reveal-stagger group (already handled)
      if (el.parentElement && el.parentElement.classList.contains('reveal-stagger')) return;

      try {
        M.inView(
          el,
          function () {
            var isLeft = el.classList.contains('reveal-left');
            var isRight = el.classList.contains('reveal-right');
            var isUp = el.classList.contains('reveal-up') || (!isLeft && !isRight);
            M.animate(
              el,
              {
                opacity: [0, 1],
                x: isLeft ? [-40, 0] : isRight ? [40, 0] : [0, 0],
                y: isUp ? [30, 0] : [0, 0],
                z: [-40, 0]
              },
              {
                duration: 0.85,
                easing: getSpringEasing(M, { stiffness: 90, damping: 20 })
              }
            );
            el.classList.add('is-visible', 'revealed');
          },
          { margin: '0px 0px -8% 0px' }
        );
      } catch (e) {
        console.warn('[motion-3d] stagger-reveal', e);
        // Fallback: just show the element
        el.classList.add('is-visible', 'revealed');
      }
    });
  }

  // ---------- 5. Page transitions ----------
  function pageTransitions(M) {
    var supportsViewTransitions = !!document.startViewTransition;

    function isInternal(a) {
      if (!a || a.target === '_blank') return false;
      if (a.hasAttribute('download')) return false;
      var href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
      try {
        var url = new URL(a.href, window.location.href);
        return url.origin === window.location.origin;
      } catch (e) { return false; }
    }

    document.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      var a = e.target.closest('a');
      if (!a || !isInternal(a)) return;

      var href = a.href;

      if (supportsViewTransitions) {
        e.preventDefault();
        document.startViewTransition(function () { window.location.href = href; });
        return;
      }

      e.preventDefault();
      M.animate(
        document.body,
        { opacity: [1, 0], y: [0, -8], scale: [1, 0.995] },
        { duration: 0.28, easing: 'ease-in' }
      ).finished.then(function () {
        window.location.href = href;
      }).catch(function () { window.location.href = href; });
    });

    // Animate IN on load
    M.animate(
      document.body,
      { opacity: [0, 1], y: [8, 0] },
      { duration: 0.45, easing: [0.16, 1, 0.3, 1] }
    );
  }

  // ---------- 6. 3D button press feedback ----------
  function buttonPress(M) {
    if (isTouch) return;
    var btnSelector = '.gateway-panel__link, .exec-focus__cta, .nav-link, button.cta, .newsletter-cta-subscribe, .human-layer-cta-primary, [data-m3d-press]';
    document.querySelectorAll(btnSelector).forEach(function (btn) {
      btn.addEventListener('mousedown', function () {
        M.animate(btn, { scale: 0.96, z: -8 }, { duration: 0.12, easing: 'ease-out' });
      });
      btn.addEventListener('mouseup', function () {
        M.animate(btn, { scale: 1, z: 0 }, { duration: 0.3, easing: getSpringEasing(M, { stiffness: 300, damping: 18 }) });
      });
      btn.addEventListener('mouseleave', function () {
        M.animate(btn, { scale: 1, z: 0 }, { duration: 0.3, easing: 'ease-out' });
      });
    });
  }

  // ---------- 7a. Cursor-tracked 3D parallax for hero scene ----------
  function cursorParallax(M) {
    if (isTouch || isMobile) return;
    document.querySelectorAll('[data-m3d-parallax]').forEach(function (stage) {
      var target = stage.querySelector('.m3d-parallax-target') || stage;
      var scene = stage.querySelector('.m3d-scene');
      var rect = null;

      function refresh() { rect = stage.getBoundingClientRect(); }

      stage.addEventListener('mouseenter', refresh);
      window.addEventListener('resize', function () { rect = null; });

      stage.addEventListener('mousemove', function (e) {
        if (!rect) refresh();
        var x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 .. 0.5
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        M.animate(
          target,
          { rotateY: x * 3, rotateX: -y * 3 },
          { duration: 0.8, easing: getSpringEasing(M, { stiffness: 80, damping: 24 }) }
        );

        if (scene) {
          // Scene shifts opposite for depth illusion (subtle)
          M.animate(
            scene,
            { x: -x * 14, y: -y * 10, rotateY: -x * 2, rotateX: y * 2 },
            { duration: 1, easing: getSpringEasing(M, { stiffness: 60, damping: 24 }) }
          );
        }
      });

      stage.addEventListener('mouseleave', function () {
        rect = null;
        M.animate(target, { rotateX: 0, rotateY: 0 }, { duration: 1, easing: 'ease-out' });
        if (scene) M.animate(scene, { x: 0, y: 0, rotateX: 0, rotateY: 0 }, { duration: 1, easing: 'ease-out' });
      });
    });
  }

  // ---------- 7. Photo / image 3D lift on hover ----------
  function photoLift(M) {
    if (isTouch || isMobile) return;
    document.querySelectorAll('.photo-card img, .gallery img, [data-m3d-photo]').forEach(function (img) {
      var parent = img.closest('.photo-card, .gallery, [data-m3d-photo]') || img;
      parent.addEventListener('mouseenter', function () {
        M.animate(img, { z: 30, scale: 1.04 }, { duration: 0.6, easing: getSpringEasing(M, { stiffness: 180, damping: 22 }) });
      });
      parent.addEventListener('mouseleave', function () {
        M.animate(img, { z: 0, scale: 1 }, { duration: 0.7, easing: getSpringEasing(M, { stiffness: 120, damping: 20 }) });
      });
    });
  }

  // ---------- 8. Hero visual — text reveal + parallax ----------
  function heroVisual(M) {
    var hero = document.querySelector('.hero-visual');
    if (!hero) return;

    try {
      var nameEl = hero.querySelector('.hero-visual__name');
      var kicker = hero.querySelector('.hero-visual__kicker');
      var tagline = hero.querySelector('.hero-visual__tagline');
      var actions = hero.querySelector('.hero-visual__actions');
      var bg = hero.querySelector('.hero-visual__bg');

      // Wrap each word in a span for per-word reveal
      if (nameEl && !nameEl.querySelector('.hero-word')) {
        var text = nameEl.textContent.trim();
        nameEl.textContent = '';
        text.split(/\s+/).forEach(function (word) {
          var span = document.createElement('span');
          span.className = 'hero-word';
          span.textContent = word;
          nameEl.appendChild(span);
          nameEl.appendChild(document.createTextNode(' '));
        });
      }

      var words = nameEl ? nameEl.querySelectorAll('.hero-word') : [];

      // Animate kicker
      if (kicker) {
        M.animate(kicker, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.7,
          delay: 0.1,
          easing: [0.16, 1, 0.3, 1]
        });
      }

      // Animate each word with spring stagger
      words.forEach(function (word, i) {
        M.animate(word, {
          opacity: [0, 1],
          y: [30, 0],
          rotateX: [15, 0]
        }, {
          duration: 0.8,
          delay: 0.3 + i * 0.12,
          easing: getSpringEasing(M, { stiffness: 100, damping: 18 })
        });
      });

      // Trigger the gradient underline after words land
      setTimeout(function () {
        if (nameEl) nameEl.classList.add('is-revealed');
      }, 300 + words.length * 120 + 400);

      // Animate tagline
      if (tagline) {
        M.animate(tagline, { opacity: [0, 1], y: [20, 0] }, {
          duration: 0.7,
          delay: 0.3 + words.length * 0.12 + 0.2,
          easing: [0.16, 1, 0.3, 1]
        });
      }

      // Animate buttons
      if (actions) {
        M.animate(actions, { opacity: [0, 1], y: [16, 0] }, {
          duration: 0.6,
          delay: 0.3 + words.length * 0.12 + 0.5,
          easing: [0.16, 1, 0.3, 1]
        });
      }

      // Scroll-linked parallax on hero background
      if (M.scroll && bg && !isMobile) {
        M.scroll(
          function (info) {
            var p = info.progress;
            bg.style.transform = 'translateY(' + (p * 35) + '%) scale(' + (1 + p * 0.08) + ')';
            bg.style.opacity = 1 - p * 0.4;
          },
          { target: hero, offset: ['start start', 'end start'] }
        );
      }
    } catch (e) {
      console.warn('[motion-3d] hero-visual', e);
    }
  }

  // ---------- 9. Animated counters ----------
  function animateCounters(M) {
    if (!M.inView) return;

    document.querySelectorAll('.authority-metric, .outcomes-metric').forEach(function (el) {
      if (el.dataset.m3dCounted) return;
      el.dataset.m3dCounted = '1';

      var raw = el.textContent.trim();
      // Parse target number and surrounding text
      var match = raw.match(/^([^\d]*)([\d]+)(.*)$/);
      if (!match) return;

      var prefix = match[1];
      var target = parseInt(match[2], 10);
      var suffix = match[3];

      M.inView(el, function () {
        var start = performance.now();
        var duration = 1400;

        function tick(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(target * eased);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      }, { margin: '0px 0px -5% 0px' });
    });
  }

  // ---------- 10. Gradient shimmer on kickers ----------
  function shimmerKickers(M) {
    if (!M.inView) return;

    document.querySelectorAll('.kicker-animate').forEach(function (kicker) {
      if (kicker.dataset.m3dShimmer) return;
      kicker.dataset.m3dShimmer = '1';

      M.inView(kicker, function () {
        kicker.classList.add('kicker-shimmer');
      }, { margin: '0px 0px -5% 0px' });
    });
  }

  // ---------- Safety net ----------
  // If Motion fails to load, ensure existing .reveal / .reveal-stagger
  // elements (CSS-hidden via opacity:0) become visible after 2s.
  function safetyNet() {
    setTimeout(function () {
      if (!window.Motion) {
        document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
          el.classList.add('is-visible', 'revealed');
        });
      }
    }, 2000);
  }

  // ---------- Boot ----------
  function init() {
    pageStage();
    safetyNet();
    loadMotion(function () {
      var M = window.Motion;
      if (!M || !M.animate) return;
      try { heroVisual(M); } catch (e) { console.warn('[motion-3d] hero-visual', e); }
      try { heroEntrance(M); } catch (e) { console.warn('[motion-3d] hero', e); }
      try { springTilt(M); } catch (e) { console.warn('[motion-3d] tilt', e); }
      try { scrollDepth(M); } catch (e) { console.warn('[motion-3d] scroll', e); }
      try { staggerReveal(M); } catch (e) { console.warn('[motion-3d] stagger', e); }
      try { pageTransitions(M); } catch (e) { console.warn('[motion-3d] page', e); }
      try { buttonPress(M); } catch (e) { console.warn('[motion-3d] button', e); }
      try { cursorParallax(M); } catch (e) { console.warn('[motion-3d] parallax', e); }
      try { photoLift(M); } catch (e) { console.warn('[motion-3d] photo', e); }
      try { animateCounters(M); } catch (e) { console.warn('[motion-3d] counters', e); }
      try { shimmerKickers(M); } catch (e) { console.warn('[motion-3d] shimmer', e); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
