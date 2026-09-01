import {
  Loader,
  Sparkles,
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
      className="sm:hidden fixed inset-x-0 z-50"
      style={{
        bottom: `${MOBILE_NAVBAR_OFFSET_PX}px`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="pointer-events-auto mx-auto max-w-5xl px-4 pb-4">
        <div className="rounded-2xl bg-white/[0.08] backdrop-blur-xl ring-1 ring-white/10 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onAnalyze}
              disabled={busy || !canAnalyze}
              className={[
                "w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold",
                "ring-1 transition",
                busy || !canAnalyze
                  ? "bg-white/5 text-white/40 ring-white/10"
                  : "bg-amber-500/90 text-black ring-amber-300/40 hover:bg-amber-500",
              ].join(" ")}
            >
              {busy ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Traitement…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyser
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClear}
              disabled={busy || !canClear}
              className={[
                "w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold",
                "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              Nettoyer
            </button>
          </div>
        </div>

        <div className="mt-2 text-center text-[11px] text-white/50">
          {queueLength ? (
            <>
              <span className="text-white/70">
                {queueLength}
              </span>{" "}
              en file •{" "}
              <span className="text-white/70">
                {done}
              </span>{" "}
              terminés •{" "}
              <span className="text-white/70">
                {percentage}%
              </span>
            </>
          ) : (
            <>Ajoute des fichiers via “Sources”</>
          )}
        </div>
      </div>
    </div>
  );
}