(function () {
  document.getElementById("backBtn")?.addEventListener("click", function () {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  });

  const tabSignup = document.getElementById("tabSignup");
  const tabLogin = document.getElementById("tabLogin");
  const signupPanel = document.getElementById("signupPanel");
  const loginPanel = document.getElementById("loginPanel");
  const signupPassword = document.getElementById("signupPassword");
  const signupPasswordToggle = document.getElementById("signupPasswordToggle");
  const loginPassword = document.getElementById("loginPassword");
  const loginPasswordToggle = document.getElementById("loginPasswordToggle");

  function switchTab(mode) {
    const isSignup = mode === "signup";
    tabSignup?.classList.toggle("active", isSignup);
    tabLogin?.classList.toggle("active", !isSignup);
    tabSignup?.setAttribute("aria-selected", isSignup ? "true" : "false");
    tabLogin?.setAttribute("aria-selected", !isSignup ? "true" : "false");
    signupPanel?.classList.toggle("active", isSignup);
    loginPanel?.classList.toggle("active", !isSignup);
    if (signupPanel) signupPanel.hidden = !isSignup;
    if (loginPanel) loginPanel.hidden = isSignup;
  }

  tabSignup?.addEventListener("click", () => switchTab("signup"));
  tabLogin?.addEventListener("click", () => switchTab("login"));

  if (new URLSearchParams(window.location.search).get("tab") === "login") {
    switchTab("login");
  }

  function setupPasswordToggle(button, input) {
    if (!button || !input) return;
    button.addEventListener("click", () => {
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      button.classList.toggle("is-visible", isHidden);
      button.setAttribute(
        "aria-label",
        isHidden ? "Masquer le mot de passe" : "Afficher le mot de passe",
      );
    });
  }

  setupPasswordToggle(signupPasswordToggle, signupPassword);
  setupPasswordToggle(loginPasswordToggle, loginPassword);

  document.getElementById("termsLink")?.addEventListener("click", (e) => e.preventDefault());
  document.getElementById("privacyLink")?.addEventListener("click", (e) => e.preventDefault());
})();
