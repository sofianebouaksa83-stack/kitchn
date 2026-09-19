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

/* ─────────────────────────────
   CATEGORY CHIPS
───────────────────────────── */

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
      <div className="flex min-w-max items-center gap-2 pr-2">
        {categories.map((category) => {
          const active =
            category === value;

          return (
            <button
              key={category}
              type="button"
              onClick={() =>
                onChange(category)
              }
              className={cn(
                "h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium transition",
                active
                  ? "bg-[#184C3A] text-[#F7F3EA] shadow-[0_6px_16px_rgba(23,62,49,0.12)]"
                  : "border border-[#173E31]/10 bg-[#FBFAF6] text-[#617168] hover:bg-[#E7EEE8] hover:text-[#184C3A]",
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

/* ─────────────────────────────
   ACTION SHEET ROW
───────────────────────────── */

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
  const danger =
    tone === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
        danger
          ? "border-[#C05C56]/12 bg-[#F8EAE7] hover:bg-[#F5E1DD]"
          : "border-[#173E31]/8 bg-[#F7F5EF] hover:bg-[#E7EEE8]",
      )}
    >
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl",
          danger
            ? "bg-[#F3D9D5] text-[#A54C48]"
            : "bg-[#E7EEE8] text-[#184C3A]",
        )}
      >
        {icon}
      </span>

      <span
        className={cn(
          "text-sm font-medium",
          danger
            ? "text-[#A54C48]"
            : "text-[#29493E]",
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

  const [
    openedRecipeId,
    setOpenedRecipeId,
  ] = useState<string | null>(null);

  const recipeSheetOpen =
    Boolean(openedRecipeId);

  const closeRecipeSheet = () => {
    setOpenedRecipeId(null);
  };

  const recipeDragControls =
    useDragControls();

  const foldersDragControls =
    useDragControls();

  const [
    sheetRecipe,
    setSheetRecipe,
  ] = useState<RecipeRow | null>(null);

  const sheetOpen =
    Boolean(sheetRecipe);

  const closeSheet = () => {
    setSheetRecipe(null);
  };

  /* ─────────────────────────────
     INITIAL OPEN
  ───────────────────────────── */

  useEffect(() => {
    if (!initialRecipeId) return;

    setOpenedRecipeId(
      initialRecipeId,
    );

    onInitialRecipeOpened?.();
  }, [
    initialRecipeId,
    onInitialRecipeOpened,
  ]);

  /* ─────────────────────────────
     OPEN FROM HOME / EVENT
  ───────────────────────────── */

  useEffect(() => {
    const openPendingSharedRecipe = (
      event?: Event,
    ) => {
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
          "selectedSharedRecipeId",
        );

      const pendingGroupId =
        detail?.groupId ||
        sessionStorage.getItem(
          "selectedSharedGroupId",
        ) ||
        sessionStorage.getItem(
          "selectedWorkGroupId",
        );

      if (!pendingRecipeId) return;

      if (
        pendingGroupId &&
        pendingGroupId !== groupId
      ) {
        return;
      }

      sessionStorage.removeItem(
        "selectedSharedRecipeId",
      );

      sessionStorage.removeItem(
        "selectedSharedGroupId",
      );

      sessionStorage.removeItem(
        "selectedWorkGroupId",
      );

      setOpenedRecipeId(
        pendingRecipeId,
      );
    };

    openPendingSharedRecipe();

    window.addEventListener(
      "kitchn:open-shared-recipe",
      openPendingSharedRecipe,
    );

    return () => {
      window.removeEventListener(
        "kitchn:open-shared-recipe",
        openPendingSharedRecipe,
      );
    };
  }, [groupId]);

  /* ─────────────────────────────
     BODY LOCK
  ───────────────────────────── */

  useEffect(() => {
    const shouldLock =
      sidebarOpen ||
      recipeSheetOpen ||
      sheetOpen ||
      moveFolderOpen;

    if (!shouldLock) {
      document.documentElement.style.overflow =
        "";

      document.body.style.overflow =
        "";

      document.body.style.touchAction =
        "";

      return;
    }

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.overflow =
      "hidden";

    document.body.style.touchAction =
      "none";

    return () => {
      document.documentElement.style.overflow =
        "";

      document.body.style.overflow =
        "";

      document.body.style.touchAction =
        "";
    };
  }, [
    sidebarOpen,
    recipeSheetOpen,
    sheetOpen,
    moveFolderOpen,
  ]);

  /* ─────────────────────────────
     ESCAPE
  ───────────────────────────── */

  useEffect(() => {
    if (
      !sidebarOpen &&
      !recipeSheetOpen &&
      !sheetOpen &&
      !moveFolderOpen
    ) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key !== "Escape"
      ) {
        return;
      }

      setSidebarOpen(false);
      setOpenedRecipeId(null);
      setSheetRecipe(null);
      closeMoveFolder();
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    sidebarOpen,
    recipeSheetOpen,
    sheetOpen,
    moveFolderOpen,
    closeMoveFolder,
  ]);

  /* ─────────────────────────────
     HEADER LABEL
  ───────────────────────────── */

  const headerLabel =
    useMemo(() => {
      if (
        selectedFolder &&
        !searchTerm.trim()
      ) {
        return (
          folders.find(
            (folder) =>
              folder.id ===
              selectedFolder,
          )?.name ?? "Dossier"
        );
      }

      if (showFavoritesOnly) {
        return "Favoris";
      }

      return groupName;
    }, [
      selectedFolder,
      searchTerm,
      folders,
      showFavoritesOnly,
      groupName,
    ]);

  /* ─────────────────────────────
     FULL DISPLAY
  ───────────────────────────── */

  if (viewingRecipeId) {
    return (
      <RecipeDisplay
        recipeId={viewingRecipeId}
        onBack={() =>
          setViewingRecipeId(null)
        }
      />
    );
  }

  return (
    <div
      className={cn(
        ui.dashboardBg,
        "min-h-screen",
      )}
    >
      <div className="px-4 pb-28 pt-6">
        {/* ════════════════════════
            HEADER
        ════════════════════════ */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#A8833E]
              "
            >
              Groupe partagé
            </div>

            <h1
              className="
                mt-1
                truncate
                font-serif
                text-3xl
                font-semibold
                text-[#173E31]
              "
            >
              {headerLabel}
            </h1>

            <div className="mt-2 text-sm text-[#718078]">
              <span className="font-semibold text-[#173E31]">
                {filteredRecipes.length}
              </span>{" "}
              recette
              {filteredRecipes.length !==
              1
                ? "s"
                : ""}
            </div>

            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="
                  mt-3
                  inline-flex
                  items-center gap-2
                  text-sm font-medium
                  text-[#718078]
                  transition
                  hover:text-[#184C3A]
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux groupes
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="
              inline-flex
              h-11 w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border border-[#173E31]/10
              bg-[#FBFAF6]
              text-[#184C3A]
              shadow-[0_5px_15px_rgba(23,62,49,0.04)]
              transition
              active:scale-[0.97]
            "
            aria-label="Ouvrir les filtres"
            title="Filtres"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* SELECTED FOLDER */}

        {selectedFolder ? (
          <button
            type="button"
            onClick={() => {
              setSelectedFolder(null);
              setShowFavoritesOnly(false);
            }}
            className="
              mt-4
              inline-flex h-10
              items-center gap-2
              rounded-full
              bg-[#E7EEE8]
              px-4
              text-sm font-medium
              text-[#184C3A]
              transition
              active:scale-[0.98]
            "
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les recettes
          </button>
        ) : null}

        {/* ════════════════════════
            SEARCH
        ════════════════════════ */}

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
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Rechercher par nom…"
            className="
              h-12 w-full
              rounded-2xl
              border border-[#173E31]/10
              bg-[#FBFAF6]
              pl-12 pr-4
              text-sm
              text-[#173E31]
              placeholder:text-[#8B9791]
              outline-none
              transition
              focus:border-[#C7A45D]/50
              focus:ring-2
              focus:ring-[#C7A45D]/15
            "
          />
        </div>

        {/* CATEGORIES */}

        <div className="mt-4">
          <CategoryChips
            categories={categories}
            value={categoryFilter}
            onChange={
              setCategoryFilter
            }
          />
        </div>

        {/* ════════════════════════
            RECIPES
        ════════════════════════ */}

        <div className="mt-6">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center">
              <KitchNLoader className="kitchn-loader--compact" />
            </div>
          ) : filteredRecipes.length ===
            0 ? (
            <div
              className="
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-8
                text-center
              "
            >
              <AlertCircle
                className="
                  mx-auto mb-4
                  h-11 w-11
                  text-[#8B9791]
                "
              />

              <p
                className="
                  font-serif
                  text-xl
                  font-semibold
                  text-[#173E31]
                "
              >
                {recipesCount === 0
                  ? "Aucune recette pour le moment"
                  : "Aucune recette trouvée"}
              </p>

              <p className="mt-2 text-sm text-[#718078]">
                Change tes filtres ou ton
                dossier.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecipes.map(
                (recipe) => {
                  const fav =
                    !!recipe.is_favorite;

                  const folderName =
                    recipe.folder_id
                      ? folders.find(
                          (folder) =>
                            folder.id ===
                            recipe.folder_id,
                        )?.name
                      : null;

                  return (
                    <article
                      key={recipe.id}
                      className="
                        rounded-[22px]
                        border border-[#173E31]/10
                        bg-[#FBFAF6]
                        p-4
                        shadow-[0_5px_16px_rgba(23,62,49,0.035)]
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* OPEN */}

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setOpenedRecipeId(
                              recipe.id,
                            )
                          }
                          onKeyDown={(
                            event,
                          ) => {
                            if (
                              event.key ===
                                "Enter" ||
                              event.key ===
                                " "
                            ) {
                              event.preventDefault();

                              setOpenedRecipeId(
                                recipe.id,
                              );
                            }
                          }}
                          className="min-w-0 flex-1 outline-none"
                        >
                          <div
                            className="
                              truncate
                              font-serif
                              text-lg
                              font-semibold
                              text-[#173E31]
                            "
                          >
                            {recipe.title ||
                              "Sans titre"}
                          </div>

                          <div
                            className="
                              mt-1.5
                              flex flex-wrap
                              items-center
                              gap-x-2 gap-y-1
                              text-xs
                              text-[#718078]
                            "
                          >
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5 text-[#A8833E]" />

                              {recipe.category ||
                                "Autre"}
                            </span>
                          </div>

                          {searchTerm.trim() &&
                          folderName ? (
                            <div className="mt-1 text-[11px] text-[#8B9791]">
                              Dossier :{" "}
                              {folderName}
                            </div>
                          ) : null}
                        </div>

                        {/* MENU */}

                        <button
                          type="button"
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            setSheetRecipe(
                              recipe,
                            );
                          }}
                          className="
                            inline-flex
                            h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#F0F2EC]
                            text-[#718078]
                            transition
                            active:scale-[0.96]
                          "
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>

                      {/* ACTION BAR */}

                      <div className="mt-3 flex items-center gap-1 text-[#718078]">
                        {canShare ? (
                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              openGroupsModal(
                                recipe.id,
                              );
                            }}
                            className="
                              inline-flex
                              h-10 w-10
                              items-center
                              justify-center
                              rounded-full
                              transition
                              active:bg-[#E7EEE8]
                            "
                            title="Partager"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            void handleToggleFavorite(
                              recipe.id,
                              fav,
                            );
                          }}
                          className={cn(
                            "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
                            fav
                              ? "text-[#C96E6A] active:bg-[#F5E4E0]"
                              : "active:bg-[#E7EEE8]",
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
                          onClick={(
                            event,
                          ) => {
                            event.stopPropagation();

                            setOpenedRecipeId(
                              recipe.id,
                            );
                          }}
                          className="
                            inline-flex
                            h-10 w-10
                            items-center
                            justify-center
                            rounded-full
                            transition
                            active:bg-[#E7EEE8]
                          "
                          title="Voir"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {canEdit ? (
                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              handleEdit(
                                recipe.id,
                              );
                            }}
                            className="
                              inline-flex
                              h-10 w-10
                              items-center
                              justify-center
                              rounded-full
                              transition
                              active:bg-[#E7EEE8]
                            "
                            title="Modifier"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                        ) : null}

                        <div className="flex-1" />

                        {canRemoveFromGroup ||
                        canManageFolders ? (
                          <button
                            type="button"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              if (
                                selectedFolder &&
                                canManageFolders &&
                                recipe.folder_id ===
                                  selectedFolder
                              ) {
                                void handleRemoveFromFolder(
                                  recipe.id,
                                );

                                return;
                              }

                              if (
                                canRemoveFromGroup
                              ) {
                                void handleRemoveFromGroup(
                                  recipe.id,
                                );
                              }
                            }}
                            className="
                              inline-flex
                              h-10 w-10
                              items-center
                              justify-center
                              rounded-full
                              text-[#A86A66]
                              transition
                              active:bg-[#F5E4E0]
                            "
                            title={
                              selectedFolder
                                ? "Retirer du dossier"
                                : "Retirer du groupe"
                            }
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═════════════════════════════
          RECIPE BOTTOM SHEET
      ═════════════════════════════ */}

      <AnimatePresence>
        {recipeSheetOpen &&
        openedRecipeId ? (
          <div className="fixed inset-0 z-[140] lg:hidden">
            <motion.div
              className="
                absolute inset-0
                bg-[#173E31]/20
                backdrop-blur-[2px]
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={
                closeRecipeSheet
              }
            />

            <motion.div
              className="
                absolute inset-x-0
                bottom-0
                max-h-[94dvh]
                overflow-hidden
                rounded-t-[32px]
                border-t
                border-[#173E31]/10
                bg-[#F3F0E8]
                shadow-[0_-24px_70px_rgba(23,62,49,0.16)]
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
              dragControls={
                recipeDragControls
              }
              dragListener={false}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={{
                top: 0,
                bottom: 0.28,
              }}
              onDragEnd={(
                _,
                info,
              ) => {
                if (
                  info.offset.y > 120 ||
                  info.velocity.y > 700
                ) {
                  closeRecipeSheet();
                }
              }}
            >
              <div
                className="
                  sticky top-0 z-20
                  border-b
                  border-[#173E31]/8
                  bg-[#FBFAF6]/95
                  px-4 pb-3 pt-3
                  backdrop-blur-xl
                "
                onPointerDown={(
                  event,
                ) =>
                  recipeDragControls.start(
                    event,
                  )
                }
              >
                <div
                  className="
                    mx-auto mb-3
                    h-1.5 w-12
                    rounded-full
                    bg-[#C7A45D]/45
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
                      Recette partagée
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
                        recipes.find(
                          (recipe) =>
                            recipe.id ===
                            openedRecipeId,
                        ),
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeRecipeSheet
                    }
                    className="
                      inline-flex
                      h-10 w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                    "
                    aria-label="Fermer la recette"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-[calc(94dvh-78px)] overflow-y-auto overscroll-contain">
                <RecipeDisplayMobile
                  recipeId={
                    openedRecipeId
                  }
                  onBack={
                    closeRecipeSheet
                  }
                  onEdit={(
                    recipeId,
                  ) => {
                    closeRecipeSheet();

                    handleEdit(
                      recipeId,
                    );
                  }}
                  embedded
                  hideBackButton
                />
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* ═════════════════════════════
          ACTION SHEET
      ═════════════════════════════ */}

      {sheetOpen &&
      sheetRecipe ? (
        <div className="fixed inset-0 z-[140]">
          <div
            className="
              absolute inset-0
              bg-[#173E31]/20
              backdrop-blur-[2px]
            "
            onClick={closeSheet}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
            <div
              className="
                mx-auto
                max-w-[520px]
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-4
                shadow-[0_24px_70px_rgba(23,62,49,0.18)]
              "
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      font-serif
                      text-xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    {sheetRecipe.title ||
                      "Sans titre"}
                  </div>

                  <div className="mt-1 truncate text-xs text-[#718078]">
                    {sheetRecipe.category ||
                      "Autre"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeSheet}
                  className="
                    inline-flex
                    h-10 w-10
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#E7EEE8]
                    text-[#184C3A]
                  "
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <SheetAction
                  icon={
                    <Eye className="h-5 w-5" />
                  }
                  label="Voir la recette"
                  onClick={() => {
                    setOpenedRecipeId(
                      sheetRecipe.id,
                    );

                    closeSheet();
                  }}
                />

                {canEdit ? (
                  <SheetAction
                    icon={
                      <Pencil className="h-5 w-5" />
                    }
                    label="Modifier la recette"
                    onClick={() => {
                      handleEdit(
                        sheetRecipe.id,
                      );

                      closeSheet();
                    }}
                  />
                ) : null}

                {canShare ? (
                  <SheetAction
                    icon={
                      <Share2 className="h-5 w-5" />
                    }
                    label="Partager à un groupe"
                    onClick={() => {
                      openGroupsModal(
                        sheetRecipe.id,
                      );

                      closeSheet();
                    }}
                  />
                ) : null}

                <SheetAction
                  icon={
                    <Heart className="h-5 w-5" />
                  }
                  label={
                    sheetRecipe.is_favorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                  onClick={() => {
                    void handleToggleFavorite(
                      sheetRecipe.id,
                      !!sheetRecipe.is_favorite,
                    );

                    closeSheet();
                  }}
                />

                {canManageFolders ? (
                  <SheetAction
                    icon={
                      <Folder className="h-5 w-5" />
                    }
                    label="Déplacer dans un dossier"
                    onClick={() => {
                      openMoveFolder(
                        sheetRecipe,
                      );

                      closeSheet();
                    }}
                  />
                ) : null}

                {canRemoveFromGroup ||
                canManageFolders ? (
                  <SheetAction
                    icon={
                      <Trash2 className="h-5 w-5" />
                    }
                    label={
                      selectedFolder
                        ? "Retirer du dossier"
                        : "Retirer du groupe"
                    }
                    tone="danger"
                    onClick={() => {
                      if (
                        selectedFolder &&
                        canManageFolders &&
                        sheetRecipe.folder_id ===
                          selectedFolder
                      ) {
                        void handleRemoveFromFolder(
                          sheetRecipe.id,
                        );
                      } else if (
                        canRemoveFromGroup
                      ) {
                        void handleRemoveFromGroup(
                          sheetRecipe.id,
                        );
                      }

                      closeSheet();
                    }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ═════════════════════════════
          MOVE FOLDER SHEET
      ═════════════════════════════ */}

      {moveFolderOpen &&
      moveRecipe ? (
        <div className="fixed inset-0 z-[150]">
          <div
            className="
              absolute inset-0
              bg-[#173E31]/20
              backdrop-blur-[2px]
            "
            onClick={closeMoveFolder}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 pb-6">
            <div
              className="
                mx-auto
                max-w-[520px]
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-4
                shadow-[0_24px_70px_rgba(23,62,49,0.18)]
              "
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="
                      truncate
                      font-serif
                      text-xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    Déplacer :{" "}
                    {moveRecipe.title ||
                      "Sans titre"}
                  </div>

                  <div className="mt-1 text-xs text-[#718078]">
                    Choisir un dossier
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeMoveFolder
                  }
                  className="
                    inline-flex
                    h-10 w-10
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#E7EEE8]
                    text-[#184C3A]
                  "
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() =>
                    void handleSelectMoveFolder(
                      null,
                    )
                  }
                  className="
                    flex w-full
                    items-center gap-3
                    rounded-2xl
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    px-4 py-3
                    text-left
                    transition
                    active:bg-[#E7EEE8]
                  "
                >
                  <span
                    className="
                      inline-flex
                      h-10 w-10
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                    "
                  >
                    <Folder className="h-5 w-5" />
                  </span>

                  <span className="flex-1 text-sm font-medium text-[#173E31]">
                    À la racine
                  </span>

                  {!moveRecipe.folder_id ? (
                    <Check className="h-4 w-4 text-[#A8833E]" />
                  ) : null}
                </button>

                {folders.map(
                  (folder) => {
                    const active =
                      moveRecipe.folder_id ===
                      folder.id;

                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() =>
                          void handleSelectMoveFolder(
                            folder.id,
                          )
                        }
                        className="
                          flex w-full
                          items-center gap-3
                          rounded-2xl
                          border border-[#173E31]/8
                          bg-[#F7F5EF]
                          px-4 py-3
                          text-left
                          transition
                          active:bg-[#E7EEE8]
                        "
                      >
                        <span
                          className="
                            inline-flex
                            h-10 w-10
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#E7EEE8]
                            text-[#184C3A]
                          "
                        >
                          <Folder className="h-5 w-5" />
                        </span>

                        <span className="flex-1">
                          <span className="block text-sm font-medium text-[#173E31]">
                            {folder.name}
                          </span>

                          <span className="block text-xs text-[#718078]">
                            {folderCounts.get(
                              folder.id,
                            ) ?? 0}{" "}
                            recette
                            {(folderCounts.get(
                              folder.id,
                            ) ??
                              0) > 1
                              ? "s"
                              : ""}
                          </span>
                        </span>

                        {active ? (
                          <Check className="h-4 w-4 text-[#A8833E]" />
                        ) : null}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ═════════════════════════════
          FOLDERS / FILTERS SHEET
      ═════════════════════════════ */}

      <AnimatePresence>
        {sidebarOpen ? (
          <div className="fixed inset-0 z-[120] lg:hidden">
            <motion.div
              className="
                absolute inset-0
                bg-[#173E31]/20
                backdrop-blur-[2px]
              "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                setSidebarOpen(false)
              }
            />

            <motion.div
              className="
                absolute bottom-0
                left-0 right-0
                max-h-[84dvh]
                overflow-hidden
                rounded-t-[32px]
                border-t
                border-[#173E31]/10
                bg-[#FBFAF6]
                shadow-[0_-24px_70px_rgba(23,62,49,0.16)]
              "
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              drag="y"
              dragControls={
                foldersDragControls
              }
              dragListener={false}
              dragConstraints={{
                top: 0,
                bottom: 0,
              }}
              dragElastic={{
                top: 0,
                bottom: 0.35,
              }}
              onDragEnd={(
                _,
                info,
              ) => {
                if (
                  info.offset.y > 120 ||
                  info.velocity.y > 700
                ) {
                  setSidebarOpen(
                    false,
                  );
                }
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              {/* SHEET HEADER */}

              <div
                className="
                  sticky top-0 z-20
                  border-b
                  border-[#173E31]/8
                  bg-[#FBFAF6]/95
                  px-4 pb-4 pt-3
                  backdrop-blur-xl
                "
                onPointerDown={(
                  event,
                ) =>
                  foldersDragControls.start(
                    event,
                  )
                }
              >
                <div
                  className="
                    mx-auto mb-3
                    h-1.5 w-12
                    rounded-full
                    bg-[#C7A45D]/45
                  "
                />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.16em]
                        text-[#A8833E]
                      "
                    >
                      Navigation
                    </div>

                    <div
                      className="
                        font-serif
                        text-xl
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      Dossiers
                    </div>
                  </div>

                  <button
                    type="button"
                    className="
                      inline-flex
                      h-10 w-10
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                    "
                    onClick={() =>
                      setSidebarOpen(
                        false,
                      )
                    }
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* SHEET BODY */}

              <div className="max-h-[calc(84dvh-78px)] overflow-y-auto px-4 pb-8 pt-4">
                <div className="space-y-2">
                  {/* ALL */}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolder(
                        null,
                      );

                      setShowFavoritesOnly(
                        false,
                      );

                      setSidebarOpen(
                        false,
                      );
                    }}
                    className={cn(
                      "h-11 w-full rounded-2xl px-3 text-left text-sm font-medium transition",
                      !selectedFolder &&
                        !showFavoritesOnly
                        ? "bg-[#184C3A] text-[#F7F3EA]"
                        : "border border-[#173E31]/8 bg-[#F7F5EF] text-[#617168]",
                    )}
                  >
                    Toutes les recettes
                  </button>

                  {/* FAV */}

                  <button
                    type="button"
                    onClick={() => {
                      setShowFavoritesOnly(
                        true,
                      );

                      setSelectedFolder(
                        null,
                      );

                      setSidebarOpen(
                        false,
                      );
                    }}
                    className={cn(
                      "inline-flex h-11 w-full items-center gap-2 rounded-2xl px-3 text-left text-sm font-medium transition",
                      showFavoritesOnly
                        ? "bg-[#184C3A] text-[#F7F3EA]"
                        : "border border-[#173E31]/8 bg-[#F7F5EF] text-[#617168]",
                    )}
                  >
                    <Heart className="h-4 w-4" />
                    Mes favoris
                  </button>

                  {/* FOLDERS */}

                  <div className="mt-3 space-y-2 border-t border-[#173E31]/8 pt-3">
                    {folders.map(
                      (folder) => (
                        <div
                          key={
                            folder.id
                          }
                          className="relative"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedFolder(
                                folder.id,
                              );

                              setShowFavoritesOnly(
                                false,
                              );

                              setSidebarOpen(
                                false,
                              );
                            }}
                            onKeyDown={(
                              event,
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                setSelectedFolder(
                                  folder.id,
                                );

                                setShowFavoritesOnly(
                                  false,
                                );

                                setSidebarOpen(
                                  false,
                                );
                              }
                            }}
                            onDrop={(
                              event,
                            ) =>
                              handleDrop(
                                folder.id,
                                event,
                              )
                            }
                            onDragOver={(
                              event,
                            ) => {
                              if (
                                !canManageFolders
                              ) {
                                return;
                              }

                              event.preventDefault();
                            }}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200",
                              selectedFolder ===
                                folder.id
                                ? "bg-[#E7EEE8] text-[#184C3A]"
                                : "border border-[#173E31]/8 bg-[#F7F5EF] text-[#617168]",
                            )}
                          >
                            <Folder className="h-4 w-4" />

                            <span className="flex-1 truncate">
                              {
                                folder.name
                              }
                            </span>

                            <span className="text-[11px] text-[#8B9791]">
                              {folderCounts.get(
                                folder.id,
                              ) ?? 0}
                            </span>

                            {canManageFolders ? (
                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.preventDefault();

                                  event.stopPropagation();

                                  setFolderMenuOpenId(
                                    (
                                      previous,
                                    ) =>
                                      previous ===
                                      folder.id
                                        ? null
                                        : folder.id,
                                  );
                                }}
                                className="
                                  inline-flex
                                  h-9 w-9
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-[#E7EEE8]
                                  text-[#184C3A]
                                "
                                aria-label="Options dossier"
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            ) : null}
                          </div>

                          {/* FOLDER MENU */}

                          {canManageFolders &&
                          folderMenuOpenId ===
                            folder.id ? (
                            <div
                              ref={
                                folderMenuRef
                              }
                              className="
                                absolute
                                right-2
                                top-[52px]
                                z-[130]
                                w-48
                                overflow-hidden
                                rounded-2xl
                                border border-[#173E31]/10
                                bg-[#FBFAF6]
                                shadow-[0_18px_45px_rgba(23,62,49,0.16)]
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  void handleRenameFolder(
                                    folder.id,
                                  )
                                }
                                className="
                                  w-full
                                  px-4 py-3
                                  text-left
                                  text-sm
                                  text-[#29493E]
                                  transition
                                  hover:bg-[#E7EEE8]
                                "
                              >
                                Renommer
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDeleteFolder(
                                    folder.id,
                                  )
                                }
                                className="
                                  w-full
                                  px-4 py-3
                                  text-left
                                  text-sm
                                  text-[#A54C48]
                                  transition
                                  hover:bg-[#F5E4E0]
                                "
                              >
                                Supprimer
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ),
                    )}
                  </div>

                  {/* CREATE FOLDER */}

                  {canManageFolders ? (
                    <div className="mt-4">
                      {showNewFolderInput ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={
                              newFolderName
                            }
                            onChange={(
                              event,
                            ) =>
                              setNewFolderName(
                                event.target
                                  .value,
                              )
                            }
                            onKeyDown={(
                              event,
                            ) =>
                              event.key ===
                                "Enter" &&
                              void handleCreateFolder()
                            }
                            placeholder="Nom du dossier"
                            className={ui.input}
                            autoFocus
                          />

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                void handleCreateFolder()
                              }
                              className={`${ui.btnDark} flex-1`}
                              type="button"
                            >
                              Créer
                            </button>

                            <button
                              onClick={() => {
                                setShowNewFolderInput(
                                  false,
                                );

                                setNewFolderName(
                                  "",
                                );
                              }}
                              className={`${ui.btnGhost} px-4`}
                              type="button"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setShowNewFolderInput(
                              true,
                            )
                          }
                          className="
                            mt-2
                            inline-flex
                            items-center gap-2
                            text-sm font-medium
                            text-[#A8833E]
                          "
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                          Nouveau dossier
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* SHARE */}

      {activeRecipeId ? (
        <RecipeGroupsModal
          open={showGroupsModal}
          recipeId={
            activeRecipeId
          }
          onClose={
            closeGroupsModal
          }
        />
      ) : null}
    </div>
  );
}