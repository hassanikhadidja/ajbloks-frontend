import fs from "fs";

const path = "app/dashboard/page.tsx";
const s = fs.readFileSync(path, "utf8");
const marker = "externalScripts=";
const idx = s.indexOf(marker);
if (idx === -1) throw new Error("marker not found");

const head = s.slice(0, idx);
const tail = `externalScripts={["/legacy/api-client.js","/legacy/dashboard-admin.js","/legacy/dashboard-integration.js"]}
      inlineScripts={[]} />
  );
}
`;

fs.writeFileSync(path, head + tail);
console.log("Updated", path, "size", fs.statSync(path).size);
