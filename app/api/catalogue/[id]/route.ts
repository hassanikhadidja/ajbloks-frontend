import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Catalogue from "@/lib/models/Catalogue";
import { requireAdmin } from "@/lib/auth";
import { uploadBuffer, uploadDataUrl } from "@/lib/cloudinary";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (typeof body.picture === "string" && body.picture.startsWith("data:")) {
      body.picture = await uploadDataUrl(body.picture, "catalogues");
    }
    if (typeof body.pdfUrl === "string" && body.pdfUrl.startsWith("data:")) {
      body.pdfUrl = await uploadDataUrl(body.pdfUrl, "catalogues-pdf");
    }

    await Catalogue.findByIdAndUpdate(id, body, { new: true });
    return jsonMsg("Catalogue updated", 202);
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
    const result = await Catalogue.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Catalogue not found", 404);
    return jsonMsg("Catalogue deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
