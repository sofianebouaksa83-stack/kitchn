import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Sparkles, X, FolderOpen } from "lucide-react";
import { ui } from "../../../styles/ui";

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

const MAX_MB = 10;

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function RecipeImportAIDemoPanel() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processingRef = useRef(false);

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

  const validateFile = (file: File) => file.size <= MAX_MB * 1024 * 1024;

  const addFilesToQueue = async (files: File[]) => {
    if (!files.length) return;

    const valid: File[] = [];
    const errors: string[] = [];

    for (const f of files) {
      if (!validateFile(f)) errors.push(`${f.name} → trop volumineux`);
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

  async function importOne(itemId: string) {
    const item = queueRef.current.find((q) => q.id === itemId);
    if (!item) return;

    try {
      setStatus("uploading");

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId ? { ...q, status: "uploading", message: "Envoi du fichier…", progress: Math.max(q.progress, 1) } : q
        )
      );

      for (let p = 5; p <= 70; p += 5) {
        await sleep(80);
        setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, uploadProgress: p, progress: Math.max(q.progress, p) } : q)));
      }

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId ? { ...q, status: "processing", message: "Analyse IA en cours…", progress: Math.max(q.progress, 75) } : q
        )
      );

      for (let p = 75; p <= 95; p += 2) {
        await sleep(90);
        setQueue((prev) => prev.map((q) => (q.id === itemId ? { ...q, progress: Math.max(q.progress, p) } : q)));
      }

      const titleGuess = item.file.name.replace(/\.[^/.]+$/, "").slice(0, 48) || "Nouvelle recette";

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: "success",
                message: `Recette "${titleGuess}" créée • 2 section(s).`,
                resultTitle: titleGuess,
                uploadProgress: 100,
                progress: 100,
              }
            : q
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'importation";
      setStatus("error");
      setMessage(errorMessage);

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

  const onDropzoneClick = (e: React.MouseEvent) => {
    if (busy) return;
    if (e.target !== e.currentTarget) return;
    (document.getElementById("ai-demo-file-input") as HTMLInputElement | null)?.click();
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

  return (
    <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
      {/* Header */}
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
            <p className="text-xs text-slate-400 mt-2">Démo • Max {MAX_MB} MB par fichier</p>
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

      {/* Dropzone */}
      <div className="mt-6">
        <div
          role="button"
          tabIndex={0}
          onClick={onDropzoneClick}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && !busy
              ? (document.getElementById("ai-demo-file-input") as HTMLInputElement | null)?.click()
              : null
          }
          onDragEnter={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
          onDragOver={(e) => (e.preventDefault(), !busy && setIsDragOver(true))}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          className={[
            "relative rounded-3xl border-2 border-dashed p-6 sm:p-10 transition",
            "bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md",
            isDragOver ? "border-amber-400/60 ring-2 ring-amber-400/25 bg-black/10" : "border-white/15 hover:border-white/25",
            busy ? "opacity-60 pointer-events-none" : "cursor-pointer",
          ].join(" ")}
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-amber-300 mx-auto mb-4" />
            <div className="text-slate-200/90 text-sm mb-4">
              Glisse-dépose <span className="font-semibold">un ou plusieurs fichiers</span> ici
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label htmlFor="ai-demo-file-input" className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <span className={`${ui.btnPrimary} w-full sm:w-auto px-6 py-3 rounded-2xl`} onClick={(e) => e.stopPropagation()}>
                  <Upload className="w-5 h-5" />
                  Depuis ordinateur
                </span>
                <input id="ai-demo-file-input" type="file" multiple onChange={handleFileSelect} className="hidden" />
              </label>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  (document.getElementById("ai-demo-folder-input") as HTMLInputElement | null)?.click();
                }}
                disabled={busy}
                className={`${ui.btnGhost} w-full sm:w-auto px-6 py-3 rounded-2xl`}
                title="Importer un dossier local (démo)"
              >
                <FolderOpen className="w-5 h-5" />
                Choisir un dossier
              </button>

              <input
                id="ai-demo-folder-input"
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory="true"
                onChange={handleFolderSelect}
                className="hidden"
              />

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium bg-[#4285F4]/60 text-white ring-1 ring-[#4285F4]/30 opacity-60 cursor-not-allowed"
                title="Google Drive désactivé en démo"
              >
                Depuis Google Drive
              </button>
            </div>

            {isDragOver && !busy && <p className="mt-4 text-xs text-amber-200/90">Relâche pour ajouter à la liste ✨</p>}
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/6 to-transparent opacity-60" />
        </div>
      </div>

      {/* Global progress */}
      {queue.length > 0 && (
        <div className="mt-6 rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-100 font-semibold">
              Progression globale <span className="text-slate-400 font-normal">• {overall.done}/{overall.total}</span>
            </div>
            <div className="text-sm text-slate-200/90">{overall.pct}%</div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
            <div className="h-full bg-amber-400/80" style={{ width: `${overall.pct}%` }} />
          </div>
        </div>
      )}

      {/* Queue */}
      {queue.length > 0 && (
        <div className="mt-6 grid lg:grid-cols-2 gap-5">
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

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedId(q.id)}
                    className={[
                      "w-full text-left rounded-2xl border p-3 transition",
                      "bg-black/10 ring-1 ring-white/10",
                      active ? "border-amber-400/30" : "border-white/10 hover:border-white/20",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-amber-300 shrink-0" />

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

                        <div className="mt-2 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                          <div className="h-full bg-amber-400/80" style={{ width: `${q.progress}%` }} />
                        </div>

                        {q.message && <div className="mt-2 text-xs text-slate-300/90 line-clamp-2">{q.message}</div>}
                      </div>

                      <button
                        type="button"
                        className="ml-2 inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 text-slate-200"
                        onClick={(e) => (e.preventDefault(), e.stopPropagation(), removeItem(q.id))}
                        title="Retirer"
                        aria-label="Retirer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md">
            <div className="text-sm font-semibold text-slate-100">
              Sélection <span className="text-xs text-slate-400 font-normal truncate">• {selected?.relativePath || selected?.file?.name || "—"}</span>
            </div>

            {status === "error" && message && (
              <div className="mt-5 rounded-2xl bg-red-500/10 ring-1 ring-red-400/20 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 font-medium text-sm whitespace-pre-wrap">{message}</p>
              </div>
            )}

            {queue.length > 0 && queue.every((q) => q.status === "success") && (
              <div className="mt-5 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-200 font-medium">Tout est terminé ✅ ({queue.length} recette(s) importée(s))</p>
              </div>
            )}

            {!message && selected?.message && (
              <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="text-xs text-slate-300/90 whitespace-pre-wrap">{selected.message}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
