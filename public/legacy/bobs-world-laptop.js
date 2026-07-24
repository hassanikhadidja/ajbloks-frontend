(function () {
  function isLaptop() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function initPage() {
    document.body.classList.add('bobs-world-page');
    syncShopLayout();
    ensureSiteHeader(0);
  }

  function ensureSiteHeader(retry) {
    if (window.SiteHeader && window.SiteHeader.init) {
      window.SiteHeader.init();
      if (window.SiteMenu && window.SiteMenu.init) window.SiteMenu.init();
      return;
    }
    if (retry < 50) {
      setTimeout(function () { ensureSiteHeader(retry + 1); }, 50);
    }
  }

  function syncShopLayout() {
    var track = document.getElementById('bobsProductTrack');
    var progress = document.getElementById('bobsProductProgress');
    if (!track) return;

    if (isLaptop()) {
      track.scrollLeft = 0;
      if (progress && progress.parentElement) {
        progress.parentElement.style.display = 'none';
      }
    } else if (progress && progress.parentElement) {
      progress.parentElement.style.display = '';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }

  window.addEventListener('load', function () {
    ensureSiteHeader(0);
  });

  window.addEventListener('resize', syncShopLayout);
})();
