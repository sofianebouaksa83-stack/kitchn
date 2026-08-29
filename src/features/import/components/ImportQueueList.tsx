import {
  FileText,
  X,
} from "lucide-react";
import type { QueueItem } from "../types/import.types";
import {
  clamp,
  statusBadge,
  statusLabel,
} from "../utils/importHelpers";

type ImportQueueListProps = {
  queue: QueueItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ImportQueueList({
  queue,
  selectedId,
  onSelect,
  onRemove,
}: ImportQueueListProps) {
  if (!queue.length) return null;

  return (
    <div className="mt-5 grid lg:grid-cols-2 gap-4 max-w-full">
      <div className="w-full max-w-full rounded-2xl bg-white/[0.05] ring-1 ring-white/10 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 min-w-0 max-w-full">
          <div className="text-sm font-semibold text-slate-100 shrink-0">
            Fichiers
          </div>

          <div className="ml-auto text-xs text-slate-400 truncate max-w-[52%]">
            Clique pour sélectionner
          </div>
        </div>

        <div className="divide-y divide-white/10 max-w-full">
          {queue.map((item) => {
            const active = item.id === selectedId;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    onSelect(item.id);
                  }
                }}
                className={[
                  "px-4 py-3 transition outline-none max-w-full",
                  active
                    ? "bg-white/[0.04]"
                    : "hover:bg-white/[0.04]",
                ].join(" ")}
              >
                <div className="flex items-start gap-3 min-w-0 max-w-full overflow-hidden">
                  <FileText className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0 max-w-full">
                    <div className="flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
                      <div className="w-0 flex-1 min-w-0 truncate text-sm text-slate-100 font-medium">
                        {item.relativePath ||
                          item.file.name}
                      </div>

                      <span
                        className={`shrink-0 text-[11px] px-2 py-1 rounded-xl border ${statusBadge(
                          item
                        )}`}
                      >
                        {statusLabel(item)}
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden max-w-full">
                      <div
                        className="h-full bg-amber-400/80 rounded-full"
                        style={{
                          width: `${clamp(
                            item.progress,
                            0,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    {item.message ? (
                      <div className="mt-2 text-xs text-slate-300/90 line-clamp-2">
                        {item.message}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="shrink-0 ml-1 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onRemove(item.id);
                    }}
                    title="Retirer"
                    aria-label="Retirer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}