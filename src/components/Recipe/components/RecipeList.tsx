import type {
  DragEvent,
  MouseEvent,
} from "react";
import { Plus } from "lucide-react";
import { useRecipeList } from "../../../features/recipe/hooks/useRecipeList";
import { ui } from "../../../styles/ui";
import { KitchNLoader } from "../../Loading/KitchNLoader";
import RecipeDisplay from "./RecipeDisplay";
import { RecipeGroupsModal } from "./RecipeGroupsModal";
import { RecipeListDesktop } from "./RecipeListDesktop";
import { RecipeListMobile } from "./RecipeListMobile";

type RecipeListProps = {
  onCreateNew: () => void;
  onEdit: (recipeId: string) => void;
  recipeToOpenId?: string | null;
  onRecipeOpened?: () => void;
};

export function RecipeList({
  onCreateNew,
  onEdit,
  recipeToOpenId,
  onRecipeOpened,
}: RecipeListProps) {
  const list = useRecipeList({
    recipeToOpenId,
    onRecipeOpened,
  });

  if (list.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <KitchNLoader className="kitchn-loader--compact" />
      </div>
    );
  }

  if (list.viewingRecipe) {
    return (
      <RecipeDisplay
        recipeId={list.viewingRecipe}
        onBack={() =>
          list.setViewingRecipe(null)
        }
      />
    );
  }

  function handleSelectAll() {
    list.setSelectedFolder(null);
    list.setShowFavoritesOnly(false);
  }

  function handleSelectFavorites() {
    list.setSelectedFolder(null);
    list.setShowFavoritesOnly(true);
  }

  function handleSelectFolder(
    folderId: string
  ) {
    list.setSelectedFolder(folderId);
    list.setShowFavoritesOnly(false);
  }

  function handleShareToGroup(
    recipeId: string,
    event: MouseEvent
  ) {
    event.stopPropagation();
    list.setActiveRecipeId(recipeId);
    list.setShowGroupsModal(true);
  }

  function handleEditRecipe(
    recipeId: string,
    event: MouseEvent
  ) {
    event.stopPropagation();
    onEdit(recipeId);
  }

  function handleDragStartRecipe(
    recipeId: string,
    event: DragEvent
  ) {
    event.dataTransfer.setData(
      "text/plain",
      recipeId
    );
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDropToFolder(
    folderId: string | null,
    event: DragEvent
  ) {
    event.preventDefault();

    const recipeId =
      event.dataTransfer.getData("text/plain");

    if (!recipeId) return;

    void list.handleMoveRecipeToFolder(
      recipeId,
      folderId
    );
  }

  const sharedProps = {
    userExists: list.userExists,
    recipesCount: list.recipes.length,
    filteredRecipes: list.filteredRecipes,
    categories: list.categories,
    folders: list.folders,

    searchTerm: list.searchTerm,
    onChangeSearch: list.setSearchTerm,

    categoryFilter: list.categoryFilter,
    onChangeCategory:
      list.setCategoryFilter,

    selectedFolder: list.selectedFolder,
    showFavoritesOnly:
      list.showFavoritesOnly,

    folderMenuOpenId:
      list.folderMenuOpenId,
    setFolderMenuOpenId:
      list.setFolderMenuOpenId,
    folderMenuRef: list.folderMenuRef,

    showNewFolderInput:
      list.showNewFolderInput,
    setShowNewFolderInput:
      list.setShowNewFolderInput,
    newFolderName: list.newFolderName,
    setNewFolderName:
      list.setNewFolderName,

    onCreateNew,
    onOpenRecipe: list.setViewingRecipe,

    onSelectAll: handleSelectAll,
    onSelectFavorites:
      handleSelectFavorites,
    onSelectFolder: handleSelectFolder,

    onDropToFolder: handleDropToFolder,
    onDragStartRecipe:
      handleDragStartRecipe,

    onCreateFolder:
      list.handleCreateFolder,
    onRenameFolder:
      list.handleRenameFolder,
    onDeleteFolder:
      list.handleDeleteFolder,

    onToggleFavorite:
      list.handleToggleFavorite,
    onToggleVisibility:
      list.handleToggleVisibility,

    onShareToGroup:
      handleShareToGroup,
    onDuplicate: list.handleDuplicate,
    onEdit: handleEditRecipe,
    onTrash: list.handleTrashClick,
    onMoveToFolder:
      list.handleMoveRecipeToFolder,
  };

  return (
    <>
      {list.isDesktop ? (
        <div className={ui.dashboardBg}>
          <div
            className={`${ui.containerWide} px-4 py-6 sm:px-6 sm:py-8`}
          >
            {list.userExists ? (
              <div className="mb-6 flex justify-end">
                <button
                  onClick={onCreateNew}
                  className={ui.btnPrimary}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle recette
                </button>
              </div>
            ) : null}

            <RecipeListDesktop
              {...sharedProps}
            />
          </div>
        </div>
      ) : (
        <RecipeListMobile
          {...sharedProps}
          filteredCount={
            list.filteredRecipes.length
          }
          sidebarOpen={list.sidebarOpen}
          setSidebarOpen={
            list.setSidebarOpen
          }
          recipeToOpenId={recipeToOpenId}
          onRecipeOpened={
            onRecipeOpened
          }
        />
      )}

      <RecipeGroupsModal
        open={list.showGroupsModal}
        recipeId={
          list.activeRecipeId ?? ""
        }
        onClose={() => {
          list.setShowGroupsModal(false);
          list.setActiveRecipeId(null);
        }}
      />
    </>
  );
}