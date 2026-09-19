import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  X,
} from "lucide-react";

import type { QueueItem } from "../types/import.types";

import {
  clamp,
  statusLabel,
} from "../utils/importHelpers";

type ImportQueueListProps = {
  queue: QueueItem[];

  selectedId: string | null;

  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

function getStatusClasses(item: QueueItem) {
  switch (item.status) {
    case "success":
      return "border-[#184C3A]/10 bg-[#E7EEE8] text-[#184C3A]";

    case "error":
      return "border-[#C05C56]/15 bg-[#F8EAE7] text-[#A54C48]";

    case "uploading":
    case "processing":
      return "border-[#C7A45D]/15 bg-[#F5ECD9] text-[#8B6C32]";

    default:
      return "border-[#173E31]/8 bg-[#F0F2EC] text-[#617168]";
  }
}

function StatusIcon({
  item,
}: {
  item: QueueItem;
}) {
  if (item.status === "success") {
    return (
      <CheckCircle2 className="h-4 w-4 text-[#184C3A]" />
    );
  }

  if (item.status === "error") {
    return (
      <AlertCircle className="h-4 w-4 text-[#A54C48]" />
    );
  }

  if (
    item.status === "uploading" ||
    item.status === "processing"
  ) {
    return (
      <Loader2 className="h-4 w-4 animate-spin text-[#A8833E]" />
    );
  }

  return (
    <FileText className="h-4 w-4 text-[#A8833E]" />
  );
}

export function ImportQueueList({
  queue,
  selectedId,
  onSelect,
  onRemove,
}: ImportQueueListProps) {
  if (!queue.length) return null;

  return (
    <div className="mt-5 max-w-full">
      <div
        className="
          w-full
          max-w-full
          overflow-hidden
          rounded-[28px]
          border border-[#173E31]/10
          bg-[#FBFAF6]
          shadow-[0_8px_24px_rgba(23,62,49,0.04)]
        "
      >
        {/* HEADER */}
        <div
          className="
            flex min-w-0
            max-w-full
            items-center gap-2
            border-b
            border-[#173E31]/8
            px-4 py-4
          "
        >
          <div>
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#A8833E]
              "
            >
              Import
            </p>

            <h2
              className="
                font-serif
                text-lg
                font-semibold
                text-[#173E31]
              "
            >
              File d’attente
            </h2>
          </div>

          <div
            className="
              ml-auto
              max-w-[52%]
              truncate
              text-xs
              text-[#718078]
            "
          >
            Clique sur un fichier pour le sélectionner
          </div>
        </div>

        {/* ITEMS */}
        <div className="divide-y divide-[#173E31]/8">
          {queue.map((item) => {
            const active =
              item.id === selectedId;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  onSelect(item.id)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    onSelect(item.id);
                  }
                }}
                className={[
                  "max-w-full px-4 py-4 outline-none transition",
                  active
                    ? "bg-[#E7EEE8]/65"
                    : "hover:bg-[#F7F5EF]",
                ].join(" ")}
              >
                <div
                  className="
                    flex max-w-full
                    min-w-0
                    items-start gap-3
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      mt-0.5
                      grid h-9 w-9
                      shrink-0
                      place-items-center
                      rounded-xl
                      bg-[#F0F2EC]
                    "
                  >
                    <StatusIcon item={item} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <div
                        className="
                          min-w-0 flex-1
                          truncate
                          text-sm
                          font-medium
                          text-[#173E31]
                        "
                      >
                        {item.relativePath ||
                          item.file.name}
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          border
                          px-2.5 py-1
                          text-[10px]
                          font-semibold
                          ${getStatusClasses(item)}
                        `}
                      >
                        {statusLabel(item)}
                      </span>
                    </div>

                    <div
                      className="
                        mt-2.5
                        h-1.5
                        max-w-full
                        overflow-hidden
                        rounded-full
                        bg-[#E7EEE8]
                      "
                    >
                      <div
                        className="
                          h-full
                          rounded-full
                          bg-[#C7A45D]
                          transition-all
                        "
                        style={{
                          width: `${clamp(
                            item.progress,
                            0,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    {item.message ? (
                      <div
                        className="
                          mt-2
                          line-clamp-2
                          text-xs
                          leading-relaxed
                          text-[#718078]
                        "
                      >
                        {item.message}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    className="
                      ml-1
                      inline-flex
                      h-9 w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#F0F2EC]
                      text-[#718078]
                      transition
                      hover:bg-[#F5E4E0]
                      hover:text-[#A54C48]
                    "
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      onRemove(item.id);
                    }}
                    title="Retirer"
                    aria-label="Retirer"
                  >
                    <X className="h-4 w-4" />
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