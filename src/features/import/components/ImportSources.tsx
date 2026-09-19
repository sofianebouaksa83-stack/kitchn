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
  const sourceButton =
    "inline-flex items-center justify-center gap-2 " +
    "rounded-2xl border border-[#173E31]/10 " +
    "bg-[#FBFAF6] font-medium text-[#29493E] " +
    "transition hover:bg-[#E7EEE8] " +
    "disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <>
      {/* MOBILE */}
      <div
        className="
          mt-6
          max-w-full
          overflow-hidden
          rounded-[26px]
          border border-[#173E31]/10
          bg-[#FBFAF6]
          p-4
          shadow-[0_8px_24px_rgba(23,62,49,0.04)]
          sm:hidden
        "
      >
        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-[#A8833E]
            "
          >
            Ajouter
          </p>

          <h2
            className="
              mt-1
              font-serif
              text-xl
              font-semibold
              text-[#173E31]
            "
          >
            Sources
          </h2>

          <p className="mt-1 text-xs text-[#718078]">
            Tous formats · Max {MAX_MB} MB/fichier
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label
            htmlFor="ai-file-input-mobile"
            className="cursor-pointer"
          >
            <span
              className={`
                ${sourceButton}
                h-12 w-full
                text-sm
              `}
            >
              <Upload className="h-5 w-5 text-[#A8833E]" />
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
            className={`
              ${sourceButton}
              h-12 w-full
              text-sm
            `}
          >
            <GoogleDriveIcon className="h-5 w-5 text-[#4285F4]" />
            Drive
          </button>
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className="
          mt-6
          hidden
          max-w-full
          overflow-hidden
          rounded-[28px]
          border border-[#173E31]/10
          bg-[#FBFAF6]
          p-5
          shadow-[0_8px_24px_rgba(23,62,49,0.04)]
          sm:block
        "
      >
        <div
          className="
            flex max-w-full
            items-start
            justify-between
            gap-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#A8833E]
              "
            >
              Ajouter
            </p>

            <h2
              className="
                mt-1
                font-serif
                text-xl
                font-semibold
                text-[#173E31]
              "
            >
              Sources
            </h2>

            <p className="mt-1 text-xs text-[#718078]">
              Tous formats · Max {MAX_MB} MB/fichier
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <label
              htmlFor="ai-file-input-desktop"
              className="cursor-pointer"
            >
              <span
                className={`
                  ${sourceButton}
                  px-3 py-2
                  text-xs
                `}
              >
                <Upload className="h-4 w-4 text-[#A8833E]" />
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
              className={`
                ${sourceButton}
                px-3 py-2
                text-xs
              `}
            >
              <FolderOpen className="h-4 w-4 text-[#A8833E]" />
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
              className={`
                ${sourceButton}
                px-3 py-2
                text-xs
              `}
            >
              <GoogleDriveIcon className="h-4 w-4 text-[#4285F4]" />
              Drive
            </button>
          </div>
        </div>

        {/* DROPZONE */}
        <div
          role="button"
          tabIndex={0}
          onClick={onDropzoneClick}
          onDragEnter={onDragEnter}
          onDragOver={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            "mt-5 rounded-[22px] border border-dashed px-5 py-6 transition-all",
            isDragOver
              ? "border-[#C7A45D]/70 bg-[#C7A45D]/10"
              : "border-[#173E31]/15 bg-[#F7F5EF] hover:border-[#173E31]/25 hover:bg-[#F2F3EC]",
            busy
              ? "pointer-events-none opacity-60"
              : "cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid h-11 w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <Upload className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-[#29493E]
                  "
                >
                  Glisse-dépose tes fichiers ici
                </div>

                <div className="mt-1 truncate text-xs text-[#718078]">
                  Ou clique pour choisir · traitement
                  automatique un par un
                </div>
              </div>
            </div>

            <span
              className="
                hidden shrink-0
                rounded-full
                bg-[#E7EEE8]
                px-3 py-2
                text-xs
                font-semibold
                text-[#184C3A]
                md:inline-flex
              "
            >
              Ajouter
            </span>
          </div>
        </div>
      </div>
    </>
  );
}