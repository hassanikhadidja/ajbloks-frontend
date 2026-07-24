(function () {
  var MIN_CARDS = 5;

  var arrowPrevSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var arrowNextSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  function isLaptop() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function ensureMinCards(carousel) {
    if (carousel.dataset.apiHydrated === '1') return;
    var cards = carousel.querySelectorAll('.product-card');
    if (cards.length >= MIN_CARDS || !cards.length) return;
    var i = 0;
    while (carousel.querySelectorAll('.product-card').length < MIN_CARDS) {
      carousel.appendChild(cards[i % cards.length].cloneNode(true));
      i += 1;
    }
  }

  function enhanceSectionCarousel(section) {
    var carousel = section.querySelector('.carousel:not(.carousel-track)');
    if (!carousel || carousel.dataset.pagedEnhanced === '1') return;

    ensureMinCards(carousel);

    var scrollTrack = section.querySelector('.scroll-track');
    var row = document.createElement('div');
    row.className = 'carousel-row carousel-row--paged';

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-arrow carousel-arrow--prev';
    prev.setAttribute('aria-label', 'Produits précédents');
    prev.innerHTML = arrowPrevSvg;

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-arrow carousel-arrow--next';
    next.setAttribute('aria-label', 'Produits suivants');
    next.innerHTML = arrowNextSvg;

    var viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';

    carousel.classList.add('carousel-track');
    carousel.parentNode.insertBefore(row, carousel);
    row.appendChild(prev);
    row.appendChild(viewport);
    viewport.appendChild(carousel);
    row.appendChild(next);

    section.classList.add('carousel-wrap');
    carousel.dataset.pagedEnhanced = '1';
    if (scrollTrack) scrollTrack.setAttribute('hidden', 'hidden');
  }

  function enhanceCatégorieCarousels() {
    if (!isLaptop()) return;
    document.querySelectorAll('.age-section').forEach(enhanceSectionCarousel);
    if (window.ProductCarousel && typeof window.ProductCarousel.init === 'function') {
      window.ProductCarousel.init();
    }
  }

  function initScrollThumbs() {
    document.querySelectorAll('.age-section .carousel').forEach(function (carousel) {
      var track = carousel.nextElementSibling;
      if (!track || !track.classList.contains('scroll-track')) {
        var section = carousel.closest('.age-section');
        track = section && section.querySelector('.scroll-track');
      }
      if (!track || track.hasAttribute('hidden')) return;
      var thumb = track.querySelector('.scroll-thumb');
      if (!thumb || carousel.dataset.thumbWired === '1') return;

      function updateThumb() {
        var maxScroll = carousel.scrollWidth - carousel.clientWidth;
        var trackWidth = track.clientWidth;
        var thumbWidth = thumb.clientWidth;
        var maxThumbTravel = trackWidth - thumbWidth;
        var ratio = maxScroll > 0 ? (carousel.scrollLeft / maxScroll) : 0;
        thumb.style.left = (ratio * maxThumbTravel) + 'px';
      }

      carousel.addEventListener('scroll', updateThumb);
      window.addEventListener('resize', updateThumb);
      carousel.dataset.thumbWired = '1';
      updateThumb();
    });
  }

  function init() {
    enhanceCatégorieCarousels();
    initScrollThumbs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('ajb:products-loaded', init);

  window.addEventListener('resize', function () {
    if (isLaptop()) init();
  });
})();
