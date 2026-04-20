"use client";

import { useCallback, useRef, useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Space, spacesApi } from "../../../lib/spaces";

export type PendingDelete = { space: Space; id: number };

export const ghostSpace: Space = {
  id: "__new__",
  user_id: "",
  name: "",
  slug: "",
  description: "",
  icon_url: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface UseSpacesOptions {
  initialSpaces: Space[];
  router: AppRouterInstance;
  addRecent: (slug: string, name: string) => void;
  removeRecent: (slug: string) => void;
}

export function useSpaces({
  initialSpaces,
  router,
  addRecent,
  removeRecent,
}: UseSpacesOptions) {
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingDeletes, setPendingDeletes] = useState<PendingDelete[]>([]);
  const toastCounter = useRef(0);

  const handleSpaceCreated = useCallback((space: Space) => {
    setSpaces((prev) => [space, ...prev]);
  }, []);

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
    }
  }

  function handleDeleteSpace(space: Space) {
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
      await spacesApi.deleteSpace(space.slug);
    } catch {
      // silently fail
    }
  }

  return {
    spaces,
    loading,
    creating,
    setCreating,
    pendingDeletes,
    handleCreateSpace,
    handleRenameSpace,
    handleDeleteSpace,
    handleUndo,
    handleExpire,
  };
}
