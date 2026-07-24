(function () {
  function assetPrefix() {
    return '';
  }

  function buildMenuHtml(p) {
    return "<!-- mobile menu -->\n<div class=\"mobile-menu\" id=\"mobileMenu\" aria-hidden=\"true\">\r\n<div class=\"mobile-menu-header\">\r\n  <form class=\"menu-search-form\" id=\"menuSearchForm\" role=\"search\">\r\n    <input class=\"menu-search-input\" id=\"menuSearchInput\" type=\"search\" name=\"q\" placeholder=\"Rechercher du fun !\" autocomplete=\"off\" aria-label=\"Rechercher du fun\">\r\n    <button class=\"menu-search-btn\" type=\"submit\" aria-label=\"Rechercher\">\r\n      <svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M16.5 16.5L21 21\"/></svg>\r\n    </button>\r\n  </form>\r\n  <button class=\"icon-btn menu-close\" type=\"button\" id=\"menuCloseBtn\" aria-label=\"Fermer le menu\">\r\n    <svg class=\"nav-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M18 6L6 18M6 6l12 12\"/></svg>\r\n  </button>\r\n</div>\r\n<nav class=\"mobile-menu-body\">\r\n  <div class=\"menu-panels\" id=\"menuPanels\">\r\n\r\n    <!-- root -->\r\n    <div class=\"menu-panel is-active\" data-panel=\"root\">\r\n      <ul class=\"menu-primary\">\r\n        <li><button type=\"button\" class=\"menu-drill-root\" data-panel=\"category\">Acheter par catégorie <span class=\"menu-chevron\" aria-hidden=\"true\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill-root\" data-panel=\"age\">Acheter par âge <span class=\"menu-chevron\" aria-hidden=\"true\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill-root\" data-panel=\"bret\">Acheter par personnage <span class=\"menu-chevron\" aria-hidden=\"true\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill-root\" data-panel=\"play\">Jouer <span class=\"menu-chevron\" aria-hidden=\"true\">›</span></button></li>\r\n      </ul>\r\n      <ul class=\"menu-secondary\">\r\n        <li>\r\n          <a href=\"__P__/signup-email-form\" class=\"menu-link-blue menu-close-link\">\r\n            <span class=\"menu-article-icon icon-blue\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/></svg></span>\r\n            Inscription e-mail pour offres et nouveautés !\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"__P__/done/wishlist\" class=\"menu-close-link\">\r\n            <span class=\"menu-article-icon icon-blue icon-fill\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.502 5.502 0 0 0 16.503 3c-1.76 0-3 .56-4.5 2.17C10.503 3.56 9.263 3 7.503 3A5.502 5.502 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z\"/></svg></span>\r\n            Liste de souhaits\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"__P__/toysrus-account\" class=\"menu-link-grey menu-close-link\">\r\n            <span class=\"menu-article-icon icon-grey\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6\"/></svg></span>\r\n            Compte\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"__P__/done/find-us\">\r\n            <span class=\"menu-article-icon\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z\"/><circle cx=\"12\" cy=\"11\" r=\"2.5\"/></svg></span>\r\n            Trouver un magasin\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"#\">\r\n            <span class=\"menu-article-icon\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M1 6h13v9H1z\"/><path d=\"M14 9h4l3 4v2h-7V9z\"/><circle cx=\"5.5\" cy=\"17.5\" r=\"1.5\"/><circle cx=\"17.5\" cy=\"17.5\" r=\"1.5\"/></svg></span>\r\n            Suivre ma commande\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"__P__/toysrus-faq-2\" class=\"menu-close-link\">\r\n            <span class=\"menu-article-icon\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.5 3.5c-.9.9-1.5 1.2-1.5 2\"/><circle cx=\"12\" cy=\"17\" r=\".75\" fill=\"currentColor\" stroke=\"none\"/></svg></span>\r\n            Centre d'aide\r\n          </a>\r\n        </li>\r\n        <li>\r\n          <a href=\"__P__/gros-main\" class=\"menu-close-link\">\r\n            <span class=\"menu-article-icon\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M4 5h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5z\"/><path d=\"M7 5a3 3 0 0 1 3-3h9v16H10a3 3 0 0 1-3-3\"/></svg></span>\r\n            Catalogue grossiste\r\n          </a>\r\n        </li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- shop by category -->\r\n    <div class=\"menu-panel\" data-panel=\"category\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"root\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Acheter par catégorie</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/shop-all-categories-page\" class=\"menu-plain menu-close-link\">Toutes les catégories</a></li>\r\n        <li><a href=\"__P__/new-and-trending\" class=\"menu-plain menu-close-link\">Nouveautés et tendances</a></li>\r\n        <li><button type=\"button\" class=\"menu-drill\" data-panel=\"category-atelier-blocs\">Atelier des Blocs <span class=\"menu-chevron\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill\" data-panel=\"category-jeu-symbolique\">Jeu symbolique <span class=\"menu-chevron\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill\" data-panel=\"category-jeux-exterieur\">Jeux d'extérieur <span class=\"menu-chevron\">›</span></button></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Jouets%20b%C3%A9b%C3%A9%20et%20tout-petits\" class=\"menu-plain menu-close-link\">Jouets bébé et tout-petits</a></li>\r\n        <li><a href=\"#\" class=\"menu-plain menu-close-link\">Jolie Coiffure</a></li>\r\n        <li><a href=\"#\" class=\"menu-plain menu-close-link\">Poupées, collectibles et peluches</a></li>\r\n        <li><a href=\"__P__/books-page\" class=\"menu-plain menu-close-link\">Livres &amp; Magazines</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- jeu symbolique -->\r\n    <div class=\"menu-panel\" data-panel=\"category-jeu-symbolique\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"category\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Jeu symbolique</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/outdoor-play?category=Jeu%20symbolique\" class=\"menu-plain menu-close-link\">Tous les jeux symboliques</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Petit%20Bricoleur\" class=\"menu-plain menu-close-link\">Petit Bricoleur</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Cuisine%20%26%20D%C3%A9lices\" class=\"menu-plain menu-close-link\">Cuisine &amp; Délices</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=B%C3%A9b%C3%A9%20%26%20Tendresse\" class=\"menu-plain menu-close-link\">Bébé &amp; Tendresse</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- atelier des blocs -->\r\n    <div class=\"menu-panel\" data-panel=\"category-atelier-blocs\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"category\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Atelier des Blocs</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/outdoor-play?category=Atelier%20des%20Blocs\" class=\"menu-plain menu-close-link\">Tous les blocs de construction</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=En%20Route%20avec%20les%20Blocs\" class=\"menu-plain menu-close-link\">En Route avec les Blocs</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Blocs%20%C3%89ducatifs\" class=\"menu-plain menu-close-link\">Blocs Éducatifs</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Blocs%20Classiques\" class=\"menu-plain menu-close-link\">Blocs Classiques</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- jeux exterieur -->\r\n    <div class=\"menu-panel\" data-panel=\"category-jeux-exterieur\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"category\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Jeux d'extérieur</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/outdoor-play\" class=\"menu-plain menu-close-link\">Tous les jeux d'extérieur</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Ch%C3%A2teaux%20de%20Sable\" class=\"menu-plain menu-close-link\">Châteaux de Sable</a></li>\r\n        <li><a href=\"__P__/outdoor-play?category=Cordes%20%C3%A0%20Sauter%20%26%20Jeux%20Actifs\" class=\"menu-plain menu-close-link\">Cordes à Sauter &amp; Jeux Actifs</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- shop by age -->\r\n    <div class=\"menu-panel\" data-panel=\"age\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"root\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Acheter par âge</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/age-products?age=0-12%20mois\" class=\"menu-plain menu-close-link\">0–12 mois</a></li>\r\n        <li><a href=\"__P__/age-products?age=1-2%20ans\" class=\"menu-plain menu-close-link\">1–2 ans</a></li>\r\n        <li><a href=\"__P__/age-products?age=2-3%20ans\" class=\"menu-plain menu-close-link\">2–3 ans</a></li>\r\n        <li><a href=\"__P__/age-products?age=3-5%20ans\" class=\"menu-plain menu-close-link\">3–5 ans</a></li>\r\n        <li><a href=\"__P__/age-products?age=5-8%20ans\" class=\"menu-plain menu-close-link\">5–8 ans</a></li>\r\n        <li><a href=\"__P__/age-products?age=8%20ans%20et%20%2B\" class=\"menu-plain menu-close-link\">8 ans et +</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- shop by character -->\r\n    <div class=\"menu-panel\" data-panel=\"bret\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"root\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Acheter par personnage</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><button type=\"button\" class=\"menu-drill\" data-panel=\"bret-all\">Explorer toutes les marques <span class=\"menu-chevron\">›</span></button></li>\r\n        <li><button type=\"button\" class=\"menu-drill\" data-panel=\"bret-characters\">Explorer tous les personnages <span class=\"menu-chevron\">›</span></button></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- explore all brets -->\r\n    <div class=\"menu-panel\" data-panel=\"bret-all\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"bret\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Explorer toutes les marques</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/toysrus-notre-histoire\" class=\"menu-plain menu-close-link\">Créé pour AJ BLOKS</a></li>\r\n        <li><a href=\"__P__/brand?brand=NEWBOY\" class=\"menu-plain menu-close-link\">NEWBOY</a></li>\r\n        <li><a href=\"__P__/brand?brand=Sanrio\" class=\"menu-plain menu-close-link\">Sanrio</a></li>\r\n        <li><a href=\"__P__/brand?brand=Warner%20Bros.%20Discovery\" class=\"menu-plain menu-close-link\">Warner Bros. Discovery</a></li>\r\n        <li><a href=\"__P__/brand?brand=Disney\" class=\"menu-plain menu-close-link\">Disney</a></li>\r\n        <li><a href=\"__P__/brand?brand=Alpha%20Group\" class=\"menu-plain menu-close-link\">Alpha Group</a></li>\r\n        <li><a href=\"__P__/brand?brand=John%20Deere\" class=\"menu-plain menu-close-link\">John Deere</a></li>\r\n        <li><a href=\"__P__/brand?brand=Caterpillar\" class=\"menu-plain menu-close-link\">Caterpillar</a></li>\r\n        <li><a href=\"__P__/brand?brand=Marvel\" class=\"menu-plain menu-close-link\">Marvel</a></li>\r\n        <li><a href=\"__P__/brand?brand=Paramount\" class=\"menu-plain menu-close-link\">Paramount</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- explore all characters -->\r\n    <div class=\"menu-panel\" data-panel=\"bret-characters\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"bret\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Explorer tous les personnages</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/character?character=Hello%20Kitty\" class=\"menu-plain menu-close-link\">Hello Kitty</a></li>\r\n        <li><a href=\"__P__/character?character=Tom%20%26%20Jerry\" class=\"menu-plain menu-close-link\">Tom &amp; Jerry</a></li>\r\n        <li><a href=\"__P__/character?character=Teenage%20Mutant%20Ninja%20Turtles\" class=\"menu-plain menu-close-link\">Teenage Mutant Ninja Turtles</a></li>\r\n        <li><a href=\"__P__/character?character=Super%20Wings\" class=\"menu-plain menu-close-link\">Super Wings</a></li>\r\n        <li><a href=\"__P__/character?character=Bob\" class=\"menu-plain menu-close-link\">Bob</a></li>\r\n        <li><a href=\"__P__/character?character=Fulla\" class=\"menu-plain menu-close-link\">Fulla</a></li>\r\n        <li><a href=\"__P__/character?character=Sophia\" class=\"menu-plain menu-close-link\">Sophia</a></li>\r\n        <li><a href=\"__P__/spider-man\" class=\"menu-plain menu-close-link\">Spider-Man</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n    <!-- play -->\r\n    <div class=\"menu-panel\" data-panel=\"play\">\r\n      <div class=\"menu-subheader\">\r\n        <button type=\"button\" class=\"menu-back\" data-panel=\"root\" aria-label=\"Retour\"><svg viewBox=\"0 0 24 24\"><path d=\"M19 12H5M12 19l-7-7 7-7\"/></svg></button>\r\n        <h2 class=\"menu-subtitle title\">Jouer</h2>\r\n      </div>\r\n      <ul class=\"menu-sublist\">\r\n        <li><a href=\"__P__/tiktok-like-video\" class=\"menu-plain menu-close-link\">Jouets en action</a></li>\r\n        <li><a href=\"__P__/toysrus-diy-activities\" class=\"menu-plain menu-close-link\">Activités DIY</a></li>\r\n        <li><a href=\"__P__/toysrus-printables\" class=\"menu-plain menu-close-link\">Imprimables</a></li>\r\n        <li><a href=\"__P__/toysrus-bobs-world\" class=\"menu-plain menu-close-link\">Le monde de Bob</a></li>\r\n      </ul>\r\n    </div>\r\n\r\n  </div>\r\n</nav>\r\n</div>".replace(/__P__/g, p);
  }

  function upgradeMenuButton() {
    var btn = document.getElementById('menuOpenBtn');
    if (btn) return btn;
    var link = document.querySelector('#mainNav .nav-icons a.icon-btn[aria-label="Menu"], #mainNav .nav-icons a.icon-btn[href*="home-page"]');
    if (!link) return null;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = link.className;
    button.id = 'menuOpenBtn';
    button.setAttribute('aria-label', 'Menu');
    button.innerHTML = link.innerHTML;
    link.parentNode.replaceChild(button, link);
    return button;
  }

  function ensureMenuOnBody(menuEl) {
    if (menuEl && menuEl.parentNode !== document.body) {
      document.body.appendChild(menuEl);
    }
  }

  function injectMenu() {
    var existing = document.getElementById('mobileMenu');
    if (existing) {
      ensureMenuOnBody(existing);
      return;
    }
    if (!document.getElementById('mainNav')) return;
    document.body.insertAdjacentHTML('beforeend', buildMenuHtml(assetPrefix()));
  }

  function initSiteMenu() {
    injectMenu();
    upgradeMenuButton();

    var mobileMenu = document.getElementById('mobileMenu');
    var menuOpenBtn = document.getElementById('menuOpenBtn');
    var menuCloseBtn = document.getElementById('menuCloseBtn');
    var menuSearchForm = document.getElementById('menuSearchForm');
    var menuPanels = document.querySelectorAll('.menu-panel');
    if (!mobileMenu || !menuOpenBtn || !menuCloseBtn || !menuPanels.length) return;

    ensureMenuOnBody(mobileMenu);

    var menuPanelStack = window.menuPanelStack && Array.isArray(window.menuPanelStack) ? window.menuPanelStack : ['root'];
    window.menuPanelStack = menuPanelStack;

    function getMenuPanel(panelId) {
      return document.querySelector('.menu-panel[data-panel="' + panelId + '"]');
    }

    function applyMenuPanelClasses() {
      var activeId = menuPanelStack[menuPanelStack.length - 1];
      var activeIndex = menuPanelStack.indexOf(activeId);
      menuPanels.forEach(function (panel) {
        var id = panel.dataset.panel;
        var index = menuPanelStack.indexOf(id);
        panel.classList.remove('is-active', 'is-left', 'is-right');
        if (id === activeId) panel.classList.add('is-active');
        else if (index !== -1 && index < activeIndex) panel.classList.add('is-left');
        else panel.classList.add('is-right');
      });
    }

    window.applyMenuStack = function (stack) {
      menuPanelStack.length = 0;
      stack.forEach(function (id) { menuPanelStack.push(id); });
      applyMenuPanelClasses();
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    };

    function saveMenuState() {
      if (typeof window.savePageState === 'function') window.savePageState();
    }

    function resetMenuPanels(instant) {
      menuPanelStack.length = 0;
      menuPanelStack.push('root');
      if (instant) mobileMenu.classList.add('menu-no-transition');
      applyMenuPanelClasses();
      menuPanels.forEach(function (panel) { panel.scrollTop = 0; });
      if (instant) {
        void mobileMenu.offsetWidth;
        mobileMenu.classList.remove('menu-no-transition');
      }
    }

    function pushMenuPanel(panelId) {
      var currentId = menuPanelStack[menuPanelStack.length - 1];
      var currentPanel = getMenuPanel(currentId);
      var nextPanel = getMenuPanel(panelId);
      if (!currentPanel || !nextPanel) return;
      menuPanelStack.push(panelId);
      nextPanel.classList.remove('is-left', 'is-right');
      nextPanel.classList.add('is-right');
      void nextPanel.offsetWidth;
      currentPanel.classList.remove('is-active');
      currentPanel.classList.add('is-left');
      nextPanel.classList.remove('is-right');
      nextPanel.classList.add('is-active');
      nextPanel.scrollTop = 0;
      saveMenuState();
    }

    function popMenuPanel() {
      if (menuPanelStack.length <= 1) return;
      var currentId = menuPanelStack.pop();
      var previousId = menuPanelStack[menuPanelStack.length - 1];
      var currentPanel = getMenuPanel(currentId);
      var previousPanel = getMenuPanel(previousId);
      if (!currentPanel || !previousPanel) return;
      if (!previousPanel.classList.contains('is-left')) {
        previousPanel.classList.remove('is-active', 'is-right');
        previousPanel.classList.add('is-left');
        void previousPanel.offsetWidth;
      }
      currentPanel.classList.remove('is-active');
      currentPanel.classList.add('is-right');
      previousPanel.classList.remove('is-left');
      previousPanel.classList.add('is-active');
      previousPanel.scrollTop = 0;
      saveMenuState();
    }

    function closeSearchNav() {
      var mainNav = document.getElementById('mainNav');
      var searchInput = document.getElementById('searchInput');
      if (mainNav) mainNav.classList.remove('is-search-active');
      if (searchInput) searchInput.blur();
    }

    function closeCartNav() {
      if (typeof window.closeCart === 'function') window.closeCart();
    }

    function openMenu() {
      ensureMenuOnBody(mobileMenu);
      closeSearchNav();
      closeCartNav();
      resetMenuPanels(true);
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      saveMenuState();
    }

    function closeMenu() {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      resetMenuPanels(true);
      saveMenuState();
    }

    if (!menuOpenBtn.dataset.menuWired) {
      menuOpenBtn.dataset.menuWired = 'true';
      menuOpenBtn.addEventListener('click', openMenu);
    }
    if (!menuCloseBtn.dataset.menuWired) {
      menuCloseBtn.dataset.menuWired = 'true';
      menuCloseBtn.addEventListener('click', closeMenu);
    }
    if (menuSearchForm && !menuSearchForm.dataset.menuWired) {
      menuSearchForm.dataset.menuWired = 'true';
      menuSearchForm.addEventListener('submit', function (e) { e.preventDefault(); });
    }

    document.querySelectorAll('[data-panel].menu-drill-root, [data-panel].menu-drill').forEach(function (btn) {
      if (btn.dataset.menuWired) return;
      btn.dataset.menuWired = 'true';
      btn.addEventListener('click', function () { pushMenuPanel(btn.dataset.panel); });
    });
    document.querySelectorAll('.menu-back').forEach(function (btn) {
      if (btn.dataset.menuWired) return;
      btn.dataset.menuWired = 'true';
      btn.addEventListener('click', popMenuPanel);
    });
    document.querySelectorAll('.menu-close-link').forEach(function (link) {
      if (link.dataset.menuWired) return;
      link.dataset.menuWired = 'true';
      link.addEventListener('click', closeMenu);
    });

    if (!document.body.dataset.menuEscapeWired) {
      document.body.dataset.menuEscapeWired = 'true';
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!mobileMenu.classList.contains('is-open')) return;
        if (menuPanelStack.length > 1) popMenuPanel();
        else closeMenu();
      });
    }

    applyMenuPanelClasses();
    wireDesktopNav();
    window.SiteMenu = {
      open: openMenu,
      close: closeMenu,
      reset: resetMenuPanels,
      init: initSiteMenu,
      wireDesktopNav: wireDesktopNav,
      openDesktop: openDesktopMenu,
      closeDesktop: closeDesktopMenu
    };
  }

  var desktopMenuCurrentPanel = null;

  function isLaptopViewport() {
    return window.matchMedia('(min-width: 1400px)').matches;
  }

  function injectDesktopMenu() {
    if (document.getElementById('desktopMenu')) return;
    var prefix = assetPrefix();
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="desktop-menu" id="desktopMenu" aria-hidden="true">' +
        '<div class="desktop-menu-backdrop" id="desktopMenuBackdrop"></div>' +
        '<div class="desktop-menu-panel" role="dialog" aria-modal="true" aria-label="Menu de navigation">' +
          '<div class="desktop-menu-header">' +
            '<a class="desktop-menu-logo" href="' + (prefix || '/') + '" aria-label="Accueil AJ BLOKS">' +
              '<img src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782245376/Design_sans_titre_31_azudmo.png" alt="AJ BLOKS">' +
            '</a>' +
            '<nav class="desktop-menu-tabs" aria-label="Sections du menu">' +
              '<button type="button" class="desktop-menu-tab" data-menu-panel="category">Acheter par catégorie</button>' +
              '<button type="button" class="desktop-menu-tab" data-menu-panel="age">Acheter par âge</button>' +
              '<button type="button" class="desktop-menu-tab" data-menu-panel="play">Jouer</button>' +
            '</nav>' +
            '<button type="button" class="desktop-menu-close" id="desktopMenuCloseBtn" aria-label="Fermer le menu">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
            '</button>' +
          '</div>' +
          '<div class="desktop-menu-body">' +
            '<div class="desktop-menu-columns">' +
              '<ul class="desktop-menu-list" id="desktopMenuLeft"></ul>' +
              '<div class="desktop-menu-divider" aria-hidden="true"></div>' +
              '<ul class="desktop-menu-list desktop-menu-sublist" id="desktopMenuRight"></ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function updateDesktopMenuOffset() {
    var promo = document.querySelector('.promo-bar');
    var nav = document.getElementById('mainNav');
    var top = 0;
    if (promo) top += promo.offsetHeight;
    if (nav) top += nav.offsetHeight;
    document.documentElement.style.setProperty('--desktop-menu-top', top + 'px');
  }

  function desktopMenuItemLi(el) {
    var li = document.createElement('li');
    li.appendChild(el);
    return li;
  }

  function closeDesktopMenu() {
    var menu = document.getElementById('desktopMenu');
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('desktop-menu-open');
    desktopMenuCurrentPanel = null;
    document.querySelectorAll('.desktop-nav-trigger, .desktop-menu-tab').forEach(function (el) {
      el.classList.remove('is-active');
    });
  }

  function showDesktopSubPanel(subPanelId, triggerBtn) {
    var right = document.getElementById('desktopMenuRight');
    var mobilePanel = document.querySelector('.menu-panel[data-panel="' + subPanelId + '"]');
    if (!right || !mobilePanel) return;

    document.querySelectorAll('.desktop-menu-drill').forEach(function (btn) {
      btn.classList.remove('is-active');
    });
    if (triggerBtn) triggerBtn.classList.add('is-active');

    right.innerHTML = '';
    var sublist = mobilePanel.querySelector('.menu-sublist');
    if (!sublist) {
      right.classList.remove('is-visible');
      return;
    }

    sublist.querySelectorAll(':scope > li').forEach(function (li) {
      var link = li.querySelector('a.menu-plain');
      if (!link) return;
      var a = document.createElement('a');
      a.className = 'desktop-menu-item';
      a.href = link.getAttribute('href') || '#';
      a.textContent = (link.textContent || '').trim();
      a.addEventListener('click', closeDesktopMenu);
      right.appendChild(desktopMenuItemLi(a));
    });

    right.classList.add('is-visible');
  }

  function renderDesktopLeftPanel(panelId) {
    var left = document.getElementById('desktopMenuLeft');
    var right = document.getElementById('desktopMenuRight');
    if (!left || !right) return;

    var mobilePanel = document.querySelector('.menu-panel[data-panel="' + panelId + '"]');
    if (!mobilePanel) return;

    left.innerHTML = '';
    right.innerHTML = '';
    right.classList.remove('is-visible');

    var sublist = mobilePanel.querySelector('.menu-sublist');
    if (!sublist) return;

    sublist.querySelectorAll(':scope > li').forEach(function (li) {
      var link = li.querySelector('a.menu-plain');
      var drill = li.querySelector('button.menu-drill');

      if (link) {
        var a = document.createElement('a');
        a.className = 'desktop-menu-item';
        a.href = link.getAttribute('href') || '#';
        a.textContent = (link.textContent || '').trim();
        a.addEventListener('click', closeDesktopMenu);
        left.appendChild(desktopMenuItemLi(a));
        return;
      }

      if (!drill) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desktop-menu-item desktop-menu-drill';
      btn.dataset.panel = drill.dataset.panel;
      var label = (drill.textContent || '').replace(/›/g, '').trim();
      btn.innerHTML = label + ' <span class="desktop-menu-chevron" aria-hidden="true">›</span>';

      function activateDrill() {
        showDesktopSubPanel(drill.dataset.panel, btn);
      }

      btn.addEventListener('click', activateDrill);
      if (window.matchMedia('(hover: hover)').matches) {
        btn.addEventListener('mouseenter', activateDrill);
      }

      left.appendChild(desktopMenuItemLi(btn));
    });
  }

  function setDesktopMenuActivePanel(panelId) {
    document.querySelectorAll('.desktop-menu-tab').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.menuPanel === panelId);
    });
    document.querySelectorAll('.desktop-nav-trigger').forEach(function (trigger) {
      trigger.classList.toggle('is-active', trigger.dataset.menuPanel === panelId);
    });
  }

  function openDesktopMenu(panelId) {
    if (!isLaptopViewport()) return;

    injectDesktopMenu();
    var menu = document.getElementById('desktopMenu');
    if (!menu) return;

    if (menu.classList.contains('is-open') && desktopMenuCurrentPanel === panelId) {
      closeDesktopMenu();
      return;
    }

    var mainNav = document.getElementById('mainNav');
    if (mainNav) mainNav.classList.remove('is-search-active');
    if (typeof window.closeCart === 'function') window.closeCart();

    desktopMenuCurrentPanel = panelId;
    updateDesktopMenuOffset();
    renderDesktopLeftPanel(panelId);
    setDesktopMenuActivePanel(panelId);

    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('desktop-menu-open');
  }

  function wireDesktopNav() {
    injectDesktopMenu();

    var closeBtn = document.getElementById('desktopMenuCloseBtn');
    var backdrop = document.getElementById('desktopMenuBackdrop');

    if (closeBtn && !closeBtn.dataset.desktopWired) {
      closeBtn.dataset.desktopWired = '1';
      closeBtn.addEventListener('click', closeDesktopMenu);
    }

    if (backdrop && !backdrop.dataset.desktopWired) {
      backdrop.dataset.desktopWired = '1';
      backdrop.addEventListener('click', closeDesktopMenu);
    }

    document.querySelectorAll('.desktop-nav-trigger').forEach(function (btn) {
      if (btn.dataset.desktopWired) return;
      btn.dataset.desktopWired = '1';
      btn.addEventListener('click', function (e) {
        if (!isLaptopViewport()) return;
        e.preventDefault();
        openDesktopMenu(btn.dataset.menuPanel);
      });
    });

    document.querySelectorAll('.desktop-menu-tab').forEach(function (tab) {
      if (tab.dataset.desktopWired) return;
      tab.dataset.desktopWired = '1';
      tab.addEventListener('click', function () {
        if (!isLaptopViewport()) return;
        openDesktopMenu(tab.dataset.menuPanel);
      });
    });

    if (!document.documentElement.dataset.desktopMenuEscBound) {
      document.documentElement.dataset.desktopMenuEscBound = '1';
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var menu = document.getElementById('desktopMenu');
        if (menu && menu.classList.contains('is-open')) closeDesktopMenu();
      });
    }

    if (!window.__desktopMenuResizeBound) {
      window.__desktopMenuResizeBound = true;
      window.addEventListener('resize', function () {
        if (!isLaptopViewport()) closeDesktopMenu();
        else updateDesktopMenuOffset();
      });
    }
  }

  window.SiteMenu = window.SiteMenu || { init: initSiteMenu, wireDesktopNav: wireDesktopNav };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSiteMenu);
  } else {
    initSiteMenu();
  }
})();
