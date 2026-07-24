(function () {
  var PASSWORD_HINT =
    "Le mot de passe doit contenir au moins 6 caractères, dont une majuscule (A–Z).";

  function isValidSignupPassword(password) {
    return typeof password === "string" && password.length >= 6 && /[A-Z]/.test(password);
  }

  function bindSignupForm() {
    var signupForm = document.getElementById("signupForm");
    if (!signupForm || signupForm.dataset.authBound === "1") return;
    if (!window.AJBApi) return;

    signupForm.dataset.authBound = "1";
    var signupError = document.getElementById("signupError");

    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var name = (document.getElementById("signupName") || {}).value;
      var email = (document.getElementById("signupEmail") || {}).value;
      var password = (document.getElementById("signupPassword") || {}).value;
      var newsCheck = document.getElementById("newsCheck");
      name = String(name || "").trim();
      email = String(email || "").trim();
      password = String(password || "");
      var marketingEmail = !newsCheck || newsCheck.checked;

      if (!name || !email || !password) {
        if (signupError) signupError.textContent = "Veuillez remplir tous les champs.";
        return;
      }
      if (!isValidSignupPassword(password)) {
        if (signupError) signupError.textContent = PASSWORD_HINT;
        var pw = document.getElementById("signupPassword");
        if (pw) pw.focus();
        return;
      }

      try {
        if (signupError) signupError.textContent = "";
        await window.AJBApi.post("/user/register", {
          name: name,
          email: email,
          password: password,
          marketingEmail: marketingEmail,
        });
        window.location.assign("/signin?tab=login");
      } catch (err) {
        if (signupError) {
          signupError.textContent = (err && err.message) || "Erreur d'inscription";
        }
      }
    });
  }

  function bindLoginForm() {
    var loginForm = document.getElementById("loginForm");
    if (!loginForm || loginForm.dataset.authBound === "1") return;
    if (!window.AJBApi) return;

    loginForm.dataset.authBound = "1";
    var loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = String((document.getElementById("loginEmail") || {}).value || "").trim();
      var password = String((document.getElementById("loginPassword") || {}).value || "");
      if (!email || !password) return;

      try {
        if (loginError) loginError.textContent = "";
        var data = await window.AJBApi.post("/user/login", { email: email, password: password });
        window.AJBApi.setToken(data.token);
        if (window.AJBAuth) await window.AJBAuth.refreshSession();
        window.location.assign("/toysrus-account");
      } catch (err) {
        if (loginError) {
          loginError.textContent =
            err && err.message && String(err.message).indexOf("secretOrPrivateKey") !== -1
              ? "Le serveur n'est pas configuré (secretKey manquant sur Vercel)."
              : (err && err.message) || "Identifiants incorrects";
        }
      }
    });
  }

  function boot() {
    if (!window.AJBApi) return;
    // Already logged in: leave the auth page.
    if (window.AJBApi.getToken && window.AJBApi.getToken()) {
      if (document.getElementById("signupForm") || document.getElementById("loginForm")) {
        window.location.replace("/toysrus-account");
      }
      return;
    }
    bindSignupForm();
    bindLoginForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("ajb:api-ready", boot);
  document.addEventListener("ajb:legacy-page-ready", boot);
})();
