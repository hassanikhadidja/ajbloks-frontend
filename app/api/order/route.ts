import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order, { generateTrackingCode } from "@/lib/models/Order";
import User from "@/lib/models/User";
import { optionalAuth, requireAdmin } from "@/lib/auth";
import { computeDeliveryFee } from "@/lib/order-config";
import { validateAndSanitizeOrderItems } from "@/lib/order-items";
import { discountForPromoTier } from "@/lib/kids-club";
import { jsonOk, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });
    return jsonOk(orders);
  } catch (error) {
    return handleRouteError(error);
  }
}

function giftDiscountFromItems(items: { price: number; quantity: number }[]) {
  let min = Infinity;
  for (const item of items) {
    const unit = Number(item.price) || 0;
    if (unit > 0 && unit < min) min = unit;
  }
  return Number.isFinite(min) ? min : 0;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(req);
    const body = await req.json();

    const {
      customerName,
      phone,
      email,
      wilaya,
      commune,
      items,
      note,
      paymentMethod,
      promoCode,
    } = body;

    if (!customerName || !phone || !wilaya || !commune) {
      return jsonError("Missing required shipping fields", 400);
    }

    const validated = await validateAndSanitizeOrderItems(items);
    if ("error" in validated) return jsonError(validated.error, validated.status);
    const orderItems = validated.items;

    const subtotal = orderItems.reduce(
      (sum, i) => sum + Number(i.price) * Number(i.quantity),
      0,
    );

    let promoDiscount = 0;
    let appliedPromoCode = "";
    let promoTierUsed: number | null = null;

    const codeRaw = String(promoCode ?? "").trim().toUpperCase();
    if (codeRaw) {
      if (!user) {
        return jsonError("Connectez-vous pour utiliser un code promo Kids Club.", 401);
      }
      const dbUser = await User.findById(user._id);
      if (!dbUser) return jsonError("Utilisateur introuvable.", 404);

      const found = (dbUser.kidsClubPromoCodes || []).find(
        (c) => String(c.code || "").toUpperCase() === codeRaw && !c.used,
      );
      if (!found) {
        return jsonError("Code promo invalide ou déjà utilisé.", 400);
      }

      const discountInfo = discountForPromoTier(Number(found.tier));
      if (discountInfo.gift) {
        promoDiscount = giftDiscountFromItems(orderItems);
      } else {
        promoDiscount = subtotal * (discountInfo.percent / 100);
      }
      appliedPromoCode = found.code;
      promoTierUsed = Number(found.tier);
    }

    let total = Math.max(0, subtotal - promoDiscount);
    const isOnline = paymentMethod === "online";
    if (isOnline) total = total * 0.95;

    const deliveryFee = computeDeliveryFee(subtotal);
    total += deliveryFee;

    let trackingCode = generateTrackingCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const exists = await Order.findOne({ trackingCode });
      if (!exists) break;
      trackingCode = generateTrackingCode();
    }

    const order = await Order.create({
      customerName,
      phone,
      email: email ?? "",
      wilaya,
      commune,
      userId: user?._id ?? null,
      items: orderItems.map((item) => ({
        ...item,
        productId: item.productId
          ? new mongoose.Types.ObjectId(item.productId)
          : undefined,
      })),
      subtotal,
      deliveryFee,
      total,
      discount: promoDiscount,
      promoCode: appliedPromoCode,
      note: note ?? (promoTierUsed === 8 ? "Cadeau Kids Club" : ""),
      paymentMethod: paymentMethod ?? "cod",
      trackingCode,
    });

    // Mark Kids Club code used only after the order is created
    if (appliedPromoCode && user) {
      const dbUser = await User.findById(user._id);
      if (dbUser) {
        const entry = (dbUser.kidsClubPromoCodes || []).find(
          (c) => String(c.code || "").toUpperCase() === appliedPromoCode.toUpperCase() && !c.used,
        );
        if (entry) {
          entry.used = true;
          dbUser.markModified("kidsClubPromoCodes");
          await dbUser.save();
        }
      }
    }

    return jsonMsg("Order placed successfully", 201, {
      orderId: String(order._id),
      trackingCode: order.trackingCode,
      discount: promoDiscount,
      promoCode: appliedPromoCode,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
