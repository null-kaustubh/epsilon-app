import { cookies } from "next/headers";
import HomeContent from "../../features/dashboard/components/HomeContent";
import { Space } from "../../lib/spaces";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get("session_id")?.value ?? "";
}

async function getSpaces(session: string): Promise<Space[]> {
  try {
    const res = await fetch(`${process.env.API_URL}/spaces`, {
      headers: { Cookie: `session_id=${session}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch {
    return [];
  }
}

async function getUser(
  session: string,
): Promise<{ id: string; email: string; username: string } | null> {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: { Cookie: `session_id=${session}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
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
