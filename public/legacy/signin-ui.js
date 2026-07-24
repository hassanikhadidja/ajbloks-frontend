(function () {
  function setupPasswordToggle(button, input) {
    if (!button || !input || button.dataset.toggleBound === "1") return;
    button.dataset.toggleBound = "1";
    button.addEventListener("click", function () {
      var isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.classList.toggle("is-visible", isHidden);
      button.setAttribute(
        "aria-label",
        isHidden ? "Masquer le mot de passe" : "Afficher le mot de passe",
      );
    });
  }

  function wireLegalLink(id, href) {
    document.querySelectorAll("#" + id + ', a[href="' + href + '"]').forEach(function (link) {
      link.setAttribute("href", href);
      if (link.dataset.legalWired === "1") return;
      link.dataset.legalWired = "1";
      link.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.assign(href);
      });
    });
  }

  function switchTab(mode) {
    var isSignup = mode === "signup";
    var tabSignup = document.getElementById("tabSignup");
    var tabLogin = document.getElementById("tabLogin");
    var signupPanel = document.getElementById("signupPanel");
    var loginPanel = document.getElementById("loginPanel");
    if (tabSignup) {
      tabSignup.classList.toggle("active", isSignup);
      tabSignup.setAttribute("aria-selected", isSignup ? "true" : "false");
    }
    if (tabLogin) {
      tabLogin.classList.toggle("active", !isSignup);
      tabLogin.setAttribute("aria-selected", !isSignup ? "true" : "false");
    }
    if (signupPanel) {
      signupPanel.classList.toggle("active", isSignup);
      signupPanel.hidden = !isSignup;
    }
    if (loginPanel) {
      loginPanel.classList.toggle("active", !isSignup);
      loginPanel.hidden = isSignup;
    }
  }

  function boot() {
    var backBtn = document.getElementById("backBtn");
    if (backBtn && backBtn.dataset.bound !== "1") {
      backBtn.dataset.bound = "1";
      backBtn.addEventListener("click", function () {
        if (document.referrer) {
          try {
            if (new URL(document.referrer).origin === window.location.origin) {
              window.history.back();
              return;
            }
          } catch (e) {}
        }
        window.location.href = "/";
      });
    }

    var tabSignup = document.getElementById("tabSignup");
    var tabLogin = document.getElementById("tabLogin");
    if (tabSignup && tabSignup.dataset.bound !== "1") {
      tabSignup.dataset.bound = "1";
      tabSignup.addEventListener("click", function () {
        switchTab("signup");
      });
    }
    if (tabLogin && tabLogin.dataset.bound !== "1") {
      tabLogin.dataset.bound = "1";
      tabLogin.addEventListener("click", function () {
        switchTab("login");
      });
    }

    if (document.getElementById("signupPanel") || document.getElementById("loginPanel")) {
      if (new URLSearchParams(window.location.search).get("tab") === "login") {
        switchTab("login");
      }
    }

    setupPasswordToggle(
      document.getElementById("signupPasswordToggle"),
      document.getElementById("signupPassword"),
    );
    setupPasswordToggle(
      document.getElementById("loginPasswordToggle"),
      document.getElementById("loginPassword"),
    );

    wireLegalLink("termsLink", "/toysrus-conditions");
    wireLegalLink("termsLinkFooter", "/toysrus-conditions");
    wireLegalLink("privacyLink", "/toysrus-privacy");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("ajb:legacy-page-ready", boot);
})();
