import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useDragControls,
} from "framer-motion";
import {
  Search,
  Plus,
  AlertCircle,
  Folder,
  MoreVertical,
  Heart,
  Share2,
  Trash2,
  X,
  Filter,
  Tag,
  Eye,
  Pencil,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useSharedRecipeGroupView } from "../../features/sharing/hooks/useSharedRecipeGroupView";
import type { RecipeRow } from "../../features/sharing/types/sharing.types";
import {
  cn,
  safeTitle,
} from "../../features/sharing/utils/sharingHelpers";
import { ui } from "../../styles/ui";
import { RecipeGroupsModal } from "../Recipe/components/RecipeGroupsModal";
import { RecipeDisplay } from "../Recipe/components/RecipeDisplay";
import RecipeDisplayMobile from "../Recipe/components/RecipeDisplayMobile";
import { KitchNLoader } from "../Loading/KitchNLoader";

type Props = {
  groupId: string;
  groupName?: string;
  onBack?: () => void;
  onEdit?: (recipeId: string) => void;
  initialRecipeId?: string | null;
  onInitialRecipeOpened?: () => void;
};

function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-2 min-w-max pr-2">
        {categories.map((category) => {
          const active = category === value;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={cn(
                "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 transition",
                active
                  ? "bg-amber-400/20 ring-amber-300/30 text-amber-100"
                  : "bg-white/[0.04] ring-amber-400/15 text-slate-200 hover:bg-white/[0.07]"
              )}
            >
              {category}
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
  icon: ReactNode;
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
        "bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-white/[0.05] transition text-left",
        tone === "danger" &&
          "hover:bg-red-500/10 ring-red-500/20"
      )}
    >
      <span
        className={cn(
          "h-10 w-10 rounded-2xl inline-flex items-center justify-center",
          tone === "danger"
            ? "bg-red-500/10 ring-1 ring-red-500/20 text-red-200"
            : "bg-white/[0.04] ring-1 ring-amber-400/15 text-slate-200"
        )}
      >
        {icon}
      </span>

      <span
        className={cn(
          "text-sm font-medium",
          tone === "danger"
            ? "text-red-100"
            : "text-slate-100"
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function SharedRecipeGroupMobileView({
  groupId,
  groupName = "Groupe",
  onBack,
  onEdit,
  initialRecipeId,
  onInitialRecipeOpened,
}: Props) {
  const {
    loading,
    folders,
    recipes,
    recipesCount,

    selectedFolder,
    setSelectedFolder,
    showFavoritesOnly,
    setShowFavoritesOnly,

    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,

    newFolderName,
    setNewFolderName,
    showNewFolderInput,
    setShowNewFolderInput,

    canShare,
    canEdit,
    canRemoveFromGroup,
    canManageFolders,

    categories,
    folderCounts,
    filteredRecipes,

    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleToggleFavorite,
    handleSelectMoveFolder,
    handleRemoveFromGroup,
    handleRemoveFromFolder,
    handleDrop,
    handleEdit,

    viewingRecipeId,
    setViewingRecipeId,

    showGroupsModal,
    activeRecipeId,
    openGroupsModal,
    closeGroupsModal,

    folderMenuOpenId,
    setFolderMenuOpenId,
    folderMenuRef,

    moveFolderOpen,
    moveRecipe,
    openMoveFolder,
    closeMoveFolder,
  } = useSharedRecipeGroupView({
    groupId,
    onEdit,
  });

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [openedRecipeId, setOpenedRecipeId] =
    useState<string | null>(null);

  const recipeSheetOpen = Boolean(openedRecipeId);

  const closeRecipeSheet = () => {
    setOpenedRecipeId(null);
  };

  const recipeDragControls = useDragControls();
  const foldersDragControls = useDragControls();

  const [sheetRecipe, setSheetRecipe] =
    useState<RecipeRow | null>(null);

  const sheetOpen = Boolean(sheetRecipe);

  const closeSheet = () => {
    setSheetRecipe(null);
  };

  useEffect(() => {
    if (!initialRecipeId) return;

    setOpenedRecipeId(initialRecipeId);
    onInitialRecipeOpened?.();
  }, [initialRecipeId, onInitialRecipeOpened]);

  useEffect(() => {
    const openPendingSharedRecipe = (event?: Event) => {
      const detail = (
        event as
          | CustomEvent<{
              recipeId?: string;
              groupId?: string;
            }>
          | undefined
      )?.detail;

      const pendingRecipeId =
        detail?.recipeId ||
        sessionStorage.getItem(
          "selectedSharedRecipeId"
        );

      const pendingGroupId =
        detail?.groupId ||
        sessionStorage.getItem(
          "selectedSharedGroupId"
        ) ||
        sessionStorage.getItem(
          "selectedWorkGroupId"
        );

      if (!pendingRecipeId) return;

      if (
        pendingGroupId &&
        pendingGroupId !== groupId
      ) {
        return;
      }

      sessionStorage.removeItem(
        "selectedSharedRecipeId"
      );
      sessionStorage.removeItem(
        "selectedSharedGroupId"
      );
      sessionStorage.removeItem(
        "selectedWorkGroupId"
      );

      setOpenedRecipeId(pendingRecipeId);
    };

    openPendingSharedRecipe();

    window.addEventListener(
      "kitchn:open-shared-recipe",
      openPendingSharedRecipe
    );

    return () => {
      window.removeEventListener(
        "kitchn:open-shared-recipe",
        openPendingSharedRecipe
      );
    };
  }, [groupId]);

  useEffect(() => {
    const shouldLock =
      sidebarOpen ||
      recipeSheetOpen ||
      sheetOpen ||
      moveFolderOpen;

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
  }, [
    sidebarOpen,
    recipeSheetOpen,
    sheetOpen,
    moveFolderOpen,
  ]);

  useEffect(() => {
    if (
      !sidebarOpen &&
      !recipeSheetOpen &&
      !sheetOpen &&
      !moveFolderOpen
    ) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setSidebarOpen(false);
      setOpenedRecipeId(null);
      setSheetRecipe(null);
      closeMoveFolder();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    sidebarOpen,
    recipeSheetOpen,
    sheetOpen,
    moveFolderOpen,
    closeMoveFolder,
  ]);

  const headerLabel = useMemo(() => {
    if (selectedFolder && !searchTerm.trim()) {
      return (
        folders.find(
          (folder) => folder.id === selectedFolder
        )?.name ?? "Dossier"
      );
    }

    if (showFavoritesOnly) return "Favoris";

    return groupName;
  }, [
    selectedFolder,
    searchTerm,
    folders,
    showFavoritesOnly,
    groupName,
  ]);

  if (viewingRecipeId) {
    return (
      <RecipeDisplay
        recipeId={viewingRecipeId}
        onBack={() => setViewingRecipeId(null)}
      />
    );
  }

  return (
    <div className={cn(ui.dashboardBg, "min-h-screen")}>
      <div className="px-4 pt-6 pb-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-100 tracking-tight">
              Partager
            </div>
            <div className="mt-1 text-sm text-slate-300/80">
              {headerLabel} ·{" "}
              <span className="text-slate-100 font-semibold">
                {filteredRecipes.length}
              </span>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-2 text-sm text-slate-300 hover:text-slate-100 transition"
              >
                ← Retour
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="h-12 w-12 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
            aria-label="Ouvrir les filtres"
            title="Filtres"
          >
            <Filter className="w-5 h-5 text-slate-100" />
          </button>
        </div>

        {selectedFolder && (
          <button
            type="button"
            onClick={() => {
              setSelectedFolder(null);
              setShowFavoritesOnly(false);
            }}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-2xl bg-white/[0.04] px-4 text-sm font-semibold text-slate-100 ring-1 ring-amber-400/15 transition active:scale-[0.98] hover:bg-amber-400/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les recettes
          </button>
        )}

        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom…"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 border border-amber-300/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
          />
        </div>

        <div className="mt-4">
          <CategoryChips
            categories={categories}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        <div className="mt-6">
          {loading ? (
            <KitchNLoader className="kitchn-loader--compact" />
          ) : filteredRecipes.length === 0 ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-amber-400/15 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">
                {recipesCount === 0
                  ? "Aucune recette pour le moment"
                  : "Aucune recette trouvée"}
              </p>
              <p className="text-sm text-slate-300/70 mt-2">
                Change tes filtres ou ton dossier.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredRecipes.map((r) => {
                const fav = !!r.is_favorite;
                const folderName = r.folder_id
                  ? folders.find((f) => f.id === r.folder_id)?.name
                  : null;

                return (
                  <div key={r.id} className="group py-4">
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
                            <Tag className="w-3.5 h-3.5 text-amber-100/45" />
                            {r.category || "Autre"}
                          </span>
                        </div>

                        {searchTerm.trim() && folderName && (
                          <div className="mt-1 text-[11px] text-amber-100/45">
                            Dossier : {folderName}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSheetRecipe(r);
                        }}
                        className="h-9 w-9 rounded-full bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-white/[0.07] transition inline-flex items-center justify-center text-white/60 hover:text-white"
                        aria-label="Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-white/60">
                      {canShare && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openGroupsModal(r.id);
                          }}
                          className="h-10 w-10 rounded-full hover:bg-white/[0.05] transition inline-flex items-center justify-center hover:text-white"
                          title="Partager"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleFavorite(r.id, fav);
                        }}
                        className={cn(
                          "h-10 w-10 rounded-full transition inline-flex items-center justify-center",
                          fav
                            ? "text-amber-300 hover:bg-amber-400/10"
                            : "hover:bg-white/[0.05] hover:text-white"
                        )}
                        title="Favori"
                      >
                        <Heart className={cn("w-5 h-5", fav && "fill-current")} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenedRecipeId(r.id);
                        }}
                        className="h-10 w-10 rounded-full hover:bg-white/[0.05] transition inline-flex items-center justify-center hover:text-white"
                        title="Voir"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(r.id);
                          }}
                          className="h-10 w-10 rounded-full hover:bg-white/[0.05] transition inline-flex items-center justify-center hover:text-white"
                          title="Modifier"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                      )}

                      <div className="flex-1" />

                    {(canRemoveFromGroup || canManageFolders) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (selectedFolder && canManageFolders && r.folder_id === selectedFolder) {
                            void handleRemoveFromFolder(r.id);
                            return;
                          }

                          if (canRemoveFromGroup) {
                            void handleRemoveFromGroup(r.id);
                          }
                        }}
                        className="h-10 w-10 rounded-full hover:bg-red-500/10 transition inline-flex items-center justify-center text-white/60 hover:text-red-200"
                        title={selectedFolder ? "Retirer du dossier" : "Retirer du groupe"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {recipeSheetOpen && openedRecipeId && (
          <div className="fixed inset-0 z-[140] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRecipeSheet}
            />

            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[94dvh] overflow-hidden rounded-t-[32px] border-t border-amber-300/10 bg-gradient-to-b from-[#0E1736] via-[#0B1538] to-[#070D22] ring-1 ring-amber-400/15 shadow-[0_-24px_90px_rgba(0,0,0,0.70)]"
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
                className="sticky top-0 z-20 bg-[#0E1736]/95 px-4 pt-3 pb-3 backdrop-blur-xl border-b border-amber-300/10"
                onPointerDown={(e) => recipeDragControls.start(e)}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-amber-300/40" />

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-amber-200/70">
                      Recette partagée
                    </div>
                    <div className="truncate text-base font-semibold text-white">
                      {safeTitle(recipes.find((r) => r.id === openedRecipeId))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeRecipeSheet}
                    className="h-10 w-10 shrink-0 rounded-2xl bg-white/[0.05] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
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
                    closeRecipeSheet();
                    handleEdit(recipeId);
                  }}
                  embedded
                  hideBackButton
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {sheetOpen && sheetRecipe && (
        <div className="fixed inset-0 z-[140]">
          <div className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]" onClick={closeSheet} />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] border border-amber-300/10 bg-gradient-to-b from-[#0E1736] to-[#0B1020] ring-1 ring-amber-400/15 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    {sheetRecipe.title || "Sans titre"}
                  </div>
                  <div className="text-xs text-slate-300/70 mt-1 truncate">
                    {sheetRecipe.category || "Autre"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-100" />
                </button>
              </div>

              <div className="space-y-2">
                <SheetAction
                  icon={<Eye className="w-5 h-5" />}
                  label="Voir la recette"
                  onClick={() => {
                    setOpenedRecipeId(sheetRecipe.id);
                    closeSheet();
                  }}
                />

                {canEdit && (
                  <SheetAction
                    icon={<Pencil className="w-5 h-5" />}
                    label="Modifier la recette"
                    onClick={() => {
                      handleEdit(sheetRecipe.id);
                      closeSheet();
                    }}
                  />
                )}

                {canShare && (
                  <SheetAction
                    icon={<Share2 className="w-5 h-5" />}
                    label="Partager à un groupe"
                    onClick={() => {
                      openGroupsModal(sheetRecipe.id);
                      closeSheet();
                    }}
                  />
                )}

                <SheetAction
                  icon={<Heart className="w-5 h-5" />}
                  label={
                    sheetRecipe.is_favorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                  onClick={() => {
                    void handleToggleFavorite(
                      sheetRecipe.id,
                      !!sheetRecipe.is_favorite
                    );
                    closeSheet();
                  }}
                />

                {canManageFolders && (
                  <SheetAction
                    icon={<Folder className="w-5 h-5" />}
                    label="Déplacer dans un dossier"
                    onClick={() => {
                      openMoveFolder(sheetRecipe);
                      closeSheet();
                    }}
                  />
                )}

                {(canRemoveFromGroup || canManageFolders) && (
                  <SheetAction
                    icon={<Trash2 className="w-5 h-5" />}
                    label={selectedFolder ? "Retirer du dossier" : "Retirer du groupe"}
                    tone="danger"
                    onClick={() => {
                      if (
                        selectedFolder &&
                        canManageFolders &&
                        sheetRecipe.folder_id === selectedFolder
                      ) {
                        void handleRemoveFromFolder(sheetRecipe.id);
                      } else if (canRemoveFromGroup) {
                        void handleRemoveFromGroup(sheetRecipe.id);
                      }
                      closeSheet();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {moveFolderOpen && moveRecipe && (
        <div className="fixed inset-0 z-[150]">
          <div
            className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]"
            onClick={closeMoveFolder}
          />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] border border-amber-300/10 bg-gradient-to-b from-[#0E1736] to-[#0B1020] ring-1 ring-amber-400/15 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    Déplacer : {moveRecipe.title || "Sans titre"}
                  </div>
                  <div className="text-xs text-slate-300/70 mt-1">
                    Choisir un dossier
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMoveFolder}
                  className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/10 transition inline-flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-100" />
                </button>
              </div>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => void handleSelectMoveFolder(null)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-white/[0.05] transition text-left"
                >
                  <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-amber-400/15 text-slate-200">
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
                      onClick={() => void handleSelectMoveFolder(folder.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-white/[0.05] transition text-left"
                    >
                      <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-amber-400/15 text-slate-200">
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
                      setSelectedFolder(null);
                      setShowFavoritesOnly(false);
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
                      setShowFavoritesOnly(true);
                      setSelectedFolder(null);
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
                            setSelectedFolder(folder.id);
                            setShowFavoritesOnly(false);
                            setSidebarOpen(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              setSelectedFolder(folder.id);
                              setShowFavoritesOnly(false);
                              setSidebarOpen(false);
                            }
                          }}
                          onDrop={(e) => handleDrop(folder.id, e)}
                          onDragOver={(e) => {
                            if (!canManageFolders) return;
                            e.preventDefault();
                          }}
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

                          {canManageFolders && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFolderMenuOpenId((prev) =>
                                  prev === folder.id ? null : folder.id
                                );
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 hover:bg-amber-400/15 transition text-slate-200"
                              aria-label="Options dossier"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {canManageFolders && folderMenuOpenId === folder.id && (
                          <div
                            ref={folderMenuRef}
                            className="absolute right-2 top-[52px] z-[130] w-48 rounded-2xl border border-amber-300/10 bg-[#0B1020] ring-1 ring-amber-400/15 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => void handleRenameFolder(folder.id)}
                              className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-amber-400/10 transition"
                            >
                              Renommer
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteFolder(folder.id)}
                              className="w-full px-4 py-3 text-left text-sm text-red-200 hover:bg-red-500/10 transition"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {canManageFolders && (
                    <div className="mt-4">
                      {showNewFolderInput ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && void handleCreateFolder()}
                            placeholder="Nom du dossier"
                            className="w-full h-11 px-4 rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 border border-amber-300/10 text-slate-100 placeholder:text-slate-400/70 outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => void handleCreateFolder()}
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
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

     {activeRecipeId && (
        <RecipeGroupsModal
          open={showGroupsModal}
          recipeId={activeRecipeId}
          onClose={closeGroupsModal}
        />
      )}
    </div>
  );
}
