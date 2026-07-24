import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import PlayItem from "@/lib/models/PlayItem";
import { requireAdmin } from "@/lib/auth";
import { parsePlaySection, sanitizePlayPayload } from "@/lib/play-payload";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const section = parsePlaySection(body.section);
    if (!section) {
      return jsonError("Invalid play section", 400);
    }

    const data = sanitizePlayPayload(body, section);
    const updated = await PlayItem.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return jsonError("Play item not found", 404);

    return jsonMsg("Play item updated", 202);
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
    const result = await PlayItem.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Play item not found", 404);
    return jsonMsg("Play item deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
