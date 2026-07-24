/* Photo Lightbox — majidnisar.com */
(function() {
  'use strict';

  var lightbox = document.getElementById('photo-lightbox');
  if (!lightbox) return;

  var triggers = document.querySelectorAll('.photo-lightbox-trigger');
  var items = Array.from(triggers);
  var current = 0;

  var imgEl   = lightbox.querySelector('.lightbox-img');
  var titleEl = lightbox.querySelector('.lightbox-title');
  var locEl   = lightbox.querySelector('.lightbox-location');
  var descEl  = lightbox.querySelector('.lightbox-description');

  function open(index) {
    current = index;
    var t = items[index];
    imgEl.src            = t.getAttribute('data-src');
    imgEl.alt            = t.getAttribute('data-title') || '';
    titleEl.textContent  = t.getAttribute('data-title') || '';
    locEl.textContent    = t.getAttribute('data-location') || '';
    descEl.textContent   = t.getAttribute('data-description') || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lightbox.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    imgEl.src = '';
  }

  function prev() {
    current = (current - 1 + items.length) % items.length;
    open(current);
  }

  function next() {
    current = (current + 1) % items.length;
    open(current);
  }

  triggers.forEach(function(trigger, index) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      open(index);
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', prev);
  lightbox.querySelector('.lightbox-next').addEventListener('click', next);

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function(e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  // Photo tag filter
  var pfBtns = document.querySelectorAll('.pf-btn');
  var photoItems = document.querySelectorAll('.photo-item');

  pfBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      pfBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      photoItems.forEach(function(item) {
        var tags = item.getAttribute('data-tags') || '';
        if (filter === 'all' || tags.indexOf(filter) !== -1) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

})();
