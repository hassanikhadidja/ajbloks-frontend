

function scrollDrawerBodyToTop(pageId) {
  const pageEl = typeof pageId === "string" ? document.getElementById(pageId) : pageId;
  const bodyEl = pageEl?.querySelector(".review-half-body");
  if (bodyEl) bodyEl.scrollTop = 0;
}

const chartData = {
  Weekly: [
    { dark: 55, light: 75, label: "$75K" },
    { dark: 40, light: 65, label: "$65K" },
    { dark: 48, light: 70, label: "$70K" },
    { dark: 70, light: 88, label: "$88K" },
    { dark: 52, light: 72, label: "$72K" },
    { dark: 60, light: 80, label: "$80K" },
    { dark: 45, light: 62, label: "$62K" },
  ],
  "Aujourd'hui": [
    { dark: 30, light: 50, label: "$50K" },
    { dark: 60, light: 80, label: "$80K" },
    { dark: 45, light: 65, label: "$65K" },
    { dark: 70, light: 90, label: "$90K" },
    { dark: 35, light: 55, label: "$55K" },
    { dark: 50, light: 70, label: "$70K" },
    { dark: 40, light: 60, label: "$60K" },
  ],
  Monthly: [
    { dark: 65, light: 85, label: "$85K" },
    { dark: 55, light: 78, label: "$78K" },
    { dark: 72, light: 92, label: "$92K" },
    { dark: 48, light: 68, label: "$68K" },
    { dark: 60, light: 82, label: "$82K" },
    { dark: 42, light: 60, label: "$60K" },
    { dark: 68, light: 88, label: "$88K" },
  ],
};
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let currentPeriod = "Weekly";

function renderChart() {
  const container = document.getElementById("chart");
  const data = chartData[currentPeriod];
  if (!container || !data) return;
  const barsHtml = data.map((d, i) => `
    <div class="bar-group">
      <div class="bar-tooltip">${d.label}</div>
      <div class="bar light" style="height:0%"></div>
      <div class="bar dark" style="height:0%"></div>
    </div>
  `).join("");
  container.innerHTML = `
    <div class="chart-labels-y"><span>$100k</span><span>$80k</span><span>$60k</span><span>$40k</span><span>$20k</span></div>
    <div class="bars-area">${barsHtml}</div>
    <div class="chart-labels-x">${days.map(d => `<span>${d}</span>`).join("")}</div>
  `;
  requestAnimationFrame(() => {
    container.querySelectorAll(".bar-group").forEach((g, i) => {
      g.querySelector(".bar.light").style.height = data[i].light + "%";
      g.querySelector(".bar.dark").style.height = data[i].dark + "%";
    });
  });
}

// Tab switching
function switchPeriod(p) {
  if (!p || !chartData[p]) return;
  currentPeriod = p;
  document.querySelectorAll("[data-period]").forEach(t => t.classList.toggle("active", t.dataset.period === p));
  renderChart();
}

document.querySelectorAll("[data-period]").forEach(t => {
  t.addEventListener("click", () => switchPeriod(t.dataset.period));
});

// Dynamic tab navigation
const TabNav = {
  nav: document.querySelector(".bottom-nav"),
  indicator: document.querySelector(".nav-indicator"),
  tabs: [...document.querySelectorAll(".bottom-nav-article[role=tab]")],
  panels: [...document.querySelectorAll("main .content")],

  init() {
    const validIds = new Set(this.tabs.map((t) => t.dataset.screen));
    const fromHash = location.hash.replace("#", "");
    const saved = sessionStorage.getItem("adol-tab");
    const initial = validIds.has(fromHash) ? fromHash : validIds.has(saved) ? saved : "overview";

    this.tabs.forEach((tab) => {
      const label = tab.querySelector(":scope > span:not(.bottom-icon)")?.textContent?.trim();
      if (label) tab.setAttribute("aria-label", label);
      tab.addEventListener("click", () => this.activate(tab.dataset.screen));
    });

    this.nav.addEventListener("keydown", (e) => this.onKeydown(e));
    this.nav.addEventListener("scroll", () => this.moveIndicator(), { passive: true });
    window.addEventListener("resize", () => this.moveIndicator());
    window.addEventListener("hashchange", () => {
      const id = location.hash.replace("#", "");
      if (validIds.has(id)) this.activate(id, false);
    });

    this.activate(initial, false);
    requestAnimationFrame(() => this.moveIndicator());
  },

  activate(screenId, updateHash = true) {
    const tab = this.tabs.find((t) => t.dataset.screen === screenId);
    const panel = document.getElementById(screenId);
    if (!tab || !panel) return;

    this.tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on);
    });

    this.panels.forEach((p) => {
      const on = p === panel;
      p.classList.toggle("active", on);
      p.setAttribute("aria-hidden", !on);
    });

    this.moveIndicator(tab);
    tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    if (updateHash) history.replaceState(null, "", "#" + screenId);
    sessionStorage.setItem("adol-tab", screenId);

    if (screenId === "overview" && document.getElementById("chart")) renderChart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  moveIndicator(activeTab) {
    const tab = activeTab || this.tabs.find((t) => t.classList.contains("active"));
    if (!tab || !this.indicator || !this.nav) return;
    const left = tab.offsetLeft - this.nav.scrollLeft;
    this.indicator.style.width = tab.offsetWidth + "px";
    this.indicator.style.transform = "translateX(" + left + "px)";
  },

  onKeydown(e) {
    const idx = this.tabs.findIndex((t) => t.classList.contains("active"));
    if (idx < 0) return;
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % this.tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + this.tabs.length) % this.tabs.length;
    else if (e.key === "Accueil") next = 0;
    else if (e.key === "End") next = this.tabs.length - 1;
    else return;
    e.preventDefault();
    this.tabs[next].focus();
    this.activate(this.tabs[next].dataset.screen);
  },
};

TabNav.init();
renderChart();

const AccountNav = {
  main: document.getElementById("account-main"),
  profile: document.getElementById("account-profile"),
  notifications: document.getElementById("account-notifications"),
  promo: document.getElementById("account-promo"),
  profileBtn: document.getElementById("account-profile-btn"),
  profileBackBtn: document.getElementById("account-profile-back"),
  notificationsBtn: document.getElementById("account-notifications-btn"),
  notificationsBackBtn: document.getElementById("account-notifications-back"),
  promoBtn: document.getElementById("account-promo-btn"),
  promoBackBtn: document.getElementById("account-promo-back"),
  views: [],

  init() {
    if (!this.main) return;
    this.views = [this.main, this.profile, this.notifications, this.promo].filter(Boolean);

    this.bindSubnav(this.profileBtn, () => this.show("profile"));
    this.bindSubnav(this.notificationsBtn, () => this.show("notifications"));
    this.bindSubnav(this.promoBtn, () => {
      this.show("promo");
      PromoBarParamètres.loadIntoForm();
    });
    this.profileBackBtn?.addEventListener("click", () => this.show("main"));
    this.notificationsBackBtn?.addEventListener("click", () => this.show("main"));
    this.promoBackBtn?.addEventListener("click", () => this.show("main"));
  },

  bindSubnav(btn, handler) {
    if (!btn) return;
    btn.addEventListener("click", handler);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler();
      }
    });
  },

  show(viewId) {
    const map = { main: this.main, profile: this.profile, notifications: this.notifications, promo: this.promo };
    const target = map[viewId] || this.main;
    this.views.forEach((view) => view.classList.toggle("hidden", view !== target));
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  reset() {
    this.show("main");
  },
};

AccountNav.init();

const PromoBarParamètres = {
  storageKey: "ajbloks-promo-bar",
  defaultSentence: "Livraison gratuite pour les commandes de plus de 6500 DZD",
  preview: document.getElementById("promo-bar-preview"),
  input: document.getElementById("promo-bar-input"),
  form: document.getElementById("promo-bar-form"),
  saveMsg: document.getElementById("promo-save-msg"),

  init() {
    if (!this.form || !this.input) return;
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.save(this.input.value.trim());
    });
    this.input.addEventListener("input", () => this.updatePreview(this.input.value));
  },

  get() {
    return localStorage.getItem(this.storageKey) || this.defaultSentence;
  },

  save(sentence) {
    const text = sentence || this.defaultSentence;
    localStorage.setItem(this.storageKey, text);
    this.updatePreview(text);
    if (this.saveMsg) {
      this.saveMsg.classList.add("visible");
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this.saveMsg.classList.remove("visible"), 3000);
    }
  },

  updatePreview(text) {
    if (this.preview) this.preview.textContent = text.trim() || this.defaultSentence;
  },

  loadIntoForm() {
    const text = this.get();
    if (this.input) this.input.value = text;
    this.updatePreview(text);
    if (this.saveMsg) this.saveMsg.classList.remove("visible");
  },
};

PromoBarParamètres.init();

document.getElementById("dash-topbar-notify")?.addEventListener("click", () => {
  TabNav.activate("account");
  AccountNav.show("notifications");
});

const ReviewModeration = {
  pendingList: document.getElementById("reviews-pending-list"),
  publishedList: document.getElementById("reviews-published-list"),
  pendingCountEl: document.getElementById("review-pending-count"),
  publishedCountEl: document.getElementById("review-published-count"),
  avgNonteEl: document.getElementById("review-avg-rating"),
  nextId: 6,
  reviews: [
    {
      id: 1,
      status: "pending",
      userName: "Lucas Martin",
      produitName: "Mega Bloks de construction Truck",
      stars: 5,
      comment: "My son loves this set! The pieces are sturdy et the truck design is amazing. Great quality pour the price.",
      photos: [
        "https://picsum.photos/seed/review-client1a/600/400",
        "https://picsum.photos/seed/review-client1b/600/400",
      ],
      date: "Jun 27, 2026",
    },
    {
      id: 2,
      status: "pending",
      userName: "Nadia Benali",
      produitName: "Spider-Man Action Figure",
      stars: 4,
      comment: "Good detail et articulation. Packaging arrived slightly dented but the toy itself was perfect.",
      photos: ["https://picsum.photos/seed/review-client2/600/400"],
      date: "Jun 26, 2026",
    },
    {
      id: 3,
      status: "pending",
      userName: "Tom Harris",
      produitName: "Jeux d'extérieur Tent",
      stars: 5,
      comment: "Facile to set up et the kids use it every day in the garden. Highly recommend pour summer.",
      photos: [
        "https://picsum.photos/seed/review-client3a/600/400",
        "https://picsum.photos/seed/review-client3b/600/400",
        "https://picsum.photos/seed/review-client3c/600/400",
      ],
      date: "Jun 25, 2026",
    },
    {
      id: 4,
      status: "published",
      userName: "Marcus Reed",
      produitName: "Nike Phantom GX Elite",
      stars: 5,
      comment: "Excellent fit et grip. Livraison was fast et the shoes look exactly like the photos on the site.",
      photos: ["https://picsum.photos/seed/review-pub1/600/400"],
      date: "May 30, 2026",
    },
    {
      id: 5,
      status: "published",
      userName: "Emma Kim",
      produitName: "Nike Zoom Mercurial",
      stars: 5,
      comment: "Lightweight et comfortable pour long sessions. Would definitely order again from ADOL.",
      photos: [],
      date: "May 28, 2026",
    },
  ],

  init() {
    if (!this.pendingList || !this.publishedList) return;
    this.pendingList.addEventListener("click", (e) => this.handleAction(e, "pending"));
    this.publishedList.addEventListener("click", (e) => this.handleAction(e, "published"));
    this.render();
  },

  addReview(data) {
    this.reviews.unshift({
      id: this.nextId++,
      status: "pending",
      userName: data.userName,
      produitName: data.productName,
      stars: data.stars,
      comment: data.comment,
      photos: [...(data.photos || [])],
      date: data.date,
    });
    this.render();
  },

  getPhotos(review) {
    if (Array.isArray(review.photos)) return review.photos;
    if (review.photo) return [review.photo];
    return [];
  },

  handleAction(e, listType) {
    const acceptBtn = e.target.closest("[data-accept]");
    const removeBtn = e.target.closest("[data-remove]");
    const card = e.target.closest("[data-review-id]");
    if (!card) return;
    const id = +card.dataset.reviewId;
    if (acceptBtn) this.accept(id);
    else if (removeBtn) this.remove(id);
  },

  accept(id) {
    const review = this.reviews.find((r) => r.id === id);
    if (!review || review.status !== "pending") return;
    review.status = "published";
    this.render();
  },

  remove(id) {
    this.reviews = this.reviews.filter((r) => r.id !== id);
    this.render();
  },

  starsDisplay(value) {
    return "★".repeat(value) + "☆".repeat(5 - value);
  },

  escape(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  renderCard(review) {
    const isPending = review.status === "pending";
    const photos = this.getPhotos(review);
    const photoHtml = photos.length
      ? `<div class="review-photos">${photos.map((src, i) => `<img class="review-photo" src="${src}" alt="Review photo ${i + 1} pour ${this.escape(review.productName)}" loading="lazy" />`).join("")}</div>`
      : "";
    const actionsHtml = isPending
      ? `<div class="review-actions">
          <button type="button" class="review-accept-btn" data-accept>Accept &amp; publish</button>
          <button type="button" class="review-remove-btn" data-remove>Supprimer</button>
        </div>`
      : `<div class="review-actions">
          <button type="button" class="review-remove-btn" data-remove>Retirer du site</button>
        </div>`;

    return `
      <article class="review-card ${review.status}" data-review-id="${review.id}">
        <span class="review-status-badge ${review.status}">${isPending ? "Not on website" : "Live on website"}</span>
        ${photoHtml}
        <div class="review-top">
          <div>
            <div class="review-author">${this.escape(review.userName)}</div>
            <div class="review-product">${this.escape(review.productName)}</div>
          </div>
          <div style="text-align:right">
            <div class="review-stars">${this.starsDisplay(review.stars)}</div>
            <div class="review-date">${this.escape(review.date)}</div>
          </div>
        </div>
        <p class="review-text">${this.escape(review.comment)}</p>
        ${actionsHtml}
      </article>
    `;
  },

  render() {
    const pending = this.reviews.filter((r) => r.status === "pending");
    const published = this.reviews.filter((r) => r.status === "published");

    this.pendingList.innerHTML = pending.length
      ? pending.map((r) => this.renderCard(r)).join("")
      : `<div class="reviews-empty">Non client reviews waiting pour approval.</div>`;

    this.publishedList.innerHTML = published.length
      ? published.map((r) => this.renderCard(r)).join("")
      : `<div class="reviews-empty">Non reviews published on the website yet.</div>`;

    if (this.pendingCountEl) this.pendingCountEl.textContent = String(pending.length);
    if (this.publishedCountEl) this.publishedCountEl.textContent = String(published.length);

    if (this.avgNonteEl) {
      if (!published.length) {
        this.avgNonteEl.textContent = "—";
      } else {
        const avg = published.reduce((sum, r) => sum + r.stars, 0) / published.length;
        this.avgNonteEl.textContent = avg.toFixed(1);
      }
    }
  },
};

ReviewModeration.init();

const ReviewAddPanel = {
  moderation: null,
  page: document.getElementById("review-half-page"),
  form: document.getElementById("review-add-form"),
  starsInput: document.getElementById("review-stars-value"),
  starBtns: [...document.querySelectorAll("#review-star-picker .star-picker-btn")],
  photoInput: document.getElementById("review-picture"),
  photoPreviews: document.getElementById("review-photo-previews"),
  photoLabel: document.getElementById("review-photo-label"),
  photoHint: document.getElementById("review-photo-hint"),
  maxPhotos: 5,
  photos: [],

  init(moderation) {
    this.moderation = moderation;
    if (!this.page || !this.form) return;
    document.getElementById("review-add-open")?.addEventListener("click", () => this.open());
    document.getElementById("review-half-close")?.addEventListener("click", () => this.close());
    document.getElementById("review-half-backdrop")?.addEventListener("click", () => this.close());
    document.getElementById("review-add-cancel")?.addEventListener("click", () => this.close());
    this.starBtns.forEach((btn) => btn.addEventListener("click", () => this.setStars(+btn.dataset.star)));
    this.photoInput?.addEventListener("change", () => this.handlePhotos());
    this.photoPreviews?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-photo]");
      if (!btn) return;
      this.photos.splice(+btn.dataset.removePhoto, 1);
      this.renderPreviews();
      this.updatePhotoUI();
    });
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.page?.classList.contains("open")) this.close();
    });
    this.setStars(5);
    this.updatePhotoUI();
  },

  open() {
    this.page?.classList.add("open");
    scrollDrawerBodyToTop(this.page);
    this.page?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("review-user-name")?.focus();
  },

  close() {
    this.page?.classList.remove("open");
    this.page?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  },

  setStars(value) {
    if (!this.starsInput) return;
    this.starsInput.value = value;
    this.starBtns.forEach((btn) => btn.classList.toggle("active", +btn.dataset.star <= value));
  },

  handlePhotos() {
    const files = [...(this.photoInput?.files || [])];
    if (!files.length) return;
    const remaining = this.maxPhotos - this.photos.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.photos.length < this.maxPhotos) {
          this.photos.push(reader.result);
          this.renderPreviews();
          this.updatePhotoUI();
        }
      };
      reader.readAsDataURL(file);
    });
    if (this.photoInput) this.photoInput.value = "";
  },

  renderPreviews() {
    if (!this.photoPreviews) return;
    this.photoPreviews.replaceChildren();
    this.photos.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "review-photo-preview-item";
      const img = document.createElement("img");
      img.alt = `Photo ${i + 1}`;
      img.src = src;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "review-photo-remove";
      btn.dataset.removePhoto = String(i);
      btn.setAttribute("aria-label", `Supprimer la photo ${i + 1}`);
      btn.textContent = "×";
      item.append(img, btn);
      this.photoPreviews.append(item);
    });
    this.photoPreviews.classList.toggle("visible", this.photos.length > 0);
  },

  updatePhotoUI() {
    const count = this.photos.length;
    if (this.photoHint) this.photoHint.textContent = `${count} / ${this.maxPhotos} photos (minimum 1)`;
    this.photoLabel?.classList.toggle("disabled", count >= this.maxPhotos);
  },

  formatDate(date) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  },

  resetForm() {
    this.form?.reset();
    this.setStars(5);
    this.photos = [];
    this.renderPreviews();
    this.updatePhotoUI();
  },

  submit() {
    const userName = document.getElementById("review-user-name")?.value.trim();
    const produitName = document.getElementById("review-product-name")?.value.trim();
    const comment = document.getElementById("review-comment")?.value.trim();
    const stars = +this.starsInput?.value || 5;
    if (!userName || !productName || !comment || !this.moderation) return;
    if (this.photos.length < 1 || this.photos.length > this.maxPhotos) return;

    this.moderation.addReview({
      userName,
      produitName,
      comment,
      stars,
      photos: [...this.photos],
      date: this.formatDate(new Date()),
    });

    this.resetForm();
    this.close();
  },
};

ReviewAddPanel.init(ReviewModeration);

const PlayCMS = {
  toyCatalog: [
    "Mega Bloks de construction Truck",
    "Spider-Man Action Figure",
    "Jeux d'extérieur Tent",
    "Nike Phantom GX Elite",
    "Nike Zoom Mercurial",
    "Collection jeux de société",
  ],
  nextId: { toys: 3, diy: 3, printables: 3, bobs: 3 },
  data: {
    toys: [
      { id: 1, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", toyNames: ["Mega Bloks de construction Truck", "Spider-Man Action Figure"] },
      { id: 2, videoUrl: "https://example.com/outdoor-play.mp4", toyNames: ["Jeux d'extérieur Tent"] },
    ],
    diy: [
      {
        id: 1, name: "Cardboard Robot", tags: "Craft, Recycle", description: "Build a friendly robot from boxes.",
        coverImage: "https://picsum.photos/seed/diy1/400/300",
        steps: [{ image: "https://picsum.photos/seed/diy1s1/400/300", text: "Cut the box shapes." }, { image: "https://picsum.photos/seed/diy1s2/400/300", text: "Glue the arms on." }],
        videoUrl: "https://www.youtube.com/watch?v=example1",
      },
    ],
    printables: [
      {
        id: 1, name: "Bob Coloring Pack", tags: "bob, coloring", description: "Imprimerable coloring sheets.",
        coverImage: "https://picsum.photos/seed/print1/400/300",
        steps: [{ image: "https://picsum.photos/seed/print1s1/400/300", text: "Imprimer page 1." }],
        pdfName: "bob-coloring.pdf", pdfUrl: "#",
      },
      {
        id: 2, name: "Maze Challenge", tags: "puzzle, maze", description: "Fun maze pour kids.",
        coverImage: "https://picsum.photos/seed/print2/400/300",
        steps: [{ image: "https://picsum.photos/seed/print2s1/400/300", text: "Download et print." }],
        pdfName: "maze.pdf", pdfUrl: "#",
      },
    ],
    bobs: [
      { id: 1, slot: "video1", videoUrl: "https://www.youtube.com/watch?v=bob1", title: "Bienvenue dans Le monde de Bob" },
      { id: 2, slot: "video2", videoUrl: "https://example.com/bob-adventure.mp4", title: "Bob's Adventure" },
    ],
  },
  activeTab: "toys",
  editing: null,
  formState: { steps: [], coverImage: "", pdfName: "", pdfUrl: "" },

  init() {
    document.getElementById("play-subtabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-play-tab]");
      if (tab) this.switchTab(tab.dataset.playTab);
    });
    document.getElementById("play")?.addEventListener("click", (e) => {
      const add = e.target.closest("[data-play-add]");
      if (add) { this.openForm(add.dataset.playAdd); return; }
      const edit = e.target.closest("[data-play-edit]");
      if (edit) { this.openForm(edit.dataset.playModifier, +edit.dataset.playId); return; }
      const del = e.target.closest("[data-play-delete]");
      if (del) { this.deleteItem(del.dataset.playSupprimer, +del.dataset.playId); return; }
    });
    document.getElementById("play-form-close")?.addEventListener("click", () => this.closeForm());
    document.getElementById("play-form-backdrop")?.addEventListener("click", () => this.closeForm());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("play-form-page")?.classList.contains("open")) this.closeForm();
    });
    this.renderAll();
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll("#play-subtabs .tab").forEach((t) => t.classList.toggle("active", t.dataset.playTab === tab));
    document.querySelectorAll(".play-panel").forEach((p) => p.classList.toggle("active", p.id === "play-panel-" + tab));
  },

  heroFromTags(tags) {
    return tags.toLowerCase().includes("bob") ? "pic1" : "pic2";
  },

  heroLabel(tags) {
    return this.heroFromTags(tags) === "pic1" ? "Hero Pic 1 (Bob)" : "Hero Pic 2";
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  fileIcon() {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`;
  },

  fileField({ id, name, accept, required = false, fileName = "" }) {
    const req = required ? "required" : "";
    const nameAttr = name ? `name="${name}"` : "";
    return `<div class="file-upload">
      <input type="file" class="file-upload-input" id="${id}" ${nameAttr} accept="${accept}" ${req} />
      <label class="file-upload-btn" for="${id}">${this.fileIcon()} Choisir un fichier</label>
      <span class="file-upload-name" id="${id}-name">${this.esc(fileName)}</span>
    </div>`;
  },

  bindFileInput(id, onFile) {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("change", () => {
      const file = input.files[0];
      const nameEl = document.getElementById(id + "-name");
      if (nameEl) nameEl.textContent = file?.name || "";
      if (onFile) onFile(file);
    });
  },

  deleteItem(type, id) {
    if (!confirm("Supprimer this article?")) return;
    this.data[type] = this.data[type].filter((x) => x.id !== id);
    this.renderAll();
  },

  openForm(type, id) {
    this.editing = { type, id: id ?? null };
    const item = id ? this.data[type].find((x) => x.id === id) : null;
    this.formState = {
      steps: item?.steps ? item.steps.map((s) => ({ ...s })) : [],
      coverImage: item?.coverImage || "",
      pdfName: item?.pdfName || "",
      pdfUrl: item?.pdfUrl || "",
    };
    const titles = { toys: "Jouets en action Video", diy: "DIY Activity", printables: "Imprimerable", bobs: "Le monde de Bob Video" };
    document.getElementById("play-form-title").textContent = (id ? "Modifier " : "Add ") + titles[type];
    document.getElementById("play-form-body").innerHTML = this.buildForm(type, item);
    this.bindForm(type, item);
    document.getElementById("play-form-page").classList.add("open");
    scrollDrawerBodyToTop("play-form-page");
    document.getElementById("play-form-page").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  },

  closeForm() {
    document.getElementById("play-form-page")?.classList.remove("open");
    document.getElementById("play-form-page")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.editing = null;
  },

  buildForm(type, article) {
    if (type === "toys") return this.formToys(article);
    if (type === "diy") return this.formDiy(article);
    if (type === "printables") return this.formImprimerables(article);
    if (type === "bobs") return this.formBobs(article);
    return "";
  },

  formToys(article) {
    const selected = new Set(article?.toyNames || []);
    const checks = this.toyCatalog.map((t) =>
      `<label class="play-toy-check"><input type="checkbox" name="toyName" value="${this.esc(t)}" ${selected.has(t) ? "checked" : ""} /> ${this.esc(t)}</label>`
    ).join("");
    return `<form id="play-save-form">
      <div class="play-form-field"><label class="play-form-label">Video URL (YouTube or MP4)</label>
        <input type="url" name="videoUrl" required placeholder="https://youtube.com/... or .mp4" value="${this.esc(article?.videoUrl || "")}" /></div>
      <div class="play-form-field"><label class="play-form-label">Custom toy name (optional)</label>
        <input type="text" name="customToy" placeholder="Add a toy not in the list" value="" /></div>
      <div class="play-form-field"><label class="play-form-label">Choisir toy(s)</label><div class="play-toy-checks">${checks}</div></div>
      <div class="review-half-actions"><button type="submit" class="primary-btn">Enregistrer</button><button type="button" class="back-btn" id="play-form-cancel">Annuler</button></div>
    </form>`;
  },

  formDiy(article) {
    return `<form id="play-save-form">
      <div class="play-form-field"><label class="play-form-label">Nom</label><input type="text" name="name" required value="${this.esc(article?.name || "")}" /></div>
      <div class="play-form-field"><label class="play-form-label">Étiquettes (comma separated)</label><input type="text" name="tags" value="${this.esc(article?.tags || "")}" /></div>
      <div class="play-form-field"><label class="play-form-label">Description</label><textarea name="description" required>${this.esc(article?.description || "")}</textarea></div>
      <div class="play-form-field"><label class="play-form-label">Cover picture</label>${this.fileField({ id: "play-cover-file", name: "coverFile", accept: "image/*" })}<img class="play-form-preview ${this.formState.coverImage ? "visible" : ""}" id="play-cover-preview" src="${this.formState.coverImage || ""}" alt="" /></div>
      <div class="play-form-field"><label class="play-form-label">Article steps (picture + text l'unité)</label><div class="play-steps-list" id="play-steps-list"></div><button type="button" class="play-add-step-btn" id="play-add-step">+ Add step</button></div>
      <div class="play-form-field"><label class="play-form-label">Video at end (YouTube or MP4)</label><input type="url" name="videoUrl" required placeholder="https://..." value="${this.esc(article?.videoUrl || "")}" /></div>
      <div class="review-half-actions"><button type="submit" class="primary-btn">Enregistrer</button><button type="button" class="back-btn" id="play-form-cancel">Annuler</button></div>
    </form>`;
  },

  formImprimerables(article) {
    const hero = article ? this.heroLabel(article.tags) : "Auto from tags";
    return `<form id="play-save-form">
      <div class="play-form-field"><label class="play-form-label">Nom</label><input type="text" name="name" required value="${this.esc(article?.name || "")}" /></div>
      <div class="play-form-field"><label class="play-form-label">Étiquettes (comma separated — "bob" → Hero Pic 1)</label><input type="text" name="tags" id="play-print-tags" value="${this.esc(article?.tags || "")}" /><span class="play-form-file-name" id="play-hero-hint">Hero section: ${hero}</span></div>
      <div class="play-form-field"><label class="play-form-label">Description</label><textarea name="description" required>${this.esc(article?.description || "")}</textarea></div>
      <div class="play-form-field"><label class="play-form-label">Cover picture</label>${this.fileField({ id: "play-cover-file", name: "coverFile", accept: "image/*" })}<img class="play-form-preview ${this.formState.coverImage ? "visible" : ""}" id="play-cover-preview" src="${this.formState.coverImage || ""}" alt="" /></div>
      <div class="play-form-field"><label class="play-form-label">Article steps (picture + text l'unité)</label><div class="play-steps-list" id="play-steps-list"></div><button type="button" class="play-add-step-btn" id="play-add-step">+ Add step</button></div>
      <div class="play-form-field"><label class="play-form-label">PDF file (required)</label>${this.fileField({ id: "play-pdf-file", name: "pdfFile", accept: ".pdf,application/pdf", required: !article, fileName: this.formState.pdfName || "" })}</div>
      <div class="review-half-actions"><button type="submit" class="primary-btn">Enregistrer</button><button type="button" class="back-btn" id="play-form-cancel">Annuler</button></div>
    </form>`;
  },

  formBobs(article) {
    return `<form id="play-save-form">
      <div class="play-form-field"><label class="play-form-label">Video slot</label>
        <select name="slot" required>
          <option value="video1" ${article?.slot === "video1" ? "selected" : ""}>Video 1</option>
          <option value="video2" ${article?.slot === "video2" ? "selected" : ""}>Video 2</option>
        </select></div>
      <div class="play-form-field"><label class="play-form-label">Title</label><input type="text" name="title" value="${this.esc(article?.title || "")}" /></div>
      <div class="play-form-field"><label class="play-form-label">Video URL (YouTube or MP4)</label><input type="url" name="videoUrl" required placeholder="https://youtube.com/... or .mp4" value="${this.esc(article?.videoUrl || "")}" /></div>
      <div class="review-half-actions"><button type="submit" class="primary-btn">Enregistrer</button><button type="button" class="back-btn" id="play-form-cancel">Annuler</button></div>
    </form>`;
  },

  renderSteps() {
    const list = document.getElementById("play-steps-list");
    if (!list) return;
    list.innerHTML = this.formState.steps.map((step, i) => {
      const fid = `play-step-file-${i}`;
      return `
      <div class="play-step-row" data-step="${i}">
        <div class="play-step-row-head"><span class="play-step-label">Step ${i + 1}</span><button type="button" class="play-step-remove" data-remove-step="${i}">Supprimer</button></div>
        <div class="file-upload">
          <input type="file" class="file-upload-input" id="${fid}" accept="image/*" data-step-file="${i}" />
          <label class="file-upload-btn" for="${fid}">${this.fileIcon()} Choisir un fichier</label>
          <span class="file-upload-name" id="${fid}-name">${step.image ? "Image selected" : ""}</span>
        </div>
        ${step.image ? `<img class="play-form-preview visible" src="${step.image}" alt="" style="max-height:80px" />` : ""}
        <textarea data-step-text="${i}" placeholder="Text under picture" rows="2">${this.esc(step.text)}</textarea>
      </div>`;
    }).join("");
  },

  bindForm(type, article) {
    document.getElementById("play-form-cancel")?.addEventListener("click", () => this.closeForm());
    if (type === "diy" || type === "printables") {
      this.renderSteps();
      document.getElementById("play-add-step")?.addEventListener("click", () => {
        this.formState.steps.push({ image: "", text: "" });
        this.renderSteps();
        this.bindStepEvents();
      });
      this.bindStepEvents();
      this.bindFileInput("play-cover-file", (file) => this.readImage(file, (url) => {
        this.formState.coverImage = url;
        const img = document.getElementById("play-cover-preview");
        if (img) { img.src = url; img.classList.add("visible"); }
      }));
      if (type === "printables") {
        document.getElementById("play-print-tags")?.addEventListener("input", (e) => {
          document.getElementById("play-hero-hint").textContent = "Hero section: " + this.heroLabel(e.target.value);
        });
        this.bindFileInput("play-pdf-file", (file) => {
          if (file) {
            this.formState.pdfName = file.name;
            this.formState.pdfUrl = file.name;
          }
        });
      }
    }
    document.getElementById("play-save-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm(type);
    });
  },

  bindStepEvents() {
    document.querySelectorAll("[data-remove-step]").forEach((btn) => {
      btn.onclick = () => {
        this.formState.steps.splice(+btn.dataset.removeStep, 1);
        this.renderSteps();
        this.bindStepEvents();
      };
    });
    document.querySelectorAll("[data-step-file]").forEach((input) => {
      input.onchange = () => {
        const i = +input.dataset.stepFile;
        const nameEl = document.getElementById(input.id + "-name");
        const file = input.files[0];
        if (nameEl && file) nameEl.textContent = file.name;
        this.readImage(file, (url) => { this.formState.steps[i].image = url; this.renderSteps(); this.bindStepEvents(); });
      };
    });
    document.querySelectorAll("[data-step-text]").forEach((ta) => {
      ta.oninput = () => { this.formState.steps[+ta.dataset.stepText].text = ta.value; };
    });
  },

  readImage(file, cb) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(file);
  },

  saveForm(type) {
    const form = document.getElementById("play-save-form");
    const fd = new FormData(form);
    const id = this.editing.id ?? this.nextId[type]++;
    let record;

    if (type === "toys") {
      const toyNames = [...fd.getAll("toyName")];
      const custom = fd.get("customToy")?.trim();
      if (custom) toyNames.push(custom);
      if (!toyNames.length) { alert("Sélectionner or enter at least one toy name."); return; }
      record = { id, videoUrl: fd.get("videoUrl").trim(), toyNames };
    } else if (type === "diy") {
      if (!this.formState.steps.length) { alert("Add at least one step avec picture et text."); return; }
      record = {
        id, name: fd.get("name").trim(), tags: fd.get("tags").trim(), description: fd.get("description").trim(),
        coverImage: this.formState.coverImage, steps: this.formState.steps.map((s) => ({ ...s })),
        videoUrl: fd.get("videoUrl").trim(),
      };
    } else if (type === "printables") {
      if (!this.formState.steps.length) { alert("Add at least one step."); return; }
      if (!this.editing.id && !this.formState.pdfName) { alert("PDF file is required."); return; }
      record = {
        id, name: fd.get("name").trim(), tags: fd.get("tags").trim(), description: fd.get("description").trim(),
        coverImage: this.formState.coverImage, steps: this.formState.steps.map((s) => ({ ...s })),
        pdfName: this.formState.pdfName, pdfUrl: this.formState.pdfUrl,
      };
    } else if (type === "bobs") {
      record = { id, slot: fd.get("slot"), title: fd.get("title").trim(), videoUrl: fd.get("videoUrl").trim() };
    }

    const idx = this.data[type].findIndex((x) => x.id === id);
    if (idx >= 0) this.data[type][idx] = record;
    else this.data[type].push(record);

    this.renderAll();
    this.closeForm();
  },

  renderAll() {
    this.renderList("toys", document.getElementById("play-toys-list"), (item) => {
      const toys = item.toyNames.map((t) => `<span class="play-tag">${this.esc(t)}</span>`).join("");
      return `<div class="play-card-body"><div class="play-card-name">Video · ${item.toyNames.length} toy(s)</div><div class="play-card-meta">${this.esc(item.videoUrl)}</div><div class="play-card-tags">${toys}</div></div>`;
    }, "▶");
    this.renderList("diy", document.getElementById("play-diy-list"), (item) =>
      `<div class="play-card-body"><div class="play-card-name">${this.esc(item.name)}</div><div class="play-card-meta">${this.esc(item.description)}</div><div class="play-card-tags">${item.tags.split(",").map((t) => `<span class="play-tag">${this.esc(t.trim())}</span>`).join("")}</div><div class="play-card-meta" style="margin-top:6px">${item.steps.length} steps · video at end</div></div>`,
      item => item.coverImage
    );
    this.renderList("printables", document.getElementById("play-printables-list"), (item) => {
      const hero = this.heroFromTags(item.tags);
      return `<div class="play-card-body"><div class="play-card-name">${this.esc(item.name)}</div><div class="play-card-meta">${this.esc(item.description)}</div><div class="play-card-tags"><span class="play-tag hero-${hero}">${this.heroLabel(item.tags)}</span>${item.tags.split(",").map((t) => `<span class="play-tag">${this.esc(t.trim())}</span>`).join("")}</div><div class="play-card-meta" style="margin-top:6px">${item.steps.length} steps · PDF: ${this.esc(item.pdfName)}</div></div>`;
    }, item => item.coverImage);
    this.renderList("bobs", document.getElementById("play-bobs-list"), (item) =>
      `<div class="play-card-body"><div class="play-card-name">${this.esc(item.title || item.slot)}</div><div class="play-card-meta"><span class="play-tag">${item.slot === "video1" ? "Video 1" : "Video 2"}</span></div><div class="play-card-meta">${this.esc(item.videoUrl)}</div></div>`,
      "🎬"
    );
  },

  renderList(type, el, bodyFn, thumb) {
    if (!el) return;
    const articles = this.data[type];
    if (!articles.length) {
      el.innerHTML = `<div class="play-empty">Aucun élément pour le moment. Cliquez sur + Ajouter pour en créer un.</div>`;
      return;
    }
    el.innerHTML = articles.map((item) => {
      const thumbVal = typeof thumb === "function" ? thumb(item) : thumb;
      const thumbHtml = typeof thumbVal === "string" && thumbVal.startsWith("http")
        ? `<img class="play-card-thumb" src="${thumbVal}" alt="" />`
        : `<div class="play-card-thumb placeholder">${thumbVal || "📄"}</div>`;
      const body = typeof bodyFn === "function" ? bodyFn(item) : bodyFn;
      return `<article class="play-card">${thumbHtml}${body}<div class="play-card-actions"><button type="button" class="play-edit-btn" data-play-edit="${type}" data-play-id="${item.id}">Modifier</button><button type="button" class="play-delete-btn" data-play-delete="${type}" data-play-id="${item.id}">Supprimer</button></div></article>`;
    }).join("");
  },
};

PlayCMS.init();

const ProductsCMS = {
  listEl: document.getElementById("products-list"),
  nextId: 3,
  editingId: null,
  maxPhotos: 5,
  formState: { pictures: [], qa: [] },
  categories: [
    "Building Blocks",
    "Figurines d'action",
    "Jeux d'extérieur",
    "Books",
    "Poupées et peluches",
    "Vehicles",
    "Arts et bricolage",
    "Jeux et casse-têtes",
    "Other",
  ],
  products: [
    {
      id: 1,
      name: "MEGA BLOKS — Camion Course Et Construction (19 Pièces)",
      price: "24.99",
      description: "Le camion course et construction MEGA BLOKS combine deux jouets en un : un camion de transport à empiler et deux petites voitures de course à construire. Conçu pour les petites mains, il favorise la motricité fine et encourage l'imagination.",
      articles: [
        "1 camion de transport à construire",
        "2 voitures de course faciles à construire",
        "1 rampe de déchargement articulée",
        "19 briques et pièces au total",
        "1 guide d'assemblage illustré",
      ],
      characteristics: "Fabriqué à partir de plastique recyclé en partie. Emballage conçu pour limiter les matériaux superflus.",
      age: "1Y+",
      category: "Building Blocks",
      character: "MEGA BLOKS",
      warning: "CHOKING HAZARD — Small parts. Nont pour children under 3 yrs.",
      pictures: [
        "https://picsum.photos/seed/megabloks1/600/400",
        "https://picsum.photos/seed/megabloks2/600/400",
      ],
      whyLoveIt: [
        "Two toys in one: transport truck et buildable race cars",
        "Large pieces designed pour little hets to stack et assemble",
        "Articulated ramp rolls vehicles out pour extended racing fun",
      ],
      qa: [
        { q: "How many pieces are in the set?", a: "The coffret includes 19 blocks et pieces: 1 transport truck, 2 race cars, 1 articulated ramp, et an illustrated assembly guide." },
        { q: "Is this suitable pour a 1-year-old?", a: "Oui — MEGA BLOKS pieces are large, rounded, et designed pour little hets. Recommandé age is 1 year et up." },
      ],
      isBook: false,
    },
    {
      id: 2,
      name: "The Very Hungry Caterpillar — Board Book",
      price: "12.99",
      description: "Classic Eric Carle board book pour toddlers. Durable pages et vibrant illustrations perfect pour first reading moments.",
      articles: ["1 board book — 26 pages"],
      characteristics: "FSC-certified paperboard. Rounded corners pour little hets.",
      age: "0Y+",
      category: "Books",
      character: "",
      warning: "",
      pictures: ["https://picsum.photos/seed/book1/600/400"],
      whyLoveIt: [
        "Beloved story that tl'unitées counting et days of the week",
        "Thick board pages withstet toddler hetling",
        "Colorful collage art keeps babies engaged",
      ],
      qa: [
        { q: "What age is this book for?", a: "Recommandé from birth — ideal as a first board book pour babies et toddlers." },
      ],
      isBook: true,
    },
  ],

  init() {
    document.getElementById("products-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("order")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-product-edit]");
      if (edit) { this.openForm(+edit.dataset.productModifier); return; }
      const del = e.target.closest("[data-product-delete]");
      if (del) this.deleteProduct(+del.dataset.productSupprimer);
    });
    document.getElementById("product-form-close")?.addEventListener("click", () => this.closeForm());
    document.getElementById("product-form-backdrop")?.addEventListener("click", () => this.closeForm());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("product-form-page")?.classList.contains("open")) this.closeForm();
    });
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  lines(arr) {
    return (arr || []).join("\
");
  },

  parseLines(text) {
    return text.split("\
").map((l) => l.trim()).filter(Boolean);
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.products.find((p) => p.id === id) : null;
    this.formState = {
      pictures: item?.pictures ? [...item.pictures] : [],
      qa: item?.qa?.length ? item.qa.map((x) => ({ ...x })) : [{ q: "", a: "" }],
    };
    const catOpts = this.categories.map((c) =>
      `<option value="${this.esc(c)}" ${item?.category === c ? "selected" : ""}>${this.esc(c)}</option>`
    ).join("");

    document.getElementById("product-form-title").textContent = id ? "Modifier le produit" : "Ajouter un produit";
    document.getElementById("product-form-body").innerHTML = `
      <form id="product-save-form">
        <div class="product-form-section">Basic info</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-name">Nom</label>
          <input type="text" id="product-name" name="name" required value="${this.esc(item?.name || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-price">Prix</label>
          <input type="text" id="product-price" name="price" required placeholder="24.99" value="${this.esc(item?.price || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-category">Catégorie</label>
          <select id="product-category" name="category" required>${catOpts}</select>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-character">Character (optional)</label>
          <input type="text" id="product-character" name="character" placeholder="Spider-Man, MEGA BLOKS…" value="${this.esc(item?.character || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-age">Âge</label>
          <input type="text" id="product-age" name="age" required placeholder="1Y+" value="${this.esc(item?.age || "")}" />
        </div>
        <div class="play-form-field produit-check-row">
          <input type="checkbox" id="product-is-book" name="isBook" ${item?.isBook ? "checked" : ""} />
          <label for="product-is-book">This produit is a book</label>
        </div>

        <div class="product-form-section">Description & details</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-description">Description</label>
          <textarea id="product-description" name="description" required rows="4">${this.esc(item?.description || "")}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-articles">Box articles (one per line)</label>
          <textarea id="product-articles" name="articles" rows="4" placeholder="1 camion à construire&#10;2 voitures de course">${this.esc(this.lines(item?.articles))}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-characteristics">Characteristics</label>
          <textarea id="product-characteristics" name="characteristics" rows="3" placeholder="Environmental qualities, materials…">${this.esc(item?.characteristics || "")}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-warning">Warning (optional)</label>
          <textarea id="product-warning" name="warning" rows="2" placeholder="Leave empty if no warning">${this.esc(item?.warning || "")}</textarea>
        </div>

        <div class="product-form-section">Pictures (1–5)</div>
        <div class="review-field review-photo-upload">
          <input type="file" class="review-photo-input file-upload-input" id="product-pictures-input" accept="image/*" multiple tabindex="-1" />
          <button type="button" class="review-photo-label file-upload-btn" id="product-pictures-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Choisir des fichiers
          </button>
          <p class="review-photo-hint" id="product-pictures-hint">0 / 5 photos (minimum 1)</p>
          <div class="review-photo-previews" id="product-pictures-previews"></div>
        </div>

        <div class="product-form-section">Why they'll love it</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-why">Bullet points (one per line)</label>
          <textarea id="product-why" name="whyLoveIt" rows="4" placeholder="Two toys in one…">${this.esc(this.lines(item?.whyLoveIt))}</textarea>
        </div>

        <div class="product-form-section">Customer Q&amp;A</div>
        <div id="product-qa-list"></div>
        <button type="button" class="play-add-step-btn" id="product-add-qa">+ Add Q&amp;A</button>

        <p class="play-form-file-name" id="product-form-error" style="color:#EF4444;display:none"></p>
        <div class="review-half-actions">
          <button type="submit" class="primary-btn">Enregistrer</button>
          <button type="button" class="back-btn" id="product-form-cancel">Annuler</button>
        </div>
      </form>`;

    document.getElementById("product-save-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm(new FormData(e.target));
    });
    document.getElementById("product-form-cancel")?.addEventListener("click", () => this.closeForm());
    document.getElementById("product-add-qa")?.addEventListener("click", () => {
      this.formState.qa.push({ q: "", a: "" });
      this.renderQa();
      this.bindQa();
    });
    document.getElementById("product-pictures-btn")?.addEventListener("click", () => {
      document.getElementById("product-pictures-input")?.click();
    });
    document.getElementById("product-pictures-input")?.addEventListener("change", () => this.handlePhotos());
    document.getElementById("product-pictures-previews")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove-product-photo]");
      if (!btn) return;
      this.formState.pictures.splice(+btn.dataset.removeProductPhoto, 1);
      this.renderPhotoPreviews();
      this.updatePhotoUI();
    });

    this.renderQa();
    this.bindQa();
    this.renderPhotoPreviews();
    this.updatePhotoUI();

    document.getElementById("product-form-page").classList.add("open");
    scrollDrawerBodyToTop("product-form-page");
    document.getElementById("product-form-page").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("product-name")?.focus();
  },

  closeForm() {
    document.getElementById("product-form-page")?.classList.remove("open");
    document.getElementById("product-form-page")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.editingId = null;
  },

  handlePhotos() {
    const input = document.getElementById("product-pictures-input");
    const body = document.getElementById("product-form-body");
    const scrollBefore = body?.scrollTop ?? 0;
    const files = [...(input?.files || [])];
    if (!files.length) return;
    const remaining = this.maxPhotos - this.formState.pictures.length;
    let pending = Math.min(files.length, remaining);
    if (!pending) return;

    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.formState.pictures.length < this.maxPhotos && typeof reader.result === "string") {
          this.formState.pictures.push(reader.result);
          this.renderPhotoPreviews();
          this.updatePhotoUI();
        }
        pending -= 1;
        if (pending <= 0 && body) body.scrollTop = scrollBefore;
      };
      reader.onerror = () => {
        pending -= 1;
        if (pending <= 0 && body) body.scrollTop = scrollBefore;
      };
      reader.readAsDataURL(file);
    });
    if (input) input.value = "";
  },

  renderPhotoPreviews() {
    const el = document.getElementById("product-pictures-previews");
    if (!el) return;
    el.replaceChildren();
    this.formState.pictures.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "review-photo-preview-item";
      const img = document.createElement("img");
      img.alt = `Product photo ${i + 1}`;
      img.src = src;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "review-photo-remove";
      btn.dataset.removeProductPhoto = String(i);
      btn.setAttribute("aria-label", `Supprimer la photo ${i + 1}`);
      btn.textContent = "×";
      item.append(img, btn);
      el.append(item);
    });
    el.classList.toggle("visible", this.formState.pictures.length > 0);
  },

  updatePhotoUI() {
    const n = this.formState.pictures.length;
    const hint = document.getElementById("product-pictures-hint");
    const btn = document.getElementById("product-pictures-btn");
    if (hint) hint.textContent = `${n} / ${this.maxPhotos} photos (minimum 1)`;
    if (btn) btn.classList.toggle("disabled", n >= this.maxPhotos);
  },

  renderQa() {
    const list = document.getElementById("product-qa-list");
    if (!list) return;
    list.innerHTML = this.formState.qa.map((row, i) => `
      <div class="product-qa-row" data-qa="${i}">
        <div class="product-qa-row-head">
          <span class="product-qa-label">Q&amp;A ${i + 1}</span>
          ${this.formState.qa.length > 1 ? `<button type="button" class="play-step-remove" data-remove-qa="${i}">Supprimer</button>` : ""}
        </div>
        <input type="text" data-qa-q="${i}" placeholder="Question" value="${this.esc(row.q)}" />
        <textarea data-qa-a="${i}" placeholder="Answer" rows="2">${this.esc(row.a)}</textarea>
      </div>`).join("");
  },

  bindQa() {
    document.querySelectorAll("[data-remove-qa]").forEach((btn) => {
      btn.onclick = () => {
        this.formState.qa.splice(+btn.dataset.removeQa, 1);
        this.renderQa();
        this.bindQa();
      };
    });
    document.querySelectorAll("[data-qa-q]").forEach((input) => {
      input.oninput = () => { this.formState.qa[+input.dataset.qaQ].q = input.value; };
    });
    document.querySelectorAll("[data-qa-a]").forEach((ta) => {
      ta.oninput = () => { this.formState.qa[+ta.dataset.qaA].a = ta.value; };
    });
  },

  collectQaFromDom() {
    document.querySelectorAll("[data-qa-q]").forEach((input) => {
      this.formState.qa[+input.dataset.qaQ].q = input.value.trim();
    });
    document.querySelectorAll("[data-qa-a]").forEach((ta) => {
      this.formState.qa[+ta.dataset.qaA].a = ta.value.trim();
    });
    return this.formState.qa.filter((x) => x.q && x.a);
  },

  saveForm(fd) {
    const errEl = document.getElementById("product-form-error");
    const name = (fd.get("name") || "").toString().trim();
    const price = (fd.get("price") || "").toString().trim();
    const category = (fd.get("category") || "").toString().trim();
    const character = (fd.get("character") || "").toString().trim();
    const age = (fd.get("age") || "").toString().trim();
    const description = (fd.get("description") || "").toString().trim();
    const characteristics = (fd.get("characteristics") || "").toString().trim();
    const warning = (fd.get("warning") || "").toString().trim();
    const isBook = fd.get("isBook") === "on";
    const articles = this.parseLines((fd.get("articles") || "").toString());
    const whyLoveIt = this.parseLines((fd.get("whyLoveIt") || "").toString());
    const qa = this.collectQaFromDom();

    if (!name || !price || !description || !age) return;
    if (!this.formState.pictures.length) {
      if (errEl) { errEl.textContent = "Please add at least 1 picture (max 5)."; errEl.style.display = "block"; }
      return;
    }

    const payload = {
      name, price, category, character, age, description, characteristics, warning,
      articles, whyLoveIt, qa, isBook,
      pictures: [...this.formState.pictures],
    };

    if (this.editingId) {
      const idx = this.products.findIndex((p) => p.id === this.editingId);
      if (idx >= 0) this.products[idx] = { ...this.products[idx], ...payload };
    } else {
      this.products.push({ id: this.nextId++, ...payload });
    }
    this.closeForm();
    this.render();
  },

  deleteProduct(id) {
    if (!confirm("Supprimer ce produit ?")) return;
    this.products = this.products.filter((p) => p.id !== id);
    this.render();
  },

  render() {
    if (!this.listEl) return;
    if (!this.products.length) {
      this.listEl.innerHTML = `<div class="play-empty">Aucun produit pour le moment. Cliquez sur + Ajouter un produit pour en créer un.</div>`;
      return;
    }
    this.listEl.innerHTML = this.products.map((p) => {
      const thumb = p.pictures?.[0]
        ? `<img src="${this.esc(p.pictures[0])}" alt="" />`
        : `<svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.09 0 1.91.91 1.91 2s-.82 2-1.91 2-1.91-.91-1.91-2 .82-2 1.91-2zM20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z"/></svg>`;
      const bookTag = p.isBook ? `<span class="product-card-tag book">Book</span>` : "";
      return `<article class="product-card">
        <div class="product-thumb-lg" ${p.pictures?.[0] ? "" : 'style="background:linear-gradient(135deg,#DBEAFE,#93C5FD)"'}>${thumb}</div>
        <div class="product-card-body">
          <div class="product-card-name">${this.esc(p.name)}</div>
          <div class="product-card-meta">${this.esc(p.price)} DZD · ${this.esc(p.category)}</div>
          ${bookTag}
        </div>
        <div class="product-card-actions">
          <button type="button" class="edit-btn" data-product-edit="${p.id}">Modifier</button>
          <button type="button" class="user-delete-btn" data-product-delete="${p.id}">Supprimer</button>
        </div>
      </article>`;
    }).join("");
  },
};

ProductsCMS.init();

const GrossisteCMS = {
  listEl: document.getElementById("grossiste-list"),
  nextId: 4,
  editingId: null,
  formState: { picture: "", pdfName: "", pdfUrl: "" },
  articles: [
    {
      id: 1,
      title: "Catalogue promotions",
      buttonSentence: "Télécharger mon catalogue",
      picture: "https://res.cloudinary.com/dbtkfjrvd/image/upload/w_393,h_200,c_fill/v1782124177/Design_sans_titre_15_lqrnsx.png",
      pdfName: "catalogue-promotions-1.pdf",
      pdfUrl: "#",
    },
    {
      id: 2,
      title: "Catalogue jouets été",
      buttonSentence: "Télécharger mon catalogue",
      picture: "https://res.cloudinary.com/dbtkfjrvd/image/upload/w_393,h_200,c_fill/v1782124182/Design_sans_titre_16_xzh6cv.png",
      pdfName: "catalogue-ete.pdf",
      pdfUrl: "#",
    },
    {
      id: 3,
      title: "Catalogue blocs & construction",
      buttonSentence: "Voir le PDF",
      picture: "https://res.cloudinary.com/dbtkfjrvd/image/upload/w_393,h_200,c_fill/v1782124188/Design_sans_titre_17_a0a8bp.png",
      pdfName: "catalogue-blocs.pdf",
      pdfUrl: "#",
    },
  ],

  init() {
    document.getElementById("grossiste-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("grossiste")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-grossiste-edit]");
      if (edit) { this.openForm(+edit.dataset.grossisteModifier); return; }
      const del = e.target.closest("[data-grossiste-delete]");
      if (del) this.deleteItem(+del.dataset.grossisteSupprimer);
    });
    document.getElementById("grossiste-form-close")?.addEventListener("click", () => this.closeForm());
    document.getElementById("grossiste-form-backdrop")?.addEventListener("click", () => this.closeForm());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("grossiste-form-page")?.classList.contains("open")) this.closeForm();
    });
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  fileField(opts) {
    return PlayCMS.fileField(opts);
  },

  bindFileInput(id, onFile) {
    PlayCMS.bindFileInput(id, onFile);
  },

  readImage(file, cb) {
    PlayCMS.readImage(file, cb);
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.articles.find((x) => x.id === id) : null;
    this.formState = {
      picture: item?.picture || "",
      pdfName: item?.pdfName || "",
      pdfUrl: item?.pdfUrl || "",
    };
    document.getElementById("grossiste-form-title").textContent = id ? "Modifier Catalogue" : "Add Catalogue";
    document.getElementById("grossiste-form-body").innerHTML = `
      <form id="grossiste-save-form">
        <div class="play-form-field">
          <label class="play-form-label">Card picture</label>
          ${this.fileField({ id: "grossiste-picture-file", name: "pictureFile", accept: "image/*", required: !item })}
          <img class="play-form-preview ${this.formState.picture ? "visible" : ""}" id="grossiste-picture-preview" src="${this.formState.picture || ""}" alt="" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="grossiste-title">Title</label>
          <input type="text" id="grossiste-title" name="title" required placeholder="Catalogue promotions" value="${this.esc(item?.title || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="grossiste-button">Button sentence</label>
          <input type="text" id="grossiste-button" name="buttonSentence" required placeholder="Télécharger mon catalogue" value="${this.esc(item?.buttonSentence || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label">PDF file</label>
          ${this.fileField({ id: "grossiste-pdf-file", name: "pdfFile", accept: ".pdf,application/pdf", required: !item, fileName: this.formState.pdfName || "" })}
        </div>
        <p class="play-form-file-name" id="grossiste-form-error" style="color:#EF4444;display:none"></p>
        <div class="review-half-actions">
          <button type="submit" class="primary-btn">Enregistrer</button>
          <button type="button" class="back-btn" id="grossiste-form-cancel">Annuler</button>
        </div>
      </form>`;
    document.getElementById("grossiste-save-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm(new FormData(e.target));
    });
    document.getElementById("grossiste-form-cancel")?.addEventListener("click", () => this.closeForm());
    this.bindFileInput("grossiste-picture-file", (file) => this.readImage(file, (url) => {
      this.formState.picture = url;
      const img = document.getElementById("grossiste-picture-preview");
      if (img) { img.src = url; img.classList.add("visible"); }
    }));
    this.bindFileInput("grossiste-pdf-file", (file) => {
      if (file) {
        this.formState.pdfName = file.name;
        this.formState.pdfUrl = file.name;
      }
    });
    document.getElementById("grossiste-form-page").classList.add("open");
    scrollDrawerBodyToTop("grossiste-form-page");
    document.getElementById("grossiste-form-page").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("grossiste-title")?.focus();
  },

  closeForm() {
    document.getElementById("grossiste-form-page")?.classList.remove("open");
    document.getElementById("grossiste-form-page")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.editingId = null;
  },

  saveForm(fd) {
    const title = (fd.get("title") || "").toString().trim();
    const buttonSentence = (fd.get("buttonSentence") || "").toString().trim();
    const errEl = document.getElementById("grossiste-form-error");
    if (!title || !buttonSentence) return;

    if (!this.formState.picture) {
      if (errEl) { errEl.textContent = "Please add a card picture."; errEl.style.display = "block"; }
      return;
    }
    if (!this.editingId && !this.formState.pdfName) {
      if (errEl) { errEl.textContent = "Please add a PDF file."; errEl.style.display = "block"; }
      return;
    }

    const payload = {
      title,
      buttonSentence,
      picture: this.formState.picture,
      pdfName: this.formState.pdfName || "catalogue.pdf",
      pdfUrl: this.formState.pdfUrl || "#",
    };

    if (this.editingId) {
      const idx = this.articles.findIndex((x) => x.id === this.editingId);
      if (idx >= 0) this.articles[idx] = { ...this.articles[idx], ...payload };
    } else {
      this.articles.push({ id: this.nextId++, ...payload });
    }
    this.closeForm();
    this.render();
  },

  deleteItem(id) {
    if (!confirm("Supprimer cette fiche catalogue ?")) return;
    this.articles = this.articles.filter((x) => x.id !== id);
    this.render();
  },

  render() {
    if (!this.listEl) return;
    if (!this.articles.length) {
      this.listEl.innerHTML = `<div class="play-empty">Non catalogues yet. Click + Ajouter un catalogue to create one.</div>`;
      return;
    }
    this.listEl.innerHTML = this.articles.map((item) => `
      <article class="grossiste-card">
        <div class="grossiste-card-visual">
          <img src="${this.esc(item.picture)}" alt="${this.esc(item.title)}" />
          <div class="grossiste-card-caption">
            <h3 class="grossiste-card-title">${this.esc(item.title)}</h3>
            <span class="grossiste-btn-preview">${this.esc(item.buttonSentence)}</span>
          </div>
        </div>
        <div class="grossiste-card-foot">
          <span class="grossiste-pdf-name">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
            ${this.esc(item.pdfName)}
          </span>
          <div class="grossiste-card-actions">
            <button type="button" class="user-edit-btn" data-grossiste-edit="${item.id}">Modifier</button>
            <button type="button" class="user-delete-btn" data-grossiste-delete="${item.id}">Supprimer</button>
          </div>
        </div>
      </article>`).join("");
  },
};

GrossisteCMS.init();

const UsersCMS = {
  listEl: document.getElementById("users-list"),
  nextId: 6,
  editingId: null,
  avatarGradients: [
    "linear-gradient(135deg,#BFDBFE,#3B82F6)",
    "linear-gradient(135deg,#D1FAE5,#10B981)",
    "linear-gradient(135deg,#FEF3C7,#F59E0B)",
    "linear-gradient(135deg,#E9D5FF,#A78BFA)",
    "linear-gradient(135deg,#FEE2E2,#F87171)",
    "linear-gradient(135deg,#CFFAFE,#06B6D4)",
  ],
  users: [
    { id: 1, name: "Alex Johnson", email: "alex@adol.com" },
    { id: 2, name: "Sarah Miller", email: "sarah@adol.com" },
    { id: 3, name: "James Davis", email: "james@adol.com" },
    { id: 4, name: "Emma Kim", email: "emma@adol.com" },
    { id: 5, name: "Marcus Reed", email: "marcus@adol.com" },
  ],

  init() {
    document.getElementById("users-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("users")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-user-edit]");
      if (edit) { this.openForm(+edit.dataset.userModifier); return; }
      const del = e.target.closest("[data-user-delete]");
      if (del) this.deleteUser(+del.dataset.userSupprimer);
    });
    document.getElementById("users-form-close")?.addEventListener("click", () => this.closeForm());
    document.getElementById("users-form-backdrop")?.addEventListener("click", () => this.closeForm());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("users-form-page")?.classList.contains("open")) this.closeForm();
    });
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  initials(name) {
    return name.trim().split(/\\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "?";
  },

  avatarBg(id) {
    return this.avatarGradients[(id - 1) % this.avatarGradients.length];
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.users.find((u) => u.id === id) : null;
    document.getElementById("users-form-title").textContent = id ? "Modifier User" : "Add User";
    document.getElementById("users-form-body").innerHTML = `
      <form id="users-save-form">
        <div class="play-form-field">
          <label class="play-form-label" for="user-name">Nom</label>
          <input type="text" id="user-name" name="name" required placeholder="Nom complet" value="${this.esc(item?.name || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="user-email">E-mail</label>
          <input type="email" id="user-email" name="email" required placeholder="name@example.com" value="${this.esc(item?.email || "")}" />
        </div>
        <p class="play-form-file-name" id="users-form-error" style="color:#EF4444;display:none"></p>
        <div class="review-half-actions">
          <button type="submit" class="primary-btn">Enregistrer</button>
          <button type="button" class="back-btn" id="users-form-cancel">Annuler</button>
        </div>
      </form>`;
    document.getElementById("users-save-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm(new FormData(e.target));
    });
    document.getElementById("users-form-cancel")?.addEventListener("click", () => this.closeForm());
    document.getElementById("users-form-page").classList.add("open");
    scrollDrawerBodyToTop("users-form-page");
    document.getElementById("users-form-page").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("user-name")?.focus();
  },

  closeForm() {
    document.getElementById("users-form-page")?.classList.remove("open");
    document.getElementById("users-form-page")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.editingId = null;
  },

  saveForm(fd) {
    const name = (fd.get("name") || "").toString().trim();
    const email = (fd.get("email") || "").toString().trim().toLowerCase();
    const errEl = document.getElementById("users-form-error");
    if (!name || !email) return;

    const duplicate = this.users.find((u) => u.email === email && u.id !== this.editingId);
    if (duplicate) {
      if (errEl) {
        errEl.textContent = "This email is already used by another user.";
        errEl.style.display = "block";
      }
      return;
    }

    if (this.editingId) {
      const idx = this.users.findIndex((u) => u.id === this.editingId);
      if (idx >= 0) this.users[idx] = { ...this.users[idx], name, email };
    } else {
      this.users.push({ id: this.nextId++, name, email });
    }
    this.closeForm();
    this.render();
  },

  deleteUser(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    this.users = this.users.filter((u) => u.id !== id);
    this.render();
  },

  render() {
    if (!this.listEl) return;
    if (!this.users.length) {
      this.listEl.innerHTML = `<div class="users-empty">Non users yet. Click + Ajouter un utilisateur to create one.</div>`;
      return;
    }
    this.listEl.innerHTML = this.users.map((user) => `
      <div class="users-row">
        <div class="user-cell">
          <div class="user-avatar" style="background:${this.avatarBg(user.id)}">${this.initials(user.name)}</div>
          <span class="user-name">${this.esc(user.name)}</span>
        </div>
        <span class="user-email">${this.esc(user.email)}</span>
        <div class="users-actions">
          <button type="button" class="user-edit-btn" data-user-edit="${user.id}">Modifier</button>
          <button type="button" class="user-delete-btn" data-user-delete="${user.id}">Supprimer</button>
        </div>
      </div>`).join("");
  },
};

UsersCMS.init();

const StoresCMS = {
  listEl: document.getElementById("stores-list"),
  countEl: document.getElementById("stores-count"),
  nextId: 4,
  editingId: null,
  stores: [
    {
      id: 1,
      name: "AJ BLOKS — Bab Ezzouar",
      location: "Centre Commercial Bab Ezzouar, Alger, Algérie",
      website: "https://ajbloks.dz",
    },
    {
      id: 2,
      name: "AJ BLOKS — Hydra",
      location: "12 Chemin des Crêtes, Hydra, Alger, Algérie",
      website: "",
    },
    {
      id: 3,
      name: "AJ BLOKS — Oran",
      location: "Es Senia, Oran, Algérie",
      website: "https://ajbloks.dz/stores/oran",
    },
  ],

  init() {
    document.getElementById("stores-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("stores")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-store-edit]");
      if (edit) { this.openForm(+edit.dataset.storeModifier); return; }
      const del = e.target.closest("[data-store-delete]");
      if (del) this.deleteStore(+del.dataset.storeSupprimer);
    });
    document.getElementById("stores-form-close")?.addEventListener("click", () => this.closeForm());
    document.getElementById("stores-form-backdrop")?.addEventListener("click", () => this.closeForm());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("stores-form-page")?.classList.contains("open")) this.closeForm();
    });
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  formatSiteWeb(url) {
    if (!url) return "";
    return /^https?:\/\/i.test(url) ? url : "https://" + url;
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.stores.find((s) => s.id === id) : null;
    document.getElementById("stores-form-title").textContent = id ? "Modifier Store" : "Add Store";
    document.getElementById("stores-form-body").innerHTML = `
      <form id="stores-save-form">
        <div class="play-form-field">
          <label class="play-form-label" for="store-name">Store name</label>
          <input type="text" id="store-name" name="name" required placeholder="e.g. AJ BLOKS — Bab Ezzouar" value="${this.esc(item?.name || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="store-location">Location</label>
          <textarea id="store-location" name="location" required placeholder="Full address, city, country" rows="3">${this.esc(item?.location || "")}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="store-website">Site web (optional)</label>
          <input type="url" id="store-website" name="website" placeholder="https://example.com" value="${this.esc(item?.website || "")}" />
          <span class="play-form-file-name">Leave empty if this store has no website.</span>
        </div>
        <div class="review-half-actions">
          <button type="submit" class="primary-btn">Enregistrer</button>
          <button type="button" class="back-btn" id="stores-form-cancel">Annuler</button>
        </div>
      </form>`;
    document.getElementById("stores-save-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveForm(new FormData(e.target));
    });
    document.getElementById("stores-form-cancel")?.addEventListener("click", () => this.closeForm());
    document.getElementById("stores-form-page").classList.add("open");
    scrollDrawerBodyToTop("stores-form-page");
    document.getElementById("stores-form-page").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("store-name")?.focus();
  },

  closeForm() {
    document.getElementById("stores-form-page")?.classList.remove("open");
    document.getElementById("stores-form-page")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    this.editingId = null;
  },

  saveForm(fd) {
    const name = (fd.get("name") || "").toString().trim();
    const location = (fd.get("location") || "").toString().trim();
    const website = (fd.get("website") || "").toString().trim();
    if (!name || !location) return;

    const payload = { name, location, website };
    if (this.editingId) {
      const idx = this.stores.findIndex((s) => s.id === this.editingId);
      if (idx >= 0) this.stores[idx] = { ...this.stores[idx], ...payload };
    } else {
      this.stores.push({ id: this.nextId++, ...payload });
    }
    this.closeForm();
    this.render();
  },

  deleteStore(id) {
    if (!confirm("Supprimer ce magasin de la liste ?")) return;
    this.stores = this.stores.filter((s) => s.id !== id);
    this.render();
  },

  render() {
    if (!this.listEl) return;
    const withSite = this.stores.filter((s) => s.website).length;
    if (this.countEl) {
      this.countEl.innerHTML = `<strong>${this.stores.length}</strong> store${this.stores.length === 1 ? "" : "s"} · <strong>${withSite}</strong> avec website`;
    }
    if (!this.stores.length) {
      this.listEl.innerHTML = `<div class="play-empty">Non stores yet. Click + Add Store to create one.</div>`;
      return;
    }
    this.listEl.innerHTML = this.stores.map((store) => {
      const site = store.website
        ? `<a class="store-card-link" href="${this.esc(this.formatSiteWeb(store.website))}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Site web</a>`
        : `<span class="play-card-meta">Non website</span>`;
      return `<article class="play-card">
        <div class="play-card-thumb placeholder">📍</div>
        <div class="play-card-body">
          <div class="play-card-name">${this.esc(store.name)}</div>
          <div class="play-card-meta">${this.esc(store.location)}</div>
          ${site}
        </div>
        <div class="play-card-actions">
          <button type="button" class="play-edit-btn" data-store-edit="${store.id}">Modifier</button>
          <button type="button" class="play-delete-btn" data-store-delete="${store.id}">Supprimer</button>
        </div>
      </article>`;
    }).join("");
  },
};

StoresCMS.init();

const _tabActivate = TabNav.activate.bind(TabNav);
TabNav.activate = function (screenId, updateHash) {
  if (screenId !== "reviews") ReviewAddPanel.close();
  if (screenId !== "play") PlayCMS.closeForm();
  if (screenId !== "order") ProductsCMS.closeForm();
  if (screenId !== "grossiste") GrossisteCMS.closeForm();
  if (screenId !== "users") UsersCMS.closeForm();
  if (screenId !== "stores") StoresCMS.closeForm();
  if (TabNav.tabs.find((t) => t.classList.contains("active"))?.dataset.screen === "account" && screenId !== "account") {
    AccountNav.reset();
  }
  _tabActivate(screenId, updateHash);
};

window.ProductsCMS = ProductsCMS;
window.UsersCMS = UsersCMS;
window.StoresCMS = StoresCMS;
window.GrossisteCMS = GrossisteCMS;
window.PlayCMS = PlayCMS;
window.ReviewModeration = ReviewModeration;
window.PromoBarParamètres = PromoBarParamètres;
