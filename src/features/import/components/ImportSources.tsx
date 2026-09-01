import type {
  ChangeEventHandler,
  DragEventHandler,
  MouseEventHandler,
} from "react";
import {
  FolderOpen,
  Upload,
} from "lucide-react";
import { MAX_MB } from "../utils/importHelpers";

type ImportSourcesProps = {
  busy: boolean;
  isGapiLoaded: boolean;
  isDragOver: boolean;
  onFileSelect: ChangeEventHandler<HTMLInputElement>;
  onFolderSelect: ChangeEventHandler<HTMLInputElement>;
  onGoogleDrivePicker: () => void | Promise<void>;
  onDropzoneClick: MouseEventHandler<HTMLDivElement>;
  onDragEnter: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
};

function GoogleDriveIcon({
  className,
}: {
  className: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
    </svg>
  );
}

export function ImportSources({
  busy,
  isGapiLoaded,
  isDragOver,
  onFileSelect,
  onFolderSelect,
  onGoogleDrivePicker,
  onDropzoneClick,
  onDragEnter,
  onDragLeave,
  onDrop,
}: ImportSourcesProps) {
  return (
    <>
      <div className="sm:hidden mt-5 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-3 max-w-full overflow-hidden">
        <div className="text-sm font-semibold text-slate-100">
          Sources
        </div>

        <div className="text-xs text-slate-400 mt-1">
          Tous formats • Max {MAX_MB} MB/fichier
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <label
            htmlFor="ai-file-input-mobile"
            className="cursor-pointer"
          >
            <span className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition">
              <Upload className="w-5 h-5 text-amber-300" />
              Mes fichiers
            </span>

            <input
              id="ai-file-input-mobile"
              type="file"
              accept="*/*"
              multiple
              onChange={onFileSelect}
              className="hidden"
              disabled={busy}
            />
          </label>

          <button
            type="button"
            onClick={onGoogleDrivePicker}
            disabled={!isGapiLoaded || busy}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40 hover:bg-[#357ae8] hover:ring-[#4285F4]/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleDriveIcon className="w-5 h-5" />
            Drive
          </button>
        </div>
      </div>

      <div className="mt-5 hidden sm:block rounded-2xl bg-white/[0.05] ring-1 ring-white/10 px-4 py-4 max-w-full overflow-hidden">
        <div className="flex items-start sm:items-center justify-between gap-3 max-w-full">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-100">
              Sources
            </div>

            <div className="text-xs text-slate-400 mt-1">
              Tous formats • Max {MAX_MB} MB/fichier
            </div>
          </div>

          <div className="flex gap-2 items-center shrink-0">
            <label
              htmlFor="ai-file-input-desktop"
              className="cursor-pointer"
            >
              <span className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition">
                <Upload className="w-4 h-4 text-amber-300" />
                Mes fichiers
              </span>

              <input
                id="ai-file-input-desktop"
                type="file"
                accept="*/*"
                multiple
                onChange={onFileSelect}
                className="hidden"
                disabled={busy}
              />
            </label>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("ai-folder-input")
                  ?.click()
              }
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderOpen className="w-4 h-4 text-amber-300" />
              Dossier
            </button>

            <input
              id="ai-folder-input"
              type="file"
              accept="*/*"
              multiple
              // @ts-ignore
              webkitdirectory="true"
              onChange={onFolderSelect}
              className="hidden"
              disabled={busy}
            />

            <button
              type="button"
              onClick={onGoogleDrivePicker}
              disabled={!isGapiLoaded || busy}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40 hover:bg-[#357ae8] hover:ring-[#4285F4]/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GoogleDriveIcon className="w-4 h-4" />
              Drive
            </button>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={onDropzoneClick}
          onDragEnter={onDragEnter}
          onDragOver={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "mt-3 rounded-xl border border-dashed px-4 py-3 transition",
            isDragOver
              ? "border-amber-400/60 bg-black/10"
              : "border-white/15 hover:border-white/25",
            busy
              ? "opacity-60 pointer-events-none"
              : "cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3 max-w-full">
            <div className="flex items-center gap-2 min-w-0">
              <Upload className="w-4 h-4 text-amber-300 shrink-0" />

              <div className="min-w-0">
                <div className="text-xs text-slate-200/90 truncate">
                  Glisse-dépose des fichiers ici, ou clique
                  pour choisir
                </div>

                <div className="text-[11px] text-slate-400 truncate">
                  Import IA en file (un par un)
                </div>
              </div>
            </div>

            <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10 shrink-0">
              Ajouter
            </span>
          </div>
        </div>
      </div>
    </>
  );
}