import { PlaySection } from "@/lib/models/PlayItem";
import { MAX_PRINTABLE_PDF_DATA_URL_LENGTH } from "@/lib/upload-limits";

const PLAY_SECTIONS: PlaySection[] = ["toys", "diy", "printables", "bobs"];

const MAX_INLINE_DATA_URL = 200_000;

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function assertMediaField(name: string, value: unknown, maxDataUrlLength = MAX_INLINE_DATA_URL) {
  if (typeof value !== "string" || !value) return;
  if (isHttpUrl(value)) return;
  if (value.startsWith("data:") && value.length <= maxDataUrlLength) return;
  if (value.startsWith("data:")) {
    throw new Error(
      `${name} est trop volumineux (max 20 Mo pour un PDF). L'upload Cloudinary a échoué — réessayez ou utilisez un fichier plus petit.`,
    );
  }
}

/** Keep only persisted play fields; reject oversized inline files. */
export function sanitizePlayPayload(body: Record<string, unknown>, section: PlaySection) {
  const data: Record<string, unknown> = { section };

  if (section === "toys") {
    data.videoUrl = String(body.videoUrl ?? "").trim();
    data.toyNames = Array.isArray(body.toyNames)
      ? body.toyNames.map(String).filter(Boolean)
      : [];
    return data;
  }

  if (section === "bobs") {
    data.slot = String(body.slot ?? "");
    data.title = String(body.title ?? "").trim();
    data.videoUrl = String(body.videoUrl ?? "").trim();
    return data;
  }

  data.name = String(body.name ?? "").trim();
  data.tags = String(body.tags ?? "").trim();
  data.description = String(body.description ?? "").trim();
  data.videoUrl = String(body.videoUrl ?? "").trim();

  if (typeof body.coverImage === "string") {
    assertMediaField("Image de couverture", body.coverImage);
    data.coverImage = body.coverImage;
  }

  if (section === "printables") {
    data.pdfName = String(body.pdfName ?? "").trim();
    if (typeof body.pdfUrl === "string") {
      assertMediaField("PDF", body.pdfUrl, MAX_PRINTABLE_PDF_DATA_URL_LENGTH);
      data.pdfUrl = body.pdfUrl;
    }
    data.steps = [];
    return data;
  }

  // diy
  if (typeof body.pdfUrl === "string" && body.pdfUrl.trim()) {
    data.pdfName = String(body.pdfName ?? "").trim();
    assertMediaField("PDF", body.pdfUrl, MAX_PRINTABLE_PDF_DATA_URL_LENGTH);
    data.pdfUrl = body.pdfUrl.trim();
  }
  if (Array.isArray(body.steps)) {
    data.steps = body.steps.map((step) => {
      const s = step as { image?: string; text?: string };
      if (typeof s.image === "string") assertMediaField("Image d'étape", s.image);
      return {
        text: String(s.text ?? "").trim(),
        image: typeof s.image === "string" ? s.image : "",
      };
    });
  } else {
    data.steps = [];
  }

  return data;
}

export function parsePlaySection(value: unknown): PlaySection | null {
  if (typeof value !== "string") return null;
  return PLAY_SECTIONS.includes(value as PlaySection) ? (value as PlaySection) : null;
}
