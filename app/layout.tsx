import type { Metadata } from "next";
import "./globals.css";

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.ajbloks.com";

export const metadata: Metadata = {
  title: "AJBloks",
  description: "AJBloks — Jouets, livres et activités pour enfants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="ajb-api-base" content={apiBase} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
