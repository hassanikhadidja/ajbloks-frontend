(function () {
  var MAX_PHOTOS = 5;
  var photos = [];
  var stars = 5;
  var drawerBuilt = false;
  var loadToken = 0;
  var initDone = false;

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function normalizeName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[“”«»]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[–—−]/g, "-")
      .replace(/\s+/g, " ");
  }

  function currentProduct() {
    return window.__AJB_CURRENT_PRODUCT__ || null;
  }

  function productName() {
    var product = currentProduct();
    if (product && product.name) return String(product.name).trim();
    var el = document.getElementById("productTitle");
    var title = (el && el.textContent ? el.textContent : "").trim();
    if (title && title.indexOf("MEGA BLOKS-Camion Course") !== 0) return title;
    return title || "";
  }

  function productId() {
    var product = currentProduct();
    if (product && (product.id || product._id)) return String(product.id || product._id);
    if (window.__AJB_PDP_PRODUCT_ID__) return String(window.__AJB_PDP_PRODUCT_ID__);
    try {
      var params = new URLSearchParams(window.location.search);
      return (params.get("id") || "").trim();
    } catch (e) {
      return "";
    }
  }

  function starsHtml(value) {
    var pct = Math.max(0, Math.min(100, (Number(value) || 0) * 20));
    return (
      '<span class="stars"><span class="back">★★★★★</span><span class="front" style="width:' +
      pct +
      '%">★★★★★</span></span>'
    );
  }

  function matchesProduct(review) {
    var id = productId();
    var name = normalizeName(productName());
    var reviewId = String(review.productId || "").trim();
    var reviewName = normalizeName(review.productName || review.produitName || "");
    if (id && reviewId && reviewId === id) return true;
    if (name && reviewName && reviewName === name) return true;
    return false;
  }

  function updateSummary(list) {
    var total = list.length;
    var avg = 0;
    var buckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    list.forEach(function (r) {
      var s = Math.round(Number(r.stars) || 0);
      if (s < 1) s = 1;
      if (s > 5) s = 5;
      buckets[s] += 1;
      avg += Number(r.stars) || 0;
    });
    if (total) avg = avg / total;

    var ratingText = document.getElementById("pdp-reviews-rating-text");
    if (ratingText) {
      ratingText.innerHTML =
        (total ? avg.toFixed(1) : "0") + " &nbsp;|&nbsp; " + total + " Avis";
    }

    var avgStars = document.getElementById("pdp-reviews-avg-stars");
    if (avgStars) {
      var front = avgStars.querySelector(".front");
      if (front) front.style.width = Math.max(0, Math.min(100, avg * 20)) + "%";
    }

    var countLabel = document.getElementById("pdp-reviews-count-label");
    if (countLabel) countLabel.textContent = total + " Avis";

    var recommend = document.getElementById("pdp-reviews-recommend");
    if (recommend) {
      recommend.textContent = total
        ? "Avis clients pour ce produit"
        : "Soyez le premier à donner votre avis sur ce produit";
    }

    document.querySelectorAll("#reviews [data-star-bar]").forEach(function (row) {
      var star = Number(row.getAttribute("data-star-bar"));
      var count = buckets[star] || 0;
      var pct = total ? Math.round((count / total) * 100) : 0;
      var fill = row.querySelector(".bar-fill");
      var countEl = row.querySelector(".count");
      if (fill) fill.style.width = pct + "%";
      if (countEl) countEl.textContent = String(count);
    });

    var topCount = document.querySelector(".rating .count");
    if (topCount) topCount.textContent = "(" + total + ")";

    var topStars = document.getElementById("stars");
    if (topStars && total) {
      var filled =
        '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5"/></svg>';
      var empty =
        '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6-5.9-3.3-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5z" stroke="#1a1a1a" stroke-width="1.5" fill="none"/></svg>';
      var rounded = Math.round(Math.max(0, Math.min(5, avg)));
      topStars.innerHTML = "";
      for (var i = 0; i < 5; i++) {
        topStars.insertAdjacentHTML("beforeend", i < rounded ? filled : empty);
      }
    }
  }

  function renderList(list) {
    var box = document.getElementById("pdp-reviews-list");
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<div class="reviews-empty">Aucun avis publié pour ce produit.</div>';
      return;
    }
    box.innerHTML = list
      .map(function (r) {
        var photoList = Array.isArray(r.photos) ? r.photos.filter(Boolean) : [];
        if (!photoList.length && r.photo) photoList = [r.photo];
        var photosHtml = photoList.length
          ? '<div class="review-photos">' +
            photoList
              .map(function (src) {
                return (
                  '<a href="' +
                  esc(src) +
                  '" target="_blank" rel="noopener noreferrer"><img class="review-photo" src="' +
                  esc(src) +
                  '" alt="Photo avis" loading="lazy" /></a>'
                );
              })
              .join("") +
            "</div>"
          : "";
        return (
          '<article class="review-card">' +
          starsHtml(r.stars) +
          '<div class="review-author">' +
          esc(r.userName || "Client") +
          (r.date ? " · " + esc(r.date) : "") +
          "</div>" +
          '<div class="review-body">' +
          esc(r.comment || "") +
          "</div>" +
          photosHtml +
          "</article>"
        );
      })
      .join("");
  }

  async function waitForApi() {
    if (window.AJBApi && typeof window.AJBApi.get === "function") {
      if (typeof window.AJBApi.whenReady === "function") {
        await window.AJBApi.whenReady(10000);
      }
      return window.AJBApi;
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
        if (window.AJBApi && typeof window.AJBApi.get === "function") finish(window.AJBApi);
      }, 50);
      var timer = setTimeout(function () {
        finish(window.AJBApi || null);
      }, 10000);
    });
  }

  async function loadPublishedReviews() {
    var listEl = document.getElementById("pdp-reviews-list");
    if (!listEl) return;

    var token = ++loadToken;
    var api = await waitForApi();
    if (token !== loadToken) return;
    if (!api || typeof api.get !== "function") {
      console.warn("PDP reviews: API unavailable");
      return;
    }

    // Wait until we know which product we are on (avoids matching against placeholder title).
    var name = productName();
    var id = productId();
    if (!id && (!name || name.indexOf("MEGA BLOKS-Camion Course") === 0)) {
      return;
    }

    try {
      var items = await api.get("/review?status=published");
      if (token !== loadToken) return;
      var all = Array.isArray(items) ? items : [];
      var list = all.filter(matchesProduct);
      updateSummary(list);
      renderList(list);
    } catch (err) {
      if (token !== loadToken) return;
      console.warn("PDP reviews load failed", err);
      renderList([]);
      updateSummary([]);
    }
  }

  function ensureDrawer() {
    if (drawerBuilt || document.getElementById("pdp-review-drawer")) {
      drawerBuilt = true;
      return;
    }

    var overlay = document.createElement("div");
    overlay.className = "pdp-review-overlay";
    overlay.id = "pdp-review-overlay";
    overlay.setAttribute("aria-hidden", "true");

    var drawer = document.createElement("aside");
    drawer.className = "pdp-review-drawer";
    drawer.id = "pdp-review-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-labelledby", "pdp-review-title");
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML =
      '<button type="button" class="pdp-review-close" id="pdp-review-close" aria-label="Fermer">×</button>' +
      '<h2 id="pdp-review-title">Ajouter un avis</h2>' +
      '<p class="pdp-review-sub" id="pdp-review-product-label"></p>' +
      '<p class="pdp-review-status" id="pdp-review-status" role="status"></p>' +
      '<form id="pdp-review-form" novalidate>' +
      '<div class="pdp-review-field">' +
      '<label for="pdp-review-name">Votre nom</label>' +
      '<input type="text" id="pdp-review-name" name="userName" required autocomplete="name" />' +
      "</div>" +
      '<div class="pdp-review-field">' +
      "<label>Note</label>" +
      '<div class="pdp-review-stars" id="pdp-review-stars" role="group" aria-label="Note">' +
      '<button type="button" class="pdp-review-star" data-star="1" aria-label="1 étoile">★</button>' +
      '<button type="button" class="pdp-review-star" data-star="2" aria-label="2 étoiles">★</button>' +
      '<button type="button" class="pdp-review-star" data-star="3" aria-label="3 étoiles">★</button>' +
      '<button type="button" class="pdp-review-star" data-star="4" aria-label="4 étoiles">★</button>' +
      '<button type="button" class="pdp-review-star" data-star="5" aria-label="5 étoiles">★</button>' +
      "</div>" +
      '<input type="hidden" id="pdp-review-stars-value" name="stars" value="5" />' +
      "</div>" +
      '<div class="pdp-review-field">' +
      '<label for="pdp-review-comment">Commentaire</label>' +
      '<textarea id="pdp-review-comment" name="comment" required placeholder="Partagez votre expérience…"></textarea>' +
      "</div>" +
      '<div class="pdp-review-field">' +
      "<label>Photos (optionnel)</label>" +
      '<input type="file" class="pdp-review-file" id="pdp-review-file" accept="image/*" multiple />' +
      '<button type="button" class="pdp-review-photos-btn" id="pdp-review-photos-btn">Joindre une photo</button>' +
      '<p class="pdp-review-photo-hint" id="pdp-review-photo-hint">0 / 5 photos</p>' +
      '<div class="pdp-review-previews" id="pdp-review-previews"></div>' +
      "</div>" +
      '<div class="pdp-review-actions">' +
      '<button type="submit" class="pdp-review-submit" id="pdp-review-submit">Envoyer mon avis</button>' +
      '<button type="button" class="pdp-review-cancel" id="pdp-review-cancel">Annuler</button>' +
      "</div>" +
      "</form>";

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
    drawerBuilt = true;
    bindDrawer();
  }

  function setStars(value) {
    stars = Math.max(1, Math.min(5, Number(value) || 5));
    var input = document.getElementById("pdp-review-stars-value");
    if (input) input.value = String(stars);
    document.querySelectorAll("#pdp-review-stars .pdp-review-star").forEach(function (btn) {
      btn.classList.toggle("active", Number(btn.dataset.star) <= stars);
    });
  }

  function setStatus(message, isError) {
    var el = document.getElementById("pdp-review-status");
    if (!el) return;
    if (!message) {
      el.textContent = "";
      el.classList.remove("visible", "error");
      return;
    }
    el.textContent = message;
    el.classList.add("visible");
    el.classList.toggle("error", !!isError);
  }

  function renderPreviews() {
    var box = document.getElementById("pdp-review-previews");
    var hint = document.getElementById("pdp-review-photo-hint");
    var btn = document.getElementById("pdp-review-photos-btn");
    if (!box) return;
    box.replaceChildren();
    photos.forEach(function (src, i) {
      var item = document.createElement("div");
      item.className = "pdp-review-preview-item";
      var img = document.createElement("img");
      img.src = src;
      img.alt = "Photo " + (i + 1);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pdp-review-preview-remove";
      remove.dataset.removePhoto = String(i);
      remove.setAttribute("aria-label", "Supprimer la photo " + (i + 1));
      remove.textContent = "×";
      item.append(img, remove);
      box.appendChild(item);
    });
    box.classList.toggle("visible", photos.length > 0);
    if (hint) hint.textContent = photos.length + " / " + MAX_PHOTOS + " photos";
    if (btn) btn.disabled = photos.length >= MAX_PHOTOS;
  }

  function resetForm() {
    var form = document.getElementById("pdp-review-form");
    if (form) form.reset();
    photos = [];
    setStars(5);
    renderPreviews();
    setStatus("");
  }

  function open() {
    ensureDrawer();
    var overlay = document.getElementById("pdp-review-overlay");
    var drawer = document.getElementById("pdp-review-drawer");
    var label = document.getElementById("pdp-review-product-label");
    if (label) label.textContent = "Pour : " + (productName() || "Produit");
    setStatus("");
    overlay.classList.add("show");
    drawer.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("pdp-review-open");
    var nameInput = document.getElementById("pdp-review-name");
    if (nameInput) {
      requestAnimationFrame(function () {
        nameInput.focus();
      });
    }
  }

  function close() {
    var overlay = document.getElementById("pdp-review-overlay");
    var drawer = document.getElementById("pdp-review-drawer");
    if (overlay) {
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden", "true");
    }
    if (drawer) {
      drawer.classList.remove("show");
      drawer.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("pdp-review-open");
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("");
    var name = (document.getElementById("pdp-review-name") || {}).value;
    var comment = (document.getElementById("pdp-review-comment") || {}).value;
    name = (name || "").trim();
    comment = (comment || "").trim();
    if (!name) {
      setStatus("Veuillez indiquer votre nom.", true);
      return;
    }
    if (!comment) {
      setStatus("Veuillez écrire un commentaire.", true);
      return;
    }
    var api = await waitForApi();
    if (!api || typeof api.post !== "function") {
      setStatus("Service indisponible. Réessayez plus tard.", true);
      return;
    }

    var submitBtn = document.getElementById("pdp-review-submit");
    if (submitBtn) submitBtn.disabled = true;

    try {
      await api.post("/review", {
        status: "pending",
        userName: name,
        productName: productName() || "Produit",
        productId: productId(),
        stars: stars,
        comment: comment,
        photos: photos.slice(),
        date: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
      resetForm();
      setStatus("Merci ! Votre avis a été envoyé et sera publié après modération.");
      setTimeout(close, 1600);
    } catch (err) {
      setStatus((err && err.message) || "Impossible d'envoyer l'avis.", true);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function bindDrawer() {
    var overlay = document.getElementById("pdp-review-overlay");
    var closeBtn = document.getElementById("pdp-review-close");
    var cancelBtn = document.getElementById("pdp-review-cancel");
    var form = document.getElementById("pdp-review-form");
    var fileInput = document.getElementById("pdp-review-file");
    var photosBtn = document.getElementById("pdp-review-photos-btn");
    var previews = document.getElementById("pdp-review-previews");

    if (overlay) overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (cancelBtn) cancelBtn.addEventListener("click", close);
    if (form) form.addEventListener("submit", submit);

    document.querySelectorAll("#pdp-review-stars .pdp-review-star").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setStars(btn.dataset.star);
      });
    });

    if (photosBtn && fileInput) {
      photosBtn.addEventListener("click", function () {
        if (photos.length >= MAX_PHOTOS) return;
        fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var files = Array.prototype.slice.call(fileInput.files || []);
        var remaining = MAX_PHOTOS - photos.length;
        files.slice(0, remaining).forEach(function (file) {
          if (!file.type || file.type.indexOf("image/") !== 0) return;
          var reader = new FileReader();
          reader.onload = function () {
            if (photos.length < MAX_PHOTOS) {
              photos.push(reader.result);
              renderPreviews();
            }
          };
          reader.readAsDataURL(file);
        });
        fileInput.value = "";
      });
    }

    if (previews) {
      previews.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-remove-photo]");
        if (!btn) return;
        photos.splice(Number(btn.dataset.removePhoto), 1);
        renderPreviews();
      });
    }

    setStars(5);
    renderPreviews();
  }

  function onOpenClick(e) {
    e.preventDefault();
    open();
  }

  function bindOpenButtons() {
    var ratingBtn = document.getElementById("pdp-add-review-btn");
    if (ratingBtn && !ratingBtn.dataset.bound) {
      ratingBtn.dataset.bound = "1";
      ratingBtn.addEventListener("click", onOpenClick);
    }
    document.querySelectorAll("a.add-review, button.add-review").forEach(function (el) {
      if (el.dataset.bound) return;
      el.dataset.bound = "1";
      el.addEventListener("click", onOpenClick);
    });
  }

  function init() {
    if (!document.getElementById("reviews")) return;
    if (initDone) {
      bindOpenButtons();
      loadPublishedReviews();
      return;
    }
    initDone = true;

    bindOpenButtons();

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("pdp-review-open")) {
        close();
      }
    });

    document.addEventListener("ajb:current-product", function () {
      loadPublishedReviews();
    });
    document.addEventListener("ajb:legacy-page-ready", function () {
      bindOpenButtons();
      loadPublishedReviews();
    });
    document.addEventListener("ajb:data-updated", function (e) {
      var path = e && e.detail && e.detail.path;
      if (path && String(path).indexOf("/review") === 0) loadPublishedReviews();
    });
    document.addEventListener("ajb:reviews-changed", function () {
      loadPublishedReviews();
    });

    loadPublishedReviews();
  }

  // Re-run init when LegacyPage injects/remounts content (script may already be loaded).
  window.PdpReviewForm = {
    open: open,
    close: close,
    reload: loadPublishedReviews,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("ajb:legacy-page-ready", function () {
    init();
  });
})();
