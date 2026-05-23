export function getServerApiUrl(): string {
  const url =
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";
  if (!url) {
    throw new Error("API_URL or NEXT_PUBLIC_API_URL must be set");
  }
  return url.replace(/\/$/, "");
}

export function serverFetch(
  path: string,
  session: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${getServerApiUrl()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: `session_id=${session}`,
    },
    cache: "no-store",
  });
}
