/* ------------------------------------------------------------------
   Global performance runtime: route prefetching, product-data warmup
   on hover, and image loading polish.
   Included automatically on every legacy page by LegacyPage.tsx.
   ------------------------------------------------------------------ */
(function () {
  if (window.__AJB_PERF_BOOTED__) return;
  window.__AJB_PERF_BOOTED__ = 1;

  var PDP_PATH = "/product-detail-page-mega-bloks";
  var prefetchedUrls = new Set();
  var prefetchedProducts = new Set();

  function idle(fn) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 200);
    }
  }

  function saveDataMode() {
    var conn = navigator.connection;
    return Boolean(conn && (conn.saveData || /(^|\b)2g/.test(conn.effectiveType || "")));
  }

  // ---- Route prefetching -------------------------------------------

  function prefetchUrl(href) {
    if (!href || prefetchedUrls.has(href) || saveDataMode()) return;
    prefetchedUrls.add(href);
    var link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "document";
    link.href = href;
    document.head.appendChild(link);
  }

  function prefetchableHref(anchor) {
    if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
    var href = anchor.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#" || /^(mailto:|tel:|javascript:)/i.test(href)) return null;
    var url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (e) {
      return null;
    }
    if (url.origin !== window.location.origin) return null;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
    if (/^\/(api|dashboard|_next)\b/.test(url.pathname)) return null;
    return url.pathname + url.search;
  }

  function onLinkIntent(event) {
    var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    var href = prefetchableHref(anchor);
    if (href) prefetchUrl(href);
    if (anchor) warmProductData(anchor.closest(".product-card"));
  }

  // Chromium: let the browser prefetch same-site links it deems likely.
  function installSpeculationRules() {
    if (
      !HTMLScriptElement.supports ||
      !HTMLScriptElement.supports("speculationrules") ||
      saveDataMode()
    ) {
      return;
    }
    var script = document.createElement("script");
    script.type = "speculationrules";
    script.textContent = JSON.stringify({
      prefetch: [
        {
          source: "document",
          where: {
            and: [
              { href_matches: "/*" },
              { not: { href_matches: "/api/*" } },
              { not: { href_matches: "/dashboard*" } },
            ],
          },
          eagerness: "moderate",
        },
      ],
    });
    document.head.appendChild(script);
  }

  // ---- Product data warmup on card hover/touch ----------------------

  function warmProductData(card) {
    if (!card || !card.dataset || !card.dataset.productId) return;
    var id = card.dataset.productId;
    if (prefetchedProducts.has(id) || saveDataMode()) return;
    prefetchedProducts.add(id);
    prefetchUrl(PDP_PATH + "?id=" + encodeURIComponent(id));
    if (window.AJBApi && typeof window.AJBApi.prefetch === "function") {
      window.AJBApi.prefetch("/product/" + id);
    }
  }

  // ---- Image loading polish ------------------------------------------

  function polishImages() {
    var viewportBottom = window.innerHeight * 1.5;
    document.querySelectorAll("img:not([data-ajb-polished])").forEach(function (img) {
      img.setAttribute("data-ajb-polished", "1");
      if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
      if (!img.getAttribute("loading")) {
        var rect;
        try {
          rect = img.getBoundingClientRect();
        } catch (e) {
          return;
        }
        if (rect.top > viewportBottom) img.setAttribute("loading", "lazy");
      }
    });
  }

  // ---- Boot ----------------------------------------------------------

  function boot() {
    installSpeculationRules();
    document.addEventListener("pointerover", onLinkIntent, { passive: true });
    document.addEventListener("touchstart", onLinkIntent, { passive: true });
    document.addEventListener("focusin", onLinkIntent);
    idle(polishImages);
    document.addEventListener("ajb:products-loaded", function () {
      idle(polishImages);
    });
    document.addEventListener("ajb:legacy-page-ready", function () {
      idle(polishImages);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
