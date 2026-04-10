"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "epsilon:recent-spaces";
const MAX_RECENTS = 3;

export type RecentSpace = {
  slug: string;
  name: string;
  visitedAt: number;
};

function load(): RecentSpace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentSpace[]) : [];
  } catch {
    return [];
  }
}

function save(recents: RecentSpace[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentSpace[]>([]);

  useEffect(() => {
    setRecents(load());
  }, []);

  const addRecent = useCallback((slug: string, name: string) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.slug !== slug);
      const next = [{ slug, name, visitedAt: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENTS,
      );
      save(next);
      return next;
    });
  }, []);

  return { recents, addRecent };
}
