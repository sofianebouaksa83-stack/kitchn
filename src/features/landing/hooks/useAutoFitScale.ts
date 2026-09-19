import { useLayoutEffect, useRef, useState } from "react";

type UseAutoFitScaleOptions = {
  baseWidth: number;
  baseHeight: number;
  padding?: number;
  maxScale?: number;
};

export function useAutoFitScale({
  baseWidth,
  baseHeight,
  padding = 0,
  maxScale = 1,
}: UseAutoFitScaleOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const computeScale = () => {
      const width = Math.max(1, element.clientWidth - padding * 2);
      const height = Math.max(1, element.clientHeight - padding * 2);
      const nextScale = Math.min(
        width / baseWidth,
        height / baseHeight,
        maxScale
      );

      setScale(Number.isFinite(nextScale) ? nextScale : 1);
    };

    computeScale();

    const observer = new ResizeObserver(computeScale);
    observer.observe(element);
    window.addEventListener("resize", computeScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeScale);
    };
  }, [baseWidth, baseHeight, padding, maxScale]);

  return { containerRef, scale };
}