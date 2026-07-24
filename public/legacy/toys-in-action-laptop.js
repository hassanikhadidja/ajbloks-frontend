(function () {
  function initPage() {
    document.body.classList.add('toys-action-page');
    document.documentElement.classList.add('toys-action-page');

    if (window.SiteHeader && window.SiteHeader.init) {
      window.SiteHeader.init();
    }
    if (window.SiteMenu && window.SiteMenu.init) {
      window.SiteMenu.init();
    }
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }

  window.addEventListener('load', function () {
    ensureSiteHeader(0);
  });
})();
