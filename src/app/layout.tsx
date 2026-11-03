import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { getProfile } from "@/db/queries";
import { siteUrl } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsConsent } from "@/components/analytics-consent";
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
    verification: { google: "y7RQtPLXC_JTNSAq20ntAgbCj2EDqMQyM0KEJXl-iPI" },
    robots: { index: true, follow: true },
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

export const viewport: Viewport = {
  themeColor: "#1f1f1f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  // Dados estruturados: ajudam o Google a ligar o site ao seu nome, GitHub e LinkedIn.
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    url: siteUrl,
    address: { "@type": "PostalAddress", addressLocality: "Brasília", addressRegion: "DF", addressCountry: "BR" },
    sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
  };

  return (
    <html lang="pt-BR" className={mono.variable}>
      <body>
        <script
          type="application/ld+json"
          // "<" escapado para o JSON nunca fechar a tag por engano.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }}
        />
        <Analytics />
        <AnalyticsConsent />
        {children}
      </body>
    </html>
  );
}
