import { useEffect, useRef, useState } from "react";

export function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setWidth(rect.width);
    setHeight(rect.height);

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setWidth(cr.width);
      setHeight(cr.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width, height };
}
