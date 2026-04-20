// features/canvas/hooks/useToolbarPosition.ts
import { useEffect, useState, RefObject } from "react";

export function useToolbarPosition(
  anchorRef: RefObject<HTMLElement | null>,
  isVisible: boolean,
) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!isVisible || !anchorRef.current) {
      setPos(null);
      return;
    }

    function recalc() {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    recalc();

    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [isVisible, anchorRef]);

  return pos;
}
