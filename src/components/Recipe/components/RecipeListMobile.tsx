import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  Search,
  AlertCircle,
  Plus,
  X,
  Heart,
  Folder,
  Filter,
  Users,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Tag,
  Check,
  ArrowLeft,
} from "lucide-react";
import { ui } from "../../../styles/ui";
import RecipeDisplayMobile from "./RecipeDisplayMobile";

type IngredientRow = { designation: string | null };

export type RecipeListMobileRecipe = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  is_visible?: boolean;
  is_favorite?: boolean;
  folder_id?: string | null;
  ingredients: IngredientRow[];
};

export type RecipeListMobileFolder = {
  id: string;
  name: string;
};

type Props = {
  userExists: boolean;

  recipesCount: number;
  filteredCount: number;
  filteredRecipes: RecipeListMobileRecipe[];
  categories: string[];
  folders: RecipeListMobileFolder[];

  searchTerm: string;
  onChangeSearch: (v: string) => void;

  categoryFilter: string;
  onChangeCategory: (v: string) => void;

  selectedFolder: string | null;
  showFavoritesOnly: boolean;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  folderMenuOpenId: string | null;
  setFolderMenuOpenId: (id: string | null) => void;
  folderMenuRef: React.RefObject<HTMLDivElement>;

  showNewFolderInput: boolean;
  setShowNewFolderInput: (v: boolean) => void;
  newFolderName: string;
  setNewFolderName: (v: string) => void;

  onCreateNew: () => void;
  onOpenRecipe: (id: string) => void;

  onSelectAll: () => void;
  onSelectFavorites: () => void;
  onSelectFolder: (folderId: string) => void;

  onDropToFolder: (folderId: string | null, e: React.DragEvent) => void;
  onDragStartRecipe: (recipeId: string, e: React.DragEvent) => void;

  onCreateFolder: () => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;

  onToggleFavorite: (
    recipeId: string,
    isFav: boolean,
    e: React.MouseEvent
  ) => void;
  onToggleVisibility: (
    recipeId: string,
    isVisible: boolean,
    e: React.MouseEvent
  ) => void;

  onShareToGroup: (recipeId: string, e: React.MouseEvent) => void;
  onDuplicate: (recipe: RecipeListMobileRecipe, e: React.MouseEvent) => void;
  onEdit: (recipeId: string, e: React.MouseEvent) => void;
  onTrash: (recipeId: string, e: React.MouseEvent) => void;

  onMoveToFolder: (recipeId: string, folderId: string | null) => void;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function safeTitle(r?: RecipeListMobileRecipe | null) {
  const t = (r?.title || "").trim();
  return t ? t : "Sans titre";
}

function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const chips = useMemo(() => {
    const unique = Array.from(new Set(categories.filter(Boolean)));
    if (!unique.includes("Toutes")) return ["Toutes", ...unique];
    return unique;
  }, [categories]);

  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-2 min-w-max pr-2">
        {chips.map((cat) => {
          const active = cat === value;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap",
                "ring-1 transition",
                active
                  ? "bg-amber-400/20 ring-amber-300/30 text-amber-100"
                  : "bg-white/[0.05] ring-white/10 text-slate-200 hover:bg-white/[0.07]"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SheetAction({
  icon,
  label,
  tone = "neutral",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl",
        "bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left",
        tone === "danger" && "hover:bg-red-500/10 ring-red-500/20"
      )}
    >
      <span
        className={cn(
          "h-10 w-10 rounded-2xl inline-flex items-center justify-center",
          tone === "danger"
            ? "bg-red-500/10 ring-1 ring-red-500/20 text-red-200"
            : "bg-white/[0.04] ring-1 ring-white/10 text-slate-200"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "text-sm font-medium",
          tone === "danger" ? "text-red-100" : "text-slate-100"
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function RecipeListMobile(props: Props) {
  const {
    userExists,
    recipesCount,
    filteredCount,
    filteredRecipes,
    categories,
    folders,

    searchTerm,
    onChangeSearch,
    categoryFilter,
    onChangeCategory,

    selectedFolder,
    showFavoritesOnly,

    sidebarOpen,
    setSidebarOpen,

    folderMenuOpenId,
    setFolderMenuOpenId,
    folderMenuRef,

    showNewFolderInput,
    setShowNewFolderInput,
    newFolderName,
    setNewFolderName,

    onCreateNew,

    onSelectAll,
    onSelectFavorites,
    onSelectFolder,

    onDropToFolder,

    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,

    onToggleFavorite,
    onToggleVisibility,

    onShareToGroup,
    onDuplicate,
    onEdit,
    onTrash,
    onMoveToFolder,
  } = props;

  const [openedRecipeId, setOpenedRecipeId] = useState<string | null>(null);
  const recipeSheetOpen = !!openedRecipeId;
  const closeRecipeSheet = () => setOpenedRecipeId(null);
  const recipeDragControls = useDragControls();
  const foldersDragControls = useDragControls();

  const [actionSheetRecipe, setActionSheetRecipe] =
    useState<RecipeListMobileRecipe | null>(null);
  const actionSheetOpen = !!actionSheetRecipe;
  const closeActionSheet = () => setActionSheetRecipe(null);

  const [moveFolderOpen, setMoveFolderOpen] = useState(false);
  const [moveRecipe, setMoveRecipe] = useState<RecipeListMobileRecipe | null>(null);

  useEffect(() => {
    const shouldLock = sidebarOpen || recipeSheetOpen || actionSheetOpen || moveFolderOpen;
    const prev = document.documentElement.style.overflow;
    if (shouldLock) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [sidebarOpen, recipeSheetOpen, actionSheetOpen, moveFolderOpen]);

  useEffect(() => {
    if (!sidebarOpen && !recipeSheetOpen && !actionSheetOpen && !moveFolderOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        closeRecipeSheet();
        closeActionSheet();
        setMoveFolderOpen(false);
        setMoveRecipe(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, recipeSheetOpen, actionSheetOpen, moveFolderOpen, setSidebarOpen]);

  const currentFolder = useMemo(() => {
    if (!selectedFolder) return null;
    return folders.find((folder) => folder.id === selectedFolder) ?? null;
  }, [folders, selectedFolder]);

  const headerLabel = useMemo(() => {
    if (selectedFolder) return currentFolder?.name ?? "Dossier";
    if (showFavoritesOnly) return "Favoris";
    return "Toutes";
  }, [currentFolder?.name, selectedFolder, showFavoritesOnly]);

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    filteredRecipes.forEach((r) => {
      if (!r.folder_id) return;
      map.set(r.folder_id, (map.get(r.folder_id) ?? 0) + 1);
    });
    return map;
  }, [filteredRecipes]);

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    onCreateFolder();
  }

  return (
    <div className={cn(ui.dashboardBg, "min-h-screen")}>
      <div className="px-4 pt-6 pb-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-100 tracking-tight">
              Mes recettes
            </div>
            <div className="mt-1 text-sm text-slate-300/80">
              {headerLabel} ·{" "}
              <span className="text-slate-100 font-semibold">{filteredCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="h-12 w-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
            aria-label="Ouvrir les filtres"
            title="Filtres"
          >
            <Filter className="w-5 h-5 text-slate-100" />
          </button>
        </div>

        {selectedFolder && (
          <button
            type="button"
            onClick={onSelectAll}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-2xl bg-white/[0.05] px-4 text-sm font-semibold text-slate-100 ring-1 ring-white/10 transition active:scale-[0.98] hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les recettes
          </button>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={onCreateNew}
            className={cn(ui.btnPrimary, "w-full h-12 rounded-2xl justify-center")}
          >
            <Plus className="w-5 h-5" />
            Nouvelle recette
          </button>
        </div>

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Rechercher par nom ou ingrédient…"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
          />
        </div>

        <div className="mt-4">
          <CategoryChips
            categories={categories}
            value={categoryFilter}
            onChange={onChangeCategory}
          />
        </div>

        <div className="mt-6">
          {filteredRecipes.length === 0 ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">
                {recipesCount === 0
                  ? "Aucune recette pour le moment"
                  : "Aucune recette trouvée"}
              </p>
              <p className="text-sm text-slate-300/70 mt-2">
                Crée une recette ou change tes filtres.
              </p>

              {userExists && (
                <div className="mt-6">
                  <button
                    type="button"
                    className={cn(ui.btnPrimary, "h-11 rounded-2xl")}
                    onClick={onCreateNew}
                  >
                    <Plus className="w-5 h-5" />
                    Nouvelle recette
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredRecipes.map((r) => {
                const fav = !!r.is_favorite;
                const visible = r.is_visible !== false;
                const folderName = r.folder_id
                  ? folders.find((f) => f.id === r.folder_id)?.name
                  : null;

                return (
                  <div
                    key={r.id}
                    className="group py-4"
                    draggable={false}
                    onDrop={(e) => onDropToFolder(r.folder_id ?? null, e)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setOpenedRecipeId(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setOpenedRecipeId(r.id);
                          }
                        }}
                        className="min-w-0 flex-1 outline-none"
                      >
                        <div className="text-[15px] font-medium tracking-tight text-white truncate">
                          {r.title || "Sans titre"}
                        </div>

                        <div className="mt-1 text-xs text-white/50 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-white/40" />
                            {r.category || "Autre"}
                          </span>                       
                        </div>

                        {searchTerm.trim() && folderName && (
                          <div className="mt-1 text-[11px] text-white/40">
                            Dossier : {folderName}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionSheetRecipe(r);
                        }}
                        className="h-9 w-9 rounded-full bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center text-white/60 hover:text-white"
                        aria-label="Actions"
                        title="Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-white/60">
                      <button
                        type="button"
                        onClick={(e) => onShareToGroup(r.id, e)}
                        className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center hover:text-white"
                        title="Partager"
                      >
                        <Users className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onToggleFavorite(r.id, fav, e)}
                        className={cn(
                          "h-10 w-10 rounded-full transition inline-flex items-center justify-center",
                          fav
                            ? "text-amber-300 hover:bg-amber-400/10"
                            : "hover:bg-white/[0.06] hover:text-white"
                        )}
                        title="Favori"
                      >
                        <Heart className={cn("w-5 h-5", fav && "fill-current")} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onToggleVisibility(r.id, visible, e)}
                        className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center hover:text-white"
                        title={visible ? "Visible" : "Masquée"}
                      >
                        {visible ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1" />

                      <button
                        type="button"
                        onClick={(e) => onTrash(r.id, e)}
                        className="h-10 w-10 rounded-full hover:bg-red-500/10 transition inline-flex items-center justify-center text-white/60 hover:text-red-200"
                        title={selectedFolder ? "Retirer du dossier" : "Supprimer"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 max-h-[84dvh] overflow-hidden rounded-t-[32px] bg-[#0B1538] ring-1 ring-white/10 shadow-[0_-24px_90px_rgba(0,0,0,0.60)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              drag="y"
              dragControls={foldersDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.35 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700) {
                  setSidebarOpen(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="sticky top-0 z-20 border-b border-white/10 bg-[#0B1538]/95 px-4 pt-3 pb-4 backdrop-blur-xl"
                onPointerDown={(e) => foldersDragControls.start(e)}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25" />

                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-100 font-semibold">Dossiers</div>
                  <button
                    type="button"
                    className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Fermer"
                  >
                    <X className="w-5 h-5 text-slate-100" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(84dvh-78px)] overflow-y-auto px-4 pb-8 pt-4">
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAll();
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full h-11 px-3 rounded-2xl text-left ring-1 ring-white/10 transition text-slate-100",
                      !selectedFolder && !showFavoritesOnly
                        ? "bg-white/10"
                        : "bg-white/[0.05] hover:bg-white/[0.08]"
                    )}
                  >
                    Toutes les recettes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectFavorites();
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "w-full h-11 px-3 rounded-2xl text-left ring-1 ring-white/10 transition text-slate-100 inline-flex items-center gap-2",
                      showFavoritesOnly
                        ? "bg-white/10"
                        : "bg-white/[0.05] hover:bg-white/[0.08]"
                    )}
                  >
                    <Heart className="w-4 h-4" />
                    Mes favoris
                  </button>

                  <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
                    {folders.map((folder) => (
                      <div key={folder.id} className="relative">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            onSelectFolder(folder.id);
                            setSidebarOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              onSelectFolder(folder.id);
                              setSidebarOpen(false);
                            }
                          }}
                          onDrop={(e) => onDropToFolder(folder.id, e)}
                          onDragOver={(e) => e.preventDefault()}
                          className={cn(
                            "w-full px-3 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-200 cursor-pointer",
                            selectedFolder === folder.id
                              ? "bg-white/10 text-slate-100 ring-1 ring-white/10"
                              : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                          )}
                        >
                          <Folder className="w-4 h-4" />
                          <span className="flex-1 truncate">{folder.name}</span>
                          <span className="text-[11px] text-white/40">
                            ({folderCounts.get(folder.id) ?? 0})
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setFolderMenuOpenId(
                                folderMenuOpenId === folder.id ? null : folder.id
                              );
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-slate-200"
                            aria-label="Options dossier"
                            title="Options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        {folderMenuOpenId === folder.id && (
                          <div
                            ref={folderMenuRef}
                            className="absolute right-2 top-[52px] z-[130] w-48 rounded-2xl bg-[#0B1020] ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => onRenameFolder(folder.id)}
                              className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/5 transition"
                            >
                              Renommer
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteFolder(folder.id)}
                              className="w-full px-4 py-3 text-left text-sm text-red-200 hover:bg-red-500/10 transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    {showNewFolderInput ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                          placeholder="Nom du dossier"
                          className="w-full h-11 px-4 rounded-2xl bg-white/5 ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none"
                          autoFocus
                        />
                        <button
                          onClick={handleCreateFolder}
                          className={cn(ui.btnPrimary, "h-11 px-4 rounded-2xl")}
                          type="button"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setShowNewFolderInput(false);
                            setNewFolderName("");
                          }}
                          className={cn(ui.btnGhost, "h-11 px-4 rounded-2xl")}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowNewFolderInput(true)}
                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        Nouveau dossier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recipeSheetOpen && openedRecipeId && (
          <div className="fixed inset-0 z-[140] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRecipeSheet}
            />

            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-hidden rounded-t-[32px] bg-[#071127] ring-1 ring-white/10 shadow-[0_-24px_90px_rgba(0,0,0,0.70)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              drag="y"
              dragControls={recipeDragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.28 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 700) {
                  closeRecipeSheet();
                }
              }}
            >
              <div
                className="sticky top-0 z-20 bg-[#071127]/95 px-4 pt-3 pb-3 backdrop-blur-xl border-b border-white/10"
                onPointerDown={(e) => recipeDragControls.start(e)}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25" />

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-amber-200/70">
                      Recette
                    </div>
                    <div className="truncate text-base font-semibold text-white">
                      {safeTitle(filteredRecipes.find((r) => r.id === openedRecipeId))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeRecipeSheet}
                    className="h-10 w-10 shrink-0 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.10] transition inline-flex items-center justify-center"
                    aria-label="Fermer la recette"
                  >
                    <X className="w-5 h-5 text-slate-100" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(94dvh-78px)] overflow-y-auto overscroll-contain">
                <RecipeDisplayMobile
                  recipeId={openedRecipeId}
                  onBack={closeRecipeSheet}
                  onEdit={(recipeId) => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    closeRecipeSheet();
                    onEdit(recipeId, e);
                  }}
                  embedded
                  hideBackButton
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {actionSheetOpen && actionSheetRecipe && (
        <div className="fixed inset-0 z-[140]">
          <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]" onClick={closeActionSheet} />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    {safeTitle(actionSheetRecipe)}
                  </div>
                  <div className="text-xs text-slate-300/70 mt-1 truncate">
                    {actionSheetRecipe.category || "Autre"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeActionSheet}
                  className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-100" />
                </button>
              </div>

              <div className="space-y-2">
                <SheetAction
                  icon={<Users className="w-5 h-5" />}
                  label="Partager"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onShareToGroup(actionSheetRecipe.id, e);
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={<Copy className="w-5 h-5" />}
                  label="Dupliquer"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onDuplicate(actionSheetRecipe, e);
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={<Edit className="w-5 h-5" />}
                  label="Modifier"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onEdit(actionSheetRecipe.id, e);
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={<Heart className="w-5 h-5" />}
                  label={
                    actionSheetRecipe.is_favorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onToggleFavorite(actionSheetRecipe.id, !!actionSheetRecipe.is_favorite, e);
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={
                    actionSheetRecipe.is_visible === false ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )
                  }
                  label={actionSheetRecipe.is_visible === false ? "Rendre visible" : "Masquer"}
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onToggleVisibility(
                      actionSheetRecipe.id,
                      actionSheetRecipe.is_visible !== false,
                      e
                    );
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={<Folder className="w-5 h-5" />}
                  label="Déplacer dans un dossier"
                  onClick={() => {
                    setMoveRecipe(actionSheetRecipe);
                    setMoveFolderOpen(true);
                    closeActionSheet();
                  }}
                />

                <SheetAction
                  icon={<Trash2 className="w-5 h-5" />}
                  label={selectedFolder ? "Retirer du dossier" : "Supprimer"}
                  tone="danger"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onTrash(actionSheetRecipe.id, e);
                    closeActionSheet();
                  }}
                />
              </div>

              <div className="mt-3 text-xs text-slate-400/70">
                Astuce : touche la carte pour ouvrir la recette, et utilise ⋯ pour
                les actions.
              </div>
            </div>
          </div>
        </div>
      )}

      {moveFolderOpen && moveRecipe && (
        <div className="fixed inset-0 z-[150]">
          <div
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]"
            onClick={() => {
              setMoveFolderOpen(false);
              setMoveRecipe(null);
            }}
          />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    Déplacer : {safeTitle(moveRecipe)}
                  </div>
                  <div className="text-xs text-slate-300/70 mt-1">
                    Choisir un dossier
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMoveFolderOpen(false);
                    setMoveRecipe(null);
                  }}
                  className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-100" />
                </button>
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => {
                    onMoveToFolder(moveRecipe.id, null);
                    setMoveFolderOpen(false);
                    setMoveRecipe(null);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left"
                >
                  <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-white/10 text-slate-200">
                    <Folder className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-slate-100">
                    À la racine
                  </span>
                  {!moveRecipe.folder_id && (
                    <Check className="w-4 h-4 text-amber-300" />
                  )}
                </button>

                {folders.map((folder) => {
                  const active = moveRecipe.folder_id === folder.id;

                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => {
                        onMoveToFolder(moveRecipe.id, folder.id);
                        setMoveFolderOpen(false);
                        setMoveRecipe(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left"
                    >
                      <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-white/10 text-slate-200">
                        <Folder className="w-5 h-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-slate-100">
                          {folder.name}
                        </span>
                        <span className="block text-xs text-slate-300/60">
                          {folderCounts.get(folder.id) ?? 0} recette
                          {(folderCounts.get(folder.id) ?? 0) > 1 ? "s" : ""}
                        </span>
                      </span>
                      {active && <Check className="w-4 h-4 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}