import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Store from "@/lib/models/Store";
import { requireAdmin } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import { resolveStoreCoords } from "@/lib/geocode";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const existing = await Store.findById(id).lean();
    if (!existing) return jsonError("Store not found", 404);

    const mapLink =
      "mapLink" in body
        ? String(body.mapLink || "").trim()
        : String(existing.mapLink || "").trim();
    const location =
      "location" in body
        ? String(body.location || "").trim()
        : String(existing.location || "").trim();

    const update: Record<string, unknown> = {
      name: "name" in body ? body.name : existing.name,
      location,
      website: "website" in body ? String(body.website ?? "") : existing.website,
      mapLink,
      storeType:
        "storeType" in body
          ? String(body.storeType ?? "").trim()
          : String((existing as { storeType?: string }).storeType ?? ""),
    };

    try {
      const { lat, lng } = await resolveStoreCoords({
        mapLink,
        location,
        name: String(("name" in body ? body.name : existing.name) || ""),
        lat: body.lat ?? existing.lat,
        lng: body.lng ?? existing.lng,
      });
      update.lat = lat;
      update.lng = lng;
    } catch {
      // keep previous coords if geocode fails
    }

    await Store.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    return jsonMsg("Store updated", 202);
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
    const result = await Store.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Store not found", 404);
    return jsonMsg("Store deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
