"use client";

import { useEffect, useMemo } from "react";
import type { DashboardProduct } from "@/lib/product-mapper";

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
  return `if(!window.${key}){window.${key}=1;${code}}`;
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
  const nextStyles = stylesheets.some((href) => href.endsWith("perf.css"))
    ? [...stylesheets]
    : ["/legacy/perf.css", ...stylesheets];
  const nextScripts = [...externalScripts];
  if (!nextScripts.some((src) => src.endsWith("perf.js"))) {
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

function loadLegacyScript(src: string): Promise<void> {
  const existing = document.querySelector(
    `script[data-legacy-src="${CSS.escape(src)}"]`,
  ) as HTMLScriptElement | null;
  if (existing) {
    if (existing.dataset.loaded === "1") return Promise.resolve();
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error(`Failed to load ${src}`)),
        { once: true },
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.legacySrc = src;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
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
          const script = document.createElement("script");
          script.textContent = wrapLegacyInlineScript(code);
          document.body.appendChild(script);
          executed.push(script);
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
      <link rel="preconnect" href="https://db.onlinewebfonts.com" />
      <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
      {initialProduct?.pictures?.[0] ? (
        <link
          rel="preload"
          as="image"
          href={initialProduct.pictures[0]}
          fetchPriority="high"
        />
      ) : null}
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
