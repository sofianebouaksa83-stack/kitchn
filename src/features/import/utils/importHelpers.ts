import type { QueueItem } from "../types/import.types";

export const MAX_MB = 10;
export const MOBILE_NAVBAR_OFFSET_PX = 65;

export function uid() {
  return (
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

export function clamp(
  n: number,
  min: number,
  max: number
) {
  return Math.max(min, Math.min(max, n));
}

export function validateFile(file: File) {
  const okSize =
    file.size <= MAX_MB * 1024 * 1024;

  return {
    ok: okSize,
    okSize,
  };
}

export function statusBadge(item: QueueItem) {
  if (item.status === "success") {
    return "text-emerald-200 bg-emerald-500/10 border-emerald-500/20";
  }

  if (item.status === "error") {
    return "text-red-200 bg-red-500/10 border-red-500/20";
  }

  if (
    item.status === "processing" ||
    item.status === "uploading"
  ) {
    return "text-amber-200 bg-amber-500/10 border-amber-500/20";
  }

  return "text-slate-200 bg-white/5 border-white/10";
}

export function statusLabel(item: QueueItem) {
  if (item.status === "idle") return "Prêt";

  if (item.status === "uploading") {
    return `Upload ${item.uploadProgress}%`;
  }

  if (item.status === "processing") {
    return "Analyse…";
  }

  if (item.status === "success") {
    return "Terminé";
  }

  return "Erreur";
}