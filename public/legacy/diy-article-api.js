(function () {
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

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? "" : String(value);
  }

  function fillArticle(item) {
    var title = String(item.name || item.title || "Activité DIY").trim();
    var description = String(item.description || "").trim();
    var tags = parseTags(item.tags);
    var primaryTag = tags[0] || "DIY";

    document.title = title + ' – Toys"R"Us Activités DIY';
    setText("articleTitle", title);
    setText("breadcrumbTitle", title);
    setText("videoTitle", title);
    setText("articleDescription", description || "Découvrez cette activité DIY !");

    var hero = document.getElementById("articleHero");
    if (hero) {
      if (item.coverImage) {
        hero.outerHTML =
          '<img class="hero-img-photo" src="' +
          esc(item.coverImage) +
          '" alt="' +
          esc(title) +
          '" style="width:100%;height:100%;object-fit:cover;display:block;">';
      } else {
        hero.textContent = title;
      }
    }

    var crumb = document.getElementById("breadcrumbTagLink");
    if (crumb) {
      crumb.textContent = primaryTag;
      crumb.href = "/toysrus-diy-tag?tag=" + encodeURIComponent(primaryTag);
    }

    var tagsEl =
      document.getElementById("articleÉtiquettes") ||
      document.getElementById("articleTags") ||
      document.getElementById("articleTag");
    if (tagsEl) {
      if (tagsEl.id === "articleTag") {
        tagsEl.textContent = primaryTag;
        tagsEl.href = "/toysrus-diy-tag?tag=" + encodeURIComponent(primaryTag);
        tagsEl.className = "tag blue";
      } else {
        tagsEl.innerHTML = tags
          .map(function (tag) {
            var color = (window.DIY_TAG_COLORS && window.DIY_TAG_COLORS[tag]) || "blue";
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
    }
  }

  async function bootFromApi() {
    var params = new URLSearchParams(window.location.search || "");
    var id = params.get("id");
    if (!id) return false;

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
    if (!api) return false;

    var grouped = await api.get("/play");
    var diy = (grouped && grouped.diy) || [];
    var item = diy.find(function (entry) {
      return String(entry.id || entry._id) === String(id);
    });
    if (!item) {
      window.location.replace("/toysrus-diy-activities");
      return true;
    }
    fillArticle(item);
    return true;
  }

  async function boot() {
    try {
      var handled = await bootFromApi();
      if (handled) return;
    } catch (err) {
      console.warn("DIY article API boot failed", err);
    }

    // Fallback: legacy slug-based demo data
    var slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug || typeof window.findDiyActivityBySlug !== "function") return;
    var activity = window.findDiyActivityBySlug(slug);
    if (!activity) {
      window.location.replace("/toysrus-diy-activities");
      return;
    }
    if (activity.href) {
      window.location.replace(activity.href);
      return;
    }
    fillArticle({
      name: activity.title,
      description: activity.description,
      tags: activity.tags,
      coverImage: "",
    });
    var hero = document.getElementById("articleHero");
    if (hero && activity.placeholder) hero.textContent = activity.placeholder;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
