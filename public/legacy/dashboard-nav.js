(function () {
  const NAV_ITEMS = [
    { id: "overview", label: "Vue d'ensemble", icon: "home" },
    { id: "order", label: "Produits", icon: "bag" },
    { id: "orders", label: "Commandes", icon: "cart" },
    { id: "users", label: "Utilisateurs", icon: "users" },
    { id: "returns", label: "Retours et échanges", icon: "returns" },
    { id: "stores", label: "Magasins", icon: "store" },
    { id: "grossiste", label: "Catalogues", icon: "book" },
    { id: "play", label: "Jouer", icon: "play" },
    { id: "reviews", label: "Avis", icon: "star" },
    { id: "newsletter", label: "E-mails infolettre", icon: "mail" },
    { id: "settings", label: "Paramètres", icon: "settings" },
  ];

  const ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
    cart: '<svg class="icon-filled" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 16h11.5c.75 0 1.41-.41 1.75-1.03l3.24-5.88A1 1 0 0022.62 7H5.21l-.94-2H1v2h2l3.6 7.59L5.25 17H19v-2H7.42l-.42-.84z"/></svg>',
    users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
    returns: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9"/><polyline points="3 4 3 12 11 12"/></svg>',
    store: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    play: '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  };

  function buildNav() {
    const nav = document.getElementById("dash-nav");
    if (!nav) return;
    nav.innerHTML = NAV_ITEMS.map(function (item) {
      return (
        '<button type="button" class="dash-nav-item" role="tab" data-screen="' +
        item.id +
        '" id="tab-' +
        item.id +
        '" aria-selected="false">' +
        (ICONS[item.icon] || "") +
        "<span>" +
        item.label +
        "</span></button>"
      );
    }).join("");
  }

  const DashboardNav = {
    shell: null,
    sidebar: null,
    overlay: null,
    tabs: [],
    panels: [],

    init() {
      buildNav();
      this.shell = document.querySelector(".dash-shell");
      this.sidebar = document.getElementById("dash-sidebar");
      this.overlay = document.getElementById("dash-overlay");
      this.tabs = [...document.querySelectorAll(".dash-nav-item[data-screen]")];
      this.panels = [...document.querySelectorAll("main .content")];

      const validIds = new Set(this.tabs.map(function (t) {
        return t.dataset.screen;
      }));
      const fromHash = location.hash.replace("#", "");
      const saved = sessionStorage.getItem("ajbloks-dash-tab");
      const initial = validIds.has(fromHash)
        ? fromHash
        : validIds.has(saved)
          ? saved
          : "overview";

      this.tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          DashboardNav.activate(tab.dataset.screen);
          DashboardNav.closeDrawer();
        });
      });

      document.getElementById("dash-menu-btn")?.addEventListener("click", function () {
        DashboardNav.toggleDrawer();
      });
      this.overlay?.addEventListener("click", function () {
        DashboardNav.closeDrawer();
      });

      window.addEventListener("hashchange", function () {
        const id = location.hash.replace("#", "");
        if (validIds.has(id)) DashboardNav.activate(id, false);
      });

      this.activate(initial, false);
    },

    toggleDrawer() {
      this.shell?.classList.toggle("drawer-open");
    },

    closeDrawer() {
      this.shell?.classList.remove("drawer-open");
    },

    activate(screenId, updateHash) {
      if (updateHash === undefined) updateHash = true;
      const tab = this.tabs.find(function (t) {
        return t.dataset.screen === screenId;
      });
      const panel = document.getElementById(screenId);
      if (!tab || !panel) return;

      this.tabs.forEach(function (t) {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });

      this.panels.forEach(function (p) {
        const on = p === panel;
        p.classList.toggle("active", on);
        p.setAttribute("aria-hidden", on ? "false" : "true");
      });

      if (updateHash) history.replaceState(null, "", "#" + screenId);
      sessionStorage.setItem("ajbloks-dash-tab", screenId);

      if (screenId === "overview" && window.OverviewCMS) {
        OverviewCMS.render();
      }
      if (screenId === "settings" && window.PromoBarParamètres) {
        PromoBarParamètres.loadIntoForm();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };

  window.DashboardNav = DashboardNav;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      DashboardNav.init();
    });
  } else {
    DashboardNav.init();
  }
})();
