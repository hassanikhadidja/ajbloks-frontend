import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import NewsletterEmail from "@/lib/models/NewsletterEmail";
import { requireAdmin } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import { toNewsletterDto } from "@/lib/newsletter";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const item = await NewsletterEmail.findById(id);
    if (!item) return jsonError("E-mail introuvable", 404);

    if ("accepted" in body) item.accepted = Boolean(body.accepted);
    if ("name" in body) item.name = String(body.name || "").trim().slice(0, 120);
    if ("email" in body) {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      if (!email.includes("@")) return jsonError("Adresse e-mail invalide", 400);
      item.email = email;
    }

    await item.save();
    return jsonMsg("Mis à jour", 202, { item: toNewsletterDto(item.toObject()) });
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
    const result = await NewsletterEmail.deleteOne({ _id: id });
    if (!result.deletedCount) return jsonError("E-mail introuvable", 404);
    return jsonMsg("E-mail supprimé", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
