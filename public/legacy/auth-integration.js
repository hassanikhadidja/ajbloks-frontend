(function () {
  if (!window.AJBApi) return;

  if (AJBApi.getToken()) {
    window.location.href = "/toysrus-account";
    return;
  }

  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const signupError = document.getElementById("signupError");
  const loginError = document.getElementById("loginError");

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.getElementById("signupName")?.value.trim();
      const email = document.getElementById("signupEmail")?.value.trim();
      const password = document.getElementById("signupPassword")?.value;
      if (!name || !email || !password) return;

      try {
        if (signupError) signupError.textContent = "";
        await AJBApi.post("/user/register", { name, email, password });
        window.location.href = "/signin?tab=login";
      } catch (err) {
        if (signupError) signupError.textContent = err.message || "Erreur d'inscription";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;
      if (!email || !password) return;

      try {
        if (loginError) loginError.textContent = "";
        const data = await AJBApi.post("/user/login", { email, password });
        AJBApi.setToken(data.token);
        if (window.AJBAuth) await window.AJBAuth.refreshSession();
        window.location.href = "/toysrus-account";
      } catch (err) {
        if (loginError) {
          loginError.textContent =
            err.message && err.message.indexOf("secretOrPrivateKey") !== -1
              ? "Le serveur n'est pas configuré (secretKey manquant sur Vercel)."
              : err.message || "Identifiants incorrects";
        }
      }
    });
  }
})();
