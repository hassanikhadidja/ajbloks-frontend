"use client";

import { useEffect, useMemo } from "react";
import type { DashboardProduct } from "@/lib/product-mapper";
import { cloudinaryLcpUrl, extractLcpImageUrls } from "@/lib/loading-utils";

type LegacyPageProps = {
  lang?: string;
  stylesheets: string[];
  inlineStyles: string[];
  bodyHtml: string;
  externalScripts: string[];
  inlineScripts: string[];
  initialProduct?: DashboardProduct | null;
  productId?: string | null;
};

function hashLegacyScript(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = (Math.imul(31, hash) + code.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function wrapLegacyInlineScript(code: string): string {
  const key = `__legacyScript_${hashLegacyScript(code)}`;
  return `if(!window.${key}){window.${key}=1;try{${code}}catch(e){console.error('Legacy inline script error',e)}}`;
}

function orderLegacyScripts(scripts: string[], bodyHtml: string) {
  const isDiyShellPage = bodyHtml.includes("diy-content");
  const priority = [
    "api-client.js",
    "auth-session.js",
    "auth-links.js",
    "product-card-links.js",
    "products-storefront.js",
    "promo-bar.js",
    ...(isDiyShellPage
      ? ["site-header.js", "diy-shell.js", "site-menu.js"]
      : ["site-header.js", "site-menu.js", "diy-shell.js"]),
  ];
  return [...scripts].sort((a, b) => {
    const rank = (src: string) => {
      const index = priority.findIndex((name) => src.endsWith(name));
      return index === -1 ? priority.length : index;
    };
    return rank(a) - rank(b);
  });
}

function ensureSiteHeaderAssets(
  stylesheets: string[],
  externalScripts: string[],
  bodyHtml: string,
) {
  const needsHeader =
    bodyHtml.includes("app-shell") ||
    bodyHtml.includes("diy-content") ||
    bodyHtml.includes('id="mainNav"');

  // Perf assets are global: perf.css first so skeleton masking applies from
  // the very first paint; perf.js last so it never delays feature scripts.
  const nextStyles = stylesheets.some((href) => href.includes("perf.css"))
    ? [...stylesheets]
    : ["/legacy/perf.css?v=load-exp-1", ...stylesheets];
  const nextScripts = [...externalScripts];
  if (!nextScripts.some((src) => src.includes("perf.js"))) {
    nextScripts.push("/legacy/perf.js");
  }

  if (needsHeader) {
    if (!nextStyles.some((href) => href.endsWith("site-header.css"))) {
      nextStyles.push("/legacy/site-header.css");
    }
    if (!nextScripts.some((src) => src.endsWith("api-client.js"))) {
      nextScripts.push("/legacy/api-client.js");
    }
    if (!nextScripts.some((src) => src.endsWith("newsletter-subscribe.js"))) {
      nextScripts.push("/legacy/newsletter-subscribe.js");
    }
    if (!nextScripts.some((src) => src.endsWith("auth-session.js"))) {
      nextScripts.push("/legacy/auth-session.js");
    }
    if (!nextScripts.some((src) => src.endsWith("auth-links.js"))) {
      nextScripts.push("/legacy/auth-links.js");
    }
    if (!nextScripts.some((src) => src.endsWith("promo-bar.js"))) {
      nextScripts.push("/legacy/promo-bar.js");
    }
    if (!nextScripts.some((src) => src.endsWith("site-header.js"))) {
      nextScripts.push("/legacy/site-header.js");
    }
    if (
      !nextScripts.some((src) => src.endsWith("site-menu.js")) &&
      (bodyHtml.includes("menuOpenBtn") || bodyHtml.includes('id="mainNav"'))
    ) {
      nextScripts.push("/legacy/site-menu.js");
      if (!nextStyles.some((href) => href.endsWith("site-menu.css"))) {
        nextStyles.push("/legacy/site-menu.css");
      }
    }
  }

  return ensureProductStorefront(nextStyles, orderLegacyScripts(nextScripts, bodyHtml), bodyHtml);
}

function ensureProductStorefront(
  stylesheets: string[],
  externalScripts: string[],
  bodyHtml: string,
) {
  const needsProducts =
    bodyHtml.includes("product-card") ||
    bodyHtml.includes('id="productGrid"') ||
    bodyHtml.includes("age-section") ||
    bodyHtml.includes('id="productTrack"') ||
    bodyHtml.includes('id="bookTrack"') ||
    bodyHtml.includes('id="featuredTrack"') ||
    bodyHtml.includes('id="relatedTrack"') ||
    bodyHtml.includes("wishlist-btn") ||
    bodyHtml.includes("heart-btn") ||
    bodyHtml.includes('id="heartBtn"') ||
    bodyHtml.includes("wishListBody") ||
    bodyHtml.includes("wishProducts");

  if (!needsProducts) {
    return { stylesheets, externalScripts };
  }

  const nextStyles = [...stylesheets];
  if (!nextStyles.some((href) => href.endsWith("product-card-mobile.css"))) {
    nextStyles.push("/legacy/product-card-mobile.css");
  }

  const nextScripts = [...externalScripts];
  if (!nextScripts.some((src) => src.endsWith("api-client.js"))) {
    nextScripts.unshift("/legacy/api-client.js");
  }
  if (
    !nextScripts.some((src) => src.endsWith("products-storefront.js")) &&
    (bodyHtml.includes("product-card") ||
      bodyHtml.includes('id="productGrid"') ||
      bodyHtml.includes("age-section") ||
      bodyHtml.includes('id="productTrack"') ||
      bodyHtml.includes('id="bookTrack"') ||
      bodyHtml.includes('id="featuredTrack"') ||
      bodyHtml.includes('id="relatedTrack"'))
  ) {
    nextScripts.push("/legacy/products-storefront.js");
  }
  if (!nextScripts.some((src) => src.endsWith("wishlist.js"))) {
    nextScripts.push("/legacy/wishlist.js");
  }

  return {
    stylesheets: nextStyles,
    externalScripts: orderLegacyScripts(nextScripts, bodyHtml),
  };
}

function normalizeLegacyScriptSrc(src: string): string {
  // Bust Chrome's cached footer script so LinkedIn updates reliably.
  if (src.includes("/legacy/site-footer.js")) {
    return "/legacy/site-footer.js?v=li-pinterest-youtube";
  }
  if (src.includes("/legacy/perf.js")) {
    return "/legacy/perf.js?v=load-exp-1";
  }
  if (src.includes("/legacy/product-card-links.js")) {
    return "/legacy/product-card-links.js?v=load-exp-1";
  }
  return src;
}

function loadLegacyScript(src: string): Promise<void> {
  const resolved = normalizeLegacyScriptSrc(src);
  // Drop stale footer script tags from older sessions.
  if (resolved.includes("site-footer.js")) {
    document
      .querySelectorAll("script[data-legacy-src*='site-footer.js']")
      .forEach((node) => {
        const el = node as HTMLScriptElement;
        if (el.dataset.legacySrc !== resolved) el.remove();
      });
  }

  const existing = document.querySelector(
    `script[data-legacy-src="${CSS.escape(resolved)}"]`,
  ) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "1") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${resolved}`)),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = resolved;
    script.async = false;
    script.dataset.legacySrc = resolved;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${resolved}`));
    document.body.appendChild(script);
  });
}

function setLegacyBootstrap(
  productId: string | null | undefined,
  initialProduct: DashboardProduct | null | undefined,
) {
  const win = window as unknown as Record<string, unknown>;
  if (productId) win.__AJB_PDP_PRODUCT_ID__ = productId;
  else delete win.__AJB_PDP_PRODUCT_ID__;
  if (initialProduct) win.__AJB_INITIAL_PRODUCT__ = initialProduct;
  else delete win.__AJB_INITIAL_PRODUCT__;
  delete win.__AJB_INITIAL_PRODUCT_USED__;
}

export default function LegacyPage({
  lang = "fr",
  stylesheets,
  inlineStyles,
  bodyHtml,
  externalScripts,
  inlineScripts,
  initialProduct = null,
  productId = null,
}: LegacyPageProps) {
  const assets = useMemo(
    () => ensureSiteHeaderAssets(stylesheets, externalScripts, bodyHtml),
    [stylesheets, externalScripts, bodyHtml],
  );

  const lcpImages = useMemo(() => {
    const fromHtml = extractLcpImageUrls(bodyHtml, 3);
    const fromProduct = initialProduct?.pictures?.[0]
      ? [cloudinaryLcpUrl(initialProduct.pictures[0], 900)]
      : [];
    const merged: string[] = [];
    [...fromProduct, ...fromHtml].forEach((url) => {
      if (url && !merged.includes(url)) merged.push(url);
    });
    return merged.slice(0, 3);
  }, [bodyHtml, initialProduct]);

  const bootstrapScript = useMemo(() => {
    const lines = ["delete window.__AJB_INITIAL_PRODUCT_USED__;"];
    if (productId) {
      lines.push(
        "window.__AJB_PDP_PRODUCT_ID__=" +
          JSON.stringify(productId).replace(/</g, "\\u003c") +
          ";",
      );
    } else {
      lines.push("delete window.__AJB_PDP_PRODUCT_ID__;");
    }
    if (initialProduct) {
      lines.push(
        "window.__AJB_INITIAL_PRODUCT__=" +
          JSON.stringify(initialProduct).replace(/</g, "\\u003c") +
          ";",
      );
    } else {
      lines.push("delete window.__AJB_INITIAL_PRODUCT__;");
    }
    return lines.join("");
  }, [productId, initialProduct]);

  useEffect(() => {
    document.documentElement.lang = lang;
    setLegacyBootstrap(productId, initialProduct);

    let cancelled = false;
    const executed: HTMLScriptElement[] = [];
    const guardKeys: string[] = [];

    (async () => {
      try {
        // Insert every script tag at once (async=false preserves execution
        // order) and wait for all downloads in parallel instead of
        // waterfalling one network round trip per script.
        await Promise.all(assets.externalScripts.map((src) => loadLegacyScript(src)));
        if (cancelled) return;

        inlineScripts.forEach((code) => {
          const key = `__legacyScript_${hashLegacyScript(code)}`;
          guardKeys.push(key);
          try {
            const script = document.createElement("script");
            script.textContent = wrapLegacyInlineScript(code);
            document.body.appendChild(script);
            executed.push(script);
          } catch (error) {
            console.error("Legacy inline script failed", error);
          }
        });

        const legacyWindow = window as unknown as {
          CartDrawer?: { bind?: () => void };
          refreshGrossisteCatalogue?: () => void;
        };
        if (legacyWindow.CartDrawer && typeof legacyWindow.CartDrawer.bind === "function") {
          legacyWindow.CartDrawer.bind();
        }

        if (typeof legacyWindow.refreshGrossisteCatalogue === "function") {
          legacyWindow.refreshGrossisteCatalogue();
        }

        document.dispatchEvent(new CustomEvent("ajb:legacy-page-ready"));

        const siteFooter = (
          window as unknown as {
            SiteFooter?: { mount?: (force?: boolean) => void; ensureLinkedIn?: () => void };
          }
        ).SiteFooter;
        if (siteFooter) {
          if (typeof siteFooter.mount === "function") siteFooter.mount(true);
          else if (typeof siteFooter.ensureLinkedIn === "function") siteFooter.ensureLinkedIn();
        } else {
          // Fallback when a cached footer script never exposed helpers.
          document.querySelectorAll(".social-row").forEach((row) => {
            const labels = Array.from(row.querySelectorAll("a[aria-label]"));
            const byLabel: Record<string, Element> = {};
            labels.forEach((a) => {
              const label = a.getAttribute("aria-label");
              if (label) byLabel[label] = a;
            });
            if (!byLabel.LinkedIn) {
              row.insertAdjacentHTML(
                "beforeend",
                '<a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.23 0z"/></svg></a>',
              );
              byLabel.LinkedIn = row.querySelector('[aria-label="LinkedIn"]')!;
            }
            ["TikTok", "Instagram", "Facebook", "Pinterest", "LinkedIn", "YouTube"].forEach(
              (label) => {
                if (byLabel[label]) row.appendChild(byLabel[label]);
              },
            );
          });
        }

        const pdpReview = (
          window as unknown as { PdpReviewForm?: { init?: () => void; reload?: () => void } }
        ).PdpReviewForm;
        if (pdpReview && typeof pdpReview.init === "function") {
          pdpReview.init();
        }

        const pdpRetry = window.setInterval(() => {
          const boot = (
            window as unknown as { bootProductDetailFromUrl?: () => void }
          ).bootProductDetailFromUrl;
          if (typeof boot === "function") {
            boot();
            window.clearInterval(pdpRetry);
            if (pdpReview && typeof pdpReview.reload === "function") {
              window.setTimeout(() => pdpReview.reload?.(), 100);
            }
          }
        }, 50);
        window.setTimeout(() => window.clearInterval(pdpRetry), 5000);
      } catch (error) {
        console.error("Legacy script load failed", error);
      }
    })();

    return () => {
      cancelled = true;
      executed.forEach((script) => script.remove());
      guardKeys.forEach((key) => {
        delete (window as unknown as Record<string, unknown>)[key];
      });
    };
  }, [
    lang,
    inlineScripts,
    assets.externalScripts,
    productId,
    initialProduct,
  ]);

  return (
    <>
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <link rel="preconnect" href="https://db.onlinewebfonts.com" />
      <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
      {lcpImages.map((href, index) => (
        <link
          key={href}
          rel="preload"
          as="image"
          href={href}
          // First LCP candidate gets highest priority.
          {...(index === 0 ? { fetchPriority: "high" as const } : {})}
        />
      ))}
      {/* Sync bootstrap before paint so PDP can hydrate without demo flash. */}
      <script dangerouslySetInnerHTML={{ __html: bootstrapScript }} />
      {inlineStyles.map((css, index) => (
        <style key={index} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      {assets.stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: bodyHtml }} />
    </>
  );
}
