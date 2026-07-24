(function () {
  if (!window.AJBApi) return;

  const form = document.getElementById("checkoutForm");
  if (!form) return;

  const payBtn = document.getElementById("payBtn");
  const originalSubmit = form.onsubmit;

  function getCartItems() {
    try {
      const stored = JSON.parse(sessionStorage.getItem("cartItems"));
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) {}
    return [];
  }

  function getPaymentMethod() {
    const checked = document.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "cod";
  }

  function isValidObjectId(id) {
    return typeof id === "string" && /^[a-f0-9]{24}$/i.test(id);
  }

  function resolveItemImage(item) {
    if (item.img && typeof item.img === "string") return item.img;
    if (typeof item.thumb === "string" && /^https?:\/\//.test(item.thumb)) return item.thumb;
    if (typeof item.thumb === "string") {
      const match = item.thumb.match(/src=["']([^"']+)["']/);
      if (match) return match[1];
    }
    return "";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const wilayaInput = document.getElementById("wilaya");
    const communeInput = document.getElementById("commune");
    if (wilayaInput) wilayaInput.setCustomValidity(wilayaInput.value ? "" : "Veuillez sélectionner une wilaya");
    if (communeInput) communeInput.setCustomValidity(communeInput.value ? "" : "Veuillez sélectionner une commune");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const cartItems = getCartItems();
    if (!cartItems.length) {
      alert("Votre panier est vide.");
      return;
    }

    const items = cartItems.map(function (item) {
      const rawId = item.productId || item.id;
      const row = {
        name: item.title || item.name,
        price: Number(item.price),
        quantity: Number(item.qty || item.quantity || 1),
        img: resolveItemImage(item),
      };
      if (isValidObjectId(rawId)) row.productId = rawId;
      if (item.selectedColor && item.selectedColor.hex) {
        row.selectedColor = {
          hex: String(item.selectedColor.hex),
          name: String(item.selectedColor.name || "").trim(),
        };
      }
      return row;
    });

    const promoCode =
      (typeof window.getAppliedPromoCode === "function" && window.getAppliedPromoCode()) ||
      (document.getElementById("promoCodeInput")?.value || "").trim();

    const payload = {
      customerName: document.getElementById("fullName")?.value.trim(),
      phone: document.getElementById("phone")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      wilaya: document.getElementById("wilaya")?.value,
      commune: document.getElementById("commune")?.value,
      items: items,
      paymentMethod: getPaymentMethod(),
      promoCode: promoCode || undefined,
    };

    if (payBtn) {
      payBtn.disabled = true;
      payBtn.textContent = "En cours…";
    }

    try {
      const result = await AJBApi.post("/order", payload);
      const tracker = document.getElementById("successTracker");
      if (tracker && result.trackingCode) tracker.textContent = result.trackingCode;

      if (typeof showOrderSuccess === "function") {
        showOrderSuccess();
      }
    } catch (err) {
      alert(err.message || "Impossible de passer la commande.");
      if (payBtn) {
        payBtn.disabled = false;
        if (typeof updateTotals === "function") updateTotals();
      }
    }
  }, true);
})();
