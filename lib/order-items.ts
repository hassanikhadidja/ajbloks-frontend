import mongoose from "mongoose";
import Product from "@/lib/models/Product";
import { parseProductColors } from "@/lib/product-mapper";

export interface OrderItemColor {
  name?: string;
  hex: string;
}

export interface SanitizedOrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  selectedColor?: OrderItemColor;
}

function normalizeHex(value: unknown): string {
  const raw = String(value ?? "").trim();
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : "";
}

export function parseSelectedColor(input: unknown): OrderItemColor | undefined {
  if (!input || typeof input !== "object") return undefined;
  const row = input as Record<string, unknown>;
  const hex = normalizeHex(row.hex);
  if (!hex) return undefined;
  return {
    name: String(row.name ?? "").trim(),
    hex,
  };
}

export function sanitizeOrderItem(raw: unknown): SanitizedOrderItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const name = String(item.name ?? "").trim();
  const price = Number(item.price);
  const quantity = Math.max(1, Number(item.quantity) || 1);
  if (!name || !Number.isFinite(price)) return null;

  const rawProductId = item.productId;
  const productId =
    typeof rawProductId === "string" &&
    mongoose.Types.ObjectId.isValid(rawProductId) &&
    /^[a-f0-9]{24}$/i.test(rawProductId)
      ? rawProductId
      : undefined;

  const row: SanitizedOrderItem = {
    name,
    price,
    quantity,
    img: String(item.img ?? ""),
  };
  if (productId) row.productId = productId;

  const selectedColor = parseSelectedColor(item.selectedColor);
  if (selectedColor) row.selectedColor = selectedColor;

  return row;
}

function colorMatchesProduct(color: OrderItemColor, productColors: { name?: string; hex: string }[]) {
  return productColors.some((c) => c.hex.toUpperCase() === color.hex.toUpperCase());
}

export async function validateAndSanitizeOrderItems(
  items: unknown[],
): Promise<{ items: SanitizedOrderItem[] } | { error: string; status: number }> {
  if (!Array.isArray(items) || !items.length) {
    return { error: "Order must have at least one item", status: 400 };
  }

  const sanitized = items
    .map(sanitizeOrderItem)
    .filter((item): item is SanitizedOrderItem => Boolean(item));

  if (!sanitized.length) {
    return { error: "Invalid order items", status: 400 };
  }

  const productIds = [
    ...new Set(sanitized.map((item) => item.productId).filter((id): id is string => Boolean(id))),
  ];

  const productsById = new Map<string, { hasMultipleColors: boolean; colors: { name?: string; hex: string }[] }>();
  if (productIds.length) {
    const docs = await Product.find({ _id: { $in: productIds } })
      .select("hasMultipleColors colors")
      .lean();
    docs.forEach((doc) => {
      const id = String(doc._id);
      const colors = parseProductColors(doc.colors);
      productsById.set(id, {
        hasMultipleColors: Boolean(doc.hasMultipleColors) && colors.length > 0,
        colors,
      });
    });
  }

  for (const item of sanitized) {
    if (!item.productId) continue;
    const product = productsById.get(item.productId);
    if (!product) {
      return { error: `Produit introuvable pour « ${item.name} »`, status: 400 };
    }

    if (product.hasMultipleColors) {
      if (!item.selectedColor) {
        return {
          error: `Choisissez une couleur pour « ${item.name} »`,
          status: 400,
        };
      }
      if (!colorMatchesProduct(item.selectedColor, product.colors)) {
        return {
          error: `Couleur invalide pour « ${item.name} »`,
          status: 400,
        };
      }
      const matched = product.colors.find((c) => c.hex.toUpperCase() === item.selectedColor!.hex.toUpperCase());
      if (matched?.name && !item.selectedColor.name) {
        item.selectedColor.name = matched.name;
      }
    } else if (item.selectedColor) {
      delete item.selectedColor;
    }
  }

  return { items: sanitized };
}
