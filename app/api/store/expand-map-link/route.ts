import { NextRequest } from "next/server";
import { jsonOk, jsonError, handleRouteError } from "@/lib/api-utils";
import { expandMapLink, isPlausibleAlgeriaCoord } from "@/lib/geocode";
import { parseMapLinkCoords } from "@/lib/parse-map-link";

/** Expand Google short map links and return final URL + coords when possible. */
export async function GET(req: NextRequest) {
  try {
    const url = String(req.nextUrl.searchParams.get("url") || "").trim();
    if (!url) return jsonError("url required", 400);

    const expanded = await expandMapLink(url);
    const coords = parseMapLinkCoords(expanded);
    if (coords && isPlausibleAlgeriaCoord(coords.lat, coords.lng)) {
      return jsonOk({
        url: expanded,
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    return jsonOk({ url: expanded, lat: null, lng: null });
  } catch (error) {
    return handleRouteError(error);
  }
}
