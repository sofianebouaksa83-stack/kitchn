import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Upload,
  FileText,
  AlertCircle,
  Loader,
  Sparkles,
  X,
  FolderOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { getAiImportQuota, type AiImportQuota } from "../../services/aiImportQuota";

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

type ImportStatus = "idle" | "uploading" | "processing" | "success" | "error";

type QueueItem = {
  id: string;
  file: File;
  status: ImportStatus;
  message?: string;
  progress: number;
  uploadProgress: number;
  resultTitle?: string;
  relativePath?: string;
};

type RecipeImportAIWidgetProps = {
  onOpenFull?: () => void;
};

const MAX_MB = 10;
const FILE_INPUT_ID = "ai-widget-file-input";
const FOLDER_INPUT_ID = "ai-widget-folder-input";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function statusBadge(q: QueueItem) {
  if (q.status === "success") return "text-emerald-200 bg-emerald-500/10 border-emerald-500/20";
  if (q.status === "error") return "text-red-200 bg-red-500/10 border-red-500/20";
  if (q.status === "processing" || q.status === "uploading") {
    return "text-amber-200 bg-amber-500/10 border-amber-500/20";
  }
  return "text-slate-200 bg-white/5 border-white/10";
}

function statusLabel(q: QueueItem) {
  if (q.status === "idle") return "Prêt";
  if (q.status === "uploading") return `Upload ${q.uploadProgress}%`;
  if (q.status === "processing") return "Analyse…";
  if (q.status === "success") return "Terminé";
  return "Erreur";
}

export function RecipeImportAIWidget({ onOpenFull }: RecipeImportAIWidgetProps) {
  const { user } = useAuth();

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [quota, setQuota] = useState<AiImportQuota | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);

  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processingRef = useRef(false);

  useEffect(() => {
    const loadGoogleAPIs = () => {
      if (window.gapi && window.google) {
        setIsGapiLoaded(true);
        return;
      }

      if (!document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        const gapiScript = document.createElement("script");
        gapiScript.src = "https://apis.google.com/js/api.js";
        gapiScript.async = true;
        gapiScript.defer = true;
        gapiScript.onload = () => {
          window.gapi.load("client:picker", () => setIsGapiLoaded(true));
        };
        document.body.appendChild(gapiScript);
      } else if (window.gapi) {
        window.gapi.load("client:picker", () => setIsGapiLoaded(true));
      }

      if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        const gisScript = document.createElement("script");
        gisScript.src = "https://accounts.google.com/gsi/client";
        gisScript.async = true;
        gisScript.defer = true;
        document.body.appendChild(gisScript);
      }
    };

    loadGoogleAPIs();
  }, []);

  useEffect(() => {
    void refreshQuota();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const overall = useMemo(() => {
    if (!queue.length) return { pct: 0, done: 0, total: 0, failed: 0 };
    const total = queue.length;
    const done = queue.filter((q) => q.status === "success").length;
    const failed = queue.filter((q) => q.status === "error").length;
    const pct = Math.round(queue.reduce((acc, q) => acc + (q.progress || 0), 0) / total);
    return { pct, done, total, failed };
  }, [queue]);

  const validateFile = (file: File) => {
    const okSize = file.size <= MAX_MB * 1024 * 1024;
    return { ok: okSize, okSize };
  };

  const addFilesToQueue = async (files: File[]) => {
    if (!files.length) return;

    const valid: File[] = [];
    const errors: string[] = [];

    for (const f of files) {
      const v = validateFile(f);
      if (!v.ok) errors.push(`${f.name} → trop volumineux`);
      else valid.push(f);
    }

    if (errors.length) {
      setStatus("error");
      setMessage(
        `Certains fichiers ont été refusés:\n- ${errors.slice(0, 6).join("\n- ")}${
          errors.length > 6 ? "\n- ..." : ""
        }\n\nMax ${MAX_MB} MB par fichier`
      );
    } else {
      setStatus("idle");
      setMessage("");
    }

    if (!valid.length) return;

    const items: QueueItem[] = valid.map((file) => ({
      id: uid(),
      file,
      status: "idle",
      progress: 0,
      uploadProgress: 0,
      relativePath: (file as any).webkitRelativePath || "",
    }));

    setQueue((prev) => {
      const sig = (f: File) => `${f.name}__${f.size}__${f.lastModified}`;
      const seen = new Set(prev.map((q) => sig(q.file)));

      const filtered = items.filter((it) => {
        const s = sig(it.file);
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
      });

      return [...prev, ...filtered];
    });
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const clearDone = () => {
    setQueue((prev) => prev.filter((q) => q.status !== "success"));
  };

  const onDropzoneClick = (e: React.MouseEvent) => {
    if (busy) return;
    if (e.target !== e.currentTarget) return;
    (document.getElementById(FILE_INPUT_ID) as HTMLInputElement | null)?.click();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (busy) return;
    await addFilesToQueue(Array.from(e.dataTransfer.files || []));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    await addFilesToQueue(files);
  };

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    await addFilesToQueue(files);
  };

  async function importOne(itemId: string) {
    if (!user) return;

    const item = queueRef.current.find((q) => q.id === itemId);
    if (!item) return;

    try {
      setStatus("uploading");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Non authentifié");

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: "uploading",
                message: "Envoi du fichier...",
                progress: Math.max(q.progress, 1),
              }
            : q
        )
      );

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-recipe`;
      const formData = new FormData();
      formData.append("file", item.file, item.file.name);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", apiUrl, true);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);

        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;

          const upPct = Math.round((evt.loaded / evt.total) * 100);
          const mixed = Math.min(70, Math.round((upPct / 100) * 70));

          setQueue((prev) =>
            prev.map((q) =>
              q.id === itemId
                ? {
                    ...q,
                    uploadProgress: upPct,
                    progress: Math.max(q.progress, mixed),
                  }
                : q
            )
          );
        };

        xhr.onerror = () => reject(new Error("Erreur réseau (upload)"));

        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText || "{}");

            if (xhr.status >= 200 && xhr.status < 300 && json?.success) {
              setQueue((prev) =>
                prev.map((q) =>
                  q.id === itemId
                    ? {
                        ...q,
                        status: "success",
                        message: `Recette "${json.title}" créée`,
                        resultTitle: json.title,
                        uploadProgress: 100,
                        progress: 100,
                      }
                    : q
                )
              );

              void refreshQuota();
              resolve();
            } else {
              if (json?.code === "AI_IMPORT_LIMIT_REACHED") {
                setStatus("error");
                setMessage(json?.error || "Limite atteinte, passez à Premium");
                void refreshQuota();
              }

              reject(new Error(json?.error || "Erreur lors de l'import"));
            }
          } catch {
            reject(new Error("Réponse serveur invalide"));
          }
        };

        let alive = false;
        let tickTimer: number | null = null;

        xhr.onreadystatechange = () => {
          if ((xhr.readyState === 2 || xhr.readyState === 3) && !alive) {
            alive = true;

            setQueue((prev) =>
              prev.map((q) =>
                q.id === itemId
                  ? {
                      ...q,
                      status: "processing",
                      message: "Analyse IA en cours...",
                      progress: Math.max(q.progress, 75),
                    }
                  : q
              )
            );

            const tick = () => {
              if (!alive) return;

              setQueue((prev) =>
                prev.map((q) => {
                  if (q.id !== itemId) return q;
                  if (q.status !== "processing") return q;

                  return {
                    ...q,
                    progress: Math.min(95, (q.progress || 75) + 1),
                  };
                })
              );

              tickTimer = window.setTimeout(tick, 250);
            };

            tickTimer = window.setTimeout(tick, 250);

            xhr.addEventListener("loadend", () => {
              alive = false;
              if (tickTimer) window.clearTimeout(tickTimer);
            });
          }
        };

        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'importation";

      setStatus("error");
      setMessage(
        errorMessage.includes("OPENAI_API_KEY")
          ? "⚠️ Clé OpenAI non configurée. Configure OPENAI_API_KEY dans les secrets Supabase."
          : errorMessage
      );

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: "error",
                message: errorMessage,
                progress: Math.min(q.progress || 0, 90),
              }
            : q
        )
      );
    } finally {
      setQueue((prev) => {
        const stillBusy = prev.some((q) => q.status === "uploading" || q.status === "processing");
        setStatus(stillBusy ? "processing" : "idle");
        return prev;
      });
    }
  }

  async function processQueue() {
    if (processingRef.current) return;
    if (!user) {
      setStatus("error");
      setMessage("Connecte-toi pour utiliser l'import IA.");
      return;
    }

    processingRef.current = true;
    setStatus("processing");
    setMessage("");

    try {
      while (true) {
        const latestQuota = await getAiImportQuota();
        setQuota(latestQuota);

        if (latestQuota.plan === "free" && !latestQuota.can_import) {
          setStatus("error");
          setMessage("Limite atteinte, passez à Premium");
          break;
        }

        const current = queueRef.current;
        const next = current.find((q) => q.status === "idle");

        if (!next) break;

        // eslint-disable-next-line no-await-in-loop
        await importOne(next.id);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur lors du traitement");
    } finally {
      processingRef.current = false;
      setStatus("idle");
      void refreshQuota();
    }
  }

  async function handleGoogleDrivePicker() {
    if (!isGapiLoaded) {
      setStatus("error");
      setMessage("Les APIs Google ne sont pas encore chargées. Réessaie dans quelques secondes.");
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!apiKey || !clientId) {
      setStatus("error");
      setMessage("⚠️ Configuration Google Drive manquante. Vérifie VITE_GOOGLE_API_KEY et VITE_GOOGLE_CLIENT_ID dans le .env.");
      return;
    }

    if (apiKey === "votre_cle_api_google_ici" || clientId === "votre_client_id_google_ici") {
      setStatus("error");
      setMessage("⚠️ Remplace les valeurs par défaut dans le .env avec tes vraies clés Google.");
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        callback: async (response: any) => {
          if (response.error) {
            setStatus("error");
            setMessage("Erreur d'authentification Google: " + response.error);
            return;
          }

          const token = response.access_token;

          try {
            await window.gapi.client.init({
              apiKey,
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            });

            const picker = new window.google.picker.PickerBuilder()
              .addView(window.google.picker.ViewId.DOCS)
              .setDeveloperKey(apiKey)
              .setOAuthToken(token)
              .setAppId(clientId.split("-")[0])
              .setCallback(async (data: any) => {
                if (data.action === window.google.picker.Action.PICKED) {
                  const file = data.docs[0];
                  await downloadFileFromDrive(file.id, token);
                }
              })
              .build();

            picker.setVisible(true);
          } catch (initError) {
            setStatus("error");
            setMessage(
              "Erreur init Google Picker: " +
                (initError instanceof Error ? initError.message : "Erreur inconnue")
            );
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      setStatus("error");
      setMessage(
        "Erreur ouverture Google Drive Picker: " +
          (error instanceof Error ? error.message : "Erreur inconnue")
      );
    }
  }

  async function downloadFileFromDrive(fileId: string, token: string) {
    try {
      setStatus("uploading");
      setMessage("Téléchargement depuis Google Drive...");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-drive-file`;
      const downloadResponse = await fetch(downloadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, accessToken: token }),
      });

      const downloadResult = await downloadResponse.json();
      if (!downloadResponse.ok || !downloadResult.success) {
        throw new Error(downloadResult.error || "Erreur lors du téléchargement");
      }

      const fileData = new Uint8Array(downloadResult.fileData);
      const blob = new Blob([fileData], { type: downloadResult.mimeType });
      const file = new File([blob], downloadResult.fileName, {
        type: downloadResult.mimeType,
        lastModified: Date.now(),
      });

      await addFilesToQueue([file]);

      setStatus("idle");
      setMessage(`Fichier téléchargé: ${file.name}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur téléchargement Google Drive");
    }
  }

  async function refreshQuota() {
    if (!user) {
      setQuota(null);
      return;
    }

    try {
      setQuotaLoading(true);
      const result = await getAiImportQuota();
      setQuota(result);
    } catch (error) {
      console.error("Erreur quota IA:", error);
    } finally {
      setQuotaLoading(false);
    }
  }

  const hasPendingImports = queue.some((q) => q.status === "idle");
  const canAnalyze = hasPendingImports && (quota?.plan === "premium" || quota == null || quota.can_import);
  const canClear = queue.some((q) => q.status === "success");

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] ring-1 ring-[#D4AF37]/20">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#D4AF37]">Import IA</p>
            <h3 className="truncate text-lg font-semibold text-white">Importer une recette</h3>

            <div className="mt-1 text-xs text-white/55">
              {quotaLoading ? (
                <span>Chargement du quota…</span>
              ) : quota ? (
                quota.plan === "premium" ? (
                  <span className="text-emerald-300">Premium • imports illimités</span>
                ) : quota.can_import ? (
                  <span>
                    <span className="font-semibold text-white">{quota.remaining}</span> imports IA restants
                  </span>
                ) : (
                  <span className="font-medium text-amber-300">Limite atteinte</span>
                )
              ) : (
                <span>Dépose un PDF, une photo ou un fichier.</span>
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
          <label htmlFor={FILE_INPUT_ID} className="cursor-pointer">
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10">
              <Upload className="h-4 w-4 text-[#D4AF37]" />
              Fichiers
            </span>
            <input
              id={FILE_INPUT_ID}
              type="file"
              accept="*/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={busy}
            />
          </label>

          <button
            type="button"
            onClick={() => (document.getElementById(FOLDER_INPUT_ID) as HTMLInputElement | null)?.click()}
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
            onChange={handleFolderSelect}
            className="hidden"
            disabled={busy}
          />

          <button
            type="button"
            onClick={handleGoogleDrivePicker}
            disabled={!isGapiLoaded || busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4285F4] px-3 py-3 text-sm font-semibold text-white ring-1 ring-[#4285F4]/40 transition hover:bg-[#357ae8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
            {busy ? <Loader className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Analyse…" : "Analyser"}
          </button>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={onDropzoneClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              (document.getElementById(FILE_INPUT_ID) as HTMLInputElement | null)?.click();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            if (!busy) setIsDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          className={[
            "hidden rounded-2xl border border-dashed px-4 py-4 transition sm:block",
            isDragOver ? "border-[#D4AF37]/60 bg-[#D4AF37]/10" : "border-white/15 bg-black/10 hover:border-white/25",
            busy ? "pointer-events-none opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-[#D4AF37] ring-1 ring-white/10">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Glisse-dépose tes fichiers ici</p>
                <p className="truncate text-xs text-white/45">Tous formats • Max {MAX_MB} MB/fichier</p>
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
                <p className="text-sm font-semibold text-white">File d'import</p>
                <p className="text-xs text-white/45">
                  {overall.done}/{overall.total} terminé(s) • {overall.pct}%
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
                style={{ width: `${clamp(overall.pct, 0, 100)}%` }}
              />
            </div>

            <div className="max-h-[230px] divide-y divide-white/10 overflow-y-auto">
              {queue.map((q) => (
                <div key={q.id} className="flex min-w-0 items-start gap-3 px-4 py-3">
                  <div className="mt-0.5 shrink-0 text-[#D4AF37]">
                    {q.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-300" />
                    ) : q.status === "error" ? (
                      <AlertCircle className="h-4 w-4 text-red-300" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                        {q.relativePath || q.file.name}
                      </p>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium ${statusBadge(q)}`}>
                        {statusLabel(q)}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/20 ring-1 ring-white/10">
                      <div
                        className="h-full rounded-full bg-[#D4AF37] transition-all"
                        style={{ width: `${clamp(q.progress, 0, 100)}%` }}
                      />
                    </div>

                    {q.message ? (
                      <p className="mt-1 line-clamp-2 text-xs text-white/55">{q.message}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(q.id)}
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
