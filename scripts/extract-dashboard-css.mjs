import { readFileSync, writeFileSync } from "fs";

const s = readFileSync("app/dashboard/page.tsx", "utf8");
const start = s.indexOf('inlineStyles={["');
const end = s.indexOf('"]}', start);
if (start === -1 || end === -1) throw new Error("Could not find inlineStyles");
const raw = s.slice(start + 17, end);
const css = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"');
writeFileSync("public/legacy/dashboard.css", css);
console.log("Wrote public/legacy/dashboard.css", css.length, "chars");
