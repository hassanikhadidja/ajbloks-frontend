import { uploadDataUrl, uploadMany } from "@/lib/cloudinary";

export async function parseProductFormData(formData: FormData) {
  const fields: Record<string, unknown> = {};
  const files: { buffer: Buffer; mimetype: string; fieldname: string }[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({ buffer, mimetype: value.type, fieldname: key });
      continue;
    }
    if (typeof value === "string") {
      if (key === "keepImgs") {
        const existing = fields.keepImgs as string[] | undefined;
        fields.keepImgs = existing ? [...existing, value] : [value];
      } else if (key === "articles" || key === "whyLoveIt" || key === "tags" || key === "sizes") {
        try {
          fields[key] = JSON.parse(value);
        } catch {
          fields[key] = value.split("\n").map((l) => l.trim()).filter(Boolean);
        }
      } else if (key === "qa") {
        try {
          fields.qa = JSON.parse(value);
        } catch {
          fields.qa = [];
        }
      } else if (key === "pictures") {
        try {
          fields.pictures = JSON.parse(value);
        } catch {
          fields.pictures = [value];
        }
      } else if (["price", "stock", "rating", "age_plus", "nbr_commande"].includes(key)) {
        fields[key] = Number(value);
      } else if (key === "isBook" || key === "isEducational" || key === "isTrending" || key === "hasMultipleColors") {
        fields[key] = value === "true" || value === "on";
      } else if (key === "colors") {
        try {
          fields.colors = JSON.parse(value);
        } catch {
          fields.colors = [];
        }
      } else {
        fields[key] = value;
      }
    }
  }

  const newUrls = files.length ? await uploadMany(files) : [];

  const keepImgs = (fields.keepImgs as string[]) ?? [];
  const existingPictures = (fields.pictures as string[]) ?? [];
  const dataUrlPictures: string[] = [];

  for (const pic of existingPictures) {
    if (typeof pic === "string" && pic.startsWith("data:")) {
      dataUrlPictures.push(await uploadDataUrl(pic));
    } else if (typeof pic === "string" && pic.startsWith("http")) {
      keepImgs.push(pic);
    }
  }

  fields.img = [...keepImgs, ...dataUrlPictures, ...newUrls];
  fields.pictures = fields.img;

  return fields;
}
