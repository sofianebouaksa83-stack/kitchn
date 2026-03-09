import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
  X,
  FolderOpen,
  Download,
  Search,
  FileDown,
} from "lucide-react";
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

type FakeLibraryFile = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  folder?: string;
};

const MAX_MB = 10;

const FAKE_LIBRARY_FILES: FakeLibraryFile[] = [
  {
    id: "lib-1",
    name: "fiche-technique-saumon-gravlax.pdf",
    sizeLabel: "1.2 MB",
    type: "PDF",
    folder: "Recettes froides",
  },
  {
    id: "lib-2",
    name: "dessert-citron-restaurant.docx",
    sizeLabel: "860 KB",
    type: "Word",
    folder: "Desserts",
  },
  {
    id: "lib-3",
    name: "base-sauce-vin-rouge.txt",
    sizeLabel: "72 KB",
    type: "Texte",
    folder: "Sauces",
  },
  {
    id: "lib-4",
    name: "risotto-truffe-noire.pdf",
    sizeLabel: "2.4 MB",
    type: "PDF",
    folder: "Plats chauds",
  },
  {
    id: "lib-5",
    name: "volaille-morilles.docx",
    sizeLabel: "1.1 MB",
    type: "Word",
    folder: "Signature",
  },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function createFakeFile(fake: FakeLibraryFile) {
  const content = `Démo Kitch’n

Nom: ${fake.name}
Type: ${fake.type}
Dossier: ${fake.folder || "Sans dossier"}

Ingrédients
- Produit 1
- Produit 2

Étapes
1. Préparer
2. Cuire
3. Dresser
`;

  return new File([content], fake.name, {
    type:
      fake.type === "PDF"
        ? "application/pdf"
        : fake.type === "Word"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "text/plain",
    lastModified: Date.now(),
  });
}

export function RecipeImportAIDemo() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryDownloadingId, setLibraryDownloadingId] = useState<string | null>(null);

  const queueRef = useRef<QueueItem[]>([]);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processingRef = useRef(false);

  const overall = useMemo(() => {
    if (!queue.length) return { pct: 0, done: 0, total: 0 };
    const total = queue.length;
    const done = queue.filter((q) => q.status === "success").length;
    const pct = Math.round(
      queue.reduce((acc, q) => acc + (q.progress || 0), 0) / total
    );
    return { pct, done, total };
  }, [queue]);

  const selected = useMemo(
    () => queue.find((q) => q.id === selectedId) || queue[0] || null,
    [queue, selectedId]
  );

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    if (!q) return FAKE_LIBRARY_FILES;
    return FAKE_LIBRARY_FILES.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        (f.folder || "").toLowerCase().includes(q)
    );
  }, [librarySearch]);

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
        `Certains fichiers ont été refusés:\n- ${errors
          .slice(0, 6)
          .join("\n- ")}${errors.length > 6 ? "\n- ..." : ""}\n\nMax ${MAX_MB} MB par fichier`
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
      setSelectedId((sid) =>
        sid && next.some((q) => q.id === sid) ? sid : next[0]?.id ?? null
      );
      return next;
    });
  };

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

  const handleFakeLibraryDownload = async (fake: FakeLibraryFile) => {
    if (busy || libraryDownloadingId) return;

    setLibraryDownloadingId(fake.id);

    await sleep(350);
    const file = createFakeFile(fake);
    await addFilesToQueue([file]);
    await sleep(350);

    setLibraryDownloadingId(null);
    setIsLibraryOpen(false);
    setLibrarySearch("");
    setMessage(`Fichier ajouté depuis la bibliothèque : ${fake.name}`);
    setStatus("idle");
  };

  async function importOne(itemId: string) {
    const item = queueRef.current.find((q) => q.id === itemId);
    if (!item) return;

    try {
      setStatus("uploading");

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: "uploading",
                message: "Téléchargement du fichier…",
                progress: Math.max(q.progress, 1),
              }
            : q
        )
      );

      for (let p = 5; p <= 70; p += 5) {
        await sleep(80);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === itemId
              ? {
                  ...q,
                  uploadProgress: p,
                  progress: Math.max(q.progress, p),
                }
              : q
          )
        );
      }

      setQueue((prev) =>
        prev.map((q) =>
          q.id === itemId
            ? {
                ...q,
                status: "processing",
                message: "Analyse IA en cours…",
                progress: Math.max(q.progress, 75),
              }
            : q
        )
      );

      for (let p = 75; p <= 95; p += 2) {
        await sleep(90);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === itemId
              ? { ...q, progress: Math.max(q.progress, p) }
              : q
          )
        );
      }

      const titleGuess =
        item.file.name.replace(/\.[^/.]+$/, "").slice(0, 48) || "Nouvelle recette";

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
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de l'importation";

      setStatus("error");
      setMessage(errorMessage);

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
        const stillBusy = prev.some(
          (q) => q.status === "uploading" || q.status === "processing"
        );
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
        const next = current.find(
          (q) => q.status === "idle" || q.status === "error"
        );
        if (!next) break;
        await importOne(next.id);
      }
    } finally {
      processingRef.current = false;
      setStatus("idle");
    }
  }

  return (
    <div className={`${ui.dashboardBg} overflow-x-hidden`}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-5xl mx-auto">
          {/* Header simplifié */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                  Import IA
                </h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  Dépose des fichiers, Kitch’n structure automatiquement la recette.
                </p>
                <p className="text-xs text-emerald-300 mt-2">
                  Premium • imports IA illimités
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button
                type="button"
                onClick={processQueue}
                disabled={
                  busy || !queue.some((q) => q.status === "idle" || q.status === "error")
                }
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
                disabled={busy || !queue.some((q) => q.status === "success")}
                className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl`}
                type="button"
              >
                Nettoyer
              </button>
            </div>
          </div>

          {/* Sources */}
          <div className="mt-5 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 px-4 py-4">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">Sources</div>
                <div className="text-xs text-slate-400 mt-1">
                  Tous formats • Max {MAX_MB} MB/fichier
                </div>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  Mes fichiers
                </button>

                <button
                  type="button"
                  onClick={() =>
                    (document.getElementById("ai-demo-folder-input") as HTMLInputElement | null)?.click()
                  }
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <FolderOpen className="w-4 h-4 text-amber-300" />
                  Dossier
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
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-[#4285F4] text-white ring-1 ring-[#4285F4]/40 opacity-60 cursor-not-allowed"
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
                "mt-3 rounded-xl border border-dashed px-4 py-4 transition",
                isDragOver
                  ? "border-amber-400/60 bg-black/10"
                  : "border-white/15 hover:border-white/25",
                busy ? "opacity-60 pointer-events-none" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
                <div className="flex items-center gap-2 min-w-0">
                  <Upload className="w-4 h-4 text-amber-300 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-200/90 truncate">
                      Glisse-dépose des fichiers ici, ou clique pour choisir
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

              <input
                id="ai-demo-file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Progress globale */}
          {queue.length > 0 && (
            <div className="mt-5 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-100 font-semibold">
                  Progression globale
                  <span className="text-slate-400 font-normal">
                    {" "}
                    • {overall.done}/{overall.total} terminé(s)
                  </span>
                </div>
                <div className="text-sm text-slate-200/90">{overall.pct}%</div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400/80"
                  style={{ width: `${overall.pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Queue + sélection */}
          {queue.length > 0 && (
            <div className="mt-5 grid lg:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/[0.05] ring-1 ring-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-semibold text-slate-100">Fichiers</div>
                  <div className="ml-auto text-xs text-slate-400">
                    Clique pour sélectionner
                  </div>
                </div>

                <div className="divide-y divide-white/10">
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
                      <div
                        key={q.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(q.id)}
                        className={[
                          "px-4 py-3 transition",
                          active ? "bg-white/[0.04]" : "hover:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-0 flex-1 min-w-0 truncate text-sm text-slate-100 font-medium">
                                {q.relativePath || q.file.name}
                              </div>

                              <span className={`shrink-0 text-[11px] px-2 py-1 rounded-xl border ${badge}`}>
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
                              <div
                                className="h-full bg-amber-400/80"
                                style={{ width: `${q.progress}%` }}
                              />
                            </div>

                            {q.message && (
                              <div className="mt-2 text-xs text-slate-300/90 line-clamp-2">
                                {q.message}
                              </div>
                            )}
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

              <div className="rounded-2xl bg-white/[0.05] ring-1 ring-white/10 p-4">
                <div className="text-sm font-semibold text-slate-100">
                  Sélection
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    • {selected?.relativePath || selected?.file?.name || "—"}
                  </span>
                </div>

                {status === "error" && message && (
                  <div className="mt-5 rounded-2xl bg-red-500/10 ring-1 ring-red-400/20 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                    <p className="text-red-200 font-medium text-sm whitespace-pre-wrap">
                      {message}
                    </p>
                  </div>
                )}

                {queue.length > 0 && queue.every((q) => q.status === "success") && (
                  <div className="mt-5 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-200 font-medium">
                      Tout est terminé ✅ ({queue.length} recette(s) importée(s))
                    </p>
                  </div>
                )}

                {!message && selected?.message && (
                  <div className="mt-5 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                    <div className="text-xs text-slate-300/90 whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal fausse bibliothèque */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => {
              if (libraryDownloadingId) return;
              setIsLibraryOpen(false);
            }}
          />

          <div className="absolute inset-0 p-4 sm:p-6 grid place-items-center">
            <div className="w-full max-w-3xl rounded-[28px] bg-slate-950/90 ring-1 ring-white/10 shadow-[0_18px_80px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-slate-100">
                    Mes fichiers
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Démo bibliothèque Kitch’n • clique sur un fichier pour l’ajouter
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (libraryDownloadingId) return;
                    setIsLibraryOpen(false);
                  }}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 sm:px-6 py-4 border-b border-white/10">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Rechercher un fichier..."
                    className="w-full h-11 rounded-2xl bg-white/5 ring-1 ring-white/10 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {filteredLibrary.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <FileDown className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <div className="text-slate-300 font-medium">Aucun fichier trouvé</div>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredLibrary.map((file) => {
                      const downloading = libraryDownloadingId === file.id;

                      return (
                        <div
                          key={file.id}
                          className="px-5 sm:px-6 py-4 flex items-center gap-3 hover:bg-white/[0.03] transition"
                        >
                          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/20 grid place-items-center shrink-0">
                            <FileText className="w-5 h-5 text-amber-300" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-100 truncate">
                              {file.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-400 truncate">
                              {file.type} • {file.sizeLabel}
                              {file.folder ? ` • ${file.folder}` : ""}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!!libraryDownloadingId}
                            onClick={() => handleFakeLibraryDownload(file)}
                            className={[
                              "shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition",
                              downloading
                                ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/20"
                                : "bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10",
                            ].join(" ")}
                          >
                            {downloading ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Téléchargement…
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Télécharger
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-5 sm:px-6 py-4 border-t border-white/10 bg-white/[0.02]">
                <div className="text-xs text-slate-400">
                  Démo visuelle uniquement • aucun vrai téléchargement externe
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}