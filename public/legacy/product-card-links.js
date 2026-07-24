(function(){
  var PDP = '/product-detail-page-mega-bloks';

  function esc(text){
    var d = document.createElement('div');
    d.textContent = text == null ? '' : String(text);
    return d.innerHTML;
  }

  function formatPriceDzd(price){
    var num = Number(price);
    if(!Number.isFinite(num)) return '—';
    return num.toLocaleString('fr-DZ') + ' DZD';
  }

  function parsePrice(text){
    if(!text) return '';
    var t = text.trim();
    if(t === '$—' || t === '$-' || t === '—') return '—';
    return t.replace(/^\$/, '').trim();
  }

  function parseNonte(text){
    if(!text) return {};
    var m = text.trim().match(/([\d.]+)\s*\((\d+)\)/);
    if(m) return { rating: m[1], reviews: m[2] };
    return {};
  }

  function getProductData(card){
    var titleEl = card.querySelector('.product-title');
    var priceEl = card.querySelector('.price, .product-price');
    var ratingEl = card.querySelector('.rating-num, .rating-text');
    var ratingWrap = card.querySelector('.rating-row > div, .rating');

    var title = titleEl ? titleEl.textContent.trim() : '';
    var price = priceEl ? parsePrice(priceEl.textContent) : '';
    var ratingText = '';

    if(ratingEl){
      ratingText = ratingEl.textContent;
    } else if(ratingWrap){
      ratingText = ratingWrap.textContent;
    }

    var parsed = parseNonte(ratingText);
    if(!parsed.reviews && ratingText){
      var rev = ratingText.match(/\((\d+)\)/);
      if(rev) parsed.reviews = rev[1];
    }
    if(!parsed.rating){
      var starEl = card.querySelector('.rating .stars, .rating-row .stars');
      if(starEl){
        var count = (starEl.textContent.match(/★/g) || []).length;
        if(count) parsed.rating = String(count);
      }
    }
    return {
      title: title,
      price: price,
      rating: parsed.rating || '',
      reviews: parsed.reviews !== undefined ? parsed.reviews : ''
    };
  }

  function buildPdpUrl(data){
    var params = new URLSearchParams();
    if(data.title) params.set('title', data.title);
    if(data.price) params.set('price', data.price);
    if(data.rating) params.set('rating', data.rating);
    if(data.reviews !== '') params.set('reviews', data.reviews);
    var qs = params.toString();
    return qs ? PDP + '?' + qs : PDP;
  }

  function goToProduct(card){
    var id = card.dataset.productId;
    if(id){
      window.location.href = PDP + '?id=' + encodeURIComponent(id);
      return;
    }
    window.location.href = buildPdpUrl(getProductData(card));
  }

  function initCard(card){
    if(card.dataset.pdpBound === '1') return;
    card.dataset.pdpBound = '1';
    card.style.cursor = 'pointer';
    if(!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('click', function(e){
      if(e.target.closest('button, a, input, label, select, textarea')) return;
      goToProduct(card);
    });
    card.addEventListener('keydown', function(e){
      if(e.key !== 'Enter' && e.key !== ' ') return;
      if(e.target.closest('button, a, input, label, select, textarea')) return;
      e.preventDefault();
      goToProduct(card);
    });
  }

  function bindProductCards(root){
    var scope = root || document;
    scope.querySelectorAll('.product-card').forEach(initCard);
  }

  window.bindProductCards = bindProductCards;

  function normalizeLines(value){
    if(Array.isArray(value)){
      return value
        .flatMap(function(entry){ return String(entry || '').split(/\n+/); })
        .map(function(line){ return line.trim(); })
        .filter(Boolean);
    }
    if(typeof value === 'string' && value.trim()){
      return value.split(/\n+/).map(function(line){ return line.trim(); }).filter(Boolean);
    }
    return [];
  }

  function initDetailAccordions(){
    document.querySelectorAll('.accordions .accordion-article').forEach(function(article){
      var header = article.querySelector('.accordion-header');
      var content = article.querySelector('.accordion-content');
      if(!header || !content || header.dataset.accBound === '1') return;
      header.dataset.accBound = '1';
      header.addEventListener('click', function(){
        var isOpen = article.classList.toggle('open');
        content.style.maxHeight = isOpen ? (content.scrollHeight + 'px') : '0';
      });
    });
  }

  function initPdpAccordions(){
    document.querySelectorAll('.pdp-accordion-header').forEach(function(btn){
      if(btn.dataset.pdpAccBound === '1') return;
      btn.dataset.pdpAccBound = '1';
      btn.addEventListener('click', function(){
        var acc = document.getElementById(btn.dataset.target || '');
        if(!acc) return;
        acc.classList.toggle('open');
        var icon = btn.querySelector('.toggle');
        if(icon) icon.textContent = acc.classList.contains('open') ? '−' : '+';
      });
    });
  }

  function initPdpUi(){
    initDetailAccordions();
    initPdpAccordions();
  }

  function setAccordionContent(headerText, html){
    document.querySelectorAll('.accordions .accordion-article').forEach(function(item){
      var header = item.querySelector('.accordion-header');
      if(!header || header.textContent.indexOf(headerText) === -1) return;
      var content = item.querySelector('.accordion-content');
      if(content) content.innerHTML = html;
    });
  }

  function setAgeRow(product){
    var ageRow = document.querySelector('.age-row');
    if(!ageRow) return;
    var label = product.ageTranche || product.age || (product.age_plus != null ? product.age_plus + 'Y+' : '');
    if(label) ageRow.innerHTML = '<strong>TRANCHE D\'ÂGE : ' + esc(label) + '</strong>';
  }

  function getProductWarning(product){
    var warning = String(product && product.warning != null ? product.warning : '').trim();
    if(!warning) return '';
    var lowered = warning.toLowerCase();
    if(lowered === 'aucun avertissement applicable') return '';
    if(/^warning:\s*$/i.test(warning)) return '';
    return warning;
  }

  function setWarningVisibility(el, visible){
    if(!el) return;
    el.hidden = !visible;
    el.classList.toggle('is-visible', visible);
    el.style.display = visible ? '' : 'none';
  }

  function setWarningBlocks(product){
    var warningRowEl = document.querySelector('.warning-row');
    var warningEl = document.querySelector('.warning');
    var warning = getProductWarning(product);
    var visible = Boolean(warning);

    setWarningVisibility(warningRowEl, visible);
    setWarningVisibility(warningEl, visible);

    if(visible && warningRowEl){
      var warningRowText = warningRowEl.querySelector('span:last-child, span:not(.warn-icon)');
      if(warningRowText) warningRowText.textContent = warning;
    }

    if(visible && warningEl){
      var warningBlock = warningEl.querySelector('.warning-text');
      if(warningBlock){
        warningBlock.innerHTML =
          '<p class="label">AVERTISSEMENT :</p>' +
          '<p class="hazard">' + esc(warning) + '</p>';
      }
    }
  }

  function setWhyLoveIt(items){
    var section = document.getElementById('acc-love');
    var list = document.querySelector('#acc-love .check-list');
    if(!list) return;
    var points = normalizeLines(items);
    var prevDiv = section && section.previousElementSibling;

    if(!points.length){
      if(section) section.hidden = true;
      if(prevDiv && prevDiv.classList.contains('pdp-div')) prevDiv.hidden = true;
      return;
    }

    if(section) section.hidden = false;
    if(prevDiv && prevDiv.classList.contains('pdp-div')) prevDiv.hidden = false;

    var icon = '<svg viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
    list.innerHTML = points.map(function(item){
      return '<li>' + icon + esc(item) + '</li>';
    }).join('');
  }

  function setQaBlocks(qa){
    var content = document.querySelector('#acc-qa .pdp-accordion-content');
    if(!content || !Array.isArray(qa) || !qa.length) return;
    content.innerHTML = qa.map(function(item){
      return (
        '<div class="qa-card">' +
        '<div class="qa-q">' + esc(item.q) + '</div>' +
        '<div class="qa-a">' + esc(item.a) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function reinitPdpGallery(pictures){
    var slidesEl = document.getElementById('slides');
    var thumbsEl = document.getElementById('thumbs');
    var progressFill = document.getElementById('progressFill');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if(!slidesEl || !thumbsEl || !pictures || !pictures.length) return;

    slidesEl.innerHTML = pictures.map(function(src){
      return (
        '<div class="slide">' +
        '<img src="' + esc(src) + '" alt="" style="width:100%;height:100%;object-fit:contain;background:#fff;">' +
        '</div>'
      );
    }).join('');

    thumbsEl.innerHTML = '';
    var slides = Array.from(slidesEl.children);
    var current = 0;

    function goTo(index){
      current = (index + slides.length) % slides.length;
      slidesEl.style.transform = 'translateX(-' + (current * 100) + '%)';
      if(progressFill) progressFill.style.width = (((current + 1) / slides.length) * 100) + '%';
      Array.from(thumbsEl.children).forEach(function(btn, i){
        btn.classList.toggle('active', i === current);
      });
    }

    slides.forEach(function(slide, i){
      var img = slide.querySelector('img');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb' + (i === 0 ? ' active' : '');
      btn.innerHTML = img
        ? '<img src="' + esc(img.getAttribute('src')) + '" alt="" style="width:100%;height:100%;object-fit:cover;">'
        : '';
      btn.addEventListener('click', function(){ goTo(i); });
      thumbsEl.appendChild(btn);
    });

    if(prevBtn){
      prevBtn.onclick = function(){ goTo(current - 1); };
    }
    if(nextBtn){
      nextBtn.onclick = function(){ goTo(current + 1); };
    }

    goTo(0);
    window.__pdpGoTo = goTo;
  }

  function setBreadcrumb(product){
    var catEl = document.getElementById('breadcrumbCategory');
    var prodEl = document.getElementById('breadcrumbProduct');
    if(!catEl || !prodEl) return;

    var category = String(product.category || '').trim();
    if(!category && product.isBook) category = 'Livres';

    var catNorm = String(category).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    var catHref = '/shop-all-categories-page';
    if(product.isBook || catNorm.indexOf('livre') !== -1 || catNorm.indexOf('book') !== -1){
      catHref = '/books-page';
    } else if(catNorm.indexOf('exterieur') !== -1){
      catHref = '/outdoor-play';
    } else if(catNorm.indexOf('tendance') !== -1 || catNorm.indexOf('nouveau') !== -1){
      catHref = '/new-and-trending';
    } else if(catNorm.indexOf('cartoon') !== -1){
      catHref = '/cartoon-and-friends';
    } else if(catNorm.indexOf('gros') !== -1){
      catHref = '/gros-main';
    } else if(category){
      catHref = '/outdoor-play?category=' + encodeURIComponent(category);
    }

    catEl.textContent = category || 'Catégories';
    catEl.href = catHref;
    prodEl.textContent = product.name || 'Produit';
  }

  function waitForApi(maxMs){
    if(window.AJBApi && typeof window.AJBApi.whenReady === 'function'){
      return window.AJBApi.whenReady(maxMs);
    }
    return Promise.resolve(window.AJBApi || null);
  }

  function markPdpAwaiting(){
    var layout = document.querySelector('.pdp-layout');
    if(layout) layout.classList.add('pdp-awaiting-api');
  }

  function markPdpLoaded(){
    var layout = document.querySelector('.pdp-layout');
    if(layout){
      layout.classList.add('pdp-loaded');
      layout.classList.remove('pdp-awaiting-api');
    }
  }

  function normalizeHex(value){
    var raw = String(value || '').trim();
    var hex = raw.indexOf('#') === 0 ? raw : '#' + raw;
    return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : '';
  }

  function ensurePdpColorStyles(){
    if(document.getElementById('pdp-color-styles')) return;
    var style = document.createElement('style');
    style.id = 'pdp-color-styles';
    style.textContent = [
      '.pdp-color-picker{margin:0 18px 16px;}',
      '.pdp-color-label{margin:0 0 8px;font-size:14px;font-weight:700;color:#1a1a1a;}',
      '.pdp-color-swatches{display:flex;flex-wrap:wrap;gap:10px;}',
      '.pdp-color-swatch{width:34px;height:34px;border-radius:50%;border:2px solid #d9dce1;padding:0;cursor:pointer;box-shadow:inset 0 0 0 2px #fff;}',
      '.pdp-color-swatch.is-active{border-color:#004ebc;outline:2px solid #004ebc;outline-offset:2px;}',
      '.pdp-color-selected{margin:8px 0 0;font-size:13px;color:#5b6878;}',
      '.cart-item-color{display:flex;align-items:center;gap:8px;margin-top:4px;font-size:12px;color:#5b6878;}',
      '.cart-item-color-dot{width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,.12);flex-shrink:0;}'
    ].join('');
    document.head.appendChild(style);
  }

  function setColorPicker(product){
    ensurePdpColorStyles();
    window.__AJB_SELECTED_COLOR__ = null;

    var colors = Array.isArray(product.colors) ? product.colors.filter(function(c){
      return c && normalizeHex(c.hex);
    }) : [];
    var hasColors = Boolean(product.hasMultipleColors) && colors.length > 0;

    var picker = document.getElementById('pdpColorPicker');
    if(!picker){
      var priceEl = document.getElementById('productPrice') || document.querySelector('.pdp-details-col .price');
      if(!priceEl) return;
      picker = document.createElement('div');
      picker.id = 'pdpColorPicker';
      picker.className = 'pdp-color-picker';
      picker.innerHTML = '<p class="pdp-color-label">Couleur</p><div class="pdp-color-swatches" id="pdpColorSwatches"></div><p class="pdp-color-selected" id="pdpColorSelected"></p>';
      priceEl.insertAdjacentElement('afterend', picker);
    }

    var swatchesEl = document.getElementById('pdpColorSwatches');
    var selectedEl = document.getElementById('pdpColorSelected');
    if(!swatchesEl || !selectedEl) return;

    if(!hasColors){
      picker.hidden = true;
      swatchesEl.innerHTML = '';
      selectedEl.textContent = '';
      return;
    }

    picker.hidden = false;
    swatchesEl.innerHTML = colors.map(function(color, index){
      var hex = normalizeHex(color.hex);
      var label = color.name || hex;
      return '<button type="button" class="pdp-color-swatch' + (index === 0 ? ' is-active' : '') + '" data-color-hex="' + esc(hex) + '" data-color-name="' + esc(color.name || '') + '" style="background:' + esc(hex) + ';" aria-label="' + esc(label) + '"></button>';
    }).join('');

    function selectColor(btn){
      swatchesEl.querySelectorAll('.pdp-color-swatch').forEach(function(el){
        el.classList.toggle('is-active', el === btn);
      });
      var hex = normalizeHex(btn.dataset.colorHex);
      var name = (btn.dataset.colorName || '').trim();
      window.__AJB_SELECTED_COLOR__ = { hex: hex, name: name };
      selectedEl.textContent = name ? ('Couleur : ' + name + ' (' + hex + ')') : ('Couleur : ' + hex);
    }

    swatchesEl.querySelectorAll('.pdp-color-swatch').forEach(function(btn){
      btn.addEventListener('click', function(){ selectColor(btn); });
    });

    var first = swatchesEl.querySelector('.pdp-color-swatch');
    if(first) selectColor(first);
  }

  window.getSelectedProductColor = function(){
    return window.__AJB_SELECTED_COLOR__ || null;
  };

  function normalizeProduct(raw){
    if(!raw || typeof raw !== 'object') return null;
    var product = raw.product && typeof raw.product === 'object' ? raw.product : raw;
    if(!product.id && product._id) product.id = String(product._id);
    if(!product.id && !product._id && !product.name) return null;
    return product;
  }

  function consumeInitialProduct(){
    if(!isPdpPage()) return false;
    var initial = window.__AJB_INITIAL_PRODUCT__;
    if(!initial || window.__AJB_INITIAL_PRODUCT_USED__) return false;
    var product = normalizeProduct(initial);
    if(!product) return false;
    window.__AJB_INITIAL_PRODUCT_USED__ = 1;
    hydrateProductDetail(product);
    hideDefaultPdpWarnings();
    initPdpUi();
    return true;
  }

  function hydrateProductDetail(product){
    if(!product) return;
    window.__AJB_CURRENT_PRODUCT__ = product;

    var title = product.name || '';
    var price = product.price;
    var rating = Number(product.rating) || 0;
    var pictures = (product.pictures && product.pictures.length && product.pictures) ||
      (product.img && product.img.length && product.img) || [];

    var titleEl = document.getElementById('productTitle') || document.querySelector('.title');
    if(titleEl && title) titleEl.textContent = title;
    if(title) document.title = title + ' | AJ BLOKS';

    setBreadcrumb(product);

    var priceEl = document.getElementById('productPrice') || document.querySelector('.title + .price');
    if(priceEl) priceEl.textContent = formatPriceDzd(price);

    var countEl = document.querySelector('.rating .count');
    if(countEl) countEl.textContent = '(0)';

    var starsEl = document.getElementById('stars');
    if(starsEl){
      var filled = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5"/></svg>';
      var empty = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" stroke="#1a1a1a" stroke-width="1.5" fill="none"/></svg>';
      starsEl.innerHTML = '';
      var rounded = Math.round(Math.max(0, Math.min(5, rating)));
      for(var i = 0; i < 5; i++){
        starsEl.insertAdjacentHTML('beforeend', i < rounded ? filled : empty);
      }
    }

    if(pictures.length) reinitPdpGallery(pictures);

    if(product.description){
      var descHtml = String(product.description)
        .split(/\n{2,}|\n/)
        .filter(Boolean)
        .map(function(p){ return '<p>' + esc(p.trim()) + '</p>'; })
        .join('');
      setAccordionContent('Descriptif', descHtml);
    }

    if(product.characteristics){
      setAccordionContent('caractéristiques', '<p>' + esc(product.characteristics) + '</p>');
    }

    setAgeRow(product);
    setWarningBlocks(product || {});
    setWhyLoveIt(product.whyLoveIt);
    setQaBlocks(product.qa);
    setColorPicker(product);
    initPdpUi();
    markPdpLoaded();

    document.dispatchEvent(new CustomEvent('ajb:current-product', { detail: { product: product } }));
    if(window.PdpReviewForm && typeof window.PdpReviewForm.reload === 'function'){
      try { window.PdpReviewForm.reload(); } catch(e) {}
    }
  }

  function boot(){
    bindProductCards();
    if(isPdpPage()) initPdpUi();
    new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes.forEach(function(node){
          if(node.nodeType !== 1) return;
          if(node.classList && node.classList.contains('product-card')) initCard(node);
          if(node.querySelectorAll) node.querySelectorAll('.product-card').forEach(initCard);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var pdpLoadPromise = null;

  window.loadProductDetailFromQuery = async function(force){
    if(!isPdpPage()) return;
    if(!force && consumeInitialProduct()) return;

    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    if(!productId) return;

    if(!force && window.__AJB_CURRENT_PRODUCT__){
      var currentId = String(window.__AJB_CURRENT_PRODUCT__.id || window.__AJB_CURRENT_PRODUCT__._id || '');
      if(currentId && currentId === productId) return;
    }

    if(pdpLoadPromise && !force) return pdpLoadPromise;

    pdpLoadPromise = (async function(){
      markPdpAwaiting();
      var api = await waitForApi();
      if(!api){
        console.warn('Product detail: API client not ready');
        return;
      }
      try {
        var raw = await api.get('/product/' + encodeURIComponent(productId));
        var product = normalizeProduct(raw);
        if(product) hydrateProductDetail(product);
        else hideDefaultPdpWarnings();
      } catch(e) {
        console.warn('Product detail load failed', e);
        hideDefaultPdpWarnings();
      }
    })();

    try {
      await pdpLoadPromise;
    } finally {
      pdpLoadPromise = null;
    }
  };

  window.loadProductDetailFromQueryLegacy = async function(){
    var params = new URLSearchParams(window.location.search);
    var productId = params.get('id');
    if(productId) return;

    var title = params.get('title');
    var price = params.get('price');
    var rating = params.get('rating');
    var reviews = params.get('reviews');

    if(title){
      var titleEl = document.getElementById('productTitle') || document.querySelector('.title');
      if(titleEl) titleEl.textContent = title;
      document.title = title + ' | AJ BLOKS';
    }

    if(price){
      var priceEl = document.getElementById('productPrice') || document.querySelector('.title + .price');
      if(priceEl){
        if(price === '—'){
          priceEl.textContent = '—';
        } else {
          var num = parseFloat(price);
          priceEl.textContent = Number.isFinite(num) ? formatPriceDzd(num) : price;
        }
      }
    }

    var countEl = document.querySelector('.rating .count');
    if(countEl && reviews !== null && reviews !== ''){
      countEl.textContent = '(' + reviews + ')';
    }

    var starsEl = document.getElementById('stars');
    if(starsEl && rating){
      var r = Math.max(0, Math.min(5, parseFloat(rating)));
      if(!isNaN(r)){
        var filled = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5"/></svg>';
        var empty = '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" stroke="#1a1a1a" stroke-width="1.5" fill="none"/></svg>';
        starsEl.innerHTML = '';
        for(var i = 0; i < 5; i++){
          starsEl.insertAdjacentHTML('beforeend', i < Math.round(r) ? filled : empty);
        }
      }
    }
  };

  function isPdpPage(){
    return /product-detail-page-mega-bloks/.test(window.location.pathname || '');
  }

  function bootProductDetailFromUrl(){
    if(!isPdpPage()) return;
    hideDefaultPdpWarnings();
    initPdpUi();
    var params = new URLSearchParams(window.location.search || '');
    if(consumeInitialProduct()) return;
    if(params.get('id')) window.loadProductDetailFromQuery();
    else if(params.get('title')) window.loadProductDetailFromQueryLegacy();
    else if(window.__AJB_PDP_PRODUCT_ID__) markPdpAwaiting();
  }

  function hideDefaultPdpWarnings(){
    document.querySelectorAll('.warning-row, .warning').forEach(function(el){
      setWarningVisibility(el, false);
    });
  }

  window.bootProductDetailFromUrl = bootProductDetailFromUrl;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bootProductDetailFromUrl);
  } else {
    bootProductDetailFromUrl();
  }

  document.addEventListener('ajb:legacy-page-ready', bootProductDetailFromUrl);
  document.addEventListener('ajb:api-ready', function(){
    if(!isPdpPage()) return;
    var params = new URLSearchParams(window.location.search || '');
    if(params.get('id') && !window.__AJB_CURRENT_PRODUCT__) window.loadProductDetailFromQuery(true);
  });
  window.addEventListener('pageshow', bootProductDetailFromUrl);

  if(isPdpPage() && window.__AJB_INITIAL_PRODUCT__ && !window.__AJB_INITIAL_PRODUCT_USED__){
    consumeInitialProduct();
  }
})();
