import { useEffect } from "react";
import {
  Search,
  Plus,
  AlertCircle,
  Folder,
  MoreVertical,
  Heart,
  Share2,
  Trash2,
  Eye,
  Pencil,
  Check,
  ArrowLeft,
} from "lucide-react";

import { useSharedRecipeGroupView } from "../../features/sharing/hooks/useSharedRecipeGroupView";
import { cn } from "../../features/sharing/utils/sharingHelpers";

import { ui } from "../../styles/ui";

import { RecipeGroupsModal } from "../Recipe/components/RecipeGroupsModal";
import { RecipeDisplay } from "../Recipe/components/RecipeDisplay";
import { PageShell } from "../Layout/PageShell";
import { KitchNLoader } from "../Loading/KitchNLoader";

type Props = {
  groupId: string;
  groupName?: string;
  onBack?: () => void;
  onEdit?: (recipeId: string) => void;
  initialRecipeId?: string | null;
  onInitialRecipeOpened?: () => void;
};

export function SharedRecipeGroupDesktopView({
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

    setDraggedRecipe,

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

  useEffect(() => {
    if (!initialRecipeId) return;

    setViewingRecipeId(initialRecipeId);
    onInitialRecipeOpened?.();
  }, [
    initialRecipeId,
    onInitialRecipeOpened,
    setViewingRecipeId,
  ]);

  useEffect(() => {
    const previousOverflow =
      document.documentElement.style.overflow;

    if (moveFolderOpen) {
      document.documentElement.style.overflow =
        "hidden";
    }

    return () => {
      document.documentElement.style.overflow =
        previousOverflow;
    };
  }, [moveFolderOpen]);

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

  const iconButton =
    "inline-flex h-9 w-9 items-center justify-center " +
    "rounded-xl text-[#718078] transition " +
    "hover:bg-[#E7EEE8] hover:text-[#184C3A]";

  return (
    <PageShell
      withPanel={false}
      title={undefined}
      subtitle={undefined}
      icon={undefined}
      actions={undefined}
    >
      <div className="py-2">
        {/* HEADER */}
        <div className="mb-8">
          <p
            className="
              mb-2
              text-xs font-semibold
              uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Groupe partagé
          </p>

          <div
            className="
              flex items-end
              justify-between
              gap-5
            "
          >
            <div className="min-w-0">
              <h1
                className="
                  truncate
                  font-serif
                  text-4xl
                  font-semibold
                  text-[#173E31]
                "
              >
                {groupName}
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  text-[#718078]
                "
              >
                <span className="font-semibold text-[#173E31]">
                  {filteredRecipes.length}
                </span>{" "}
                recette
                {filteredRecipes.length !== 1
                  ? "s"
                  : ""}{" "}
                accessible
                {filteredRecipes.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="
                  inline-flex
                  items-center gap-2
                  rounded-full
                  bg-[#E7EEE8]
                  px-4 py-2.5
                  text-sm font-medium
                  text-[#184C3A]
                  transition
                  hover:bg-[#DDE8DF]
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Retour aux groupes
              </button>
            ) : null}
          </div>
        </div>

        <div className="relative flex gap-6">
          {/* ─────────────────────
              SIDEBAR
          ───────────────────── */}
          <aside
            className="
              sticky top-24
              h-fit w-72 shrink-0
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-5
              shadow-[0_12px_35px_rgba(23,62,49,0.06)]
            "
          >
            <h3
              className="
                mb-4
                text-xs font-semibold
                uppercase
                tracking-[0.18em]
                text-[#A8833E]
              "
            >
              Dossiers
            </h3>

            {/* TOUTES */}
            <button
              onClick={() => {
                setSelectedFolder(null);
                setShowFavoritesOnly(false);
              }}
              onDragOver={(event) => {
                if (!canManageFolders) return;

                event.preventDefault();

                event.currentTarget.classList.add(
                  "ring-2",
                  "ring-[#C7A45D]/30",
                );
              }}
              onDragLeave={(event) =>
                event.currentTarget.classList.remove(
                  "ring-2",
                  "ring-[#C7A45D]/30",
                )
              }
              onDrop={(event) => {
                event.currentTarget.classList.remove(
                  "ring-2",
                  "ring-[#C7A45D]/30",
                );

                void handleDrop(null, event);
              }}
              className={cn(
                "mb-2 w-full rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",
                selectedFolder === null &&
                  !showFavoritesOnly
                  ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                  : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
              )}
              type="button"
            >
              Toutes les recettes
            </button>

            {/* FAVORIS */}
            <button
              onClick={() => {
                setShowFavoritesOnly(true);
                setSelectedFolder(null);
              }}
              className={cn(
                "mb-3 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",
                showFavoritesOnly
                  ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                  : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
              )}
              type="button"
            >
              <Heart className="h-4 w-4" />
              Mes favoris
            </button>

            <div className="my-4 h-px bg-[#173E31]/8" />

            {/* DOSSIERS */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="relative"
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setShowFavoritesOnly(false);
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      setSelectedFolder(folder.id);
                      setShowFavoritesOnly(false);
                    }
                  }}
                  onDragOver={(event) => {
                    if (!canManageFolders) return;

                    event.preventDefault();

                    event.currentTarget.classList.add(
                      "ring-2",
                      "ring-[#C7A45D]/30",
                    );
                  }}
                  onDragLeave={(event) =>
                    event.currentTarget.classList.remove(
                      "ring-2",
                      "ring-[#C7A45D]/30",
                    )
                  }
                  onDrop={(event) => {
                    event.currentTarget.classList.remove(
                      "ring-2",
                      "ring-[#C7A45D]/30",
                    );

                    void handleDrop(
                      folder.id,
                      event,
                    );
                  }}
                  className={cn(
                    "mb-2 flex w-full cursor-pointer items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",
                    selectedFolder ===
                      folder.id &&
                      !searchTerm.trim()
                      ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                      : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
                  )}
                >
                  <Folder className="h-4 w-4 shrink-0" />

                  <span className="flex-1 truncate">
                    {folder.name}
                  </span>

                  <span className="text-[11px] text-[#8B9791]">
                    {folderCounts.get(
                      folder.id,
                    ) ?? 0}
                  </span>

                  {canManageFolders ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();

                        setFolderMenuOpenId(
                          (previous) =>
                            previous ===
                            folder.id
                              ? null
                              : folder.id,
                        );
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          event.stopPropagation();

                          setFolderMenuOpenId(
                            (previous) =>
                              previous ===
                              folder.id
                                ? null
                                : folder.id,
                          );
                        }
                      }}
                      className="
                        inline-flex h-8 w-8
                        items-center justify-center
                        rounded-xl
                        text-[#718078]
                        transition
                        hover:bg-[#DDE8DF]
                        hover:text-[#184C3A]
                      "
                      title="Options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>

                {/* MENU DOSSIER */}
                {canManageFolders &&
                folderMenuOpenId ===
                  folder.id ? (
                  <div
                    ref={folderMenuRef}
                    className="
                      absolute right-2 top-[52px]
                      z-50
                      w-48
                      overflow-hidden
                      rounded-2xl
                      border border-[#173E31]/10
                      bg-[#FBFAF6]
                      shadow-[0_18px_45px_rgba(23,62,49,0.14)]
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
            ))}

            {/* NOUVEAU DOSSIER */}
            {canManageFolders ? (
              <div className="mt-4">
                {showNewFolderInput ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(event) =>
                        setNewFolderName(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) =>
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
                          setNewFolderName("");
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
                      transition
                      hover:text-[#7F632F]
                    "
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Nouveau dossier
                  </button>
                )}
              </div>
            ) : null}
          </aside>

          {/* ─────────────────────
              CONTENT
          ───────────────────── */}
          <main className="min-w-0 flex-1">
            {/* SEARCH + CATEGORY */}
            <div
              className="
                mb-5
                grid grid-cols-1
                gap-3
                md:grid-cols-[1fr_220px]
              "
            >
              <div className="relative">
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
                  type="text"
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
                    focus:ring-[#C7A45D]/20
                  "
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value,
                  )
                }
                className="
                  h-12 w-full
                  rounded-2xl
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  px-4
                  text-sm font-medium
                  text-[#29493E]
                  outline-none
                  transition
                  focus:border-[#C7A45D]/50
                  focus:ring-2
                  focus:ring-[#C7A45D]/20
                "
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#FBFAF6]"
                    >
                      {category}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <KitchNLoader className="kitchn-loader--compact" />
              </div>
            ) : filteredRecipes.length ===
              0 ? (
              /* EMPTY */
              <div
                className="
                  rounded-[28px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-10
                  text-center
                "
              >
                <AlertCircle
                  className="
                    mx-auto mb-4
                    h-12 w-12
                    text-[#8B9791]
                  "
                />

                <p
                  className="
                    font-serif
                    text-xl font-semibold
                    text-[#173E31]
                  "
                >
                  Aucune recette trouvée
                </p>

                <p className="mt-2 text-sm text-[#718078]">
                  Change tes filtres ou ton
                  dossier.
                </p>
              </div>
            ) : (
              /* RECIPES */
              <div className="space-y-3">
                {filteredRecipes.map(
                  (recipe) => {
                    const folderName =
                      recipe.folder_id
                        ? folders.find(
                            (folder) =>
                              folder.id ===
                              recipe.folder_id,
                          )?.name
                        : null;

                    return (
                      <div
                        key={recipe.id}
                        draggable={
                          canManageFolders
                        }
                        onDragStart={() =>
                          setDraggedRecipe(
                            recipe.id,
                          )
                        }
                        onClick={() =>
                          setViewingRecipeId(
                            recipe.id,
                          )
                        }
                        className="
                          group
                          cursor-pointer
                          select-none
                          rounded-[22px]
                          border border-[#173E31]/10
                          bg-[#FBFAF6]
                          px-5 py-4
                          shadow-[0_6px_18px_rgba(23,62,49,0.035)]
                          transition-all
                          duration-200
                          hover:border-[#173E31]/18
                          hover:bg-[#F7F5EF]
                          hover:shadow-[0_10px_25px_rgba(23,62,49,0.06)]
                        "
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* RECIPE */}
                          <button
                            className="min-w-0 flex-1 text-left"
                            type="button"
                            onClick={() =>
                              setViewingRecipeId(
                                recipe.id,
                              )
                            }
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <h3
                                className="
                                  min-w-0
                                  truncate
                                  font-serif
                                  text-[17px]
                                  font-semibold
                                  text-[#173E31]
                                "
                              >
                                {recipe.title ||
                                  "Sans titre"}
                              </h3>

                              {recipe.category ? (
                                <span
                                  className="
                                    shrink-0
                                    rounded-full
                                    bg-[#E7EEE8]
                                    px-2.5 py-1
                                    text-[11px]
                                    font-medium
                                    text-[#557064]
                                  "
                                >
                                  {
                                    recipe.category
                                  }
                                </span>
                              ) : null}
                            </div>

                            {searchTerm.trim() &&
                            folderName ? (
                              <p className="mt-1 text-[11px] text-[#8B9791]">
                                Dossier :{" "}
                                {folderName}
                              </p>
                            ) : null}
                          </button>

                          {/* ACTIONS */}
                          <div className="flex shrink-0 items-center gap-1">
                            {/* FAVORI */}
                            <button
                              onClick={(
                                event,
                              ) =>
                                handleToggleFavorite(
                                  recipe.id,
                                  !!recipe.is_favorite,
                                  event,
                                )
                              }
                              className={
                                iconButton
                              }
                              type="button"
                              title="Favori"
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  recipe.is_favorite
                                    ? "fill-[#C96E6A] text-[#C96E6A]"
                                    : ""
                                }`}
                              />
                            </button>

                            <div
                              className="
                                flex items-center
                                gap-1
                                opacity-0
                                transition-opacity
                                group-hover:opacity-100
                              "
                            >
                              {/* VOIR */}
                              <button
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();
                                  setViewingRecipeId(
                                    recipe.id,
                                  );
                                }}
                                className={
                                  iconButton
                                }
                                title="Voir la recette"
                                type="button"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* EDIT */}
                              {canEdit ? (
                                <button
                                  onClick={(
                                    event,
                                  ) =>
                                    handleEdit(
                                      recipe.id,
                                      event,
                                    )
                                  }
                                  className={
                                    iconButton
                                  }
                                  title="Modifier la recette"
                                  type="button"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              ) : null}

                              {/* MOVE */}
                              {canManageFolders ? (
                                <button
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    openMoveFolder(
                                      recipe,
                                    );
                                  }}
                                  className={
                                    iconButton
                                  }
                                  title="Déplacer dans un dossier"
                                  type="button"
                                >
                                  <Folder className="h-4 w-4" />
                                </button>
                              ) : null}

                              {/* SHARE */}
                              {canShare ? (
                                <button
                                  onClick={(
                                    event,
                                  ) => {
                                    event.stopPropagation();

                                    openGroupsModal(
                                      recipe.id,
                                    );
                                  }}
                                  className={
                                    iconButton
                                  }
                                  title="Partager à un autre groupe"
                                  type="button"
                                >
                                  <Share2 className="h-4 w-4" />
                                </button>
                              ) : null}

                              {/* REMOVE */}
                              {canRemoveFromGroup ||
                              canManageFolders ? (
                                <button
                                  onClick={(
                                    event,
                                  ) => {
                                    if (
                                      selectedFolder &&
                                      canManageFolders &&
                                      recipe.folder_id ===
                                        selectedFolder
                                    ) {
                                      void handleRemoveFromFolder(
                                        recipe.id,
                                        event,
                                      );

                                      return;
                                    }

                                    if (
                                      canRemoveFromGroup
                                    ) {
                                      void handleRemoveFromGroup(
                                        recipe.id,
                                        event,
                                      );
                                    }
                                  }}
                                  className="
                                    inline-flex
                                    h-9 w-9
                                    items-center
                                    justify-center
                                    rounded-xl
                                    text-[#A86A66]
                                    transition
                                    hover:bg-[#F5E4E0]
                                    hover:text-[#A54C48]
                                  "
                                  type="button"
                                  title={
                                    selectedFolder
                                      ? "Retirer du dossier"
                                      : "Retirer du groupe"
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </main>
        </div>

        {/* ─────────────────────
            MOVE MODAL
        ───────────────────── */}
        {moveFolderOpen &&
        moveRecipe ? (
          <div className="fixed inset-0 z-[140]">
            <div
              className="
                absolute inset-0
                bg-[#173E31]/25
                backdrop-blur-[3px]
              "
              onClick={closeMoveFolder}
            />

            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className="
                  w-full max-w-[520px]
                  rounded-[28px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-5
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
                    onClick={closeMoveFolder}
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                      transition
                      hover:bg-[#DDE8DF]
                    "
                  >
                    <Plus className="h-5 w-5 rotate-45" />
                  </button>
                </div>

                <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                  {/* ROOT */}
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
                      hover:bg-[#E7EEE8]
                    "
                  >
                    <span
                      className="
                        inline-flex h-10 w-10
                        items-center justify-center
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

                  {/* FOLDERS */}
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
                            hover:bg-[#E7EEE8]
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

        {/* SHARE MODAL */}
        {activeRecipeId ? (
          <RecipeGroupsModal
            open={showGroupsModal}
            recipeId={activeRecipeId}
            onClose={closeGroupsModal}
          />
        ) : null}
      </div>
    </PageShell>
  );
}