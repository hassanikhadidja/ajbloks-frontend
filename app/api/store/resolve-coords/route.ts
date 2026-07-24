import { connectDB } from "@/lib/db";
import Store from "@/lib/models/Store";
import { jsonOk, handleRouteError } from "@/lib/api-utils";
import { isPlausibleAlgeriaCoord, resolveStoreCoords } from "@/lib/geocode";
import { looksLikeMapUrl } from "@/lib/parse-map-link";

/**
 * Public helper for Find Us: ensure stores have lat/lng for pins.
 * Geocodes missing coords from mapLink / location and persists them.
 */
export async function POST() {
  try {
    await connectDB();
    const stores = await Store.find().sort({ createdAt: -1 });
    const results = [];

    for (const store of stores) {
      const obj = store.toObject();
      const hasGood =
        typeof obj.lat === "number" &&
        typeof obj.lng === "number" &&
        isPlausibleAlgeriaCoord(obj.lat, obj.lng);

      let mapLink = String(obj.mapLink || "").trim();
      const website = String(obj.website || "").trim();
      if (!mapLink && looksLikeMapUrl(website)) mapLink = website;

      if (!hasGood) {
        const resolved = await resolveStoreCoords({
          mapLink,
          location: String(obj.location || ""),
          name: String(obj.name || ""),
          lat: obj.lat,
          lng: obj.lng,
        });
        if (resolved.lat != null && resolved.lng != null) {
          store.lat = resolved.lat;
          store.lng = resolved.lng;
          if (!store.mapLink && mapLink) store.mapLink = mapLink;
          await store.save();
          obj.lat = resolved.lat;
          obj.lng = resolved.lng;
          obj.mapLink = store.mapLink;
        }
        // Avoid hammering Google/Nominatim
        await new Promise((r) => setTimeout(r, 400));
      }

      results.push({
        id: String(obj._id),
        _id: String(obj._id),
        name: obj.name,
        location: obj.location,
        website: obj.website ?? "",
        mapLink: obj.mapLink ?? "",
        storeType: obj.storeType ?? "",
        lat: typeof obj.lat === "number" ? obj.lat : null,
        lng: typeof obj.lng === "number" ? obj.lng : null,
      });
    }

    results.sort((a, b) => {
      const au = /^usine\s*aj\s*bloks/i.test(String(a.name || "").trim()) ? 1 : 0;
      const bu = /^usine\s*aj\s*bloks/i.test(String(b.name || "").trim()) ? 1 : 0;
      return bu - au;
    });

    return jsonOk(results);
  } catch (error) {
    return handleRouteError(error);
  }
}
