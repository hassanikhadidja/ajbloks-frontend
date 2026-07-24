(function () {
  var STAMP_ICON =
    "https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782687662/Design_sans_titre_69_l8uydl.png";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slots() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".kids-club-stamp-overlay .kids-club-stamp-slot"),
    );
  }

  function renderStamps(count, iconUrl) {
    var n = Math.max(0, Math.min(8, Number(count) || 0));
    var src = iconUrl || STAMP_ICON;
    slots().forEach(function (slot, i) {
      if (i < n) {
        slot.innerHTML =
          '<img class="stamp-icon" src="' + esc(src) + '" alt="">';
      } else {
        slot.innerHTML = "";
      }
    });
  }

  function setHidden(el, hidden) {
    if (!el) return;
    if (hidden) {
      el.setAttribute("hidden", "");
      el.style.display = "none";
    } else {
      el.removeAttribute("hidden");
      el.style.display = "";
    }
  }

  function renderReward(state) {
    var msgEl = document.getElementById("kidsClubPromoMessage");
    var codeEl = document.getElementById("kidsClubPromoCode");
    var birthdayEl = document.getElementById("kidsClubBirthday");
    var birthdayInput = document.getElementById("kidsClubBirthdayInput");
    var birthdayConfirm = document.getElementById("kidsClubBirthdayConfirm");
    var birthdayNote = document.getElementById("kidsClubBirthdayNote");

    renderStamps(state && state.stamps, state && state.stampIconUrl);

    var message = state && state.message ? String(state.message) : "";
    if (msgEl) {
      if (message) {
        msgEl.textContent = message;
        setHidden(msgEl, false);
      } else {
        msgEl.textContent = "";
        setHidden(msgEl, true);
      }
    }

    var showCode = Boolean(state && state.showPromoCode && state.promoCode);
    if (codeEl) {
      if (showCode) {
        codeEl.textContent = state.promoCode;
        setHidden(codeEl, false);
      } else {
        codeEl.textContent = "";
        setHidden(codeEl, true);
      }
    }

    var showBirthday = Boolean(state && state.showBirthdayForm);
    if (birthdayEl) {
      setHidden(birthdayEl, !showBirthday);
      if (showBirthday && birthdayInput) {
        birthdayInput.disabled = false;
        if (state.birthday) birthdayInput.value = state.birthday;
      }
      if (birthdayConfirm) birthdayConfirm.disabled = !showBirthday;
      if (birthdayNote) {
        birthdayNote.textContent = showBirthday
          ? "Confirmez votre date de naissance. Vous ne pourrez plus la modifier ensuite."
          : "";
      }
    }

    // If birthday already locked and we're on tier 4, keep message but hide form
    if (state && state.birthdayLocked && state.tier === 4 && birthdayEl) {
      setHidden(birthdayEl, true);
    }

    // Sync profile birthday row if present
    var birthdayEl = document.getElementById("profileBirthday");
    if (birthdayEl && state && state.birthday) {
      try {
        var d = new Date(state.birthday + "T00:00:00");
        birthdayEl.textContent = d.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch (e) {
        birthdayEl.textContent = state.birthday;
      }
    }
  }

  async function loadKidsClub() {
    if (!window.AJBApi || !AJBApi.getToken()) return null;
    try {
      var state = await AJBApi.get("/user/kids-club");
      window.KIDS_CLUB_STATE = state;
      renderReward(state);
      return state;
    } catch (e) {
      console.warn("Could not load Kids Club", e);
      renderReward({ stamps: 0, message: null, showPromoCode: false, showBirthdayForm: false });
      return null;
    }
  }

  async function confirmBirthday() {
    var input = document.getElementById("kidsClubBirthdayInput");
    var btn = document.getElementById("kidsClubBirthdayConfirm");
    if (!input || !window.AJBApi) return;
    var value = String(input.value || "").trim();
    if (!value) {
      alert("Veuillez choisir votre date de naissance.");
      return;
    }
    if (btn) btn.disabled = true;
    try {
      var state = await AJBApi.post("/user/kids-club", { birthday: value });
      window.KIDS_CLUB_STATE = state;
      renderReward(state);
      alert("Date de naissance enregistrée. Elle ne pourra plus être modifiée.");
    } catch (e) {
      alert((e && e.message) || "Impossible d'enregistrer la date de naissance.");
      if (btn) btn.disabled = false;
    }
  }

  function wireBirthday() {
    var btn = document.getElementById("kidsClubBirthdayConfirm");
    if (!btn || btn.dataset.wired === "1") return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      confirmBirthday();
    });
  }

  window.renderKidsClub = renderReward;
  window.loadKidsClub = loadKidsClub;

  function init() {
    wireBirthday();
    // Empty by default until API responds
    renderReward({ stamps: 0, message: null, showPromoCode: false, showBirthdayForm: false });
    loadKidsClub();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("ajb:legacy-page-ready", function () {
    wireBirthday();
    loadKidsClub();
  });
})();
