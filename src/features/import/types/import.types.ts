export type ImportStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

export type QueueItem = {
  id: string;
  file: File;
  status: ImportStatus;
  message?: string;
  progress: number;
  uploadProgress: number;
  resultTitle?: string;
  relativePath?: string;
};