import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  uploadBuffer,
  isCloudinaryConfigured,
  cloudinaryFolder,
} from "@/lib/cloudinary";
import { MAX_PRINTABLE_PDF_BYTES } from "@/lib/upload-limits";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";

export const maxDuration = 60;

const MAX_INLINE_DATA_URL = 200_000;

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid dataUrl");
  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64"),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const contentType = req.headers.get("content-type") ?? "";
    let folder = cloudinaryFolder("play");
    let resourceType: "image" | "raw" = "image";
    let dataUrl = "";
    let buffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      folder = cloudinaryFolder(String(form.get("folder") || "play"));
      resourceType = form.get("resourceType") === "raw" ? "raw" : "image";

      if (!(file instanceof Blob)) {
        return jsonError("Missing file", 400);
      }

      buffer = Buffer.from(await file.arrayBuffer());

      if (resourceType === "raw" && buffer.length > MAX_PRINTABLE_PDF_BYTES) {
        return jsonError("PDF trop volumineux (max 20 Mo).", 413);
      }

      const mime =
        file.type || (resourceType === "raw" ? "application/pdf" : "image/png");
      dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const body = await req.json();
      dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
      folder = cloudinaryFolder(typeof body.folder === "string" ? body.folder : "play");
      resourceType = body.resourceType === "raw" ? "raw" : "image";

      if (!dataUrl.startsWith("data:")) {
        return jsonError("Invalid dataUrl", 400);
      }

      buffer = parseDataUrl(dataUrl).buffer;
      if (resourceType === "raw" && buffer.length > MAX_PRINTABLE_PDF_BYTES) {
        return jsonError("PDF trop volumineux (max 20 Mo).", 413);
      }
    }

    let url: string;
    if (isCloudinaryConfigured()) {
      url = await uploadBuffer(buffer, { folder, resourceType });
    } else if (dataUrl.length <= MAX_INLINE_DATA_URL) {
      url = dataUrl;
    } else {
      return jsonError(
        "Cloudinary non configuré. Ajoutez CLOUDINARY_* dans .env.local ou réduisez le fichier.",
        400,
      );
    }

    if (url.startsWith("data:")) {
      return jsonError("Upload Cloudinary échoué — URL invalide retournée.", 500);
    }

    return jsonOk({ url });
  } catch (error) {
    return handleRouteError(error);
  }
}
