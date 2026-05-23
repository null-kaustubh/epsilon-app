import { notFound } from "next/navigation";
import Canvas from "../../../features/canvas/canvas";
import TrackRecent from "../../../features/dashboard/components/TrackRecent";
import { cookies } from "next/headers";
import { serverFetch } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

async function getSpace(slug: string) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session_id")?.value;
    if (!session) return null;

    const res = await serverFetch(`/spaces/${encodeURIComponent(slug)}`, session, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error(`[space] GET /spaces/${slug} failed:`, res.status);
      return null;
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error(`[space] GET /spaces/${slug} error:`, err);
    return null;
  }
}

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSpace(slug);
  if (!data) notFound();

  return (
    <>
      <TrackRecent slug={data.space.slug} name={data.space.name} />

      <div className="hidden pointer-coarse:flex xl:max-[1279px]:flex min-h-dvh items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Desktop only</h2>
          <p className="text-muted-foreground mt-2">
            The canvas is only available on desktop. Please open this page on a
            larger screen.
          </p>
        </div>
      </div>

      <div className="pointer-coarse:hidden xl:pointer-fine:block hidden h-screen">
        <Canvas space={data.space} initialBlocks={data.blocks ?? []} />
      </div>
    </>
  );
}
