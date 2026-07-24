import fs from "fs";

const file = "public/legacy/site-menu.js";
let t = fs.readFileSync(file, "utf8");

const drill =
  '<li><button type=\\"button\\" class=\\"menu-drill\\" data-panel=\\"category-trending\\">Nouveautés et tendances <span class=\\"menu-chevron\\">›</span></button></li>';
const link =
  '<li><a href=\\"__P__/new-and-trending\\" class=\\"menu-plain menu-close-link\\">Nouveautés et tendances</a></li>';

if (!t.includes(drill)) {
  console.error("drill button not found");
  process.exit(1);
}
t = t.replace(drill, link);

const panelMarker = "<!-- new & trending -->";
const startIdx = t.indexOf(panelMarker);
if (startIdx < 0) {
  console.error("panel marker not found");
  process.exit(1);
}

// Include leading \r\n\r\n    before the comment if present
let cutStart = startIdx;
const lead = "\\r\\n\\r\\n    ";
if (t.slice(startIdx - lead.length, startIdx) === lead) {
  cutStart = startIdx - lead.length;
}

const searchFrom = startIdx + panelMarker.length;
const nextPanelComment = t.indexOf("\\r\\n\\r\\n    <!-- ", searchFrom);
if (nextPanelComment < 0) {
  console.error("next panel not found");
  process.exit(1);
}

console.log("cut:", JSON.stringify(t.slice(cutStart, cutStart + 80)));
console.log("to:", JSON.stringify(t.slice(nextPanelComment, nextPanelComment + 80)));

t = t.slice(0, cutStart) + t.slice(nextPanelComment);
fs.writeFileSync(file, t);

console.log("done");
console.log("drill left?", t.includes('data-panel=\\"category-trending\\"'));
console.log("direct link?", t.includes(link));
console.log("Tout voir trending left?", t.includes("Tout voir : Nouveautés et tendances"));
console.log("panel comment left?", t.includes(panelMarker));
