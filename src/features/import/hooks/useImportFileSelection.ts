import { useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  MouseEvent,
} from "react";
import type { ImportStatus } from "../types/import.types";
import {
  MAX_MB,
  validateFile,
} from "../utils/importHelpers";

type UseImportFileSelectionOptions = {
  busy: boolean;
  enqueueFiles: (files: File[]) => void;
  setStatus: (status: ImportStatus) => void;
  setMessage: (message: string) => void;
};

export function useImportFileSelection({
  busy,
  enqueueFiles,
  setStatus,
  setMessage,
}: UseImportFileSelectionOptions) {
  const [isDragOver, setIsDragOver] = useState(false);

  async function addFilesToQueue(files: File[]) {
    if (!files.length) return;

    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);

      if (!validation.ok) {
        errors.push(`${file.name} → trop volumineux`);
      } else {
        valid.push(file);
      }
    }

    if (errors.length) {
      setStatus("error");
      setMessage(
        `Certains fichiers ont été refusés:\n- ${errors
          .slice(0, 6)
          .join("\n- ")}${
          errors.length > 6 ? "\n- ..." : ""
        }\n\nMax ${MAX_MB} MB par fichier`
      );
    } else {
      setStatus("idle");
      setMessage("");
    }

    if (!valid.length) return;

    enqueueFiles(valid);
  }

  function onDropzoneClick(
    event: MouseEvent<HTMLElement>
  ) {
    if (busy) return;
    if (event.target !== event.currentTarget) return;

    document
      .getElementById("ai-file-input-desktop")
      ?.click();
  }

  async function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragOver(false);

    if (busy) return;

    await addFilesToQueue(
      Array.from(event.dataTransfer.files || [])
    );
  }

  async function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";
    await addFilesToQueue(files);
  }

  async function handleFolderSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";
    await addFilesToQueue(files);
  }

  function handleDragEnter(
    event: DragEvent<HTMLElement>
  ) {
    event.preventDefault();

    if (!busy) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  return {
    isDragOver,
    addFilesToQueue,
    onDropzoneClick,
    onDrop,
    handleFileSelect,
    handleFolderSelect,
    handleDragEnter,
    handleDragLeave,
  };
}