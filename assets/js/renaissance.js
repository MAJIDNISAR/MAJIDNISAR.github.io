/* ================================================================
   RENAISSANCE — Animations, Patterns & Interactions
   ================================================================ */

(function () {
  'use strict';

  /* ============================================
     1. SCROLL REVEAL (IntersectionObserver)
     ============================================ */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale, .reveal-stagger'
    );

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Once revealed, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }

  /* ============================================
     2. CONSTELLATION PATTERN (Canvas)
     ============================================ */
  function initConstellation() {
    const containers = document.querySelectorAll('.pattern-constellation');
    if (!containers.length) return;

    containers.forEach((container) => {
      const canvas = document.createElement('canvas');
      canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      let particles = [];
      let animFrame;

      function resize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
      }

      function createParticles() {
        const layer = document.body.getAttribute('data-layer') || 'both';
        const count = Math.min(40, Math.floor((canvas.width * canvas.height) / 25000));
        particles = [];

        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 1,
            layer: layer,
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const layer = document.body.getAttribute('data-layer') || 'both';

        // Colors based on layer
        let dotColor, lineColor;
        if (layer === 'systems') {
          dotColor = 'rgba(37, 99, 235, 0.2)';
          lineColor = 'rgba(37, 99, 235, 0.06)';
        } else if (layer === 'human') {
          dotColor = 'rgba(180, 83, 9, 0.15)';
          lineColor = 'rgba(180, 83, 9, 0.04)';
        } else {
          dotColor = 'rgba(124, 58, 237, 0.12)';
          lineColor = 'rgba(124, 58, 237, 0.04)';
        }

        // Draw lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
              ctx.beginPath();
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        // Draw particles
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.fillStyle = dotColor;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();

          // Move particles
          p.x += p.vx;
          p.y += p.vy;

          // Bounce off edges
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        animFrame = requestAnimationFrame(draw);
      }

      // Check if reduced motion is preferred
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      resize();
      createParticles();
      draw();

      window.addEventListener('resize', () => {
        resize();
        createParticles();
      });

      // Cleanup on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          cancelAnimationFrame(animFrame);
        } else {
          draw();
        }
      });
    });
  }

  /* ============================================
     3. SMOOTH NAVBAR SCROLL EFFECT
     ============================================ */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    let lastScroll = 0;
    let ticking = false;

    function updateNavbar() {
      const scrollY = window.pageYOffset;

      if (scrollY > 50) {
        navbar.classList.add('top-nav-short');
      } else {
        navbar.classList.remove('top-nav-short');
      }

      // Auto-hide on scroll down, show on scroll up
      if (scrollY > 300) {
        if (scrollY > lastScroll + 5) {
          navbar.style.transform = 'translateY(-100%)';
        } else if (scrollY < lastScroll - 5) {
          navbar.style.transform = 'translateY(0)';
        }
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastScroll = scrollY;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateNavbar);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Add smooth transition for navbar transform
    navbar.style.transition =
      'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease, box-shadow 0.3s ease';
  }

  /* ============================================
     4. MAGNETIC BUTTON EFFECT
     ============================================ */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll(
      '.gateway-panel__link--primary, .nav-item--cta .nav-link, .newsletter-cta-subscribe, .human-layer-cta-primary'
    );

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================================
     5. COUNTER ANIMATION
     ============================================ */
  function initCounterAnimation() {
    const metrics = document.querySelectorAll('.authority-metric');
    if (!metrics.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const text = el.textContent.trim();
            const match = text.match(/^(\d+)/);

            if (match) {
              const target = parseInt(match[1], 10);
              const suffix = text.replace(match[1], '');
              let current = 0;
              const increment = Math.ceil(target / 40);
              const duration = 1200;
              const stepTime = duration / (target / increment);

              const counter = setInterval(() => {
                current += increment;
                if (current >= target) {
                  current = target;
                  clearInterval(counter);
                }
                el.textContent = current + suffix;
              }, stepTime);
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    metrics.forEach((m) => observer.observe(m));
  }

  /* ============================================
     6. TILT EFFECT ON CARDS
     ============================================ */
  function initTiltEffect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    const cards = document.querySelectorAll('.gateway-panel, .stream-card, .case-study-card, .monetization-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const rotateX = (y - 0.5) * -4;
        const rotateY = (x - 0.5) * 4;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
          card.style.transition = '';
        }, 500);
      });
    });
  }

  /* ============================================
     7. SMOOTH ANCHOR SCROLLING
     ============================================ */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }

  /* ============================================
     8. CURSOR EFFECTS — Layer-aware glow + ring
     ============================================ */
  function initCursorGlow() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window) return;

    const cursor = document.createElement('div');
    cursor.className = 'layer-cursor';
    const core = document.createElement('div');
    core.className = 'layer-cursor-core';

    document.body.appendChild(cursor);
    document.body.appendChild(core);
    document.body.classList.add('cursor-enhanced');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let coreX = 0;
    let coreY = 0;

    document.addEventListener(
      'mousemove',
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
        core.style.opacity = '1';
      },
      { passive: true }
    );

    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.16;
      cursorY += (mouseY - cursorY) * 0.16;
      coreX += (mouseX - coreX) * 0.28;
      coreY += (mouseY - coreY) * 0.28;

      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      core.style.left = coreX + 'px';
      core.style.top = coreY + 'px';

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, [role="button"], .card-lift, .gateway-panel__link, .exec-card, .pillar-card, .speaking-card, .stream-card, .case-study-card, .monetization-card, .photo-card, .poem-card, .writing-item, .writing-topic-card');
      if (target) {
        document.body.classList.add('cursor-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, [role="button"], .card-lift, .gateway-panel__link, .exec-card, .pillar-card, .speaking-card, .stream-card, .case-study-card, .monetization-card, .photo-card, .poem-card, .writing-item, .writing-topic-card');
      if (target) {
        document.body.classList.remove('cursor-hovering');
      }
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      core.style.opacity = '0';
      document.body.classList.remove('cursor-hovering');
    });
  }

  /* ============================================
     9. PARALLAX HEADER SHAPES
     ============================================ */
  function initParallaxShapes() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const shapes = document.querySelectorAll('.header-decor__shape');
    if (!shapes.length) return;

    let ticking = false;

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.pageYOffset;
            shapes.forEach((shape, i) => {
              const speed = 0.03 + i * 0.02;
              shape.style.transform = `translateY(${scrollY * speed}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ============================================
     10. TYPING EFFECT FOR KICKERS
     ============================================ */
  function initTypingEffect() {
    // Only on homepage
    if (document.body.getAttribute('data-layer') !== 'gateway') return;

    const kickers = document.querySelectorAll('.gateway-panel__kicker');
    kickers.forEach((kicker) => {
      const text = kicker.textContent;
      kicker.textContent = '';
      kicker.style.borderRight = '2px solid currentColor';

      let i = 0;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const type = () => {
                if (i < text.length) {
                  kicker.textContent += text[i];
                  i++;
                  setTimeout(type, 40 + Math.random() * 30);
                } else {
                  setTimeout(() => {
                    kicker.style.borderRight = 'none';
                  }, 600);
                }
              };
              setTimeout(type, 300);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(kicker);
    });
  }

  /* ============================================
     INIT ALL
     ============================================ */
  function init() {
    initScrollReveal();
    initNavbarScroll();
    initSmoothAnchors();
    initParallaxShapes();

    // Delay heavier effects
    requestAnimationFrame(() => {
      initConstellation();
      initCounterAnimation();
      initMagneticButtons();
      initTiltEffect();
      initCursorGlow();
      initTypingEffect();
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
