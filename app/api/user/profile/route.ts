import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";
import { syncAccountMarketingEmail } from "@/lib/newsletter";

function sanitizeAddresses(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((a) => String(a ?? "").trim())
    .filter(Boolean)
    .slice(0, 10)
    .map((a) => a.slice(0, 280));
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const dbUser = await User.findById(user!._id).select(
      "-password -kidsClubPromoCodes",
    );
    if (!dbUser) return jsonError("Utilisateur introuvable", 404);

    return jsonOk({
      id: String(dbUser._id),
      name: dbUser.name || "",
      email: dbUser.email || "",
      kidsClubBirthday: dbUser.kidsClubBirthday || "",
      kidsClubBirthdayLocked: Boolean(dbUser.kidsClubBirthdayLocked),
      addresses: Array.isArray(dbUser.addresses) ? dbUser.addresses : [],
      marketingEmail: dbUser.marketingEmail !== false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const body = await req.json();
    const dbUser = await User.findById(user!._id);
    if (!dbUser) return jsonError("Utilisateur introuvable", 404);

    if ("name" in body) {
      const name = String(body.name ?? "").trim().slice(0, 120);
      if (!name) return jsonError("Le nom ne peut pas être vide.", 400);
      dbUser.name = name;
    }

    if ("addresses" in body) {
      dbUser.addresses = sanitizeAddresses(body.addresses);
    }

    if ("marketingEmail" in body) {
      dbUser.marketingEmail = Boolean(body.marketingEmail);
    }

    await dbUser.save();

    try {
      await syncAccountMarketingEmail({
        email: dbUser.email,
        name: dbUser.name || "",
        userId: String(dbUser._id),
        marketingEmail: dbUser.marketingEmail !== false,
      });
    } catch (e) {
      console.warn("Newsletter sync on profile update failed", e);
    }

    return jsonOk({
      id: String(dbUser._id),
      name: dbUser.name || "",
      email: dbUser.email || "",
      kidsClubBirthday: dbUser.kidsClubBirthday || "",
      kidsClubBirthdayLocked: Boolean(dbUser.kidsClubBirthdayLocked),
      addresses: Array.isArray(dbUser.addresses) ? dbUser.addresses : [],
      marketingEmail: dbUser.marketingEmail !== false,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
