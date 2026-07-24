(function () {
  var TAG_COLORS = ["blue", "green", "purple", "orange", "red"];
  var DEFAULT_HERO =
    "https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782401079/Design_sans_titre_52_pr3lfa.png";

  var PRINTABLES = {};
  var PRINTABLE_IDS = [];
  var ALL_TAGS = [];

  var viewListing = document.getElementById("view-listing");
  var viewSectionAll = document.getElementById("view-section-all");
  var viewTag = document.getElementById("view-tag");
  var viewDetail = document.getElementById("view-detail");
  var currentTagName = "";

  if (!viewListing) return;

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags.map(function (t) {
        return String(t).trim();
      }).filter(Boolean);
    }
    return String(tags)
      .split(",")
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);
  }

  function tagColor(name, index) {
    return TAG_COLORS[(index != null ? index : name.length) % TAG_COLORS.length];
  }

  function mapItem(item) {
    var id = String(item.id || item._id || "");
    var tags = parseTags(item.tags);
    var categories = tags.map(function (name, i) {
      return { name: name, color: tagColor(name, i) };
    });
    var description = String(item.description || "").trim();
    var body = description
      ? description.split(/\n+/).filter(Boolean)
      : ["Téléchargez cet imprimable et amusez-vous !"];

    return {
      id: id,
      title: String(item.name || item.title || "Imprimable").trim(),
      tag: tags[0] || "Imprimable",
      tagColor: tagColor(tags[0] || "Imprimable", 0),
      categories: categories,
      coverImage: item.coverImage || "",
      body: body,
      pdfUrl: item.pdfUrl || "",
      pdfName: item.pdfName || "",
    };
  }

  function buildCatalog(items) {
    PRINTABLES = {};
    PRINTABLE_IDS = [];
    ALL_TAGS = [];
    var tagSet = {};

    (items || []).forEach(function (item) {
      var mapped = mapItem(item);
      if (!mapped.id) return;
      PRINTABLES[mapped.id] = mapped;
      PRINTABLE_IDS.push(mapped.id);
      mapped.categories.forEach(function (cat) {
        tagSet[cat.name] = cat;
      });
    });

    ALL_TAGS = Object.keys(tagSet).map(function (name) {
      return tagSet[name];
    });
  }

  function hideAllViews() {
    [viewListing, viewSectionAll, viewTag, viewDetail].forEach(function (view) {
      if (view) view.classList.remove("active");
    });
  }

  function getCardDesc(data) {
    var text = (data.body[0] || "").replace(/<[^>]+>/g, "");
    return text.length > 110 ? text.slice(0, 110) + "..." : text;
  }

  function getCardImgHtml(data) {
    if (data.coverImage) {
      return (
        '<img src="' +
        esc(data.coverImage) +
        '" alt="' +
        esc(data.title) +
        '" loading="lazy">'
      );
    }
    return '<div class="img-placeholder"><span>Imprimable</span></div>';
  }

  function renderActivityCardTags(data) {
    var tags = data.categories.length
      ? data.categories
      : [{ name: data.tag, color: data.tagColor }];
    return tags
      .map(function (item) {
        return (
          '<button type="button" class="tag ' +
          item.color +
          '" data-tag="' +
          esc(item.name) +
          '">' +
          esc(item.name) +
          "</button>"
        );
      })
      .join("");
  }

  function bindActivityCards(container) {
    if (!container) return;
    container.querySelectorAll(".activity-card .card-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        openDetail(link.dataset.id);
      });
    });
    container.querySelectorAll(".activity-card .card-tags .tag").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        openTagView(btn.dataset.tag);
      });
    });
  }

  function renderActivityCards(container, ids) {
    if (!container) return;
    if (!ids.length) {
      container.innerHTML =
        '<p class="printables-empty">Aucun imprimable disponible pour le moment.</p>';
      return;
    }

    container.innerHTML = ids
      .map(function (id) {
        var data = PRINTABLES[id];
        if (!data) return "";
        return (
          '<article class="activity-card" data-id="' +
          id +
          '">' +
          '<a class="card-link" href="#' +
          id +
          '" data-id="' +
          id +
          '">' +
          '<div class="card-img">' +
          getCardImgHtml(data) +
          "</div>" +
          "<h3>" +
          esc(data.title) +
          "</h3>" +
          "</a>" +
          "<p>" +
          esc(getCardDesc(data)) +
          "</p>" +
          '<div class="card-tags">' +
          renderActivityCardTags(data) +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    bindActivityCards(container);
  }

  function renderListingGrid() {
    renderAllTags();
    renderActivityCards(document.getElementById("listingPrintablesGrid"), PRINTABLE_IDS);
  }

  function renderAllTags(activeTag) {
    var grids = [
      document.getElementById("listingTagsGrid"),
      document.getElementById("sectionTagsGrid"),
      document.getElementById("tagTagsGrid"),
    ].filter(Boolean);

    var html = ALL_TAGS.map(function (tag) {
      var isActive = activeTag && tag.name === activeTag;
      return (
        '<button type="button" class="tag ' +
        tag.color +
        (isActive ? " active" : "") +
        '" data-tag="' +
        esc(tag.name) +
        '">' +
        esc(tag.name) +
        "</button>"
      );
    }).join("");

    grids.forEach(function (grid) {
      grid.innerHTML = html || '<span style="color:#64748B;font-size:14px;">Aucun tag</span>';
      grid.querySelectorAll(".tag").forEach(function (button) {
        button.addEventListener("click", function () {
          openTagView(button.dataset.tag);
        });
      });
    });
  }

  function printableMatchesTag(data, tagName) {
    if (data.tag === tagName) return true;
    return data.categories.some(function (item) {
      return item.name === tagName;
    });
  }

  function openSectionAll(replaceHistory) {
    currentTagName = "";
    var heroImg = document.getElementById("sectionHeroImg");
    if (heroImg) {
      heroImg.src = DEFAULT_HERO;
      heroImg.alt = "Imprimables — activités et fiches à télécharger";
    }
    renderAllTags();
    renderActivityCards(
      document.getElementById("sectionImprimerablesCards"),
      PRINTABLE_IDS,
    );

    hideAllViews();
    viewSectionAll.classList.add("active");
    window.scrollTo(0, 0);

    var state = { view: "section" };
    if (replaceHistory) history.replaceState(state, "", "#section/all");
    else history.pushState(state, "", "#section/all");
  }

  function openTagView(tagName, replaceHistory) {
    if (!tagName) return;
    currentTagName = tagName;

    var heroImg = document.getElementById("tagHeroImg");
    if (heroImg) {
      heroImg.src = DEFAULT_HERO;
      heroImg.alt = "Imprimables — " + tagName;
    }
    document.getElementById("taggedHeader").textContent = "Tagged with: " + tagName;
    var crumb = document.getElementById("tagFilArianeName");
    if (crumb) crumb.textContent = tagName;

    renderAllTags(tagName);
    var ids = PRINTABLE_IDS.filter(function (id) {
      return printableMatchesTag(PRINTABLES[id], tagName);
    });
    renderActivityCards(document.getElementById("tagImprimerablesCards"), ids);

    hideAllViews();
    viewTag.classList.add("active");
    window.scrollTo(0, 0);

    var hash = "#tag/" + encodeURIComponent(tagName);
    var state = { view: "tag", tag: tagName };
    if (replaceHistory) history.replaceState(state, "", hash);
    else history.pushState(state, "", hash);
  }

  function showListing() {
    hideAllViews();
    viewListing.classList.add("active");
    currentTagName = "";
    window.scrollTo(0, 0);
    history.pushState({ view: "listing" }, "", window.location.pathname + window.location.search);
  }

  function renderMoreCards(currentId) {
    var container = document.getElementById("moreImprimerablesCards");
    if (!container) return;

    var startIndex = PRINTABLE_IDS.indexOf(currentId);
    var relatedIds = [];
    for (var i = 1; i <= 3; i++) {
      if (!PRINTABLE_IDS.length) break;
      relatedIds.push(PRINTABLE_IDS[(startIndex + i) % PRINTABLE_IDS.length]);
    }

    renderActivityCards(container, relatedIds);
  }

  function getCardPhotoHtml(id) {
      var data = PRINTABLES[id];
    if (!data) return "";
    if (data.coverImage) {
      return (
        '<img src="' +
        esc(data.coverImage) +
        '" alt="' +
        esc(data.title) +
        '" loading="lazy">'
      );
    }
    return (
      '<svg viewBox="0 0 390 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="390" height="220" fill="#E7EBFB"></rect>' +
      '<text x="195" y="115" text-anchor="middle" font-size="16" fill="#64748B">Imprimable</text></svg>'
    );
  }

  function wireDownloadButton(data) {
    var btn = document.getElementById("printableDownloadBtn");
    if (!btn) return;
    btn.onclick = function () {
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("PDF non disponible pour cet imprimable.");
      }
    };
  }

  function openDetail(id, replaceHistory) {
    var data = PRINTABLES[id];
    if (!data) return;

    document.getElementById("detailTitle").textContent = data.title;
    var detailCrumb = document.getElementById("detailFilArianeTitle");
    if (detailCrumb) detailCrumb.textContent = data.title;

    var detailTag = document.getElementById("detailTag");
    detailTag.textContent = data.tag;
    detailTag.className = "printable-tag " + data.tagColor;
    detailTag.onclick = function () {
      openTagView(data.tag);
    };

    document.getElementById("detailImg").innerHTML = getCardPhotoHtml(id);
    document.getElementById("detailBody").innerHTML = data.body
      .map(function (p) {
        return "<p>" + p + "</p>";
      })
      .join("");
    wireDownloadButton(data);
    renderMoreCards(id);

    hideAllViews();
    viewDetail.classList.add("active");
    window.scrollTo(0, 0);

    var state = { view: "detail", id: id };
    if (replaceHistory) history.replaceState(state, "", "#" + id);
    else history.pushState(state, "", "#" + id);
  }

  function routeFromHash() {
    var hash = location.hash.slice(1);
    if (!hash) {
      hideAllViews();
      viewListing.classList.add("active");
      currentTagName = "";
      return;
    }

    if (hash.indexOf("tag/") === 0) {
      var tagName = decodeURIComponent(hash.slice(4));
      if (tagName) {
        openTagView(tagName, true);
        return;
      }
    }

    if (hash.indexOf("section/") === 0) {
      openSectionAll(true);
        return;
    }

    if (PRINTABLES[hash]) {
      openDetail(hash, true);
      return;
    }

    hideAllViews();
    viewListing.classList.add("active");
    currentTagName = "";
  }

  function wireNavigation() {
    var backFromSection = document.getElementById("backFromSection");
    if (backFromSection) {
      backFromSection.addEventListener("click", function (e) {
        e.preventDefault();
        showListing();
      });
    }

    var backFromTag = document.getElementById("backFromTagPrintables");
    if (backFromTag) {
      backFromTag.addEventListener("click", function (e) {
        e.preventDefault();
        showListing();
      });
    }

    var backToImprimerables = document.getElementById("backToImprimerables");
    if (backToImprimerables) {
      backToImprimerables.addEventListener("click", function (e) {
        e.preventDefault();
        if (currentTagName) openTagView(currentTagName);
        else showListing();
      });
    }

    var seeAll = document.getElementById("seeAllImprimerables");
    if (seeAll) {
      seeAll.addEventListener("click", function (e) {
        e.preventDefault();
        openSectionAll();
      });
    }
  }

  function wireNewsletter() {
    if (window.AJBNewsletter && typeof window.AJBNewsletter.wireForm === "function") {
      window.AJBNewsletter.wireForm({
        form: "article-signup-form",
        emailInput: "article-email-input",
        statusEl: "article-signup-confirm",
        source: "printables",
        successText: "Inscription réussie ! Vérifiez votre boîte mail.",
      });
      return;
    }
    var signupForm = document.getElementById("article-signup-form");
    if (!signupForm || signupForm.dataset.newsletterWired === "1") return;
    signupForm.dataset.newsletterWired = "1";
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("article-email-input");
      var confirm = document.getElementById("article-signup-confirm");
      if (!window.AJBNewsletter || typeof window.AJBNewsletter.subscribe !== "function") {
        if (confirm) confirm.textContent = "Service indisponible. Réessayez.";
        return;
      }
      window.AJBNewsletter.subscribe({
        email: input ? input.value : "",
        source: "printables",
      })
        .then(function () {
          if (confirm) {
            confirm.textContent = "Inscription réussie ! Vérifiez votre boîte mail.";
          }
          if (input) input.value = "";
        })
        .catch(function (err) {
          if (confirm) {
            confirm.textContent =
              err && err.code === "invalid"
                ? "Veuillez entrer une adresse e-mail valide."
                : "Impossible d'enregistrer l'e-mail. Réessayez.";
          }
        });
    });
  }

  async function boot() {
    var grid = document.getElementById("listingPrintablesGrid");
    if (grid) {
      grid.innerHTML = '<p class="printables-empty">Chargement des imprimables…</p>';
    }

    wireNavigation();
    wireNewsletter();

    try {
      for (var attempt = 0; attempt < 40 && !window.AJBApi; attempt++) {
        await new Promise(function (resolve) {
          setTimeout(resolve, 50);
        });
      }
      if (!window.AJBApi) throw new Error("API client unavailable");
      var grouped = await AJBApi.get("/play");
      var items = grouped && grouped.printables ? grouped.printables : [];
      buildCatalog(items);
      renderListingGrid();
      routeFromHash();
      window.addEventListener("popstate", routeFromHash);
    } catch (err) {
      console.warn("Printables load failed", err);
      if (grid) {
        grid.innerHTML =
          '<p class="printables-empty">Impossible de charger les imprimables.</p>';
      }
      hideAllViews();
      viewListing.classList.add("active");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
