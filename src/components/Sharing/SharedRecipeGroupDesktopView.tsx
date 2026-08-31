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
      document.documentElement.style.overflow = "hidden";
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
        onBack={() => setViewingRecipeId(null)}
      />
    );
  }

  return (
    <PageShell
      withPanel={false}
      title={undefined}
      subtitle={undefined}
      icon={undefined}
      actions={undefined}
    >
      <div className={cn(ui.containerWide, "py-6 sm:py-8 px-4 sm:px-6")}>
        <div className="mb-6">
          <div className="text-2xl font-semibold text-slate-100">Partager</div>
          <div className="mt-1 text-sm text-slate-300/70">
            Groupe : <span className="text-slate-100 font-semibold">{groupName}</span>
            {" · "}
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

        <div className="flex gap-6 relative">
          <div
            className={[
              "w-72 rounded-[28px] bg-white/[0.06] ring-1 ring-white/10",
              "shadow-[0_18px_60px_rgba(0,0,0,0.30)] backdrop-blur-md p-5",
              "h-fit sticky top-24",
            ].join(" ")}
          >
            <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase mb-4">
              Dossiers
            </h3>

            <button
              onClick={() => {
                setSelectedFolder(null);
                setShowFavoritesOnly(false);
              }}
              onDragOver={(e) => {
                if (!canManageFolders) return;
                e.preventDefault();
                e.currentTarget.classList.add("ring-2", "ring-amber-400/25");
              }}
              onDragLeave={(e) =>
                e.currentTarget.classList.remove("ring-2", "ring-amber-400/25")
              }
              onDrop={(e) => {
                e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
                void handleDrop(null, e);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-2xl mb-2 transition-all duration-200",
                selectedFolder === null && !showFavoritesOnly
                  ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
              )}
              type="button"
            >
              Toutes les recettes
            </button>

            <button
              onClick={() => {
                setShowFavoritesOnly(true);
                setSelectedFolder(null);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-2xl mb-3 flex items-center gap-2 transition-all duration-200",
                showFavoritesOnly
                  ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
              )}
              type="button"
            >
              <Heart className="w-4 h-4" />
              Mes favoris
            </button>

            <div className="h-px bg-white/10 my-4" />

            {folders.map((folder) => (
              <div key={folder.id} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setShowFavoritesOnly(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedFolder(folder.id);
                      setShowFavoritesOnly(false);
                    }
                  }}
                  onDragOver={(e) => {
                    if (!canManageFolders) return;
                    e.preventDefault();
                    e.currentTarget.classList.add("ring-2", "ring-amber-400/25");
                  }}
                  onDragLeave={(e) =>
                    e.currentTarget.classList.remove("ring-2", "ring-amber-400/25")
                  }
                  onDrop={(e) => {
                    e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
                    void handleDrop(folder.id, e);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-2xl mb-2 flex items-center gap-2 transition-all duration-200 cursor-pointer",
                    selectedFolder === folder.id && !searchTerm.trim()
                      ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                  )}
                >
                  <Folder className="w-4 h-4" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <span className="text-[11px] text-white/40">
                    ({folderCounts.get(folder.id) ?? 0})
                  </span>

                  {canManageFolders && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderMenuOpenId((prev) =>
                          prev === folder.id ? null : folder.id
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          setFolderMenuOpenId((prev) =>
                            prev === folder.id ? null : folder.id
                          );
                        }
                      }}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors text-slate-200 cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {canManageFolders && folderMenuOpenId === folder.id && (
                  <div
                    ref={folderMenuRef}
                    className="absolute right-2 top-[52px] z-50 w-48 rounded-2xl bg-[#0B1020]/95 ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.35)] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => void handleRenameFolder(folder.id)}
                      className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/5 transition"
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
                      className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
                      autoFocus
                    />
                    <button
                      onClick={() => void handleCreateFolder()}
                      className={`${ui.btnPrimary} h-11 px-4 rounded-2xl`}
                      type="button"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName("");
                      }}
                      className={`${ui.btnGhost} h-11 px-4 rounded-2xl`}
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

          <div className="flex-1 min-w-0">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom…"
                  className="w-full h-11 pl-12 pr-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 outline-none focus:ring-2 focus:ring-amber-400/25"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0B1020]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <KitchNLoader className="kitchn-loader--compact" />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-200 text-lg font-semibold">
                  Aucune recette trouvée
                </p>
                <p className="text-sm text-slate-300/70 mt-2">
                  Change tes filtres ou ton dossier.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 border-t border-white/10">
                {filteredRecipes.map((recipe) => {
                  const folderName = recipe.folder_id
                    ? folders.find((f) => f.id === recipe.folder_id)?.name
                    : null;

                  return (
                    <div
                      key={recipe.id}
                      draggable={canManageFolders}
                      onDragStart={() => setDraggedRecipe(recipe.id)}
                      onClick={() => setViewingRecipeId(recipe.id)}
                      className="group cursor-pointer select-none px-4 py-4 transition-colors hover:bg-white/5 active:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          className="min-w-0 flex-1 text-left"
                          type="button"
                          onClick={() => setViewingRecipeId(recipe.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="min-w-0 truncate text-[15px] font-medium tracking-tight text-slate-100">
                              {recipe.title || "Sans titre"}
                            </h3>
                            {recipe.category && (
                              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-black/15 ring-1 ring-white/10 text-slate-200/90">
                                {recipe.category}
                              </span>
                            )}
                          </div>



                          {searchTerm.trim() && folderName && (
                            <p className="mt-1 text-[11px] text-white/40">
                              Dossier : {folderName}
                            </p>
                          )}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) =>
                              handleToggleFavorite(recipe.id, !!recipe.is_favorite, e)
                            }
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                            type="button"
                            title="Favori"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                recipe.is_favorite
                                  ? "fill-red-500 text-red-500"
                                  : "text-white/50"
                              }`}
                            />
                          </button>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingRecipeId(recipe.id);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                              title="Voir la recette"
                              type="button"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {canEdit && (
                              <button
                                onClick={(e) => handleEdit(recipe.id, e)}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                                title="Modifier la recette"
                                type="button"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                            )}

                            {canManageFolders && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMoveFolder(recipe);
                                }}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                                title="Déplacer dans un dossier"
                                type="button"
                              >
                                <Folder className="w-4 h-4" />
                              </button>
                            )}

                            {canShare && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGroupsModal(recipe.id);
                                }}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                                title="Partager à un autre groupe"
                                type="button"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            )}
                            
                            {(canRemoveFromGroup || canManageFolders) && (
                              <button
                                onClick={(e) => {
                                  if (
                                    selectedFolder &&
                                    canManageFolders &&
                                    recipe.folder_id === selectedFolder
                                  ) {
                                    void handleRemoveFromFolder(recipe.id, e);
                                    return;
                                  }

                                  if (canRemoveFromGroup) {
                                    void handleRemoveFromGroup(recipe.id, e);
                                  }
                                }}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-red-300 transition-colors"
                                type="button"
                                title={selectedFolder ? "Retirer du dossier" : "Retirer du groupe"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {moveFolderOpen && moveRecipe && (
          <div className="fixed inset-0 z-[140]">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={closeMoveFolder}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-[520px] rounded-[28px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.55)] p-5">
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
                    className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 text-slate-100 rotate-45" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => void handleSelectMoveFolder(null)}
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
                        onClick={() => void handleSelectMoveFolder(folder.id)}
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

        {activeRecipeId && (
        <RecipeGroupsModal
          open={showGroupsModal}
          recipeId={activeRecipeId}
          onClose={closeGroupsModal}
        />
      )}
      </div>
    </PageShell>
  );
}
