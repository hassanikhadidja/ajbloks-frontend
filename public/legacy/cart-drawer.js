(function(){
  if(window.__cartDrawerInit) return;
  window.__cartDrawerInit = true;

  var CART_STORAGE_KEY = 'cartItems';
  var cartItems = [];

  function injectCartMarkup(){
    if(document.getElementById('cartDrawer')) return;

    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div class="cart-overlay" id="cartOverlay" aria-hidden="true"></div>',
      '<aside class="cart-drawer" id="cartDrawer" aria-hidden="true" aria-label="Panier">',
      '  <div class="cart-head">',
      '    <div class="cart-head-left">',
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
      '      <h2>Votre panier</h2>',
      '    </div>',
      '    <button class="cart-drawer-close" type="button" id="cartCloseBtn" aria-label="Fermer le panier">',
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
      '    </button>',
      '  </div>',
      '  <div class="cart-body">',
      '    <div id="cartFilled" hidden>',
      '      <div class="col-headers"><span>Produits</span><span>Total</span></div>',
      '      <div class="col-rules"><span></span><span></span></div>',
      '      <div id="itemsList"></div>',
      '    </div>',
      '    <div class="cart-empty" id="cartEmpty">',
      '      <p class="cart-empty-msg">Votre panier est vide</p>',
      '      <button type="button" class="cart-continue-btn" id="cartContinueBtn">Continuer vos achats</button>',
      '      <p class="cart-login">Vous avez un compte ? <a href="/signin?tab=login">Connectez-vous</a> pour payer plus rapidement.</p>',
      '      <div class="cart-featured">',
      '        <img src="https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782123143/Design_sans_titre_13_qzliwu.png" alt="Jouet camion benne CAT">',
      '      </div>',
      '      <a href="/shop-by-age-products-page" class="cart-shop-age" id="cartShopAge">Acheter par âge →</a>',
      '    </div>',
      '  </div>',
      '  <div class="cart-foot" id="cartFoot" hidden>',
      '    <div class="cart-total-row"><span>Total estimé</span><span id="estimatedTotal">0 DZD</span></div>',
      '    <button type="button" class="checkout-btn" id="checkoutBtn">Payer</button>',
      '  </div>',
      '</aside>'
    ].join('');
    while(wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  function ensureCartNavBtn(){
    var btn = document.getElementById('cartOpenBtn');
    if(!btn){
      btn = document.querySelector('button[aria-label="Panier"], a[aria-label="Panier"]');
      if(btn){
        btn.id = 'cartOpenBtn';
        if(btn.tagName === 'A'){
          var replacement = document.createElement('button');
          replacement.type = 'button';
          replacement.className = btn.className + ' cart-nav-btn';
          replacement.id = 'cartOpenBtn';
          replacement.setAttribute('aria-label', 'Panier');
          replacement.innerHTML = btn.innerHTML;
          btn.replaceWith(replacement);
          btn = replacement;
        } else {
          btn.classList.add('cart-nav-btn');
        }
      }
    }
    if(btn && !document.getElementById('cartBadge')){
      var badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.id = 'cartBadge';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = '0';
      btn.appendChild(badge);
    }
    return btn;
  }

  function loadCart(){
    try{
      var stored = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY));
      cartItems = Array.isArray(stored) ? stored : [];
    }catch(e){
      cartItems = [];
    }
  }

  function saveCart(){
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }

  function formatMoney(n){
    var num = Number(n);
    if (!isFinite(num)) num = 0;
    return Math.round(num).toLocaleString('fr-DZ') + ' DZD';
  }

  function parsePrice(text){
    var cleaned = String(text || '')
      .replace(/\s/g, '')
      .replace(/DZD/gi, '')
      .replace(/[^0-9.,]/g, '')
      .replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  function cartLineKey(item){
    var base = item.productId || item.id || item.title || '';
    var hex = item.selectedColor && item.selectedColor.hex ? item.selectedColor.hex : '';
    return String(base) + '::' + hex;
  }

  function colorLabel(color){
    if(!color || !color.hex) return '';
    return color.name ? (color.name + ' (' + color.hex + ')') : color.hex;
  }

  function getProductFromCard(card){
    var titleEl = card.querySelector('.product-title, .title');
    var priceEl = card.querySelector('.price, .product-price');
    var thumbEl = card.querySelector('.img-wrap, .product-image, .cover, .product-cover');
    var title = titleEl ? titleEl.textContent.trim() : 'Produit';
    var price = parsePrice(priceEl ? priceEl.textContent : '0');
    var productId = card.dataset.productId || '';
    var thumb = '';
    var img = '';
    if(thumbEl){
      var imgEl = thumbEl.querySelector('img');
      if(imgEl && imgEl.src) img = imgEl.src;
      thumb = thumbEl.innerHTML.trim() || thumbEl.textContent.trim();
    }
    return {
      id: productId || title,
      productId: productId || undefined,
      title: title,
      price: price,
      qty: 1,
      thumb: thumb,
      img: img,
      hasMultipleColors: card.dataset.hasColors === 'true'
    };
  }

  function getProductFromPdp(){
    var product = window.__AJB_CURRENT_PRODUCT__ || {};
    var params = new URLSearchParams(window.location.search || '');
    var productId = params.get('id') || product.id || product._id || '';
    var titleEl = document.getElementById('productTitle') || document.querySelector('.page .title, .page h1.title');
    var priceEl = document.getElementById('productPrice') || document.querySelector('.page .price');
    var thumbEl = document.querySelector('.gallery .slide img, #slides .slide img, .gallery .slide.active, .gallery .slide, .gallery-main');
    var title = titleEl ? titleEl.textContent.trim() : 'Produit';
    var price = parsePrice(priceEl ? priceEl.textContent : '0');
    var thumb = '';
    var img = '';
    if(thumbEl){
      if(thumbEl.tagName === 'IMG' && thumbEl.src) img = thumbEl.src;
      else {
        var nestedImg = thumbEl.querySelector('img');
        if(nestedImg && nestedImg.src) img = nestedImg.src;
        thumb = thumbEl.innerHTML.trim();
      }
    }
    return {
      id: productId || title,
      productId: productId || undefined,
      title: title,
      price: price,
      qty: 1,
      thumb: thumb,
      img: img,
      hasMultipleColors: Boolean(product.hasMultipleColors && Array.isArray(product.colors) && product.colors.length),
      selectedColor: typeof window.getSelectedProductColor === 'function' ? window.getSelectedProductColor() : (window.__AJB_SELECTED_COLOR__ || null)
    };
  }

  function updateCartBadge(count){
    var cartBadge = document.getElementById('cartBadge');
    if(!cartBadge) return;
    cartBadge.textContent = count;
    cartBadge.classList.toggle('is-visible', count > 0);
    cartBadge.setAttribute('aria-hidden', count > 0 ? 'false' : 'true');
  }

  function buildCartItemEl(item){
    var row = document.createElement('div');
    row.className = 'cart-item';
    row.dataset.id = cartLineKey(item);
    row.dataset.price = item.price;
    var colorHtml = item.selectedColor && item.selectedColor.hex
      ? '<p class="cart-item-color"><span class="cart-item-color-dot" style="background:' + item.selectedColor.hex + '"></span><span>' + colorLabel(item.selectedColor) + '</span></p>'
      : '';
    row.innerHTML = [
      '<div class="thumb"></div>',
      '<div class="article-info">',
      '  <p class="item-title"></p>',
      colorHtml,
      '  <p class="article-price"></p>',
      '  <div class="qty-row">',
      '    <div class="qty-pill">',
      '      <button type="button" class="qty-minus" aria-label="Diminuer la quantité">−</button>',
      '      <span class="qty-val">' + item.qty + '</span>',
      '      <button type="button" class="qty-plus" aria-label="Augmenter la quantité">+</button>',
      '    </div>',
      '    <button type="button" class="delete-btn" aria-label="Supprimer l\'article">',
      '      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
      '    </button>',
      '  </div>',
      '</div>',
      '<div class="item-total">' + formatMoney(item.price * item.qty) + '</div>'
    ].join('');
    var thumb = row.querySelector('.thumb');
    var titleEl = row.querySelector('.item-title');
    var priceEl = row.querySelector('.article-price');
    if(thumb) thumb.innerHTML = item.thumb;
    if(titleEl) titleEl.textContent = item.title;
    if(priceEl) priceEl.textContent = formatMoney(item.price);
    return row;
  }

  function recalcCart(){
    var total = 0;
    var count = 0;
    cartItems.forEach(function(item){
      total += item.price * item.qty;
      count += item.qty;
    });
    var estimatedTotalEl = document.getElementById('estimatedTotal');
    if(estimatedTotalEl) estimatedTotalEl.textContent = formatMoney(total);
    updateCartBadge(count);
    return total;
  }

  function renderCart(){
    var cartFilled = document.getElementById('cartFilled');
    var cartEmpty = document.getElementById('cartEmpty');
    var cartFoot = document.getElementById('cartFoot');
    var itemsList = document.getElementById('itemsList');
    if(!itemsList) return;

    var hasItems = cartItems.length > 0;
    if(cartFilled) cartFilled.hidden = !hasItems;
    if(cartFoot) cartFoot.hidden = !hasItems;
    if(cartEmpty) cartEmpty.style.display = hasItems ? 'none' : 'flex';

    itemsList.innerHTML = '';
    cartItems.forEach(function(item){
      itemsList.appendChild(buildCartItemEl(item));
    });
    recalcCart();
    saveCart();
  }

  function openCart(){
    var cartOverlay = document.getElementById('cartOverlay');
    var cartDrawer = document.getElementById('cartDrawer');
    if(!cartDrawer) return;
    if(typeof window.closeSearch === 'function') window.closeSearch();
    else {
      var mainNav = document.getElementById('mainNav');
      var searchClose = document.getElementById('searchCloseBtn');
      if(mainNav && searchClose && mainNav.classList.contains('is-search-active')) searchClose.click();
    }
    if(typeof window.closeMenu === 'function') window.closeMenu();
    if(cartOverlay){
      cartOverlay.classList.add('is-open');
      cartOverlay.setAttribute('aria-hidden', 'false');
    }
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open');
  }

  function closeCart(){
    var cartOverlay = document.getElementById('cartOverlay');
    var cartDrawer = document.getElementById('cartDrawer');
    if(!cartDrawer) return;
    if(cartOverlay){
      cartOverlay.classList.remove('is-open');
      cartOverlay.setAttribute('aria-hidden', 'true');
    }
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open');
  }

  function addToCart(product){
    if(product.hasMultipleColors && (!product.selectedColor || !product.selectedColor.hex)){
      alert('Veuillez choisir une couleur avant d\'ajouter au panier.');
      return;
    }
    var lineKey = cartLineKey(product);
    product.id = lineKey;
    var existing = cartItems.find(function(item){
      return cartLineKey(item) === lineKey;
    });
    if(existing) existing.qty += 1;
    else cartItems.push(Object.assign({}, product));
    renderCart();
    openCart();
  }

  function bindCartUi(){
    var cartOpenBtn = ensureCartNavBtn();
    var cartCloseBtn = document.getElementById('cartCloseBtn');
    var cartOverlay = document.getElementById('cartOverlay');
    var cartContinueBtn = document.getElementById('cartContinueBtn');
    var cartShopAge = document.getElementById('cartShopAge');
    var itemsList = document.getElementById('itemsList');
    var checkoutBtn = document.getElementById('checkoutBtn');

    if(cartOpenBtn && !cartOpenBtn.dataset.cartBound){
      cartOpenBtn.dataset.cartBound = '1';
      cartOpenBtn.addEventListener('click', openCart);
    }
    if(cartCloseBtn && !cartCloseBtn.dataset.cartBound){
      cartCloseBtn.dataset.cartBound = '1';
      cartCloseBtn.addEventListener('click', closeCart);
    }
    if(cartOverlay && !cartOverlay.dataset.cartBound){
      cartOverlay.dataset.cartBound = '1';
      cartOverlay.addEventListener('click', closeCart);
    }
    if(cartContinueBtn && !cartContinueBtn.dataset.cartBound){
      cartContinueBtn.dataset.cartBound = '1';
      cartContinueBtn.addEventListener('click', closeCart);
    }
    if(cartShopAge && !cartShopAge.dataset.cartBound){
      cartShopAge.dataset.cartBound = '1';
      cartShopAge.addEventListener('click', closeCart);
    }
    if(checkoutBtn && !checkoutBtn.dataset.cartBound){
      checkoutBtn.dataset.cartBound = '1';
      checkoutBtn.addEventListener('click', function(){
        var total = recalcCart();
        sessionStorage.setItem('cartTotal', total);
        sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        window.location.href = '/checkout-page';
      });
    }
    if(itemsList && !itemsList.dataset.cartBound){
      itemsList.dataset.cartBound = '1';
      itemsList.addEventListener('click', function(e){
        var row = e.target.closest('.cart-item');
        if(!row) return;
        var id = row.dataset.id;
        var item = cartItems.find(function(i){ return cartLineKey(i) === id; });
        if(!item) return;
        if(e.target.closest('.qty-plus')){
          item.qty += 1;
          renderCart();
        }
        if(e.target.closest('.qty-minus') && item.qty > 1){
          item.qty -= 1;
          renderCart();
        }
        if(e.target.closest('.delete-btn')){
          cartItems = cartItems.filter(function(i){ return cartLineKey(i) !== id; });
          renderCart();
        }
      });
    }
  }

  function showAddedFeedback(btn){
    var original = btn.textContent;
    btn.textContent = 'Ajouté ✓';
    setTimeout(function(){ btn.textContent = original; }, 1200);
  }

  function handleAddClick(e){
    var btn = e.target.closest('.add-cart-btn, .add-to-cart');
    if(btn){
      var card = btn.closest('.product-card');
      if(card){
        e.preventDefault();
        if(card.dataset.hasColors === 'true' && card.dataset.productId){
          window.location.href = '/product-detail-page-mega-bloks?id=' + encodeURIComponent(card.dataset.productId);
          return;
        }
        addToCart(getProductFromCard(card));
        showAddedFeedback(btn);
        return;
      }
    }

    var cta = e.target.closest('.page .cta, #productAddBtn');
    if(cta){
      e.preventDefault();
      addToCart(getProductFromPdp());
      showAddedFeedback(cta);
    }
  }

  function boot(){
    injectCartMarkup();
    bindCartUi();
    loadCart();
    renderCart();

    if(!document.body.dataset.cartClickBound){
      document.body.dataset.cartClickBound = '1';
      document.addEventListener('click', handleAddClick);
    }

    if(!document.body.dataset.cartKeyBound){
      document.body.dataset.cartKeyBound = '1';
      document.addEventListener('keydown', function(e){
        if(e.key === 'Escape'){
          var cartDrawer = document.getElementById('cartDrawer');
          if(cartDrawer && cartDrawer.classList.contains('is-open')) closeCart();
        }
      });
    }
  }

  window.CartDrawer = {
    bind: function () {
      injectCartMarkup();
      bindCartUi();
      loadCart();
      renderCart();
    },
    open: openCart,
    close: closeCart,
    add: addToCart
  };

  window.openCart = openCart;
  window.closeCart = closeCart;
  window.addToCart = addToCart;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
