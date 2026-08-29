import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  FolderOpen,
  Loader,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useAiImportProcessor } from "../../features/import/hooks/useAiImportProcessor";
import { useAiImportQuota } from "../../features/import/hooks/useAiImportQuota";
import { useGoogleDriveImport } from "../../features/import/hooks/useGoogleDriveImport";
import { useImportFileSelection } from "../../features/import/hooks/useImportFileSelection";
import { useImportQueue } from "../../features/import/hooks/useImportQueue";
import type { ImportStatus } from "../../features/import/types/import.types";
import {
  clamp,
  MAX_MB,
  statusBadge,
  statusLabel,
} from "../../features/import/utils/importHelpers";

type RecipeImportAIWidgetProps = {
  onOpenFull?: () => void;
};

const FILE_INPUT_ID = "ai-widget-file-input";
const FOLDER_INPUT_ID = "ai-widget-folder-input";

const WIDGET_DRIVE_MESSAGES = {
  notLoaded:
    "Les APIs Google ne sont pas encore chargées. Réessaie dans quelques secondes.",
  missingConfig:
    "⚠️ Configuration Google Drive manquante. Vérifie VITE_GOOGLE_API_KEY et VITE_GOOGLE_CLIENT_ID dans le .env.",
  defaultConfig:
    "⚠️ Remplace les valeurs par défaut dans le .env avec tes vraies clés Google.",
};

function formatWidgetSuccessMessage(
  title: string
) {
  return `Recette "${title}" créée`;
}

export function RecipeImportAIWidget({
  onOpenFull,
}: RecipeImportAIWidgetProps) {
  const { user } = useAuth();

  const [status, setStatus] =
    useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");

  const busy =
    status === "uploading" ||
    status === "processing";

  const {
    quota,
    quotaLoading,
    loadQuota,
    refreshQuota,
  } = useAiImportQuota(user);

  const {
    queue,
    setQueue,
    queueRef,
    overall,
    enqueueFiles,
    removeItem,
    clearDone,
  } = useImportQueue();

  const {
    isDragOver,
    handleDragEnter,
    handleDragLeave,
    onDrop: handleDrop,
    onDropzoneClick: handleDropzoneClick,
    handleFileSelect: handleSelectedFiles,
    handleFolderSelect: handleSelectedFolder,
    addFilesToQueue: enqueueSelectedFiles,
  } = useImportFileSelection({
    busy,
    enqueueFiles,
    setStatus,
    setMessage,
    fileInputId: FILE_INPUT_ID,
  });

  const {
    isGapiLoaded,
    handleGoogleDrivePicker,
  } = useGoogleDriveImport({
    addFilesToQueue: enqueueSelectedFiles,
    setStatus,
    setMessage,
    messages: WIDGET_DRIVE_MESSAGES,
  });

  const { processQueue } = useAiImportProcessor({
    user,
    queueRef,
    setQueue,
    loadQuota,
    refreshQuota,
    setStatus,
    setMessage,
    processErrorItems: false,
    unauthenticatedMessage:
      "Connecte-toi pour utiliser l'import IA.",
    formatSuccessMessage:
      formatWidgetSuccessMessage,
    openAiKeyErrorMessage:
      "⚠️ Clé OpenAI non configurée. Configure OPENAI_API_KEY dans les secrets Supabase.",
  });

  const hasPendingImports = queue.some(
    (item) => item.status === "idle"
  );

  const canAnalyze =
    hasPendingImports &&
    (quota?.plan === "premium" ||
      quota == null ||
      quota.can_import);

  const canClear = queue.some(
    (item) => item.status === "success"
  );

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] ring-1 ring-[#D4AF37]/20">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#D4AF37]">
              Import IA
            </p>

            <h3 className="truncate text-lg font-semibold text-white">
              Importer une recette
            </h3>

            <div className="mt-1 text-xs text-white/55">
              {quotaLoading ? (
                <span>
                  Chargement du quota…
                </span>
              ) : quota ? (
                quota.plan === "premium" ? (
                  <span className="text-emerald-300">
                    Premium • imports illimités
                  </span>
                ) : quota.can_import ? (
                  <span>
                    <span className="font-semibold text-white">
                      {quota.remaining}
                    </span>{" "}
                    imports IA restants
                  </span>
                ) : (
                  <span className="font-medium text-amber-300">
                    Limite atteinte
                  </span>
                )
              ) : (
                <span>
                  Dépose un PDF, une photo ou un
                  fichier.
                </span>
              )}
            </div>
          </div>
        </div>

        {onOpenFull ? (
          <button
            type="button"
            onClick={onOpenFull}
            className="hidden shrink-0 items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/10 px-3 py-2 text-xs font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/15 sm:inline-flex"
          >
            Page complète
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label
            htmlFor={FILE_INPUT_ID}
            className="cursor-pointer"
          >
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10">
              <Upload className="h-4 w-4 text-[#D4AF37]" />
              Fichiers
            </span>

            <input
              id={FILE_INPUT_ID}
              type="file"
              accept="*/*"
              multiple
              onChange={handleSelectedFiles}
              className="hidden"
              disabled={busy}
            />
          </label>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  FOLDER_INPUT_ID
                )
                ?.click()
            }
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FolderOpen className="h-4 w-4 text-[#D4AF37]" />
            Dossier
          </button>

          <input
            id={FOLDER_INPUT_ID}
            type="file"
            accept="*/*"
            multiple
            // @ts-ignore
            webkitdirectory="true"
            onChange={handleSelectedFolder}
            className="hidden"
            disabled={busy}
          />

          <button
            type="button"
            onClick={handleGoogleDrivePicker}
            disabled={!isGapiLoaded || busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4285F4] px-3 py-3 text-sm font-semibold text-white ring-1 ring-[#4285F4]/40 transition hover:bg-[#357ae8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
            </svg>
            Drive
          </button>

          <button
            type="button"
            onClick={processQueue}
            disabled={busy || !canAnalyze}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-3 py-3 text-sm font-bold text-[#101827] ring-1 ring-[#D4AF37]/40 transition hover:bg-[#e5c451] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-white/40 disabled:ring-white/10"
          >
            {busy ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}

            {busy ? "Analyse…" : "Analyser"}
          </button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={handleDropzoneClick}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();

              document
                .getElementById(FILE_INPUT_ID)
                ?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "hidden rounded-2xl border border-dashed px-4 py-4 transition sm:block",
            isDragOver
              ? "border-[#D4AF37]/60 bg-[#D4AF37]/10"
              : "border-white/15 bg-black/10 hover:border-white/25",
            busy
              ? "pointer-events-none opacity-60"
              : "cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-[#D4AF37] ring-1 ring-white/10">
                <Upload className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  Glisse-dépose tes fichiers ici
                </p>

                <p className="truncate text-xs text-white/45">
                  Tous formats • Max {MAX_MB}{" "}
                  MB/fichier
                </p>
              </div>
            </div>

            <span className="hidden shrink-0 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10 sm:inline-flex">
              Ajouter
            </span>
          </div>
        </div>

        {queue.length > 0 ? (
          <div className="rounded-2xl bg-white/[0.05] ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  File d'import
                </p>

                <p className="text-xs text-white/45">
                  {overall.done}/{overall.total}{" "}
                  terminé(s) • {overall.pct}%
                </p>
              </div>

              <button
                type="button"
                onClick={clearDone}
                disabled={busy || !canClear}
                className="shrink-0 rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Nettoyer
              </button>
            </div>

            <div className="h-1.5 bg-black/20">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all"
                style={{
                  width: `${clamp(
                    overall.pct,
                    0,
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="max-h-[230px] divide-y divide-white/10 overflow-y-auto">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex min-w-0 items-start gap-3 px-4 py-3"
                >
                  <div className="mt-0.5 shrink-0 text-[#D4AF37]">
                    {item.status ===
                    "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    ) : item.status ===
                      "error" ? (
                      <AlertCircle className="h-4 w-4 text-red-300" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {item.relativePath ||
                          item.file.name}
                      </p>

                      <span
                        className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${statusBadge(
                          item
                        )}`}
                      >
                        {statusLabel(item)}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20 ring-1 ring-white/10">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-all"
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
                      <p className="mt-1 line-clamp-2 text-xs text-white/55">
                        {item.message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    className="shrink-0 rounded-lg bg-white/5 p-2 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                    aria-label="Retirer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {message ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm",
              status === "error"
                ? "border-red-500/20 bg-red-500/10 text-red-100"
                : "border-white/10 bg-white/5 text-white/70",
            ].join(" ")}
          >
            {message}
          </div>
        ) : null}

        {onOpenFull ? (
          <button
            type="button"
            onClick={onOpenFull}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] sm:hidden"
          >
            Ouvrir la page import complète
            <ArrowRight className="h-4 w-4 text-[#D4AF37]" />
          </button>
        ) : null}
      </div>
    </section>
  );
}