import NewsletterEmail, {
  type NewsletterSource,
} from "@/lib/models/NewsletterEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

export function isValidNewsletterEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function toNewsletterDto(doc: {
  _id?: unknown;
  id?: unknown;
  email?: unknown;
  name?: unknown;
  source?: unknown;
  accepted?: unknown;
  userId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}) {
  return {
    id: String(doc._id || doc.id || ""),
    _id: String(doc._id || doc.id || ""),
    email: String(doc.email || ""),
    name: String(doc.name || ""),
    source: String(doc.source || "footer"),
    accepted: doc.accepted !== false,
    userId: String(doc.userId || ""),
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

type UpsertOpts = {
  email: string;
  name?: string;
  source?: NewsletterSource;
  accepted?: boolean;
  userId?: string;
};

/** Upsert by email. Account preference always wins for `accepted` when linked. */
export async function upsertNewsletterEmail(opts: UpsertOpts) {
  const email = normalizeNewsletterEmail(opts.email);
  if (!isValidNewsletterEmail(email)) {
    throw new Error("Adresse e-mail invalide");
  }

  const existing = await NewsletterEmail.findOne({ email });
  const name = String(opts.name ?? "").trim().slice(0, 120);
  const source = opts.source || "footer";
  const accepted = opts.accepted !== false;
  const userId = String(opts.userId ?? "").trim();

  if (!existing) {
    return NewsletterEmail.create({
      email,
      name,
      source,
      accepted,
      userId,
    });
  }

  if (name) existing.name = name;
  if (userId) existing.userId = userId;
  // Prefer keeping account source once linked; otherwise update source.
  if (source === "account" || existing.source !== "account") {
    existing.source = source;
  }
  existing.accepted = accepted;
  await existing.save();
  return existing;
}

export async function syncAccountMarketingEmail(opts: {
  email: string;
  name?: string;
  userId: string;
  marketingEmail: boolean;
}) {
  return upsertNewsletterEmail({
    email: opts.email,
    name: opts.name,
    userId: opts.userId,
    source: "account",
    accepted: opts.marketingEmail !== false,
  });
}
