import fs from "fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const idx = home.indexOf("Acheter par personnage");
console.log("=== HOME character section ===");
console.log(
  home
    .slice(idx, idx + 6000)
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .slice(0, 5500)
);

console.log("\n=== spider-man page filters ===");
const sf = fs.readFileSync("public/legacy/products-storefront.js", "utf8");
const i = sf.indexOf('"/spider-man"');
console.log(sf.slice(i - 80, i + 400));

console.log("\n=== brand page character param? ===");
console.log("character param support:", sf.includes('params.get("character")'));
