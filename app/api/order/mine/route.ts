import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleRouteError } from "@/lib/api-utils";

const STATUS_LABELS: Record<string, { status: string; statusLabel: string }> = {
  pending: { status: "processing", statusLabel: "En cours" },
  confirmed: { status: "processing", statusLabel: "En cours" },
  shipped: { status: "shipped", statusLabel: "Expédié" },
  delivered: { status: "delivered", statusLabel: "Reçue" },
  cancelled: { status: "processing", statusLabel: "Annulé" },
};

function formatOrderForAccount(order: object) {
  const o = order as Record<string, unknown>;
  const items = (o.items as { name: string; img: string }[]) ?? [];
  const first = items[0];
  const statusKey = String(o.status ?? "pending");
  const labels = STATUS_LABELS[statusKey] ?? STATUS_LABELS.pending;
  const created = o.createdAt ? new Date(o.createdAt as string) : new Date();

  return {
    id: String(o.trackingCode ?? o._id),
    product: first?.name ?? "Commande",
    date: created.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    amount: `${Number(o.total).toLocaleString("fr-DZ")} DZD`,
    status: labels.status,
    statusLabel: labels.statusLabel,
    thumb: first?.img ?? "",
    _id: String(o._id),
    trackingCode: o.trackingCode,
    rawStatus: o.status,
    total: o.total,
    items: o.items,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    await connectDB();
    const orders = await Order.find({ userId: user!._id }).sort({ createdAt: -1 });
    return jsonOk(orders.map((o) => formatOrderForAccount(o.toObject())));
  } catch (error) {
    return handleRouteError(error);
  }
}
