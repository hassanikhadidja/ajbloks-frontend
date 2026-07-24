(function () {
  const TOKEN_KEY = "ajbloks_token";
  const DEFAULT_API_BASE = "https://api.ajbloks.com";

  function getApiBase() {
    if (typeof window !== "undefined") {
      var host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return window.location.origin;
      }
      if (window.__AJB_API_BASE__) {
        return String(window.__AJB_API_BASE__).replace(/\/$/, "");
      }
      var meta = document.querySelector('meta[name="ajb-api-base"]');
      if (meta) {
        var content = meta.getAttribute("content");
        if (content) return content.replace(/\/$/, "");
      }
    }
    return DEFAULT_API_BASE;
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  function setToken(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) {}
  }

  function clearToken() {
    setToken("");
  }

  // ---------------------------------------------------------------
  // Stale-while-revalidate cache for public GET endpoints.
  // Serves cached data instantly, revalidates in the background and
  // notifies listeners (document event "ajb:data-updated") on change.
  // ---------------------------------------------------------------
  var CACHE_PREFIX = "ajbcache:";
  var FRESH_MS = 60 * 1000; // within this window: no network at all
  var MAX_AGE_MS = 24 * 60 * 60 * 1000; // hard expiry
  var CACHEABLE = [
    /^\/product$/,
    /^\/product\/[A-Za-z0-9]+$/,
    /^\/settings\/promo-bar$/,
    /^\/order\/config$/,
    /^\/store$/,
    /^\/catalogue$/,
    /^\/play$/,
  ];
  var inflight = {};

  function isCacheable(path) {
    for (var i = 0; i < CACHEABLE.length; i++) {
      if (CACHEABLE[i].test(path)) return true;
    }
    return false;
  }

  function readCache(path) {
    try {
      var raw = sessionStorage.getItem(CACHE_PREFIX + path);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (!entry || typeof entry.t !== "number") return null;
      if (Date.now() - entry.t > MAX_AGE_MS) return null;
      return entry;
    } catch (e) {
      return null;
    }
  }

  function writeCache(path, data) {
    try {
      sessionStorage.setItem(CACHE_PREFIX + path, JSON.stringify({ t: Date.now(), data: data }));
    } catch (e) {
      // Storage full: drop all API cache entries and retry once.
      try {
        purgeCache("");
        sessionStorage.setItem(CACHE_PREFIX + path, JSON.stringify({ t: Date.now(), data: data }));
      } catch (e2) {}
    }
  }

  function purgeCache(pathPrefix) {
    try {
      var doomed = [];
      for (var i = 0; i < sessionStorage.length; i++) {
        var key = sessionStorage.key(i);
        if (key && key.indexOf(CACHE_PREFIX + pathPrefix) === 0) doomed.push(key);
      }
      doomed.forEach(function (key) {
        sessionStorage.removeItem(key);
      });
    } catch (e) {}
  }

  function invalidateFor(path) {
    // "/product/abc" and "/product" both invalidate the "/product" family.
    var root = "/" + String(path || "").split("?")[0].split("/").filter(Boolean)[0];
    if (root && root !== "/") purgeCache(root);
  }

  async function request(path, options) {
    const opts = options || {};
    const headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const res = await fetch(getApiBase() + "/api" + path, Object.assign({}, opts, { headers }));
    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = { msg: text };
    }

    if (!res.ok) {
      const err = new Error(
        (data && data.msg) ||
          (res.status === 503
            ? "Service temporairement indisponible. Réessayez dans un instant."
            : "Request failed"),
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }

    const method = (opts.method || "GET").toUpperCase();
    if (method !== "GET") invalidateFor(path);
    return data;
  }

  function fetchAndCache(path) {
    if (inflight[path]) return inflight[path];
    inflight[path] = request(path, { method: "GET" })
      .then(function (data) {
        var previous = readCache(path);
        writeCache(path, data);
        var changed = !previous || JSON.stringify(previous.data) !== JSON.stringify(data);
        if (changed) {
          document.dispatchEvent(
            new CustomEvent("ajb:data-updated", { detail: { path: path, data: data } }),
          );
        }
        return data;
      })
      .finally(function () {
        delete inflight[path];
      });
    return inflight[path];
  }

  async function get(path) {
    if (!isCacheable(path)) return request(path, { method: "GET" });

    var entry = readCache(path);
    if (entry) {
      if (Date.now() - entry.t > FRESH_MS) fetchAndCache(path).catch(function () {});
      return entry.data;
    }
    return fetchAndCache(path);
  }

  function getCachedData(path) {
    var entry = readCache(path);
    return entry ? entry.data : null;
  }

  function prefetch(path) {
    if (!isCacheable(path)) return Promise.resolve(null);
    var entry = readCache(path);
    if (entry && Date.now() - entry.t <= FRESH_MS) return Promise.resolve(entry.data);
    return fetchAndCache(path).catch(function () {
      return null;
    });
  }

  async function post(path, body) {
    return request(path, { method: "POST", body: JSON.stringify(body) });
  }

  async function postForm(path, formData) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const res = await fetch(getApiBase() + "/api" + path, {
      method: "POST",
      headers,
      body: formData,
    });
    let data = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = { msg: text };
    }

    if (!res.ok) {
      const err = new Error(
        (data && data.msg) ||
          (res.status === 503
            ? "Service temporairement indisponible. Réessayez dans un instant."
            : "Request failed"),
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function patch(path, body) {
    return request(path, { method: "PATCH", body: JSON.stringify(body) });
  }

  async function put(path, body) {
    return request(path, { method: "PUT", body: JSON.stringify(body) });
  }

  async function del(path) {
    return request(path, { method: "DELETE" });
  }

  function whenReady(maxMs) {
    if (maxMs == null) maxMs = 15000;
    if (window.AJBApi && typeof window.AJBApi.get === "function") {
      return Promise.resolve(window.AJBApi);
    }
    return new Promise(function (resolve) {
      var settled = false;
      function finish(api) {
        if (settled) return;
        settled = true;
        document.removeEventListener("ajb:api-ready", onReady);
        clearInterval(poll);
        clearTimeout(timer);
        resolve(api || null);
      }
      function onReady() {
        finish(window.AJBApi || null);
      }
      document.addEventListener("ajb:api-ready", onReady);
      var poll = setInterval(function () {
        if (window.AJBApi && typeof window.AJBApi.get === "function") finish(window.AJBApi);
      }, 25);
      var timer = setTimeout(function () {
        finish(window.AJBApi || null);
      }, maxMs);
    });
  }

  window.AJBApi = {
    getToken,
    setToken,
    clearToken,
    request,
    get,
    getCachedData,
    prefetch,
    invalidate: purgeCache,
    post,
    postForm,
    patch,
    put,
    del,
    whenReady,
  };

  document.dispatchEvent(new CustomEvent("ajb:api-ready"));
})();
