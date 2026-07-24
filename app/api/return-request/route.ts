import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import ReturnRequest from "@/lib/models/ReturnRequest";
import { requireAdmin } from "@/lib/auth";
import { uploadDataUrl, isCloudinaryConfigured } from "@/lib/cloudinary";
import { jsonOk, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

const ALLOWED_TYPES = new Set([
  "retour",
  "echange",
  "reclamation",
  "contact",
]);

function toDashboard(doc: object) {
  const d = doc as Record<string, unknown>;
  const pictures = Array.isArray(d.pictures)
    ? (d.pictures as string[]).filter(Boolean)
    : [];
  return {
    id: String(d._id),
    _id: String(d._id),
    name: d.name || "",
    email: d.email || "",
    phone: d.phone || "",
    comment: d.comment || "",
    wilaya: d.wilaya || "",
    requestType: d.requestType || "",
    trackingNumber: d.trackingNumber || "",
    buyerContact: d.buyerContact || "",
    pictures,
    picture: pictures[0] || "",
    source: d.source || "",
    status: d.status || "nouvelle",
    createdAt: d.createdAt,
  };
}

async function resolvePictures(raw: unknown): Promise<string[]> {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const pic of raw) {
    if (typeof pic !== "string" || !pic.trim()) continue;
    if (pic.startsWith("data:") && isCloudinaryConfigured()) {
      out.push(await uploadDataUrl(pic, "return-requests"));
    } else {
      out.push(pic);
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const items = await ReturnRequest.find().sort({ createdAt: -1 });
    return jsonOk(items.map((item) => toDashboard(item.toObject())));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const name = String(body.name || "").trim();
    const comment = String(body.comment || "").trim();
    const requestType = String(body.requestType || "").trim();
    const source = body.source === "contact" ? "contact" : "retours";

    if (!name || !comment) {
      return jsonError("Nom et commentaire obligatoires", 400);
    }
    if (!ALLOWED_TYPES.has(requestType)) {
      return jsonError("Type de demande invalide", 400);
    }

    const pictures = await resolvePictures(body.pictures);

    const item = await ReturnRequest.create({
      name,
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      comment,
      wilaya: String(body.wilaya || "").trim(),
      requestType,
      trackingNumber: String(body.trackingNumber || "").trim(),
      buyerContact: String(body.buyerContact || "").trim(),
      pictures,
      source,
      status: "nouvelle",
    });

    return jsonMsg("Demande enregistrée", 201, {
      id: String(item._id),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
