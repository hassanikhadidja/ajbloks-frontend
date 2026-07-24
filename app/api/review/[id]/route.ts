import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import { requireAdmin } from "@/lib/auth";
import { jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (body.action === "accept") {
      const review = await Review.findByIdAndUpdate(
        id,
        { status: "published" },
        { new: true },
      );
      if (!review) return jsonError("Review not found", 404);
      return jsonMsg("Review published", 200, { review });
    }

    await Review.findByIdAndUpdate(id, body, { new: true });
    return jsonMsg("Review updated", 202);
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
    const result = await Review.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Review not found", 404);
    return jsonMsg("Review deleted", 200);
  } catch (error) {
    return handleRouteError(error);
  }
}
