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
  ChevronRight,
  HardDrive,
  Clock3,
  Star,
  Folder,
  Home,
  FileArchive,
} from "lucide-react";
import { ui } from "../../../styles/ui";
import {
  DemoCursor,
  moveCursorToElement,
  pulseClick,
  wait,
} from "./RecipeImportAIDemoAutoplay";

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

type FakeFolder = {
  id: string;
  name: string;
  files: FakeLibraryFile[];
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

const FAKE_FOLDERS: FakeFolder[] = [
  {
    id: "folder-1",
    name: "Recettes froides",
    files: [
      {
        id: "f1",
        name: "tartare-bar-agrumes.pdf",
        sizeLabel: "1.4 MB",
        type: "PDF",
        folder: "Recettes froides",
      },
      {
        id: "f2",
        name: "saumon-gravlax-maison.docx",
        sizeLabel: "930 KB",
        type: "Word",
        folder: "Recettes froides",
      },
    ],
  },
  {
    id: "folder-2",
    name: "Plats chauds",
    files: [
      {
        id: "f3",
        name: "risotto-truffe-noire.pdf",
        sizeLabel: "2.4 MB",
        type: "PDF",
        folder: "Plats chauds",
      },
      {
        id: "f4",
        name: "jus-volaille-reduit.txt",
        sizeLabel: "61 KB",
        type: "Texte",
        folder: "Plats chauds",
      },
      {
        id: "f5",
        name: "pigeon-confit-wagyu.docx",
        sizeLabel: "1.7 MB",
        type: "Word",
        folder: "Plats chauds",
      },
    ],
  },
  {
    id: "folder-3",
    name: "Desserts",
    files: [
      {
        id: "f6",
        name: "dessert-citron-restaurant.docx",
        sizeLabel: "860 KB",
        type: "Word",
        folder: "Desserts",
      },
      {
        id: "f7",
        name: "ganache-montee-vanille.txt",
        sizeLabel: "49 KB",
        type: "Texte",
        folder: "Desserts",
      },
    ],
  },
  {
    id: "folder-4",
    name: "Sauces",
    files: [
      {
        id: "f8",
        name: "base-sauce-vin-rouge.txt",
        sizeLabel: "72 KB",
        type: "Texte",
        folder: "Sauces",
      },
      {
        id: "f9",
        name: "beurre-blanc-premium.pdf",
        sizeLabel: "540 KB",
        type: "PDF",
        folder: "Sauces",
      },
    ],
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
- Produit 3

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

export function RecipeImportAIDemoPanel() {
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [message, setMessage] = useState("");
  const busy = status === "uploading" || status === "processing";

  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFolderExplorerOpen, setIsFolderExplorerOpen] = useState(false);

  const [librarySearch, setLibrarySearch] = useState("");
  const [folderSearch, setFolderSearch] = useState("");
  const [libraryDownloadingId, setLibraryDownloadingId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>(FAKE_FOLDERS[0].id);

  const [demoRunning, setDemoRunning] = useState(false);
  const [cursor, setCursor] = useState({ x: 120, y: 120, click: false });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const filesBtnRef = useRef<HTMLButtonElement | null>(null);
  const analyzeBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstOpenBtnRef = useRef<HTMLButtonElement | null>(null);
  const runDemoRef = useRef<() => void>(() => undefined);

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

  const activeFolder = useMemo(
    () => FAKE_FOLDERS.find((f) => f.id === activeFolderId) || FAKE_FOLDERS[0],
    [activeFolderId]
  );

  const filteredFolderFiles = useMemo(() => {
    const q = folderSearch.trim().toLowerCase();
    const files = activeFolder?.files || [];
    if (!q) return files;

    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        (f.folder || "").toLowerCase().includes(q)
    );
  }, [activeFolder, folderSearch]);

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
      relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || "",
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
    (
      document.getElementById("ai-demo-panel-file-input") as HTMLInputElement | null
    )?.click();
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

    await sleep(300);
    setLibraryDownloadingId(null);
    setIsLibraryOpen(false);
    setLibrarySearch("");
    setMessage(`Fichier ajouté depuis Mes fichiers : ${fake.name}`);
    setStatus("idle");
  };

  const handleFakeFolderOpen = async (fake: FakeLibraryFile) => {
    if (busy || libraryDownloadingId) return;

    setLibraryDownloadingId(fake.id);
    await sleep(300);

    const file = createFakeFile(fake);
    await addFilesToQueue([file]);

    await sleep(250);
    setLibraryDownloadingId(null);
    setIsFolderExplorerOpen(false);
    setFolderSearch("");
    setMessage(`Fichier ajouté depuis le dossier : ${fake.name}`);
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
        await sleep(45);
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
        await sleep(55);
        setQueue((prev) =>
          prev.map((q) =>
            q.id === itemId ? { ...q, progress: Math.max(q.progress, p) } : q
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
        const next = current.find((q) => q.status === "idle" || q.status === "error");
        if (!next) break;
        await importOne(next.id);
      }
    } finally {
      processingRef.current = false;
      setStatus("idle");
    }
  }

  async function runDemo() {
    if (demoRunning) return;

    setDemoRunning(true);
    setQueue([]);
    setSelectedId(null);
    setMessage("");
    setStatus("idle");
    setIsLibraryOpen(false);
    setIsFolderExplorerOpen(false);
    setLibrarySearch("");
    setFolderSearch("");

    await wait(500);

    moveCursorToElement(filesBtnRef.current, rootRef.current, setCursor, -4, -2);
    await wait(900);

    await wait(80);
    pulseClick(setCursor, 140);
    await wait(160);

    setIsLibraryOpen(true);
    await wait(250);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    moveCursorToElement(firstOpenBtnRef.current, rootRef.current, setCursor, -6, -2);
    await wait(900);

    await wait(80);
    pulseClick(setCursor, 140);
    await wait(160);

    await handleFakeLibraryDownload(FAKE_LIBRARY_FILES[0]);
    await wait(900);

    moveCursorToElement(analyzeBtnRef.current, rootRef.current, setCursor, -4, -2);
    await wait(900);

    await wait(80);
    pulseClick(setCursor, 140);
    await wait(160);

    await processQueue();

    await wait(1400);

    setDemoRunning(false);

    window.setTimeout(() => {
      runDemoRef.current();
    }, 1800);
  }

  useEffect(() => {
    runDemoRef.current = () => {
      void runDemo();
    };
  });

  useEffect(() => {
    const t = window.setTimeout(() => {
      runDemoRef.current();
    }, 1200);

    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <div ref={rootRef} className="relative w-full">
        {demoRunning && (
          <div className="absolute left-4 top-4 z-[80] rounded-full bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 text-xs text-slate-200">
            </div>
        )}

        <div className={demoRunning ? "pointer-events-none" : ""}>
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
                ref={analyzeBtnRef}
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

          <div className="mt-5 rounded-[24px] bg-white/[0.06] ring-1 ring-white/10 px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-100">Sources</div>
                <div className="text-xs text-slate-400 mt-1">
                  Tous formats • Max {MAX_MB} MB/fichier
                </div>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <button
                  ref={filesBtnRef}
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  Mes fichiers
                </button>

                <button
                  type="button"
                  onClick={() => setIsFolderExplorerOpen(true)}
                  disabled={busy}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-medium bg-white/5 text-white ring-1 ring-white/10 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <FolderOpen className="w-4 h-4 text-amber-300" />
                  Dossier
                </button>

                <input
                  id="ai-demo-panel-folder-input"
                  type="file"
                  multiple
                  // @ts-expect-error -- attribut Chromium absent des types React.
                  webkitdirectory="true"
                  onChange={handleFolderSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-medium bg-[#2ea8ff] text-white ring-1 ring-[#2ea8ff]/40 opacity-60 cursor-not-allowed"
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
                  ? (
                      document.getElementById("ai-demo-panel-file-input") as HTMLInputElement | null
                    )?.click()
                  : null
              }
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
                "mt-4 rounded-2xl border border-dashed px-4 py-5 transition",
                isDragOver
                  ? "border-amber-400/60 bg-black/10"
                  : "border-white/15 hover:border-white/25",
                busy ? "opacity-60 pointer-events-none" : "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-3 flex-col sm:flex-row">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/20 grid place-items-center shrink-0">
                    <Upload className="w-4 h-4 text-amber-300" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm text-slate-100 truncate">
                      Glisse-dépose des fichiers ici, ou clique pour choisir
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-1">
                      Import IA en file (un par un)
                    </div>
                  </div>
                </div>

                <span className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 text-slate-200 border border-white/10 shrink-0">
                  Ajouter
                </span>
              </div>

              <input
                id="ai-demo-panel-file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {queue.length > 0 && (
            <div className="mt-4 rounded-[24px] bg-white/[0.06] ring-1 ring-white/10 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-100 font-semibold">
                  Progression globale
                  <span className="text-slate-400 font-normal"> • {overall.done}/{overall.total} terminé(s)</span>
                </div>
                <div className="text-sm text-slate-200/90">{overall.pct}%</div>
              </div>

              <div className="mt-3 h-2 rounded-full bg-black/20 ring-1 ring-white/10 overflow-hidden">
                <div
                  className="h-full bg-amber-400/80 transition-all duration-300"
                  style={{ width: `${overall.pct}%` }}
                />
              </div>
            </div>
          )}

          {queue.length > 0 && (
            <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
              <div className="rounded-[24px] bg-white/[0.06] ring-1 ring-white/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="text-sm font-semibold text-slate-100">Fichiers</div>
                  <div className="ml-auto text-xs text-slate-400">Démo import</div>
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
                                className="h-full bg-amber-400/80 transition-all duration-300"
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

              <div className="rounded-[24px] bg-white/[0.06] ring-1 ring-white/10 p-4">
                <div className="text-sm font-semibold text-slate-100">
                  Sélection
                  <span className="text-xs text-slate-400 font-normal"> • {selected?.relativePath || selected?.file?.name || "—"}</span>
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

        <DemoCursor cursor={cursor} />
      </div>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/58 backdrop-blur-md"
            onClick={() => {
              if (libraryDownloadingId) return;
              setIsLibraryOpen(false);
            }}
          />

          <div className="absolute inset-0 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 flex items-start justify-center">
            <div
              className="
                w-full max-w-[980px] h-[min(78vh,720px)]
                rounded-[26px] overflow-hidden
                bg-[linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(15,23,42,0.98)_100%)]
                ring-1 ring-white/10
                border border-white/10
                shadow-[0_30px_90px_rgba(0,0,0,0.45)]
                backdrop-blur-2xl
              "
            >
              <div className="h-14 border-b border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.92)_0%,rgba(22,32,51,0.88)_100%)] backdrop-blur-xl flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <div className="text-[13px] font-medium text-slate-300">Kitch’n Explorer</div>

                <button
                  type="button"
                  onClick={() => {
                    if (libraryDownloadingId) return;
                    setIsLibraryOpen(false);
                  }}
                  className="h-8 w-8 grid place-items-center rounded-xl text-slate-400 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-[220px_1fr] h-[calc(100%-56px)]">
                <aside className="border-r border-white/10 bg-[#151e2d] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 px-3 py-2">
                    Navigation
                  </div>

                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <Home className="w-4 h-4" />
                      Accueil
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <Clock3 className="w-4 h-4" />
                      Récents
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <Star className="w-4 h-4" />
                      Favoris
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20">
                      <HardDrive className="w-4 h-4 text-cyan-300" />
                      Kitch’n Drive
                    </button>
                  </div>

                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 px-3 py-2 mt-5">
                    Collections
                  </div>

                  <div className="space-y-1">
                    {["Recettes froides", "Plats chauds", "Desserts", "Sauces"].map((name) => (
                      <button
                        key={name}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5"
                      >
                        <Folder className="w-4 h-4 text-cyan-300" />
                        {name}
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="flex flex-col min-w-0 bg-[linear-gradient(180deg,#0f172a_0%,#101a31_100%)]">
                  <div className="h-14 border-b border-white/10 bg-[#162033] px-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400 min-w-0">
                      <HardDrive className="w-4 h-4 shrink-0" />
                      <span>Kitch’n Drive</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                      <span className="truncate text-slate-200 font-medium">Mes fichiers</span>
                    </div>

                    <div className="relative w-full max-w-[320px]">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Rechercher"
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="px-5 pt-5 pb-3">
                    <div className="text-xl font-semibold text-slate-100">Mes fichiers</div>
                    <div className="text-sm text-slate-400 mt-1">Bibliothèque de documents Kitch’n</div>
                  </div>

                  <div className="px-4 pb-4 flex-1 min-h-0">
                    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                      <div className="grid grid-cols-[1.5fr_110px_110px_120px] gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-slate-500 border-b border-white/10 bg-white/[0.02]">
                        <div>Nom</div>
                        <div>Type</div>
                        <div>Taille</div>
                        <div className="text-right">Action</div>
                      </div>

                      <div className="overflow-y-auto h-[calc(100%-44px)]">
                        {filteredLibrary.map((file, index) => {
                          const downloading = libraryDownloadingId === file.id;

                          return (
                            <div
                              key={file.id}
                              className="grid grid-cols-[1.5fr_110px_110px_120px] gap-3 px-4 py-3 items-center border-b border-white/5 hover:bg-cyan-500/[0.06] transition-colors duration-150"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/20 grid place-items-center shrink-0">
                                  <FileText className="w-4 h-4 text-cyan-300" />
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm text-slate-100 truncate font-medium">{file.name}</div>
                                  <div className="text-xs text-slate-400 truncate">{file.folder}</div>
                                </div>
                              </div>

                              <div>
                                <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                                  {file.type}
                                </span>
                              </div>

                              <div className="text-sm text-slate-300">{file.sizeLabel}</div>

                              <div className="text-right">
                                <button
                                  ref={index === 0 ? firstOpenBtnRef : undefined}
                                  type="button"
                                  disabled={!!libraryDownloadingId}
                                  onClick={() => handleFakeLibraryDownload(file)}
                                  className={[
                                    "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                                    downloading
                                      ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20"
                                      : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10",
                                  ].join(" ")}
                                >
                                  {downloading ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Ouverture…
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-4 h-4" />
                                      Ouvrir
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {filteredLibrary.length === 0 && (
                          <div className="h-full grid place-items-center">
                            <div className="text-center">
                              <FileDown className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                              <div className="text-slate-300 font-medium">Aucun fichier trouvé</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFolderExplorerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/58 backdrop-blur-md"
            onClick={() => {
              if (libraryDownloadingId) return;
              setIsFolderExplorerOpen(false);
            }}
          />

          <div className="absolute inset-0 px-4 sm:px-6 pt-6 sm:pt-8 pb-6 flex items-start justify-center">
            <div
              className="
                w-full max-w-[1040px] h-[min(80vh,740px)]
                rounded-[26px] overflow-hidden
                bg-[linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(15,23,42,0.98)_100%)]
                ring-1 ring-white/10
                border border-white/10
                shadow-[0_30px_90px_rgba(0,0,0,0.45)]
                backdrop-blur-2xl
              "
            >
              <div className="h-14 border-b border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.92)_0%,rgba(22,32,51,0.88)_100%)] backdrop-blur-xl flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>

                <div className="text-[13px] font-medium text-slate-300">Dossier — Kitch’n Explorer</div>

                <button
                  type="button"
                  onClick={() => {
                    if (libraryDownloadingId) return;
                    setIsFolderExplorerOpen(false);
                  }}
                  className="h-8 w-8 grid place-items-center rounded-xl text-slate-400 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-[240px_1fr] h-[calc(100%-56px)]">
                <aside className="border-r border-white/10 bg-[#151e2d] p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 px-3 py-2">
                    Emplacements
                  </div>

                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20">
                      <HardDrive className="w-4 h-4 text-cyan-300" />
                      Stockage local
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <Home className="w-4 h-4" />
                      Accueil
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5">
                      <FileArchive className="w-4 h-4" />
                      Archives
                    </button>
                  </div>

                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 px-3 py-2 mt-5">
                    Dossiers
                  </div>

                  <div className="space-y-1">
                    {FAKE_FOLDERS.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setActiveFolderId(folder.id)}
                        className={[
                          "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                          folder.id === activeFolderId
                            ? "bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20"
                            : "text-slate-300 hover:bg-white/5",
                        ].join(" ")}
                      >
                        <Folder className="w-4 h-4 text-cyan-300" />
                        {folder.name}
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="flex flex-col min-w-0 bg-[linear-gradient(180deg,#0f172a_0%,#101a31_100%)]">
                  <div className="h-14 border-b border-white/10 bg-[#162033] px-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400 min-w-0">
                      <HardDrive className="w-4 h-4 shrink-0" />
                      <span>Stockage local</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                      <span className="truncate text-slate-200 font-medium">{activeFolder.name}</span>
                    </div>

                    <div className="relative w-full max-w-[320px]">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={folderSearch}
                        onChange={(e) => setFolderSearch(e.target.value)}
                        placeholder="Rechercher dans le dossier"
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="px-5 pt-5 pb-3">
                    <div className="text-xl font-semibold text-slate-100">{activeFolder.name}</div>
                    <div className="text-sm text-slate-400 mt-1">Fichiers disponibles dans ce dossier</div>
                  </div>

                  <div className="px-4 pb-4 flex-1 min-h-0">
                    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                      <div className="grid grid-cols-[1.5fr_110px_110px_120px] gap-3 px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-slate-500 border-b border-white/10 bg-white/[0.02]">
                        <div>Nom</div>
                        <div>Type</div>
                        <div>Taille</div>
                        <div className="text-right">Action</div>
                      </div>

                      <div className="overflow-y-auto h-[calc(100%-44px)]">
                        {filteredFolderFiles.map((file) => {
                          const opening = libraryDownloadingId === file.id;

                          return (
                            <div
                              key={file.id}
                              className="grid grid-cols-[1.5fr_110px_110px_120px] gap-3 px-4 py-3 items-center border-b border-white/5 hover:bg-cyan-500/[0.06] transition-colors duration-150"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/20 grid place-items-center shrink-0">
                                  <FileText className="w-4 h-4 text-cyan-300" />
                                </div>

                                <div className="min-w-0">
                                  <div className="text-sm text-slate-100 truncate font-medium">{file.name}</div>
                                  <div className="text-xs text-slate-400 truncate">Fichier recette démo</div>
                                </div>
                              </div>

                              <div>
                                <span className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                                  {file.type}
                                </span>
                              </div>

                              <div className="text-sm text-slate-300">{file.sizeLabel}</div>

                              <div className="text-right">
                                <button
                                  type="button"
                                  disabled={!!libraryDownloadingId}
                                  onClick={() => handleFakeFolderOpen(file)}
                                  className={[
                                    "inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                                    opening
                                      ? "bg-cyan-500/15 text-cyan-200 border border-cyan-400/20"
                                      : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10",
                                  ].join(" ")}
                                >
                                  {opening ? (
                                    <>
                                      <Loader className="w-4 h-4 animate-spin" />
                                      Ouverture…
                                    </>
                                  ) : (
                                    <>
                                      <FolderOpen className="w-4 h-4" />
                                      Ouvrir
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {filteredFolderFiles.length === 0 && (
                          <div className="h-full grid place-items-center">
                            <div className="text-center">
                              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                              <div className="text-slate-300 font-medium">Aucun fichier dans ce dossier</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
