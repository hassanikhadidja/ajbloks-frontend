(function () {
  if (!window.AJBApi) return;

  function requireAdmin() {
    if (!AJBApi.getToken()) {
      window.location.href = "/signin?tab=login";
      return false;
    }
    if (window.AJBAuth && !window.AJBAuth.isAdmin()) {
      notifyError("Accès réservé aux administrateurs.");
      return false;
    }
    return true;
  }

  function notifyError(message) {
    if (!message) return;
    var el = document.getElementById("dash-notify");
    if (!el) {
      el = document.createElement("div");
      el.id = "dash-notify";
      el.setAttribute("role", "alert");
      el.style.cssText =
        "position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;" +
        "max-width:min(92vw,480px);padding:12px 18px;border-radius:12px;" +
        "background:#FEE2E2;color:#991B1B;font:600 14px 'Buenos Aires',sans-serif;" +
        "box-shadow:0 8px 24px rgba(0,0,0,.12);display:none";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.display = "block";
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(function () {
      el.style.display = "none";
    }, 5000);
  }

  function mapId(item) {
    return Object.assign({}, item, { id: item.id || item._id });
  }

  function dataUrlToBlob(dataUrl) {
    var parts = dataUrl.split(",");
    var mimeMatch = parts[0].match(/:(.*?);/);
    var mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    var binary = atob(parts[1]);
    var len = binary.length;
    var arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  async function uploadDataUrl(url, options) {
    if (!url || typeof url !== "string" || !url.startsWith("data:")) return url;
    var opts = options || {};
    var blob = dataUrlToBlob(url);
    var form = new FormData();
    form.append("file", blob, opts.resourceType === "raw" ? "file.pdf" : "file.png");
    form.append("folder", opts.folder || "play");
    form.append("resourceType", opts.resourceType || "image");
    var data = await AJBApi.postForm("/upload", form);
    if (!data.url || String(data.url).startsWith("data:")) {
      throw new Error("Upload Cloudinary échoué. Vérifiez la configuration ou réessayez.");
    }
    return data.url;
  }

  async function preparePlayPayload(payload) {
    if (typeof payload.coverImage === "string") {
      payload.coverImage = await uploadDataUrl(payload.coverImage, {
        folder: "play",
        resourceType: "image",
      });
    }
    if (typeof payload.pdfUrl === "string") {
      payload.pdfUrl = await uploadDataUrl(payload.pdfUrl, {
        folder: "play-pdfs",
        resourceType: "raw",
      });
    }
    if (Array.isArray(payload.steps)) {
      payload.steps = await Promise.all(
        payload.steps.map(async function (step) {
          return {
            text: step.text,
            image: await uploadDataUrl(step.image, { folder: "play-steps", resourceType: "image" }),
          };
        }),
      );
    }
    return payload;
  }

  function formatApiError(err) {
    if (!err || !err.message) return "Erreur enregistrement";
    if (err.status === 401 || err.message === "Unauthorized") {
      return "Session expirée. Reconnectez-vous.";
    }
    if (err.message === "Failed to fetch") {
      return "Connexion au serveur impossible. Vérifiez votre réseau et réessayez.";
    }
    if (err.status === 413) {
      return "Fichier trop volumineux (max 20 Mo pour un PDF imprimable).";
    }
    return err.message;
  }

  function refreshOverview() {
    if (window.OverviewCMS) OverviewCMS.render();
  }

  async function loadProducts() {
    if (!window.ProductsCMS) return;
    try {
      const products = await AJBApi.get("/product");
      ProductsCMS.products = products.map(normalizeDashboardProduct);
      ProductsCMS.render();
      refreshOverview();
      if (window.PlayCMS) {
        PlayCMS.toyCatalog = products.map(function (p) {
          return p.name;
        }).filter(Boolean);
      }
    } catch (e) {
      console.warn("Products load failed", e);
    }
  }

  async function loadUsers() {
    if (!window.UsersCMS) return;
    try {
      const results = await Promise.all([
        AJBApi.get("/user"),
        AJBApi.get("/order").catch(function () { return []; }),
      ]);
      const users = results[0];
      const orders = Array.isArray(results[1]) ? results[1] : [];
      UsersCMS.users = users.map(function (u) {
        const id = String(u._id || u.id || "");
        const email = String(u.email || "").toLowerCase();
        const userOrders = orders.filter(function (o) {
          return String(o.userId || "") === id || String(o.email || "").toLowerCase() === email;
        });
        const latestOrder = userOrders[0];
        const promoRaw =
          u.promoCodes != null
            ? u.promoCodes
            : u.promoCode != null
              ? u.promoCode
              : u.kidsClubPromoCodes;
        const promoCodes = Array.isArray(promoRaw)
          ? promoRaw.map(function (c) {
              return typeof c === "string" ? c : c && c.code ? String(c.code) : "";
            }).filter(Boolean)
          : promoRaw
            ? [String(promoRaw)]
            : [];
        const deliveredOrders = userOrders.filter(function (o) {
          return String(o.status || "").toLowerCase() === "delivered";
        }).length;
        const stamps = deliveredOrders <= 0 ? 0 : deliveredOrders % 8 === 0 ? 8 : deliveredOrders % 8;
        const kidsClub =
          u.kidsClubCard ||
          (u.kidsClubStamps != null
            ? u.kidsClubStamps + " tampons"
            : stamps + " / 8 tampons");
        const addressList = Array.isArray(u.addresses) ? u.addresses.filter(Boolean) : [];
        const address =
          addressList[0] ||
          u.address ||
          (latestOrder
            ? [latestOrder.commune, latestOrder.wilaya].filter(Boolean).join(", ")
            : "");
        return {
          id: u._id || u.id,
          name: u.name || u.email,
          email: u.email,
          role: u.role || "client",
          orders: userOrders.length,
          promoCodes: promoCodes,
          kidsClub: kidsClub,
          birthday: u.kidsClubBirthday || u.birthday || "",
          address: address,
        };
      });
      UsersCMS.render();
      refreshOverview();
    } catch (e) {
      console.warn("Users load failed", e);
    }
  }

  async function loadNewsletter() {
    if (!window.NewsletterCMS) return;
    try {
      const items = await AJBApi.get("/newsletter");
      NewsletterCMS.items = (Array.isArray(items) ? items : []).map(function (item) {
        return {
          id: item._id || item.id,
          email: item.email || "",
          name: item.name || "",
          source: item.source || "footer",
          accepted: item.accepted !== false,
          userId: item.userId || "",
        };
      });
      NewsletterCMS.render();
    } catch (e) {
      console.warn("Newsletter load failed", e);
    }
  }

  function patchNewsletter() {
    if (!window.NewsletterCMS) return;
    const cms = NewsletterCMS;

    cms.addItem = async function () {
      if (!requireAdmin()) return;
      const email = prompt("Adresse e-mail à ajouter :");
      if (!email) return;
      const name = prompt("Nom (optionnel) :") || "";
      try {
        await AJBApi.post("/newsletter", {
          email: email.trim(),
          name: name.trim(),
          source: "admin",
          accepted: true,
        });
        await loadNewsletter();
      } catch (err) {
        notifyError(err.message || "Erreur ajout e-mail");
      }
    };

    cms.deleteItem = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer cet e-mail ?")) return;
      try {
        await AJBApi.del("/newsletter/" + id);
        await loadNewsletter();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };

    cms.setAccepted = async function (id, accepted) {
      if (!requireAdmin()) return;
      try {
        await AJBApi.patch("/newsletter/" + id, { accepted: !!accepted });
        await loadNewsletter();
      } catch (err) {
        notifyError(err.message || "Erreur statut");
        await loadNewsletter();
      }
    };

    cms.exportCsv = async function (acceptedOnly) {
      if (!requireAdmin()) return;
      try {
        const path =
          "/newsletter/export" + (acceptedOnly ? "?accepted=1" : "");
        const token = AJBApi.getToken && AJBApi.getToken();
        const base =
          (window.__AJB_API_BASE__ ||
            (location.hostname === "localhost" || location.hostname === "127.0.0.1"
              ? location.origin
              : "https://api.ajbloks.com")).replace(/\/$/, "");
        const res = await fetch(base + "/api" + path, {
          headers: token ? { Authorization: "Bearer " + token } : {},
        });
        if (!res.ok) throw new Error("Export impossible");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = acceptedOnly
          ? "infolettre-acceptes.csv"
          : "infolettre-tous.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        notifyError(err.message || "Erreur export");
      }
    };
  }

  async function loadReturns() {
    if (!window.ReturnsCMS) return;
    try {
      const items = await AJBApi.get("/return-request");
      ReturnsCMS.items = (Array.isArray(items) ? items : []).map(function (item) {
        const pictures = Array.isArray(item.pictures)
          ? item.pictures.filter(Boolean)
          : [];
        return {
          id: item._id || item.id,
          name: item.name || "",
          email: item.email || "",
          phone: item.phone || "",
          comment: item.comment || "",
          wilaya: item.wilaya || "",
          requestType: item.requestType || "",
          trackingNumber: item.trackingNumber || "",
          pictures: pictures,
          picture: item.picture || pictures[0] || "",
          source: item.source || "",
          status: item.status || "nouvelle",
        };
      });
      ReturnsCMS.render();
    } catch (e) {
      console.warn("Returns load failed", e);
    }
  }

  async function loadStores() {
    if (!window.StoresCMS) return;
    try {
      const stores = await AJBApi.get("/store");
      StoresCMS.stores = stores.map(mapId);
      StoresCMS.render();
      refreshOverview();
    } catch (e) {
      console.warn("Stores load failed", e);
    }
  }

  async function loadCatalogues() {
    if (!window.GrossisteCMS) return;
    try {
      const items = await AJBApi.get("/catalogue");
      GrossisteCMS.articles = items.map(mapId);
      GrossisteCMS.render();
    } catch (e) {
      console.warn("Catalogues load failed", e);
    }
  }

  async function loadPlay() {
    if (!window.PlayCMS) return;
    try {
      const data = await AJBApi.get("/play");
      PlayCMS.data.toys = (data.toys || []).map(mapId);
      PlayCMS.data.diy = (data.diy || []).map(mapId);
      PlayCMS.data.printables = (data.printables || []).map(mapId);
      PlayCMS.data.bobs = (data.bobs || []).map(mapId);
      PlayCMS.renderAll();
    } catch (e) {
      console.warn("Play content load failed", e);
    }
  }

  async function loadReviews() {
    if (!window.ReviewModeration) return;
    try {
      const reviews = await AJBApi.get("/review");
      ReviewModeration.reviews = reviews.map(mapId);
      ReviewModeration.render();
      refreshOverview();
    } catch (e) {
      console.warn("Reviews load failed", e);
    }
  }

  async function loadPromoBar() {
    if (!window.PromoBarParamètres) return;
    try {
      const data = await AJBApi.get("/settings/promo-bar");
      if (data.sentence) {
        localStorage.setItem(PromoBarParamètres.storageKey, data.sentence);
      }
    } catch (e) {}
    PromoBarParamètres.loadIntoForm();
  }

  function normalizeDashboardProduct(p) {
    const item = mapId(p);
    item.pictures = item.pictures || item.img || [];
    item.isBook = Boolean(item.isBook);
    item.isTrending = Boolean(item.isTrending);
    item.colors = Array.isArray(item.colors) ? item.colors : [];
    item.hasMultipleColors = Boolean(item.hasMultipleColors) && item.colors.length > 0;
    if (!item.hasMultipleColors) item.colors = [];
    return item;
  }

  async function prepareProductPayload(payload, isUpdate) {
    const body = Object.assign({}, payload);
    const pictures = Array.isArray(body.pictures) ? body.pictures.slice() : [];
    delete body.pictures;

    if (!pictures.length) {
      return body;
    }

    const resolved = [];
    let uploadFailed = false;

    for (let i = 0; i < pictures.length; i++) {
      const url = pictures[i];
      if (typeof url !== "string" || !url.trim()) continue;
      if (url.startsWith("http")) {
        resolved.push(url);
        continue;
      }
      if (url.startsWith("data:")) {
        try {
          const uploaded = await uploadDataUrl(url, { folder: "products", resourceType: "image" });
          if (uploaded.startsWith("http")) resolved.push(uploaded);
          else uploadFailed = true;
        } catch (e) {
          uploadFailed = true;
        }
      }
    }

    const httpPictures = resolved.filter(function (url) {
      return typeof url === "string" && url.startsWith("http");
    });

    if (httpPictures.length) {
      body.pictures = httpPictures;
    } else if (!isUpdate) {
      throw new Error(
        uploadFailed
          ? "Upload des images échoué. Vérifiez Cloudinary ou réessayez."
          : "Au moins une image est requise.",
      );
    }

    return body;
  }

  function patchProducts() {
    if (!window.ProductsCMS) return;
    const cms = ProductsCMS;
    const origSave = cms.saveForm.bind(cms);
    cms.saveForm = async function (fd) {
      if (!requireAdmin()) return;
      const name = (fd.get("name") || "").toString().trim();
      const price = (fd.get("price") || "").toString().trim();
      if (!cms.formState.pictures.length) {
        const errEl = document.getElementById("product-form-error");
        if (errEl) { errEl.textContent = "Please add at least 1 picture (max 5)."; errEl.style.display = "block"; }
        return;
      }
      const payload = {
        isTrending: fd.get("isTrending") === "on",
        isBook: fd.get("isBook") === "on",
        hasMultipleColors: fd.get("hasMultipleColors") === "on",
        colors: fd.get("hasMultipleColors") === "on" ? cms.collectColorsFromDom() : [],
        name, price,
        category: (fd.get("category") || "").toString().trim(),
        ageTranche: (fd.get("ageTranche") || "").toString().trim(),
        character: (fd.get("character") || "").toString().trim(),
        age: (fd.get("age") || "").toString().trim(),
        tags: cms.parseTags((fd.get("tags") || "").toString()),
        description: (fd.get("description") || "").toString(),
        characteristics: (fd.get("characteristics") || "").toString(),
        warning: (fd.get("warning") || "").toString(),
        articles: [],
        whyLoveIt: cms.parseLines((fd.get("whyLoveIt") || "").toString()),
        qa: cms.collectQaFromDom(),
        pictures: [...cms.formState.pictures],
      };
      if (payload.hasMultipleColors && !payload.colors.length) {
        const errEl = document.getElementById("product-form-error");
        if (errEl) {
          errEl.textContent = "Ajoutez au moins une couleur valide (#RRGGBB).";
          errEl.style.display = "block";
        }
        return;
      }
      payload.hasMultipleColors = payload.hasMultipleColors && payload.colors.length > 0;
      try {
        const body = await prepareProductPayload(payload, Boolean(cms.editingId));
        if (cms.editingId) await AJBApi.patch("/product/" + cms.editingId, body);
        else await AJBApi.post("/product", body);
        cms.closeForm();
        await loadProducts();
      } catch (err) {
        notifyError(err.message || "Erreur produit");
      }
    };

    const origDelete = cms.deleteProduct.bind(cms);
    cms.deleteProduct = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer ce produit ?")) return;
      try {
        await AJBApi.del("/product/" + id);
        await loadProducts();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  function patchUsers() {
    if (!window.UsersCMS) return;
    const cms = UsersCMS;
    cms.saveForm = async function (fd) {
      if (!requireAdmin()) return;
      const name = (fd.get("name") || "").toString().trim();
      const email = (fd.get("email") || "").toString().trim();
      const password = (fd.get("password") || "").toString();
      const errEl = document.getElementById("users-form-error");
      function showFormError(msg) {
        if (errEl) {
          errEl.textContent = msg;
          errEl.style.display = "block";
        } else {
          notifyError(msg);
        }
      }
      if (!cms.editingId && !password) {
        showFormError("Le mot de passe est obligatoire pour un nouveau compte.");
        return;
      }
      try {
        if (cms.editingId) {
          const body = { name, email };
          if (password) body.password = password;
          await AJBApi.patch("/user/" + cms.editingId, body);
        } else {
          await AJBApi.post("/user/register", { name, email, password });
        }
        cms.closeForm();
        await loadUsers();
      } catch (err) {
        showFormError(err.message || "Erreur utilisateur");
      }
    };
    cms.deleteUser = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer cet utilisateur ?")) return;
      try {
        await AJBApi.del("/user/" + id);
        await loadUsers();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  function patchReturns() {
    if (!window.ReturnsCMS) return;
    const cms = ReturnsCMS;
    cms.updateStatus = async function (id, status) {
      if (!requireAdmin()) throw new Error("Admin requis");
      await AJBApi.patch("/return-request/" + id, { status: status });
    };
    cms.deleteItem = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer cette demande ?")) return;
      try {
        await AJBApi.del("/return-request/" + id);
        await loadReturns();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  function patchStores() {
    if (!window.StoresCMS) return;
    const cms = StoresCMS;
    cms.saveForm = async function (fd) {
      if (!requireAdmin()) return;
      var mapLinkEl = document.getElementById("store-mapLink");
      var websiteEl = document.getElementById("store-website");
      var nameEl = document.getElementById("store-name");
      var locationEl = document.getElementById("store-location");
      var typeEl = document.getElementById("store-storeType");
      var mapLink = (
        (mapLinkEl && mapLinkEl.value) ||
        (fd && fd.get("mapLink")) ||
        ""
      )
        .toString()
        .trim();
      var website = (
        (websiteEl && websiteEl.value) ||
        (fd && fd.get("website")) ||
        ""
      )
        .toString()
        .trim();
      var name = (
        (nameEl && nameEl.value) ||
        (fd && fd.get("name")) ||
        ""
      )
        .toString()
        .trim();
      var location = (
        (locationEl && locationEl.value) ||
        (fd && fd.get("location")) ||
        ""
      )
        .toString()
        .trim();
      var storeType = (
        (typeEl && typeEl.value) ||
        (fd && fd.get("storeType")) ||
        ""
      )
        .toString()
        .trim();
      if (!name || !location) {
        notifyError("Nom et adresse requis");
        return;
      }
      const payload = {
        name: name,
        location: location,
        website: website,
        mapLink: mapLink,
        storeType: storeType,
      };
      try {
        if (cms.editingId) await AJBApi.patch("/store/" + cms.editingId, payload);
        else await AJBApi.post("/store", payload);
        cms.closeForm();
        await loadStores();
      } catch (err) {
        notifyError(err.message || "Erreur magasin");
      }
    };
    cms.deleteStore = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer ce magasin de la liste ?")) return;
      try {
        await AJBApi.del("/store/" + id);
        await loadStores();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  function patchPromoBar() {
    if (!window.PromoBarParamètres) return;
    const cms = PromoBarParamètres;
    cms.save = async function (sentence) {
      const text = sentence || cms.defaultSentence;
      try {
        if (requireAdmin()) await AJBApi.put("/settings/promo-bar", { sentence: text });
        localStorage.setItem(cms.storageKey, text);
        cms.updatePreview(text);
      } catch (err) {
        localStorage.setItem(cms.storageKey, text);
        cms.updatePreview(text);
      }
    };
  }

  function patchReviews() {
    if (!window.ReviewModeration) return;
    const mod = ReviewModeration;

    mod.addReview = async function (data) {
      if (!requireAdmin()) return;
      try {
        await AJBApi.post("/review", {
          userName: data.userName,
          productName: data.productName || data.produitName,
          stars: data.stars,
          comment: data.comment,
          photos: data.photos || [],
          status: "pending",
          date: data.date,
        });
        await loadReviews();
      } catch (err) {
        notifyError(err.message || "Erreur avis");
        throw err;
      }
    };

    mod.accept = async function (id) {
      if (!requireAdmin()) return;
      try {
        await AJBApi.patch("/review/" + id, { action: "accept" });
        if (typeof AJBApi.invalidate === "function") AJBApi.invalidate("/review");
        document.dispatchEvent(new CustomEvent("ajb:reviews-changed", { detail: { action: "accept", id: id } }));
        await loadReviews();
      } catch (err) {
        notifyError(err.message || "Erreur");
      }
    };
    mod.remove = async function (id) {
      if (!requireAdmin()) return;
      try {
        await AJBApi.del("/review/" + id);
        if (typeof AJBApi.invalidate === "function") AJBApi.invalidate("/review");
        document.dispatchEvent(new CustomEvent("ajb:reviews-changed", { detail: { action: "remove", id: id } }));
        await loadReviews();
      } catch (err) {
        notifyError(err.message || "Erreur");
      }
    };
  }

  function patchGrossiste() {
    if (!window.GrossisteCMS) return;
    const cms = GrossisteCMS;

    cms.saveForm = async function (fd) {
      if (!requireAdmin()) return;
      const title = (fd.get("title") || "").toString().trim();
      const buttonSentence = (fd.get("buttonSentence") || "").toString().trim();
      const errEl = document.getElementById("grossiste-form-error");
      if (errEl) errEl.style.display = "none";
      if (!title || !buttonSentence) return;
      if (!cms.formState.picture) {
        if (errEl) {
          errEl.textContent = "Ajoutez une image pour la fiche.";
          errEl.style.display = "block";
        }
        return;
      }
      const pdf = cms.resolvePdfFromForm(fd);
      if (pdf.error) {
        if (errEl) {
          errEl.textContent = pdf.error;
          errEl.style.display = "block";
        }
        return;
      }

      const payload = {
        title,
        buttonSentence,
        picture: cms.formState.picture,
        pdfName: pdf.pdfName,
        pdfUrl: pdf.pdfUrl || "#",
      };

      try {
        if (cms.editingId) await AJBApi.patch("/catalogue/" + cms.editingId, payload);
        else await AJBApi.post("/catalogue", payload);
        cms.closeForm();
        await loadCatalogues();
      } catch (err) {
        notifyError(err.message || "Erreur catalogue");
      }
    };

    cms.deleteItem = async function (id) {
      if (!requireAdmin() || !confirm("Supprimer cette fiche catalogue ?")) return;
      try {
        await AJBApi.del("/catalogue/" + id);
        await loadCatalogues();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  async function loadOrders() {
    if (!window.OrdersCMS) return;
    try {
      const orders = await AJBApi.get("/order");
      OrdersCMS.orders = orders.map(mapId);
      OrdersCMS.render();
      refreshOverview();
    } catch (e) {
      console.warn("Orders load failed", e);
      if (e.status === 403 && window.OrdersCMS) {
        OrdersCMS.orders = [];
        OrdersCMS.render();
        refreshOverview();
      }
    }
  }

  function patchOrders() {
    if (!window.OrdersCMS) return;
    OrdersCMS.updateStatus = async function (orderId, status) {
      if (!requireAdmin()) throw new Error("Accès refusé");
      await AJBApi.patch("/order/" + encodeURIComponent(orderId), { status });
    };
    const _ordersRender = OrdersCMS.render.bind(OrdersCMS);
    OrdersCMS.render = function () {
      _ordersRender();
      refreshOverview();
    };
  }

  function showForbidden() {
    const forbidden = document.getElementById("dash-forbidden");
    const main = document.getElementById("dash-main");
    const sidebar = document.getElementById("dash-sidebar");
    if (main) main.style.display = "none";
    if (sidebar) sidebar.style.display = "none";
    forbidden?.classList.add("visible");
  }

  function patchPlay() {
    if (!window.PlayCMS) return;
    const cms = PlayCMS;

    cms.saveForm = async function (type) {
      if (!requireAdmin()) return;
      const form = document.getElementById("play-save-form");
      if (!form) return;
      const fd = new FormData(form);
      const editingId = cms.editing?.id;
      let payload;

      if (type === "toys") {
        const toyNames = [...fd.getAll("toyName")].map(String);
        const custom = (fd.get("customToy") || "").toString().trim();
        if (custom) toyNames.push(custom);
        if (!toyNames.length) {
          notifyError("Sélectionner or enter at least one toy name.");
          return;
        }
        payload = { section: type, videoUrl: (fd.get("videoUrl") || "").toString().trim(), toyNames };
      } else if (type === "diy") {
        if (!cms.formState.steps.length) {
          notifyError("Add at least one step avec picture et text.");
          return;
        }
        const pdfResolved = cms.resolvePdfFromForm(fd, { required: false });
        if (pdfResolved.error) {
          notifyError(pdfResolved.error);
          return;
        }
        payload = {
          section: type,
          name: (fd.get("name") || "").toString().trim(),
          tags: (fd.get("tags") || "").toString().trim(),
          description: (fd.get("description") || "").toString().trim(),
          coverImage: cms.formState.coverImage,
          steps: cms.formState.steps.map((s) => ({ ...s })),
          videoUrl: (fd.get("videoUrl") || "").toString().trim(),
          pdfName: pdfResolved.pdfName || "",
          pdfUrl: pdfResolved.pdfUrl || "",
        };
      } else if (type === "printables") {
        const pdfResolved = cms.resolvePdfFromForm(fd, { required: true });
        if (pdfResolved.error) {
          notifyError(pdfResolved.error);
          return;
        }
        payload = {
          section: type,
          name: (fd.get("name") || "").toString().trim(),
          tags: (fd.get("tags") || "").toString().trim(),
          description: (fd.get("description") || "").toString().trim(),
          coverImage: cms.formState.coverImage,
          steps: [],
          pdfName: pdfResolved.pdfName,
          pdfUrl: pdfResolved.pdfUrl,
        };
      } else if (type === "bobs") {
        payload = {
          section: type,
          slot: (fd.get("slot") || "").toString(),
          title: (fd.get("title") || "").toString().trim(),
          videoUrl: (fd.get("videoUrl") || "").toString().trim(),
        };
      } else {
        return;
      }

      try {
        payload = await preparePlayPayload(payload);
        if (editingId) await AJBApi.patch("/play/" + editingId, payload);
        else await AJBApi.post("/play", payload);
        var notifyOk = document.getElementById("dash-notify");
        if (notifyOk) notifyOk.style.display = "none";
        cms.closeForm();
        await loadPlay();
      } catch (err) {
        notifyError(formatApiError(err));
      }
    };

    cms.deleteItem = async function (type, id) {
      if (!requireAdmin() || !confirm("Supprimer this article?")) return;
      try {
        await AJBApi.del("/play/" + id);
        await loadPlay();
      } catch (err) {
        notifyError(err.message || "Erreur suppression");
      }
    };
  }

  var integrationReady = false;

  function cmsModulesLoaded() {
    return (
      window.ProductsCMS &&
      window.PlayCMS &&
      window.UsersCMS &&
      window.ReturnsCMS &&
      window.NewsletterCMS &&
      window.StoresCMS &&
      window.GrossisteCMS &&
      window.OrdersCMS &&
      window.OverviewCMS
    );
  }

  function init() {
    if (integrationReady || !window.AJBApi) return;
    if (!cmsModulesLoaded()) return;
    integrationReady = true;
    patchProducts();
    patchUsers();
    patchReturns();
    patchNewsletter();
    patchStores();
    patchGrossiste();
    patchPromoBar();
    patchReviews();
    patchPlay();
    patchOrders();
    bootDashboard();
    return true;
  }

  async function bootDashboard() {
    if (!AJBApi.getToken()) {
      window.location.href = "/signin?tab=login";
      return;
    }

    if (window.AJBAuth) {
      await window.AJBAuth.refreshSession();
      if (!window.AJBAuth.isAdmin()) {
        showForbidden();
        return;
      }
    }

    loadProducts();
    loadUsers();
    loadReturns();
    loadNewsletter();
    loadStores();
    loadCatalogues();
    loadPlay();
    loadReviews();
    loadPromoBar();
    loadOrders();
  }

  window.__ajbDashboardIntegrationInit = init;

  function scheduleInit() {
    if (init()) return;
    var attempts = 0;
    var timer = setInterval(function () {
      if (init() || ++attempts > 120) clearInterval(timer);
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleInit);
  } else {
    scheduleInit();
  }
})();
