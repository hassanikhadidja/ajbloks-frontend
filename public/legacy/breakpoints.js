(function () {
  function isLaptopContent(w) {
    w = w == null ? window.innerWidth : w;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function isLaptopNav(w) {
    w = w == null ? window.innerWidth : w;
    return w >= 1400;
  }

  function isTabletNav(w) {
    w = w == null ? window.innerWidth : w;
    return w >= 800 && w <= 1399;
  }

  window.LayoutBreakpoints = {
    isLaptopContent: isLaptopContent,
    isLaptopNav: isLaptopNav,
    isTabletNav: isTabletNav
  };

  window.isLaptopContentWidth = isLaptopContent;
})();
