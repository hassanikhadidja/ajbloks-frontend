import fs from "fs";
const s = fs.readFileSync("app/page.tsx", "utf8");
const i = s.indexOf("categoryTrack");
console.log(s.slice(i, i + 3500));
