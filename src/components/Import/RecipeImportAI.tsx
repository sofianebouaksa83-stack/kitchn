import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ui } from "../../styles/ui";
import { ImportHeader } from "../../features/import/components/ImportHeader";
import { ImportMobileToolbar } from "../../features/import/components/ImportMobileToolbar";
import { ImportQueueList } from "../../features/import/components/ImportQueueList";
import { ImportSources } from "../../features/import/components/ImportSources";
import { useAiImportProcessor } from "../../features/import/hooks/useAiImportProcessor";
import { useAiImportQuota } from "../../features/import/hooks/useAiImportQuota";
import { useGoogleDriveImport } from "../../features/import/hooks/useGoogleDriveImport";
import { useImportFileSelection } from "../../features/import/hooks/useImportFileSelection";
import { useImportQueue } from "../../features/import/hooks/useImportQueue";
import type { ImportStatus } from "../../features/import/types/import.types";
import { MOBILE_NAVBAR_OFFSET_PX } from "../../features/import/utils/importHelpers";

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

  const [status, setStatus] =
    useState<ImportStatus>("idle");
  const [, setMessage] = useState("");

  const busy =
    status === "uploading" ||
    status === "processing";

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

  const hasPendingImports = queue.some(
    (item) =>
      item.status === "idle" ||
      item.status === "error"
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
    <div
      className={`${ui.dashboardBg} overflow-x-clip`}
    >
      <div
        className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}
        style={{
          paddingBottom: `calc(${MOBILE_NAVBAR_OFFSET_PX}px + 110px)`,
        }}
      >
        <div className="max-w-5xl mx-auto max-w-full">
          <ImportHeader
            quota={quota}
            quotaLoading={quotaLoading}
            queueLength={queue.length}
            overall={overall}
            busy={busy}
            canAnalyze={canAnalyze}
            canClear={canClear}
            onAnalyze={processQueue}
            onClear={clearDone}
          />

          <ImportSources
            busy={busy}
            isGapiLoaded={isGapiLoaded}
            isDragOver={isDragOver}
            onFileSelect={handleSelectedFiles}
            onFolderSelect={
              handleSelectedFolder
            }
            onGoogleDrivePicker={
              handleGoogleDrivePicker
            }
            onDropzoneClick={
              handleDropzoneClick
            }
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

      <ImportMobileToolbar
        queueLength={queue.length}
        done={overall.done}
        percentage={overall.pct}
        busy={busy}
        canAnalyze={canAnalyze}
        canClear={canClear}
        onAnalyze={processQueue}
        onClear={clearDone}
      />
    </div>
  );
}