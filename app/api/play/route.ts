import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import PlayItem from "@/lib/models/PlayItem";
import { requireAdmin } from "@/lib/auth";
import { parsePlaySection, sanitizePlayPayload } from "@/lib/play-payload";
import { jsonOk, jsonCached, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

function playItemToDashboard(doc: object) {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    _id: String(d._id),
    videoUrl: d.videoUrl,
    toyNames: d.toyNames,
    name: d.name,
    tags: d.tags,
    description: d.description,
    coverImage: d.coverImage,
    steps: d.steps,
    pdfName: d.pdfName,
    pdfUrl: d.pdfUrl,
    slot: d.slot,
    title: d.title,
  };
}

export async function GET() {
  try {
    await connectDB();
    const items = await PlayItem.find().sort({ createdAt: -1 });
    const grouped = { toys: [] as unknown[], diy: [] as unknown[], printables: [] as unknown[], bobs: [] as unknown[] };

    for (const item of items) {
      const mapped = playItemToDashboard(item.toObject());
      grouped[item.section].push(mapped);
    }

    return jsonCached(grouped, 60, 600);
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
    const section = parsePlaySection(body.section);
    if (!section) {
      return jsonError("Invalid play section", 400);
    }

    const data = sanitizePlayPayload(body, section);
    const item = await PlayItem.create(data);
    return jsonMsg("Play item created", 201, { id: String(item._id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
