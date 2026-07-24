/**
 * One-off migration: move product images stored as base64 data: URLs in
 * MongoDB to Cloudinary, replacing them with hosted URLs.
 *
 * Usage: node scripts/migrate-data-url-images.mjs
 */
import fs from "node:fs";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Minimal .env loader (KEY="value" lines), matching Next's env files.
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const uri = process.env.uri || process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MongoDB URI");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

await mongoose.connect(uri, { bufferCommands: false });
const Product = mongoose.connection.collection("products");

// The DB field is `img` (mapped to `pictures` in API responses).
const cursor = Product.find({ img: { $elemMatch: { $regex: "^data:" } } });
let migrated = 0;
for await (const doc of cursor) {
  const next = [];
  let changed = false;
  for (const pic of doc.img || []) {
    if (typeof pic === "string" && pic.startsWith("data:")) {
      console.log(`Uploading inline image of "${doc.name}" (${Math.round(pic.length / 1024)} KB)…`);
      const result = await cloudinary.uploader.upload(pic, { folder: "ajbloks" });
      next.push(result.secure_url);
      changed = true;
    } else {
      next.push(pic);
    }
  }
  if (changed) {
    await Product.updateOne({ _id: doc._id }, { $set: { img: next } });
    migrated++;
    console.log(`Updated "${doc.name}" -> ${next.length} hosted image(s).`);
  }
}
console.log(`Done. Migrated ${migrated} product(s).`);
await mongoose.disconnect();
