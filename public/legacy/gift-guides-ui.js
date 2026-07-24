(function () {
  var TAG_COLORS = ["blue", "green", "purple", "orange", "red"];
  var GIFT_TAGS = ["gift", "cadeaux"];

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function parseTags(tags) {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags
        .map(function (t) {
          return String(t).trim();
        })
        .filter(Boolean);
    }
    return String(tags)
      .split(",")
      .map(function (t) {
        return t.trim();
      })
      .filter(Boolean);
  }

  function normalizeTag(tag) {
    return String(tag || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function hasGiftTag(tags) {
    return tags.some(function (tag) {
      return GIFT_TAGS.indexOf(normalizeTag(tag)) !== -1;
    });
  }

  function tagColor(name, index) {
    return TAG_COLORS[(index != null ? index : String(name).length) % TAG_COLORS.length];
  }

  function excerpt(text) {
    var clean = String(text || "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!clean) return "Découvrez cette idée cadeau !";
    return clean.length > 110 ? clean.slice(0, 110) + "…" : clean;
  }

  function itemUrl(item) {
    var id = encodeURIComponent(item.id);
    if (item.source === "printables") return "/toysrus-printables#" + id;
    return "/toysrus-diy-article?id=" + id;
  }

  function mapItem(item, source) {
    var id = String(item.id || item._id || "");
    var tags = parseTags(item.tags);
    return {
      id: id,
      source: source,
      title: String(item.name || item.title || "Guide cadeaux").trim(),
      description: excerpt(item.description),
      tags: tags,
      coverImage: item.coverImage || "",
      href: itemUrl({ id: id, source: source }),
    };
  }

  function collectGiftGuides(grouped) {
    var diy = (grouped && grouped.diy) || [];
    var printables = (grouped && grouped.printables) || [];
    var guides = [];

    diy.forEach(function (item) {
      var mapped = mapItem(item, "diy");
      if (mapped.id && hasGiftTag(mapped.tags)) guides.push(mapped);
    });
    printables.forEach(function (item) {
      var mapped = mapItem(item, "printables");
      if (mapped.id && hasGiftTag(mapped.tags)) guides.push(mapped);
    });

    return guides;
  }

  function uniqueTags(guides) {
    var seen = {};
    var list = [];
    guides.forEach(function (guide) {
      guide.tags.forEach(function (tag) {
        var key = normalizeTag(tag);
        if (!key || seen[key]) return;
        // Keep Gift / Cadeaux visible too, plus every other tag on those cards.
        seen[key] = true;
        list.push(tag);
      });
    });
    return list;
  }

  window.GIFT_GUIDE_TAG_COLORS = window.GIFT_GUIDE_TAG_COLORS || {};
  window.GIFT_GUIDES = window.GIFT_GUIDES || [];

  window.getGiftGuideUrl = function (guide) {
    if (guide.href) return guide.href;
    if (guide.source === "printables") {
      return "/toysrus-printables#" + encodeURIComponent(guide.id || guide.slug || "");
    }
    if (guide.id) return "/toysrus-diy-article?id=" + encodeURIComponent(guide.id);
    return "/toysrus-gift-guide-article?slug=" + encodeURIComponent(guide.slug || "");
  };

  window.findGiftGuideBySlug = function (slug) {
    return (
      window.GIFT_GUIDES.find(function (guide) {
        return guide.slug === slug || guide.id === slug;
      }) || null
    );
  };

  window.renderGiftGuideCard = function (guide) {
    var card = document.createElement("article");
    card.className = "activity-card";

    var url = window.getGiftGuideUrl(guide);
    var tagsHtml = (guide.tags || [])
      .map(function (tag, index) {
        var color = window.GIFT_GUIDE_TAG_COLORS[tag] || tagColor(tag, index);
        return (
          '<a href="/toysrus-gift-guide-tag?tag=' +
          encodeURIComponent(tag) +
          '" class="tag ' +
          color +
          '">' +
          esc(tag) +
          "</a>"
        );
      })
      .join("");

    var imageHtml = guide.coverImage
      ? '<img src="' +
        esc(guide.coverImage) +
        '" alt="' +
        esc(guide.title) +
        '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;">'
      : '<div class="img-placeholder"><span>' +
        esc(guide.placeholder || "Guide cadeaux") +
        "</span></div>";

    card.innerHTML =
      '<a class="card-link" href="' +
      esc(url) +
      '">' +
      '<div class="card-img">' +
      imageHtml +
      "</div>" +
      "<h3>" +
      esc(guide.title) +
      "</h3>" +
      "</a>" +
      "<p>" +
      esc(guide.description) +
      "</p>" +
      '<div class="card-tags">' +
      tagsHtml +
      "</div>";

    return card;
  };

  window.renderGiftGuideCards = function (guides, container) {
    if (!container) return;
    container.innerHTML = "";
    if (!guides.length) {
      container.innerHTML =
        '<p class="gift-guides-empty" style="padding:24px 16px;color:#666;text-align:center;">Aucun guide cadeaux pour le moment. Ajoutez le tag Gift ou Cadeaux à un imprimable ou une activité DIY.</p>';
      return;
    }
    guides.forEach(function (guide) {
      container.appendChild(window.renderGiftGuideCard(guide));
    });
  };

  function renderTagsGrid(tags) {
    var grid = document.querySelector(".tags-section .tags-grid");
    if (!grid) return;
    if (!tags.length) {
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = tags
      .map(function (tag, index) {
        var color = tagColor(tag, index);
        window.GIFT_GUIDE_TAG_COLORS[tag] = color;
        return (
          '<a href="/toysrus-gift-guide-tag?tag=' +
          encodeURIComponent(tag) +
          '" class="tag ' +
          color +
          '">' +
          esc(tag) +
          "</a>"
        );
      })
      .join("");
  }

  function renderListing(guides) {
    window.GIFT_GUIDES = guides;
    renderTagsGrid(uniqueTags(guides));
    window.renderGiftGuideCards(guides, document.getElementById("giftGuideCards"));
  }

  function renderTagPage(guides) {
    window.GIFT_GUIDES = guides;
    var params = new URLSearchParams(window.location.search || "");
    var currentTag = params.get("tag") || "";
    var needle = normalizeTag(currentTag);

    var header = document.getElementById("taggedHeader");
    var crumb = document.getElementById("breadcrumbTag");
    if (header) header.textContent = currentTag ? "Tagged with: " + currentTag : "Guides cadeaux";
    if (crumb) crumb.textContent = currentTag || "Guides cadeaux";
    if (currentTag) document.title = "Tagged with: " + currentTag + ' – Toys"R"Us Guides cadeaux';

    var matches = needle
      ? guides.filter(function (guide) {
          return (guide.tags || []).some(function (tag) {
            return normalizeTag(tag) === needle;
          });
        })
      : guides;

    var cards = document.getElementById("activityCards") || document.getElementById("giftGuideCards");
    var empty = document.getElementById("emptyWilaya");

    if (!matches.length) {
      if (cards) {
        cards.innerHTML = "";
        cards.hidden = true;
      }
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Aucun guide cadeaux trouvé pour ce tag.";
      }
      return;
    }

    if (cards) cards.hidden = false;
    if (empty) empty.hidden = true;
    window.renderGiftGuideCards(matches, cards);
  }

  async function loadGuides() {
    var api = null;
    if (window.AJBApi && typeof window.AJBApi.whenReady === "function") {
      api = await window.AJBApi.whenReady();
    } else {
      for (var i = 0; i < 80 && !window.AJBApi; i++) {
        await new Promise(function (resolve) {
          setTimeout(resolve, 50);
        });
      }
      api = window.AJBApi || null;
    }
    if (!api) throw new Error("API unavailable");

    var cached = typeof api.getCachedData === "function" ? api.getCachedData("/play") : null;
    if (cached) return collectGiftGuides(cached);

    var grouped = await api.get("/play");
    return collectGiftGuides(grouped);
  }

  async function boot() {
    var listing = document.getElementById("giftGuideCards");
    var tagPage = document.getElementById("activityCards") && document.getElementById("taggedHeader");
    if (!listing && !tagPage) return;

    if (listing) {
      listing.innerHTML =
        '<p class="gift-guides-empty" style="padding:24px 16px;color:#666;text-align:center;">Chargement des guides cadeaux…</p>';
    }

    try {
      var guides = await loadGuides();
      if (listing) renderListing(guides);
      if (tagPage) renderTagPage(guides);
    } catch (err) {
      console.warn("Gift guides load failed", err);
      if (listing) {
        listing.innerHTML =
          '<p class="gift-guides-empty" style="padding:24px 16px;color:#666;text-align:center;">Impossible de charger les guides cadeaux.</p>';
      }
      if (tagPage) {
        var empty = document.getElementById("emptyWilaya");
        var cards = document.getElementById("activityCards");
        if (cards) cards.hidden = true;
        if (empty) {
          empty.hidden = false;
          empty.textContent = "Impossible de charger les guides cadeaux.";
        }
      }
    }
  }

  window.__ajbGiftGuidesBoot = boot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
