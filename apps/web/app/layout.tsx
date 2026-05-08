import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Fragment_Mono,
  Playfair_Display,
  Inter,
} from "next/font/google";
import clsx from "clsx";
import ThemeProvider, { Theme } from "../context/ThemeProvider";
import { cookies } from "next/headers";
import { neueMontreal } from "../assets/fonts/fonts";
import { SITE_INFO } from "../config/site";
import { Toaster } from "sonner";

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment-mono",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair-display",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "400"],
  style: ["normal", "italic"],
  variable: "--font-bodoniM",
});

const inter = Inter({
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
  variable: "--font-interY",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_INFO.url),
  alternates: {
    canonical: "/",
  },
  title: {
    template: `%s | ${SITE_INFO.name}`,
    default: `Epsilon | Structured Canvas for Your Ideas`,
  },
  description: SITE_INFO.description,
  keywords: SITE_INFO.keywords,
  authors: [
    {
      name: "Kaustubh Sankhe",
      url: "https://kaustubh.cloud",
    },
  ],
  creator: "Kaustubh Sankhe",
  openGraph: {
    title: "Epsilon | Customizable Canvas Workspace",
    description: SITE_INFO.description,
    siteName: SITE_INFO.name,
    url: SITE_INFO.url,
    type: "website",
    images: [
      {
        url: SITE_INFO.ogImage,
        width: 1200,
        height: 630,
        alt: "Epsilon structured customizable canvas workspace",
      },
      { url: "/og-alt.png", width: 1200, height: 630 },
    ],
  },
  twitter: {
    title: "Epsilon | Customizable Canvas Workspace",
    description: SITE_INFO.description,
    card: "summary_large_image",
    creator: "@kaustubh_sankhe",
    images: [SITE_INFO.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedTheme = (await cookies()).get("color-theme")?.value;
  const theme: Theme =
    savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
  return (
    <html
      lang="en"
      className={clsx(
        theme,
        "overflow-hidden antialiased",
        neueMontreal.variable,
        fragmentMono.variable,
        playfairDisplay.variable,
        bodoniModa.variable,
        inter.variable,
      )}
      data-color-theme={theme}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="https://assets.kaustubh.cloud/epsilon/epsilon.svg"
          type="image/svg+xml"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        <Toaster
          position="bottom-center"
          richColors
          toastOptions={{
            style: {
              background: "var(--secondary)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "14px 16px",
              backdropFilter: "blur(12px)",
              boxShadow: "var(--shadow-popover)",
            },
          }}
        />
      </body>
    </html>
  );
}
