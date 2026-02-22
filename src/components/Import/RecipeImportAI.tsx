import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
  X,
  FolderOpen,
} from "lucide-react";
import { ui } from "../../styles/ui";

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
  progress: number; // 0..100
  uploadProgress: number; // 0..100
  resultTitle?: string;
  relativePath?: string;
};

const MAX_MB = 10;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function statusBadge(q: QueueItem) {
  if (q.status === "success") return "text-emerald-200 bg-emerald-500/10 border-emerald-500/20";
  if (q.status === "error") return "text-red-200 bg-red-500/10 border-red-500/20";
  if (q.status === "processing" || q.status === "uploading")
    return "text-amber-200 bg-amber-500/10 border-amber-500/20";
  return "text-slate-200 bg-white/5 border-white/10";
}

function statusLabel(q: QueueItem) {
  if (q.status === "idle") return "Prêt";
  if (q.status === "uploading") return `Upload ${q.uploadProgress}%`;
  if (q.status === "processing") return "Analyse…";
  if (q.status === "success") return "Terminé";
  return "Erreur";
}

export function RecipeImportAI() {
  const { user } = useAuth();

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  const [isGapiLoaded, setIsGapiLoaded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processingRef = useRef(false);

  // ✅ ajuste si ta navbar du bas est plus grande
  const MOBILE_NAVBAR_OFFSET_PX = 65;

  useEffect(() => {
    const loadGoogleAPIs = () => {
      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        window.gapi.load("client:picker", () => setIsGapiLoaded(true));
      };
      document.body.appendChild(gapiScript);

      const gisScript = document.createElement("script");
      gisScript.src = "https://accounts.google.com/gsi/client";
      gisScript.async = true;
      gisScript.defer = true;
      document.body.appendChild(gisScript);
    };

    loadGoogleAPIs();
  }, []);

  const overall = useMemo(() => {
    if (!queue.length) return { pct: 0, done: 0, total: 0, failed: 0 };
    const total = queue.length;
    const done = queue.filter((q) => q.status === "success").length;
    const failed = queue.filter((q) => q.status === "error").length;
    const pct = Math.round(queue.reduce((acc, q) => acc + (q.progress || 0), 0) / total);
    return { pct, done, total, failed };
  }, [queue]);

  const selected = useMemo(
    () => queue.find((q) => q.id === selectedId) || queue[0] || null,
    [queue, selectedId]
  );

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

      const next = [...prev, ...filtered];
      setSelectedId((sid) => sid || filtered[0]?.id || next[0]?.id || null);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const next = prev.filter((q) => q.id !== id);
      setSelectedId((sid) => (sid === id ? next[0]?.id ?? null : sid));
      return next;
    });
  };

  const clearDone = () => {
    setQueue((prev) => {
      const next = prev.filter((q) => q.status !== "success");
      setSelectedId((sid) => (sid && next.some((q) => q.id === sid) ? sid : next[0]?.id ?? null));
      return next;
    });
  };

  const onDropzoneClick = (e: React.MouseEvent) => {
    if (busy) return;
    if (e.target !== e.currentTarget) return;
    (document.getElementById("ai-file-input-desktop") as HTMLInputElement | null)?.click();
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
            ? { ...q, status: "uploading", message: "Envoi du fichier...", progress: Math.max(q.progress, 1) }
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
            prev.map((q) => (q.id === itemId ? { ...q, uploadProgress: upPct, progress: Math.max(q.progress, mixed) } : q))
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
                        message: `Recette "${json.title}" créée • ${json.sectionsCount} section(s).`,
                        resultTitle: json.title,
                        uploadProgress: 100,
                        progress: 100,
                      }
                    : q
                )
              );
              resolve();
            } else reject(new Error(json?.error || "Erreur lors de l'import"));
          } catch {
            reject(new Error("Réponse serveur invalide"));
          }
        };

        // fake progress pendant processing
        let alive = false;
        let tickTimer: number | null = null;

        xhr.onreadystatechange = () => {
          if ((xhr.readyState === 2 || xhr.readyState === 3) && !alive) {
            alive = true;

            setQueue((prev) =>
              prev.map((q) =>
                q.id === itemId
                  ? { ...q, status: "processing", message: "Analyse IA en cours...", progress: Math.max(q.progress, 75) }
                  : q
              )
            );

            const tick = () => {
              if (!alive) return;
              setQueue((prev) =>
                prev.map((q) => {
                  if (q.id !== itemId) return q;
                  if (q.status !== "processing") return q;
                  return { ...q, progress: Math.min(95, (q.progress || 75) + 1) };
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
          ? "⚠️ Clé OpenAI non configurée. Veuillez configurer OPENAI_API_KEY dans les secrets Supabase."
          : errorMessage
      );

      setQueue((prev) =>
        prev.map((q) => (q.id === itemId ? { ...q, status: "error", message: errorMessage, progress: Math.min(q.progress || 0, 90) } : q))
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
    if (!user) return;

    processingRef.current = true;
    setStatus("processing");
    setMessage("");

    try {
      while (true) {
        const current = queueRef.current;
        const next = current.find((q) => q.status === "idle" || q.status === "error");
        if (!next) break;
        // eslint-disable-next-line no-await-in-loop
        await importOne(next.id);
      }
    } finally {
      processingRef.current = false;
      setStatus("idle");
    }
  }

  function viewRecipe() {
    window.location.reload();
  }

  async function handleGoogleDrivePicker() {
    if (!isGapiLoaded) {
      setStatus("error");
      setMessage("Les APIs Google ne sont pas encore chargées. Veuillez réessayer.");
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!apiKey || !clientId) {
      setStatus("error");
      setMessage("⚠️ Configuration Google Drive manquante. Vérifiez VITE_GOOGLE_API_KEY et VITE_GOOGLE_CLIENT_ID dans le .env.");
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
              "Erreur init Google Picker: " + (initError instanceof Error ? initError.message : "Erreur inconnue")
            );
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      setStatus("error");
      setMessage("Erreur ouverture Google Drive Picker: " + (error instanceof Error ? error.message : "Erreur inconnue"));
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

  const canAnalyze = queue.some((q) => q.status === "idle" || q.status === "error");
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

          {/* MOBILE Sources */}
          <div className="sm:hidden mt-5 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-3 max-w-full overflow-hidden">
            <div className="text-sm font-semibold text-slate-100">Sources</div>
            <div className="text-xs text-slate-400 mt-1">Tous formats • Max {MAX_MB} MB/fichier</div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <label htmlFor="ai-file-input-mobile" className="cursor-pointer">
                <span className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition">
                  <Upload className="w-5 h-5 text-amber-300" />
                  Mes fichiers
                </span>
                <input
                  id="ai-file-input-mobile"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={busy}
                />
              </label>

              <button
                type="button"
                onClick={handleGoogleDrivePicker}
                disabled={!isGapiLoaded || busy}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40 hover:bg-[#357ae8] hover:ring-[#4285F4]/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                Drive
              </button>
            </div>
          </div>

          {/* DESKTOP drag/drop */}
          <div className="mt-5 hidden sm:block rounded-2xl bg-white/[0.05] ring-1 ring-white/10 px-4 py-4 max-w-full overflow-hidden">
            <div className="flex items-start sm:items-center justify-between gap-3 max-w-full">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">Sources</div>
                <div className="text-xs text-slate-400 mt-1">
                  Tous formats • Max {MAX_MB} MB/fichier
                </div>
              </div>

              <div className="flex gap-2 items-center shrink-0">
                <label htmlFor="ai-file-input-desktop" className="cursor-pointer">
                  <span className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition">
                    <Upload className="w-4 h-4 text-amber-300" />
                    Mes fichiers
                  </span>
                  <input
                    id="ai-file-input-desktop"
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={busy}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => (document.getElementById("ai-folder-input") as HTMLInputElement | null)?.click()}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FolderOpen className="w-4 h-4 text-amber-300" />
                  Dossier
                </button>

                <input
                  id="ai-folder-input"
                  type="file"
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
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40 hover:bg-[#357ae8] hover:ring-[#4285F4]/70 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                  </svg>
                  Drive
                </button>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={onDropzoneClick}
              onDragEnter={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
              onDragOver={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={[
                "mt-3 rounded-xl border border-dashed px-4 py-3 transition",
                isDragOver ? "border-amber-400/60 bg-black/10" : "border-white/15 hover:border-white/25",
                busy ? "opacity-60 pointer-events-none" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3 max-w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <Upload className="w-4 h-4 text-amber-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-200/90 truncate">
                      Glisse-dépose des fichiers ici, ou clique pour choisir
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Import IA en file (un par un)</div>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10 shrink-0">
                  Ajouter
                </span>
              </div>
            </div>
          </div>

          {/* Queue + Selection */}
          {queue.length > 0 && (
            <div className="mt-5 grid lg:grid-cols-2 gap-4 max-w-full">
              {/* ✅ CARTE FICHIERS : ne sort JAMAIS */}
              <div className="w-full max-w-full rounded-2xl bg-white/[0.05] ring-1 ring-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 min-w-0 max-w-full">
                  <div className="text-sm font-semibold text-slate-100 shrink-0">Fichiers</div>
                  <div className="ml-auto text-xs text-slate-400 truncate max-w-[52%]">
                    Clique pour sélectionner
                  </div>
                </div>

                <div className="divide-y divide-white/10 max-w-full">
                  {queue.map((q) => {
                    const active = q.id === (selected?.id || null);

                    return (
                      <div
                        key={q.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(q.id)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedId(q.id)}
                        className={[
                          "px-4 py-3 transition outline-none max-w-full",
                          active ? "bg-white/[0.04]" : "hover:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        {/* ✅ Anti overflow ultime */}
                        <div className="flex items-start gap-3 min-w-0 max-w-full overflow-hidden">
                          <FileText className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

                          {/* ✅ Le bloc central doit pouvoir shrink */}
                          <div className="flex-1 min-w-0 max-w-full">
                            {/* ✅ TITRE = w-0 + flex-1 (anti débordement même sans espaces) */}
                            <div className="flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
                              <div className="w-0 flex-1 min-w-0 truncate text-sm text-slate-100 font-medium">
                                {q.relativePath || q.file.name}
                              </div>

                              <span className={`shrink-0 text-[11px] px-2 py-1 rounded-xl border ${statusBadge(q)}`}>
                                {statusLabel(q)}
                              </span>
                            </div>

                            <div className="mt-2 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden max-w-full">
                              <div
                                className="h-full bg-amber-400/80 rounded-full"
                                style={{ width: `${clamp(q.progress, 0, 100)}%` }}
                              />
                            </div>

                            {q.message ? (
                              <div className="mt-2 text-xs text-slate-300/90 line-clamp-2">{q.message}</div>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            className="shrink-0 ml-1 inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeItem(q.id);
                            }}
                            title="Retirer"
                            aria-label="Retirer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-full max-w-full rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-4 overflow-hidden">
                <div className="text-sm font-semibold text-slate-100 min-w-0">
                  Sélection
                  <span className="text-xs text-slate-400 font-normal truncate">
                    {" "}
                    • {selected?.relativePath || selected?.file?.name || "—"}
                  </span>
                </div>

                {queue.length > 0 && queue.every((q) => q.status === "success") && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-3 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                      <p className="text-emerald-200 font-medium text-sm">
                        Tout est terminé ✅ ({queue.length} recette(s) importée(s))
                      </p>
                    </div>

                    <button onClick={viewRecipe} className={`${ui.btnGhost} w-full py-3 rounded-2xl`} type="button">
                      Voir mes recettes
                    </button>
                  </div>
                )}

                {status === "error" && message && (
                  <div className="mt-4 rounded-xl bg-red-500/10 ring-1 ring-red-400/20 p-3 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 font-medium text-sm whitespace-pre-wrap">{message}</p>
                  </div>
                )}

                {!message && queue.length > 0 && selected?.message && (
                  <div className="mt-4 rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-xs text-slate-300/90 whitespace-pre-wrap">{selected.message}</div>
                  </div>
                )}
              </div>
            </div>
          )}
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