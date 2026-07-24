(function () {
  var path = (window.location.pathname || '').replace(/\\/g, '/');

  var ROUTES = [
    { prefix: '/toysrus-contact', cls: 'contact-page' },
    { prefix: '/toysrus-retours-gift', cls: 'gift-return-page' }
  ];

  function applyPageClass() {
    for (var i = 0; i < ROUTES.length; i++) {
      if (path.indexOf(ROUTES[i].prefix) === 0) {
        document.body.classList.add(ROUTES[i].cls);
        return;
      }
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

  function init() {
    applyPageClass();
    ensureSiteHeader(0);
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
