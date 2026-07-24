(function () {
  if (window.__ajbAuthSessionInit) return;
  window.__ajbAuthSessionInit = true;

  var USER_KEY = "ajbloks_user";

  function getApi() {
    return window.AJBApi || null;
  }

  function readUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeUser(user) {
    try {
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(USER_KEY);
    } catch (e) {}
  }

  function isLoggedIn() {
    var api = getApi();
    return !!(api && api.getToken());
  }

  function isAdmin() {
    var user = readUser();
    return !!(user && user.role === "admin");
  }

  function getSigninPath(tab) {
    return tab === "login" ? "/signin?tab=login" : "/signin";
  }

  function getAccountPath() {
    return "/toysrus-account";
  }

  function notifyChange() {
    document.dispatchEvent(new CustomEvent("ajb-auth-change"));
  }

  function clearSession() {
    var api = getApi();
    if (api) api.clearToken();
    writeUser(null);
    notifyChange();
  }

  function setSession(user) {
    if (!user) {
      writeUser(null);
      notifyChange();
      return;
    }
    writeUser({
      id: String(user._id || user.id || ""),
      name: user.name || "",
      email: user.email || "",
      role: user.role || "client",
    });
    notifyChange();
  }

  async function refreshSession() {
    var api = getApi();
    if (!api || !api.getToken()) {
      writeUser(null);
      notifyChange();
      return null;
    }
    try {
      var user = await api.get("/user/getcurrentuser");
      setSession(user);
      return user;
    } catch (e) {
      clearSession();
      return null;
    }
  }

  function setPromoAccountLink(link, loggedIn) {
    var svg = link.querySelector("svg");
    link.textContent = "";
    if (svg) link.appendChild(svg);
    link.appendChild(document.createTextNode(loggedIn ? "Mon compte" : "Connexion"));
    link.setAttribute("href", loggedIn ? getAccountPath() : getSigninPath("login"));
  }

  function applyAuthUi(root) {
    root = root || document;
    var loggedIn = isLoggedIn();
    var admin = isAdmin();

    root.querySelectorAll('button[aria-label="Compte"]').forEach(function (btn) {
      if (btn.dataset.authBound === "1") return;
      btn.dataset.authBound = "1";
      btn.addEventListener("click", function () {
        window.location.href = isLoggedIn() ? getAccountPath() : getSigninPath("login");
      });
    });

    root.querySelectorAll('a[href*="toysrus-account"], a[data-auth-account]').forEach(function (link) {
      link.setAttribute("href", loggedIn ? getAccountPath() : getSigninPath("login"));
    });

    root.querySelectorAll('a[data-auth-menu="compte"], .menu-secondary a').forEach(function (link) {
      var text = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (link.getAttribute("data-auth-menu") === "compte" || text === "Compte") {
        var li = link.closest("li");
        if (li) li.hidden = !loggedIn;
        link.setAttribute("href", loggedIn ? getAccountPath() : getSigninPath("login"));
      }
    });

    root.querySelectorAll('.promo-bar-link[data-auth-promo-account], .promo-bar-utils a.promo-bar-link').forEach(function (link) {
      var text = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (
        link.getAttribute("data-auth-promo-account") === "1" ||
        text.indexOf("Connexion") !== -1 ||
        text === "Mon compte"
      ) {
        link.setAttribute("data-auth-promo-account", "1");
        setPromoAccountLink(link, loggedIn);
      }
    });

    root.querySelectorAll('a').forEach(function (link) {
      var text = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (text === "Mon compte") {
        link.setAttribute("href", loggedIn ? getAccountPath() : getSigninPath("login"));
      }
      if (text === "Suivre ma commande" && (!link.getAttribute("href") || link.getAttribute("href") === "#")) {
        link.setAttribute("href", getSigninPath("login"));
      }
      if (text === "Se connecter" && (!link.getAttribute("href") || link.getAttribute("href") === "#")) {
        link.setAttribute("href", getSigninPath("login"));
      }
    });

    var fab = document.querySelector(".dashboard-fab");
    if (fab) fab.hidden = !admin;
  }

  function observeDom() {
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) applyAuthUi(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  async function boot() {
    if (isLoggedIn()) await refreshSession();
    else writeUser(null);
    applyAuthUi();
    document.addEventListener("ajb-auth-change", function () {
      applyAuthUi();
    });
    if (document.body) observeDom();
    else document.addEventListener("DOMContentLoaded", observeDom);
  }

  window.AJBAuth = {
    isLoggedIn: isLoggedIn,
    isAdmin: isAdmin,
    getSigninPath: getSigninPath,
    getAccountPath: getAccountPath,
    clearSession: clearSession,
    setSession: setSession,
    refreshSession: refreshSession,
    applyAuthUi: applyAuthUi,
    readUser: readUser,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
