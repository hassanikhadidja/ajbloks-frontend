import { v2 as cloudinary } from "cloudinary";

export const CLOUDINARY_ROOT = "ajbloks";

/** Resolve upload path under the ajbloks Cloudinary folder. */
export function cloudinaryFolder(segment?: string): string {
  if (!segment || segment === CLOUDINARY_ROOT) return CLOUDINARY_ROOT;
  if (segment.startsWith(`${CLOUDINARY_ROOT}/`)) return segment;
  return `${CLOUDINARY_ROOT}/${segment}`;
}

let configured = false;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_NAME &&
      process.env.CLOUDINARY_APIKEY &&
      process.env.CLOUDINARY_APISECRET,
  );
}

function ensureConfig() {
  if (configured) return;
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_APIKEY,
    api_secret: process.env.CLOUDINARY_APISECRET,
  });
  configured = true;
}

export async function uploadBuffer(
  buffer: Buffer,
  options: { folder?: string; resourceType?: "image" | "raw" | "auto" } = {},
): Promise<string> {
  ensureConfig();
  const folder = cloudinaryFolder(options.folder);
  const resourceType = options.resourceType ?? "image";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err || !result?.secure_url) reject(err ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function uploadDataUrl(dataUrl: string, folder?: string): Promise<string> {
  ensureConfig();
  const result = await cloudinary.uploader.upload(dataUrl, { folder: cloudinaryFolder(folder) });
  return result.secure_url;
}

export async function uploadRawDataUrl(dataUrl: string, folder?: string): Promise<string> {
  ensureConfig();
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: cloudinaryFolder(folder),
    resource_type: "raw",
  });
  return result.secure_url;
}

/** Upload when Cloudinary is configured; otherwise keep data URLs for MongoDB. */
export async function uploadDataUrlOptional(dataUrl: string, folder?: string): Promise<string> {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  if (!isCloudinaryConfigured()) return dataUrl;
  try {
    return await uploadDataUrl(dataUrl, folder);
  } catch {
    return dataUrl;
  }
}

export async function uploadRawDataUrlOptional(dataUrl: string, folder?: string): Promise<string> {
  if (!dataUrl.startsWith("data:")) return dataUrl;
  if (!isCloudinaryConfigured()) return dataUrl;
  try {
    return await uploadRawDataUrl(dataUrl, folder);
  } catch {
    return dataUrl;
  }
}

export async function uploadBufferOptional(
  buffer: Buffer,
  options: { folder?: string; resourceType?: "image" | "raw" | "auto"; fallbackDataUrl?: string } = {},
): Promise<string> {
  const fallback = options.fallbackDataUrl ?? "";
  if (!isCloudinaryConfigured()) return fallback;
  try {
    return await uploadBuffer(buffer, {
      folder: cloudinaryFolder(options.folder),
      resourceType: options.resourceType,
    });
  } catch {
    return fallback;
  }
}

export async function uploadMany(
  files: { buffer: Buffer; mimetype: string }[],
  folder?: string,
): Promise<string[]> {
  const resolved = cloudinaryFolder(folder);
  return Promise.all(
    files.map((file) =>
      uploadBuffer(file.buffer, {
        folder: resolved,
        resourceType: file.mimetype === "application/pdf" ? "raw" : "image",
      }),
    ),
  );
}
