import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "kids website html");
const PUBLIC_LEGACY = path.join(ROOT, "public", "legacy");
const APP_DIR = path.join(ROOT, "app");

const EXCLUDE_HTML = new Set([
  "_home-git-utf8.html",
  "site-menu-markup.html",
  "cart-drawer.html",
  "toys card.html",
  "product-overview.html",
  "toysrus_clone.html",
  "done/footer.html",
  "done/shop by age products page.html",
]);

const ALIAS_HTML = {
  "cartoon et friends.html": "cartoon and friends.html",
  "new et trending.html": "new and trending.html",
};

function slugify(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized === "home-page.html") return "/";
  const withoutExt = normalized.replace(/\.html$/i, "");
  return (
    "/" +
    withoutExt
      .split("/")
      .map((segment) =>
        segment
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[()]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      )
      .join("/")
  );
}

function collectHtmlFiles(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectHtmlFiles(full, rel.replace(/\\/g, "/")));
    } else if (entry.name.endsWith(".html")) {
      files.push(rel.replace(/\\/g, "/"));
    }
  }
  return files;
}

function readText(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.toString("utf16le");
  return buf.toString("utf8");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyAssets() {
  ensureDir(PUBLIC_LEGACY);
  const exts = [".css", ".js"];
  const files = fs.readdirSync(SOURCE);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!exts.includes(ext)) continue;
    fs.copyFileSync(path.join(SOURCE, file), path.join(PUBLIC_LEGACY, file));
  }
}

function htmlPathToRoute(htmlPath) {
  const canonical = ALIAS_HTML[htmlPath] || htmlPath;
  return slugify(canonical);
}

function buildRouteMap(htmlFiles) {
  const map = new Map();
  for (const file of htmlFiles) {
    if (EXCLUDE_HTML.has(file)) continue;
    map.set(file, htmlPathToRoute(file));
  }
  for (const [alias, target] of Object.entries(ALIAS_HTML)) {
    if (map.has(target)) map.set(alias, map.get(target));
  }
  return map;
}

function rewriteHtmlLinks(content, routeMap, depth) {
  let out = content;
  const assetPrefix = depth > 0 ? "/legacy/" : "/legacy/";

  out = out.replace(
    /(<link[^>]+href=["'])(?!https?:\/\/|\/|#|data:)([^"']+)(["'])/gi,
    (match, pre, href, post) => {
      if (href.startsWith("http")) return match;
      const file = href.split("?")[0].split("#")[0];
      if (file.endsWith(".css")) {
        return `${pre}${assetPrefix}${path.basename(file)}${post}`;
      }
      return match;
    }
  );

  const sorted = [...routeMap.entries()].sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [htmlFile, route] of sorted) {
    const base = htmlFile.replace(/\.html$/i, "");
    const patterns = [
      htmlFile,
      htmlFile.replace(/ /g, "%20"),
      base,
    ];
    for (const pattern of patterns) {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(
        `(href=["'])(?:\\.\\./)*(?:done/)?${escaped}(\\.html)?(\\?[^"']*)?(#[^"']*)?(["'])`,
        "gi"
      );
      out = out.replace(re, (_, pre, _ext, query = "", hash = "", post) => {
        const q = query || "";
        const h = hash || "";
        return `${pre}${route}${q}${h}${post}`;
      });
    }
  }

  out = out.replace(
    /window\.location\.(href|replace)\s*=\s*['"]([^'"]+\.html[^'"]*)['"]/gi,
    (match, method, target) => {
      const [filePart, rest] = target.split(/(?=[?#])/);
      const fileName = path.basename(filePart.replace(/^\.\.\//, ""));
      const route = routeMap.get(fileName);
      if (!route) return match;
      return `window.location.${method} = '${route}${rest || ""}'`;
    }
  );

  return out;
}

function patchJsFiles(routeMap) {
  const jsDir = PUBLIC_LEGACY;
  const files = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    let content = fs.readFileSync(path.join(jsDir, file), "utf8");
    for (const [htmlFile, route] of routeMap.entries()) {
      const escaped = htmlFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      content = content.replace(
        new RegExp(escaped, "g"),
        route === "/" ? "/" : route
      );
      const doneEscaped = escaped.replace(/^done\//, "");
      content = content.replace(
        new RegExp(`done/${doneEscaped}`, "g"),
        route
      );
    }
    content = content.replace(/addedNondes/g, "addedNodes");
    content = content.replace(/__P__gros main\.html/g, "__P__/gros-main");
    content = content.replace(/dashboard\.html/gi, "/dashboard");
    content = content.replace(
      /if \(\/dashboard\\\.html\$\/i\.test\(window\.location\.pathname\)\) return;/,
      "if (/\\/dashboard$/i.test(window.location.pathname)) return;"
    );
    content = content.replace(
      /toysrus-diy-bike-het-signals\.html/g,
      "/toysrus-diy-bike-hand-signals"
    );
    content = content.replace(
      /\/home-page\.html/gi,
      "/"
    );
    content = content.replace(
      /home-page\.html/gi,
      "/"
    );
    content = content.replace(
      /\/index\.html$/i,
      "/"
    );
    content = content.replace(
      /function getSigninPath\(tab\)\{[\s\S]*?return tab === 'login' \? base \+ '\?tab=login' : base;\s*\}/,
      `function getSigninPath(tab){
    var path = window.location.pathname.replace(/\\\\/g, '/');
    var inDone = path.indexOf('/done/') !== -1;
    var base = inDone ? '/signin' : '/signin';
    return tab === 'login' ? base + '?tab=login' : base;
  }`
    );
    content = content.replace(
      /function homeHref\(prefix\)[\s\S]*?return prefix \+ ['"][^'"]+['"];\s*\}/,
      `function homeHref(prefix) {
    var path = (window.location.pathname || '').replace(/\\\\/g, '/');
    if (path === '/' || /\\/home-page$/i.test(path)) return '#';
    return '/';
  }`
    );
    content = content.replace(
      /function assetPrefix\(\) \{[\s\S]*?return '';\s*\}/,
      `function assetPrefix() {
    return '';
  }`
    );
    fs.writeFileSync(path.join(jsDir, file), content, "utf8");
  }
}

function parseHtmlPage(htmlPath, routeMap) {
  const raw = readText(htmlPath);
  const $ = cheerio.load(raw, { decodeEntities: false });
  const lang = $("html").attr("lang") || "fr";
  const title = $("title").text().trim() || "AJBloks";

  const stylesheets = [];
  $("head link[rel='stylesheet']").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    if (href.startsWith("http")) {
      stylesheets.push(href);
    } else {
      stylesheets.push(`/legacy/${path.basename(href.split("?")[0])}`);
    }
  });

  const inlineStyles = [];
  $("head style").each((_, el) => {
    inlineStyles.push($(el).html() || "");
  });

  const externalScripts = [];
  const inlineScripts = [];
  $("body script").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      if (src.startsWith("http")) {
        externalScripts.push(src);
      } else {
        externalScripts.push(`/legacy/${path.basename(src.split("?")[0])}`);
      }
    } else {
      const code = $(el).html();
      if (code && code.trim()) inlineScripts.push(code);
    }
  });
  $("body script").remove();

  let bodyHtml = $("body").html() || "";
  const depth = htmlPath.includes("/") ? 1 : 0;
  bodyHtml = rewriteHtmlLinks(bodyHtml, routeMap, depth);
  inlineScripts.forEach((code, i) => {
    inlineScripts[i] = rewriteHtmlLinks(code, routeMap, depth);
  });

  return {
    lang,
    title,
    stylesheets,
    inlineStyles,
    bodyHtml,
    externalScripts,
    inlineScripts,
  };
}

function escapeForTemplate(str) {
  return JSON.stringify(str);
}

function generatePageFile(route, pageData) {
  const routeDir =
    route === "/"
      ? APP_DIR
      : path.join(APP_DIR, ...route.slice(1).split("/"));
  ensureDir(routeDir);

  const fileName = "page.tsx";
  const metadataTitle =
    pageData.title === "ToyHive — Acheter par âge, tendances et plus" ||
    pageData.title.includes("ToyHive")
      ? "AJBloks"
      : pageData.title.includes("AJ")
        ? pageData.title
        : `${pageData.title} | AJBloks`;

  const content = `import LegacyPage from "@/components/LegacyPage";

export const metadata = {
  title: ${escapeForTemplate(metadataTitle)},
};

export default function Page() {
  return (
    <LegacyPage
      lang=${escapeForTemplate(pageData.lang)}
      stylesheets={${JSON.stringify(pageData.stylesheets)}}
      inlineStyles={${JSON.stringify(pageData.inlineStyles)}}
      bodyHtml={${escapeForTemplate(pageData.bodyHtml)}}
      externalScripts={${JSON.stringify(pageData.externalScripts)}}
      inlineScripts={${JSON.stringify(pageData.inlineScripts)}}
    />
  );
}
`;

  fs.writeFileSync(path.join(routeDir, fileName), content, "utf8");
}

function generateRewrites(routeMap) {
  const rewrites = [{ source: "/home-page.html", destination: "/" }];
  for (const [htmlFile, route] of routeMap.entries()) {
    if (route === "/") continue;
    rewrites.push({
      source: `/${htmlFile.replace(/ /g, "%20")}`,
      destination: route,
    });
    rewrites.push({
      source: `/${htmlFile}`,
      destination: route,
    });
  }
  return rewrites;
}

function updateNextConfig(rewrites) {
  const configPath = path.join(ROOT, "next.config.ts");
  const rewritesJson = JSON.stringify(rewrites, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"/g, "'");

  const config = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return ${rewritesJson.replace(/'/g, '"')};
  },
};

export default nextConfig;
`;
  fs.writeFileSync(configPath, config, "utf8");
}

function cleanGeneratedApp() {
  const keep = new Set(["layout.tsx", "globals.css"]);
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        if (fs.readdirSync(full).length === 0) fs.rmdirSync(full);
      } else if (entry.name === "page.tsx" && dir !== APP_DIR) {
        // keep
      } else if (dir === APP_DIR && entry.name === "page.tsx") {
        // replaced by migration
      }
    }
  }
}

// Main
console.log("Copying assets...");
copyAssets();

const htmlFiles = collectHtmlFiles(SOURCE).filter((f) => !EXCLUDE_HTML.has(f));
const routeMap = buildRouteMap(htmlFiles);

console.log(`Migrating ${htmlFiles.length} HTML pages...`);
for (const htmlFile of htmlFiles) {
  const htmlPath = path.join(SOURCE, htmlFile);
  const route = routeMap.get(htmlFile);
  const pageData = parseHtmlPage(htmlPath, routeMap);
  generatePageFile(route, pageData);
  console.log(`  ${htmlFile} -> ${route}`);
}

console.log("Patching JS files...");
patchJsFiles(routeMap);

const rewrites = generateRewrites(routeMap);
console.log(`Generated ${rewrites.length} rewrites`);
updateNextConfig(rewrites);

const routesJson = Object.fromEntries(routeMap);
fs.writeFileSync(
  path.join(ROOT, "scripts", "routes.json"),
  JSON.stringify(routesJson, null, 2),
  "utf8"
);

console.log("Migration script complete.");
