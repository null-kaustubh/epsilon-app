import { cookies } from "next/headers";
import HomeContent from "../../features/dashboard/components/HomeContent";
import { Space } from "../../lib/spaces";
import { redirect } from "next/navigation";
import { serverFetch } from "../../lib/server-api";

export const dynamic = "force-dynamic";

async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get("session_id")?.value ?? "";
}

async function getSpaces(session: string): Promise<Space[]> {
  try {
    const res = await serverFetch("/spaces", session, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("[home] GET /spaces failed:", res.status);
      return [];
    }
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch (err) {
    console.error("[home] GET /spaces error:", err);
    return [];
  }
}

async function getUser(
  session: string,
): Promise<{ id: string; email: string; username: string } | null> {
  try {
    const res = await serverFetch("/auth/me", session, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error("[home] GET /auth/me failed:", res.status);
      return null;
    }
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error("[home] GET /auth/me error:", err);
    return null;
  }
}

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/signin");
  const [spaces, user] = await Promise.all([
    getSpaces(session),
    getUser(session),
  ]);
  if (!user) redirect("/signin");
  return <HomeContent initialSpaces={spaces} username={user.username} />;
}
