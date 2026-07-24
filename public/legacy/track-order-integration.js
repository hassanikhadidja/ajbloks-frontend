(function () {
  if (!window.AJBApi) return;

  const form = document.querySelector("form");
  const trackInput = document.getElementById("trackOrderInput") ||
    document.querySelector('input[name="order"]') ||
    document.querySelector('input[type="text"]');

  if (!form && !trackInput) return;

  async function track(code) {
    const data = await AJBApi.get("/order/track?code=" + encodeURIComponent(code));
    return data;
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const code = trackInput?.value.trim();
      if (!code) return;
      try {
        const order = await track(code);
        alert(
          "Commande " + order.trackingCode + " — Statut: " + order.status +
          "\nTotal: " + order.total + " DZD"
        );
      } catch (err) {
        alert(err.message || "Commande introuvable.");
      }
    });
  }
})();
