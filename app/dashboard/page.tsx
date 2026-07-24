import { readFileSync } from "fs";
import path from "path";
import LegacyPage from "@/components/LegacyPage";

export const metadata = {
  title: "Tableau de bord | AJBloks",
};

export const dynamic = "force-dynamic";

export default function Page() {
  const bodyHtml = readFileSync(
    path.join(process.cwd(), "public/dashboard/body.html"),
    "utf8",
  );

  return (
    <LegacyPage
      lang="fr"
      stylesheets={["/legacy/dashboard.css", "/legacy/dashboard-shell.css"]}
      inlineStyles={[]}
      bodyHtml={bodyHtml}
      externalScripts={[
        "/legacy/api-client.js",
        "/legacy/auth-session.js",
        "/legacy/dashboard-nav.js",
        "/legacy/dashboard-admin.js",
        "/legacy/dashboard-integration.js",
      ]}
      inlineScripts={[]}
    />
  );
}
