import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { getProfile } from "@/db/queries";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = `${profile.name} | ${profile.headline}`;
  const description = profile.bio.replace(/\s+/g, " ").slice(0, 160);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${profile.name}` },
    description,
    applicationName: `Portfólio de ${profile.name}`,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: `${profile.name} | Portfólio`,
      title,
      description,
      url: "/",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
