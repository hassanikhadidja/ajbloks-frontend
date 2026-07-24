import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    const orderId = req.nextUrl.searchParams.get("orderId");

    if (!code && !orderId) {
      return jsonError("Provide code or orderId query parameter", 400);
    }

    await connectDB();
    const order = code
      ? await Order.findOne({ trackingCode: code })
      : await Order.findById(orderId);

    if (!order) return jsonError("Order not found", 404);

    return jsonOk({
      orderId: String(order._id),
      trackingCode: order.trackingCode,
      status: order.status,
      customerName: order.customerName,
      wilaya: order.wilaya,
      commune: order.commune,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      items: order.items,
      createdAt: order.createdAt,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
