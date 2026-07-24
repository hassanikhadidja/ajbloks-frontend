/** Shared helpers for LCP preload + PDP first-paint seeding. */

export function cloudinaryLcpUrl(url: string, width = 1600): string {
  const src = String(url || "").trim();
  if (!src || !src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }
  if (/\/image\/upload\/[^/]*f_auto/.test(src)) return src;
  return src.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_auto:good,w_${width},c_limit/`,
  );
}

/** Pull likely LCP image URLs from legacy body HTML / inline styles. */
export function extractLcpImageUrls(html: string, limit = 3): string[] {
  const found: string[] = [];
  const push = (raw: string | undefined) => {
    if (!raw) return;
    const url = raw.replace(/&amp;/g, "&").trim();
    if (!/^https?:\/\//i.test(url)) return;
    if (found.includes(url)) return;
    found.push(url);
  };

  // CSS background heroes (home)
  for (const m of html.matchAll(
    /background-image\s*:\s*url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/gi,
  )) {
    push(m[1]);
    if (found.length >= limit) return found.map((u) => cloudinaryLcpUrl(u));
  }

  // Explicit hero / cover / banner images
  for (const m of html.matchAll(
    /<(?:img|source)[^>]+(?:src|srcset)=["'](https?:\/\/[^"']+)["'][^>]*>/gi,
  )) {
    const tag = m[0];
    if (
      /hero|banner|cover|bobs-hero|story-hero|promo-card|locator/i.test(tag) ||
      /hero|banner|cover/i.test(html.slice(Math.max(0, m.index! - 120), m.index!))
    ) {
      const srcset = tag.match(/srcset=["']([^"']+)["']/i);
      if (srcset) {
        const first = srcset[1].split(",")[0]?.trim().split(/\s+/)[0];
        push(first);
      }
      const src = tag.match(/\ssrc=["'](https?:\/\/[^"']+)["']/i);
      push(src?.[1]);
    }
    if (found.length >= limit) break;
  }

  return found.map((u) => cloudinaryLcpUrl(u));
}

function escHtml(text: string): string {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatPriceDzd(price: unknown): string {
  const n = Number(price);
  if (!Number.isFinite(n)) return "—";
  try {
    return (
      new Intl.NumberFormat("fr-DZ", {
        style: "decimal",
        maximumFractionDigits: 0,
      }).format(Math.round(n)) + " DZD"
    );
  } catch {
    return Math.round(n) + " DZD";
  }
}

type SeedProduct = {
  name?: string;
  price?: number | string;
  pictures?: string[];
  img?: string[];
};

/** Seed PDP shell with real SSR product data, or force skeleton awaiting state. */
export function seedPdpBodyHtml(bodyHtml: string, product: SeedProduct | null): string {
  let html = bodyHtml;

  // Always start awaiting so demo MEGA BLOKS content never paints.
  html = html.replace(
    /class="pdp-layout(\s+pdp-awaiting-api)?(\s+pdp-loaded)?"/,
    'class="pdp-layout pdp-awaiting-api"',
  );

  // Neutralize demo title/price before paint (even while awaiting).
  html = html.replace(
    /(<h1[^>]*id="productTitle"[^>]*>)([\s\S]*?)(<\/h1>)/i,
    "$1$3",
  );
  html = html.replace(
    /(<p[^>]*id="productPrice"[^>]*>)([\s\S]*?)(<\/p>)/i,
    "$1$3",
  );

  // Empty demo SVG slides — keep aspect-ratio box for CLS.
  html = html.replace(
    /(<div class="slides" id="slides">)[\s\S]*?(<\/div>\s*<\/div>\s*<button class="heart-btn)/i,
    '$1<div class="slide pdp-skel-slide" aria-hidden="true"></div>$2',
  );

  if (!product?.name) return html;

  const pictures =
    (product.pictures && product.pictures.length && product.pictures) ||
    (product.img && product.img.length && product.img) ||
    [];
  const firstPic = pictures[0] ? cloudinaryLcpUrl(pictures[0], 900) : "";
  const title = escHtml(String(product.name || "").trim());
  const price = escHtml(formatPriceDzd(product.price));

  html = html.replace(
    /(<h1[^>]*id="productTitle"[^>]*>)([\s\S]*?)(<\/h1>)/i,
    `$1${title}$3`,
  );
  html = html.replace(
    /(<p[^>]*id="productPrice"[^>]*>)([\s\S]*?)(<\/p>)/i,
    `$1${price}$3`,
  );

  if (firstPic) {
    const slide = `<div class="slide"><img class="ajb-img ajb-in" src="${escHtml(firstPic)}" alt="${title}" fetchpriority="high" decoding="async" loading="eager" style="width:100%;height:100%;object-fit:contain;background:#fff;"></div>`;
    html = html.replace(
      /(<div class="slides" id="slides">)[\s\S]*?(<\/div>\s*<\/div>\s*<button class="heart-btn)/i,
      `$1${slide}$2`,
    );
  }

  // SSR-ready: show title/price/hero image immediately, keep demo accordions
  // hidden until client hydrate marks pdp-loaded.
  html = html.replace(
    'class="pdp-layout pdp-awaiting-api"',
    'class="pdp-layout pdp-awaiting-api pdp-ssr-ready"',
  );

  return html;
}
