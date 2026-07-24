(function () {
  if (!window.AJBApi) return;

  if (!AJBApi.getToken()) {
    window.location.href = "/signin?tab=login";
    return;
  }

  async function loadOrders() {
    if (!AJBApi.getToken()) return;

    try {
      const orders = await AJBApi.get("/order/mine");
      window.ACCOUNT_ORDERS = orders;
      if (typeof renderCommandes === "function") renderCommandes();
    } catch (e) {
      console.warn("Could not load orders", e);
    }

    if (typeof window.loadKidsClub === "function") {
      try {
        await window.loadKidsClub();
      } catch (e) {}
    }
  }

  async function loadProfile() {
    if (typeof window.loadAccountProfile === "function") {
      await window.loadAccountProfile();
      return;
    }
    // Fallback if account-profile.js not loaded yet
    try {
      const user = await AJBApi.get("/user/profile");
      const nameEl = document.getElementById("profileName");
      const emailEl = document.getElementById("profileEmail");
      const birthdayEl = document.getElementById("profileBirthday");
      if (nameEl) nameEl.textContent = user.name || "—";
      if (emailEl) emailEl.textContent = user.email || "—";
      if (birthdayEl && user.kidsClubBirthday) {
        try {
          var d = new Date(String(user.kidsClubBirthday).slice(0, 10) + "T00:00:00");
          birthdayEl.textContent = d.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        } catch (err) {
          birthdayEl.textContent = user.kidsClubBirthday;
        }
      }
      if (window.AJBAuth) window.AJBAuth.setSession(user);
    } catch (e) {}
  }

  loadOrders();
  loadProfile();
})();
