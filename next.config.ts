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
    destination: "/product-detail-page-mega-bloks"
  },
  {
    source: "/product detail page mega bloks.html",
    destination: "/product-detail-page-mega-bloks"
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
    source: "/toysrus-account.html",
    destination: "/toysrus-account"
  },
  {
    source: "/toysrus-account.html",
    destination: "/toysrus-account"
  },
  {
    source: "/toysrus-bobs-painting.html",
    destination: "/toysrus-bobs-painting"
  },
  {
    source: "/toysrus-bobs-painting.html",
    destination: "/toysrus-bobs-painting"
  },
  {
    source: "/toysrus-bobs-shop.html",
    destination: "/toysrus-bobs-shop"
  },
  {
    source: "/toysrus-bobs-shop.html",
    destination: "/toysrus-bobs-shop"
  },
  {
    source: "/toysrus-bobs-world.html",
    destination: "/toysrus-bobs-world"
  },
  {
    source: "/toysrus-bobs-world.html",
    destination: "/toysrus-bobs-world"
  },
  {
    source: "/toysrus-conditions.html",
    destination: "/toysrus-conditions"
  },
  {
    source: "/toysrus-conditions.html",
    destination: "/toysrus-conditions"
  },
  {
    source: "/toysrus-contact.html",
    destination: "/toysrus-contact"
  },
  {
    source: "/toysrus-contact.html",
    destination: "/toysrus-contact"
  },
  {
    source: "/toysrus-diy-activities.html",
    destination: "/toysrus-diy-activities"
  },
  {
    source: "/toysrus-diy-activities.html",
    destination: "/toysrus-diy-activities"
  },
  {
    source: "/toysrus-diy-article.html",
    destination: "/toysrus-diy-article"
  },
  {
    source: "/toysrus-diy-article.html",
    destination: "/toysrus-diy-article"
  },
  {
    source: "/toysrus-diy-bike-hand-signals.html",
    destination: "/toysrus-diy-bike-hand-signals"
  },
  {
    source: "/toysrus-diy-bike-hand-signals.html",
    destination: "/toysrus-diy-bike-hand-signals"
  },
  {
    source: "/toysrus-diy-tag.html",
    destination: "/toysrus-diy-tag"
  },
  {
    source: "/toysrus-diy-tag.html",
    destination: "/toysrus-diy-tag"
  },
  {
    source: "/toysrus-faq%20(2).html",
    destination: "/toysrus-faq-2"
  },
  {
    source: "/toysrus-faq (2).html",
    destination: "/toysrus-faq-2"
  },
  {
    source: "/toysrus-gift-guide-article.html",
    destination: "/toysrus-gift-guide-article"
  },
  {
    source: "/toysrus-gift-guide-article.html",
    destination: "/toysrus-gift-guide-article"
  },
  {
    source: "/toysrus-gift-guide-tag.html",
    destination: "/toysrus-gift-guide-tag"
  },
  {
    source: "/toysrus-gift-guide-tag.html",
    destination: "/toysrus-gift-guide-tag"
  },
  {
    source: "/toysrus-gift-guides.html",
    destination: "/toysrus-gift-guides"
  },
  {
    source: "/toysrus-gift-guides.html",
    destination: "/toysrus-gift-guides"
  },
  {
    source: "/toysrus-livraison.html",
    destination: "/toysrus-livraison"
  },
  {
    source: "/toysrus-livraison.html",
    destination: "/toysrus-livraison"
  },
  {
    source: "/toysrus-notre-histoire.html",
    destination: "/toysrus-notre-histoire"
  },
  {
    source: "/toysrus-notre-histoire.html",
    destination: "/toysrus-notre-histoire"
  },
  {
    source: "/toysrus-printables.html",
    destination: "/toysrus-printables"
  },
  {
    source: "/toysrus-printables.html",
    destination: "/toysrus-printables"
  },
  {
    source: "/toysrus-privacy.html",
    destination: "/toysrus-privacy"
  },
  {
    source: "/toysrus-privacy.html",
    destination: "/toysrus-privacy"
  },
  {
    source: "/toysrus-retours-echanges.html",
    destination: "/toysrus-retours-gift"
  },
  {
    source: "/toysrus-retours-echanges.html",
    destination: "/toysrus-retours-gift"
  },
  {
    source: "/toysrus-retours-gift.html",
    destination: "/toysrus-retours-gift"
  },
  {
    source: "/toysrus-retours-gift.html",
    destination: "/toysrus-retours-gift"
  },
  {
    source: "/toysrus-track-order.html",
    destination: "/toysrus-account?section=kids-club"
  },
  {
    source: "/toysrus-track-order.html",
    destination: "/toysrus-account?section=kids-club"
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
    return [
      {
        source: "/toysrus-retours-echanges",
        destination: "/toysrus-retours-gift",
        permanent: true,
      },
      {
        source: "/toysrus-track-order",
        destination: "/toysrus-account?section=kids-club",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
