(function () {
  function isTabletContent(w) {
    w = w == null ? window.innerWidth : w;
    return w >= 500 && w <= 799;
  }

  window.isTabletContentWidth = isTabletContent;

  window.isWidePageViewport = function (w) {
    if (window.isLaptopContentWidth && window.isLaptopContentWidth(w)) return true;
    return isTabletContent(w);
  };

  function init() {
    var path = window.location.pathname.replace(/\/$/, '');
    if (path === '/toysrus-diy-activities') {
      document.body.classList.add('diy-activities-page');
    }
    if (path === '/toysrus-printables') {
      document.body.classList.add('printables-listing-page');
    }

    if (isTabletContent()) {
      document.documentElement.classList.add('tablet-content-zone');
      document.body.classList.add('tablet-content-zone');
    } else {
      document.documentElement.classList.remove('tablet-content-zone');
      document.body.classList.remove('tablet-content-zone');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', init);
})();
