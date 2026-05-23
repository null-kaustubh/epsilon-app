/**
 * Browser API base URL.
 *
 * In production we route through /api (Next.js rewrite) so cookies are
 * first-party. Direct calls to api.yourdomain.com are blocked or partitioned
 * by Brave Shields and strict third-party cookie policies.
 */
export function getBrowserApiBase(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  }

  return "/api";
}
