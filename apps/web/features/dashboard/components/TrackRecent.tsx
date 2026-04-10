"use client";

import { useEffect } from "react";
import { useRecents } from "../../../hooks/useRecents";

type TrackRecentProps = {
  slug: string;
  name: string;
};

export default function TrackRecent({ slug, name }: TrackRecentProps) {
  const { addRecent } = useRecents();

  useEffect(() => {
    addRecent(slug, name);
  }, [slug, name, addRecent]);

  return null;
}
