import { parseMapLinkCoords } from "@/lib/parse-map-link";

const ALGERIA_BIAS = ", Algeria";

export function isPlausibleAlgeriaCoord(lat: number, lng: number) {
  return lat >= 18.5 && lat <= 37.5 && lng >= -9 && lng <= 12.5;
}

/** Follow Google short map links (maps.app.goo.gl) to the final maps URL. */
export async function expandMapLink(url: string): Promise<string> {
  const s = String(url || "").trim();
  if (!s) return "";
  if (!/(?:maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(s)) return s;

  try {
    const res = await fetch(s, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AJBLOKS-FindUs/1.0)",
        Accept: "text/html,*/*",
      },
      cache: "no-store",
    });

    const location = res.headers.get("location") || "";
    if (location) {
      if (location.startsWith("http")) return location;
      try {
        return new URL(location, s).toString();
      } catch {
        return location;
      }
    }

    // Some environments auto-follow; use final URL if available
    if (res.url && res.url !== s) return res.url;
  } catch {
    // ignore
  }

  try {
    const res = await fetch(s, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AJBLOKS-FindUs/1.0)",
      },
      cache: "no-store",
    });
    if (res.url) return res.url;
  } catch {
    // ignore
  }

  return s;
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const q = String(address || "").trim();
  if (!q) return null;

  const variants = Array.from(
    new Set(
      [
        q,
        q + ALGERIA_BIAS,
        q.replace(/,/g, " "),
        // Prefer city/wilaya tail: "Khraïcia, Alger"
        q
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .slice(-2)
          .join(", "),
        q
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
          .slice(-1)[0],
      ]
        .map((v) => String(v || "").trim())
        .filter(Boolean),
    ),
  );

  for (const query of variants) {
    const withCountry = /alger|algeria|algérie/i.test(query) ? query : query + ALGERIA_BIAS;
    const url =
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=dz&q=" +
      encodeURIComponent(withCountry);

    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "AJBLOKS-FindUs/1.0 (find-us store locator)",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
      if (!Array.isArray(data) || !data[0]) continue;
      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      if (!isPlausibleAlgeriaCoord(lat, lng)) continue;
      return { lat, lng };
    } catch {
      // try next variant
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  return null;
}

export async function resolveStoreCoords(input: {
  mapLink?: string;
  location?: string;
  name?: string;
  lat?: unknown;
  lng?: unknown;
}): Promise<{ lat: number | null; lng: number | null }> {
  const latN = Number(input.lat);
  const lngN = Number(input.lng);
  if (
    Number.isFinite(latN) &&
    Number.isFinite(lngN) &&
    isPlausibleAlgeriaCoord(latN, lngN)
  ) {
    return { lat: latN, lng: lngN };
  }

  const rawLink = String(input.mapLink || "").trim();
  if (rawLink) {
    const expanded = await expandMapLink(rawLink);
    const fromExpanded = parseMapLinkCoords(expanded);
    if (fromExpanded && isPlausibleAlgeriaCoord(fromExpanded.lat, fromExpanded.lng)) {
      return fromExpanded;
    }
    const fromRaw = parseMapLinkCoords(rawLink);
    if (fromRaw && isPlausibleAlgeriaCoord(fromRaw.lat, fromRaw.lng)) {
      return fromRaw;
    }
  }

  const location = String(input.location || "").trim();
  const name = String(input.name || "").trim();
  const fromAddress = await geocodeAddress(location);
  if (fromAddress) return fromAddress;

  if (name && location) {
    const fromNamed = await geocodeAddress(name + ", " + location);
    if (fromNamed) return fromNamed;
  }

  if (name) {
    const fromName = await geocodeAddress(name + ALGERIA_BIAS);
    if (fromName) return fromName;
  }

  return { lat: null, lng: null };
}
