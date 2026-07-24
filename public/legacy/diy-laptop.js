(function () {
  function isLaptop() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function removeCheckOutMore() {
    var section = document.querySelector('.diy-more-section');
    if (section) section.remove();
  }

  function wireListingInfolettre() {
    if (window.AJBNewsletter && typeof window.AJBNewsletter.wireForm === "function") {
      window.AJBNewsletter.wireForm({
        form: "listing-signup-form",
        emailInput: "listing-email-input",
        statusEl: "listing-signup-confirm",
        source:
          typeof window.AJBNewsletter.detectContentSource === "function"
            ? window.AJBNewsletter.detectContentSource()
            : "diy",
      });
      return;
    }
    // Fallback: leave unwired so newsletter-subscribe.js can attach later.
  }

  function init() {
    removeCheckOutMore();
    if (!isLaptop()) return;
    wireListingInfolettre();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', init);
})();
