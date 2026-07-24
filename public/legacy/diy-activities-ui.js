(function () {
  var TAG_COLORS = ["blue", "green", "purple", "orange", "red"];

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

  function tagColor(name, index) {
    return (
      (window.DIY_TAG_COLORS && window.DIY_TAG_COLORS[name]) ||
      TAG_COLORS[(index != null ? index : String(name).length) % TAG_COLORS.length]
    );
  }

  function excerpt(text) {
    var clean = String(text || "")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!clean) return "Découvrez cette activité DIY !";
    return clean.length > 110 ? clean.slice(0, 110) + "…" : clean;
  }

  function mapDiyItem(item) {
    var id = String(item.id || item._id || "");
    var tags = parseTags(item.tags);
    return {
      id: id,
      slug: id,
      title: String(item.name || item.title || "Activité DIY").trim(),
      description: excerpt(item.description),
      tags: tags,
      coverImage: item.coverImage || "",
      href: "/toysrus-diy-article?id=" + encodeURIComponent(id),
    };
  }

  window.renderDiyActivityCard = function (activity) {
    var card = document.createElement("article");
    card.className = "activity-card";

    var url =
      typeof window.getDiyActivityUrl === "function"
        ? window.getDiyActivityUrl(activity)
        : activity.href || "/toysrus-diy-article?id=" + encodeURIComponent(activity.id || activity.slug || "");

    var tagsHtml = (activity.tags || [])
      .map(function (tag, index) {
        var color = tagColor(tag, index);
        return (
          '<a href="/toysrus-diy-tag?tag=' +
          encodeURIComponent(tag) +
          '" class="tag ' +
          color +
          '">' +
          esc(tag) +
          "</a>"
        );
      })
      .join("");

    var imageHtml = activity.coverImage
      ? '<img src="' +
        esc(activity.coverImage) +
        '" alt="' +
        esc(activity.title) +
        '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block;">'
      : '<div class="img-placeholder"><span>' +
        esc(activity.placeholder || "Activité DIY") +
        "</span></div>";

    card.innerHTML =
      '<a class="card-link" href="' +
      esc(url) +
      '">' +
      '<div class="card-img">' +
      imageHtml +
      "</div>" +
      "<h3>" +
      esc(activity.title) +
      "</h3>" +
      "</a>" +
      "<p>" +
      esc(activity.description) +
      "</p>" +
      '<div class="card-tags">' +
      tagsHtml +
      "</div>";

    return card;
  };

  window.renderDiyActivityCards = function (activities, container) {
    if (!container) return;
    container.innerHTML = "";
    if (!activities.length) {
      container.innerHTML =
        '<p style="padding:24px 16px;color:#666;text-align:center;">Aucune activité DIY pour le moment.</p>';
      return;
    }
    activities.forEach(function (activity) {
      container.appendChild(window.renderDiyActivityCard(activity));
    });
  };

  function renderTagsFromActivities(activities) {
    var grid = document.querySelector(".tags-section .tags-grid");
    if (!grid) return;
    var seen = {};
    var tags = [];
    activities.forEach(function (activity) {
      (activity.tags || []).forEach(function (tag) {
        var key = String(tag).toLowerCase();
        if (!key || seen[key]) return;
        seen[key] = true;
        tags.push(tag);
      });
    });
    grid.innerHTML = tags
      .map(function (tag, index) {
        var color = tagColor(tag, index);
        return (
          '<a href="/toysrus-diy-tag?tag=' +
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

  async function loadDiyActivities() {
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
    if (!api) return [];

    var cached = typeof api.getCachedData === "function" ? api.getCachedData("/play") : null;
    var grouped = cached || (await api.get("/play"));
    return ((grouped && grouped.diy) || []).map(mapDiyItem).filter(function (item) {
      return item.id;
    });
  }

  async function bootDiyActivitiesListing() {
    var listing = document.getElementById("activityCards");
    var isTagPage = Boolean(document.getElementById("taggedHeader"));
    if (!listing && !isTagPage) return;

    if (listing && !isTagPage) {
      listing.innerHTML =
        '<p style="padding:24px 16px;color:#666;text-align:center;">Chargement des activités…</p>';
    }

    try {
      var activities = await loadDiyActivities();
      window.DIY_ACTIVITIES = activities;

      if (isTagPage) {
        var params = new URLSearchParams(window.location.search || "");
        var currentTag = params.get("tag") || "";
        var needle = String(currentTag).toLowerCase();
        var header = document.getElementById("taggedHeader");
        var crumb = document.getElementById("breadcrumbTag");
        if (header) header.textContent = currentTag ? "Tagged with: " + currentTag : "Activités DIY";
        if (crumb) crumb.textContent = currentTag || "DIY";
        if (currentTag) document.title = "Tagged with: " + currentTag + ' – Toys"R"Us Activités DIY';

        var matches = needle
          ? activities.filter(function (activity) {
              return (activity.tags || []).some(function (tag) {
                return String(tag).toLowerCase() === needle;
              });
            })
          : activities;

        var empty = document.getElementById("emptyWilaya");
        if (!matches.length) {
          if (listing) {
            listing.innerHTML = "";
            listing.hidden = true;
          }
          if (empty) {
            empty.hidden = false;
            empty.textContent = "Aucune activité trouvée pour ce tag.";
          }
          return;
        }
        if (listing) listing.hidden = false;
        if (empty) empty.hidden = true;
        window.renderDiyActivityCards(matches, listing);
        return;
      }

      renderTagsFromActivities(activities);
      window.renderDiyActivityCards(activities, listing);
    } catch (err) {
      console.warn("DIY activities load failed", err);
      if (window.DIY_ACTIVITIES && window.DIY_ACTIVITIES.length) {
        window.renderDiyActivityCards(window.DIY_ACTIVITIES, listing);
      } else if (listing) {
        listing.innerHTML =
          '<p style="padding:24px 16px;color:#666;text-align:center;">Impossible de charger les activités DIY.</p>';
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootDiyActivitiesListing);
  } else {
    bootDiyActivitiesListing();
  }
})();
