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
    <div className="flex h-screen bg-muted p-3 gap-3 overflow-hidden">
      {/* ─── Sidebar card ─── */}
      <Sidebar
        spaces={spaces}
        onSpaceCreated={handleSpaceCreated}
        onRequestCreate={openCreateModal}
      />

      {/* ─── Right column ─── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {/* ─── Top bar card ─── */}
        <div
          className="bg-background rounded-2xl border border-border
                      px-6 py-3 flex items-center gap-4 shrink-0"
        >
          {/* Search */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 flex-1 max-w-sm">
            <MagnifyingGlass size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search spaces..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60
                         outline-none w-full"
            />
          </div>

          <div className="flex-1" />

          {/* Right controls */}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
            <Gear size={18} className="text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer relative">
            <Bell size={18} className="text-muted-foreground" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border ml-1">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <User size={16} className="text-accent" weight="bold" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] font-medium text-foreground leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Dashboard card ─── */}
        <div
          className="bg-background rounded-2xl border border-border
                      flex-1 overflow-y-auto p-7"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-7">
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Plan, create, and manage your spaces with ease.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                         bg-accent text-accent-foreground text-sm font-medium
                         cursor-pointer transition-all duration-200
                         hover:-translate-y-px
                         hover:shadow-[0_4px_16px_rgba(253,145,62,0.32)]
                         active:translate-y-0 shrink-0"
            >
              <Plus size={16} weight="bold" />
              New Space
            </button>
          </div>

          {/* ─── Recent Spaces ─── */}
          {recentSpaces.length > 0 ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} weight="duotone" className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Recent Spaces</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSpaces.map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    variant="compact"
                    onClick={() => addRecent(space.slug, space.name)}
                    onRename={() => setModal({ mode: "rename", space })}
                    onDelete={() => handleDeleteSpace(space)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderSimple size={26} className="text-muted-foreground" />
              </div>
              <h2 className="text-base font-medium text-foreground mb-1">
                No recent spaces
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Open a space from the sidebar, or create a new one.
              </p>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg
                           bg-accent text-accent-foreground text-sm font-medium
                           cursor-pointer transition-all duration-200
                           hover:-translate-y-px
                           hover:shadow-[0_4px_16px_rgba(253,145,62,0.32)]"
              >
                <Plus size={14} weight="bold" />
                Create a space
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modals ─── */}
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
  );
}

