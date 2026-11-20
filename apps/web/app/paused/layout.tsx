import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hosted Epsilon is wrapping up",
  description:
    "The public Epsilon instance is shutting down. The project is open source — run it locally from GitHub.",
  alternates: {
    canonical: "/paused",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PausedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
