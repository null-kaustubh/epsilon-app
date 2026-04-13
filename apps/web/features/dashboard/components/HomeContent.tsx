"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  MagnifyingGlass,
  Bell,
  Gear,
  User,
  FolderSimple,
  PlusCircle,
} from "phosphor-react";
import Sidebar from "./Sidebar";
import SpaceNameModal from "./SpaceNameModal";
import SpaceCard from "./SpaceCard";
import { Space, spacesApi } from "../../../lib/spaces";
import { useRecents } from "../../../hooks/useRecents";

type HomeContentProps = {
  initialSpaces: Space[];
  userEmail: string;
};

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "rename"; space: Space };

export default function HomeContent({
  initialSpaces,
  userEmail,
}: HomeContentProps) {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const { recents, addRecent } = useRecents();
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [loading, setLoading] = useState(false);

  const recentSpaces = recents
    .map((r) => spaces.find((s) => s.slug === r.slug))
    .filter(Boolean) as Space[];

  const handleSpaceCreated = useCallback((space: Space) => {
    setSpaces((prev) => [space, ...prev]);
  }, []);

  function openCreateModal() {
    setModal({ mode: "create" });
  }

  async function handleCreateSpace(name: string) {
    if (loading) return;
    setLoading(true);
    try {
      const space = await spacesApi.createSpace(name);
      handleSpaceCreated(space);
      addRecent(space.slug, space.name);
      setModal({ mode: "closed" });
      router.push(`/spaces/${space.slug}`);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleRenameSpace(name: string) {
    if (modal.mode !== "rename" || loading) return;
    setLoading(true);
    try {
      await spacesApi.updateName(modal.space.slug, name);
      setSpaces((prev) =>
        prev.map((s) => (s.id === modal.space.id ? { ...s, name } : s)),
      );
      setModal({ mode: "closed" });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSpace(space: Space) {
    try {
      await spacesApi.deleteSpace(space.slug);
      setSpaces((prev) => prev.filter((s) => s.id !== space.id));
    } catch {
      // silently fail
    }
  }

  const displayName = userEmail.split("@")[0] ?? "User";

  return (
    <div className="h-screen overflow-y-auto bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        {/* Greeting */}
        <h1 className="text-4xl font-semibold font-head text-foreground tracking-tight text-center">
          Good morning, {displayName}.
        </h1>

        {/* Recently Visited */}
        <div>
          <h2 className="text-lg text-secondary-foreground font-head mb-4">
            Recently visited
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={() => addRecent(space.slug, space.name)}
              />
            ))}
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

          <div className="flex gap-4 overflow-x-auto pb-2">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={() => addRecent(space.slug, space.name)}
                onRename={() => setModal({ mode: "rename", space })}
                onDelete={() => handleDeleteSpace(space)}
              />
            ))}
          </div>
        </div>

        <SpaceNameModal
          open={modal.mode === "create"}
          onClose={() => setModal({ mode: "closed" })}
          onSubmit={handleCreateSpace}
          title="Create a new space"
          submitLabel="Create"
          loading={loading}
        />

        <SpaceNameModal
          open={modal.mode === "rename"}
          onClose={() => setModal({ mode: "closed" })}
          onSubmit={handleRenameSpace}
          initialName={modal.mode === "rename" ? modal.space.name : ""}
          title="Rename space"
          submitLabel="Save"
          loading={loading}
        />
      </div>
    </div>
  );
}
