import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const apiOrigin =
  process.env.API_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const apiOriginForCSP = apiOrigin ?? "";

const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://*.sentry.io",
    "https://*.supademo.com",
    "https://*.posthog.com",
    "https://us-assets.i.posthog.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    "https://*.amazonaws.com",
    "https://assets.kaustubh.cloud",
    "https://startupfa.me",
    "https://twelve.tools",
    "https://*.sentry.io",
  ],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    apiOriginForCSP,
    "https://*.ingest.sentry.io",
    "https://*.ingest.us.sentry.io",
    "https://*.amazonaws.com",
    "https://*.supademo.com",
    "https://*.posthog.com",
    "https://us.i.posthog.com",
  ].filter(Boolean),
  "worker-src": ["'self'", "blob:"],
  "frame-src": ["https://*.supademo.com"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "upgrade-insecure-requests": [],
};

const buildCSP = (directives: Record<string, string[]>) =>
  Object.entries(directives)
    .map(([key, values]) =>
      values.length ? `${key} ${values.join(" ")}` : key,
    )
    .join("; ");

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiOrigin) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "epsilon-uploads-prod.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "assets.kaustubh.cloud",
      },
      { protocol: "https", hostname: "startupfa.me" },
      { protocol: "https", hostname: "twelve.tools" },
      { protocol: "https", hostname: "cdn.openhunts.com" },
    ],
  },
  allowedDevOrigins: ["192.168.29.106"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: isProd
              ? "Content-Security-Policy"
              : "Content-Security-Policy-Report-Only",
            value: buildCSP(cspDirectives),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          ...(isProd
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "epsilon-0b",
  project: "epsilon-frontend",
  silent: true,
});
