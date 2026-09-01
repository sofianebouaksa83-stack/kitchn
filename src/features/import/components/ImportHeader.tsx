import {
  Loader,
  Sparkles,
} from "lucide-react";
import type { AiImportQuota } from "../../../services/aiImportQuota";
import { ui } from "../../../styles/ui";
import { clamp } from "../utils/importHelpers";

type ImportHeaderProps = {
  quota: AiImportQuota | null;
  quotaLoading: boolean;
  queueLength: number;
  overall: {
    done: number;
    total: number;
    pct: number;
  };
  busy: boolean;
  canAnalyze: boolean;
  canClear: boolean;
  onAnalyze: () => void | Promise<void>;
  onClear: () => void;
};

export function ImportHeader({
  quota,
  quotaLoading,
  queueLength,
  overall,
  busy,
  canAnalyze,
  canClear,
  onAnalyze,
  onClear,
}: ImportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-full">
      <div className="flex items-start gap-3 min-w-0 max-w-full">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
          <Sparkles className="w-5 h-5 text-amber-200" />
        </div>

        <div className="min-w-0 max-w-full">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
            Import IA
          </h1>

          <p className="text-sm text-slate-300/70 mt-1 truncate">
            Dépose des fichiers, Kitch’n structure
            automatiquement la recette.
          </p>

          <div className="mt-2">
            {quotaLoading ? (
              <p className="text-xs text-slate-400">
                Chargement du quota IA…
              </p>
            ) : quota ? (
              quota.plan === "premium" ? (
                <p className="text-xs text-emerald-300">
                  Premium • imports IA illimités
                </p>
              ) : quota.can_import ? (
                <p className="text-xs text-slate-300">
                  Il vous reste{" "}
                  <span className="font-semibold text-white">
                    {quota.remaining}
                  </span>{" "}
                  imports IA ce mois-ci
                </p>
              ) : (
                <p className="text-xs text-amber-300 font-medium">
                  Limite atteinte, passez à Premium
                </p>
              )
            ) : null}
          </div>

          {queueLength > 0 ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-300/80 gap-3 min-w-0">
                <div className="min-w-0 truncate">
                  <span className="font-semibold text-slate-100">
                    Progression
                  </span>

                  <span className="text-slate-400">
                    {" "}
                    •{" "}
                  </span>

                  <span className="text-slate-300">
                    {overall.done}/{overall.total} terminé(s)
                  </span>
                </div>

                <div className="tabular-nums shrink-0">
                  {overall.pct}%
                </div>
              </div>

              <div className="mt-2 h-2.5 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400/80 rounded-full"
                  style={{
                    width: `${clamp(
                      overall.pct,
                      0,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hidden sm:flex gap-2 items-center shrink-0">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={busy || !canAnalyze}
          className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl`}
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
          className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl`}
        >
          Nettoyer
        </button>
      </div>
    </div>
  );
}