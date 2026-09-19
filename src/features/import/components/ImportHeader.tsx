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
    <div
      className="
        flex max-w-full
        flex-col gap-5
        sm:flex-row
        sm:items-start
        sm:justify-between
      "
    >
      <div className="flex min-w-0 max-w-full items-start gap-3">
        <div
          className="
            grid h-11 w-11
            shrink-0
            place-items-center
            rounded-2xl
            bg-[#E7EEE8]
            text-[#184C3A]
            ring-1 ring-[#173E31]/8
          "
        >
          <Sparkles className="h-5 w-5" />
        </div>

        <div className="min-w-0 max-w-full">
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Intelligence artificielle
          </p>

          <h1
            className="
              mt-1
              font-serif
              text-3xl
              font-semibold
              text-[#173E31]
              sm:text-4xl
            "
          >
            Import IA
          </h1>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-relaxed
              text-[#718078]
            "
          >
            Dépose tes fichiers, Kitch’n
            analyse le contenu et structure
            automatiquement la recette.
          </p>

          {/* QUOTA */}
          <div className="mt-3">
            {quotaLoading ? (
              <p className="text-xs text-[#718078]">
                Chargement du quota IA…
              </p>
            ) : quota ? (
              quota.plan === "premium" ? (
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-[#E7EEE8]
                    px-3 py-1
                    text-xs
                    font-semibold
                    text-[#184C3A]
                  "
                >
                  Premium · imports IA illimités
                </span>
              ) : quota.can_import ? (
                <p className="text-xs text-[#718078]">
                  Il te reste{" "}
                  <span className="font-semibold text-[#173E31]">
                    {quota.remaining}
                  </span>{" "}
                  import
                  {quota.remaining !== 1 ? "s" : ""} IA
                  ce mois-ci
                </p>
              ) : (
                <span
                  className="
                    inline-flex
                    rounded-full
                    bg-[#F5ECD9]
                    px-3 py-1
                    text-xs
                    font-semibold
                    text-[#8B6C32]
                  "
                >
                  Limite atteinte · passe à Premium
                </span>
              )
            ) : null}
          </div>

          {/* PROGRESS */}
          {queueLength > 0 ? (
            <div
              className="
                mt-5
                max-w-xl
                rounded-2xl
                border border-[#173E31]/8
                bg-[#FBFAF6]
                px-4 py-3
              "
            >
              <div
                className="
                  flex min-w-0
                  items-center
                  justify-between
                  gap-3
                  text-xs
                "
              >
                <div className="min-w-0 truncate">
                  <span className="font-semibold text-[#29493E]">
                    Progression
                  </span>

                  <span className="text-[#9AA49F]">
                    {" "}·{" "}
                  </span>

                  <span className="text-[#718078]">
                    {overall.done}/{overall.total} terminé
                    {overall.done !== 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  className="
                    shrink-0
                    font-semibold
                    tabular-nums
                    text-[#A8833E]
                  "
                >
                  {overall.pct}%
                </div>
              </div>

              <div
                className="
                  mt-2
                  h-2
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
                      overall.pct,
                      0,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* DESKTOP ACTIONS */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={busy || !canAnalyze}
          className={ui.btnPrimary}
        >
          {busy ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Traitement…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyser
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={busy || !canClear}
          className={ui.btnGhost}
        >
          Nettoyer
        </button>
      </div>
    </div>
  );
}