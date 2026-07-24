(function () {
  var DL_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  }

  function renderCard(item) {
    var pdfUrl = item.pdfUrl || "#";
    return (
      '<article class="catalogue-card">' +
      '<img src="' +
      esc(item.picture) +
      '" width="393" height="200" alt="' +
      esc(item.title) +
      '">' +
      '<div class="catalogue-caption">' +
      "<h2>" +
      esc(item.title) +
      "</h2>" +
      '<button class="catalogue-dl" type="button" data-pdf-url="' +
      esc(pdfUrl) +
      '">' +
      esc(item.buttonSentence) +
      " " +
      DL_ICON +
      "</button></div></article>"
    );
  }

  function bindDownloads(gallery) {
    gallery.querySelectorAll(".catalogue-dl[data-pdf-url]").forEach(function (btn) {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        var url = btn.getAttribute("data-pdf-url");
        if (url && url !== "#") {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      });
    });
  }

  function render(gallery, items) {
    if (!gallery || !Array.isArray(items) || !items.length) return;
    gallery.innerHTML = items.map(renderCard).join("");
    bindDownloads(gallery);
  }

  function loadGallery(gallery) {
    if (!gallery) return;
    bindDownloads(gallery);
    if (gallery.querySelector(".catalogue-card")) return;

    if (!window.AJBApi || typeof window.AJBApi.get !== "function") return;

    window.AJBApi.get("/catalogue")
      .then(function (items) {
        render(gallery, items);
      })
      .catch(function () {});
  }

  function boot() {
    var gallery = document.querySelector(".catalogue-gallery");
    if (!gallery) return;

    if (window.AJBApi && typeof window.AJBApi.get === "function") {
      loadGallery(gallery);
      return;
    }

    if (typeof window.AJBApi !== "undefined" && typeof window.AJBApi.whenReady === "function") {
      window.AJBApi.whenReady(function () {
        loadGallery(gallery);
      });
      return;
    }

    document.addEventListener(
      "ajb:api-ready",
      function () {
        loadGallery(gallery);
      },
      { once: true },
    );
  }

  window.refreshGrossisteCatalogue = boot;

  if (!window.__grossisteCatalogueBound) {
    window.__grossisteCatalogueBound = true;
    document.addEventListener("ajb:legacy-page-ready", boot);
    document.addEventListener("ajb:api-ready", boot);
  }

  boot();
})();
