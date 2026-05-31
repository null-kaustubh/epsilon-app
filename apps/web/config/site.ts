export type NavItem = {
  title: string;
  href: string;
};

export const PRIVACY_CONTACT_EMAIL = "hello@epsilonapp.site";

export const SITE_INFO = {
  name: "epsilon",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://epsilonapp.site",
  ogImage:
    process.env.NEXT_PUBLIC_OG_IMAGE ||
    "https://assets.kaustubh.cloud/images/epsilonog.png",
  description:
    "A fully customizable canvas workspace for individuals to create organized spaces using different types of blocks. Design your workspace your way with complete freedom to arrange, structure, and shape ideas without the clutter.",
  keywords: [
    "epsilon",
    "epsilon app",
    "epsilon workspace",
    "epsilon canvas",
    "customizable canvas workspace",
    "block based workspace",
    "visual workspace app",
    "personal productivity workspace",
    "organized digital workspace",
    "structured canvas app",
    "freeform canvas workspace",
    "drag and drop blocks",
    "modular workspace app",
    "idea organization tool",
    "creative planning workspace",
    "personal knowledge workspace",
    "canvas productivity tool",
    "flexible workspace app",
    "digital organization app",
    "infinite canvas workspace",
    "block editor app",
    "visual thinking tool",
    "workspace for creators",
    "structured productivity app",
  ],
};

export const META_THEME_COLORS = {
  dark: "#0d0d0e",
};

export const MAIN_NAV: NavItem[] = [
  {
    title: "Epsilon",
    href: "/",
  },
];

export const GITHUB_USERNAME = "null-kaustubh";
export const SOURCE_CODE_GITHUB_REPO = "null-kaustubh/epsilon-app.git";
export const SOURCE_CODE_GITHUB_URL =
  "https://github.com/null-kaustubh/epsilon-app.git";
