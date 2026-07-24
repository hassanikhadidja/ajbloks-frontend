(function () {
  function init() {
    document.body.classList.add('account-page');

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
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    ensureSiteHeader(0);
  });
})();
