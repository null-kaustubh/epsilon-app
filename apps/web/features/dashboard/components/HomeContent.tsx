"use client";

import { useCallback, useState, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { Moon, PlusCircle, Power, Sun } from "phosphor-react";
import SpaceCard from "./SpaceCard";
import { Space, spacesApi } from "../../../lib/spaces";
import { useRecents } from "../../../hooks/useRecents";
import { logout } from "../../../lib/api";
import { ThemeContext } from "../../../context/ThemeProvider";
import { SpaceCardSkeleton } from "./SpaceCardSkeleton";
import UndoToast from "./UndoToast";

type HomeContentProps = {
  initialSpaces: Space[];
  userEmail: string;
};

// ghost space object
const ghostSpace: Space = {
  id: "__new__",
  user_id: "",
  name: "",
  slug: "",
  description: "",
  icon_url: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

type PendingDelete = { space: Space; id: number };

export default function HomeContent({
  initialSpaces,
  userEmail,
}: HomeContentProps) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const { recents, addRecent, removeRecent, hydrated } = useRecents();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<PendingDelete[]>([]);
  const toastCounter = useRef(0);

  const recentSpaces = recents
    .map((r) => spaces.find((s) => s.slug === r.slug))
    .filter(Boolean) as Space[];

  const handleSpaceCreated = useCallback((space: Space) => {
    setSpaces((prev) => [space, ...prev]);
  }, []);

  function openCreateModal() {
    setCreating(true);
  }

  async function handleCreateSpace(
    name: string,
    description: string,
    iconUrl: string,
  ) {
    if (loading) return;
    setLoading(true);
    setCreating(false);
    try {
      const space = await spacesApi.createSpace(name, description);
      if (iconUrl) {
        await spacesApi.updateName(space.slug, name, description, iconUrl);
      }
      handleSpaceCreated({ ...space, icon_url: iconUrl });
      addRecent(space.slug, space.name);
      router.push(`/spaces/${space.slug}`);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameSpace(
    space: Space,
    name: string,
    description: string,
    iconUrl: string,
  ) {
    try {
      await spacesApi.updateName(space.slug, name, description, iconUrl);
      setSpaces((prev) =>
        prev.map((s) =>
          s.id === space.id
            ? { ...s, name, description, icon_url: iconUrl }
            : s,
        ),
      );
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSpace(space: Space) {
    const id = toastCounter.current++;
    setPendingDeletes((prev) => [...prev, { space, id }]);
  }

  function handleUndo(id: number) {
    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleExpire(id: number, space: Space) {
    setPendingDeletes((prev) => prev.filter((p) => p.id !== id));
    setSpaces((prev) => prev.filter((s) => s.id !== space.id));
    removeRecent(space.slug);

    try {
      await spacesApi.deleteSpace(space.slug); // actual delete on expire
    } catch {
      //silently fail
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/signin");
  }

  const themeContext = useContext(ThemeContext);
  if (!themeContext) return null;

  const { theme, handleChange } = themeContext;
  const isDark = theme === "dark";

  const displayName = userEmail.split("@")[0] ?? "User";

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        {/* Greeting */}
        <h1 className="text-4xl font-semibold font-head text-foreground tracking-tight text-center">
          Good morning, {displayName}
          <span className="text-accent">.</span>
        </h1>

        {/* Recently Visited */}
        <div>
          <h2 className="text-lg text-secondary-foreground font-head mb-4">
            Recently visited
          </h2>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {!hydrated ? (
              // show 2 skeletons while computing recents
              Array.from({ length: 2 }).map((_, i) => (
                <SpaceCardSkeleton key={i} />
              ))
            ) : recentSpaces.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent spaces.</p>
            ) : (
              recentSpaces.map((space) => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  onClick={() => addRecent(space.slug, space.name)}
                />
              ))
            )}
          </div>
        </div>

        {/* Your Spaces */}
        <div>
          <div className="flex items-center mb-4 gap-3">
            <h2 className="text-lg text-secondary-foreground font-head">
              Your spaces
            </h2>

            <button
              onClick={openCreateModal}
              className="rounded-md text-accent flex items-center justify-center cursor-pointer"
            >
              <PlusCircle size={20} />
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {creating && (
              <SpaceCard
                space={ghostSpace}
                isNew
                onRename={(name, description, iconUrl) =>
                  handleCreateSpace(name, description, iconUrl)
                }
                onCancel={() => setCreating(false)}
              />
            )}
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={() => addRecent(space.slug, space.name)}
                onRename={(name, description, iconUrl) =>
                  handleRenameSpace(space, name, description, iconUrl)
                }
                isPendingDelete={pendingDeletes.some(
                  (p) => p.space.id === space.id,
                )}
                onDelete={() => handleDeleteSpace(space)}
              />
            ))}
          </div>
        </div>

        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 
                border-border rounded-xl px-3 py-2 bg-background/80 backdrop-blur-md border shadow-sm
                hover:bg-muted/70 transition-opacity cursor-pointer"
        >
          <button
            type="button"
            onClick={handleChange}
            aria-label="Toggle theme"
            className="text-sm text-muted-foreground hover:text-accent transition-[color] cursor-pointer"
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="text-sm text-muted-foreground hover:text-accent transition-[color] cursor-pointer"
          >
            <Power size={22} />
          </button>
        </div>
      </div>
      <div className="fixed bottom-20 left-0 right-0 z-9999 flex flex-col-reverse items-center gap-2 pointer-events-none">
        {pendingDeletes.map(({ space, id }) => (
          <div key={id} className="pointer-events-auto">
            <UndoToast
              spaceName={space.name}
              onUndo={() => handleUndo(id)}
              onExpire={() => handleExpire(id, space)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
