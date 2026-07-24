(function () {
  var profile = {
    name: "",
    email: "",
    birthday: "",
    addresses: [],
    marketingEmail: true,
  };

  var editingName = false;
  var editingAddressIndex = -1; // -1 = idle, -2 = adding new

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatBirthday(raw) {
    if (!raw) return "—";
    try {
      var d = new Date(String(raw).slice(0, 10) + "T00:00:00");
      return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return String(raw);
    }
  }

  function setNameDisplay() {
    var nameEl =
      $("profileName") ||
      document.querySelector("#view-profile .info-row .info-value");
    var btn =
      $("editContactBtn") ||
      document.querySelector("#view-profile .edit-btn") ||
      document.querySelector(".profile-section .edit-btn");
    if (!nameEl || !btn) return;
    if (!nameEl.id) nameEl.id = "profileName";
    if (!btn.id) btn.id = "editContactBtn";

    if (editingName) {
      nameEl.innerHTML =
        '<input type="text" class="profile-edit-input" id="profileNameInput" value="' +
        esc(profile.name) +
        '" maxlength="120" aria-label="Nom">';
      btn.textContent = "Enregistrer";
      var input = $("profileNameInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    } else {
      nameEl.textContent = profile.name || "—";
      btn.textContent = "Modifier";
    }
  }

  function renderContact() {
    var emailEl =
      $("profileEmail") ||
      document.querySelectorAll("#view-profile .info-row .info-value")[1];
    var birthdayEl =
      $("profileBirthday") ||
      document.querySelectorAll("#view-profile .info-row .info-value")[2];
    if (emailEl) {
      if (!emailEl.id) emailEl.id = "profileEmail";
      emailEl.textContent = profile.email || "—";
    }
    if (birthdayEl) {
      if (!birthdayEl.id) birthdayEl.id = "profileBirthday";
      birthdayEl.textContent = formatBirthday(profile.birthday);
    }
    setNameDisplay();
  }

  function renderAddresses() {
    var list = $("addressesList");
    var empty = $("addressesEmpty");
    var addBtn = $("addAddressBtn");
    if (!list) return;

    var html = "";
    profile.addresses.forEach(function (addr, i) {
      if (editingAddressIndex === i) {
        html +=
          '<div class="address-row is-editing" data-address-index="' +
          i +
          '">' +
          '<textarea class="address-edit-input" id="addressEditInput" rows="2" maxlength="280" aria-label="Adresse">' +
          esc(addr) +
          "</textarea>" +
          '<div class="address-actions">' +
          '<button type="button" class="address-save-btn" data-address-save="' +
          i +
          '">Enregistrer</button>' +
          '<button type="button" class="address-cancel-btn" data-address-cancel="1">Annuler</button>' +
          "</div></div>";
      } else {
        html +=
          '<div class="address-row" data-address-index="' +
          i +
          '">' +
          '<p class="address-text">' +
          esc(addr) +
          "</p>" +
          '<div class="address-actions">' +
          '<button type="button" class="address-edit-btn" data-address-edit="' +
          i +
          '">modifier</button>' +
          '<button type="button" class="address-remove-btn" data-address-remove="' +
          i +
          '">Supprimer</button>' +
          "</div></div>";
      }
    });

    if (editingAddressIndex === -2) {
      html +=
        '<div class="address-row is-editing">' +
        '<textarea class="address-edit-input" id="addressEditInput" rows="2" maxlength="280" placeholder="Ex. 12 rue Didouche Mourad, Alger" aria-label="Nouvelle adresse"></textarea>' +
        '<div class="address-actions">' +
        '<button type="button" class="address-save-btn" data-address-save="new">Enregistrer</button>' +
        '<button type="button" class="address-cancel-btn" data-address-cancel="1">Annuler</button>' +
        "</div></div>";
    }

    list.innerHTML = html;

    if (empty) {
      empty.style.display =
        profile.addresses.length || editingAddressIndex === -2 ? "none" : "flex";
    }
    if (addBtn) {
      addBtn.style.display = editingAddressIndex === -2 ? "none" : "";
      addBtn.disabled = editingAddressIndex >= 0;
    }

    var input = $("addressEditInput");
    if (input) input.focus();
  }

  function renderMarketing() {
    var toggle = $("marketingEmailToggle");
    if (toggle) toggle.checked = profile.marketingEmail !== false;
  }

  function renderAll() {
    renderContact();
    renderAddresses();
    renderMarketing();
  }

  async function saveProfile(patch) {
    if (!window.AJBApi || !AJBApi.getToken()) throw new Error("Non connecté");
    var updated = await AJBApi.patch("/user/profile", patch);
    profile.name = updated.name || "";
    profile.email = updated.email || "";
    profile.birthday = updated.kidsClubBirthday || "";
    profile.addresses = Array.isArray(updated.addresses) ? updated.addresses : [];
    profile.marketingEmail = updated.marketingEmail !== false;
    if (window.AJBAuth) window.AJBAuth.setSession(updated);
    return updated;
  }

  async function onEditContactClick() {
    var btn = $("editContactBtn");
    if (!btn) return;

    if (!editingName) {
      editingName = true;
      setNameDisplay();
      return;
    }

    var input = $("profileNameInput");
    var name = input ? String(input.value || "").trim() : "";
    if (!name) {
      alert("Le nom ne peut pas être vide.");
      return;
    }

    btn.disabled = true;
    try {
      await saveProfile({ name: name });
      editingName = false;
      renderContact();
    } catch (e) {
      alert((e && e.message) || "Impossible d'enregistrer le nom.");
    } finally {
      btn.disabled = false;
    }
  }

  async function saveAddress(index) {
    var input = $("addressEditInput");
    var text = input ? String(input.value || "").trim() : "";
    if (!text) {
      alert("Veuillez saisir une adresse.");
      return;
    }

    var next = profile.addresses.slice();
    if (index === "new" || editingAddressIndex === -2) {
      next.push(text);
    } else {
      next[Number(index)] = text;
    }

    try {
      await saveProfile({ addresses: next });
      editingAddressIndex = -1;
      renderAddresses();
    } catch (e) {
      alert((e && e.message) || "Impossible d'enregistrer l'adresse.");
    }
  }

  async function removeAddress(index) {
    if (!confirm("Supprimer cette adresse ?")) return;
    var next = profile.addresses.slice();
    next.splice(Number(index), 1);
    try {
      await saveProfile({ addresses: next });
      editingAddressIndex = -1;
      renderAddresses();
    } catch (e) {
      alert((e && e.message) || "Impossible de supprimer l'adresse.");
    }
  }

  async function onMarketingToggle() {
    var toggle = $("marketingEmailToggle");
    if (!toggle) return;
    var value = !!toggle.checked;
    try {
      await saveProfile({ marketingEmail: value });
    } catch (e) {
      toggle.checked = !value;
      alert((e && e.message) || "Impossible d'enregistrer la préférence.");
    }
  }

  function wire() {
    var editBtn =
      $("editContactBtn") ||
      document.querySelector("#view-profile .edit-btn") ||
      document.querySelector(".profile-section .edit-btn");
    if (editBtn && editBtn.dataset.wired !== "1") {
      editBtn.dataset.wired = "1";
      if (!editBtn.id) editBtn.id = "editContactBtn";
      editBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        onEditContactClick();
      });
    }

    var addBtn = $("addAddressBtn");
    if (addBtn && addBtn.dataset.wired !== "1") {
      addBtn.dataset.wired = "1";
      addBtn.addEventListener("click", function (e) {
        e.preventDefault();
        editingAddressIndex = -2;
        renderAddresses();
      });
    }

    var list = $("addressesList");
    if (list && list.dataset.wired !== "1") {
      list.dataset.wired = "1";
      list.addEventListener("click", function (e) {
        var t = e.target;
        if (!t) return;
        var edit = t.closest("[data-address-edit]");
        if (edit) {
          editingAddressIndex = Number(edit.getAttribute("data-address-edit"));
          renderAddresses();
          return;
        }
        var remove = t.closest("[data-address-remove]");
        if (remove) {
          removeAddress(remove.getAttribute("data-address-remove"));
          return;
        }
        var save = t.closest("[data-address-save]");
        if (save) {
          saveAddress(save.getAttribute("data-address-save"));
          return;
        }
        var cancel = t.closest("[data-address-cancel]");
        if (cancel) {
          editingAddressIndex = -1;
          renderAddresses();
        }
      });
    }

    var toggle = $("marketingEmailToggle");
    if (toggle && toggle.dataset.wired !== "1") {
      toggle.dataset.wired = "1";
      toggle.addEventListener("change", onMarketingToggle);
    }

    var signout = $("signoutBtn") || document.querySelector(".signout-btn");
    if (signout && signout.dataset.wired !== "1") {
      signout.dataset.wired = "1";
      signout.addEventListener("click", function () {
        if (window.AJBAuth) window.AJBAuth.clearSession();
        else if (window.AJBApi) AJBApi.clearToken();
        window.location.href = "/signin?tab=login";
      });
    }
  }

  async function loadProfile() {
    if (!window.AJBApi || !AJBApi.getToken()) return;
    try {
      var user = await AJBApi.get("/user/profile");
      profile.name = user.name || "";
      profile.email = user.email || "";
      profile.birthday = user.kidsClubBirthday || "";
      profile.addresses = Array.isArray(user.addresses) ? user.addresses : [];
      profile.marketingEmail = user.marketingEmail !== false;
      if (window.AJBAuth) window.AJBAuth.setSession(user);
      renderAll();
      return;
    } catch (e) {
      console.warn("Could not load /user/profile, falling back", e);
    }

    // Fallback: session cache + getcurrentuser so email/name still show
    try {
      var cached = window.AJBAuth && window.AJBAuth.readUser ? window.AJBAuth.readUser() : null;
      if (cached) {
        profile.name = cached.name || profile.name;
        profile.email = cached.email || profile.email;
      }
      var current = await AJBApi.get("/user/getcurrentuser");
      if (current) {
        profile.name = current.name || profile.name;
        profile.email = current.email || profile.email;
        profile.birthday = current.kidsClubBirthday || profile.birthday;
        profile.addresses = Array.isArray(current.addresses)
          ? current.addresses
          : profile.addresses;
        if (typeof current.marketingEmail === "boolean") {
          profile.marketingEmail = current.marketingEmail;
        }
        if (window.AJBAuth) window.AJBAuth.setSession(current);
      }
      renderAll();
    } catch (err) {
      console.warn("Could not load profile", err);
      renderAll();
    }
  }

  window.loadAccountProfile = loadProfile;

  function init() {
    wire();
    loadProfile();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("ajb:legacy-page-ready", function () {
    wire();
    loadProfile();
  });
})();
