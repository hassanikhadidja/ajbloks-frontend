import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import NewsletterEmail from "@/lib/models/NewsletterEmail";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/api-utils";
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  syncAccountMarketingEmail,
} from "@/lib/newsletter";

async function syncRegisteredUsers() {
  const users = await User.find({ role: { $ne: "admin" } })
    .select("email name marketingEmail")
    .lean();
  for (const user of users) {
    const email = normalizeNewsletterEmail(user.email);
    if (!isValidNewsletterEmail(email)) continue;
    await syncAccountMarketingEmail({
      email,
      name: user.name || "",
      userId: String(user._id),
      marketingEmail: user.marketingEmail !== false,
    });
  }
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    await syncRegisteredUsers();

    const acceptedOnly = req.nextUrl.searchParams.get("accepted") === "1";
    const filter = acceptedOnly ? { accepted: true } : {};
    const items = await NewsletterEmail.find(filter).sort({ email: 1 });

    const header = ["email", "name", "source", "accepted", "createdAt"];
    const lines = [header.join(",")];
    for (const item of items) {
      lines.push(
        [
          csvEscape(item.email),
          csvEscape(item.name || ""),
          csvEscape(item.source || ""),
          csvEscape(item.accepted !== false ? "oui" : "non"),
          csvEscape(
            item.createdAt
              ? new Date(item.createdAt).toISOString()
              : "",
          ),
        ].join(","),
      );
    }

    const csv = lines.join("\r\n") + "\r\n";
    const filename = acceptedOnly
      ? "infolettre-acceptes.csv"
      : "infolettre-tous.csv";

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
