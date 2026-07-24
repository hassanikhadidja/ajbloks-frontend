import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Store from "@/lib/models/Store";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, jsonCached, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";
import { resolveStoreCoords } from "@/lib/geocode";

function storeToDashboard(doc: object) {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    _id: String(d._id),
    name: d.name,
    location: d.location,
    website: d.website ?? "",
    mapLink: d.mapLink ?? "",
    storeType: d.storeType ?? "",
    lat: typeof d.lat === "number" ? d.lat : null,
    lng: typeof d.lng === "number" ? d.lng : null,
  };
}

function isUsineAjBloks(name: unknown) {
  const n = String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return n === "usine aj bloks" || n.startsWith("usine aj bloks");
}

export async function GET() {
  try {
    await connectDB();
    const stores = await Store.find().sort({ createdAt: -1 });
    const mapped = stores.map((s) => storeToDashboard(s.toObject()));
    mapped.sort((a, b) => Number(isUsineAjBloks(b.name)) - Number(isUsineAjBloks(a.name)));
    return jsonCached(mapped, 60, 600);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const body = await req.json();
    if (!body.name || !body.location) return jsonError("Name and location required", 400);

    const mapLink = String(body.mapLink ?? "").trim();
    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const resolved = await resolveStoreCoords({
        mapLink,
        location: body.location,
        name: body.name,
        lat: body.lat,
        lng: body.lng,
      });
      lat = resolved.lat;
      lng = resolved.lng;
    } catch {
      // Geocoding must never block saving the map link
    }

    const store = await Store.create({
      name: body.name,
      location: body.location,
      website: body.website ?? "",
      mapLink,
      storeType: String(body.storeType ?? "").trim(),
      lat,
      lng,
    });
    return jsonMsg("Store created", 201, { id: String(store._id), mapLink: store.mapLink });
  } catch (error) {
    return handleRouteError(error);
  }
}
