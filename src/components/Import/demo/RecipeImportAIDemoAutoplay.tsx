import React from "react";

export type DemoStep =
  | "idle"
  | "move-to-files"
  | "open-library"
  | "move-to-open"
  | "select-file"
  | "move-to-analyze"
  | "analyze"
  | "done";

export type CursorState = {
  x: number;
  y: number;
  click: boolean;
};

export function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function moveCursorToElement(
  el: HTMLElement | null,
  root: HTMLElement | null,
  setCursor: React.Dispatch<React.SetStateAction<CursorState>>,
  offsetX = 0,
  offsetY = 0
) {
  if (!el || !root) return;

  const rootRect = root.getBoundingClientRect();
  const rect = el.getBoundingClientRect();

  const targetX = rect.left - rootRect.left + rect.width / 2 + offsetX;
  const targetY = rect.top - rootRect.top + rect.height / 2 + offsetY;

  setCursor((prev) => ({
    ...prev,
    x: targetX - 10,
    y: targetY - 8,
  }));
}

export function pulseClick(
  setCursor: React.Dispatch<React.SetStateAction<CursorState>>,
  duration = 180
) {
  setCursor((prev) => ({ ...prev, click: true }));

  window.setTimeout(() => {
    setCursor((prev) => ({ ...prev, click: false }));
  }, duration);
}

export function DemoCursor({ cursor }: { cursor: CursorState }) {
  return (
    <div
      className="pointer-events-none absolute z-[90] transition-all duration-700 ease-in-out"
      style={{
        left: cursor.x,
        top: cursor.y,
      }}
    >
      <div
        className={
          cursor.click
            ? "scale-90 transition-transform duration-150"
            : "scale-100 transition-transform duration-150"
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 fill-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
          aria-hidden="true"
        >
          <path d="M5 3L18 15H12L9 21L7 20L10 14H5V3Z" />
        </svg>

        {cursor.click && (
          <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-white/40 bg-white/10 animate-ping" />
        )}
      </div>
    </div>
  );
}
