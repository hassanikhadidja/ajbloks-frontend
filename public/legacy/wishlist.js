(function () {
  if (window.__wishlistInit) return;
  window.__wishlistInit = true;

  var WISHLIST_ITEMS_KEY = "ajbloks-wishlist-items";
  var WISHLIST_NAMES_KEY = "ajbloks-wishlists";
  var MAIN_LIST_ID = "main";
  var MAIN_LIST_LABEL = "Ma liste de souhaits";

  var pendingProduct = null;
  var pendingBtn = null;

  function parsePrice(text) {
    return parseFloat(String(text || "").replace(/[^0-9.]/g, "")) || 0;
  }

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getItems() {
    try {
      var stored = JSON.parse(localStorage.getItem(WISHLIST_ITEMS_KEY) || "[]");
      if (!Array.isArray(stored)) return [];
      return stored.map(function (item) {
        if (!item.listId) item.listId = MAIN_LIST_ID;
        return item;
      });
    } catch (e) {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(WISHLIST_ITEMS_KEY, JSON.stringify(items));
    document.dispatchEvent(
      new CustomEvent("ajb:wishlist-updated", { detail: { items: items } })
    );
  }

  function getNamedLists() {
    try {
      var stored = JSON.parse(localStorage.getItem(WISHLIST_NAMES_KEY) || "[]");
      return Array.isArray(stored)
        ? stored.filter(function (n) {
            return String(n || "").trim();
          })
        : [];
    } catch (e) {
      return [];
    }
  }

  function saveNamedLists(lists) {
    localStorage.setItem(WISHLIST_NAMES_KEY, JSON.stringify(lists));
    document.dispatchEvent(
      new CustomEvent("ajb:wishlist-updated", { detail: { items: getItems() } })
    );
  }

  function renameNamedList(oldName, newName) {
    var next = String(newName || "").trim();
    if (!next || next === oldName) return false;
    if (next === MAIN_LIST_LABEL || next === MAIN_LIST_ID) return false;

    var lists = getNamedLists();
    if (lists.indexOf(next) !== -1 && next !== oldName) return false;

    lists = lists.map(function (name) {
      return name === oldName ? next : name;
    });
    saveNamedLists(lists);

    var items = getItems().map(function (item) {
      if (item.listId === oldName) item.listId = next;
      return item;
    });
    saveItems(items);
    return true;
  }

  function deleteNamedList(name) {
    var lists = getNamedLists().filter(function (n) {
      return n !== name;
    });
    saveNamedLists(lists);
    var items = getItems().filter(function (item) {
      return item.listId !== name;
    });
    saveItems(items);
    return true;
  }

  function itemKey(item) {
    return String(item.productId || item.id || item.title || "");
  }

  function isWished(productId) {
    var key = String(productId || "");
    if (!key) return false;
    return getItems().some(function (item) {
      return itemKey(item) === key;
    });
  }

  function isInList(productId, listId) {
    var key = String(productId || "");
    return getItems().some(function (item) {
      return itemKey(item) === key && item.listId === listId;
    });
  }

  function getProductFromCard(card) {
    var titleEl = card.querySelector(".product-title, .title");
    var priceEl = card.querySelector(".price, .product-price");
    var thumbEl = card.querySelector(
      ".img-wrap, .product-image, .cover, .product-cover"
    );
    var title = titleEl ? titleEl.textContent.trim() : "Produit";
    var price = parsePrice(priceEl ? priceEl.textContent : "0");
    var productId = card.dataset.productId || "";
    var img = "";
    if (thumbEl) {
      var imgEl = thumbEl.querySelector("img");
      if (imgEl && imgEl.src) img = imgEl.src;
    }
    return {
      id: productId || title,
      productId: productId || undefined,
      title: title,
      price: price,
      img: img,
      addedAt: Date.now(),
    };
  }

  function getProductFromPdp() {
    var product = window.__AJB_CURRENT_PRODUCT__ || {};
    var params = new URLSearchParams(window.location.search || "");
    var productId =
      params.get("id") || product.id || product._id || "";
    var titleEl =
      document.getElementById("productTitle") ||
      document.querySelector(".page .title, .page h1.title, .pdp-details-col .title");
    var priceEl =
      document.getElementById("productPrice") ||
      document.querySelector(".page .price, .pdp-details-col .price");
    var imgEl = document.querySelector(
      ".gallery .slide img, #slides .slide img, .gallery .slide.active img, .pdp-gallery-col img"
    );
    return {
      id: productId || (titleEl ? titleEl.textContent.trim() : "Produit"),
      productId: productId || undefined,
      title: titleEl ? titleEl.textContent.trim() : product.name || "Produit",
      price: parsePrice(
        priceEl
          ? priceEl.textContent
          : product.price != null
            ? String(product.price)
            : "0"
      ),
      img: imgEl && imgEl.src ? imgEl.src : (product.pictures && product.pictures[0]) || "",
      addedAt: Date.now(),
    };
  }

  function getProductFromButton(btn) {
    var card = btn.closest(".product-card");
    if (card) return getProductFromCard(card);
    if (btn.id === "heartBtn" || btn.classList.contains("heart-btn")) {
      return getProductFromPdp();
    }
    return null;
  }

  function setButtonState(btn, active) {
    if (!btn) return;
    btn.classList.toggle("active", active);
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      active ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"
    );
  }

  function syncButtons(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll(".wishlist-btn, .heart-btn, #heartBtn").forEach(function (btn) {
      var product = getProductFromButton(btn);
      var id = product ? itemKey(product) : btn.dataset.productId || "";
      setButtonState(btn, isWished(id));
    });
  }

  function addToList(product, listId) {
    var key = itemKey(product);
    if (!key) return false;
    var items = getItems().filter(function (item) {
      return !(itemKey(item) === key && item.listId === listId);
    });
    var entry = Object.assign({}, product, {
      listId: listId || MAIN_LIST_ID,
      addedAt: Date.now(),
    });
    items.unshift(entry);
    saveItems(items);
    return true;
  }

  function removeFromList(productId, listId) {
    var key = String(productId || "");
    var items = getItems().filter(function (item) {
      if (itemKey(item) !== key) return true;
      if (listId) return item.listId !== listId;
      return false;
    });
    saveItems(items);
  }

  function removeProduct(productId) {
    removeFromList(productId, null);
  }

  function formatPrice(price) {
    var num = Number(price);
    if (!Number.isFinite(num)) num = 0;
    return Math.round(num) + " DZD";
  }

  function ensurePicker() {
    if (document.getElementById("wishPickOverlay")) return;

    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="wish-pick-overlay" id="wishPickOverlay" aria-hidden="true"></div>' +
      '<aside class="wish-pick-panel" id="wishPickPanel" role="dialog" aria-modal="true" aria-labelledby="wishPickTitle" aria-hidden="true">' +
      '  <div class="wish-pick-head">' +
      '    <h2 id="wishPickTitle">Ajouter à une liste</h2>' +
      '    <button type="button" class="wish-pick-close" id="wishPickClose" aria-label="Fermer">' +
      '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "    </button>" +
      "  </div>" +
      '  <p class="wish-pick-sub">Choisissez une liste pour ce produit</p>' +
      '  <div class="wish-pick-lists" id="wishPickLists"></div>' +
      "</aside>";

    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    if (!document.getElementById("wishPickStyles")) {
      var style = document.createElement("style");
      style.id = "wishPickStyles";
      style.textContent =
        ".wish-pick-overlay{position:fixed;inset:0;background:rgba(17,33,74,.45);z-index:1300;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s}" +
        ".wish-pick-overlay.is-open{opacity:1;visibility:visible}" +
        ".wish-pick-panel{position:fixed;left:0;right:0;bottom:0;z-index:1301;background:#fff;border-radius:20px 20px 0 0;padding:18px 20px calc(20px + env(safe-area-inset-bottom));transform:translateY(110%);transition:transform .28s cubic-bezier(.4,0,.2,1);max-height:min(70vh,520px);overflow:auto;box-shadow:0 -8px 32px rgba(15,20,60,.18)}" +
        ".wish-pick-panel.is-open{transform:translateY(0)}" +
        "body.wish-pick-open{overflow:hidden}" +
        ".wish-pick-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px}" +
        ".wish-pick-head h2{margin:0;font-size:1.15rem;font-weight:800;color:#11214A}" +
        ".wish-pick-close{width:40px;height:40px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#11214A}" +
        ".wish-pick-close svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}" +
        ".wish-pick-sub{margin:0 0 14px;color:#5B6685;font-size:.92rem}" +
        ".wish-pick-lists{display:flex;flex-direction:column;gap:8px}" +
        ".wish-pick-option{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:14px 16px;border:1.5px solid #E4E7F2;border-radius:14px;background:#fff;font:inherit;font-weight:700;color:#11214A;cursor:pointer;text-align:left}" +
        ".wish-pick-option:hover,.wish-pick-option:focus-visible{border-color:#004ebc;background:#F3F6FF}" +
        ".wish-pick-option.is-selected{border-color:#004ebc;background:#E7EBFB}" +
        ".wish-pick-option-label{flex:1}" +
        ".wish-pick-option-check{width:22px;height:22px;border-radius:50%;border:2px solid #C5CBD8;flex:0 0 auto}" +
        ".wish-pick-option.is-selected .wish-pick-option-check{background:#004ebc;border-color:#004ebc;box-shadow:inset 0 0 0 3px #fff}";
      document.head.appendChild(style);
    }

    document.getElementById("wishPickClose").addEventListener("click", closePicker);
    document.getElementById("wishPickOverlay").addEventListener("click", closePicker);
  }

  function openPicker(product, btn) {
    ensurePicker();
    pendingProduct = product;
    pendingBtn = btn;

    var named = getNamedLists();
    var listsEl = document.getElementById("wishPickLists");
    var options = [{ id: MAIN_LIST_ID, label: MAIN_LIST_LABEL }].concat(
      named.map(function (name) {
        return { id: name, label: name };
      })
    );

    listsEl.innerHTML = options
      .map(function (opt) {
        var selected = isInList(itemKey(product), opt.id);
        return (
          '<button type="button" class="wish-pick-option' +
          (selected ? " is-selected" : "") +
          '" data-wish-list="' +
          esc(opt.id) +
          '">' +
          '<span class="wish-pick-option-label">' +
          esc(opt.label) +
          "</span>" +
          '<span class="wish-pick-option-check" aria-hidden="true"></span>' +
          "</button>"
        );
      })
      .join("");

    document.getElementById("wishPickOverlay").classList.add("is-open");
    document.getElementById("wishPickPanel").classList.add("is-open");
    document.getElementById("wishPickOverlay").setAttribute("aria-hidden", "false");
    document.getElementById("wishPickPanel").setAttribute("aria-hidden", "false");
    document.body.classList.add("wish-pick-open");
  }

  function closePicker() {
    pendingProduct = null;
    pendingBtn = null;
    var overlay = document.getElementById("wishPickOverlay");
    var panel = document.getElementById("wishPickPanel");
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (panel) {
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("wish-pick-open");
  }

  function buildProductRow(item) {
    var row = document.createElement("article");
    row.className = "wish-product-row";
    row.dataset.productId = itemKey(item);
    row.dataset.listId = item.listId || MAIN_LIST_ID;

    var href = item.productId
      ? "/product-detail-page-mega-bloks?id=" + encodeURIComponent(item.productId)
      : "/shop-all-categories-page";

    var imgHtml = item.img
      ? '<img src="' + esc(item.img) + '" alt="">'
      : '<div class="wish-product-placeholder" aria-hidden="true">📦</div>';

    row.innerHTML =
      '<a class="wish-product-media" href="' +
      href +
      '">' +
      imgHtml +
      "</a>" +
      '<div class="wish-product-info">' +
      '<a class="wish-product-title" href="' +
      href +
      '">' +
      esc(item.title || "Produit") +
      "</a>" +
      '<p class="wish-product-price">' +
      formatPrice(item.price) +
      "</p>" +
      "</div>" +
      '<button type="button" class="wish-product-remove" aria-label="Retirer de la liste" data-wish-remove="' +
      esc(itemKey(item)) +
      '" data-wish-list="' +
      esc(item.listId || MAIN_LIST_ID) +
      '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      "</button>";

    return row;
  }

  function renderListSection(container, listId, label, items) {
    var section = document.createElement("div");
    section.className = "wish-list-group";
    section.dataset.listId = listId;
    var isMain = listId === MAIN_LIST_ID;

    var top = document.createElement("div");
    top.className = "wish-list-group-top";

    var head = document.createElement("button");
    head.type = "button";
    head.className = "wish-list-group-head";
    head.setAttribute("aria-expanded", "true");
    head.innerHTML =
      '<h3 class="wish-list-group-title">' +
      esc(label) +
      "</h3>" +
      '<span class="wish-list-group-rule" aria-hidden="true"></span>' +
      '<i class="fa-solid fa-chevron-up chev" aria-hidden="true"></i>';
    top.appendChild(head);

    if (!isMain) {
      var actions = document.createElement("div");
      actions.className = "wish-list-group-actions";
      actions.innerHTML =
        '<button type="button" class="wish-list-group-action" data-wish-rename="' +
        esc(listId) +
        '" aria-label="Modifier le nom de la liste" title="Modifier">' +
        '<i class="fa-solid fa-pen" aria-hidden="true"></i>' +
        "</button>" +
        '<button type="button" class="wish-list-group-action is-danger" data-wish-delete-list="' +
        esc(listId) +
        '" aria-label="Supprimer la liste" title="Supprimer">' +
        '<i class="fa-solid fa-trash" aria-hidden="true"></i>' +
        "</button>";
      top.appendChild(actions);
    }

    section.appendChild(top);

    var body = document.createElement("div");
    body.className = "wish-list-group-body";

    var listItems = items.filter(function (item) {
      return (item.listId || MAIN_LIST_ID) === listId;
    });

    if (!listItems.length) {
      var empty = document.createElement("p");
      empty.className = "wish-list-group-empty";
      empty.textContent = "Aucun produit dans cette liste.";
      body.appendChild(empty);
    } else {
      listItems.forEach(function (item) {
        body.appendChild(buildProductRow(item));
      });
    }

    section.appendChild(body);
    container.appendChild(section);
  }

  function renderWishlistPage() {
    var productsEl = document.getElementById("wishProducts");
    if (!productsEl) return;

    var emptyEl = document.getElementById("wishEmpty");
    var items = getItems();
    var named = getNamedLists();

    if (emptyEl) {
      var hideEmpty = items.length > 0 || named.length > 0;
      emptyEl.style.display = hideEmpty ? "none" : "block";
      if (!hideEmpty) {
        emptyEl.textContent =
          "Votre liste de souhaits est vide. Ajoutez des produits avec le cœur ♥";
      }
    }

    productsEl.innerHTML = "";
    renderListSection(productsEl, MAIN_LIST_ID, MAIN_LIST_LABEL, items);
    named.forEach(function (name) {
      renderListSection(productsEl, name, name, items);
    });
  }

  function handleClick(e) {
    var pickOpt = e.target.closest("[data-wish-list].wish-pick-option");
    if (pickOpt) {
      e.preventDefault();
      e.stopPropagation();
      if (!pendingProduct) return;
      var listId = pickOpt.getAttribute("data-wish-list") || MAIN_LIST_ID;
      var key = itemKey(pendingProduct);
      var btn = pendingBtn;

      if (isInList(key, listId)) {
        removeFromList(key, listId);
      } else {
        addToList(pendingProduct, listId);
      }

      setButtonState(btn, isWished(key));
      closePicker();
      renderWishlistPage();
      syncButtons(document);
      return;
    }

    var removeBtn = e.target.closest("[data-wish-remove]");
    if (removeBtn) {
      e.preventDefault();
      e.stopPropagation();
      removeFromList(
        removeBtn.getAttribute("data-wish-remove"),
        removeBtn.getAttribute("data-wish-list") || null
      );
      renderWishlistPage();
      syncButtons(document);
      return;
    }

    var deleteListBtn = e.target.closest("[data-wish-delete-list]");
    if (deleteListBtn) {
      e.preventDefault();
      e.stopPropagation();
      var delName = deleteListBtn.getAttribute("data-wish-delete-list");
      if (!delName) return;
      if (
        !window.confirm(
          'Supprimer la liste « ' + delName + ' » et ses produits ?'
        )
      ) {
        return;
      }
      deleteNamedList(delName);
      renderWishlistPage();
      syncButtons(document);
      return;
    }

    var renameBtn = e.target.closest("[data-wish-rename]");
    if (renameBtn) {
      e.preventDefault();
      e.stopPropagation();
      var oldName = renameBtn.getAttribute("data-wish-rename");
      if (!oldName) return;
      var group = renameBtn.closest(".wish-list-group");
      if (!group) return;
      var titleEl = group.querySelector(".wish-list-group-title");
      var headBtn = group.querySelector(".wish-list-group-head");
      if (!titleEl || !headBtn) return;

      var input = document.createElement("input");
      input.type = "text";
      input.className = "wish-list-group-title-input";
      input.value = oldName;
      input.maxLength = 60;
      titleEl.replaceWith(input);
      input.focus();
      input.select();

      var done = false;
      function finishRename(save) {
        if (done) return;
        done = true;
        var next = input.value.trim();
        if (save && next && next !== oldName) {
          if (!renameNamedList(oldName, next)) {
            window.alert("Ce nom de liste est invalide ou déjà utilisé.");
          }
        }
        renderWishlistPage();
      }

      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          finishRename(true);
        } else if (ev.key === "Escape") {
          ev.preventDefault();
          finishRename(false);
        }
      });
      input.addEventListener("blur", function () {
        finishRename(true);
      });
      return;
    }

    var groupHead = e.target.closest(".wish-list-group-head");
    if (groupHead) {
      e.preventDefault();
      e.stopPropagation();
      var group = groupHead.closest(".wish-list-group");
      if (!group) return;
      var collapsed = group.classList.toggle("is-collapsed");
      groupHead.setAttribute("aria-expanded", collapsed ? "false" : "true");
      return;
    }

    var btn = e.target.closest(".wishlist-btn, .heart-btn, #heartBtn");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    var product = getProductFromButton(btn);
    if (!product) return;

    var key = itemKey(product);
    var named = getNamedLists();

    // Already wished and no custom lists: toggle off from main/all
    if (isWished(key) && !named.length) {
      removeProduct(key);
      setButtonState(btn, false);
      renderWishlistPage();
      return;
    }

    // Custom lists exist: always open picker (add or manage)
    if (named.length) {
      openPicker(product, btn);
      return;
    }

    // No custom lists yet: add directly to main list (picker hidden)
    addToList(product, MAIN_LIST_ID);
    setButtonState(btn, true);
    renderWishlistPage();
  }

  function boot() {
    document.addEventListener("click", handleClick, true);
    syncButtons(document);
    renderWishlistPage();

    document.addEventListener("ajb:products-loaded", function () {
      syncButtons(document);
    });
    document.addEventListener("ajb:wishlist-updated", function () {
      syncButtons(document);
      renderWishlistPage();
    });
    document.addEventListener("ajb:legacy-page-ready", function () {
      syncButtons(document);
      renderWishlistPage();
    });

    // PDP product may hydrate after wishlist.js boots
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      syncButtons(document);
      if (window.__AJB_CURRENT_PRODUCT__ || tries > 40) clearInterval(timer);
    }, 250);

    if (typeof MutationObserver !== "undefined") {
      var grid = document.getElementById("productGrid");
      if (grid) {
        new MutationObserver(function () {
          syncButtons(grid);
        }).observe(grid, { childList: true, subtree: true });
      }
    }
  }

  window.AJBWishlist = {
    getItems: getItems,
    getNamedLists: getNamedLists,
    isWished: isWished,
    addToList: addToList,
    removeProduct: removeProduct,
    renameNamedList: renameNamedList,
    deleteNamedList: deleteNamedList,
    syncButtons: syncButtons,
    renderPage: renderWishlistPage,
    MAIN_LIST_ID: MAIN_LIST_ID,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
