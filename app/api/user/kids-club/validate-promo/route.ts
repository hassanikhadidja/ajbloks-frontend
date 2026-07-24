import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";
import { discountForPromoTier } from "@/lib/kids-club";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const body = await req.json();
    const code = String(body.code ?? "")
      .trim()
      .toUpperCase();

    if (!code) return jsonError("Veuillez entrer un code promo.", 400);

    const dbUser = await User.findById(user!._id).select("kidsClubPromoCodes");
    if (!dbUser) return jsonError("Utilisateur introuvable.", 404);

    const found = (dbUser.kidsClubPromoCodes || []).find(
      (c) => String(c.code || "").toUpperCase() === code && !c.used,
    );

    if (!found) {
      return jsonError("Code invalide ou déjà utilisé.", 400);
    }

    const tier = Number(found.tier);
    const discount = discountForPromoTier(tier);

    return jsonOk({
      valid: true,
      code: found.code,
      tier,
      percent: discount.percent,
      gift: discount.gift,
      label: discount.label,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
