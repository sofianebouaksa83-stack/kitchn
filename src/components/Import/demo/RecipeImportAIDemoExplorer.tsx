import { useState, type RefObject } from "react";
import {
  ChevronRight,
  Clock3,
  Download,
  FileArchive,
  FileDown,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Home,
  Loader,
  Search,
  Star,
  X,
} from "lucide-react";
import {
  FAKE_FOLDERS,
  FAKE_LIBRARY_FILES,
  type FakeLibraryFile,
} from "./RecipeImportAIDemoData";

export type RecipeImportExplorerMode = "library" | "folder";

type RecipeImportAIDemoExplorerProps = {
  mode: RecipeImportExplorerMode;
  downloadingId: string | null;
  firstOpenButtonRef: RefObject<HTMLButtonElement>;
  onClose: () => void;
  onOpenFile: (
    file: FakeLibraryFile,
    source: RecipeImportExplorerMode
  ) => void;
};

export function RecipeImportAIDemoExplorer({
  mode,
  downloadingId,
  firstOpenButtonRef,
  onClose,
  onOpenFile,
}: RecipeImportAIDemoExplorerProps) {
  const [search, setSearch] = useState("");
  const [activeFolderId, setActiveFolderId] = useState(FAKE_FOLDERS[0].id);

  const isFolderExplorer = mode === "folder";
  const activeFolder =
    FAKE_FOLDERS.find((folder) => folder.id === activeFolderId) ??
    FAKE_FOLDERS[0];
  const sourceFiles = isFolderExplorer
    ? activeFolder.files
    : FAKE_LIBRARY_FILES;
  const query = search.trim().toLowerCase();
  const files = query
    ? sourceFiles.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          file.type.toLowerCase().includes(query) ||
          (file.folder ?? "").toLowerCase().includes(query)
      )
    : sourceFiles;

  const closeExplorer = () => {
    if (!downloadingId) onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/58 backdrop-blur-md"
        onClick={closeExplorer}
      />

      <div className="absolute inset-0 flex items-start justify-center px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
        <div
          className={`
            w-full ${
              isFolderExplorer
                ? "max-w-[1040px] h-[min(80vh,740px)]"
                : "max-w-[980px] h-[min(78vh,720px)]"
            }
            overflow-hidden rounded-[26px]
            border border-white/10
            bg-[linear-gradient(180deg,rgba(17,24,39,0.98)_0%,rgba(15,23,42,0.98)_100%)]
            shadow-[0_30px_90px_rgba(0,0,0,0.45)]
            ring-1 ring-white/10 backdrop-blur-2xl
          `}
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 bg-[linear-gradient(180deg,rgba(30,41,59,0.92)_0%,rgba(22,32,51,0.88)_100%)] px-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>

            <div className="text-[13px] font-medium text-slate-300">
              {isFolderExplorer
                ? "Dossier — Kitch’n Explorer"
                : "Kitch’n Explorer"}
            </div>

            <button
              type="button"
              onClick={closeExplorer}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-white/10"
              aria-label="Fermer l’explorateur"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            className={`grid h-[calc(100%-56px)] ${
              isFolderExplorer
                ? "grid-cols-[240px_1fr]"
                : "grid-cols-[220px_1fr]"
            }`}
          >
            <aside className="border-r border-white/10 bg-[#151e2d] p-3">
              {isFolderExplorer ? (
                <FolderNavigation
                  activeFolderId={activeFolderId}
                  onFolderChange={setActiveFolderId}
                />
              ) : (
                <LibraryNavigation />
              )}
            </aside>

            <section className="flex min-w-0 flex-col bg-[linear-gradient(180deg,#0f172a_0%,#101a31_100%)]">
              <div className="flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-[#162033] px-4">
                <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
                  <HardDrive className="h-4 w-4 shrink-0" />
                  <span>
                    {isFolderExplorer ? "Stockage local" : "Kitch’n Drive"}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                  <span className="truncate font-medium text-slate-200">
                    {isFolderExplorer ? activeFolder.name : "Mes fichiers"}
                  </span>
                </div>

                <div className="relative w-full max-w-[320px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={
                      isFolderExplorer
                        ? "Rechercher dans le dossier"
                        : "Rechercher"
                    }
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="px-5 pb-3 pt-5">
                <div className="text-xl font-semibold text-slate-100">
                  {isFolderExplorer ? activeFolder.name : "Mes fichiers"}
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  {isFolderExplorer
                    ? "Fichiers disponibles dans ce dossier"
                    : "Bibliothèque de documents Kitch’n"}
                </div>
              </div>

              <div className="min-h-0 flex-1 px-4 pb-4">
                <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div className="grid grid-cols-[1.5fr_110px_110px_120px] gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <div>Nom</div>
                    <div>Type</div>
                    <div>Taille</div>
                    <div className="text-right">Action</div>
                  </div>

                  <div className="h-[calc(100%-44px)] overflow-y-auto">
                    {files.map((file, index) => {
                      const opening = downloadingId === file.id;

                      return (
                        <div
                          key={file.id}
                          className="grid grid-cols-[1.5fr_110px_110px_120px] items-center gap-3 border-b border-white/5 px-4 py-3 transition-colors duration-150 hover:bg-cyan-500/[0.06]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-400/20">
                              <FileText className="h-4 w-4 text-cyan-300" />
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-slate-100">
                                {file.name}
                              </div>
                              <div className="truncate text-xs text-slate-400">
                                {isFolderExplorer
                                  ? "Fichier recette démo"
                                  : file.folder}
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                              {file.type}
                            </span>
                          </div>

                          <div className="text-sm text-slate-300">
                            {file.sizeLabel}
                          </div>

                          <div className="text-right">
                            <button
                              ref={
                                !isFolderExplorer && index === 0
                                  ? firstOpenButtonRef
                                  : undefined
                              }
                              type="button"
                              disabled={Boolean(downloadingId)}
                              onClick={() => onOpenFile(file, mode)}
                              className={[
                                "inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-200",
                                opening
                                  ? "border-cyan-400/20 bg-cyan-500/15 text-cyan-200"
                                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
                              ].join(" ")}
                            >
                              {opening ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Ouverture…
                                </>
                              ) : (
                                <>
                                  {isFolderExplorer ? (
                                    <FolderOpen className="h-4 w-4" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                  Ouvrir
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {files.length === 0 ? (
                      <div className="grid h-full place-items-center">
                        <div className="text-center">
                          {isFolderExplorer ? (
                            <FolderOpen className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                          ) : (
                            <FileDown className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                          )}
                          <div className="font-medium text-slate-300">
                            {isFolderExplorer
                              ? "Aucun fichier dans ce dossier"
                              : "Aucun fichier trouvé"}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FolderNavigation({
  activeFolderId,
  onFolderChange,
}: {
  activeFolderId: string;
  onFolderChange: (folderId: string) => void;
}) {
  return (
    <>
      <div className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Emplacements
      </div>

      <div className="space-y-1">
        <NavigationButton icon={HardDrive} label="Stockage local" active />
        <NavigationButton icon={Home} label="Accueil" />
        <NavigationButton icon={FileArchive} label="Archives" />
      </div>

      <div className="mt-5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Dossiers
      </div>

      <div className="space-y-1">
        {FAKE_FOLDERS.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => onFolderChange(folder.id)}
            className={[
              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
              folder.id === activeFolderId
                ? "bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20"
                : "text-slate-300 hover:bg-white/5",
            ].join(" ")}
          >
            <Folder className="h-4 w-4 text-cyan-300" />
            {folder.name}
          </button>
        ))}
      </div>
    </>
  );
}

function LibraryNavigation() {
  return (
    <>
      <div className="px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Navigation
      </div>

      <div className="space-y-1">
        <NavigationButton icon={Home} label="Accueil" />
        <NavigationButton icon={Clock3} label="Récents" />
        <NavigationButton icon={Star} label="Favoris" />
        <NavigationButton icon={HardDrive} label="Kitch’n Drive" active />
      </div>

      <div className="mt-5 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        Collections
      </div>

      <div className="space-y-1">
        {["Recettes froides", "Plats chauds", "Desserts", "Sauces"].map(
          (name) => (
            <button
              key={name}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            >
              <Folder className="h-4 w-4 text-cyan-300" />
              {name}
            </button>
          )
        )}
      </div>
    </>
  );
}

function NavigationButton({
  icon: Icon,
  label,
  active = false,
}: {
  icon: typeof Home;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm",
        active
          ? "bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-400/20"
          : "text-slate-300 hover:bg-white/5",
      ].join(" ")}
    >
      <Icon className={active ? "h-4 w-4 text-cyan-300" : "h-4 w-4"} />
      {label}
    </button>
  );
}
