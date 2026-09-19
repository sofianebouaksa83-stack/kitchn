import type { ReactNode } from "react";

import { cn } from "../../../utils/cn";
import { useAutoFitScale } from "../hooks/useAutoFitScale";

type AutoFitDemoProps = {
  children: ReactNode;
  variant: "desktop" | "mobile";
  className?: string;
  baseWidth?: number;
  baseHeight?: number;
  padding?: number;
  offsetY?: number;
  maxScale?: number;
  cropTop?: number;
};

export function AutoFitDemo({
  children,
  variant,
  className,
  baseWidth,
  baseHeight,
  padding,
  offsetY = 0,
  maxScale = 1,
  cropTop = 24,
}: AutoFitDemoProps) {
  const mobile = variant === "mobile";

  const width = baseWidth ?? (mobile ? 390 : 950);
  const height = baseHeight ?? (mobile ? 980 : 1500);
  const spacing = padding ?? (mobile ? 0 : 8);

  const { containerRef, scale } = useAutoFitScale({
    baseWidth: width,
    baseHeight: height,
    padding: spacing,
    maxScale,
  });

  const scaledContent = (
    <div
      style={{
        width,
        height,
        transform: mobile
          ? `scale(${scale})`
          : `translate(${spacing}px, ${spacing}px) scale(${scale})`,
        transformOrigin: mobile ? "top center" : "top left",
        willChange: mobile ? "transform" : undefined,
      }}
    >
      <div style={{ width, height }}>{children}</div>
    </div>
  );

  if (!mobile) {
    return (
      <div ref={containerRef} className={className}>
        {scaledContent}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        className="absolute inset-0 flex justify-center"
        style={{
          paddingTop: Math.max(0, spacing + offsetY - cropTop),
          paddingBottom: spacing,
          paddingLeft: spacing,
          paddingRight: spacing,
        }}
      >
        {scaledContent}
      </div>
    </div>
  );
}