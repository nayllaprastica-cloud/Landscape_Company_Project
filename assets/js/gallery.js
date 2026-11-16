/* =========================================================
   gallery.js — Photo carousels untuk halaman Gallery
   Satu script menangani semua chapter carousel (data-gallery-block).
   ========================================================= */
(function () {
  'use strict';

  var blocks = document.querySelectorAll('[data-gallery-block]');
  if (!blocks.length) return;

  function pad(number) {
    return number < 10 ? '0' + number : String(number);
  }

  function initCarousel(block) {
    var viewport = block.querySelector('[data-carousel-viewport]');
    var track = block.querySelector('[data-carousel-track]');
    var prevBtn = block.querySelector('[data-carousel-prev]');
    var nextBtn = block.querySelector('[data-carousel-next]');
    var currentEl = block.querySelector('[data-carousel-current]');
    var totalEl = block.querySelector('[data-carousel-total]');
    var progressEl = block.querySelector('[data-carousel-progress]');

    if (!viewport || !track) return;

    var cards = track.querySelectorAll('.photo-card');
    if (!cards.length) return;

    var ticking = false;

    function getStep() {
      var firstCard = cards[0];
      if (!firstCard) return viewport.clientWidth;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;

      return firstCard.getBoundingClientRect().width + gap;
    }

    function getMaxScroll() {
      return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    }

    function update() {
      ticking = false;

      var maxScroll = getMaxScroll();
      var step = getStep();
      var pages = step > 0 ? Math.round(maxScroll / step) + 1 : 1;
      var current = step > 0 ? Math.round(viewport.scrollLeft / step) + 1 : 1;

      if (current < 1) current = 1;
      if (current > pages) current = pages;

      if (currentEl) currentEl.textContent = pad(current);
      if (totalEl) totalEl.textContent = pad(pages);

      if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 6;
      if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= maxScroll - 6;

      if (progressEl) {
        var visibleRatio = viewport.scrollWidth > 0
          ? Math.min(1, viewport.clientWidth / viewport.scrollWidth)
          : 1;
        var travel = (visibleRatio >= 1 || maxScroll === 0)
          ? 0
          : (viewport.scrollLeft / maxScroll) * ((1 - visibleRatio) / visibleRatio) * 100;

        progressEl.style.width = (visibleRatio * 100) + '%';
        progressEl.style.transform = 'translateX(' + travel + '%)';
      }
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    function scrollByPage(direction) {
      viewport.scrollBy({
        left: direction * getStep(),
        behavior: 'smooth'
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scrollByPage(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scrollByPage(1);
      });
    }

    viewport.addEventListener('scroll', requestUpdate, { passive: true });

    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollByPage(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollByPage(1);
      }
    });

    window.addEventListener('resize', requestUpdate);
    window.addEventListener('load', update);

    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(requestUpdate);
      observer.observe(viewport);
      observer.observe(track);
    }

    update();
  }

  blocks.forEach(initCarousel);
})();
