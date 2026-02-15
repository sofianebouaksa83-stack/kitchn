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
  progress: number; // 0..100 (mix upload + processing)
  uploadProgress: number; // vrai % upload 0..100
  resultTitle?: string;
  relativePath?: string; // utile pour import de dossier
};

const MAX_MB = 10;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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

  // Toujours la dernière queue (évite closures)
  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processingRef = useRef(false);

  // Google APIs (Drive Picker)
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
    if (!queue.length) return { pct: 0, done: 0, total: 0 };
    const total = queue.length;
    const done = queue.filter((q) => q.status === "success").length;
    const pct = Math.round(queue.reduce((acc, q) => acc + (q.progress || 0), 0) / total);
    return { pct, done, total };
  }, [queue]);

  const selected = useMemo(
    () => queue.find((q) => q.id === selectedId) || queue[0] || null,
    [queue, selectedId]
  );

  // ✅ Tous types acceptés : seule contrainte = taille
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
      if (!v.ok) {
        errors.push(`${f.name} → trop volumineux`);
      } else {
        valid.push(f);
      }
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

    // ✅ Anti-dup solide
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

  // ✅ clic dropzone seulement sur fond
  const onDropzoneClick = (e: React.MouseEvent) => {
    if (busy) return;
    if (e.target !== e.currentTarget) return;
    (document.getElementById("ai-file-input") as HTMLInputElement | null)?.click();
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
              q.id === itemId ? { ...q, uploadProgress: upPct, progress: Math.max(q.progress, mixed) } : q
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
                        message: `Recette "${json.title}" créée • ${json.sectionsCount} section(s).`,
                        resultTitle: json.title,
                        uploadProgress: 100,
                        progress: 100,
                      }
                    : q
                )
              );
              resolve();
            } else {
              reject(new Error(json?.error || "Erreur lors de l'import"));
            }
          } catch {
            reject(new Error("Réponse serveur invalide"));
          }
        };

        // "fake progress" pendant l'analyse IA
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
        prev.map((q) =>
          q.id === itemId
            ? { ...q, status: "error", message: errorMessage, progress: Math.min(q.progress || 0, 90) }
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
      setMessage(
        "⚠️ Configuration Google Drive manquante. Vérifiez VITE_GOOGLE_API_KEY et VITE_GOOGLE_CLIENT_ID dans le fichier .env."
      );
      return;
    }

    if (apiKey === "votre_cle_api_google_ici" || clientId === "votre_client_id_google_ici") {
      setStatus("error");
      setMessage("⚠️ Veuillez remplacer les valeurs par défaut dans le fichier .env avec vos vraies clés Google.");
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
              "Erreur lors de l’initialisation de Google Picker: " +
                (initError instanceof Error ? initError.message : "Erreur inconnue")
            );
          }
        },
      });

      tokenClient.requestAccessToken();
    } catch (error) {
      setStatus("error");
      setMessage(
        "Erreur lors de l'ouverture de Google Drive Picker: " +
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

      if (!downloadResult.fileData || downloadResult.fileData.length === 0) {
        throw new Error("Fichier vide reçu depuis Google Drive");
      }

      const fileData = new Uint8Array(downloadResult.fileData);
      const blob = new Blob([fileData], { type: downloadResult.mimeType });
      const file = new File([blob], downloadResult.fileName, {
        type: downloadResult.mimeType,
        lastModified: Date.now(),
      });

      await addFilesToQueue([file]);

      setStatus("idle");
      setMessage(`Fichier téléchargé: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Erreur lors du téléchargement depuis Google Drive");
    }
  }

  // 🔹 Bloc boutons (utilisé sur mobile + desktop)
  const ImportButtons = ({ compact }: { compact?: boolean }) => (
    <div className={["flex flex-col sm:flex-row gap-3 justify-center", compact ? "" : ""].join(" ")}>
      {/* Fichiers */}
      <label htmlFor="ai-file-input" className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <span className={`${ui.btnPrimary} w-full sm:w-auto px-6 py-3 rounded-2xl`}>
          <Upload className="w-5 h-5" />
          Depuis mes fichiers
        </span>
        <input id="ai-file-input" type="file" multiple onChange={handleFileSelect} className="hidden" />
      </label>

      {/* Dossier (PC) - caché sur mobile */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          (document.getElementById("ai-folder-input") as HTMLInputElement | null)?.click();
        }}
        disabled={busy}
        className={`${ui.btnGhost} hidden sm:inline-flex w-full sm:w-auto px-6 py-3 rounded-2xl`}
        title="Importer un dossier local (PC)"
      >
        <FolderOpen className="w-5 h-5" />
        Choisir un dossier
      </button>

      <input
        id="ai-folder-input"
        type="file"
        multiple
        // @ts-ignore - attribut non standard, supporté Chrome/Edge
        webkitdirectory="true"
        onChange={handleFolderSelect}
        className="hidden"
      />

      {/* Google Drive */}
      <button
        type="button"
        onClick={(e) => (e.stopPropagation(), handleGoogleDrivePicker())}
        disabled={!isGapiLoaded || busy}
        className={[
          "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium",
          "bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40",
          "hover:bg-[#357ae8] hover:ring-[#4285F4]/70 transition",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
        title={!isGapiLoaded ? "Chargement Google en cours..." : "Importer depuis Google Drive"}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
        </svg>
        Depuis Google Drive
      </button>
    </div>
  );

  return (
    <div className={`${ui.dashboardBg} overflow-x-hidden`}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          {/* ✅ HEADER (plein écran, plus de grosse carte) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Import</h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  Dépose des fichiers, Kitch’n structure automatiquement la recette.
                </p>
                <p className="text-xs text-slate-400 mt-2">Tous formats • Max {MAX_MB} MB par fichier</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button
                type="button"
                onClick={processQueue}
                disabled={busy || !queue.some((q) => q.status === "idle" || q.status === "error")}
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
                    Analyser la file
                  </>
                )}
              </button>

              <button
                onClick={clearDone}
                disabled={busy || !queue.some((q) => q.status === "success")}
                className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl`}
                type="button"
              >
                Nettoyer
              </button>
            </div>
          </div>

          {/* Tiles */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-5 py-4">
              <div className="text-sm font-semibold text-slate-100">{queue.length} fichiers</div>
              <div className="text-xs text-slate-300/70 mt-1">Dans la file</div>
            </div>
            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-5 py-4">
              <div className="text-sm font-semibold text-slate-100">{overall.done} terminés</div>
              <div className="text-xs text-slate-300/70 mt-1">Imports OK</div>
            </div>
            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-5 py-4">
              <div className="text-sm font-semibold text-slate-100">{overall.pct}%</div>
              <div className="text-xs text-slate-300/70 mt-1">Progression</div>
            </div>
            <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-5 py-4">
              <div className="text-sm font-semibold text-slate-100">Tous formats</div>
              <div className="text-xs text-slate-300/70 mt-1">Supportés</div>
            </div>
          </div>

          {/* ✅ MOBILE : pas de gros fond drag&drop */}
          <div className="mt-6 sm:hidden">
            <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-5 h-5 text-amber-300" />
                <div className="text-sm text-slate-200/90">
                  Ajoute des fichiers pour import IA
                </div>
              </div>
              <ImportButtons compact />
            </div>
          </div>

          {/* ✅ DESKTOP : zone drag & drop conservée */}
          <div className="mt-6 hidden sm:block">
            <div
              role="button"
              tabIndex={0}
              onClick={onDropzoneClick}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && !busy
                  ? (document.getElementById("ai-file-input") as HTMLInputElement | null)?.click()
                  : null
              }
              onDragEnter={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
              onDragOver={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              className={[
                "relative rounded-3xl border-2 border-dashed p-6 sm:p-10 transition",
                "bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md",
                isDragOver
                  ? "border-amber-400/60 ring-2 ring-amber-400/25 bg-black/10"
                  : "border-white/15 hover:border-white/25",
                busy ? "opacity-60 pointer-events-none" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="text-center">
                <Upload className="w-12 h-12 text-amber-300 mx-auto mb-4" />
                <div className="text-slate-200/90 text-sm mb-4">
                  Glisse-dépose <span className="font-semibold">un ou plusieurs fichiers</span> ici
                </div>

                <ImportButtons />

                {isDragOver && !busy && (
                  <p className="mt-4 text-xs text-amber-200/90">Relâche pour ajouter à la liste ✨</p>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/6 to-transparent opacity-60" />
            </div>
          </div>

          {/* Global progress */}
          {queue.length > 0 && (
            <div className="mt-6 rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-100 font-semibold">
                  Progression globale
                  <span className="text-slate-400 font-normal"> • {overall.done}/{overall.total} terminé(s)</span>
                </div>
                <div className="text-sm text-slate-200/90">{overall.pct}%</div>
              </div>

              <div className="mt-3 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden h-3 sm:h-2">
                <div
                  className="h-full bg-amber-400/80 rounded-full"
                  style={{ width: `${overall.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Queue + Result */}
          {queue.length > 0 && (
            <div className="mt-6 grid lg:grid-cols-2 gap-5">
              {/* Queue */}
              <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-slate-100">Fichiers</div>
                  <div className="text-xs text-slate-400">Clique pour sélectionner</div>
                </div>

                <div className="space-y-2">
                  {queue.map((q) => {
                    const active = q.id === (selected?.id || null);

                    const badge =
                      q.status === "success"
                        ? "text-emerald-200 bg-emerald-500/10 border-emerald-500/20"
                        : q.status === "error"
                        ? "text-red-200 bg-red-500/10 border-red-500/20"
                        : q.status === "processing" || q.status === "uploading"
                        ? "text-amber-200 bg-amber-500/10 border-amber-500/20"
                        : "text-slate-200 bg-white/5 border-white/10";

                    // ✅ IMPORTANT: plus de <button> dans <button>
                    return (
                      <div
                        key={q.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(q.id)}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedId(q.id)}
                        className={[
                          "w-full text-left rounded-2xl border px-3 py-2.5 transition outline-none",
                          "bg-black/10 ring-1 ring-white/10",
                          active ? "border-amber-400/30" : "border-white/10 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-amber-300 shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm text-slate-100 font-medium truncate">
                                {q.relativePath || q.file.name}
                              </div>

                              <span className={`text-[11px] px-2 py-1 rounded-xl border ${badge}`}>
                                {q.status === "idle"
                                  ? "Prêt"
                                  : q.status === "uploading"
                                  ? `Upload ${q.uploadProgress}%`
                                  : q.status === "processing"
                                  ? "Analyse…"
                                  : q.status === "success"
                                  ? "Terminé"
                                  : "Erreur"}
                              </span>
                            </div>

                              <div className="mt-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden h-3 sm:h-2">
                                <div
                                  className="h-full bg-amber-400/80 rounded-full"
                                  style={{ width: `${q.progress}%` }}
                                />
                              </div>

                            {q.message && (
                              <div className="mt-2 text-xs text-slate-300/90 line-clamp-2">{q.message}</div>
                            )}
                          </div>

                          <button
                            type="button"
                            className="ml-2 inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 text-slate-200"
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

              {/* Result / Messages */}
              <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="text-sm font-semibold text-slate-100">
                  Sélection
                  <span className="text-xs text-slate-400 font-normal truncate">
                    {" "}
                    • {selected?.relativePath || selected?.file?.name || "—"}
                  </span>
                </div>

                {queue.length > 0 && queue.every((q) => q.status === "success") && (
                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                      <p className="text-emerald-200 font-medium">
                        Tout est terminé ✅ ({queue.length} recette(s) importée(s))
                      </p>
                    </div>

                    <button onClick={viewRecipe} className={`${ui.btnGhost} w-full py-3 rounded-2xl`} type="button">
                      Voir mes recettes
                    </button>
                  </div>
                )}

                {status === "error" && message && (
                  <div className="mt-5 rounded-2xl bg-red-500/10 ring-1 ring-red-400/20 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 font-medium text-sm whitespace-pre-wrap">{message}</p>
                  </div>
                )}

                {!message && queue.length > 0 && selected?.message && (
                  <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                    <div className="text-xs text-slate-300/90 whitespace-pre-wrap">{selected.message}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
