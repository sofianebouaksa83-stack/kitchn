import {
  Loader,
  Sparkles,
  Trash2,
} from "lucide-react";

import { MOBILE_NAVBAR_OFFSET_PX } from "../utils/importHelpers";

type ImportMobileToolbarProps = {
  queueLength: number;

  done: number;
  percentage: number;

  busy: boolean;

  canAnalyze: boolean;
  canClear: boolean;

  onAnalyze: () => void | Promise<void>;
  onClear: () => void;
};

export function ImportMobileToolbar({
  queueLength,
  done,
  percentage,
  busy,
  canAnalyze,
  canClear,
  onAnalyze,
  onClear,
}: ImportMobileToolbarProps) {
  return (
    <div
      className="
        fixed inset-x-0
        z-50
        sm:hidden
      "
      style={{
        bottom: `${MOBILE_NAVBAR_OFFSET_PX}px`,
      }}
    >
      <div
        className="
          pointer-events-none
          absolute inset-0
          bg-gradient-to-t
          from-[#F3F0E8]
          via-[#F3F0E8]/95
          to-transparent
        "
      />

      <div
        className="
          pointer-events-auto
          relative
          mx-auto
          max-w-5xl
          px-4 pb-3
        "
      >
        <div
          className="
            rounded-[22px]
            border border-[#173E31]/10
            bg-[#FBFAF6]/95
            p-2
            shadow-[0_12px_35px_rgba(23,62,49,0.12)]
            backdrop-blur-xl
          "
        >
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={busy || !canAnalyze}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#DDAE9D]
                px-3 py-3
                text-sm
                font-semibold
                text-[#173E31]
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-45
              "
            >
              {busy ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Traitement…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyser
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClear}
              disabled={busy || !canClear}
              className="
                inline-flex
                h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Nettoyer"
              title="Nettoyer les imports terminés"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="
            mt-2
            text-center
            text-[11px]
            text-[#718078]
          "
        >
          {queueLength ? (
            <>
              <span className="font-semibold text-[#173E31]">
                {queueLength}
              </span>{" "}
              en file ·{" "}
              <span className="font-semibold text-[#173E31]">
                {done}
              </span>{" "}
              terminé
              {done !== 1 ? "s" : ""} ·{" "}
              <span className="font-semibold text-[#A8833E]">
                {percentage}%
              </span>
            </>
          ) : (
            <>Ajoute des fichiers via Sources</>
          )}
        </div>
      </div>
    </div>
  );
}