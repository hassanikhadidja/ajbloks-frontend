import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { productToDashboard } from "@/lib/product-mapper";
import { parseProductFormData } from "@/lib/form-parse";
import { dashboardToProductFields, generateSku } from "@/lib/product-mapper";
import { jsonOk, jsonCached, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find();
    return jsonCached(products.map((p) => productToDashboard(p.toObject())), 30, 300);
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

    let fields: Record<string, unknown>;
    if (contentType.includes("multipart/form-data")) {
      fields = await parseProductFormData(await req.formData());
    } else {
      const body = await req.json();
      fields = body;
      if (Array.isArray(body.pictures)) {
        const { uploadDataUrlOptional } = await import("@/lib/cloudinary");
        const uploaded: string[] = [];
        for (const pic of body.pictures) {
          if (typeof pic === "string") {
            uploaded.push(await uploadDataUrlOptional(pic, "products"));
          }
        }
        fields.img = uploaded;
        fields.pictures = uploaded;
      }
    }

    const img = (fields.img as string[]) ?? [];
    if (!img.length) return jsonError("At least one image is required", 400);

    const productFields = dashboardToProductFields(fields);
    if (!productFields.sku) productFields.sku = generateSku(productFields.name);

    const product = await Product.create(productFields);
    return jsonMsg("product added", 201, { id: String(product._id) });
  } catch (error) {
    return handleRouteError(error);
  }
}
