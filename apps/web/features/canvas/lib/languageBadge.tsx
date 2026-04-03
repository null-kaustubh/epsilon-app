/* eslint-disable @next/next/no-img-element */
import { Code } from "phosphor-react";
import { useTheme } from "../../../hooks/useTheme";
import { useState, useEffect } from "react";

const DARK_ICON_EXTS = new Set(["bash", "md", "rs", "shell", "txt"]);
const iconCache = new Set<string>();

export default function LanguageBadge({ ext }: { ext: string }) {
  const base = "https://assets.kaustubh.cloud/languages";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const effectiveExt = ext || "plaintext";

  const [failed, setFailed] = useState(false);

  const src =
    isDark && DARK_ICON_EXTS.has(effectiveExt)
      ? `${base}/${effectiveExt}-dark.svg`
      : `${base}/${effectiveExt}.svg`;

  // reset failure when src changes
  useEffect(() => {
    setFailed(false);
  }, [src]);

  // preload cache
  useEffect(() => {
    if (!iconCache.has(src)) {
      const img = new window.Image();
      img.src = src;
      iconCache.add(src);
    }
  }, [src]);

  if (failed) {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold text-muted-foreground">
        <Code size={16} />
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded overflow-hidden">
      <img
        key={src}
        src={src}
        alt={ext}
        width={16}
        height={16}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
