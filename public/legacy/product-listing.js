(function () {
  var SORT_OPTIONS = [
    { value: 'bestselling', label: 'Meilleures ventes' },
    { value: 'az', label: 'Alphabétique, A-Z' },
    { value: 'za', label: 'Alphabétique, Z-A' },
    { value: 'lowhigh', label: 'Prix, croissant' },
    { value: 'highlow', label: 'Prix, décroissant' },
    { value: 'oldnew', label: 'Date, ancien au récent' },
    { value: 'newold', label: 'Date, récent à l\'ancien' }
  ];

  function isListingPage() {
    return !!document.getElementById('productGrid') && !!document.getElementById('filterDrawer');
  }

  function enhanceProductCard(card) {
    if (!card || card.dataset.listingEnhanced === '1') return;

    var info = card.querySelector('.product-info');
    var wishlist = card.querySelector('.wishlist-btn');
    var price = card.querySelector('.product-price, .price');
    var title = card.querySelector('.product-title');
    var ratingRow = card.querySelector('.rating-row');

    // Heart stays on the rating row (right); price stays under the product name
    if (wishlist && ratingRow && wishlist.parentNode !== ratingRow) {
      ratingRow.appendChild(wishlist);
    }
    if (price && info && title) {
      if (price.parentNode !== info || price.previousElementSibling !== title) {
        title.insertAdjacentElement('afterend', price);
      }
    }

    if (ratingRow && !ratingRow.querySelector('.rating-left')) {
      var left = document.createElement('div');
      left.className = 'rating-left';
      var nodes = Array.from(ratingRow.childNodes).filter(function (node) {
        if (node.nodeType !== 1) return true;
        return !node.classList.contains('wishlist-btn')
          && !node.classList.contains('product-price')
          && !node.classList.contains('price');
      });
      nodes.forEach(function (node) { left.appendChild(node); });
      if (left.childNodes.length) {
        ratingRow.insertBefore(left, ratingRow.firstChild);
      }
    }

    if (wishlist && ratingRow) {
      ratingRow.appendChild(wishlist);
    }

    card.dataset.listingEnhanced = '1';
  }

  function observeProductGrid() {
    var grid = document.getElementById('productGrid');
    if (!grid || grid.dataset.listingObserved === '1') return;

    grid.querySelectorAll('.product-card').forEach(enhanceProductCard);

    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () {
        grid.querySelectorAll('.product-card:not([data-listing-enhanced])').forEach(enhanceProductCard);
      }).observe(grid, { childList: true });
    }

    grid.dataset.listingObserved = '1';
  }

  function getActiveSortValue() {
    var checked = document.querySelector('input[data-group="sort"]:checked');
    return checked ? checked.value : 'bestselling';
  }

  function wireToolbarSort() {
    var toolbar = document.querySelector('.page .toolbar');
    if (!toolbar || toolbar.querySelector('.toolbar-sort-dropdown')) return;

    var wrap = document.createElement('div');
    wrap.className = 'toolbar-sort';

    var label = document.createElement('span');
    label.className = 'toolbar-sort-label';
    label.textContent = 'Trier par :';

    var dropdown = document.createElement('div');
    dropdown.className = 'toolbar-sort-dropdown';

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'toolbarSort';
    trigger.className = 'toolbar-sort-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    var menu = document.createElement('ul');
    menu.className = 'toolbar-sort-menu';
    menu.setAttribute('role', 'listbox');
    menu.hidden = true;

    var currentValue = getActiveSortValue();
    var currentLabel = SORT_OPTIONS[0].label;

    SORT_OPTIONS.forEach(function (opt) {
      var item = document.createElement('li');
      item.className = 'toolbar-sort-option';
      item.setAttribute('role', 'option');
      item.dataset.value = opt.value;
      item.textContent = opt.label;
      if (opt.value === currentValue) {
        item.setAttribute('aria-selected', 'true');
        item.classList.add('is-selected');
        currentLabel = opt.label;
      } else {
        item.setAttribute('aria-selected', 'false');
      }
      menu.appendChild(item);
    });

    trigger.textContent = currentLabel;

    function closeMenu() {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
    }

    function setSortValue(value) {
      var target = document.querySelector('input[data-group="sort"][value="' + value + '"]');
      if (!target) return;

      currentValue = value;
      document.querySelectorAll('input[data-group="sort"]').forEach(function (cb) {
        cb.checked = cb === target;
      });
      target.dispatchEvent(new Event('change', { bubbles: true }));

      menu.querySelectorAll('.toolbar-sort-option').forEach(function (item) {
        var selected = item.dataset.value === value;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
        if (selected) {
          trigger.textContent = item.textContent;
          currentLabel = item.textContent;
        }
      });
      closeMenu();
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    menu.addEventListener('click', function (e) {
      var option = e.target.closest('.toolbar-sort-option');
      if (!option) return;
      setSortValue(option.dataset.value);
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    document.querySelectorAll('input[data-group="sort"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (!cb.checked) return;
        currentValue = cb.value;
        menu.querySelectorAll('.toolbar-sort-option').forEach(function (item) {
          var selected = item.dataset.value === cb.value;
          item.classList.toggle('is-selected', selected);
          item.setAttribute('aria-selected', selected ? 'true' : 'false');
          if (selected) trigger.textContent = item.textContent;
        });
      });
    });

    dropdown.appendChild(trigger);
    dropdown.appendChild(menu);
    wrap.appendChild(label);
    wrap.appendChild(dropdown);
    toolbar.appendChild(wrap);
  }

  function isLaptopContent() {
    if (window.isLaptopContentWidth) return window.isLaptopContentWidth();
    var w = window.innerWidth;
    return (w >= 800 && w <= 1200) || w >= 1400;
  }

  function setupLaptopFilters() {
    if (!isLaptopContent()) return;

    var drawer = document.getElementById('filterDrawer');
    var overlay = document.getElementById('overlay');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
    if (drawer) {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
  }

  function getCheckedValues(group) {
    return Array.from(document.querySelectorAll('input[data-group="' + group + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function closeFilterDrawer() {
    var drawer = document.getElementById('filterDrawer');
    var overlay = document.getElementById('overlay');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (overlay) overlay.classList.remove('show');
    if (!isLaptopContent()) document.body.style.overflow = '';
  }

  function ensureDefaultSortChecked() {
    var sortInputs = document.querySelectorAll('#filterDrawer input[data-group="sort"], input[data-group="sort"]');
    if (!sortInputs.length) return null;

    var fallback = document.querySelector('input[data-group="sort"][value="bestselling"]')
      || sortInputs[0];
    var checked = document.querySelector('input[data-group="sort"]:checked');

    // Always keep a visible default: Meilleures ventes
    if (!checked && fallback) {
      sortInputs.forEach(function (cb) {
        cb.checked = false;
        cb.removeAttribute('checked');
      });
      fallback.checked = true;
      fallback.setAttribute('checked', 'checked');
      return fallback;
    }

    return checked || fallback;
  }

  function readDrawerFilters() {
    var sortInput = ensureDefaultSortChecked();
    var minRaw = document.getElementById('priceMin');
    var maxRaw = document.getElementById('priceMax');
    var min = minRaw && minRaw.value !== '' ? parseFloat(minRaw.value) : NaN;
    var max = maxRaw && maxRaw.value !== '' ? parseFloat(maxRaw.value) : NaN;
    return {
      categories: getCheckedValues('category'),
      ages: getCheckedValues('age'),
      brands: getCheckedValues('bret').concat(getCheckedValues('brand')),
      characters: getCheckedValues('character'),
      priceMin: Number.isFinite(min) ? min : undefined,
      priceMax: Number.isFinite(max) ? max : undefined,
      sort: sortInput ? sortInput.value : 'bestselling'
    };
  }

  function applyDrawerFilters() {
    if (typeof window.applyProductGridFilters === 'function') {
      window.applyProductGridFilters(readDrawerFilters());
      return true;
    }
    return false;
  }

  function clearDrawerFilters() {
    document.querySelectorAll('#filterDrawer input[type="checkbox"]').forEach(function (cb) {
      cb.checked = false;
      cb.removeAttribute('checked');
    });
    ensureDefaultSortChecked();
    var minEl = document.getElementById('priceMin');
    var maxEl = document.getElementById('priceMax');
    if (minEl) minEl.value = '';
    if (maxEl) maxEl.value = '';
    applyDrawerFilters();
  }

  function wireDrawerFilters() {
    var applyBtn = document.getElementById('applyFilters');
    var clearBtn = document.getElementById('clearFilters');
    if (!applyBtn && !clearBtn) return;
    if (document.documentElement.dataset.listingFiltersWired === '1') return;
    document.documentElement.dataset.listingFiltersWired = '1';

    // Keep drawer-footer outside drawer-body if markup is missing a closer
    var drawerBody = document.getElementById('drawerBody') || document.querySelector('#filterDrawer .drawer-body');
    var drawerFooter = document.querySelector('#filterDrawer .drawer-footer');
    var drawer = document.getElementById('filterDrawer');
    if (drawer && drawerBody && drawerFooter && drawerFooter.parentElement === drawerBody) {
      drawer.appendChild(drawerFooter);
    }

    ensureDefaultSortChecked();

    if (applyBtn) {
      applyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        applyDrawerFilters();
        if (!isLaptopContent()) closeFilterDrawer();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        clearDrawerFilters();
      });
    }

    document.querySelectorAll('input[data-group="sort"]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        if (cb.checked) {
          document.querySelectorAll('input[data-group="sort"]').forEach(function (other) {
            if (other !== cb) other.checked = false;
          });
        } else if (!document.querySelector('input[data-group="sort"]:checked')) {
          ensureDefaultSortChecked();
        }
        applyDrawerFilters();
      });
    });

    // Re-apply once API products arrive
    document.addEventListener('ajb:products-loaded', function () {
      applyDrawerFilters();
    });
  }

  function init() {
    if (!isListingPage()) return;
    observeProductGrid();
    wireToolbarSort();
    wireDrawerFilters();
    setupLaptopFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', function () {
    if (isListingPage()) setupLaptopFilters();
  });
})();
