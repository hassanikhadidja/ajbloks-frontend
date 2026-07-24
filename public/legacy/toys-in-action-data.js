(function () {
  function waitForApi() {
    if (window.AJBApi && typeof window.AJBApi.whenReady === "function") {
      return window.AJBApi.whenReady();
    }
    return new Promise(function (resolve) {
      var attempts = 0;
      var timer = setInterval(function () {
        attempts++;
        if (window.AJBApi || attempts >= 100) {
          clearInterval(timer);
          resolve(window.AJBApi || null);
        }
      }, 50);
    });
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function productId(product) {
    return String(product.id || product._id || "");
  }

  function productImage(product) {
    var pictures = product.pictures || product.img || [];
    return Array.isArray(pictures) ? pictures[0] || "" : "";
  }

  function productImages(product) {
    var pictures = product.pictures || product.img || [];
    return Array.isArray(pictures) ? pictures.filter(Boolean) : [];
  }

  function findProduct(name, products) {
    var needle = normalize(name);
    if (!needle) return null;
    return (
      products.find(function (product) {
        return normalize(product.name) === needle;
      }) ||
      products.find(function (product) {
        var candidate = normalize(product.name);
        return candidate.indexOf(needle) !== -1 || needle.indexOf(candidate) !== -1;
      }) ||
      null
    );
  }

  function mapProduct(name, products) {
    var product = findProduct(name, products);
    if (!product) {
      return {
        name: String(name || "Produit"),
        price: "",
        image: "",
        href: "/all-selection-page",
      };
    }

    var id = productId(product);
    return {
      id: id,
      name: product.name || name,
      price: Number(product.price).toLocaleString("fr-DZ") + " DZD",
      image: productImage(product),
      images: productImages(product),
      category: product.category || "Produit",
      description: product.description || "",
      inStock: Number(product.stock) > 0,
      href: "/product-detail-page-mega-bloks?id=" + encodeURIComponent(id),
    };
  }

  async function load() {
    var api = await waitForApi();
    if (!api) throw new Error("API unavailable");

    var results = await Promise.all([api.get("/play"), api.get("/product")]);
    var grouped = results[0] || {};
    var products = Array.isArray(results[1]) ? results[1] : [];
    var items = Array.isArray(grouped.toys) ? grouped.toys : [];

    return items
      .filter(function (item) {
        return typeof item.videoUrl === "string" && item.videoUrl.trim();
      })
      .map(function (item) {
        var names = Array.isArray(item.toyNames) ? item.toyNames : [];
        return {
          id: String(item.id || item._id || ""),
          videoUrl: item.videoUrl.trim(),
          products: names.map(function (name) {
            return mapProduct(name, products);
          }),
        };
      });
  }

  window.__AJB_TOYS_ACTION_PROMISE__ = load();
})();
