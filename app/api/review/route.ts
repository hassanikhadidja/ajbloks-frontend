import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import { requireAdmin } from "@/lib/auth";
import { uploadDataUrl } from "@/lib/cloudinary";
import { jsonOk, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

function reviewToDashboard(doc: object) {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d._id),
    _id: String(d._id),
    status: d.status,
    userName: d.userName,
    productName: d.productName,
    productId: d.productId || "",
    stars: d.stars,
    comment: d.comment,
    photos: d.photos ?? [],
    date: d.date,
  };
}

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const productId = req.nextUrl.searchParams.get("productId")?.trim() || "";
    const productName = req.nextUrl.searchParams.get("productName")?.trim() || "";
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (status === "pending" || status === "published") {
      filter.status = status;
    }
    if (productId) {
      filter.productId = productId;
    } else if (productName) {
      filter.productName = productName;
    }
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    return jsonOk(reviews.map((r) => reviewToDashboard(r.toObject())));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const photos: string[] = [];
    for (const pic of body.photos ?? []) {
      if (typeof pic === "string" && pic.startsWith("data:")) {
        photos.push(await uploadDataUrl(pic, "reviews"));
      } else if (typeof pic === "string") {
        photos.push(pic);
      }
    }

    const review = await Review.create({
      status: body.status === "published" ? "published" : "pending",
      userName: body.userName,
      productName: body.productName,
      productId: String(body.productId || "").trim(),
      stars: body.stars,
      comment: body.comment,
      photos,
      date: body.date ?? new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });

    return jsonMsg("Review created", 201, { id: String(review._id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
