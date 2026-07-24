import { readFileSync } from "fs";
import path from "path";
import LegacyPage from "@/components/LegacyPage";

export const metadata = {
  title: 'Imprimerables – Toys"R"Us | AJBloks',
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), "public/printables/body.html"),
  "utf8",
);

const printablesStyles = `
@import url(https://db.onlinewebfonts.com/c/1b62cb414d23538e8a465e7f50aa7932?family=Buenos+Aires);

:root {
  --tru-blue: #0057A8;
  --blue: #004ebc;
  --blue-dark: #003894;
  --ink: #11214A;
  --tag-blue-bg: #D6EAF8;
  --tag-blue-text: #1A6FA0;
  --tag-purple-bg: #E8D5F5;
  --tag-purple-text: #7B2D8B;
  --tag-green-bg: #D5F5E3;
  --tag-green-text: #1E8449;
  --tag-red-bg: #FADBD8;
  --tag-red-text: #C0392B;
  --tag-orange-bg: #FDEBD0;
  --tag-orange-text: #CA6F1E;
  --radius-pill: 999px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Buenos Aires', sans-serif;
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.diy-content { background: #fff; }
h1, h2, h3, button { font-family: 'Buenos Aires', sans-serif; }
button { cursor: pointer; border: none; }
a { text-decoration: none; color: inherit; }

.view { display: none; }
.view.active { display: block; }

.page-hero { width: 100%; line-height: 0; overflow: hidden; }
.page-hero img { width: 100%; display: block; object-fit: cover; }

.breadcrumb {
  background: rgb(249, 249, 249);
  padding: 22px 18px;
  font-size: 18px;
  color: #1450c4;
}
.breadcrumb a { color: #1450c4; text-decoration: underline; font-weight: 500; }
.breadcrumb .sep { color: #1a1a1a; margin: 0 6px; text-decoration: none; }

.tags-section { padding: 20px 16px 20px; }
.tags-label {
  font-family: 'Buenos Aires', sans-serif;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
}
.tags-grid { display: flex; flex-wrap: wrap; gap: 10px; }

.activity-cards { padding-top: 0; padding-bottom: 40px; }
.activity-card { padding: 0 16px 20px; }
.activity-card .card-link { display: block; color: inherit; text-decoration: none; }
.activity-card .card-link:hover h3 { color: var(--tru-blue); }

.tag {
  display: inline-block;
  font-family: 'Buenos Aires', sans-serif;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 999px;
  text-decoration: none;
  transition: transform .08s;
  cursor: pointer;
  border: none;
}
.tag:active { transform: translateY(2px); box-shadow: none !important; }
.tag.blue { background: var(--tag-blue-bg); color: var(--tag-blue-text); box-shadow: 0 3px 0 var(--tag-blue-text); }
.tag.purple { background: var(--tag-purple-bg); color: var(--tag-purple-text); box-shadow: 0 3px 0 var(--tag-purple-text); }
.tag.green { background: var(--tag-green-bg); color: var(--tag-green-text); box-shadow: 0 3px 0 var(--tag-green-text); }
.tag.red { background: var(--tag-red-bg); color: var(--tag-red-text); box-shadow: 0 3px 0 var(--tag-red-text); }
.tag.orange { background: var(--tag-orange-bg); color: var(--tag-orange-text); box-shadow: 0 3px 0 var(--tag-orange-text); }

.activity-card .card-img {
  border-radius: 14px;
  overflow: hidden;
  height: 200px;
  background: #dde8d8;
  margin-bottom: 12px;
}
.activity-card .card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.activity-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
.activity-card p { font-size: 14px; color: #444; line-height: 1.5; margin-bottom: 10px; }
.activity-card .card-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 13px;
  background: #f0f4f8;
  padding: 16px;
  text-align: center;
}

.printables-empty {
  padding: 24px 16px;
  color: #64748B;
  text-align: center;
  font-size: 14px;
}

/* Detail view (mobile) */
.detail-top { background: rgb(249 249 249); }
.bc { padding: 18px 18px 6px; font-size: 14px; }
.bc a { color: #1565c0; text-decoration: underline; }
.detail-h {
  font-family: 'Buenos Aires', sans-serif;
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  padding: 14px 22px 12px;
  line-height: 1.2;
}
.detail-tag-wrap { text-align: center; padding: 0 18px 18px; }
.detail-tag-wrap .printable-tag { margin-top: 0; cursor: pointer; }
.detail-img { margin: 0 14px; border-radius: 16px; overflow: hidden; }
.detail-img svg,
.detail-img img { display: block; width: 100%; height: auto; }
.detail-body { padding: 20px 18px 8px; font-size: 17px; line-height: 1.6; }
.detail-body p { margin-bottom: 14px; }
.detail-sep { height: 1px; background: #e0e0e0; margin: 6px 18px 22px; }
.btn-dl {
  display: inline-block;
  background: var(--blue);
  color: #fff;
  font-family: 'Buenos Aires', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  padding: 14px 36px;
  border-radius: var(--radius-pill);
  margin: 0 18px 34px;
  box-shadow: 0 4px 0 var(--blue-dark);
  transition: transform .08s ease;
}
.btn-dl:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--blue-dark); }

.more-section { margin-top: 32px; padding-bottom: 8px; }
.more-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 18px 8px;
  gap: 12px;
}
.more-section-title {
  font-size: 27px;
  font-weight: 800;
  color: #111;
  line-height: 1.15;
  margin: 0;
}
.more-see-all {
  color: var(--blue);
  text-decoration: underline;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.printable-tag {
  display: inline-block;
  margin-top: 14px;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 999px;
}
.printable-tag.blue { background: var(--tag-blue-bg); color: var(--tag-blue-text); box-shadow: 0 3px 0 var(--tag-blue-text); }
.printable-tag.green { background: var(--tag-green-bg); color: var(--tag-green-text); box-shadow: 0 3px 0 var(--tag-green-text); }
.printable-tag.purple { background: var(--tag-purple-bg); color: var(--tag-purple-text); box-shadow: 0 3px 0 var(--tag-purple-text); }
.printable-tag.red { background: var(--tag-red-bg); color: var(--tag-red-text); box-shadow: 0 3px 0 var(--tag-red-text); }
.printable-tag.orange { background: var(--tag-orange-bg); color: var(--tag-orange-text); box-shadow: 0 3px 0 var(--tag-orange-text); }

.tagged-header {
  padding: 24px 16px 28px;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
}
`;

export default function Page() {
  return (
    <LegacyPage
      lang="fr"
      stylesheets={[
        "/legacy/cart-drawer.css",
        "/legacy/signup-drawer.css",
        "/legacy/site-menu.css",
        "/legacy/diy-shell.css",
        "/legacy/site-footer.css",
        "/legacy/diy-article-newsletter.css",
        "/legacy/dashboard-fab.css",
        "/legacy/responsive-shell.css",
        "/legacy/site-header.css",
        "/legacy/printables-laptop.css",
        "/legacy/pages-tablet.css",
      ]}
      inlineStyles={[printablesStyles]}
      bodyHtml={bodyHtml}
      externalScripts={[
        "/legacy/pages-tablet.js",
        "/legacy/printables-laptop.js",
        "/legacy/printables-section.js",
        "/legacy/site-menu.js",
        "/legacy/dashboard-fab.js",
        "/legacy/site-footer.js",
        "/legacy/cart-drawer.js",
        "/legacy/site-header.js",
        "/legacy/diy-shell.js",
        "/legacy/signup-drawer.js",
        "/legacy/auth-links.js",
      ]}
      inlineScripts={[]}
    />
  );
}
