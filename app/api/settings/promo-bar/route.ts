import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import SiteSettings, { PROMO_BAR_DEFAULT, PROMO_BAR_KEY } from "@/lib/models/SiteSettings";
import { requireAdmin } from "@/lib/auth";
import { jsonCached, jsonMsg, handleRouteError } from "@/lib/api-utils";

export async function GET() {
  try {
    await connectDB();
    const setting = await SiteSettings.findOne({ key: PROMO_BAR_KEY });
    return jsonCached({ sentence: setting?.value ?? PROMO_BAR_DEFAULT }, 60, 600);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { sentence } = await req.json();
    const value = String(sentence ?? "").trim() || PROMO_BAR_DEFAULT;

    await SiteSettings.findOneAndUpdate(
      { key: PROMO_BAR_KEY },
      { key: PROMO_BAR_KEY, value },
      { upsert: true, new: true },
    );

    return jsonMsg("Promo bar updated", 200, { sentence: value });
  } catch (error) {
    return handleRouteError(error);
  }
}
