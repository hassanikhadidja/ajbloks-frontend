import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Catalogue from "@/lib/models/Catalogue";
import { requireAdmin } from "@/lib/auth";
import { uploadBuffer, uploadDataUrl } from "@/lib/cloudinary";
import { jsonOk, jsonCached, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

function catalogueToDashboard(doc: Record<string, unknown> | object) {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    _id: String(d._id),
    title: d.title,
    buttonSentence: d.buttonSentence,
    picture: d.picture,
    pdfName: d.pdfName,
    pdfUrl: d.pdfUrl,
  };
}

async function resolvePicture(picture: string): Promise<string> {
  if (picture.startsWith("data:")) return uploadDataUrl(picture, "catalogues");
  return picture;
}

async function resolvePdf(file: File | string | undefined, existing?: string) {
  if (!file) return existing ?? "";
  if (typeof file === "string") {
    if (file.startsWith("data:")) {
      const url = await uploadDataUrl(file, "catalogues-pdf");
      return url;
    }
    return file;
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBuffer(buffer, { folder: "catalogues-pdf", resourceType: "raw" });
}

export async function GET() {
  try {
    await connectDB();
    const items = await Catalogue.find().sort({ createdAt: -1 });
    return jsonCached(items.map((c) => catalogueToDashboard(c.toObject())), 60, 600);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, unknown>;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      body = Object.fromEntries(
        [...form.entries()].filter(([, v]) => typeof v === "string"),
      ) as Record<string, unknown>;
      const pictureFile = form.get("pictureFile");
      const pdfFile = form.get("pdfFile");
      if (pictureFile instanceof File && pictureFile.size > 0) {
        body.picture = await uploadBuffer(Buffer.from(await pictureFile.arrayBuffer()));
      }
      if (pdfFile instanceof File && pdfFile.size > 0) {
        body.pdfUrl = await uploadBuffer(Buffer.from(await pdfFile.arrayBuffer()), {
          folder: "catalogues-pdf",
          resourceType: "raw",
        });
        body.pdfName = pdfFile.name;
      }
    } else {
      body = await req.json();
      if (typeof body.picture === "string") body.picture = await resolvePicture(body.picture);
      if (typeof body.pdfUrl === "string" && body.pdfUrl.startsWith("data:")) {
        body.pdfUrl = await uploadDataUrl(body.pdfUrl, "catalogues-pdf");
      }
    }

    if (!body.title || !body.buttonSentence || !body.picture) {
      return jsonError("Title, button sentence, and picture are required", 400);
    }

    const item = await Catalogue.create({
      title: String(body.title),
      buttonSentence: String(body.buttonSentence),
      picture: String(body.picture),
      pdfName: String(body.pdfName ?? "catalogue.pdf"),
      pdfUrl: String(body.pdfUrl ?? "#"),
    });

    return jsonMsg("Catalogue created", 201, { id: String(item._id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
