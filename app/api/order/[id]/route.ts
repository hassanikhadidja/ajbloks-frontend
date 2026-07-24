import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) return jsonError("Order not found", 404);
    return jsonOk(order);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) return jsonError("Invalid status value", 400);

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return jsonError("Order not found", 404);
    return jsonMsg("Status updated", 200, { order });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const result = await Order.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Order not found", 404);
    return jsonMsg("Order deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
