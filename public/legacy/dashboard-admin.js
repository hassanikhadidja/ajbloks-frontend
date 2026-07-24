

function scrollDrawerBodyToTop(pageId) {
  const pageEl = typeof pageId === "string" ? document.getElementById(pageId) : pageId;
  const bodyEl = pageEl?.querySelector(".review-half-body");
  if (bodyEl) bodyEl.scrollTop = 0;
}

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

const ReviewModeration = {
  pendingList: document.getElementById("reviews-pending-list"),
  publishedList: document.getElementById("reviews-published-list"),
  pendingCountEl: document.getElementById("review-pending-count"),
  publishedCountEl: document.getElementById("review-published-count"),
  avgNonteEl: document.getElementById("review-avg-rating"),
  reviews: [],

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
    const id = card.dataset.reviewId;
    if (acceptBtn) this.accept(id);
    else if (removeBtn) this.remove(id);
  },

  accept(id) {
    const review = this.reviews.find((r) => String(r.id) === String(id));
    if (!review || review.status !== "pending") return;
    review.status = "published";
    this.render();
  },

  remove(id) {
    this.reviews = this.reviews.filter((r) => String(r.id) !== String(id));
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
            <div class="review-product">${this.escape(review.productName || review.produitName || "")}</div>
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
    if (!userName || !produitName || !comment || !this.moderation) return;
    if (this.photos.length < 1 || this.photos.length > this.maxPhotos) return;

    Promise.resolve(
      this.moderation.addReview({
        userName,
        productName: produitName,
        comment,
        stars,
        photos: [...this.photos],
        date: this.formatDate(new Date()),
      }),
    ).then(() => {
      this.resetForm();
      this.close();
    });
  },
};

ReviewAddPanel.init(ReviewModeration);

const PlayCMS = {
  toyCatalog: [],
  nextId: { toys: 1, diy: 1, printables: 1, bobs: 1 },
  data: {
    toys: [],
    diy: [],
    printables: [],
    bobs: [],
  },
  activeTab: "toys",
  editing: null,
  formState: { steps: [], coverImage: "", pdfName: "", pdfUrl: "", pdfSource: "upload" },

  isExternalPdfUrl(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  },

  normalizePdfLink(url) {
    const u = (url || "").trim();
    if (!u) return "";
    const blob = u.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if (blob) {
      return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
    }
    return u;
  },

  pdfNameFromUrl(url) {
    try {
      const name = decodeURIComponent(new URL(url.trim()).pathname.split("/").pop() || "");
      return name || "document.pdf";
    } catch {
      return "document.pdf";
    }
  },

  togglePdfSource(prefix, mode) {
    const upload = document.getElementById(prefix + "-pdf-upload-wrap");
    const link = document.getElementById(prefix + "-pdf-link-wrap");
    if (upload) upload.hidden = mode === "link";
    if (link) link.hidden = mode !== "link";
    this.formState.pdfSource = mode;
  },

  resolvePdfFromForm(fd, opts) {
    const options = opts || { required: true };
    const source = (fd.get("pdfSource") || "upload").toString();
    if (source === "link") {
      const link = this.normalizePdfLink((fd.get("pdfLink") || "").toString());
      if (!this.isExternalPdfUrl(link)) {
        return { error: "Ajoutez un lien PDF valide (GitHub ou URL directe)." };
      }
      return {
        pdfUrl: link,
        pdfName: (fd.get("pdfDisplayName") || "").toString().trim() || this.pdfNameFromUrl(link),
      };
    }
    if (options.required && !this.editing?.id && !this.formState.pdfUrl) {
      return { error: "Ajoutez un fichier PDF." };
    }
    if (!this.formState.pdfUrl) {
      return { pdfUrl: "", pdfName: "" };
    }
    return {
      pdfUrl: this.formState.pdfUrl,
      pdfName: this.formState.pdfName || "document.pdf",
    };
  },

  pdfDocumentField(prefix, article, required) {
    const pdfSource = this.isExternalPdfUrl(article?.pdfUrl || this.formState.pdfUrl)
      ? "link"
      : (this.formState.pdfSource || "upload");
    const pdfLink = pdfSource === "link" ? (article?.pdfUrl || this.formState.pdfUrl || "") : "";
    const reqLabel = required ? " (requis, max 20 Mo)" : " (optionnel)";
    return `
      <div class="play-form-field">
        <label class="play-form-label">Document PDF${reqLabel}</label>
        <div class="grossiste-pdf-source">
          <label><input type="radio" name="pdfSource" value="upload" ${pdfSource === "upload" ? "checked" : ""} /> Téléverser un fichier</label>
          <label><input type="radio" name="pdfSource" value="link" ${pdfSource === "link" ? "checked" : ""} /> Lien PDF (GitHub)</label>
        </div>
        <div id="${prefix}-pdf-upload-wrap" ${pdfSource === "link" ? "hidden" : ""}>
          ${this.fileField({ id: prefix + "-pdf-file", name: "pdfFile", accept: ".pdf,application/pdf", required: false, fileName: pdfSource === "upload" ? (this.formState.pdfName || "") : "" })}
        </div>
        <div id="${prefix}-pdf-link-wrap" class="grossiste-pdf-link-wrap" ${pdfSource === "upload" ? "hidden" : ""}>
          <label class="play-form-label" for="${prefix}-pdf-link">URL du PDF</label>
          <input type="url" id="${prefix}-pdf-link" name="pdfLink" placeholder="https://github.com/.../file.pdf ou raw.githubusercontent.com/..." value="${this.esc(pdfLink)}" />
          <label class="play-form-label" for="${prefix}-pdf-display-name">Nom affiché (optionnel)</label>
          <input type="text" id="${prefix}-pdf-display-name" name="pdfDisplayName" placeholder="activite.pdf" value="${this.esc(pdfSource === "link" ? (article?.pdfName || this.formState.pdfName || "") : "")}" />
          <p class="grossiste-pdf-hint">Collez un lien GitHub (page ou raw). Les liens « blob » sont convertis automatiquement en lien direct.</p>
        </div>
      </div>`;
  },

  bindPdfDocumentField(prefix) {
    document.querySelectorAll('#play-save-form input[name="pdfSource"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) this.togglePdfSource(prefix, radio.value);
      });
    });
    this.bindFileInput(prefix + "-pdf-file", (file) => {
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        alert("PDF trop volumineux (max 20 Mo).");
        const pdfInput = document.getElementById(prefix + "-pdf-file");
        if (pdfInput) pdfInput.value = "";
        const pdfNameEl = document.getElementById(prefix + "-pdf-file-name");
        if (pdfNameEl) pdfNameEl.textContent = "";
        this.formState.pdfName = "";
        this.formState.pdfUrl = "";
        return;
      }
      this.formState.pdfName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.formState.pdfUrl = typeof reader.result === "string" ? reader.result : file.name;
      };
      reader.readAsDataURL(file);
    });
  },

  init() {
    document.getElementById("play-subtabs")?.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-play-tab]");
      if (tab) this.switchTab(tab.dataset.playTab);
    });
    document.getElementById("play")?.addEventListener("click", (e) => {
      const add = e.target.closest("[data-play-add]");
      if (add) { this.openForm(add.dataset.playAdd); return; }
      const edit = e.target.closest("[data-play-edit]");
      if (edit) { this.openForm(edit.dataset.playEdit, edit.dataset.playId); return; }
      const del = e.target.closest("[data-play-delete]");
      if (del) { this.deleteItem(del.dataset.playDelete, del.dataset.playId); return; }
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
    this.data[type] = (this.data[type] || []).filter((x) => String(x.id) !== String(id));
    this.renderAll();
  },

  openForm(type, id) {
    this.editing = { type, id: id ?? null };
    const item = id != null && id !== "" ? (this.data[type] || []).find((x) => String(x.id) === String(id)) : null;
    this.formState = {
      steps: item?.steps ? item.steps.map((s) => ({ ...s })) : [],
      coverImage: item?.coverImage || "",
      pdfName: item?.pdfName || "",
      pdfUrl: item?.pdfUrl || "",
      pdfSource: this.isExternalPdfUrl(item?.pdfUrl) ? "link" : "upload",
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
      ${this.pdfDocumentField("play-diy", article, false)}
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
      ${this.pdfDocumentField("play-print", article, true)}
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
    if (type === "diy") {
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
      this.bindPdfDocumentField("play-diy");
    } else if (type === "printables") {
      this.bindFileInput("play-cover-file", (file) => this.readImage(file, (url) => {
        this.formState.coverImage = url;
        const img = document.getElementById("play-cover-preview");
        if (img) { img.src = url; img.classList.add("visible"); }
      }));
      document.getElementById("play-print-tags")?.addEventListener("input", (e) => {
        document.getElementById("play-hero-hint").textContent = "Hero section: " + this.heroLabel(e.target.value);
      });
      this.bindPdfDocumentField("play-print");
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
      const pdfResolved = this.resolvePdfFromForm(fd, { required: false });
      if (pdfResolved.error) { alert(pdfResolved.error); return; }
      record = {
        id, name: fd.get("name").trim(), tags: fd.get("tags").trim(), description: fd.get("description").trim(),
        coverImage: this.formState.coverImage, steps: this.formState.steps.map((s) => ({ ...s })),
        videoUrl: fd.get("videoUrl").trim(),
        pdfName: pdfResolved.pdfName || "",
        pdfUrl: pdfResolved.pdfUrl || "",
      };
    } else if (type === "printables") {
      const pdfResolved = this.resolvePdfFromForm(fd, { required: true });
      if (pdfResolved.error) { alert(pdfResolved.error); return; }
      record = {
        id, name: fd.get("name").trim(), tags: fd.get("tags").trim(), description: fd.get("description").trim(),
        coverImage: this.formState.coverImage, steps: [],
        pdfName: pdfResolved.pdfName, pdfUrl: pdfResolved.pdfUrl,
      };
    } else if (type === "bobs") {
      record = { id, slot: fd.get("slot"), title: fd.get("title").trim(), videoUrl: fd.get("videoUrl").trim() };
    }

    const idx = (this.data[type] || []).findIndex((x) => x.id === id);
    if (idx >= 0) this.data[type][idx] = record;
    else (this.data[type] = this.data[type] || []).push(record);

    this.renderAll();
    this.closeForm();
  },

  renderAll() {
    this.renderList("toys", document.getElementById("play-toys-list"), (item) => {
      const toys = item.toyNames.map((t) => `<span class="play-tag">${this.esc(t)}</span>`).join("");
      return `<div class="play-card-body"><div class="play-card-name">Video · ${item.toyNames.length} toy(s)</div><div class="play-card-meta">${this.esc(item.videoUrl)}</div><div class="play-card-tags">${toys}</div></div>`;
    }, "▶");
    this.renderList("diy", document.getElementById("play-diy-list"), (item) => {
      const pdfLine = item.pdfName
        ? `<div class="play-card-meta" style="margin-top:6px">PDF: ${this.esc(item.pdfName)}${this.isExternalPdfUrl(item.pdfUrl) ? '<span class="grossiste-pdf-badge">Lien</span>' : ""}</div>`
        : "";
      return `<div class="play-card-body"><div class="play-card-name">${this.esc(item.name)}</div><div class="play-card-meta">${this.esc(item.description)}</div><div class="play-card-tags">${item.tags.split(",").map((t) => `<span class="play-tag">${this.esc(t.trim())}</span>`).join("")}</div><div class="play-card-meta" style="margin-top:6px">${item.steps.length} steps · video at end</div>${pdfLine}</div>`;
    }, item => item.coverImage);
    this.renderList("printables", document.getElementById("play-printables-list"), (item) => {
      const hero = this.heroFromTags(item.tags);
      return `<div class="play-card-body"><div class="play-card-name">${this.esc(item.name)}</div><div class="play-card-meta">${this.esc(item.description)}</div><div class="play-card-tags"><span class="play-tag hero-${hero}">${this.heroLabel(item.tags)}</span>${item.tags.split(",").map((t) => `<span class="play-tag">${this.esc(t.trim())}</span>`).join("")}</div><div class="play-card-meta" style="margin-top:6px">PDF: ${this.esc(item.pdfName)}${this.isExternalPdfUrl(item.pdfUrl) ? '<span class="grossiste-pdf-badge">Lien</span>' : ""}</div></div>`;
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
      const isImageSrc =
        typeof thumbVal === "string" &&
        (thumbVal.startsWith("http") || thumbVal.startsWith("data:") || thumbVal.startsWith("/"));
      const thumbHtml = isImageSrc
        ? `<img class="play-card-thumb" src="${thumbVal}" alt="" />`
        : `<div class="play-card-thumb placeholder">${this.esc(String(thumbVal || "📄"))}</div>`;
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
  products: [],

  init() {
    document.getElementById("products-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("order")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-product-edit]");
      if (edit) { this.openForm(edit.dataset.productEdit); return; }
      const del = e.target.closest("[data-product-delete]");
      if (del) this.deleteProduct(del.dataset.productDelete);
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
    return text.split("\n").map((l) => l.trim()).filter(Boolean);
  },

  parseTags(text) {
    return String(text || "")
      .split(/[\n,]/)
      .map((t) => t.trim())
      .filter(Boolean);
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.products.find((p) => String(p.id) === String(id)) : null;
    this.formState = {
      pictures: item?.pictures ? [...item.pictures] : [],
      qa: item?.qa?.length ? item.qa.map((x) => ({ ...x })) : [{ q: "", a: "" }],
      colors: item?.colors?.length
        ? item.colors.map((c) => ({ name: c.name || "", hex: c.hex || "#000000" }))
        : [{ name: "", hex: "#000000" }],
    };

    document.getElementById("product-form-title").textContent = id ? "Modifier le produit" : "Ajouter un produit";
    document.getElementById("product-form-body").innerHTML = `
      <form id="product-save-form">
        <div class="product-form-section">Boutique — catégorie, âge, personnage</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-category">Catégorie</label>
          <input type="text" id="product-category" name="category" required placeholder="Jeux d'extérieur, Building Blocks, Livres…" value="${this.esc(item?.category || "")}" />
          <p class="review-photo-hint">Texte libre — utilisé pour « Acheter par catégorie » dans le menu.</p>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-age-tranche">Tranche d'âge</label>
          <input type="text" id="product-age-tranche" name="ageTranche" placeholder="0–12 mois, 1–2 ans, 2–3 ans, 3–5 ans, 5–8 ans, 8 ans et +" value="${this.esc(item?.ageTranche || "")}" />
          <p class="review-photo-hint">Texte libre — utilisé pour « Acheter par âge » dans le menu.</p>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-character">Personnage (optionnel)</label>
          <input type="text" id="product-character" name="character" placeholder="Spider-Man, MEGA BLOKS…" value="${this.esc(item?.character || "")}" />
        </div>

        <div class="product-form-section">Informations produit</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-name">Nom</label>
          <input type="text" id="product-name" name="name" required value="${this.esc(item?.name || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-price">Prix (DZD)</label>
          <input type="text" id="product-price" name="price" required placeholder="2499" value="${this.esc(item?.price || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-age">Âge minimum (étiquette)</label>
          <input type="text" id="product-age" name="age" required placeholder="1Y+" value="${this.esc(item?.age || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-tags">Tags</label>
          <input type="text" id="product-tags" name="tags" placeholder="nouveauté, cadeau, Marvel (séparés par virgule)" value="${this.esc((item?.tags || []).join(", "))}" />
        </div>
        <div class="play-form-field produit-check-row">
          <input type="checkbox" id="product-is-book" name="isBook" ${item?.isBook ? "checked" : ""} />
          <label for="product-is-book">Ce produit est un livre</label>
        </div>
        <div class="play-form-field produit-check-row">
          <input type="checkbox" id="product-is-trending" name="isTrending" ${item?.isTrending ? "checked" : ""} />
          <label for="product-is-trending">Nouveauté (page Nouveautés et tendances)</label>
        </div>
        <div class="play-form-field produit-check-row">
          <input type="checkbox" id="product-has-colors" name="hasMultipleColors" ${item?.hasMultipleColors || item?.colors?.length ? "checked" : ""} />
          <label for="product-has-colors">Plusieurs couleurs disponibles</label>
        </div>
        <div class="play-form-field" id="product-colors-wrap" ${item?.hasMultipleColors || item?.colors?.length ? "" : "hidden"}>
          <label class="play-form-label">Couleurs (code hex)</label>
          <div id="product-colors-list"></div>
          <button type="button" class="play-add-step-btn" id="product-add-color">+ Ajouter une couleur</button>
          <p class="review-photo-hint">Exemple : #FF5733 — visible sur la fiche produit.</p>
        </div>

        <div class="product-form-section">Description & détails</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-description">Description</label>
          <textarea id="product-description" name="description" required rows="4">${this.esc(item?.description || "")}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-characteristics">Caractéristiques</label>
          <textarea id="product-characteristics" name="characteristics" rows="3" placeholder="Matériaux, qualités environnementales…">${this.esc(item?.characteristics || "")}</textarea>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-warning">Avertissement (optionnel)</label>
          <textarea id="product-warning" name="warning" rows="2" placeholder="Laisser vide s'il n'y a pas d'avertissement">${this.esc(item?.warning || "")}</textarea>
        </div>

        <div class="product-form-section">Photos (1–5)</div>
        <div class="review-field review-photo-upload">
          <input type="file" class="review-photo-input file-upload-input" id="product-pictures-input" accept="image/*" multiple tabindex="-1" />
          <button type="button" class="review-photo-label file-upload-btn" id="product-pictures-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Choisir des fichiers
          </button>
          <p class="review-photo-hint" id="product-pictures-hint">0 / 5 photos (minimum 1)</p>
          <div class="review-photo-previews" id="product-pictures-previews"></div>
        </div>

        <div class="product-form-section">Pourquoi ils vont l'adorer</div>
        <div class="play-form-field">
          <label class="play-form-label" for="product-why">Points clés (une ligne par point)</label>
          <textarea id="product-why" name="whyLoveIt" rows="4" placeholder="Deux jouets en un…">${this.esc(this.lines(item?.whyLoveIt))}</textarea>
        </div>

        <div class="product-form-section">Questions & réponses clients</div>
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
    document.getElementById("product-has-colors")?.addEventListener("change", (e) => {
      const wrap = document.getElementById("product-colors-wrap");
      if (wrap) wrap.hidden = !e.target.checked;
    });
    document.getElementById("product-add-color")?.addEventListener("click", () => {
      this.formState.colors.push({ name: "", hex: "#000000" });
      this.renderColors();
      this.bindColors();
    });

    this.renderQa();
    this.bindQa();
    this.renderPhotoPreviews();
    this.updatePhotoUI();
    this.renderColors();
    this.bindColors();

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

  normalizeHex(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : "";
  },

  renderColors() {
    const list = document.getElementById("product-colors-list");
    if (!list) return;
    list.innerHTML = this.formState.colors.map((color, i) => `
      <div class="product-color-row" data-color-row="${i}">
        <input type="color" value="${this.esc(/^#[0-9A-Fa-f]{6}$/.test(color.hex) ? color.hex : "#000000")}" data-color-picker="${i}" aria-label="Couleur ${i + 1}" />
        <input type="text" class="product-color-hex" placeholder="#FF5733" value="${this.esc(color.hex || "")}" data-color-hex="${i}" maxlength="7" />
        <input type="text" class="product-color-name" placeholder="Nom (optionnel)" value="${this.esc(color.name || "")}" data-color-name="${i}" />
        <button type="button" class="play-step-remove" data-remove-color="${i}">Supprimer</button>
      </div>
    `).join("");
  },

  bindColors() {
    document.querySelectorAll("[data-color-picker]").forEach((input) => {
      input.oninput = () => {
        const i = +input.dataset.colorPicker;
        this.formState.colors[i].hex = input.value.toUpperCase();
        const hexInput = document.querySelector(`[data-color-hex="${i}"]`);
        if (hexInput) hexInput.value = this.formState.colors[i].hex;
      };
    });
    document.querySelectorAll("[data-color-hex]").forEach((input) => {
      input.oninput = () => {
        const i = +input.dataset.colorHex;
        const normalized = this.normalizeHex(input.value);
        this.formState.colors[i].hex = normalized || input.value.trim();
        const picker = document.querySelector(`[data-color-picker="${i}"]`);
        if (picker && normalized) picker.value = normalized;
      };
    });
    document.querySelectorAll("[data-color-name]").forEach((input) => {
      input.oninput = () => {
        this.formState.colors[+input.dataset.colorName].name = input.value.trim();
      };
    });
    document.querySelectorAll("[data-remove-color]").forEach((btn) => {
      btn.onclick = () => {
        if (this.formState.colors.length <= 1) return;
        this.formState.colors.splice(+btn.dataset.removeColor, 1);
        this.renderColors();
        this.bindColors();
      };
    });
  },

  collectColorsFromDom() {
    document.querySelectorAll("[data-color-hex]").forEach((input) => {
      const i = +input.dataset.colorHex;
      this.formState.colors[i].hex = this.normalizeHex(input.value);
    });
    document.querySelectorAll("[data-color-name]").forEach((input) => {
      this.formState.colors[+input.dataset.colorName].name = input.value.trim();
    });
    return this.formState.colors.filter((c) => this.normalizeHex(c.hex));
  },

  saveForm(fd) {
    const errEl = document.getElementById("product-form-error");
    const name = (fd.get("name") || "").toString().trim();
    const price = (fd.get("price") || "").toString().trim();
    const category = (fd.get("category") || "").toString().trim();
    const ageTranche = (fd.get("ageTranche") || "").toString().trim();
    const character = (fd.get("character") || "").toString().trim();
    const age = (fd.get("age") || "").toString().trim();
    const tags = this.parseTags((fd.get("tags") || "").toString());
    const description = (fd.get("description") || "").toString().trim();
    const characteristics = (fd.get("characteristics") || "").toString().trim();
    const warning = (fd.get("warning") || "").toString().trim();
    const isBook = fd.get("isBook") === "on";
    const isTrending = fd.get("isTrending") === "on";
    const hasMultipleColors = fd.get("hasMultipleColors") === "on";
    const whyLoveIt = this.parseLines((fd.get("whyLoveIt") || "").toString());
    const qa = this.collectQaFromDom();
    const colors = hasMultipleColors ? this.collectColorsFromDom() : [];

    if (!name || !price || !description || !age) return;
    if (hasMultipleColors && !colors.length) {
      if (errEl) { errEl.textContent = "Ajoutez au moins une couleur valide (#RRGGBB)."; errEl.style.display = "block"; }
      return;
    }
    if (!this.formState.pictures.length) {
      if (errEl) { errEl.textContent = "Please add at least 1 picture (max 5)."; errEl.style.display = "block"; }
      return;
    }

    const payload = {
      name, price, category, ageTranche, character, age, tags, description, characteristics, warning,
      articles: [], whyLoveIt, qa, isBook, isTrending,
      hasMultipleColors: hasMultipleColors && colors.length > 0,
      colors,
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
      const trendingTag = p.isTrending ? `<span class="product-card-tag trending">Nouveauté</span>` : "";
      const metaParts = [
        `${this.esc(p.price)} DZD`,
        p.category ? this.esc(p.category) : "",
        p.ageTranche ? this.esc(p.ageTranche) : "",
        p.character ? this.esc(p.character) : "",
      ].filter(Boolean);
      return `<article class="product-card">
        <div class="product-thumb-lg" ${p.pictures?.[0] ? "" : 'style="background:linear-gradient(135deg,#DBEAFE,#93C5FD)"'}>${thumb}</div>
        <div class="product-card-body">
          <div class="product-card-name">${this.esc(p.name)}</div>
          <div class="product-card-meta">${metaParts.join(" · ")}</div>
          ${bookTag}${trendingTag}
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
  editingId: null,
  formState: { picture: "", pdfName: "", pdfUrl: "", pdfSource: "upload" },
  articles: [],

  isExternalPdfUrl(url) {
    return typeof url === "string" && /^https?:\/\//i.test(url.trim());
  },

  normalizePdfLink(url) {
    const u = (url || "").trim();
    if (!u) return "";
    const blob = u.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if (blob) {
      return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
    }
    return u;
  },

  pdfNameFromUrl(url) {
    try {
      const name = decodeURIComponent(new URL(url.trim()).pathname.split("/").pop() || "");
      return name || "catalogue.pdf";
    } catch {
      return "catalogue.pdf";
    }
  },

  togglePdfSource(mode) {
    const upload = document.getElementById("grossiste-pdf-upload-wrap");
    const link = document.getElementById("grossiste-pdf-link-wrap");
    if (upload) upload.hidden = mode === "link";
    if (link) link.hidden = mode !== "link";
    this.formState.pdfSource = mode;
  },

  resolvePdfFromForm(fd) {
    const source = (fd.get("pdfSource") || "upload").toString();
    if (source === "link") {
      const link = this.normalizePdfLink((fd.get("pdfLink") || "").toString());
      if (!this.isExternalPdfUrl(link)) {
        return { error: "Ajoutez un lien PDF valide (GitHub ou URL directe)." };
      }
      return {
        pdfUrl: link,
        pdfName: (fd.get("pdfDisplayName") || "").toString().trim() || this.pdfNameFromUrl(link),
      };
    }
    if (!this.editingId && !this.formState.pdfUrl) {
      return { error: "Ajoutez un fichier PDF." };
    }
    return {
      pdfUrl: this.formState.pdfUrl,
      pdfName: this.formState.pdfName || "catalogue.pdf",
    };
  },

  init() {
    document.getElementById("grossiste-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("grossiste")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-grossiste-edit]");
      if (edit) { this.openForm(edit.dataset.grossisteEdit); return; }
      const del = e.target.closest("[data-grossiste-delete]");
      if (del) this.deleteItem(del.dataset.grossisteDelete);
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
    const item = id ? this.articles.find((x) => String(x.id) === String(id)) : null;
    const pdfSource = this.isExternalPdfUrl(item?.pdfUrl) ? "link" : "upload";
    const pdfLink = pdfSource === "link" ? (item?.pdfUrl || "") : "";
    this.formState = {
      picture: item?.picture || "",
      pdfName: item?.pdfName || "",
      pdfUrl: item?.pdfUrl || "",
      pdfSource,
    };
    document.getElementById("grossiste-form-title").textContent = id ? "Modifier le catalogue" : "Ajouter un catalogue";
    document.getElementById("grossiste-form-body").innerHTML = `
      <form id="grossiste-save-form">
        <div class="play-form-field">
          <label class="play-form-label">Image de la fiche</label>
          ${this.fileField({ id: "grossiste-picture-file", name: "pictureFile", accept: "image/*", required: !item })}
          <img class="play-form-preview ${this.formState.picture ? "visible" : ""}" id="grossiste-picture-preview" src="${this.formState.picture || ""}" alt="" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="grossiste-title">Titre</label>
          <input type="text" id="grossiste-title" name="title" required placeholder="Catalogue promotions" value="${this.esc(item?.title || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="grossiste-button">Texte du bouton</label>
          <input type="text" id="grossiste-button" name="buttonSentence" required placeholder="Télécharger mon catalogue" value="${this.esc(item?.buttonSentence || "")}" />
        </div>
        <div class="play-form-field">
          <label class="play-form-label">Document PDF</label>
          <div class="grossiste-pdf-source">
            <label><input type="radio" name="pdfSource" value="upload" ${pdfSource === "upload" ? "checked" : ""} /> Téléverser un fichier</label>
            <label><input type="radio" name="pdfSource" value="link" ${pdfSource === "link" ? "checked" : ""} /> Lien PDF (GitHub)</label>
          </div>
          <div id="grossiste-pdf-upload-wrap" ${pdfSource === "link" ? "hidden" : ""}>
            ${this.fileField({ id: "grossiste-pdf-file", name: "pdfFile", accept: ".pdf,application/pdf", required: false, fileName: pdfSource === "upload" ? (this.formState.pdfName || "") : "" })}
          </div>
          <div id="grossiste-pdf-link-wrap" class="grossiste-pdf-link-wrap" ${pdfSource === "upload" ? "hidden" : ""}>
            <label class="play-form-label" for="grossiste-pdf-link">URL du PDF</label>
            <input type="url" id="grossiste-pdf-link" name="pdfLink" placeholder="https://github.com/.../file.pdf ou raw.githubusercontent.com/..." value="${this.esc(pdfLink)}" />
            <label class="play-form-label" for="grossiste-pdf-display-name">Nom affiché (optionnel)</label>
            <input type="text" id="grossiste-pdf-display-name" name="pdfDisplayName" placeholder="Collection officielle.pdf" value="${this.esc(pdfSource === "link" ? (item?.pdfName || "") : "")}" />
            <p class="grossiste-pdf-hint">Collez un lien GitHub (page ou raw). Les liens « blob » sont convertis automatiquement en lien direct.</p>
          </div>
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
    document.querySelectorAll('input[name="pdfSource"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) this.togglePdfSource(radio.value);
      });
    });
    this.bindFileInput("grossiste-picture-file", (file) => this.readImage(file, (url) => {
      this.formState.picture = url;
      const img = document.getElementById("grossiste-picture-preview");
      if (img) { img.src = url; img.classList.add("visible"); }
    }));
    this.bindFileInput("grossiste-pdf-file", (file) => {
      if (file) {
        this.formState.pdfName = file.name;
        const reader = new FileReader();
        reader.onload = () => {
          this.formState.pdfUrl = reader.result;
        };
        reader.readAsDataURL(file);
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
    if (errEl) errEl.style.display = "none";
    if (!title || !buttonSentence) return;

    if (!this.formState.picture) {
      if (errEl) { errEl.textContent = "Ajoutez une image pour la fiche."; errEl.style.display = "block"; }
      return;
    }
    const pdf = this.resolvePdfFromForm(fd);
    if (pdf.error) {
      if (errEl) { errEl.textContent = pdf.error; errEl.style.display = "block"; }
      return;
    }

    const payload = {
      title,
      buttonSentence,
      picture: this.formState.picture,
      pdfName: pdf.pdfName,
      pdfUrl: pdf.pdfUrl || "#",
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
      this.listEl.innerHTML = `<div class="play-empty">Aucun catalogue. Cliquez sur « + Ajouter un catalogue » pour en créer un.</div>`;
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
            ${this.esc(item.pdfName)}${this.isExternalPdfUrl(item.pdfUrl) ? '<span class="grossiste-pdf-badge">Lien</span>' : ""}
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
  users: [],
  filterQuery: "",
  filterRole: "",

  init() {
    document.getElementById("users-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("users-search")?.addEventListener("input", (e) => {
      this.filterQuery = e.target.value.trim().toLowerCase();
      this.render();
    });
    document.getElementById("users-role-filter")?.addEventListener("change", (e) => {
      this.filterRole = e.target.value;
      this.render();
    });
    document.getElementById("users")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-user-edit]");
      if (edit) { this.openForm(edit.dataset.userEdit); return; }
      const del = e.target.closest("[data-user-delete]");
      if (del) this.deleteUser(del.dataset.userDelete);
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

  displayValue(value) {
    if (value == null || value === "") return "—";
    return value;
  },

  formatPromoCodes(codes) {
    if (!codes || !codes.length) return "—";
    return codes.join(", ");
  },

  formatRole(role) {
    if (role === "admin") return "Admin";
    if (role === "client") return "Client";
    return this.displayValue(role);
  },

  userSearchText(user) {
    return [
      user.name,
      user.email,
      user.role,
      this.formatRole(user.role),
      String(user.orders ?? 0),
      this.formatPromoCodes(user.promoCodes),
      user.kidsClub,
      user.birthday,
      user.address,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  },

  getFilteredUsers() {
    return this.users.filter((user) => {
      if (this.filterRole && (user.role || "client") !== this.filterRole) return false;
      if (!this.filterQuery) return true;
      return this.userSearchText(user).includes(this.filterQuery);
    });
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.users.find((u) => String(u.id) === String(id)) : null;
    const isEdit = !!id;
    document.getElementById("users-form-title").textContent = isEdit ? "Modifier l'utilisateur" : "Ajouter un utilisateur";
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
        <div class="play-form-field">
          <label class="play-form-label" for="user-password">${isEdit ? "Nouveau mot de passe" : "Mot de passe"}</label>
          <input type="password" id="user-password" name="password" ${isEdit ? "" : "required"} autocomplete="new-password" placeholder="${isEdit ? "Laisser vide pour conserver l'actuel" : "Mot de passe du compte"}" />
          <p class="play-form-file-name" style="margin-top:6px">Min. 6 caractères, avec majuscule, minuscule, chiffre et symbole${!isEdit ? "" : ". Remplir pour réinitialiser le mot de passe."}</p>
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
    const filtered = this.getFilteredUsers();
    if (!this.users.length) {
      this.listEl.innerHTML = `<div class="users-empty">Aucun utilisateur pour le moment. Cliquez sur + Ajouter un utilisateur pour en créer un.</div>`;
      return;
    }
    if (!filtered.length) {
      this.listEl.innerHTML = `<div class="users-empty">Aucun utilisateur ne correspond à votre recherche.</div>`;
      return;
    }
    this.listEl.innerHTML = filtered.map((user) => `
      <div class="users-row">
        <div class="user-cell">
          <div class="user-avatar" style="background:${this.avatarBg(user.id)}">${this.initials(user.name)}</div>
          <span class="user-name">${this.esc(user.name)}</span>
        </div>
        <span class="user-email">${this.esc(user.email)}</span>
        <span class="user-role"><span class="user-role-badge user-role-${this.esc(user.role || "client")}">${this.esc(this.formatRole(user.role))}</span></span>
        <span class="user-orders">${this.esc(String(user.orders ?? 0))}</span>
        <span class="user-promo">${this.esc(this.formatPromoCodes(user.promoCodes))}</span>
        <span class="user-kids-club">${this.esc(this.displayValue(user.kidsClub))}</span>
        <span class="user-birthday">${this.esc(this.displayValue(user.birthday))}</span>
        <span class="user-address">${this.esc(this.displayValue(user.address))}</span>
        <div class="users-actions">
          <button type="button" class="user-edit-btn" data-user-edit="${user.id}">Modifier</button>
          <button type="button" class="user-delete-btn" data-user-delete="${user.id}">Supprimer</button>
        </div>
      </div>`).join("");
  },
};

UsersCMS.init();

const ReturnsCMS = {
  listEl: null,
  navEl: null,
  items: [],
  filterQuery: "",
  activeStatus: "nouvelle",
  statusOptions: [
    { value: "nouvelle", label: "Nouvelle demande" },
    { value: "en_cours", label: "En cours de traitement" },
    { value: "attente_client", label: "En attente du client" },
    { value: "resolue", label: "Résolue" },
    { value: "annulee", label: "Annulée" },
  ],

  ensureDom() {
    this.listEl = document.getElementById("returns-list");
    this.navEl = document.getElementById("returns-status-nav");

    if (!this.navEl) {
      const section = document.getElementById("returns");
      const table = this.listEl?.closest(".returns-table") || section?.querySelector(".returns-table");
      if (section) {
        this.navEl = document.createElement("div");
        this.navEl.id = "returns-status-nav";
        this.navEl.className = "returns-status-nav";
        this.navEl.setAttribute("role", "tablist");
        this.navEl.setAttribute("aria-label", "Filtrer par statut");
        if (table && table.parentNode === section) {
          section.insertBefore(this.navEl, table);
        } else if (table?.parentNode) {
          table.parentNode.insertBefore(this.navEl, table);
        } else {
          const toolbar = section.querySelector(".returns-toolbar");
          if (toolbar?.nextSibling) section.insertBefore(this.navEl, toolbar.nextSibling);
          else section.appendChild(this.navEl);
        }
      }
    }
  },

  init() {
    this.ensureDom();

    document.getElementById("returns-search")?.addEventListener("input", (e) => {
      this.filterQuery = e.target.value.trim().toLowerCase();
      this.render();
    });
    document.getElementById("returns")?.addEventListener("click", (e) => {
      const del = e.target.closest("[data-return-delete]");
      if (del) this.deleteItem(del.dataset.returnDelete);
    });
    if (this.listEl && !this.listEl.dataset.statusBound) {
      this.listEl.dataset.statusBound = "1";
      this.listEl.addEventListener("change", (e) => {
        const sel = e.target.closest(".return-status-select");
        if (!sel) return;
        this.handleStatusChange(sel);
      });
    }
    if (this.navEl && !this.navEl.dataset.navBound) {
      this.navEl.dataset.navBound = "1";
      this.navEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".returns-status-tab");
        if (!btn) return;
        const status = btn.dataset.status;
        if (!status || status === this.activeStatus) return;
        this.activeStatus = status;
        this.render();
      });
    }
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  displayValue(value) {
    if (value == null || value === "") return "—";
    return value;
  },

  typeLabel(type) {
    const map = {
      retour: "Retour",
      echange: "Échange",
      reclamation: "Réclamation",
      contact: "Contact",
    };
    return map[type] || type || "—";
  },

  statusLabel(status) {
    const found = this.statusOptions.find((o) => o.value === status);
    return found ? found.label : status || "—";
  },

  statusSelect(item) {
    const current = item.status || "nouvelle";
    const options = this.statusOptions
      .map(
        (opt) =>
          `<option value="${opt.value}"${opt.value === current ? " selected" : ""}>${this.esc(opt.label)}</option>`,
      )
      .join("");
    return `<select class="return-status-select" data-return-id="${this.esc(String(item.id))}" data-status="${this.esc(current)}" aria-label="Statut de la demande">${options}</select>`;
  },

  async handleStatusChange(selectEl) {
    const returnId = selectEl.dataset.returnId;
    const nextStatus = selectEl.value;
    const previous = this.items.find((item) => String(item.id) === String(returnId))?.status || "nouvelle";
    if (nextStatus === previous) return;

    selectEl.disabled = true;
    selectEl.dataset.status = nextStatus;
    try {
      if (typeof this.updateStatus === "function") {
        await this.updateStatus(returnId, nextStatus);
      }
      const item = this.items.find((r) => String(r.id) === String(returnId));
      if (item) item.status = nextStatus;
      this.render();
    } catch (err) {
      selectEl.value = previous;
      selectEl.dataset.status = previous;
      alert(err?.message || "Impossible de mettre à jour le statut.");
      selectEl.disabled = false;
    }
  },

  searchText(item) {
    return [
      item.name,
      item.email,
      item.phone,
      item.comment,
      item.wilaya,
      item.requestType,
      this.typeLabel(item.requestType),
      item.trackingNumber,
      item.source,
      item.status,
      this.statusLabel(item.status),
    ]
      .join(" ")
      .toLowerCase();
  },

  getFiltered() {
    const byStatus = this.items.filter((item) => (item.status || "nouvelle") === this.activeStatus);
    if (!this.filterQuery) return byStatus;
    return byStatus.filter((item) => this.searchText(item).includes(this.filterQuery));
  },

  countFor(status) {
    return this.items.filter((item) => (item.status || "nouvelle") === status).length;
  },

  renderNav() {
    if (!this.navEl) return;
    this.navEl.innerHTML = this.statusOptions
      .map((opt) => {
        const count = this.countFor(opt.value);
        const active = opt.value === this.activeStatus;
        return `
          <button
            type="button"
            class="returns-status-tab${active ? " is-active" : ""}"
            role="tab"
            aria-selected="${active ? "true" : "false"}"
            data-status="${this.esc(opt.value)}"
            id="returns-tab-${this.esc(opt.value)}"
          >
            <span class="returns-status-tab-label">${this.esc(opt.label)}</span>
            <span class="returns-status-tab-count">${count}</span>
          </button>`;
      })
      .join("");
  },

  deleteItem(id) {
    if (!confirm("Supprimer cette demande ?")) return;
    this.items = this.items.filter((item) => String(item.id) !== String(id));
    this.render();
  },

  render() {
    this.ensureDom();
    if (!this.listEl) return;

    if (!this.statusOptions.some((o) => o.value === this.activeStatus)) {
      this.activeStatus = "nouvelle";
    }

    this.renderNav();

    const filtered = this.getFiltered();
    const label = this.statusLabel(this.activeStatus);

    if (!this.items.length) {
      this.listEl.innerHTML = `<div class="users-empty">Aucune demande pour le moment.</div>`;
      return;
    }
    if (!filtered.length) {
      this.listEl.innerHTML = this.filterQuery
        ? `<div class="users-empty">Aucune demande ne correspond à votre recherche.</div>`
        : `<div class="users-empty">Aucune demande « ${this.esc(label)} ».</div>`;
      return;
    }
    this.listEl.innerHTML = filtered
      .map((item) => {
        const pic = item.picture || (Array.isArray(item.pictures) ? item.pictures[0] : "");
        const picHtml = pic
          ? `<a href="${this.esc(pic)}" target="_blank" rel="noopener noreferrer"><img class="returns-pic" src="${this.esc(pic)}" alt="Pièce jointe" /></a>`
          : `<span class="returns-pic-empty">—</span>`;
        return `
      <div class="returns-row">
        <span class="returns-name">${this.esc(this.displayValue(item.name))}</span>
        <span class="returns-cell">${this.esc(this.displayValue(item.email))}</span>
        <span class="returns-cell">${this.esc(this.displayValue(item.phone))}</span>
        <span class="returns-cell returns-comment">${this.esc(this.displayValue(item.comment))}</span>
        <span class="returns-cell">${this.esc(this.displayValue(item.wilaya))}</span>
        <span class="returns-cell"><span class="returns-type-badge">${this.esc(this.typeLabel(item.requestType))}</span></span>
        <span class="returns-cell">${this.esc(this.displayValue(item.trackingNumber))}</span>
        <span class="returns-cell">${picHtml}</span>
        <div class="returns-actions">
          ${this.statusSelect(item)}
          <button type="button" class="returns-delete-btn" data-return-delete="${this.esc(String(item.id))}">Supprimer</button>
        </div>
      </div>`;
      })
      .join("");
  },
};

ReturnsCMS.init();

const StoresCMS = {
  listEl: document.getElementById("stores-list"),
  countEl: document.getElementById("stores-count"),
  nextId: 4,
  editingId: null,
  stores: [],

  init() {
    document.getElementById("stores-add-btn")?.addEventListener("click", () => this.openForm());
    document.getElementById("stores")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-store-edit]");
      if (edit) { this.openForm(edit.dataset.storeEdit); return; }
      const del = e.target.closest("[data-store-delete]");
      if (del) this.deleteStore(del.dataset.storeDelete);
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
    return /^https?:\/\//i.test(url) ? url : "https://" + url;
  },

  openForm(id) {
    this.editingId = id ?? null;
    const item = id ? this.stores.find((s) => String(s.id) === String(id)) : null;
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
          <label class="play-form-label" for="store-storeType">Type de magasin</label>
          <select id="store-storeType" name="storeType">
            <option value="" ${!item?.storeType ? "selected" : ""}>Type de magasin</option>
            <option value="superette" ${item?.storeType === "superette" ? "selected" : ""}>Supérette</option>
            <option value="bureau-tabac" ${item?.storeType === "bureau-tabac" ? "selected" : ""}>Bureau de tabac</option>
            <option value="magasin-jouets" ${item?.storeType === "magasin-jouets" ? "selected" : ""}>Magasin de jouets</option>
            <option value="librairie" ${item?.storeType === "librairie" ? "selected" : ""}>Librairie</option>
            <option value="usine" ${item?.storeType === "usine" ? "selected" : ""}>Usine</option>
          </select>
        </div>
        <div class="play-form-field">
          <label class="play-form-label" for="store-mapLink">Lien carte (Google Maps / OSM)</label>
          <input type="text" id="store-mapLink" name="mapLink" inputmode="url" autocomplete="off" placeholder="https://maps.google.com/..." value="${this.esc(item?.mapLink || "")}" />
          <span class="play-form-file-name">Collez le lien de la carte. Utilisé pour « Voir sur la carte » et l’épingle.</span>
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
    const mapLink = (fd.get("mapLink") || "").toString().trim();
    const storeType = (fd.get("storeType") || "").toString().trim();
    if (!name || !location) return;

    const payload = { name, location, website, mapLink, storeType };
    if (this.editingId) {
      const idx = this.stores.findIndex((s) => String(s.id) === String(this.editingId));
      if (idx >= 0) this.stores[idx] = { ...this.stores[idx], ...payload };
    } else {
      this.stores.push({ id: this.nextId++, ...payload });
    }
    this.closeForm();
    this.render();
  },

  deleteStore(id) {
    if (!confirm("Supprimer ce magasin de la liste ?")) return;
    this.stores = this.stores.filter((s) => String(s.id) !== String(id));
    this.render();
  },

  render() {
    if (!this.listEl) return;
    const withMap = this.stores.filter((s) => s.mapLink).length;
    if (this.countEl) {
      this.countEl.innerHTML = `<strong>${this.stores.length}</strong> store${this.stores.length === 1 ? "" : "s"} · <strong>${withMap}</strong> avec lien carte`;
    }
    if (!this.stores.length) {
      this.listEl.innerHTML = `<div class="play-empty">Non stores yet. Click + Add Store to create one.</div>`;
      return;
    }
    this.listEl.innerHTML = this.stores.map((store) => {
      const map = store.mapLink
        ? `<a class="store-card-link" href="${this.esc(this.formatSiteWeb(store.mapLink))}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> Lien carte</a>`
        : `<span class="play-card-meta">Pas de lien carte</span>`;
      const site = store.website
        ? `<a class="store-card-link" href="${this.esc(this.formatSiteWeb(store.website))}" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Site web</a>`
        : "";
      return `<article class="play-card">
        <div class="play-card-thumb placeholder">📍</div>
        <div class="play-card-body">
          <div class="play-card-name">${this.esc(store.name)}</div>
          <div class="play-card-meta">${this.esc(store.location)}</div>
          ${map}
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

const OverviewCMS = {
  statsEl: null,
  statusEl: null,
  recentEl: null,
  statusOptions: [
    { value: "pending", label: "En attente" },
    { value: "confirmed", label: "Confirmée" },
    { value: "shipped", label: "En route" },
    { value: "delivered", label: "Reçue" },
    { value: "cancelled", label: "Annulée" },
  ],

  ensureDom() {
    this.statsEl = document.getElementById("overview-stats");
    this.statusEl = document.getElementById("overview-order-statuses");
    this.recentEl = document.getElementById("overview-recent-orders");
  },

  init() {
    this.ensureDom();
    const section = document.getElementById("overview");
    if (section && !section.dataset.overviewBound) {
      section.dataset.overviewBound = "1";
      section.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-goto]");
        if (!btn) return;
        const screen = btn.dataset.goto;
        const status = btn.dataset.status;
        if (status && window.OrdersCMS) {
          OrdersCMS.activeStatus = status;
          OrdersCMS.render();
        }
        if (screen && window.DashboardNav) DashboardNav.activate(screen);
      });
    }
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  formatPrice(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("fr-FR") + " DZD";
  },

  orderItemsTotal(order) {
    if (window.OrdersCMS && typeof OrdersCMS.orderSubtotal === "function") {
      return OrdersCMS.orderSubtotal(order);
    }
    if (Number.isFinite(Number(order.subtotal))) return Number(order.subtotal);
    if (Array.isArray(order.items) && order.items.length) {
      return order.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      );
    }
    return Math.max(0, Number(order.total || 0) - Number(order.deliveryFee || 0));
  },

  gainedMoney() {
    const orders = window.OrdersCMS?.orders || [];
    return orders
      .filter((o) => (o.status || "pending") === "delivered")
      .reduce((sum, o) => sum + this.orderItemsTotal(o), 0);
  },

  countOrders(status) {
    const orders = window.OrdersCMS?.orders || [];
    return orders.filter((o) => (o.status || "pending") === status).length;
  },

  renderStats() {
    if (!this.statsEl) return;
    const products = window.ProductsCMS?.products?.length || 0;
    const orders = window.OrdersCMS?.orders?.length || 0;
    const pending = this.countOrders("pending");
    const delivered = this.countOrders("delivered");
    const users = window.UsersCMS?.users?.length || 0;
    const stores = window.StoresCMS?.stores?.length || 0;
    const reviews = window.ReviewModeration?.reviews?.length || 0;
    const gained = this.gainedMoney();

    const cards = [
      {
        label: "Gains",
        value: this.formatPrice(gained),
        goto: "orders",
        status: "delivered",
        icon: "money",
        hint: delivered
          ? delivered + " commande" + (delivered > 1 ? "s" : "") + " reçue" + (delivered > 1 ? "s" : "") + " · hors livraison"
          : "Commandes reçues · hors livraison",
        featured: true,
      },
      { label: "Produits", value: products, goto: "order", icon: "bag" },
      { label: "Commandes", value: orders, goto: "orders", icon: "cart", hint: pending ? pending + " en attente" : null },
      { label: "Utilisateurs", value: users, goto: "users", icon: "users" },
      { label: "Magasins", value: stores, goto: "stores", icon: "store" },
      { label: "Avis", value: reviews, goto: "reviews", icon: "star" },
    ];

    const icons = {
      money: '<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>',
      bag: '<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
      cart: '<svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 16h11.5c.75 0 1.41-.41 1.75-1.03l3.24-5.88A1 1 0 0022.62 7H5.21l-.94-2H1v2h2l3.6 7.59L5.25 17H19v-2H7.42l-.42-.84z"/></svg>',
      users: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      store: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      star: '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    };

    this.statsEl.innerHTML = cards
      .map(
        (c) => `
      <button type="button" class="stat-card overview-stat-card${c.featured ? " is-featured" : ""}" data-goto="${c.goto}"${c.status ? ` data-status="${c.status}"` : ""}>
        <div class="stat-top">
          <div class="stat-icon">${icons[c.icon] || ""}</div>
          <div>
            <div class="stat-label">${this.esc(c.label)}</div>
            ${c.hint ? `<div class="stat-change">${this.esc(c.hint)}</div>` : ""}
          </div>
        </div>
        <div class="stat-num${c.featured ? " is-money" : ""}">${typeof c.value === "number" ? c.value : this.esc(c.value)}</div>
      </button>`,
      )
      .join("");
  },

  renderStatuses() {
    if (!this.statusEl) return;
    const total = window.OrdersCMS?.orders?.length || 0;
    this.statusEl.innerHTML = this.statusOptions
      .map((opt) => {
        const count = this.countOrders(opt.value);
        const pct = total ? Math.round((count / total) * 100) : 0;
        return `
          <button type="button" class="overview-status-row" data-goto="orders" data-status="${this.esc(opt.value)}">
            <div class="overview-status-meta">
              <span class="overview-status-label">${this.esc(opt.label)}</span>
              <span class="overview-status-count">${count}</span>
            </div>
            <div class="overview-status-bar" aria-hidden="true">
              <span style="width:${pct}%"></span>
            </div>
          </button>`;
      })
      .join("");
  },

  renderRecent() {
    if (!this.recentEl) return;
    const orders = [...(window.OrdersCMS?.orders || [])].slice(0, 5);
    if (!orders.length) {
      this.recentEl.innerHTML = `<div class="orders-empty">Aucune commande pour le moment.</div>`;
      return;
    }

    const labelMap = Object.fromEntries(this.statusOptions.map((o) => [o.value, o.label]));
    this.recentEl.innerHTML = orders
      .map((o) => {
        const status = o.status || "pending";
        return `
        <div class="overview-recent-row">
          <div>
            <div class="user-name">${this.esc(o.customerName || "—")}</div>
            <div class="user-email">${this.esc(o.trackingCode || o.phone || "")}</div>
          </div>
          <div class="overview-recent-right">
            <span class="overview-recent-total">${this.esc(this.formatPrice(o.total))}</span>
            <span class="overview-recent-status" data-status="${this.esc(status)}">${this.esc(labelMap[status] || status)}</span>
          </div>
        </div>`;
      })
      .join("");
  },

  render() {
    this.ensureDom();
    this.renderStats();
    this.renderStatuses();
    this.renderRecent();
  },
};

OverviewCMS.init();

const OrdersCMS = {
  listEl: null,
  navEl: null,
  orders: [],
  activeStatus: "pending",
  statusOptions: [
    { value: "pending", label: "En attente" },
    { value: "confirmed", label: "Confirmée" },
    { value: "shipped", label: "En route" },
    { value: "delivered", label: "Reçue" },
    { value: "cancelled", label: "Annulée" },
  ],

  ensureDom() {
    this.listEl = document.getElementById("orders-list");
    this.navEl = document.getElementById("orders-status-nav");

    if (!this.navEl) {
      const section = document.getElementById("orders");
      const table = this.listEl?.closest(".orders-table") || section?.querySelector(".orders-table");
      if (section) {
        this.navEl = document.createElement("div");
        this.navEl.id = "orders-status-nav";
        this.navEl.className = "orders-status-nav";
        this.navEl.setAttribute("role", "tablist");
        this.navEl.setAttribute("aria-label", "Filtrer par statut");
        if (table && table.parentNode === section) {
          section.insertBefore(this.navEl, table);
        } else if (table?.parentNode) {
          table.parentNode.insertBefore(this.navEl, table);
        } else {
          const head = section.querySelector(".page-head");
          if (head?.nextSibling) section.insertBefore(this.navEl, head.nextSibling);
          else section.appendChild(this.navEl);
        }
      }
    }
  },

  init() {
    this.ensureDom();

    if (this.listEl && !this.listEl.dataset.statusBound) {
      this.listEl.dataset.statusBound = "1";
      this.listEl.addEventListener("change", (e) => {
        const sel = e.target.closest(".order-status-select");
        if (!sel) return;
        this.handleStatusChange(sel);
      });
    }
    if (this.navEl && !this.navEl.dataset.navBound) {
      this.navEl.dataset.navBound = "1";
      this.navEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".orders-status-tab");
        if (!btn) return;
        const status = btn.dataset.status;
        if (!status || status === this.activeStatus) return;
        this.activeStatus = status;
        this.render();
      });
    }
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  },

  formatPrice(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    return n.toLocaleString("fr-FR") + " DZD";
  },

  orderSubtotal(order) {
    if (Number.isFinite(Number(order.subtotal))) return Number(order.subtotal);
    if (Array.isArray(order.items) && order.items.length) {
      return order.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    }
    return Number(order.total || 0) - Number(order.deliveryFee || 0);
  },

  orderDeliveryFee(order) {
    return Number.isFinite(Number(order.deliveryFee)) ? Number(order.deliveryFee) : 0;
  },

  totalBreakdown(order) {
    const subtotal = this.orderSubtotal(order);
    const delivery = this.orderDeliveryFee(order);
    const total = Number.isFinite(Number(order.total)) ? Number(order.total) : subtotal + delivery;
    return `
      <div class="orders-total-cell">
        <div class="orders-price-line">
          <span class="orders-price-item">
            <span class="orders-price-label">Produits</span>
            <span class="orders-price-value">${this.esc(this.formatPrice(subtotal))}</span>
          </span>
          <span class="orders-price-item">
            <span class="orders-price-label">Livraison</span>
            <span class="orders-price-value">${this.esc(this.formatPrice(delivery))}</span>
          </span>
        </div>
        <div class="orders-price-total">
          <span class="orders-price-label">Total</span>
          <strong class="orders-price-value">${this.esc(this.formatPrice(total))}</strong>
        </div>
      </div>`;
  },

  statusLabel(status) {
    const map = {
      pending: "En attente",
      confirmed: "Confirmée",
      shipped: "En route",
      delivered: "Reçue",
      cancelled: "Annulée",
    };
    return map[status] || status || "—";
  },

  statusSelect(order) {
    const current = order.status || "pending";
    const options = this.statusOptions
      .map(
        (opt) =>
          `<option value="${opt.value}"${opt.value === current ? " selected" : ""}>${this.esc(opt.label)}</option>`,
      )
      .join("");
    return `<select class="order-status-select" data-order-id="${this.esc(order.id)}" data-status="${this.esc(current)}" aria-label="Statut de la commande">${options}</select>`;
  },

  async handleStatusChange(selectEl) {
    const orderId = selectEl.dataset.orderId;
    const nextStatus = selectEl.value;
    const previous = this.orders.find((o) => o.id === orderId)?.status || "pending";
    if (nextStatus === previous) return;

    selectEl.disabled = true;
    selectEl.dataset.status = nextStatus;
    try {
      if (typeof this.updateStatus === "function") {
        await this.updateStatus(orderId, nextStatus);
      }
      const order = this.orders.find((o) => o.id === orderId);
      if (order) order.status = nextStatus;
      this.render();
    } catch (err) {
      selectEl.value = previous;
      selectEl.dataset.status = previous;
      alert(err?.message || "Impossible de mettre à jour le statut.");
      selectEl.disabled = false;
    }
  },

  orderRow(o) {
    return `
      <div class="orders-row">
        <div class="orders-col orders-col-client">
          <div class="user-name">${this.esc(o.customerName)}</div>
          <div class="user-email">${this.esc(o.phone)}${o.email ? " · " + this.esc(o.email) : ""}</div>
        </div>
        <div class="orders-col orders-col-location">
          <span class="orders-cell-label">Localisation</span>
          <div class="orders-location">${this.esc(o.wilaya || "—")} — ${this.esc(o.commune || "—")}</div>
        </div>
        <div class="orders-col orders-col-total">
          ${this.totalBreakdown(o)}
        </div>
        <div class="orders-col orders-col-status">
          <span class="orders-cell-label">Statut</span>
          ${this.statusSelect(o)}
        </div>
        <div class="orders-col orders-col-tracking">
          <span class="orders-cell-label">Suivi</span>
          <div class="orders-tracking">${this.esc(o.trackingCode || "—")}</div>
        </div>
      </div>`;
  },

  countFor(status) {
    return this.orders.filter((o) => (o.status || "pending") === status).length;
  },

  renderNav() {
    if (!this.navEl) return;
    this.navEl.innerHTML = this.statusOptions
      .map((opt) => {
        const count = this.countFor(opt.value);
        const active = opt.value === this.activeStatus;
        return `
          <button
            type="button"
            class="orders-status-tab${active ? " is-active" : ""}"
            role="tab"
            aria-selected="${active ? "true" : "false"}"
            data-status="${this.esc(opt.value)}"
            id="orders-tab-${this.esc(opt.value)}"
          >
            <span class="orders-status-tab-label">${this.esc(opt.label)}</span>
            <span class="orders-status-tab-count">${count}</span>
          </button>`;
      })
      .join("");
  },

  render() {
    this.ensureDom();
    if (!this.listEl) return;

    if (this.navEl && !this.navEl.dataset.navBound) {
      this.navEl.dataset.navBound = "1";
      this.navEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".orders-status-tab");
        if (!btn) return;
        const status = btn.dataset.status;
        if (!status || status === this.activeStatus) return;
        this.activeStatus = status;
        this.render();
      });
    }

    if (!this.statusOptions.some((o) => o.value === this.activeStatus)) {
      this.activeStatus = "pending";
    }

    this.renderNav();

    const label = this.statusLabel(this.activeStatus);
    const group = this.orders.filter((o) => (o.status || "pending") === this.activeStatus);

    if (!this.orders.length) {
      this.listEl.innerHTML = `<div class="orders-empty">Aucune commande pour le moment.</div>`;
      return;
    }

    if (!group.length) {
      this.listEl.innerHTML = `<div class="orders-empty">Aucune commande ${this.esc(label.toLowerCase())}.</div>`;
      return;
    }

    this.listEl.innerHTML = group.map((o) => this.orderRow(o)).join("");
  },
};

OrdersCMS.init();

const NewsletterCMS = {
  listEl: document.getElementById("newsletter-list"),
  items: [],
  filterQuery: "",

  init() {
    document.getElementById("newsletter-search")?.addEventListener("input", (e) => {
      this.filterQuery = e.target.value.trim().toLowerCase();
      this.render();
    });
    document.getElementById("newsletter-add-btn")?.addEventListener("click", () => this.addItem());
    document.getElementById("newsletter-export-all")?.addEventListener("click", () => this.exportCsv(false));
    document.getElementById("newsletter-export-accepted")?.addEventListener("click", () => this.exportCsv(true));
    document.getElementById("newsletter")?.addEventListener("click", (e) => {
      const del = e.target.closest("[data-nl-delete]");
      if (del) this.deleteItem(del.dataset.nlDelete);
    });
    document.getElementById("newsletter")?.addEventListener("change", (e) => {
      const sel = e.target.closest(".newsletter-status-select");
      if (!sel) return;
      this.setAccepted(sel.dataset.nlId, sel.value === "1");
    });
    this.render();
  },

  esc(t) {
    const d = document.createElement("div");
    d.textContent = t ?? "";
    return d.innerHTML;
  },

  sourceLabel(source) {
    const map = {
      account: "Compte",
      footer: "Footer",
      signup_drawer: "Drawer",
      notre_histoire: "Notre histoire",
      cookies: "Préf. cookies",
      diy: "DIY",
      printables: "Imprimables",
      gifts: "Guides cadeaux",
      admin: "Admin",
    };
    return map[source] || source || "—";
  },

  getFiltered() {
    if (!this.filterQuery) return this.items;
    return this.items.filter((item) =>
      [item.email, item.name, item.source, this.sourceLabel(item.source)]
        .join(" ")
        .toLowerCase()
        .includes(this.filterQuery),
    );
  },

  addItem() {
    const email = prompt("Adresse e-mail à ajouter :");
    if (!email) return;
    const name = prompt("Nom (optionnel) :") || "";
    this.items.unshift({
      id: "tmp-" + Date.now(),
      email: email.trim().toLowerCase(),
      name: name.trim(),
      source: "admin",
      accepted: true,
    });
    this.render();
  },

  deleteItem(id) {
    if (!confirm("Supprimer cet e-mail ?")) return;
    this.items = this.items.filter((item) => String(item.id) !== String(id));
    this.render();
  },

  setAccepted(id, accepted) {
    const item = this.items.find((r) => String(r.id) === String(id));
    if (item) item.accepted = !!accepted;
    this.render();
  },

  exportCsv() {},

  render() {
    if (!this.listEl) return;
    const accepted = this.items.filter((i) => i.accepted !== false).length;
    const refused = this.items.length - accepted;
    const totalEl = document.getElementById("newsletter-total-count");
    const acceptedEl = document.getElementById("newsletter-accepted-count");
    const refusedEl = document.getElementById("newsletter-refused-count");
    if (totalEl) totalEl.textContent = String(this.items.length);
    if (acceptedEl) acceptedEl.textContent = String(accepted);
    if (refusedEl) refusedEl.textContent = String(refused);

    const filtered = this.getFiltered();
    if (!this.items.length) {
      this.listEl.innerHTML = `<div class="users-empty">Aucun e-mail pour le moment.</div>`;
      return;
    }
    if (!filtered.length) {
      this.listEl.innerHTML = `<div class="users-empty">Aucun e-mail ne correspond à votre recherche.</div>`;
      return;
    }

    this.listEl.innerHTML = filtered
      .map((item) => {
        const acceptedVal = item.accepted !== false;
        return `
      <div class="newsletter-row">
        <span class="newsletter-email">${this.esc(item.email || "—")}</span>
        <span class="newsletter-cell">${this.esc(item.name || "—")}</span>
        <span class="newsletter-cell"><span class="newsletter-source-badge">${this.esc(this.sourceLabel(item.source))}</span></span>
        <span class="newsletter-cell">
          <select class="newsletter-status-select" data-nl-id="${this.esc(String(item.id))}" data-status="${acceptedVal ? "1" : "0"}" aria-label="Statut d'envoi">
            <option value="1"${acceptedVal ? " selected" : ""}>Accepte l'envoi</option>
            <option value="0"${!acceptedVal ? " selected" : ""}>Refuse l'envoi</option>
          </select>
        </span>
        <div class="newsletter-actions">
          <button type="button" class="returns-delete-btn" data-nl-delete="${this.esc(String(item.id))}">Supprimer</button>
        </div>
      </div>`;
      })
      .join("");
  },
};

NewsletterCMS.init();

if (window.DashboardNav) {
  const _navActivate = DashboardNav.activate.bind(DashboardNav);
  DashboardNav.activate = function (screenId, updateHash) {
    if (screenId !== "reviews") ReviewAddPanel.close();
    if (screenId !== "play") PlayCMS.closeForm();
    if (screenId !== "order") ProductsCMS.closeForm();
    if (screenId !== "grossiste") GrossisteCMS.closeForm();
    if (screenId !== "users") UsersCMS.closeForm();
    if (screenId !== "stores") StoresCMS.closeForm();
    _navActivate(screenId, updateHash);
  };
}

window.ProductsCMS = ProductsCMS;
window.UsersCMS = UsersCMS;
window.ReturnsCMS = ReturnsCMS;
window.StoresCMS = StoresCMS;
window.GrossisteCMS = GrossisteCMS;
window.PlayCMS = PlayCMS;
window.ReviewModeration = ReviewModeration;
window.PromoBarParamètres = PromoBarParamètres;
window.OrdersCMS = OrdersCMS;
window.OverviewCMS = OverviewCMS;
window.NewsletterCMS = NewsletterCMS;

if (typeof window.__ajbDashboardIntegrationInit === "function") {
  window.__ajbDashboardIntegrationInit();
}
