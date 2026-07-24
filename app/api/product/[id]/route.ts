import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { requireAdmin } from "@/lib/auth";
import { productToDashboard, dashboardToProductFields } from "@/lib/product-mapper";
import { parseProductFormData } from "@/lib/form-parse";
import { jsonOk, jsonCached, jsonMsg, jsonError, handleRouteError } from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return jsonError("Product not found", 404);
    return jsonCached(productToDashboard(product.toObject()), 30, 300);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    await connectDB();
    const { id } = await params;
    const contentType = req.headers.get("content-type") ?? "";

    let fields: Record<string, unknown>;
    if (contentType.includes("multipart/form-data")) {
      fields = await parseProductFormData(await req.formData());
    } else {
      const body = await req.json();
      fields = { ...body };
      if (Array.isArray(body.pictures) && body.pictures.length > 0) {
        const { uploadDataUrlOptional } = await import("@/lib/cloudinary");
        const keep: string[] = [];
        const uploaded: string[] = [];
        for (const pic of body.pictures) {
          if (typeof pic === "string" && pic.startsWith("http")) {
            keep.push(pic);
          } else if (typeof pic === "string") {
            const url = await uploadDataUrlOptional(pic, "products");
            if (url.startsWith("http")) uploaded.push(url);
          }
        }
        const httpPictures = [...keep, ...uploaded];
        if (httpPictures.length) fields.img = httpPictures;
        else delete fields.pictures;
      }
    }

    const update = dashboardToProductFields(fields);

    const product = await Product.findById(id);
    if (!product) return jsonError("Product not found", 404);

    const scalarKeys = [
      "name", "sku", "price", "description", "age_plus", "age", "ageTranche",
      "isEducational", "category", "tags", "sizes", "rating", "stock", "articles",
      "characteristics", "character", "warning", "whyLoveIt", "qa",
      "isBook", "isTrending", "hasMultipleColors", "colors",
    ] as const;

    for (const key of scalarKeys) {
      if (update[key] !== undefined) {
        product.set(key, update[key]);
      }
    }
    if (Array.isArray(update.colors)) product.markModified("colors");
    if (fields.img && Array.isArray(fields.img) && fields.img.length) {
      product.set("img", fields.img as string[]);
    }

    await product.save();
    return jsonMsg("Update success", 202);
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
    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) return jsonError("Bad request", 400);
    return jsonMsg("product deleted", 202);
  } catch (error) {
    return handleRouteError(error);
  }
}
