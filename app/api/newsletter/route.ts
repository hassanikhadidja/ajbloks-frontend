import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import NewsletterEmail from "@/lib/models/NewsletterEmail";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import {
  isValidNewsletterEmail,
  normalizeNewsletterEmail,
  syncAccountMarketingEmail,
  toNewsletterDto,
  upsertNewsletterEmail,
} from "@/lib/newsletter";
import type { NewsletterSource } from "@/lib/models/NewsletterEmail";

const PUBLIC_SOURCES = new Set([
  "footer",
  "signup_drawer",
  "notre_histoire",
  "cookies",
  "diy",
  "printables",
  "gifts",
]);

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

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    await syncRegisteredUsers();

    const acceptedOnly = req.nextUrl.searchParams.get("accepted") === "1";
    const filter = acceptedOnly ? { accepted: true } : {};
    const items = await NewsletterEmail.find(filter).sort({ updatedAt: -1 });
    return jsonOk(items.map((item) => toNewsletterDto(item.toObject())));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const email = normalizeNewsletterEmail(body.email);
    const name = String(body.name || "").trim().slice(0, 120);
    let source = String(body.source || "footer") as NewsletterSource;

    const adminCheck = await requireAdmin(req);
    const isAdmin = !adminCheck.error;

    if (isAdmin && body.source === "admin") {
      source = "admin";
    } else if (!PUBLIC_SOURCES.has(source)) {
      source = "footer";
    }

    if (!isValidNewsletterEmail(email)) {
      return jsonError("Adresse e-mail invalide", 400);
    }

    let accepted = true;
    if (isAdmin && typeof body.accepted === "boolean") {
      accepted = body.accepted;
    }

    const item = await upsertNewsletterEmail({
      email,
      name,
      source,
      accepted,
    });

    return jsonMsg("Inscription enregistrée", 201, {
      id: String(item._id),
      email: item.email,
      accepted: item.accepted !== false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
