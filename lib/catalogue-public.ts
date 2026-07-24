import { connectDB } from "@/lib/db";
import Catalogue from "@/lib/models/Catalogue";

export type PublicCatalogue = {
  id: string;
  title: string;
  buttonSentence: string;
  picture: string;
  pdfName: string;
  pdfUrl: string;
};

const DL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>';

function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(text: string): string {
  return escHtml(text).replace(/'/g, "&#39;");
}

export function buildCatalogueCardHtml(item: PublicCatalogue): string {
  const pdfUrl = item.pdfUrl || "#";
  return (
    `<article class="catalogue-card">` +
    `<img src="${escAttr(item.picture)}" width="393" height="200" alt="${escAttr(item.title)}">` +
    `<div class="catalogue-caption">` +
    `<h2>${escHtml(item.title)}</h2>` +
    `<button class="catalogue-dl" type="button" data-pdf-url="${escAttr(pdfUrl)}">` +
    `${escHtml(item.buttonSentence)} ${DL_ICON}` +
    `</button></div></article>`
  );
}

export function buildCatalogueGalleryHtml(items: PublicCatalogue[]): string {
  if (!items.length) return '<div class="catalogue-gallery"></div>';
  return (
    `<div class="catalogue-gallery">` +
    items.map(buildCatalogueCardHtml).join("") +
    `</div>`
  );
}

export async function loadPublicCatalogues(): Promise<PublicCatalogue[]> {
  try {
    await connectDB();
    const items = await Catalogue.find().sort({ createdAt: -1 }).lean();
    return items.map((item) => ({
      id: String(item._id),
      title: String(item.title ?? ""),
      buttonSentence: String(item.buttonSentence ?? ""),
      picture: String(item.picture ?? ""),
      pdfName: String(item.pdfName ?? "catalogue.pdf"),
      pdfUrl: String(item.pdfUrl ?? "#"),
    }));
  } catch {
    return [];
  }
}
