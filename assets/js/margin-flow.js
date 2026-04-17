/**
 * Layer Flow — Ambient interactive particles in page margins.
 * Left margin: Systems (blue, geometric, downward drift)
 * Right margin: Human (amber, organic, upward drift)
 * Mouse cursor attracts nearby particles. Cross-type proximity creates bridge lines.
 */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768) return;

  var canvas = document.getElementById('marginCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = window.devicePixelRatio || 1;
  var particles = [];
  var mouse = { x: -9999, y: -9999 };
  var paused = false;
  var CONTENT_WIDTH = 960;
  var CONNECT_DIST = 100;
  var ATTRACT_RADIUS = 140;
  var BRIDGE_DIST = 60;

  // --- Helpers ---

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function getLayer() {
    return (document.body.getAttribute('data-layer') || 'both');
  }

  function palette() {
    var dark = isDark();
    return {
      sys:       dark ? '#60A5FA' : '#2563eb',
      sysAlpha:  dark ? 0.22 : 0.32,
      sysLine:   dark ? 'rgba(96,165,250,0.04)' : 'rgba(37,99,235,0.055)',
      hum:       dark ? '#F59E0B' : '#b45309',
      humAlpha:  dark ? 0.18 : 0.28,
      bridge:    dark ? 'rgba(167,139,250,0.05)' : 'rgba(124,58,237,0.07)'
    };
  }

  function bounds() {
    var vw = window.innerWidth;
    var margin = (vw - CONTENT_WIDTH) / 2;
    if (margin < 40) return null; // too narrow for particles
    return { left: margin, right: vw - margin, vw: vw, vh: window.innerHeight };
  }

  // --- Particle creation ---

  function particleCounts() {
    var layer = getLayer();
    if (layer === 'systems') return { sys: 32, hum: 18 };
    if (layer === 'human')  return { sys: 18, hum: 32 };
    return { sys: 26, hum: 26 };
  }

  function createParticle(type) {
    var b = bounds();
    if (!b) return null;
    var isSys = type === 'systems';
    var xMin = isSys ? 8 : b.right + 8;
    var xMax = isSys ? b.left - 8 : b.vw - 8;
    if (xMax <= xMin) return null;

    return {
      x: xMin + Math.random() * (xMax - xMin),
      y: Math.random() * b.vh,
      homeX: 0, // set after x
      vx: 0,
      vy: isSys ? (0.15 + Math.random() * 0.25) : -(0.1 + Math.random() * 0.3),
      r: isSys ? (1.8 + Math.random() * 1.8) : (2 + Math.random() * 2.2),
      type: type,
      shape: (isSys && Math.random() < 0.35) ? 'square' : 'circle',
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4
    };
  }

  function initParticles() {
    particles = [];
    var counts = particleCounts();
    var i;
    for (i = 0; i < counts.sys; i++) {
      var sp = createParticle('systems');
      if (sp) { sp.homeX = sp.x; particles.push(sp); }
    }
    for (i = 0; i < counts.hum; i++) {
      var hp = createParticle('human');
      if (hp) { hp.homeX = hp.x; particles.push(hp); }
    }
  }

  // --- Resize ---

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (window.innerWidth < 768 || !bounds()) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = '';
    initParticles();
  }

  // --- Update ---

  function update() {
    var b = bounds();
    if (!b) return;
    var t = Date.now() / 1000;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var isSys = p.type === 'systems';

      // Drift
      if (isSys) {
        // Systems: downward, slight zigzag
        p.vy = Math.abs(p.vy) || 0.2;
        p.vx = Math.sin(t * 0.8 + p.phase) * 0.15;
      } else {
        // Human: upward, sinusoidal wave
        p.vy = -(Math.abs(p.vy) || 0.2);
        p.vx = Math.sin(t * 0.5 + p.phase) * 0.6;
      }

      // Mouse attraction
      var mx = mouse.x - p.x;
      var my = mouse.y - p.y;
      var md = Math.sqrt(mx * mx + my * my);
      if (md < ATTRACT_RADIUS && md > 1) {
        var force = (1 - md / ATTRACT_RADIUS) * 0.6;
        p.x += (mx / md) * force * 1.5;
        p.y += (my / md) * force * 1.5;
      }

      // Gentle return to home column
      p.x += (p.homeX - p.x) * 0.005;

      p.x += p.vx;
      p.y += p.vy * p.speed;

      // Wrap vertically
      if (isSys && p.y > b.vh + 10) {
        p.y = -10;
        p.phase = Math.random() * Math.PI * 2;
      } else if (!isSys && p.y < -10) {
        p.y = b.vh + 10;
        p.phase = Math.random() * Math.PI * 2;
      }

      // Clamp to own margin
      if (isSys) {
        if (p.x < 4) p.x = 4;
        if (p.x > b.left - 4) p.x = b.left - 4;
      } else {
        if (p.x < b.right + 4) p.x = b.right + 4;
        if (p.x > b.vw - 4) p.x = b.vw - 4;
      }
    }
  }

  // --- Draw ---

  function draw() {
    var b = bounds();
    if (!b) return;
    ctx.clearRect(0, 0, b.vw, b.vh);
    var pal = palette();

    // Systems connecting lines
    for (var a = 0; a < particles.length; a++) {
      if (particles[a].type !== 'systems') continue;
      for (var c = a + 1; c < particles.length; c++) {
        if (particles[c].type !== 'systems') continue;
        var dx = particles[c].x - particles[a].x;
        var dy = particles[c].y - particles[a].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[c].x, particles[c].y);
          ctx.strokeStyle = pal.sysLine;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Bridge lines (cross-type, near content boundary)
    for (var e = 0; e < particles.length; e++) {
      for (var f = e + 1; f < particles.length; f++) {
        if (particles[e].type === particles[f].type) continue;
        var bx = particles[f].x - particles[e].x;
        var by = particles[f].y - particles[e].y;
        var bd = Math.sqrt(bx * bx + by * by);
        if (bd < BRIDGE_DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[e].x, particles[e].y);
          ctx.lineTo(particles[f].x, particles[f].y);
          ctx.strokeStyle = pal.bridge;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Particles
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      var isSys = p.type === 'systems';
      var col = isSys ? pal.sys : pal.hum;
      var alpha = isSys ? pal.sysAlpha : pal.humAlpha;

      // Brighter near mouse
      var mx2 = mouse.x - p.x;
      var my2 = mouse.y - p.y;
      var md2 = Math.sqrt(mx2 * mx2 + my2 * my2);
      if (md2 < ATTRACT_RADIUS) {
        alpha = Math.min(alpha + (1 - md2 / ATTRACT_RADIUS) * 0.35, 0.85);
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = col;

      if (p.shape === 'square') {
        var s = p.r * 1.4;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 4000 + p.phase);
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  // --- Loop ---

  function loop() {
    if (!paused && window.innerWidth >= 768) {
      update();
      draw();
    }
    requestAnimationFrame(loop);
  }

  // --- Events ---

  document.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('touchmove', function (e) {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });

  window.addEventListener('resize', resize);

  // --- Init ---
  resize();
  loop();
})();
