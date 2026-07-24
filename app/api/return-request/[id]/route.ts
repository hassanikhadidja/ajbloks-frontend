import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import ReturnRequest from "@/lib/models/ReturnRequest";
import { requireAdmin } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = new Set([
  "nouvelle",
  "en_cours",
  "attente_client",
  "resolue",
  "annulee",
]);

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const status = String(body.status || "").trim();

    if (!ALLOWED_STATUSES.has(status)) {
      return jsonError("Statut invalide", 400);
    }

    const item = await ReturnRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!item) return jsonError("Demande introuvable", 404);

    return jsonMsg("Statut mis à jour", 202, { status: item.status });
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
    const result = await ReturnRequest.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return jsonError("Demande introuvable", 404);
    }
    return jsonMsg("Demande supprimée", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
