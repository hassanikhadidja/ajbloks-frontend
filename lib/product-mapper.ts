export function parseAgePlus(age: string | number | undefined): number {
  if (typeof age === "number") return age;
  if (!age) return 3;
  const match = String(age).match(/(\d+)/);
  return match ? Number(match[1]) : 3;
}

export function formatAgePlus(agePlus: number): string {
  return `${agePlus}Y+`;
}

export function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((t) => String(t).trim()).filter(Boolean);
  }
  if (!input) return [];
  return String(input)
    .split(/[\n,]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function normalizeHex(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const hex = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.toUpperCase() : "";
}

export function parseBool(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

export function parseProductColors(input: unknown): { name: string; hex: string }[] {
  if (typeof input === "string") {
    try {
      input = JSON.parse(input);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const hex = normalizeHex(row.hex);
      if (!hex) return null;
      return {
        name: String(row.name ?? "").trim(),
        hex,
      };
    })
    .filter((item): item is { name: string; hex: string } => Boolean(item));
}

export interface DashboardProduct {
  id?: string;
  _id?: string;
  name: string;
  price: string | number;
  description: string;
  articles?: string[];
  characteristics?: string;
  age?: string;
  ageTranche?: string;
  category: string;
  character?: string;
  tags?: string[];
  warning?: string;
  pictures?: string[];
  whyLoveIt?: string[];
  qa?: { q: string; a: string }[];
  isBook?: boolean;
  isTrending?: boolean;
  hasMultipleColors?: boolean;
  colors?: { name?: string; hex: string }[];
  sku?: string;
  stock?: number;
  rating?: number;
}

export function productToDashboard(doc: object): DashboardProduct {
  const d = doc as Record<string, unknown>;
  const id = String(d._id ?? d.id ?? "");
  const colors = parseProductColors(d.colors);
  const hasMultipleColors = Boolean(d.hasMultipleColors) && colors.length > 0;
  return {
    id,
    _id: id,
    name: String(d.name ?? ""),
    price: String(d.price ?? ""),
    description: String(d.description ?? ""),
    articles: (d.articles as string[]) ?? [],
    characteristics: String(d.characteristics ?? ""),
    age: d.age ? String(d.age) : formatAgePlus(Number(d.age_plus ?? 3)),
    ageTranche: String(d.ageTranche ?? ""),
    category: String(d.category ?? ""),
    character: String(d.character ?? ""),
    tags: (d.tags as string[]) ?? [],
    warning: String(d.warning ?? ""),
    pictures: (d.img as string[]) ?? [],
    whyLoveIt: (d.whyLoveIt as string[]) ?? [],
    qa: (d.qa as { q: string; a: string }[]) ?? [],
    isBook: Boolean(d.isBook),
    isTrending: Boolean(d.isTrending),
    hasMultipleColors,
    colors: hasMultipleColors ? colors : [],
    sku: String(d.sku ?? ""),
    stock: Number(d.stock ?? 0),
    rating: Number(d.rating ?? 0),
  };
}

export function dashboardToProductFields(input: Record<string, unknown>) {
  const price = Number(input.price);
  const category = String(input.category ?? "").trim();
  const ageStr = input.age ? String(input.age) : undefined;
  const tags = parseTags(input.tags);
  const colors = parseProductColors(input.colors);
  const wantsMultipleColors = parseBool(input.hasMultipleColors);
  const hasMultipleColors = wantsMultipleColors && colors.length > 0;

  const imgSource = input.pictures ?? input.img ?? [];
  const img = Array.isArray(imgSource)
    ? imgSource.filter((url) => typeof url === "string" && url.trim())
    : [];

  return {
    name: String(input.name ?? ""),
    sku: String(input.sku ?? `SKU-${Date.now()}`),
    price: Number.isFinite(price) ? price : 0,
    description: String(input.description ?? ""),
    img,
    age_plus: parseAgePlus(ageStr ?? Number(input.age_plus ?? 3)),
    age: ageStr ?? formatAgePlus(parseAgePlus(input.age_plus as number)),
    ageTranche: String(input.ageTranche ?? "").trim(),
    isEducational:
      parseBool(input.isBook) ||
      /book|livre|éducat|educat/i.test(category) ||
      tags.some((t) => /book|livre|éducat|educat/i.test(t)),
    category: category || "Autre",
    tags,
    sizes: (input.sizes as string[]) ?? ["standard"],
    rating: Number(input.rating ?? 0),
    stock: Number(input.stock ?? 100),
    articles: (input.articles as string[]) ?? [],
    characteristics: String(input.characteristics ?? ""),
    character: String(input.character ?? "").trim(),
    warning: String(input.warning ?? ""),
    whyLoveIt: (input.whyLoveIt as string[]) ?? [],
    qa: (input.qa as { q: string; a: string }[]) ?? [],
    isBook: parseBool(input.isBook),
    isTrending: parseBool(input.isTrending),
    hasMultipleColors,
    colors: hasMultipleColors ? colors : [],
  };
}

export function generateSku(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  return `AJB-${slug || "PRODUCT"}-${Date.now().toString(36).toUpperCase()}`;
}
