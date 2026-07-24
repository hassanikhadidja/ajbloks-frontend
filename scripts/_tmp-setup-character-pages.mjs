import fs from "fs";
import path from "path";

// ---------- 1) Create /character page from /brand ----------
const brandSrc = fs.readFileSync("app/brand/page.tsx", "utf8");
fs.mkdirSync("app/character", { recursive: true });

let page = brandSrc;
page = page.replace('title: "Marque | AJ BLOKS"', 'title: "Personnage | AJ BLOKS"');
page = page.replace(/brand-page-title/g, "character-page-title");
page = page.replace(/brandCrumb/g, "characterCrumb");
page = page.replace(/brandTitle/g, "characterTitle");
page = page.replace(/brandHero/g, "characterHero");
page = page.replace(/>Marque</g, ">Personnage<");

// Replace updateBrandHeading with character version (no brand heroes needed)
const brandScriptStart = page.indexOf("(function updateBrandHeading()");
const brandScriptEnd = page.indexOf("})();", brandScriptStart);
if (brandScriptStart < 0 || brandScriptEnd < 0) {
  console.error("updateBrandHeading not found");
  process.exit(1);
}

const characterScript = `(function updateCharacterHeading(){\\n  var params = new URLSearchParams(window.location.search || '');\\n  var character = (params.get('character') || '').trim();\\n  if (!character) return;\\n  var labels = {\\n    'tmnt': 'Teenage Mutant Ninja Turtles',\\n    'teenage mutant ninja turtles': 'Teenage Mutant Ninja Turtles',\\n    'tom jerry': 'Tom & Jerry',\\n    'tom and jerry': 'Tom & Jerry',\\n    'spider man': 'Spider-Man',\\n    'spiderman': 'Spider-Man',\\n    'sophia': 'Sophia',\\n    'sofia': 'Sophia',\\n    'super wings': 'Super Wings',\\n    'hello kitty': 'Hello Kitty',\\n    'fulla': 'Fulla',\\n    'bob': 'Bob'\\n  };\\n  function key(value){\\n    return String(value || '').toLowerCase().normalize('NFD').replace(/[\\\\u0300-\\\\u036f]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9\\\\s]/g, ' ').replace(/\\\\s+/g, ' ').trim();\\n  }\\n  var label = labels[key(character)] || character;\\n  var crumb = document.getElementById('characterCrumb');\\n  var titleEl = document.getElementById('characterTitle');\\n  var hero = document.getElementById('characterHero');\\n  if (crumb) crumb.textContent = label;\\n  if (titleEl) titleEl.textContent = label;\\n  document.title = label + ' | AJ BLOKS';\\n  if (hero) hero.hidden = true;\\n})();`;

page =
  page.slice(0, brandScriptStart) +
  characterScript +
  page.slice(brandScriptEnd + "})();".length);

fs.writeFileSync("app/character/page.tsx", page);
console.log("OK app/character/page.tsx");

// ---------- 2) products-storefront character aliases ----------
const sfPath = "public/legacy/products-storefront.js";
let sf = fs.readFileSync(sfPath, "utf8");

if (!sf.includes('"/character"')) {
  sf = sf.replace(
    '    "/brand": {},',
    '    "/brand": {},\n    "/character": {},'
  );
  console.log("Added PAGE_FILTERS /character");
}

if (!sf.includes("CHARACTER_ALIASES")) {
  const aliasBlock = `
  var CHARACTER_ALIASES = {
    tmnt: ["TMNT", "Teenage Mutant Ninja Turtles", "Tortues Ninja"],
    "teenage mutant ninja turtles": ["TMNT", "Teenage Mutant Ninja Turtles", "Tortues Ninja"],
    "tom jerry": ["Tom & Jerry", "Tom and Jerry"],
    "tom and jerry": ["Tom & Jerry", "Tom and Jerry"],
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
`;

  sf = sf.replace(
    "  function matchesAnyNeedle(product, needles, keys) {",
    aliasBlock + "\n  function matchesAnyNeedle(product, needles, keys) {"
  );

  // Use aliases when filtering by character
  sf = sf.replace(
    `    if (filters.productCharacter) {
      list = list.filter(function (p) {
        return matchesNeedle(p, filters.productCharacter, ["character", "tags", "name", "category"]);
      });
    }`,
    `    if (filters.productCharacter) {
      var characterNeedles = resolveCharacterNeedles(filters.productCharacter);
      list = list.filter(function (p) {
        return matchesAnyNeedle(p, characterNeedles, ["character", "tags", "name", "category"]);
      });
    }`
  );
  console.log("Added CHARACTER_ALIASES + filter");
} else {
  console.log("CHARACTER_ALIASES already present");
}

fs.writeFileSync(sfPath, sf);

// ---------- 3) Update home personnage tiles ----------
const homePath = "app/page.tsx";
let home = fs.readFileSync(homePath, "utf8");

const replacements = [
  // non-link divs → anchors
  [
    `<div class=\\"tile-card\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127861/Design_sans_titre_21_bwt30m.png');\\"></div>\\n        <div class=\\"tile-label\\">Hello Kitty</div>\\n      </div>`,
    `<a class=\\"tile-card\\" href=\\"/character?character=Hello%20Kitty\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127861/Design_sans_titre_21_bwt30m.png');\\"></div>\\n        <div class=\\"tile-label\\">Hello Kitty</div>\\n      </a>`,
  ],
  [
    `<div class=\\"tile-card\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127842/Design_sans_titre_18_z9mvkj.png');\\"></div>\\n        <div class=\\"tile-label\\">Tom &amp; Jerry</div>\\n      </div>`,
    `<a class=\\"tile-card\\" href=\\"/character?character=Tom%20%26%20Jerry\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127842/Design_sans_titre_18_z9mvkj.png');\\"></div>\\n        <div class=\\"tile-label\\">Tom &amp; Jerry</div>\\n      </a>`,
  ],
  [
    `<div class=\\"tile-card\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127847/Design_sans_titre_19_g3xqdx.png');\\"></div>\\n        <div class=\\"tile-label\\">Teenage Mutant Ninja Turtles</div>\\n      </div>`,
    `<a class=\\"tile-card\\" href=\\"/character?character=TMNT\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127847/Design_sans_titre_19_g3xqdx.png');\\"></div>\\n        <div class=\\"tile-label\\">Teenage Mutant Ninja Turtles</div>\\n      </a>`,
  ],
  [
    `<div class=\\"tile-card\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127852/Design_sans_titre_20_fymlan.png');\\"></div>\\n        <div class=\\"tile-label\\">Super Wings</div>\\n      </div>`,
    `<a class=\\"tile-card\\" href=\\"/character?character=Super%20Wings\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782127852/Design_sans_titre_20_fymlan.png');\\"></div>\\n        <div class=\\"tile-label\\">Super Wings</div>\\n      </a>`,
  ],
  [
    `<div class=\\"tile-card\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782128429/9_1_lovmpf.png');\\"></div>\\n        <div class=\\"tile-label\\">Bob</div>\\n      </div>`,
    `<a class=\\"tile-card\\" href=\\"/character?character=Bob\\">\\n        <div class=\\"tile-img tile-img--photo\\" style=\\"background-image:url('https://res.cloudinary.com/dbtkfjrvd/image/upload/v1782128429/9_1_lovmpf.png');\\"></div>\\n        <div class=\\"tile-label\\">Bob</div>\\n      </a>`,
  ],
  [
    `/shop-all-categories-page?character=Fulla`,
    `/character?character=Fulla`,
  ],
  [
    `/shop-all-categories-page?character=Sophia`,
    `/character?character=Sophia`,
  ],
];

let count = 0;
for (const [from, to] of replacements) {
  if (home.includes(from)) {
    home = home.split(from).join(to);
    count++;
  } else {
    console.log("MISS home replacement:", from.slice(0, 80));
  }
}
fs.writeFileSync(homePath, home);
console.log("OK home character links:", count);

// ---------- 4) Menu character links ----------
const menuPath = "public/legacy/site-menu.js";
let menu = fs.readFileSync(menuPath, "utf8");
const before = (menu.match(/shop-all-categories-page\?character=/g) || []).length;
menu = menu.split("/shop-all-categories-page?character=").join("/character?character=");
menu = menu.replace(
  /__P__\/shop-all-categories-page\?character=/g,
  "__P__/character?character="
);

// Convert plain # character links if present for known names
const menuChars = [
  ["Hello Kitty", "Hello%20Kitty"],
  ["Tom &amp; Jerry", "Tom%20%26%20Jerry"],
  ["Tom & Jerry", "Tom%20%26%20Jerry"],
  ["Teenage Mutant Ninja Turtles", "TMNT"],
  ["Super Wings", "Super%20Wings"],
  ["Fulla", "Fulla"],
  ["Sophia", "Sophia"],
  ["Bob", "Bob"],
];
for (const [label, q] of menuChars) {
  const old1 = `href=\\"#\\" class=\\"menu-plain menu-close-link\\">${label}</a>`;
  const neu1 = `href=\\"__P__/character?character=${q}\\" class=\\"menu-plain menu-close-link\\">${label}</a>`;
  if (menu.includes(old1)) menu = menu.split(old1).join(neu1);
}

fs.writeFileSync(menuPath, menu);
console.log(
  "menu character links updated; old shop-all character left:",
  (menu.match(/shop-all-categories-page\?character=/g) || []).length,
  "new /character:",
  (menu.match(/character\?character=/g) || []).length
);

// verify
const home2 = fs.readFileSync(homePath, "utf8");
const page2 = fs.readFileSync("app/character/page.tsx", "utf8");
const sf2 = fs.readFileSync(sfPath, "utf8");
console.log("verify character page:", page2.includes("updateCharacterHeading"));
console.log("verify storefront aliases:", sf2.includes("CHARACTER_ALIASES"));
console.log("verify home Hello Kitty link:", home2.includes("/character?character=Hello%20Kitty"));
console.log("verify home TMNT link:", home2.includes("/character?character=TMNT"));
console.log("verify spider-man kept:", home2.includes('href=\\"/spider-man\\"') || home2.includes('href="/spider-man"'));
