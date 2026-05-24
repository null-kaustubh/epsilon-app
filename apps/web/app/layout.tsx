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
import Script from "next/script";
import PostHogProvider from "@/components/posthogProvider";

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
  weight: ["400", "400", "600"],
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
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
      {
        url: "https://assets.kaustubh.cloud/images/epsilonog.png",
        width: 1200,
        height: 630,
      },
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
        <PostHogProvider>
          <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
        </PostHogProvider>
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
        <Script
          src="https://script.supademo.com/supademo.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
