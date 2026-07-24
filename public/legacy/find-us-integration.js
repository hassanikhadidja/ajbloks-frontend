(function () {
  var ALGER_CENTER = [36.7538, 3.0588];
  var ALGER_ZOOM = 11;

  var PIN_SVG =
    '<svg width="32" height="42" viewBox="0 0 32 42" aria-hidden="true"><path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26S32 28 32 16C32 7.2 24.8 0 16 0z" fill="#d0021b"></path><text x="16" y="21" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">★</text></svg>';
  var ADDR_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  var LINK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#1a3fa8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path></svg>';

  var list = null;
  var map = null;
  var markersLayer = null;
  var starIcon = null;
  var allStores = [];
  var visibleStores = [];

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function escAttr(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isUsine(store) {
    var name = String(store && store.name ? store.name : "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    return name === "usine aj bloks" || name.indexOf("usine aj bloks") === 0;
  }

  function sortStores(stores) {
    var usine = [];
    var rest = [];
    stores.forEach(function (s) {
      if (isUsine(s)) usine.push(s);
      else rest.push(s);
    });
    return usine.concat(rest);
  }

  function looksLikeMapUrl(url) {
    return /(?:google\.[^/]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|openstreetmap\.org|osm\.org)/i.test(
      String(url || ""),
    );
  }

  function isPlausibleCoord(lat, lng) {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= 18.5 &&
      lat <= 37.5 &&
      lng >= -9 &&
      lng <= 12.5
    );
  }

  function parseMapLinkCoords(url) {
    var s = String(url || "").trim();
    if (!s) return null;
    var patterns = [
      /@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:,\d+[.\d]*[a-z])?/i,
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
      /[?&](?:q|query)=(-?\d+\.?\d*)[,+\s]+(-?\d+\.?\d*)/i,
      /\/maps\/(?:place|search)\/(-?\d+\.?\d*),\+?(-?\d+\.?\d*)/i,
      /#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/,
      /[?&]mlat=(-?\d+\.?\d*).*?[?&]mlon=(-?\d+\.?\d*)/i,
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = s.match(patterns[i]);
      if (!m) continue;
      var lat = Number(m[1]);
      var lng = Number(m[2]);
      if (isPlausibleCoord(lat, lng)) return { lat: lat, lng: lng };
    }
    return null;
  }

  function ensureHttp(url) {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : "https://" + url;
  }

  function mapLinkFor(store) {
    var link = String(store.mapLink || "").trim();
    if (link) return ensureHttp(link);
    var website = String(store.website || "").trim();
    if (website && looksLikeMapUrl(website)) return ensureHttp(website);
    return "";
  }

  function coordsFor(store) {
    if (isPlausibleCoord(Number(store.lat), Number(store.lng))) {
      return { lat: Number(store.lat), lng: Number(store.lng) };
    }
    return parseMapLinkCoords(mapLinkFor(store));
  }

  async function resolveShortMapLink(url) {
    var s = String(url || "").trim();
    if (!s || !/(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(s)) {
      var direct = parseMapLinkCoords(s);
      return direct ? { lat: direct.lat, lng: direct.lng, url: s } : null;
    }
    try {
      var res = await fetch(
        "/api/store/expand-map-link?url=" + encodeURIComponent(s),
        { method: "GET" },
      );
      if (!res.ok) return null;
      var data = await res.json();
      if (data && isPlausibleCoord(Number(data.lat), Number(data.lng))) {
        return { lat: Number(data.lat), lng: Number(data.lng), url: String(data.url || s) };
      }
      if (data && data.url) {
        var parsed = parseMapLinkCoords(String(data.url));
        if (parsed) return { lat: parsed.lat, lng: parsed.lng, url: String(data.url) };
      }
    } catch (e) {}
    return null;
  }

  async function enrichMissingCoords(stores) {
    var out = [];
    for (var i = 0; i < stores.length; i++) {
      var store = Object.assign({}, stores[i]);
      if (isPlausibleCoord(Number(store.lat), Number(store.lng))) {
        out.push(store);
        continue;
      }
      var link = mapLinkFor(store);
      if (link) {
        var resolved = await resolveShortMapLink(link);
        if (resolved) {
          store.lat = resolved.lat;
          store.lng = resolved.lng;
        }
      }
      out.push(store);
    }
    return out;
  }

  var STORE_TYPES = ["superette", "bureau-tabac", "magasin-jouets", "librairie", "usine"];

  var TYPE_KEYWORDS = {
    superette: ["superette"],
    "bureau-tabac": ["bureau de tabac", "tabac"],
    "magasin-jouets": ["magasin de jouets", "jouets"],
    librairie: ["librairie"],
    usine: ["usine"],
  };

  function normalizeText(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function nameMatchesType(store, type) {
    var name = normalizeText(store && store.name);
    var kws = TYPE_KEYWORDS[type];
    if (!name || !kws) return false;
    for (var i = 0; i < kws.length; i++) {
      if (name.indexOf(normalizeText(kws[i])) !== -1) return true;
    }
    return false;
  }

  function typeFromName(store) {
    // Longer / more specific phrases first
    var order = ["bureau-tabac", "magasin-jouets", "superette", "librairie", "usine"];
    for (var i = 0; i < order.length; i++) {
      if (nameMatchesType(store, order[i])) return order[i];
    }
    return "";
  }

  function storeTypeOf(store) {
    var t = String(store.storeType || store.type || "").trim().toLowerCase();
    if (STORE_TYPES.indexOf(t) !== -1) return t;
    // legacy values
    if (t === "outlet") return "usine";
    if (t === "mall" || t === "military") return "magasin-jouets";
    var fromName = typeFromName(store);
    if (fromName) return fromName;
    if (isUsine(store)) return "usine";
    return "";
  }

  function matchesSelectedType(store, type) {
    if (!type) return true;
    if (storeTypeOf(store) === type) return true;
    return nameMatchesType(store, type);
  }

  function cardHtml(store) {
    var name = String(store.name || "").trim() || "Magasin";
    var location = String(store.location || "").trim();
    var website = String(store.website || "").trim();
    var mapHref = mapLinkFor(store);
    var storeType = storeTypeOf(store);

    var html =
      '<div class="store-card" data-type="' +
      escAttr(storeType) +
      '" data-name="' +
      escAttr(name) +
      '" data-location="' +
      escAttr(location) +
      '">' +
      "<h2>" +
      esc(name) +
      "</h2>" +
      '<div class="meta-row">' +
      ADDR_SVG +
      "<span>" +
      esc(location || "Adresse à venir") +
      "</span>" +
      "</div>";

    if (website && !looksLikeMapUrl(website)) {
      html +=
        '<div class="meta-row">' +
        LINK_SVG +
        '<a href="' +
        escAttr(ensureHttp(website)) +
        '" class="website-link" target="_blank" rel="noopener noreferrer">Site web</a>' +
        "</div>";
    }

    if (mapHref) {
      html +=
        '<a class="btn-map" href="' +
        escAttr(mapHref) +
        '" target="_blank" rel="noopener noreferrer">Voir sur la carte</a>';
    } else {
      html +=
        '<button class="btn-map" type="button" disabled>Voir sur la carte</button>';
    }

    html += "</div>";
    return html;
  }

  function renderList(stores) {
    if (!list) return;
    if (!stores.length) {
      list.innerHTML =
        '<p class="stores-empty" style="padding:20px 16px;color:#64748B;font-size:14px;text-align:center;">Aucun magasin disponible pour le moment.</p>';
      return;
    }
    list.innerHTML = stores.map(cardHtml).join("");
  }

  function waitForLeaflet(maxMs) {
    maxMs = maxMs || 8000;
    if (window.L) return Promise.resolve(window.L);
    return new Promise(function (resolve) {
      var start = Date.now();
      var timer = setInterval(function () {
        if (window.L) {
          clearInterval(timer);
          resolve(window.L);
        } else if (Date.now() - start > maxMs) {
          clearInterval(timer);
          resolve(null);
        }
      }, 30);
    });
  }

  function initMap() {
    var el = document.getElementById("findUsMap");
    if (!el || !window.L) return false;

    if (map) {
      map.invalidateSize();
      return true;
    }

    starIcon = L.divIcon({
      className: "ajb-store-pin",
      html: PIN_SVG,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -34],
    });

    map = L.map(el, {
      center: ALGER_CENTER,
      zoom: ALGER_ZOOM,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      tap: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      updateWhenIdle: false,
      updateWhenZooming: true,
      keepBuffer: 2,
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    // Custom buttons if present
    var zin = document.getElementById("mapZoomIn");
    var zout = document.getElementById("mapZoomOut");
    if (zin) {
      zin.addEventListener("click", function (e) {
        e.preventDefault();
        map.zoomIn();
      });
    }
    if (zout) {
      zout.addEventListener("click", function (e) {
        e.preventDefault();
        map.zoomOut();
      });
    }

    setTimeout(function () {
      if (map) map.invalidateSize();
    }, 100);

    return true;
  }

  function renderMarkers(stores) {
    if (!map || !markersLayer || !starIcon) return;

    markersLayer.clearLayers();
    var bounds = [];

    stores.forEach(function (store) {
      var coords = coordsFor(store);
      if (!coords) return;
      var name = String(store.name || "Magasin");
      var marker = L.marker([coords.lat, coords.lng], {
        icon: starIcon,
        title: name,
        keyboard: true,
      });
      marker.bindPopup("<strong>" + esc(name) + "</strong>");
      marker.addTo(markersLayer);
      bounds.push([coords.lat, coords.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], Math.max(map.getZoom(), 13), { animate: false });
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14, animate: false });
    } else {
      map.setView(ALGER_CENTER, ALGER_ZOOM, { animate: false });
    }

    setTimeout(function () {
      if (map) map.invalidateSize();
    }, 50);
  }

  function applyFilters() {
    var zipEl = document.getElementById("zipInput");
    var typeEl = document.getElementById("storeType");
    var q = zipEl ? String(zipEl.value || "").trim().toLowerCase() : "";
    var type = typeEl ? String(typeEl.value || "").trim().toLowerCase() : "";
    var filtered = allStores.filter(function (s) {
      if (!matchesSelectedType(s, type)) return false;
      if (!q) return true;
      var name = String(s.name || "").toLowerCase();
      var location = String(s.location || "").toLowerCase();
      return name.indexOf(q) !== -1 || location.indexOf(q) !== -1;
    });
    visibleStores = filtered;
    renderList(filtered);
    renderMarkers(filtered.length ? filtered : allStores);
  }

  function openMapForStore(el) {
    if (!el) return;
    var link =
      (el.getAttribute("href") || el.getAttribute("data-map-link") || "").trim();
    if (!link || el.hasAttribute("disabled")) return;
    window.open(ensureHttp(link), "_blank", "noopener,noreferrer");
  }

  function wireListClicks() {
    if (!list || list.dataset.wired === "1") return;
    list.dataset.wired = "1";
    list.addEventListener("click", function (e) {
      var mapBtn = e.target.closest("a.btn-map, button.btn-map");
      if (!mapBtn || mapBtn.tagName === "A") return;
      e.preventDefault();
      openMapForStore(mapBtn);
    });
  }

  window.searchStores = applyFilters;

  window.viewOnMap = function (btn) {
    openMapForStore(btn);
  };

  async function load() {
    list = document.getElementById("storeList");
    if (!list) return;

    wireListClicks();

    var typeSelect = document.getElementById("storeType");
    if (typeSelect) {
      typeSelect.style.display = "";
      typeSelect.onchange = applyFilters;
    }

    var zipEl = document.getElementById("zipInput");
    if (zipEl) {
      zipEl.placeholder = "Rechercher un magasin ou une ville";
      zipEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          applyFilters();
        }
      });
    }

    list.innerHTML =
      '<p class="stores-empty" style="padding:20px 16px;color:#64748B;font-size:14px;text-align:center;">Chargement des magasins…</p>';

    var Lref = await waitForLeaflet();
    if (!Lref) {
      console.warn("Leaflet failed to load");
    } else {
      initMap();
    }

    try {
      var api = window.AJBApi;
      if (api && typeof api.whenReady === "function") {
        api = await api.whenReady();
      } else {
        for (var i = 0; i < 40 && !(window.AJBApi && window.AJBApi.get); i++) {
          await new Promise(function (r) {
            setTimeout(r, 50);
          });
        }
        api = window.AJBApi;
      }
      if (!api || typeof api.get !== "function") throw new Error("API unavailable");

      var stores = [];
      // Prefer same-origin Next resolve so Google short links (maps.app.goo.gl) can be expanded
      try {
        var localRes = await fetch("/api/store/resolve-coords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        if (localRes.ok) {
          var localData = await localRes.json();
          if (Array.isArray(localData)) stores = localData;
        }
      } catch (localErr) {
        console.warn("Local coord resolve failed", localErr);
      }

      if (!stores.length) {
        try {
          stores = await api.post("/store/resolve-coords", {});
        } catch (resolveErr) {
          console.warn("Store coord resolve failed, falling back to list", resolveErr);
          var data = await api.get("/store");
          stores = Array.isArray(data) ? data : data && Array.isArray(data.stores) ? data.stores : [];
        }
      }

      if (!Array.isArray(stores)) stores = [];

      // Client fallback: expand remaining short links when server left lat/lng empty
      stores = await enrichMissingCoords(stores);

      allStores = sortStores(stores);
      applyFilters();
    } catch (err) {
      console.warn("Find-us stores load failed", err);
      list.innerHTML =
        '<p class="stores-empty" style="padding:20px 16px;color:#64748B;font-size:14px;text-align:center;">Impossible de charger les magasins.</p>';
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
