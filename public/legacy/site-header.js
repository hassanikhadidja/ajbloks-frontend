(function () {
  function isLaptopContent(w) {
    w = w == null ? window.innerWidth : w;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function assetPrefix() {
    return '';
  }

  function homeHref(prefix) {
    var path = (window.location.pathname || '').replace(/\\/g, '/');
    if (path === '/' || /\/home-page$/i.test(path)) return '#';
    return '/';
  }

  function getPromoSentence() {
    if (window.PromoBar && typeof window.PromoBar.getCached === "function") {
      return window.PromoBar.getCached();
    }
    try {
      return (
        localStorage.getItem("ajbloks-promo-bar") ||
        "Livraison gratuite pour les commandes de plus de 6500 DZD"
      );
    } catch (e) {
      return "Livraison gratuite pour les commandes de plus de 6500 DZD";
    }
  }

  function escHtml(text) {
    var el = document.createElement("div");
    el.textContent = text;
    return el.innerHTML;
  }

  function buildPromoNavHtml(prefix) {
    var promoText = escHtml(getPromoSentence());
    return (
      '<div class="promo-bar">' +
        '<div class="promo-bar-inner">' +
          '<p class="promo-bar-msg">' + promoText + '</p>' +
          '<div class="promo-bar-utils" aria-label="Liens rapides">' +
            '<a href="' + prefix + '/done/find-us" class="promo-bar-link">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"/><circle cx="12" cy="11" r="2.5"/></svg>' +
              'Trouver un magasin' +
            '</a>' +
            '<a href="' + prefix + '/signin?tab=login" class="promo-bar-link" data-auth-promo-account="1">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>' +
              'Connexion' +
            '</a>' +
            '<a href="' + prefix + '/toysrus-faq-2" class="promo-bar-link">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 3.5c-.9.9-1.5 1.2-1.5 2"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/></svg>' +
              'Centre d\'aide' +
            '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<header class="nav" id="mainNav">' +
        '<div class="nav-default">' +
          '<div class="nav-icons">' +
            '<button class="icon-btn nav-menu-btn" type="button" id="menuOpenBtn" aria-label="Menu">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
            '</button>' +
            '<button class="icon-btn" type="button" aria-label="Compte">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>' +
            '</button>' +
          '</div>' +
          '<a class="logo" href="' + homeHref(prefix) + '" aria-label="Accueil AJ BLOKS">' +
            '<img src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782245376/Design_sans_titre_31_azudmo.png" alt="AJ BLOKS">' +
          '</a>' +
          '<div class="nav-icons nav-utils">' +
            '<button class="icon-btn nav-util-link" type="button" id="searchOpenBtn" aria-label="Rechercher">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M16.5 16.5L21 21"/></svg>' +
              '<span class="nav-util-label">Rechercher</span>' +
            '</button>' +
            '<a class="icon-btn nav-util-link nav-util-email" href="' + prefix + '/signup-email-form">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>' +
              '<span class="nav-util-label">Inscription e-mail</span>' +
            '</a>' +
            '<a class="icon-btn nav-util-link" href="' + prefix + '/done/wishlist" aria-label="Liste de souhaits">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.502 5.502 0 0 0 16.503 3c-1.76 0-3 .56-4.5 2.17C10.503 3.56 9.263 3 7.503 3A5.502 5.502 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z"/></svg>' +
              '<span class="nav-util-label">Liste de souhaits</span>' +
            '</a>' +
            '<button class="icon-btn nav-util-link cart-nav-btn" type="button" id="cartOpenBtn" aria-label="Panier">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' +
              '<span class="nav-util-label">Panier</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<div class="nav-search">' +
          '<form class="search-form" id="searchForm" role="search">' +
            '<input class="search-input" id="searchInput" type="search" name="q" placeholder="Rechercher jouets, marques et plus" autocomplete="off" aria-label="Rechercher">' +
          '</form>' +
          '<button class="icon-btn search-close" type="button" id="searchCloseBtn" aria-label="Fermer la recherche">' +
            '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
      '</header>'
    );
  }

  function findSiteShell() {
    return document.querySelector('.app-shell');
  }

  function replaceSiteChrome(prefix) {
    var shell = findSiteShell();
    if (!shell || shell.dataset.chromeNormalized === '1') return false;

    var promo = shell.querySelector(':scope > .promo-bar');
    var nav = shell.querySelector(':scope > #mainNav, :scope > header.nav');

    if (!promo && !nav) {
      shell.insertAdjacentHTML('afterbegin', buildPromoNavHtml(prefix));
      shell.dataset.chromeNormalized = '1';
      return true;
    }

    var wrap = document.createElement('div');
    wrap.innerHTML = buildPromoNavHtml(prefix);
    var newPromo = wrap.querySelector('.promo-bar');
    var newNav = wrap.querySelector('#mainNav');

    if (promo) promo.replaceWith(newPromo);
    else shell.insertBefore(newPromo, shell.firstChild);

    if (nav) nav.replaceWith(newNav);
    else if (newPromo.nextSibling) shell.insertBefore(newNav, newPromo.nextSibling);
    else shell.appendChild(newNav);

    shell.dataset.chromeNormalized = '1';
    return true;
  }

  function enhancePromoBar(prefix) {
    var bar = document.querySelector('.app-shell > .promo-bar, body.diy-page .app-shell > .promo-bar, .promo-bar');
    if (!bar || bar.querySelector('.promo-bar-inner')) return;
    var msg = (bar.textContent || '').trim() || 'Livraison gratuite pour les commandes de plus de 6500 DZD';
    bar.innerHTML =
      '<div class="promo-bar-inner">' +
        '<p class="promo-bar-msg">' + msg + '</p>' +
        '<div class="promo-bar-utils" aria-label="Liens rapides">' +
          '<a href="' + prefix + '/done/find-us" class="promo-bar-link">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"/><circle cx="12" cy="11" r="2.5"/></svg>' +
            'Trouver un magasin' +
          '</a>' +
          '<a href="' + prefix + '/signin?tab=login" class="promo-bar-link" data-auth-promo-account="1">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>' +
            'Connexion' +
          '</a>' +
          '<a href="' + prefix + '/toysrus-faq-2" class="promo-bar-link">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 3.5c-.9.9-1.5 1.2-1.5 2"/><circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/></svg>' +
            'Centre d\'aide' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  function addMascot(nav) {
    var logo = nav.querySelector('.logo');
    if (!logo || nav.querySelector('.nav-mascot')) return;

    var mascot = document.createElement('img');
    mascot.className = 'nav-mascot';
    mascot.src = 'https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782348573/Design_sans_titre_41_dppajr.png';
    mascot.alt = '';
    logo.parentNode.insertBefore(mascot, logo);
  }

  function addUtilLabel(el, text) {
    if (!el) return;
    el.classList.add('nav-util-link');
    var span = el.querySelector('.nav-util-label');
    if (!span) {
      span = document.createElement('span');
      span.className = 'nav-util-label';
      el.appendChild(span);
    }
    span.textContent = text;
  }

  function normalizeCartBtn(utils) {
    var cartBtn = utils.querySelector('#cartOpenBtn, .cart-nav-btn, button[aria-label="Panier"], a[aria-label="Panier"]');
    if (!cartBtn) return null;
    if (!cartBtn.id) cartBtn.id = 'cartOpenBtn';
    cartBtn.classList.add('cart-nav-btn', 'nav-util-link');
    return cartBtn;
  }

  function wrapNavLeft(nav) {
    var navDefault = nav.querySelector('.nav-default');
    if (!navDefault) return null;
    if (navDefault.querySelector('.nav-left')) return navDefault;

    var firstIcons = navDefault.querySelector('.nav-icons:not(.nav-utils)');
    var logo = navDefault.querySelector('.logo');
    var utils = navDefault.querySelector('.nav-utils');

    var leftWrap = document.createElement('div');
    leftWrap.className = 'nav-left';

    if (firstIcons) leftWrap.appendChild(firstIcons);
    if (logo) leftWrap.appendChild(logo);

    var desktopNav = document.createElement('nav');
    desktopNav.className = 'desktop-nav';
    desktopNav.setAttribute('aria-label', 'Navigation principale');
    leftWrap.appendChild(desktopNav);

    navDefault.insertBefore(leftWrap, navDefault.firstChild);

    if (utils && !utils.classList.contains('nav-utils')) utils.classList.add('nav-utils');

    return navDefault;
  }

  function enhanceDesktopNav(prefix) {
    var nav = document.getElementById('mainNav') || document.querySelector('header.nav');
    if (!nav) return;

    var navDefault = wrapNavLeft(nav);
    if (!navDefault) return;

    var menuBtn = nav.querySelector('#menuOpenBtn');
    if (menuBtn) menuBtn.classList.add('nav-menu-btn');

    var desktopNav = nav.querySelector('.desktop-nav');
    if (desktopNav && !desktopNav.dataset.ready) {
      desktopNav.dataset.ready = '1';
      desktopNav.innerHTML =
        '<button type="button" class="desktop-nav-trigger" data-menu-panel="category">Acheter par catégorie</button>' +
        '<button type="button" class="desktop-nav-trigger" data-menu-panel="age">Acheter par âge</button>' +
        '<button type="button" class="desktop-nav-trigger" data-menu-panel="play">Jouer</button>' +
        '<a href="' + prefix + '/gros-main">Catalogue Grossiste</a>';
    }

    var logo = nav.querySelector('.logo');
    if (logo) logo.setAttribute('href', homeHref(prefix));
    addMascot(nav);

    var utils = nav.querySelector('.nav-utils') || nav.querySelector('.nav-default > .nav-icons:last-child');
    if (!utils) return;
    if (!utils.classList.contains('nav-utils')) utils.classList.add('nav-utils');

    var searchBtn = utils.querySelector('#searchOpenBtn');
    var wishLink = utils.querySelector('a[aria-label="Liste de souhaits"]');
    var cartBtn = normalizeCartBtn(utils);
    var emailLink = utils.querySelector('.nav-util-email');

    if (!emailLink) {
      emailLink = document.createElement('a');
      emailLink.className = 'icon-btn nav-util-link nav-util-email';
      emailLink.href = prefix + '/signup-email-form';
      emailLink.innerHTML =
        '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>' +
        '<span class="nav-util-label">Inscription e-mail</span>';
      if (searchBtn && searchBtn.nextSibling) utils.insertBefore(emailLink, searchBtn.nextSibling);
      else utils.appendChild(emailLink);
    }

    addUtilLabel(searchBtn, 'Rechercher');
    addUtilLabel(emailLink, 'Inscription e-mail');
    addUtilLabel(wishLink, 'Liste de souhaits');
    addUtilLabel(cartBtn, 'Panier');

    if (searchBtn) utils.appendChild(searchBtn);
    if (emailLink) utils.appendChild(emailLink);
    if (wishLink) utils.appendChild(wishLink);
    if (cartBtn) utils.appendChild(cartBtn);

    if (window.SiteMenu && typeof window.SiteMenu.wireDesktopNav === 'function') {
      window.SiteMenu.wireDesktopNav();
    }
  }

  function updateCartLabel() {
    var cartBtn = document.querySelector('#cartOpenBtn.nav-util-link, .cart-nav-btn.nav-util-link');
    if (!cartBtn) return;
    var label = cartBtn.querySelector('.nav-util-label');
    if (label) label.textContent = 'Panier';
  }

  function rebindCart() {
    if (window.CartDrawer && typeof window.CartDrawer.bind === 'function') {
      window.CartDrawer.bind();
    }
  }

  function initNavSearch() {
    var mainNav = document.getElementById('mainNav');
    if (!mainNav || mainNav.dataset.searchReady === '1') return;

    var searchOpenBtn = document.getElementById('searchOpenBtn');
    var searchCloseBtn = document.getElementById('searchCloseBtn');
    var searchForm = document.getElementById('searchForm');
    var searchInput = document.getElementById('searchInput');
    if (!searchOpenBtn || !searchCloseBtn || !searchForm || !searchInput) return;

    mainNav.dataset.searchReady = '1';

    function closeSearch() {
      mainNav.classList.remove('is-search-active');
      searchInput.blur();
    }

    function openSearch(e) {
      if (e) e.preventDefault();
      mainNav.classList.add('is-search-active');
      searchInput.value = '';
      requestAnimationFrame(function () { searchInput.focus(); });
    }

    searchOpenBtn.addEventListener('click', openSearch);
    searchCloseBtn.addEventListener('click', closeSearch);
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      closeSearch();
    });

    if (!document.documentElement.dataset.navSearchEscBound) {
      document.documentElement.dataset.navSearchEscBound = '1';
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && mainNav.classList.contains('is-search-active')) closeSearch();
      });
    }
  }

  function init() {
    var prefix = assetPrefix();
    var chromeChanged = replaceSiteChrome(prefix);
    enhancePromoBar(prefix);
    enhanceDesktopNav(prefix);
    initNavSearch();
    rebindCart();
    updateCartLabel();

    if (window.SiteMenu && typeof window.SiteMenu.init === 'function') {
      window.SiteMenu.init();
    } else if (window.SiteMenu && typeof window.SiteMenu.wireDesktopNav === 'function') {
      window.SiteMenu.wireDesktopNav();
    }

    var badge = document.getElementById('cartBadge');
    if (badge && typeof MutationObserver !== "undefined") {
      new MutationObserver(updateCartLabel).observe(badge, { childList: true, characterData: true, subtree: true });
    }

    if (window.PromoBar && typeof window.PromoBar.apply === "function") {
      window.PromoBar.apply(window.PromoBar.getCached());
    }

    return chromeChanged;
  }

  window.SiteHeader = {
    init: init,
    buildPromoNavHtml: buildPromoNavHtml,
    replaceSiteChrome: replaceSiteChrome,
    assetPrefix: assetPrefix,
    initNavSearch: initNavSearch,
    rebindCart: rebindCart,
    isLaptopContent: isLaptopContent
  };

  window.isLaptopContentWidth = isLaptopContent;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
