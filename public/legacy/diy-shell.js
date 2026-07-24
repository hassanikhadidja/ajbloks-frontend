(function () {
  function getPrefix() {
    if (window.SiteHeader && window.SiteHeader.assetPrefix) {
      return window.SiteHeader.assetPrefix();
    }
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute('src') || '';
      if (src.indexOf('diy-shell.js') !== -1) {
        var match = src.match(/^((?:\.\.\/)+)/);
        return match ? match[1] : '';
      }
    }
    return '';
  }

  function promoNavHtml() {
    if (window.SiteHeader && window.SiteHeader.buildPromoNavHtml) {
      return window.SiteHeader.buildPromoNavHtml(getPrefix());
    }
    var prefix = getPrefix();
    var promoText =
      (window.PromoBar && window.PromoBar.getCached()) ||
      "Livraison gratuite pour les commandes de plus de 6500 DZD";
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
            '<button class="icon-btn" type="button" id="menuOpenBtn" aria-label="Menu">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
            '</button>' +
          '</div>' +
          '<a class="logo" href="/" aria-label="Accueil AJ BLOKS">' +
            '<img src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782245376/Design_sans_titre_31_azudmo.png" alt="AJ BLOKS">' +
          '</a>' +
          '<div class="nav-icons">' +
            '<button class="icon-btn" type="button" id="searchOpenBtn" aria-label="Rechercher">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M16.5 16.5L21 21"/></svg>' +
            '</button>' +
            '<button class="icon-btn" type="button" aria-label="Panier">' +
              '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' +
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

  function initNavSearch() {
    var mainNav = document.getElementById('mainNav');
    var searchOpenBtn = document.getElementById('searchOpenBtn');
    var searchCloseBtn = document.getElementById('searchCloseBtn');
    var searchForm = document.getElementById('searchForm');
    var searchInput = document.getElementById('searchInput');
    if (!mainNav || !searchOpenBtn || !searchCloseBtn || !searchForm || !searchInput) return;

    function closeSearch() {
      mainNav.classList.remove('is-search-active');
      searchInput.blur();
    }

    function openSearch() {
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
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-search-active')) closeSearch();
    });
  }

  function wrapDiyContent() {
    var content = document.querySelector('.diy-content');
    if (!content || content.dataset.shellWrapped === 'true') return;

    var shell = document.createElement('div');
    shell.className = 'app-shell';
    shell.insertAdjacentHTML('afterbegin', promoNavHtml());

    var phone = document.createElement('div');
    phone.className = 'phone';

    content.parentNode.insertBefore(shell, content);
    shell.appendChild(phone);
    phone.appendChild(content);

    content.dataset.shellWrapped = 'true';
    document.body.classList.add('diy-page');

    initSiteChrome(0);
    if (window.SiteFooter) window.SiteFooter.mount();

    if (!document.querySelector('script[src*="diy-laptop.js"]')) {
      var laptopScript = document.createElement('script');
      var prefix = getPrefix();
      laptopScript.src = prefix ? prefix + 'diy-laptop.js' : '/legacy/diy-laptop.js';
      document.body.appendChild(laptopScript);
    }
  }

  function initSiteChrome(retry) {
    if (window.SiteHeader && window.SiteHeader.init) {
      window.SiteHeader.init();
      if (window.SiteMenu && window.SiteMenu.init) window.SiteMenu.init();
      return;
    }
    if (retry < 50) {
      setTimeout(function () { initSiteChrome(retry + 1); }, 50);
      return;
    }
    initNavSearch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapDiyContent);
  } else {
    wrapDiyContent();
  }
})();
