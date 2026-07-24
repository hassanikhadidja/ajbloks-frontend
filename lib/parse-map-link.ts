/** Extract lat/lng from Google Maps / OpenStreetMap share URLs. */
export function parseMapLinkCoords(url: unknown): { lat: number; lng: number } | null {
  if (!url || typeof url !== "string") return null;
  const s = url.trim();
  if (!s) return null;

  const candidates: Array<{ lat: number; lng: number }> = [];

  const push = (lat: number, lng: number) => {
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      candidates.push({ lat, lng });
    }
  };

  const patterns: Array<{ re: RegExp; swap?: boolean }> = [
    { re: /@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:,\d+[.\d]*[a-z])?/gi },
    { re: /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/gi },
    { re: /[?&](?:q|query)=(-?\d+\.?\d*)[,+\s]+(-?\d+\.?\d*)/gi },
    { re: /\/maps\/(?:place|search)\/(-?\d+\.?\d*),\+?(-?\d+\.?\d*)/gi },
    { re: /#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/gi },
    { re: /[?&]mlat=(-?\d+\.?\d*)[^#]*[?&]mlon=(-?\d+\.?\d*)/gi },
    { re: /[?&]mlon=(-?\d+\.?\d*)[^#]*[?&]mlat=(-?\d+\.?\d*)/gi, swap: true },
  ];

  for (const { re, swap } of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s))) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (swap) push(b, a);
      else push(a, b);
    }
  }

  if (!candidates.length) return null;

  const inAlgeria = candidates.find(
    (c) => c.lat >= 18.5 && c.lat <= 37.5 && c.lng >= -9 && c.lng <= 12.5,
  );
  return inAlgeria || candidates[0];
}

export function looksLikeMapUrl(url: unknown): boolean {
  if (!url || typeof url !== "string") return false;
  return /(?:google\.[^/]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl|openstreetmap\.org|osm\.org)/i.test(
    url,
  );
}
