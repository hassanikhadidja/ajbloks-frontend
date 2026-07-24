(function () {
  var MIN_TILES = 6;
  var MIN_FEATURED = 3;

  function isLaptop() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function isBooksPage() {
    return document.body.classList.contains('books-page') ||
      !!document.getElementById('booksCategorySection');
  }

  function ensurePageClass() {
    if (document.getElementById('booksCategorySection')) {
      document.body.classList.add('books-page');
    }
  }

  ensurePageClass();

  function ensureMinItems(track, selector, minCount) {
    if (!track || track.dataset.apiHydrated === '1') return;
    var articles = track.querySelectorAll(selector);
    if (!articles.length || articles.length >= minCount) return;
    var i = 0;
    while (track.querySelectorAll(selector).length < minCount) {
      track.appendChild(articles[i % articles.length].cloneNode(true));
      i += 1;
    }
  }

  function wireBooksCarousels() {
    if (!isLaptop() || !isBooksPage()) return;

    ensureMinItems(document.getElementById('categoryTrack'), '.tile-card', MIN_TILES);
    ensureMinItems(document.getElementById('featuredTrack'), '.product-card', MIN_FEATURED);

    if (window.ProductCarousel && typeof window.ProductCarousel.init === 'function') {
      window.ProductCarousel.init();
    }
  }

  function init() {
    ensurePageClass();
    wireBooksCarousels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('ajb:products-loaded', init);

  window.addEventListener('resize', function () {
    if (isLaptop() && isBooksPage()) wireBooksCarousels();
  });

  window.BooksLaptop = { init: wireBooksCarousels };
})();
