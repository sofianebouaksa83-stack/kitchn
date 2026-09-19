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
  ArrowLeft,
} from "lucide-react";
import { ui } from "../../../styles/ui";
import RecipeDisplayMobile from "./RecipeDisplayMobile";
import type { RecipeListItem } from "../../../features/recipe/types/recipe.types";
import type { RecipeListSharedProps } from "./RecipeList.types";
import { RecipeMoveFolderDialog } from "./RecipeMoveFolderDialog";

type Props = RecipeListSharedProps & {
  filteredCount: number;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  recipeToOpenId?: string | null;
  onRecipeOpened?: () => void;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function safeTitle(r?: RecipeListItem | null) {
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
    const unique = Array.from(
      new Set(categories.filter(Boolean)),
    );

    if (!unique.includes("Toutes")) {
      return ["Toutes", ...unique];
    }

    return unique;
  }, [categories]);

  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex min-w-max items-center gap-2 pr-2">
        {chips.map((cat) => {
          const active = cat === value;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                "h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium transition",
                active
                  ? "bg-[#184C3A] text-[#F7F3EA] shadow-[0_5px_14px_rgba(23,62,49,0.12)]"
                  : "border border-[#173E31]/10 bg-[#FBFAF6] text-[#29493E] hover:bg-[#E7EEE8]",
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
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        tone === "danger"
          ? "border-[#C05C56]/15 bg-[#FBFAF6] hover:bg-[#F5E4E0]"
          : "border-[#173E31]/10 bg-[#FBFAF6] hover:bg-[#E7EEE8]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
          tone === "danger"
            ? "bg-[#F5E4E0] text-[#A54C48]"
            : "bg-[#E7EEE8] text-[#184C3A]",
        )}
      >
        {icon}
      </span>

      <span
        className={cn(
          "text-sm font-medium",
          tone === "danger"
            ? "text-[#A54C48]"
            : "text-[#173E31]",
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
    recipeToOpenId,
    onRecipeOpened,
    } = props;

  const [openedRecipeId, setOpenedRecipeId] = useState<string | null>(null);
  const recipeSheetOpen = !!openedRecipeId;
  const closeRecipeSheet = () => setOpenedRecipeId(null);
  const recipeDragControls = useDragControls();
  const foldersDragControls = useDragControls();

  const [actionSheetRecipe, setActionSheetRecipe] =
    useState<RecipeListItem | null>(null);
  const actionSheetOpen = !!actionSheetRecipe;
  const closeActionSheet = () => setActionSheetRecipe(null);

  const [moveFolderOpen, setMoveFolderOpen] = useState(false);
  const [moveRecipe, setMoveRecipe] = useState<RecipeListItem | null>(null);


  useEffect(() => {
  if (!recipeToOpenId) return;

  setOpenedRecipeId(recipeToOpenId);
  onRecipeOpened?.();
}, [recipeToOpenId, onRecipeOpened]);

  useEffect(() => {
    const openPendingRecipe = (event?: Event) => {
      const eventRecipeId = (event as CustomEvent<{ recipeId?: string }> | undefined)
        ?.detail?.recipeId;
      const pendingRecipeId = eventRecipeId || sessionStorage.getItem("selectedRecipeId");

      if (!pendingRecipeId) return;

      sessionStorage.removeItem("selectedRecipeId");
      setOpenedRecipeId(pendingRecipeId);
    };

    openPendingRecipe();
    window.addEventListener("kitchn:open-recipe", openPendingRecipe);

    return () => {
      window.removeEventListener("kitchn:open-recipe", openPendingRecipe);
    };
  }, []);

  useEffect(() => {
    const shouldLock = sidebarOpen || recipeSheetOpen || actionSheetOpen || moveFolderOpen;

    if (!shouldLock) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
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
  <div className="px-4 pb-28 pt-6">
    {/* HEADER */}
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A8833E]">
          Bibliothèque
        </p>

        <h1 className="font-serif text-3xl font-medium text-[#173E31]">
          Mes recettes
        </h1>

        <div className="mt-1 text-sm text-[#718078]">
          {headerLabel} ·{" "}
          <span className="font-semibold text-[#173E31]">
            {filteredCount}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="
          inline-flex h-12 w-12
          items-center justify-center
          rounded-2xl
          border border-[#173E31]/10
          bg-[#FBFAF6]
          text-[#184C3A]
          transition
          hover:bg-[#E7EEE8]
        "
        aria-label="Ouvrir les filtres"
        title="Filtres"
      >
        <Filter className="h-5 w-5" />
      </button>
    </div>

    {/* RETOUR TOUTES */}
    {selectedFolder && (
      <button
        type="button"
        onClick={onSelectAll}
        className="
          mt-4 inline-flex h-10
          items-center gap-2
          rounded-full
          bg-[#E7EEE8]
          px-4
          text-sm font-semibold
          text-[#184C3A]
          transition
          active:scale-[0.98]
        "
      >
        <ArrowLeft className="h-4 w-4" />
        Toutes les recettes
      </button>
    )}

    {/* CTA */}
    <div className="mt-5">
      <button
        type="button"
        onClick={onCreateNew}
        className={cn(
          ui.btnPrimary,
          "h-12 w-full justify-center rounded-full",
        )}
      >
        <Plus className="h-5 w-5" />
        Nouvelle recette
      </button>
    </div>

    {/* SEARCH */}
    <div className="relative mt-5">
      <Search
        className="
          pointer-events-none
          absolute left-4 top-1/2
          h-5 w-5
          -translate-y-1/2
          text-[#718078]
        "
      />

      <input
        value={searchTerm}
        onChange={(e) =>
          onChangeSearch(e.target.value)
        }
        placeholder="Rechercher par nom ou ingrédient…"
        className="
          h-12 w-full
          rounded-2xl
          border border-[#173E31]/10
          bg-[#FBFAF6]
          pl-12 pr-4
          text-[#173E31]
          placeholder:text-[#8B9791]
          outline-none
          transition
          focus:border-[#C7A45D]/50
          focus:ring-2
          focus:ring-[#C7A45D]/20
        "
      />
    </div>

    {/* CATEGORIES */}
    <div className="mt-4">
      <CategoryChips
        categories={categories}
        value={categoryFilter}
        onChange={onChangeCategory}
      />
    </div>

    {/* LIST */}
    <div className="mt-6">
      {filteredRecipes.length === 0 ? (
        <div
          className="
            rounded-[28px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            p-8
            text-center
          "
        >
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#8B9791]" />

          <p className="font-serif text-lg font-semibold text-[#173E31]">
            {recipesCount === 0
              ? "Aucune recette pour le moment"
              : "Aucune recette trouvée"}
          </p>

          <p className="mt-2 text-sm text-[#718078]">
            Crée une recette ou change tes filtres.
          </p>

          {userExists && (
            <div className="mt-6">
              <button
                type="button"
                className={ui.btnPrimary}
                onClick={onCreateNew}
              >
                <Plus className="h-5 w-5" />
                Nouvelle recette
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecipes.map((r) => {
            const fav = !!r.is_favorite;
            const visible =
              r.is_visible !== false;

            const folderName =
              r.folder_id
                ? folders.find(
                    (f) =>
                      f.id === r.folder_id,
                  )?.name
                : null;

            return (
              <div
                key={r.id}
                draggable={false}
                onDrop={(e) =>
                  onDropToFolder(
                    r.folder_id ?? null,
                    e,
                  )
                }
                onDragOver={(e) =>
                  e.preventDefault()
                }
                className="
                  rounded-[22px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-4
                  shadow-[0_6px_20px_rgba(23,62,49,0.04)]
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      setOpenedRecipeId(r.id)
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " "
                      ) {
                        e.preventDefault();
                        setOpenedRecipeId(r.id);
                      }
                    }}
                    className="min-w-0 flex-1 outline-none"
                  >
                    <div
                      className="
                        truncate
                        font-serif
                        text-[17px]
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      {r.title ||
                        "Sans titre"}
                    </div>

                    <div
                      className="
                        mt-1 flex
                        flex-wrap
                        items-center
                        gap-x-2 gap-y-1
                        text-xs
                        text-[#718078]
                      "
                    >
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5 text-[#A8833E]" />

                        {r.category ||
                          "Autre"}
                      </span>
                    </div>

                    {searchTerm.trim() &&
                      folderName && (
                        <div className="mt-1 text-[11px] text-[#8B9791]">
                          Dossier :{" "}
                          {folderName}
                        </div>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionSheetRecipe(r);
                    }}
                    className="
                      inline-flex h-9 w-9
                      items-center justify-center
                      rounded-full
                      bg-[#F0F2EC]
                      text-[#617168]
                      transition
                      hover:bg-[#E7EEE8]
                      hover:text-[#184C3A]
                    "
                    aria-label="Actions"
                    title="Actions"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 text-[#718078]">
                  <button
                    type="button"
                    onClick={(e) =>
                      onShareToGroup(r.id, e)
                    }
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      transition
                      hover:bg-[#E7EEE8]
                      hover:text-[#184C3A]
                    "
                    title="Partager"
                  >
                    <Users className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      onToggleFavorite(
                        r.id,
                        fav,
                        e,
                      )
                    }
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
                      fav
                        ? "text-[#C96E6A] hover:bg-[#F5E4E0]"
                        : "hover:bg-[#E7EEE8] hover:text-[#184C3A]",
                    )}
                    title="Favori"
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        fav &&
                          "fill-current",
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={(e) =>
                      onToggleVisibility(
                        r.id,
                        visible,
                        e,
                      )
                    }
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      transition
                      hover:bg-[#E7EEE8]
                      hover:text-[#184C3A]
                    "
                    title={
                      visible
                        ? "Visible"
                        : "Masquée"
                    }
                  >
                    {visible ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>

                  <div className="flex-1" />

                  <button
                    type="button"
                    onClick={(e) =>
                      onTrash(r.id, e)
                    }
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-full
                      text-[#A86A66]
                      transition
                      hover:bg-[#F5E4E0]
                      hover:text-[#A54C48]
                    "
                    title={
                      selectedFolder
                        ? "Retirer du dossier"
                        : "Supprimer"
                    }
                  >
                    <Trash2 className="h-5 w-5" />
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
              className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />

            <motion.div
              className="absolute bottom-0 left-0 right-0 max-h-[84dvh] overflow-hidden rounded-t-[32px] border-t border-amber-300/10 bg-gradient-to-b from-[#0E1736] via-[#0B1538] to-[#070D22] ring-1 ring-amber-400/15 shadow-[0_-24px_90px_rgba(0,0,0,0.60)]"
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
                className="sticky top-0 z-20 border-b border-amber-300/10 bg-[#0E1736]/95 px-4 pt-3 pb-4 backdrop-blur-xl"
                onPointerDown={(e) => foldersDragControls.start(e)}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-amber-300/40" />

                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-100 font-semibold">Dossiers</div>
                  <button
                    type="button"
                    className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
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
                      "w-full h-11 px-3 rounded-2xl text-left ring-1 ring-amber-400/15 transition text-slate-100",
                      !selectedFolder && !showFavoritesOnly
                        ? "bg-amber-400/15"
                        : "bg-white/[0.04] hover:bg-amber-400/10"
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
                      "w-full h-11 px-3 rounded-2xl text-left ring-1 ring-amber-400/15 transition text-slate-100 inline-flex items-center gap-2",
                      showFavoritesOnly
                        ? "bg-amber-400/15"
                        : "bg-white/[0.04] hover:bg-amber-400/10"
                    )}
                  >
                    <Heart className="w-4 h-4" />
                    Mes favoris
                  </button>

                  <div className="mt-3 border-t border-amber-300/10 pt-3 space-y-2">
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
                              ? "bg-amber-400/15 text-slate-100 ring-1 ring-amber-400/15"
                              : "text-slate-300 hover:bg-amber-400/10 hover:text-slate-100"
                          )}
                        >
                          <Folder className="w-4 h-4" />
                          <span className="flex-1 truncate">{folder.name}</span>
                          <span className="text-[11px] text-amber-100/45">
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
                            className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/15 transition text-slate-200"
                            aria-label="Options dossier"
                            title="Options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        {folderMenuOpenId === folder.id && (
                          <div
                            ref={folderMenuRef}
                            className="absolute right-2 top-[52px] z-[130] w-48 rounded-2xl border border-amber-300/10 bg-[#0B1020] ring-1 ring-amber-400/15 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => onRenameFolder(folder.id)}
                              className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-amber-400/10 transition"
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
                          className="w-full h-11 px-4 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 border border-amber-300/10 text-slate-100 placeholder:text-slate-400/70 outline-none"
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
            {/* OVERLAY */}
            <motion.div
              className="absolute inset-0 bg-[#173E31]/20 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRecipeSheet}
            />

            {/* SHEET */}
            <motion.div
              className="
                absolute inset-x-0 bottom-0
                max-h-[96dvh]
                overflow-hidden
                rounded-t-[32px]
                border-t border-[#173E31]/10
                bg-[#F3F0E8]
                shadow-[0_-24px_70px_rgba(23,62,49,0.18)]
              "
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
              drag="y"
              dragControls={recipeDragControls}
              dragListener={false}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={{
                top: 0,
                bottom: 0.28,
              }}
              onDragEnd={(_, info) => {
                if (
                  info.offset.y > 120 ||
                  info.velocity.y > 700
                ) {
                  closeRecipeSheet();
                }
              }}
            >
              {/* HEADER */}
              <div
                className="
                  sticky top-0 z-20
                  border-b border-[#173E31]/10
                  bg-[#FBFAF6]/95
                  px-4 pb-3 pt-3
                  backdrop-blur-xl
                "
                onPointerDown={(e) =>
                  recipeDragControls.start(e)
                }
              >
                {/* DRAG HANDLE */}
                <div
                  className="
                    mx-auto mb-3
                    h-1.5 w-12
                    rounded-full
                    bg-[#C7A45D]/60
                  "
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-[#A8833E]
                      "
                    >
                      Fiche rapide
                    </div>

                    <div
                      className="
                        truncate
                        font-serif
                        text-lg
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      {safeTitle(
                        filteredRecipes.find(
                          (r) =>
                            r.id === openedRecipeId,
                        ),
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeRecipeSheet}
                    className="
                      inline-flex h-10 w-10
                      shrink-0
                      items-center justify-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                      transition
                      hover:bg-[#DDE8DF]
                    "
                    aria-label="Fermer la recette"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* CONTENT */}
              <div
                className="
                  max-h-[calc(96dvh-78px)]
                  overflow-y-auto
                  overscroll-contain
                "
              >
                <RecipeDisplayMobile
                  recipeId={openedRecipeId}
                  onBack={closeRecipeSheet}
                  onEdit={(recipeId) => {
                    const e = {
                      stopPropagation() {},
                    } as unknown as React.MouseEvent;

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
          <div className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]" onClick={closeActionSheet} />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] border border-amber-300/10 bg-gradient-to-b from-[#0E1736] to-[#0B1020] ring-1 ring-amber-400/15 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
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
                  className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
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

      <RecipeMoveFolderDialog
        open={moveFolderOpen}
        recipe={moveRecipe}
        folders={folders}
        folderCounts={folderCounts}
        onMoveToFolder={onMoveToFolder}
        onClose={() => {
          setMoveFolderOpen(false);
          setMoveRecipe(null);
        }}
      />
    </div>
  );
}