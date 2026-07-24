(function () {
  var CONTAINER_SELECTORS = [
    "#productTrack",
    "#bookTrack",
    "#featuredTrack",
    "#relatedTrack",
    "#bobsProductTrack",
    "#productGrid",
    ".product-grid",
    ".age-section .carousel",
  ];

  var CONTAINER_FILTERS = {
    productTrack: { productCategory: "exterieur" },
    bookTrack: { booksOnly: "true" },
    featuredTrack: { booksOnly: "true" },
    bobsProductTrack: { booksOnly: "true" },
    relatedTrack: { relatedToCurrent: "true" },
  };

  var SECTION_FILTERS = {
    productCarousel: { productCategory: "exterieur" },
    bookSection: { booksOnly: "true" },
    "category-new-trending": { isTrending: "true" },
    "category-jeu-symbolique": { productCategory: "Jeu symbolique" },
    "category-outdoor": { productCategory: "exterieur" },
    "category-bebe-tout-petits": { productCategory: "Jouets bébé et tout-petits" },
    "category-jolie-coiffure": { productCategory: "Jolie Coiffure" },
    "category-atelier-blocs": { productCategory: "Atelier des Blocs" },
    "category-books": { booksOnly: "true" },
  };

  var PAGE_FILTERS = {
    "/spider-man": { productCharacter: "Spider-Man" },
    "/outdoor-play": { productCategory: "exterieur" },
    "/books-page": { booksOnly: "true" },
    "/book-category-page": { booksOnly: "true" },
    "/cartoon-and-friends": { productCategory: "cartoon" },
    "/gros-main": { productCategory: "gros" },
    "/new-and-trending": { isTrending: "true" },
    "/all-selection-page": {},
    "/age-products": {},
    "/shop-by-age-products-page": {},
    "/brand": {},
    "/character": {},
  };

  var BRAND_CHARACTERS = {
    paramount: [
      "Paramount",
      "SpongeBob SquarePants",
      "SpongeBob",
      "The Last Airbender",
      "Avatar The Last Airbender",
      "The Legend of Korra",
      "PAW Patrol",
      "Teenage Mutant Ninja Turtles",
      "TMNT",
      "Tortues Ninja",
      "Fairly OddParents",
      "Dora",
      "Dora the Explorer"
    ],
    caterpillar: ["Caterpillar"],
    "john deere": ["John Deere", "John deere"],
    newboy: ["NEWBOY", "Newboy", "Fulla"],
    sanrio: [
      "Sanrio",
      "Hello Kitty",
      "Cinnamoroll",
      "My Melody",
      "Kuromi",
      "Pompompurin",
      "Keroppi",
      "Pochacco",
      "Bad Badtz-Maru",
      "Gudetama",
      "Aggretsuko"
    ],
    "warner bros discovery": [
      "Warner Bros",
      "Warner Bros. Discovery",
      "Warner Brothers",
      "Looney Tunes",
      "Tom and Jerry",
      "Tom & Jerry",
      "Scooby-Doo",
      "Scooby Doo",
      "The Jetsons",
      "Jetsons",
      "Batman",
      "Superman",
      "Wonder Woman",
      "Green Lantern",
      "Cyborg",
      "Black Canary",
      "Gumball",
      "The Amazing World of Gumball",
      "Darwin",
      "Anais",
      "Watterson",
      "The Powerpuff Girls",
      "Powerpuff Girls",
      "Dexter's Laboratory",
      "Dexter Laboratory",
      "Adventure Time",
      "Courage the Cowardly Dog",
      "Codename: Kids Next Door",
      "Kids Next Door"
    ],
    "alpha group": [
      "Alpha Group",
      "Super Wings",
      "Super wings",
      "Rev & Roll",
      "Rev and Roll",
      "Infinity Nado"
    ],
    disney: [
      "Disney",
      "princess sophia",
      "Princess Sophia",
      "Princess Sofia",
      "Sofia",
      "Sofia the First",
      "Disney Heroines",
      "Young Simba",
      "Simba",
      "Winnie the Pooh",
      "Christopher Robin",
      "Oliver",
      "Dodger",
      "Mickey Mouse",
      "Mickey",
      "Donald Duck",
      "Donald",
      "Goofy",
      "Tinker Bell",
      "Elena of Avalor",
      "Ever After High",
      "Winx",
      "She-Ra"
    ],
    marvel: [
      "Marvel",
      "Peter Parker",
      "Gwen Stacy",
      "Miles Morales",
      "Team Spidey",
      "Iron Man",
      "Thor",
      "Captain America",
      "Spider-Man",
      "Spiderman",
      "Spidey"
    ]
  };

  var AGE_SECTION_FILTERS = {
    "age-0-12-mois": "0-12 mois",
    "age-1-2": "1-2 ans",
    "age-2-3": "2-3 ans",
    "age-3-5": "3-5 ans",
    "age-5-8": "5-8 ans",
    "age-8-plus": "8 ans et +",
  };

  var cachedProducts = [];

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  function formatPrice(price) {
    var num = Number(price);
    if (!Number.isFinite(num)) return "—";
    return num.toLocaleString("fr-DZ") + " DZD";
  }

  function formatRating(rating) {
    var r = Math.max(0, Math.min(5, Number(rating) || 0));
    var full = Math.round(r);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function normalizeNeedle(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fieldValues(product, keys) {
    var values = [];
    keys.forEach(function (key) {
      var raw = product[key];
      if (Array.isArray(raw)) values = values.concat(raw);
      else if (raw) values.push(raw);
    });
    return values;
  }

  function matchesNeedle(product, needle, keys) {
    if (!needle) return true;
    var n = normalizeNeedle(needle);
    if (!n) return false;
    var nCompact = n.replace(/\s+/g, "");
    return fieldValues(product, keys).some(function (value) {
      var v = normalizeNeedle(value);
      if (!v) return false;
      if (v.indexOf(n) !== -1) return true;
      // Compact form: "spider man" ↔ "spiderman"
      var vCompact = v.replace(/\s+/g, "");
      if (nCompact && vCompact && vCompact.indexOf(nCompact) !== -1) return true;
      // Reverse contains only for meaningful tokens (avoid "c" matching "cat")
      if (v.length >= 4 && n.indexOf(v) !== -1) return true;
      if (vCompact.length >= 4 && nCompact.indexOf(vCompact) !== -1) return true;
      return false;
    });
  }

  function brandLookupKey(value) {
    return normalizeNeedle(value)
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function resolveBrandCharacters(brand) {
    if (!brand) return [];
    var key = brandLookupKey(brand);
    if (BRAND_CHARACTERS[key]) return BRAND_CHARACTERS[key].slice();
    if (key.indexOf("warner") !== -1) return BRAND_CHARACTERS["warner bros discovery"].slice();
    if (key.indexOf("john") !== -1 && key.indexOf("deere") !== -1) return BRAND_CHARACTERS["john deere"].slice();
    if (key.indexOf("alpha") !== -1) return BRAND_CHARACTERS["alpha group"].slice();
    return [];
  }


  var CHARACTER_ALIASES = {
    tmnt: ["TMNT", "Teenage Mutant Ninja Turtles", "Tortues Ninja", "ninja turtles"],
    "teenage mutant ninja turtles": ["TMNT", "Teenage Mutant Ninja Turtles", "Tortues Ninja", "ninja turtles"],
    "ninja turtles": ["TMNT", "Teenage Mutant Ninja Turtles", "Tortues Ninja", "ninja turtles"],
    "tom jerry": ["Tom & Jerry", "Tom and Jerry", "tom&jerry"],
    "tom and jerry": ["Tom & Jerry", "Tom and Jerry", "tom&jerry"],
    "spider man": ["Spider-Man", "Spiderman", "Spidey", "Peter Parker"],
    spiderman: ["Spider-Man", "Spiderman", "Spidey"],
    sophia: ["Sophia", "Sofia", "Princess Sophia", "princess sophia", "Sofia the First"],
    sofia: ["Sophia", "Sofia", "Princess Sophia", "princess sophia", "Sofia the First"],
    "super wings": ["Super Wings", "Super wings"],
    "hello kitty": ["Hello Kitty"],
    fulla: ["Fulla"],
    bob: ["Bob"]
  };

  function resolveCharacterNeedles(character) {
    if (!character) return [];
    var key = brandLookupKey(character);
    if (CHARACTER_ALIASES[key]) return CHARACTER_ALIASES[key].slice();
    return [character];
  }

  function matchesAnyNeedle(product, needles, keys) {
    if (!needles || !needles.length) return true;
    return needles.some(function (needle) {
      return matchesNeedle(product, needle, keys);
    });
  }

  function mergeFilterTarget(target, source) {
    if (!source) return;
    Object.keys(source).forEach(function (key) {
      if (source[key] && !target[key]) target[key] = source[key];
    });
  }

  function inferFiltersFromContext(container) {
    var inferred = {};
    var containerId = container.id || "";
    mergeFilterTarget(inferred, CONTAINER_FILTERS[containerId]);

    var sectionEl = container.closest("section[id], .carousel-wrap[id], section");
    if (sectionEl && sectionEl.id) {
      mergeFilterTarget(inferred, SECTION_FILTERS[sectionEl.id]);
    }

    var heroSection = container.closest("#productCarousel, .carousel-wrap");
    if (heroSection) {
      var prevHero = heroSection.previousElementSibling;
      if (prevHero) {
        var heroHeading = prevHero.querySelector(".hero-full-content h1, h1");
        if (heroHeading) {
          var heroText = normalizeNeedle(heroHeading.textContent);
          if (heroText.indexOf("exterieur") !== -1 || heroText.indexOf("outdoor") !== -1) {
            inferred.productCategory = inferred.productCategory || "exterieur";
          }
        }
      }
    }

    var headingScope = container.closest("section, .carousel-wrap, .related, .follow-section") || container.parentElement;
    if (headingScope) {
      var heading = headingScope.querySelector("h1, h2, .age-title, .title");
      if (heading) {
        var text = normalizeNeedle(heading.textContent);
        if (text.indexOf("exterieur") !== -1 || text.indexOf("outdoor") !== -1) {
          inferred.productCategory = inferred.productCategory || "exterieur";
        }
        if (text.indexOf("livre") !== -1 || text.indexOf("book") !== -1 || text.indexOf("magazine") !== -1) {
          inferred.booksOnly = inferred.booksOnly || "true";
        }
        if (text.indexOf("tendance") !== -1 || text.indexOf("nouveau") !== -1 || text.indexOf("trending") !== -1) {
          inferred.isTrending = inferred.isTrending || "true";
        }
        if (text.indexOf("jeu symbolique") !== -1) {
          inferred.productCategory = inferred.productCategory || "Jeu symbolique";
        }
        if (text.indexOf("jolie coiffure") !== -1) {
          inferred.productCategory = inferred.productCategory || "Jolie Coiffure";
        }
        if (text.indexOf("atelier") !== -1 && text.indexOf("bloc") !== -1) {
          inferred.productCategory = inferred.productCategory || "Atelier des Blocs";
        }
        if (
          (text.indexOf("jouets bebe") !== -1 && text.indexOf("tout") !== -1) ||
          text.indexOf("tout-petits") !== -1 ||
          text.indexOf("tout petits") !== -1
        ) {
          inferred.productCategory = inferred.productCategory || "Jouets bébé et tout-petits";
        }
        if (text.indexOf("spider") !== -1) inferred.productCharacter = inferred.productCharacter || "spider";
      }
    }

    return inferred;
  }

  function resolveContainerFilters(container) {
    var filters = {
      booksOnly: container.dataset.booksOnly || "",
      productCategory: container.dataset.productCategory || "",
      productCharacter: container.dataset.productCharacter || "",
      productAge: container.dataset.productAge || "",
      productLimit: container.dataset.productLimit || "",
      relatedToCurrent: container.dataset.relatedToCurrent || "",
      isTrending: container.dataset.isTrending || "",
      productBrand: container.dataset.productBrand || "",
      brandCharacters: [],
    };

    mergeFilterTarget(filters, inferFiltersFromContext(container));

    var section = container.closest(".age-section");
    if (section && section.id && AGE_SECTION_FILTERS[section.id]) {
      filters.productAge = filters.productAge || AGE_SECTION_FILTERS[section.id];
    }

    if (
      !filters.productCategory &&
      !filters.productCharacter &&
      !filters.booksOnly &&
      !filters.productAge &&
      !filters.relatedToCurrent
    ) {
      var path = (window.location.pathname || "").replace(/\/$/, "") || "/";
      var pageFilter = PAGE_FILTERS[path];
      if (pageFilter) {
        filters.booksOnly = filters.booksOnly || pageFilter.booksOnly || "";
        filters.productCategory = filters.productCategory || pageFilter.productCategory || "";
        filters.productCharacter = filters.productCharacter || pageFilter.productCharacter || "";
        filters.productAge = filters.productAge || pageFilter.productAge || "";
        filters.isTrending = filters.isTrending || pageFilter.isTrending || "";
      }
    }

    var params = new URLSearchParams(window.location.search || "");
    if (params.get("category")) {
      filters.productCategory = params.get("category") || "";
    }
    if (params.get("character")) {
      filters.productCharacter = params.get("character") || "";
    }
    if (params.get("age")) {
      filters.productAge = params.get("age") || "";
    }
    if (params.get("brand")) {
      filters.productBrand = params.get("brand") || "";
    }
    if (filters.productBrand) {
      filters.brandCharacters = resolveBrandCharacters(filters.productBrand);
    }

    return filters;
  }

  var listingDrawerFilters = null;

  function matchesAnyOf(product, values, keys) {
    if (!values || !values.length) return true;
    return values.some(function (value) {
      return matchesNeedle(product, value, keys);
    });
  }

  function applyListingDrawerFilters(list) {
    if (!listingDrawerFilters) return list;
    var f = listingDrawerFilters;
    var next = list.slice();

    if (f.categories && f.categories.length) {
      next = next.filter(function (p) {
        return matchesAnyOf(p, f.categories, ["category", "tags", "name"]);
      });
    }
    if (f.ages && f.ages.length) {
      next = next.filter(function (p) {
        return matchesAnyOf(p, f.ages, ["ageTranche", "age", "tags"]);
      });
    }
    if (f.brands && f.brands.length) {
      next = next.filter(function (p) {
        return f.brands.some(function (brand) {
          var brandNeedles = resolveBrandCharacters(brand);
          if (brandNeedles.length) {
            return matchesAnyNeedle(p, brandNeedles.concat([brand]), ["character", "tags", "name", "category"]);
          }
          return matchesNeedle(p, brand, ["character", "tags", "name", "category"]);
        });
      });
    }
    if (f.characters && f.characters.length) {
      next = next.filter(function (p) {
        return f.characters.some(function (character) {
          return matchesAnyNeedle(p, resolveCharacterNeedles(character), ["character", "tags", "name", "category"]);
        });
      });
    }
    if (Number.isFinite(f.priceMin) || Number.isFinite(f.priceMax)) {
      var min = Number.isFinite(f.priceMin) ? f.priceMin : 0;
      var max = Number.isFinite(f.priceMax) ? f.priceMax : Infinity;
      next = next.filter(function (p) {
        var price = Number(p.price);
        if (!Number.isFinite(price)) return false;
        return price >= min && price <= max;
      });
    }

    return sortListingProducts(next, f.sort || "bestselling");
  }

  function sortListingProducts(list, sortVal) {
    var arr = list.slice();
    var byName = function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""), "fr", { sensitivity: "base" });
    };
    var byPrice = function (a, b) {
      return Number(a.price || 0) - Number(b.price || 0);
    };
    var bySales = function (a, b) {
      return Number(b.nbr_commande || b.reviews || 0) - Number(a.nbr_commande || a.reviews || 0);
    };
    var byDate = function (a, b) {
      var da = new Date(a.createdAt || a.updatedAt || 0).getTime() || 0;
      var db = new Date(b.createdAt || b.updatedAt || 0).getTime() || 0;
      if (da !== db) return da - db;
      return String(a.id || a._id || "").localeCompare(String(b.id || b._id || ""));
    };

    switch (sortVal) {
      case "az":
        arr.sort(byName);
        break;
      case "za":
        arr.sort(function (a, b) {
          return byName(b, a);
        });
        break;
      case "lowhigh":
        arr.sort(byPrice);
        break;
      case "highlow":
        arr.sort(function (a, b) {
          return byPrice(b, a);
        });
        break;
      case "oldnew":
        arr.sort(byDate);
        break;
      case "newold":
        arr.sort(function (a, b) {
          return byDate(b, a);
        });
        break;
      case "bestselling":
      default:
        arr.sort(bySales);
        break;
    }
    return arr;
  }

  function filterProducts(products, container) {
    var filters = resolveContainerFilters(container);
    var list = products.slice();

    if (filters.booksOnly === "true") {
      list = list.filter(function (p) {
        return p.isBook;
      });
    }
    if (filters.productCategory) {
      list = list.filter(function (p) {
        return matchesNeedle(p, filters.productCategory, ["category", "tags"]);
      });
    }
    if (filters.productCharacter) {
      var characterNeedles = resolveCharacterNeedles(filters.productCharacter);
      list = list.filter(function (p) {
        return matchesAnyNeedle(p, characterNeedles, ["character", "tags", "name", "category"]);
      });
    }
    if (filters.brandCharacters && filters.brandCharacters.length) {
      var brandNeedles = filters.brandCharacters.slice();
      if (filters.productBrand) brandNeedles.push(filters.productBrand);
      list = list.filter(function (p) {
        return matchesAnyNeedle(p, brandNeedles, ["character", "tags", "name", "category"]);
      });
    } else if (filters.productBrand) {
      list = list.filter(function (p) {
        return matchesNeedle(p, filters.productBrand, ["character", "tags", "name", "category"]);
      });
    }
    if (filters.productAge) {
      list = list.filter(function (p) {
        return matchesNeedle(p, filters.productAge, ["ageTranche", "age", "tags"]);
      });
    }
    if (filters.isTrending === "true") {
      list = list.filter(function (p) {
        return (
          p.isTrending === true ||
          matchesNeedle(p, "tendance", ["category", "tags"]) ||
          matchesNeedle(p, "nouveau", ["category", "tags"])
        );
      });
    }
    if (filters.relatedToCurrent === "true") {
      var current = window.__AJB_CURRENT_PRODUCT__;
      if (!current) {
        list = [];
      } else {
        var currentId = String(current.id || current._id || "");
        list = list.filter(function (p) {
          var pid = String(p.id || p._id || "");
          if (currentId && pid === currentId) return false;
          var sameCategory =
            current.category &&
            matchesNeedle(p, current.category, ["category", "tags"]);
          var sameCharacter =
            current.character &&
            matchesNeedle(p, current.character, ["character", "tags", "name"]);
          return sameCategory || sameCharacter;
        });
      }
    }

    if (container && container.id === "productGrid") {
      list = applyListingDrawerFilters(list);
    }

    var limit = parseInt(filters.productLimit || container.dataset.productLimit || "", 10);
    if (Number.isFinite(limit) && limit > 0) list = list.slice(0, limit);
    return list;
  }

  // Card thumbnails: let Cloudinary serve resized, auto-format,
  // auto-quality variants instead of full-size originals.
  function cardImageUrl(src) {
    var url = String(src || "");
    if (url.indexOf("res.cloudinary.com") === -1) return url;
    if (url.indexOf("/image/upload/") === -1) return url;
    if (/\/upload\/[^/]*\b(w_|q_|f_)/.test(url)) return url;
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto,w_480,c_limit/");
  }

  function imgLoadingAttrs(eager) {
    return eager
      ? ' loading="eager" fetchpriority="high" decoding="async" class="ajb-img ajb-in"'
      : ' loading="lazy" decoding="async" class="ajb-img" onload="this.classList.add(\'ajb-in\')"';
  }

  function imageHtml(product, eager) {
    var src = (product.pictures && product.pictures[0]) || (product.img && product.img[0]) || "";
    if (src) {
      return (
        '<img src="' +
        esc(cardImageUrl(src)) +
        '" alt="' +
        esc(product.name) +
        '"' +
        imgLoadingAttrs(eager) +
        ' style="width:100%;height:100%;object-fit:cover;border-radius:12px;">'
      );
    }
    return (
      '<svg viewBox="0 0 200 200" width="190" height="190" aria-hidden="true">' +
      '<rect x="40" y="50" width="120" height="120" rx="16" fill="#E7EBFB"></rect>' +
      '<text x="100" y="115" text-anchor="middle" font-size="14" fill="#64748B">Produit</text></svg>'
    );
  }

  function renderProductCard(product, eager) {
    var id = product.id || product._id;
    var rating = Number(product.rating) || 0;
    var hasColors = Boolean(product.hasMultipleColors && Array.isArray(product.colors) && product.colors.length);
    return (
      '<article class="product-card" data-product-id="' +
      esc(id) +
      '" data-has-colors="' +
      (hasColors ? "true" : "false") +
      '" data-api-hydrated="1">' +
      '<div class="img-wrap">' +
      imageHtml(product, eager) +
      "</div>" +
      '<div class="rating-row">' +
      "<div><span class=\"stars\">" +
      formatRating(rating) +
      '</span><span class="rating-num">' +
      rating.toFixed(1) +
      " (0)</span></div>" +
      '<div class="price">' +
      formatPrice(product.price) +
      "</div></div>" +
      '<h3 class="product-title">' +
      esc(product.name) +
      "</h3>" +
      '<button type="button" class="add-cart-btn">Ajouter au panier</button>' +
      "</article>"
    );
  }

  function starsMarkup(rating) {
    var pct = Math.max(0, Math.min(100, ((Number(rating) || 0) / 5) * 100));
    return '<span class="stars"><span class="stars-fill" style="width:' + pct + '%"></span></span>';
  }

  function renderListingCard(product, eager) {
    var id = product.id || product._id;
    var rating = Number(product.rating) || 0;
    var hasColors = Boolean(product.hasMultipleColors && Array.isArray(product.colors) && product.colors.length);
    var src = (product.pictures && product.pictures[0]) || "";
    var imageBlock = src
      ? '<img src="' +
        esc(cardImageUrl(src)) +
        '" alt=""' +
        imgLoadingAttrs(eager) +
        ' style="width:100%;height:100%;object-fit:cover;display:block;">'
      : "📦";
    return (
      '<article class="product-card" data-product-id="' +
      esc(id) +
      '" data-has-colors="' +
      (hasColors ? "true" : "false") +
      '" data-api-hydrated="1">' +
      '<div class="product-image" style="background:#E7EBFB;overflow:hidden;">' +
      imageBlock +
      "</div>" +
      '<div class="product-info">' +
      '<div class="rating-row">' +
      starsMarkup(rating) +
      '<span class="rating-text">' +
      rating.toFixed(1) +
      " (0)</span>" +
      '<button class="wishlist-btn" type="button" aria-label="Liste de souhaits">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.502 5.502 0 0 0 16.503 3c-1.76 0-3 .56-4.5 2.17C10.503 3.56 9.263 3 7.503 3A5.502 5.502 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z"/></svg>' +
      "</button></div>" +
      '<h3 class="product-title">' +
      esc(product.name) +
      "</h3>" +
      '<p class="product-price">' +
      formatPrice(product.price) +
      "</p>" +
      '<button type="button" class="add-cart-btn">Ajouter au panier</button>' +
      "</div></article>"
    );
  }

  function emptyHtml(label) {
    return (
      '<p class="products-empty" style="padding:24px 16px;color:#64748B;font-size:14px;text-align:center;width:100%;">' +
      esc(label || "Aucun produit disponible pour le moment.") +
      "</p>"
    );
  }

  function updateProductCount(count) {
    var text = count + " produit" + (count !== 1 ? "s" : "");
    var countEl = document.getElementById("productCount");
    var drawerCountEl = document.getElementById("drawerCount");
    var emptyEl = document.getElementById("emptyWilaya");
    if (countEl) countEl.textContent = text;
    if (drawerCountEl) drawerCountEl.textContent = text;
    if (emptyEl) emptyEl.classList.toggle("show", count === 0);
  }

  function hydrateContainer(container, products) {
    var filtered = filterProducts(products, container);
    container.dataset.apiHydrated = "1";
    var isListingGrid = container.id === "productGrid";

    if (!filtered.length) {
      container.innerHTML = emptyHtml();
      if (isListingGrid) updateProductCount(0);
      return;
    }

    // Above-the-fold images load eagerly with high priority (LCP);
    // everything else stays lazy.
    var eagerCount = 0;
    try {
      if (container.getBoundingClientRect().top < window.innerHeight) {
        eagerCount = isListingGrid ? 4 : 3;
      }
    } catch (e) {}

    if (isListingGrid) {
      container.innerHTML = filtered
        .map(function (product, index) {
          return renderListingCard(product, index < eagerCount);
        })
        .join("");
      updateProductCount(filtered.length);
    } else {
      container.innerHTML = filtered
        .map(function (product, index) {
          return renderProductCard(product, index < eagerCount);
        })
        .join("");
    }
  }

  function skeletonCardsHtml(container) {
    var isListingGrid = container.id === "productGrid" || container.classList.contains("product-grid");
    var count = isListingGrid ? 8 : 6;
    var card = isListingGrid
      ? '<article class="product-card ajb-skel" aria-hidden="true">' +
        '<div class="product-image"></div>' +
        '<div class="product-info">' +
        '<div class="rating-row"><span class="rating-text">0.0 (0)</span></div>' +
        '<h3 class="product-title">&nbsp;</h3>' +
        '<p class="product-price">0000 DZD</p>' +
        '<button type="button" class="add-cart-btn" disabled>&nbsp;</button>' +
        "</div></article>"
      : '<article class="product-card ajb-skel" aria-hidden="true">' +
        '<div class="img-wrap"></div>' +
        '<div class="rating-row"><div><span class="stars">★★★★★</span>' +
        '<span class="rating-num">0.0 (0)</span></div><div class="price">0000 DZD</div></div>' +
        '<h3 class="product-title">&nbsp;</h3>' +
        '<button type="button" class="add-cart-btn" disabled>&nbsp;</button>' +
        "</article>";
    var html = "";
    for (var i = 0; i < count; i++) html += card;
    return html;
  }

  function findContainers() {
    var seen = new Set();
    var list = [];
    CONTAINER_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (seen.has(el)) return;
        seen.add(el);
        list.push(el);
      });
    });
    return list;
  }

  var lastHydratedSignature = "";

  function productsSignature(products) {
    try {
      return JSON.stringify(products);
    } catch (e) {
      return String(Date.now());
    }
  }

  function hydrateAll(products) {
    cachedProducts = products;
    var containers = findContainers();
    var signature = productsSignature(products);
    var allHydrated = containers.every(function (container) {
      return container.dataset.apiHydrated === "1";
    });
    // Skip DOM churn (and image flicker) when nothing actually changed.
    if (signature === lastHydratedSignature && allHydrated) return;
    lastHydratedSignature = signature;
    containers.forEach(function (container) {
      hydrateContainer(container, products);
    });
    if (typeof window.bindProductCards === "function") {
      window.bindProductCards();
    }
    if (window.ProductCarousel && typeof window.ProductCarousel.init === "function") {
      window.ProductCarousel.init();
    }
    if (window.BooksLaptop && typeof window.BooksLaptop.init === "function") {
      window.BooksLaptop.init();
    }
    document.dispatchEvent(new CustomEvent("ajb:products-loaded", { detail: { products: products } }));
  }

  async function boot() {
    var containers = findContainers();
    if (!containers.length) return;
    if (window.__AJB_STOREFRONT_BOOTED__) return;
    window.__AJB_STOREFRONT_BOOTED__ = 1;

    // Empty containers get skeleton cards so the layout is stable from the
    // first paint. Containers that ship with static cards keep them: perf.css
    // masks their content as skeletons until hydration flips data-api-hydrated.
    containers.forEach(function (container) {
      if (container.dataset.apiHydrated === "1") return;
      if (!container.children.length) container.innerHTML = skeletonCardsHtml(container);
    });

    var api = null;
    if (window.AJBApi && typeof window.AJBApi.whenReady === "function") {
      api = await window.AJBApi.whenReady();
    } else {
      for (var attempt = 0; attempt < 80 && !window.AJBApi; attempt++) {
        await new Promise(function (resolve) {
          setTimeout(resolve, 50);
        });
      }
      api = window.AJBApi || null;
    }

    if (!api) {
      window.__AJB_STOREFRONT_BOOTED__ = 0;
      containers.forEach(function (container) {
        if (container.dataset.apiHydrated === "1") return;
        container.dataset.apiHydrated = "1";
        container.innerHTML = emptyHtml("Impossible de charger les produits.");
      });
      return;
    }

    // Instant render from the session cache (repeat visits paint with zero
    // network wait); api.get() below revalidates in the background.
    var cachedList = typeof api.getCachedData === "function" ? api.getCachedData("/product") : null;
    if (Array.isArray(cachedList) && cachedList.length) {
      hydrateAll(cachedList);
      window.__AJB_PRODUCTS__ = cachedList;
    }

    try {
      var products = await api.get("/product");
      if (!Array.isArray(products)) products = [];
      hydrateAll(products);
      window.__AJB_PRODUCTS__ = products;
    } catch (err) {
      window.__AJB_STOREFRONT_BOOTED__ = 0;
      console.warn("Products storefront load failed", err);
      containers.forEach(function (container) {
        if (container.dataset.apiHydrated === "1") return;
        container.dataset.apiHydrated = "1";
        container.innerHTML = emptyHtml("Impossible de charger les produits.");
      });
    }
  }

  window.__ajbStorefrontBoot = boot;

  document.addEventListener("ajb:api-ready", function () {
    if (window.__AJB_PRODUCTS__ && window.__AJB_PRODUCTS__.length) return;
    window.__AJB_STOREFRONT_BOOTED__ = 0;
    boot();
  });

  // Background revalidation from the API cache finished with fresh data.
  document.addEventListener("ajb:data-updated", function (event) {
    var detail = event && event.detail;
    if (!detail || detail.path !== "/product" || !Array.isArray(detail.data)) return;
    window.__AJB_PRODUCTS__ = detail.data;
    hydrateAll(detail.data);
  });

  window.rehydrateProductContainer = function (containerId) {
    if (!cachedProducts.length) return;
    var el = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (el) hydrateContainer(el, cachedProducts);
  };

  window.applyProductGridFilters = function (filters) {
    listingDrawerFilters = filters || null;
    var products = cachedProducts.length
      ? cachedProducts
      : Array.isArray(window.__AJB_PRODUCTS__)
        ? window.__AJB_PRODUCTS__
        : [];
    var grid = document.getElementById("productGrid");
    if (!grid) return;
    hydrateContainer(grid, products);
    if (typeof window.bindProductCards === "function") {
      window.bindProductCards();
    }
  };

  document.addEventListener("ajb:current-product", function () {
    if (document.getElementById("relatedTrack")) {
      window.rehydrateProductContainer("relatedTrack");
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
