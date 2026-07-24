(function () {
  if (window.__dashboardFabInit) return;
  window.__dashboardFabInit = true;

  if (/\/dashboard$/i.test(window.location.pathname)) return;

  function assetPrefix() {
    return "";
  }

  function isAdmin() {
    return window.AJBAuth && typeof window.AJBAuth.isAdmin === "function" && window.AJBAuth.isAdmin();
  }

  function mountFab() {
    if (document.body.dataset.dashboardFabMounted === "true") return;
    if (!isAdmin()) return;

    var p = assetPrefix();
    var fab = document.createElement("a");
    fab.className = "dashboard-fab";
    fab.href = p + "/dashboard";
    fab.setAttribute("aria-label", "Tableau de bord");
    fab.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="3" width="7" height="7" rx="1"/>' +
        '<rect x="14" y="3" width="7" height="7" rx="1"/>' +
        '<rect x="14" y="14" width="7" height="7" rx="1"/>' +
        '<rect x="3" y="14" width="7" height="7" rx="1"/>' +
      "</svg>";
    document.body.appendChild(fab);
    document.body.dataset.dashboardFabMounted = "true";
  }

  function tryMount() {
    mountFab();
  }

  function scheduleMount() {
    tryMount();
    document.addEventListener("ajb-auth-change", tryMount);
    var attempts = 0;
    var timer = setInterval(function () {
      tryMount();
      if (document.body.dataset.dashboardFabMounted === "true" || ++attempts > 100) {
        clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleMount);
  } else {
    scheduleMount();
  }
})();
