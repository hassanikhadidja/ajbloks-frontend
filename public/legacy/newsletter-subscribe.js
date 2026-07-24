(function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function waitForApi(maxMs) {
    if (maxMs == null) maxMs = 10000;
    if (window.AJBApi && typeof window.AJBApi.post === "function") {
      return Promise.resolve(window.AJBApi);
    }
    if (window.AJBApi && typeof window.AJBApi.whenReady === "function") {
      return window.AJBApi.whenReady(maxMs);
    }
    return new Promise(function (resolve) {
      var done = false;
      function finish(api) {
        if (done) return;
        done = true;
        document.removeEventListener("ajb:api-ready", onReady);
        clearInterval(poll);
        clearTimeout(timer);
        resolve(api || null);
      }
      function onReady() {
        finish(window.AJBApi);
      }
      document.addEventListener("ajb:api-ready", onReady);
      var poll = setInterval(function () {
        if (window.AJBApi && typeof window.AJBApi.post === "function") {
          finish(window.AJBApi);
        }
      }, 50);
      var timer = setTimeout(function () {
        finish(window.AJBApi || null);
      }, maxMs);
    });
  }

  function detectContentSource() {
    var path = String(
      (window.location && window.location.pathname) || "",
    ).toLowerCase();
    if (
      path.indexOf("gift") !== -1 ||
      path.indexOf("cadeau") !== -1
    ) {
      return "gifts";
    }
    if (
      path.indexOf("printable") !== -1 ||
      path.indexOf("imprimerable") !== -1 ||
      path.indexOf("bobs-painting") !== -1 ||
      path.indexOf("bobs-world") !== -1
    ) {
      return "printables";
    }
    if (path.indexOf("diy") !== -1) return "diy";
    return "diy";
  }

  async function subscribe(opts) {
    var email = String((opts && opts.email) || "")
      .trim()
      .toLowerCase();
    var name = String((opts && opts.name) || "").trim();
    var source = String((opts && opts.source) || "footer");
    if (!EMAIL_RE.test(email)) {
      var err = new Error("Adresse e-mail invalide");
      err.code = "invalid";
      throw err;
    }
    var api = await waitForApi();
    if (!api || typeof api.post !== "function") {
      var err2 = new Error("Service indisponible");
      err2.code = "unavailable";
      throw err2;
    }
    return api.post("/newsletter", {
      email: email,
      name: name,
      source: source,
    });
  }

  function wireForm(options) {
    var form = typeof options.form === "string"
      ? document.getElementById(options.form)
      : options.form;
    if (!form || form.dataset.newsletterWired === "1") return;
    form.dataset.newsletterWired = "1";
    // Prevent older stub handlers from treating the form as already wired.
    form.dataset.wired = "1";

    var emailEl =
      (options.emailInput && document.getElementById(options.emailInput)) ||
      form.querySelector('input[type="email"]');
    var nameEl = options.nameInput
      ? document.getElementById(options.nameInput)
      : null;
    var statusEl = options.statusEl
      ? document.getElementById(options.statusEl)
      : null;
    var source = options.source || "footer";
    var successText =
      options.successText ||
      "Merci pour votre inscription ! Consultez votre boîte de réception pour confirmer.";
    var invalidText =
      options.invalidText || "Veuillez entrer une adresse e-mail valide.";
    var errorText =
      options.errorText || "Impossible d'enregistrer l'e-mail. Réessayez.";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var email = emailEl ? emailEl.value.trim() : "";
      var name = nameEl ? nameEl.value.trim() : "";
      if (statusEl) statusEl.textContent = "";

      subscribe({ email: email, name: name, source: source })
        .then(function () {
          if (statusEl) statusEl.textContent = successText;
          form.reset();
          if (typeof options.onSuccess === "function") options.onSuccess();
        })
        .catch(function (err) {
          if (statusEl) {
            statusEl.textContent =
              err && err.code === "invalid" ? invalidText : errorText;
          }
        });
    }, true);
  }

  function autoWire() {
    var contentSource = detectContentSource();
    wireForm({
      form: "footer-signup-form",
      emailInput: "footer-email-input",
      statusEl: "footer-signup-confirm",
      source: "footer",
    });
    wireForm({
      form: "story-signup-form",
      emailInput: "story-email-input",
      statusEl: "story-signup-confirm",
      source: "notre_histoire",
    });
    wireForm({
      form: "listing-signup-form",
      emailInput: "listing-email-input",
      statusEl: "listing-signup-confirm",
      source: contentSource,
    });
    wireForm({
      form: "article-signup-form",
      emailInput: "article-email-input",
      statusEl: "article-signup-confirm",
      source: contentSource,
    });
    wireForm({
      form: "signupForm",
      emailInput: "email",
      nameInput: "name",
      source: "cookies",
      successText: "Merci ! Votre inscription a bien été enregistrée.",
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoWire);
  } else {
    autoWire();
  }

  document.addEventListener("ajb:legacy-page-ready", autoWire);
  document.addEventListener("ajb:api-ready", autoWire);

  window.AJBNewsletter = {
    subscribe: subscribe,
    wireForm: wireForm,
    autoWire: autoWire,
    detectContentSource: detectContentSource,
  };
})();
