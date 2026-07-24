import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";
import {
  buildKidsClubReward,
  generateKidsClubCode,
  getStampIconUrl,
  type KidsClubPromoCode,
} from "@/lib/kids-club";

async function deliveredCountForUser(userId: string) {
  return Order.countDocuments({ userId, status: "delivered" });
}

async function buildState(userId: string) {
  const user = await User.findById(userId).select(
    "kidsClubBirthday kidsClubBirthdayLocked kidsClubPromoCodes name email",
  );
  if (!user) return null;

  const deliveredCount = await deliveredCountForUser(userId);
  const codes = (user.kidsClubPromoCodes || []) as KidsClubPromoCode[];
  let state = buildKidsClubReward({
    deliveredCount,
    birthday: user.kidsClubBirthday || null,
    birthdayLocked: user.kidsClubBirthdayLocked,
    promoCodes: codes,
  });

  if (state.needsCode && (state.tier === 3 || state.tier === 6 || state.tier === 8)) {
    const code = generateKidsClubCode(userId, state.cycle, state.tier);
    codes.push({
      code,
      tier: state.tier as 3 | 6 | 8,
      cycle: state.cycle,
      used: false,
      createdAt: new Date(),
    });
    user.kidsClubPromoCodes = codes as typeof user.kidsClubPromoCodes;
    await user.save();
    state = buildKidsClubReward({
      deliveredCount,
      birthday: user.kidsClubBirthday || null,
      birthdayLocked: user.kidsClubBirthdayLocked,
      promoCodes: codes,
    });
  }

  return {
    deliveredCount: state.deliveredCount,
    stamps: state.stamps,
    tier: state.tier,
    cycle: state.cycle,
    message: state.message,
    showPromoCode: state.showPromoCode,
    promoCode: state.promoCode,
    showBirthdayForm: state.showBirthdayForm,
    birthday: state.birthday,
    birthdayLocked: state.birthdayLocked,
    stampIconUrl: getStampIconUrl(),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const state = await buildState(String(user!._id));
    if (!state) return jsonError("User not found", 404);
    return jsonOk(state);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const body = await req.json();
    const birthdayRaw = String(body.birthday ?? "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdayRaw)) {
      return jsonError("Date de naissance invalide (AAAA-MM-JJ).", 400);
    }

    const parsed = new Date(birthdayRaw + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) {
      return jsonError("Date de naissance invalide.", 400);
    }

    const existing = await User.findById(user!._id);
    if (!existing) return jsonError("User not found", 404);

    if (existing.kidsClubBirthdayLocked && existing.kidsClubBirthday) {
      return jsonError("La date de naissance ne peut plus être modifiée.", 400);
    }

    // Only allow setting birthday when the user has reached stamp tier 4 in current cycle
    const deliveredCount = await deliveredCountForUser(String(user!._id));
    const state = buildKidsClubReward({ deliveredCount });
    if (state.tier !== 4) {
      return jsonError("La date de naissance peut être enregistrée au 4e tampon Kids Club.", 400);
    }

    existing.kidsClubBirthday = birthdayRaw;
    existing.kidsClubBirthdayLocked = true;
    await existing.save();

    const next = await buildState(String(user!._id));
    return jsonOk(next);
  } catch (error) {
    return handleRouteError(error);
  }
}
