/* ------------------------------------------------------------------
   Global performance runtime: route prefetching, product-data warmup
   on hover, hero prioritization, and image loading polish.
   Included automatically on every legacy page by LegacyPage.tsx.
   ------------------------------------------------------------------ */
(function () {
  if (window.__AJB_PERF_BOOTED__) {
    // Re-run polish on soft navigations even if already booted.
    document.dispatchEvent(new CustomEvent("ajb:perf-repolish"));
    return;
  }
  window.__AJB_PERF_BOOTED__ = 1;

  var PDP_PATH = "/product-detail-page-mega-bloks";
  var prefetchedUrls = new Set();
  var prefetchedProducts = new Set();
  var preloadedImages = new Set();

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

  function cloudinaryOptimize(url, width) {
    var src = String(url || "");
    if (src.indexOf("res.cloudinary.com") === -1 || src.indexOf("/image/upload/") === -1) {
      return src;
    }
    if (/\/image\/upload\/[^/]*f_auto/.test(src)) return src;
    return src.replace(
      "/image/upload/",
      "/image/upload/f_auto,q_auto:good,w_" + (width || 1200) + ",c_limit/",
    );
  }

  function injectPreload(url, high) {
    if (!url || preloadedImages.has(url) || saveDataMode()) return;
    preloadedImages.add(url);
    if (document.querySelector('link[rel="preload"][as="image"][href="' + url.replace(/"/g, '\\"') + '"]')) {
      return;
    }
    var link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    if (high) link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
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

  function installSpeculationRules() {
    if (
      !HTMLScriptElement.supports ||
      !HTMLScriptElement.supports("speculationrules") ||
      saveDataMode()
    ) {
      return;
    }
    if (document.getElementById("ajb-speculation-rules")) return;
    var script = document.createElement("script");
    script.id = "ajb-speculation-rules";
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

  // ---- Hero / LCP prioritization ------------------------------------

  function prioritizeHeroes() {
    var selectors = [
      ".hero-full-media",
      ".hero-banner img",
      ".bobs-hero img",
      ".bobs-banner img",
      ".story-hero-img",
      ".hero img",
      ".hero-img img",
      "img[fetchpriority='high']",
    ];
    var heroes = document.querySelectorAll(selectors.join(","));
    heroes.forEach(function (img, index) {
      if (!img || img.tagName !== "IMG") return;
      img.setAttribute("decoding", "async");
      img.setAttribute("loading", "eager");
      if (index === 0) img.setAttribute("fetchpriority", "high");
      img.classList.add("ajb-in");
      var src = img.currentSrc || img.getAttribute("src") || "";
      if (src) injectPreload(cloudinaryOptimize(src, 1600), index === 0);
    });

    // CSS background-image heroes → preload their URL
    document.querySelectorAll(".hero-full, .hero-slide.photo, [style*='background-image']").forEach(function (el, index) {
      var style = el.getAttribute("style") || "";
      var m = style.match(/background-image\s*:\s*url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/i);
      if (!m) return;
      injectPreload(cloudinaryOptimize(m[1], 1600), index === 0);
    });
  }

  // ---- Image loading polish ------------------------------------------

  function polishImages() {
    var viewportBottom = window.innerHeight * 1.35;
    document.querySelectorAll("img:not([data-ajb-polished])").forEach(function (img) {
      img.setAttribute("data-ajb-polished", "1");
      if (!img.getAttribute("decoding")) img.setAttribute("decoding", "async");

      var isHero = Boolean(
        img.classList.contains("hero-full-media") ||
          img.closest(".hero-banner, .bobs-hero, .bobs-banner, .hero, .story-hero-frame") ||
          img.getAttribute("fetchpriority") === "high",
      );

      if (isHero) {
        img.setAttribute("loading", "eager");
        if (!img.getAttribute("fetchpriority")) img.setAttribute("fetchpriority", "high");
        img.classList.add("ajb-in");
        return;
      }

      if (!img.getAttribute("loading")) {
        var rect;
        try {
          rect = img.getBoundingClientRect();
        } catch (e) {
          return;
        }
        if (rect.top > viewportBottom) img.setAttribute("loading", "lazy");
        else img.setAttribute("loading", "eager");
      }

      if (img.classList.contains("ajb-img") && (img.complete || img.naturalWidth > 0)) {
        img.classList.add("ajb-in");
      }
    });
  }

  function warmLikelyRoutes() {
    if (saveDataMode()) return;
    var path = window.location.pathname || "/";
    var candidates = [];
    if (path === "/" || path === "") {
      candidates = ["/outdoor-play", "/toysrus-bobs-world", "/done/find-us", "/shop-all-categories-page"];
    } else if (/outdoor-play|spider-man|cartoon|new-and-trending|books-page|brand|character/.test(path)) {
      candidates = ["/", PDP_PATH];
    }
    candidates.forEach(prefetchUrl);
  }

  // ---- Boot ----------------------------------------------------------

  function polishAll() {
    prioritizeHeroes();
    polishImages();
  }

  function boot() {
    installSpeculationRules();
    document.addEventListener("pointerover", onLinkIntent, { passive: true });
    document.addEventListener("touchstart", onLinkIntent, { passive: true });
    document.addEventListener("focusin", onLinkIntent);
    document.addEventListener("ajb:perf-repolish", polishAll);
    polishAll();
    idle(warmLikelyRoutes);
    document.addEventListener("ajb:products-loaded", function () {
      idle(polishImages);
    });
    document.addEventListener("ajb:legacy-page-ready", function () {
      polishAll();
      idle(warmLikelyRoutes);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
