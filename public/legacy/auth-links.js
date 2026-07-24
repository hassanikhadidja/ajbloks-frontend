(function () {
  if (window.__authLinksInit) return;
  window.__authLinksInit = true;

  function bind() {
    if (window.AJBAuth && typeof window.AJBAuth.applyAuthUi === "function") {
      window.AJBAuth.applyAuthUi();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  document.addEventListener("ajb-auth-change", bind);
})();
