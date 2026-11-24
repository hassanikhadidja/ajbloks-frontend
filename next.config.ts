import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    proxyClientMaxBodySize: "20mb",
  },
  async headers() {
    return [
      {
        // Legacy CSS/JS assets: cached briefly by browsers, served stale by
        // the CDN while revalidating, so deploys still propagate quickly.
        source: "/legacy/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/catalogues/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
  {
    source: "/home-page.html",
    destination: "/"
  },
  {
    source: "/all%20selection%20page.html",
    destination: "/all-selection-page"
  },
  {
    source: "/all selection page.html",
    destination: "/all-selection-page"
  },
  {
    source: "/book%20category%20page.html",
    destination: "/book-category-page"
  },
  {
    source: "/book category page.html",
    destination: "/book-category-page"
  },
  {
    source: "/books%20page.html",
    destination: "/books-page"
  },
  {
    source: "/books page.html",
    destination: "/books-page"
  },
  {
    source: "/cartoon%20and%20friends.html",
    destination: "/cartoon-and-friends"
  },
  {
    source: "/cartoon and friends.html",
    destination: "/cartoon-and-friends"
  },
  {
    source: "/checkout-page.html",
    destination: "/checkout-page"
  },
  {
    source: "/checkout-page.html",
    destination: "/checkout-page"
  },
  {
    source: "/dashboard.html",
    destination: "/dashboard"
  },
  {
    source: "/dashboard.html",
    destination: "/dashboard"
  },
  {
    source: "/done/find%20us.html",
    destination: "/done/find-us"
  },
  {
    source: "/done/find us.html",
    destination: "/done/find-us"
  },
  {
    source: "/done/wishlist.html",
    destination: "/done/wishlist"
  },
  {
    source: "/done/wishlist.html",
    destination: "/done/wishlist"
  },
  {
    source: "/gros%20main.html",
    destination: "/gros-main"
  },
  {
    source: "/gros main.html",
    destination: "/gros-main"
  },
  {
    source: "/new%20and%20trending.html",
    destination: "/new-and-trending"
  },
  {
    source: "/new and trending.html",
    destination: "/new-and-trending"
  },
  {
    source: "/outdoor%20play.html",
    destination: "/outdoor-play"
  },
  {
    source: "/outdoor play.html",
    destination: "/outdoor-play"
  },
  {
    source: "/product%20detail%20page%20mega%20bloks.html",
    destination: "/product-detail-page-ajbloks"
  },
  {
    source: "/product detail page mega bloks.html",
    destination: "/product-detail-page-ajbloks"
  },
  {
    source: "/shop%20all%20categories%20page.html",
    destination: "/shop-all-categories-page"
  },
  {
    source: "/shop all categories page.html",
    destination: "/shop-all-categories-page"
  },
  {
    source: "/shop%20by%20age%20products%20page.html",
    destination: "/shop-by-age-products-page"
  },
  {
    source: "/shop by age products page.html",
    destination: "/shop-by-age-products-page"
  },
  {
    source: "/signin.html",
    destination: "/signin"
  },
  {
    source: "/signin.html",
    destination: "/signin"
  },
  {
    source: "/signup-email%20form.html",
    destination: "/signup-email-form"
  },
  {
    source: "/signup-email form.html",
    destination: "/signup-email-form"
  },
  {
    source: "/spider-man.html",
    destination: "/spider-man"
  },
  {
    source: "/spider-man.html",
    destination: "/spider-man"
  },
  {
    source: "/tiktok%20like%20video.html",
    destination: "/tiktok-like-video"
  },
  {
    source: "/tiktok like video.html",
    destination: "/tiktok-like-video"
  },
  {
    source: "/ajbloks-account.html",
    destination: "/ajbloks-account"
  },
  {
    source: "/ajbloks-account.html",
    destination: "/ajbloks-account"
  },
  {
    source: "/ajbloks-bobs-painting.html",
    destination: "/ajbloks-bobs-painting"
  },
  {
    source: "/ajbloks-bobs-painting.html",
    destination: "/ajbloks-bobs-painting"
  },
  {
    source: "/ajbloks-bobs-shop.html",
    destination: "/ajbloks-bobs-shop"
  },
  {
    source: "/ajbloks-bobs-shop.html",
    destination: "/ajbloks-bobs-shop"
  },
  {
    source: "/ajbloks-bobs-world.html",
    destination: "/ajbloks-bobs-world"
  },
  {
    source: "/ajbloks-bobs-world.html",
    destination: "/ajbloks-bobs-world"
  },
  {
    source: "/ajbloks-conditions.html",
    destination: "/ajbloks-conditions"
  },
  {
    source: "/ajbloks-conditions.html",
    destination: "/ajbloks-conditions"
  },
  {
    source: "/ajbloks-contact.html",
    destination: "/ajbloks-contact"
  },
  {
    source: "/ajbloks-contact.html",
    destination: "/ajbloks-contact"
  },
  {
    source: "/ajbloks-diy-activities.html",
    destination: "/ajbloks-diy-activities"
  },
  {
    source: "/ajbloks-diy-activities.html",
    destination: "/ajbloks-diy-activities"
  },
  {
    source: "/ajbloks-diy-article.html",
    destination: "/ajbloks-diy-article"
  },
  {
    source: "/ajbloks-diy-article.html",
    destination: "/ajbloks-diy-article"
  },
  {
    source: "/ajbloks-diy-bike-hand-signals.html",
    destination: "/ajbloks-diy-bike-hand-signals"
  },
  {
    source: "/ajbloks-diy-bike-hand-signals.html",
    destination: "/ajbloks-diy-bike-hand-signals"
  },
  {
    source: "/ajbloks-diy-tag.html",
    destination: "/ajbloks-diy-tag"
  },
  {
    source: "/ajbloks-diy-tag.html",
    destination: "/ajbloks-diy-tag"
  },
  {
    source: "/ajbloks-faq%20(2).html",
    destination: "/ajbloks-faq-2"
  },
  {
    source: "/ajbloks-faq (2).html",
    destination: "/ajbloks-faq-2"
  },
  {
    source: "/ajbloks-gift-guide-article.html",
    destination: "/ajbloks-gift-guide-article"
  },
  {
    source: "/ajbloks-gift-guide-article.html",
    destination: "/ajbloks-gift-guide-article"
  },
  {
    source: "/ajbloks-gift-guide-tag.html",
    destination: "/ajbloks-gift-guide-tag"
  },
  {
    source: "/ajbloks-gift-guide-tag.html",
    destination: "/ajbloks-gift-guide-tag"
  },
  {
    source: "/ajbloks-gift-guides.html",
    destination: "/ajbloks-gift-guides"
  },
  {
    source: "/ajbloks-gift-guides.html",
    destination: "/ajbloks-gift-guides"
  },
  {
    source: "/ajbloks-livraison.html",
    destination: "/ajbloks-livraison"
  },
  {
    source: "/ajbloks-livraison.html",
    destination: "/ajbloks-livraison"
  },
  {
    source: "/ajbloks-notre-histoire.html",
    destination: "/ajbloks-notre-histoire"
  },
  {
    source: "/ajbloks-notre-histoire.html",
    destination: "/ajbloks-notre-histoire"
  },
  {
    source: "/ajbloks-printables.html",
    destination: "/ajbloks-printables"
  },
  {
    source: "/ajbloks-printables.html",
    destination: "/ajbloks-printables"
  },
  {
    source: "/ajbloks-privacy.html",
    destination: "/ajbloks-privacy"
  },
  {
    source: "/ajbloks-privacy.html",
    destination: "/ajbloks-privacy"
  },
  {
    source: "/ajbloks-retours-echanges.html",
    destination: "/ajbloks-retours-gift"
  },
  {
    source: "/ajbloks-retours-echanges.html",
    destination: "/ajbloks-retours-gift"
  },
  {
    source: "/ajbloks-retours-gift.html",
    destination: "/ajbloks-retours-gift"
  },
  {
    source: "/ajbloks-retours-gift.html",
    destination: "/ajbloks-retours-gift"
  },
  {
    source: "/ajbloks-track-order.html",
    destination: "/ajbloks-account?section=kids-club"
  },
  {
    source: "/ajbloks-track-order.html",
    destination: "/ajbloks-account?section=kids-club"
  },
  {
    source: "/cartoon%20et%20friends.html",
    destination: "/cartoon-and-friends"
  },
  {
    source: "/cartoon et friends.html",
    destination: "/cartoon-and-friends"
  },
  {
    source: "/new%20et%20trending.html",
    destination: "/new-and-trending"
  },
  {
    source: "/new et trending.html",
    destination: "/new-and-trending"
  }
];
  },
  async redirects() {
    const legacySlugs = [
      "account",
      "bobs-painting",
      "bobs-shop",
      "bobs-world",
      "conditions",
      "contact",
      "diy-activities",
      "diy-article",
      "diy-bike-hand-signals",
      "diy-tag",
      "faq-2",
      "gift-guide-article",
      "gift-guide-tag",
      "gift-guides",
      "livraison",
      "notre-histoire",
      "printables",
      "privacy",
      "retours-gift",
    ];

    return [
      {
        source: "/ajbloks-retours-echanges",
        destination: "/ajbloks-retours-gift",
        permanent: true,
      },
      {
        source: "/ajbloks-track-order",
        destination: "/ajbloks-account?section=kids-club",
        permanent: true,
      },
      {
        source: "/toysrus-retours-echanges",
        destination: "/ajbloks-retours-gift",
        permanent: true,
      },
      {
        source: "/toysrus-track-order",
        destination: "/ajbloks-account?section=kids-club",
        permanent: true,
      },
      {
        source: "/product-detail-page-mega-bloks",
        destination: "/product-detail-page-ajbloks",
        permanent: true,
      },
      ...legacySlugs.map((slug) => ({
        source: `/toysrus-${slug}`,
        destination: `/ajbloks-${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
