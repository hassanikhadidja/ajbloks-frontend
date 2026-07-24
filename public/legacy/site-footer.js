(function () {
  var LINKEDIN_HTML =
    '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z"/></svg></a>';

  function assetPrefix() {
    return "";
  }

  function socialRowHtml() {
    return (
      '<div class="social-row">' +
        '<a href="#" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.3 2 4 4.4 4.2v3.1c-1.5.1-2.9-.4-4.4-1.3v6.6a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.2a2.6 2.6 0 1 0 1.8 2.5V3z"/></svg></a>' +
        '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>' +
        '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7.4c0-1 .3-1.7 1.7-1.7H17V2.6C16.6 2.5 15.5 2.4 14.2 2.4c-2.7 0-4.6 1.6-4.6 4.7v2.4H6.9V13h2.7v9z"/></svg></a>' +
        '<a href="#" aria-label="Pinterest"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.17.6 2.123 1.775 2.123 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>' +
        LINKEDIN_HTML +
        '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.8zM9.6 15.5V8.5L15.8 12z"/></svg></a>' +
      "</div>"
    );
  }

  function buildFooterHtml() {
    var p = assetPrefix();
    return (
      '<footer class="site-footer">' +
        '<img class="mascot" src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782044381/Design_sans_titre_6_copetd.png" alt="Bob, la mascotte ajBloks">' +
        '<div class="footer-inner">' +
          '<div class="footer-top"><div class="footer-grid">' +
            '<div class="footer-links-col footer-links-col--about-care">' +
              '<section aria-label="À propos"><h2 class="section-title">À propos</h2><ul class="link-list"><li><a href="' + p + '/toysrus-notre-histoire">Notre histoire</a></li><li><a href="' + p + '/toysrus-conditions">Conditions d\'utilisation</a></li><li><a href="' + p + '/toysrus-privacy">Politique de confidentialité</a></li><li><a href="' + p + '/signup-email-form">Préférences de cookies</a></li></ul></section>' +
              '<section aria-label="Service client"><h2 class="section-title">Service client</h2><ul class="link-list"><li><a href="' + p + '/toysrus-gift-guides">Guides cadeaux</a></li><li><a href="' + p + '/toysrus-faq-2">Centre d\'aide</a></li><li><a href="' + p + '/toysrus-livraison">Livraison</a></li><li><a href="' + p + '/toysrus-retours-gift">Retours et échanges</a></li><li><a href="' + p + '/toysrus-contact">Nous contacter</a></li></ul></section>' +
            '</div>' +
            '<section aria-label="Compte"><h2 class="section-title">Compte</h2><ul class="link-list"><li><a href="' + p + '/toysrus-account">Mon compte</a></li><li><a href="' + p + '/toysrus-account#kids-club">Suivre ma commande</a></li><li><a href="' + p + '/done/wishlist"><svg class="heart-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Ma liste de souhaits</a></li></ul></section>' +
            '<section aria-label="Activités"><h2 class="section-title">Activités</h2><ul class="link-list"><li><a href="' + p + '/toysrus-bobs-world">Le monde de Bob</a></li><li><a href="' + p + '/toysrus-diy-activities">Activités DIY</a></li><li><a href="' + p + '/toysrus-printables">Coloriage et activités</a></li></ul></section>' +
            '<section class="newsletter" aria-label="Inscription à l\'infolettre"><h2 class="section-title">Inscrivez-vous pour vous amuser&nbsp;!</h2><p class="newsletter-intro">Recevez des nouvelles exclusives sur les jouets, des idées de jeu et des avis !</p><form id="footer-signup-form"><div class="signup-row"><input type="email" id="footer-email-input" placeholder="Entrez votre e-mail" required aria-label="Adresse e-mail"><button type="submit">S\'inscrire</button></div><p class="signup-disclaimer">En vous inscrivant à notre infolettre, vous acceptez nos <a href="' + p + '/toysrus-conditions">conditions d\'utilisation</a> et notre <a href="' + p + '/toysrus-privacy">politique de confidentialité</a>.</p><p class="signup-confirm" id="footer-signup-confirm" role="status"></p></form></section>' +
          '</div></div>' +
          '<div class="footer-bottom">' +
            '<div class="footer-mid">' +
              '<div class="wordmark footer-mid-logo"><img class="bret-logo" src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782051890/Design_sans_titre_7_mwozaj.png" alt="ajBloks"></div>' +
              '<div class="footer-social-line"><p class="hetle">@ajbloks</p>' +
              socialRowHtml() +
            '</div></div>' +
            '<hr class="divider">' +
            '<div class="footer-legal-bar">' +
              '<p class="copyright">© 2026 ajBloks. Tous droits réservés.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>'
    );
  }

  /** Force social order: … Pinterest, LinkedIn, YouTube … */
  function normalizeSocialRow(row) {
    var byLabel = {};
    Array.prototype.slice.call(row.querySelectorAll("a[aria-label]")).forEach(function (a) {
      byLabel[a.getAttribute("aria-label")] = a;
    });

    if (!byLabel.LinkedIn) {
      row.insertAdjacentHTML("beforeend", LINKEDIN_HTML);
      byLabel.LinkedIn = row.querySelector('[aria-label="LinkedIn"]');
    }

    var order = ["TikTok", "Instagram", "Facebook", "Pinterest", "LinkedIn", "YouTube"];
    order.forEach(function (label) {
      if (byLabel[label]) row.appendChild(byLabel[label]);
    });
  }

  function ensureLinkedIn() {
    document.querySelectorAll(".social-row").forEach(normalizeSocialRow);
  }

  function initFooterSignup() {
    var footerSignupForm = document.getElementById("footer-signup-form");
    var footerSignupConfirmer = document.getElementById("footer-signup-confirm");
    if (!footerSignupForm || !footerSignupConfirmer || footerSignupForm.dataset.wired === "true") return;

    footerSignupForm.dataset.wired = "true";
    footerSignupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("footer-email-input").value.trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!valid) {
        footerSignupConfirmer.textContent = "Veuillez entrer une adresse e-mail valide.";
        return;
      }
      var run =
        window.AJBNewsletter && window.AJBNewsletter.subscribe
          ? window.AJBNewsletter.subscribe({ email: email, source: "footer" })
          : Promise.reject(new Error("unavailable"));
      Promise.resolve(run)
        .then(function () {
          footerSignupConfirmer.textContent =
            "Merci pour votre inscription ! Consultez votre boîte de réception pour confirmer.";
          footerSignupForm.reset();
        })
        .catch(function () {
          footerSignupConfirmer.textContent = "Impossible d'enregistrer l'e-mail. Réessayez.";
        });
    });
  }

  function mountFooter(force) {
    if (!force && document.body.dataset.siteFooterMounted === "true") {
      ensureLinkedIn();
      return;
    }

    var html = buildFooterHtml();
    var existing = document.querySelector("footer.site-footer");
    if (!existing) {
      var legacyGrid = document.querySelector("footer .footer-grid");
      if (legacyGrid) existing = legacyGrid.closest("footer");
    }

    if (existing) existing.outerHTML = html;
    else {
      var shell = document.querySelector(".app-shell");
      if (shell) shell.insertAdjacentHTML("beforeend", html);
      else document.body.insertAdjacentHTML("beforeend", html);
    }

    document.body.dataset.siteFooterMounted = "true";
    initFooterSignup();
    ensureLinkedIn();
  }

  function autoInit(force) {
    if (document.querySelector(".diy-content") && !document.querySelector(".app-shell")) {
      ensureLinkedIn();
      return;
    }
    mountFooter(force);
  }

  window.SiteFooter = {
    mount: mountFooter,
    buildHtml: buildFooterHtml,
    ensureLinkedIn: ensureLinkedIn,
  };

  function boot() {
    document.body.dataset.siteFooterMounted = "";
    autoInit(true);
  }

  if (!window.__siteFooterReadyBound) {
    window.__siteFooterReadyBound = true;
    document.addEventListener("ajb:legacy-page-ready", boot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      autoInit(true);
    });
  } else {
    autoInit(true);
  }

  ensureLinkedIn();
})();
