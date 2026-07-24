(function () {
  var STORAGE_KEY = "ajbloks-promo-bar";
  var DEFAULT = "Livraison gratuite pour les commandes de plus de 6500 DZD";

  function getCached() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  function setCached(text) {
    try {
      localStorage.setItem(STORAGE_KEY, text);
    } catch (e) {}
  }

  function normalize(text) {
    var value = (text || "").trim();
    return value || DEFAULT;
  }

  function apply(sentence) {
    var text = normalize(sentence);
    document.querySelectorAll(".promo-bar-msg").forEach(function (el) {
      el.textContent = text;
    });
    document.querySelectorAll(".promo-bar").forEach(function (bar) {
      if (bar.querySelector(".promo-bar-inner")) return;
      bar.textContent = text;
    });
    return text;
  }

  function apiBase() {
    if (typeof window !== "undefined") {
      var host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return window.location.origin;
      }
      if (window.__AJB_API_BASE__) {
        return String(window.__AJB_API_BASE__).replace(/\/$/, "");
      }
    }
    return "https://api.ajbloks.com";
  }

  async function fetchSentence() {
    if (window.AJBApi && typeof AJBApi.get === "function") {
      try {
        var data = await AJBApi.get("/settings/promo-bar");
        if (data && data.sentence) return data.sentence;
      } catch (e) {}
    }

    try {
      var res = await fetch(apiBase() + "/api/settings/promo-bar");
      if (!res.ok) return null;
      var json = await res.json();
      return json && json.sentence ? json.sentence : null;
    } catch (e) {
      return null;
    }
  }

  async function hydrate() {
    apply(getCached());
    var remote = await fetchSentence();
    if (remote) {
      setCached(remote);
      apply(remote);
    }
  }

  window.PromoBar = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT: DEFAULT,
    getCached: getCached,
    setCached: setCached,
    apply: apply,
    hydrate: hydrate,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
})();
