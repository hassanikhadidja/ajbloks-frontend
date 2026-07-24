(function () {
  function isLaptop() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function initPageClass() {
    document.body.classList.add('histoire-page');
  }

  function isHistoirePage() {
    return document.body.classList.contains('histoire-page');
  }

  function ensureMinTiles(track) {
    if (!track) return;
    var tiles = track.querySelectorAll('.tile-card');
    if (!tiles.length || tiles.length >= MIN_TILES) return;
    var i = 0;
    while (track.querySelectorAll('.tile-card').length < MIN_TILES) {
      track.appendChild(tiles[i % tiles.length].cloneNode(true));
      i += 1;
    }
  }

  function wireHistoireCarousels() {
    if (!isLaptop() || !isHistoirePage()) return;

    ['storyAgeTrack', 'storyCategoryTrack', 'storyCharacterTrack'].forEach(ensureMinTiles);

    if (window.ProductCarousel && typeof window.ProductCarousel.init === 'function') {
      window.ProductCarousel.init();
    }
  }

  function init() {
    initPageClass();
    wireHistoireCarousels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function () {
    if (isLaptop() && isHistoirePage()) wireHistoireCarousels();
  });
})();
