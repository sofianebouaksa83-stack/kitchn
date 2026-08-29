import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Loader, Sparkles, } from "lucide-react";
import { ui } from "../../styles/ui";
import {
  clamp, 
  MOBILE_NAVBAR_OFFSET_PX,
  } from "../../features/import/utils/importHelpers";
import { useGoogleDriveImport } from "../../features/import/hooks/useGoogleDriveImport";
import { useAiImportQuota } from "../../features/import/hooks/useAiImportQuota";
import { useImportQueue } from "../../features/import/hooks/useImportQueue";
import { useImportFileSelection } from "../../features/import/hooks/useImportFileSelection";
import type { ImportStatus } from "../../features/import/types/import.types";
import { useAiImportProcessor } from "../../features/import/hooks/useAiImportProcessor";
import { ImportSources } from "../../features/import/components/ImportSources";
import { ImportQueueList } from "../../features/import/components/ImportQueueList";

export function RecipeImportAI() {
  const { user } = useAuth();

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
    setSelectedId,
    overall,
    selected,
    enqueueFiles,
    removeItem,
    clearDone,
  } = useImportQueue();

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  
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
  });

  const {
    isGapiLoaded,
    handleGoogleDrivePicker,
  } = useGoogleDriveImport({
    addFilesToQueue: enqueueSelectedFiles,
    setStatus,
    setMessage,
  });

  const { processQueue } = useAiImportProcessor({
    user,
    queueRef,
    setQueue,
    loadQuota,
    refreshQuota,
    setStatus,
    setMessage,
  });


  function viewRecipe() {
    window.location.reload();
  }  

  const hasPendingImports = queue.some((q) => q.status === "idle" || q.status === "error");
  const canAnalyze = hasPendingImports && (quota?.plan === "premium" || quota == null || quota.can_import);
  const canClear = queue.some((q) => q.status === "success");

  return (
    <div className={`${ui.dashboardBg} overflow-x-clip`}>
      <div
        className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}
        style={{ paddingBottom: `calc(${MOBILE_NAVBAR_OFFSET_PX}px + 110px)` }}
      >
        <div className="max-w-5xl mx-auto max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-full">
            <div className="flex items-start gap-3 min-w-0 max-w-full">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>

              <div className="min-w-0 max-w-full">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Import IA</h1>
                <p className="text-sm text-slate-300/70 mt-1 truncate">
                  Dépose des fichiers, Kitch’n structure automatiquement la recette.
                </p>
                <div className="mt-2">
                {quotaLoading ? (
                  <p className="text-xs text-slate-400">Chargement du quota IA…</p>
                ) : quota ? (
                  quota.plan === "premium" ? (
                    <p className="text-xs text-emerald-300">Premium • imports IA illimités</p>
                  ) : quota.can_import ? (
                    <p className="text-xs text-slate-300">
                      Il vous reste{" "}
                      <span className="font-semibold text-white">{quota.remaining}</span>{" "}
                      imports IA ce mois-ci
                    </p>
                  ) : (
                    <p className="text-xs text-amber-300 font-medium">
                      Limite atteinte, passez à Premium
                    </p>
                  )
                ) : null}
              </div>

                {queue.length > 0 ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-300/80 gap-3 min-w-0">
                      <div className="min-w-0 truncate">
                        <span className="font-semibold text-slate-100">Progression</span>
                        <span className="text-slate-400"> • </span>
                        <span className="text-slate-300">
                          {overall.done}/{overall.total} terminé(s)
                        </span>
                      </div>
                      <div className="tabular-nums shrink-0">{overall.pct}%</div>
                    </div>

                    <div className="mt-2 h-2.5 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400/80 rounded-full"
                        style={{ width: `${clamp(overall.pct, 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex gap-2 items-center shrink-0">
              <button
                type="button"
                onClick={processQueue}
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
                onClick={clearDone}
                disabled={busy || !canClear}
                className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl`}
                type="button"
              >
                Nettoyer
              </button>
            </div>
          </div>

          <ImportSources
            busy={busy}
            isGapiLoaded={isGapiLoaded}
            isDragOver={isDragOver}
            onFileSelect={handleSelectedFiles}
            onFolderSelect={handleSelectedFolder}
            onGoogleDrivePicker={handleGoogleDrivePicker}
            onDropzoneClick={handleDropzoneClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          <ImportQueueList
            queue={queue}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onRemove={removeItem}
          />
        </div>
      </div>

      {/* ✅ Toolbar sticky mobile (Analyser + Nettoyer) remontée */}
      <div className="sm:hidden fixed inset-x-0 z-50" style={{ bottom: `${MOBILE_NAVBAR_OFFSET_PX}px` }}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="pointer-events-auto mx-auto max-w-5xl px-4 pb-4">
          <div className="rounded-2xl bg-white/[0.08] backdrop-blur-xl ring-1 ring-white/10 p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={processQueue}
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
                onClick={clearDone}
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
            {queue.length ? (
              <>
                <span className="text-white/70">{queue.length}</span> en file •{" "}
                <span className="text-white/70">{overall.done}</span> terminés •{" "}
                <span className="text-white/70">{overall.pct}%</span>
              </>
            ) : (
              <>Ajoute des fichiers via “Sources”</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
