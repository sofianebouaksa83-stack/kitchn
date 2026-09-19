import type {
  DragEvent,
  MouseEvent,
  RefObject,
} from "react";
import type {
  RecipeFolder,
  RecipeListItem,
} from "../../../features/recipe/types/recipe.types";

export type RecipeListSharedProps = {
  userExists: boolean;
  recipesCount: number;
  filteredRecipes: RecipeListItem[];
  categories: string[];
  folders: RecipeFolder[];

  searchTerm: string;
  onChangeSearch: (value: string) => void;
  categoryFilter: string;
  onChangeCategory: (value: string) => void;

  selectedFolder: string | null;
  showFavoritesOnly: boolean;

  folderMenuOpenId: string | null;
  setFolderMenuOpenId: (id: string | null) => void;
  folderMenuRef: RefObject<HTMLDivElement>;

  showNewFolderInput: boolean;
  setShowNewFolderInput: (value: boolean) => void;
  newFolderName: string;
  setNewFolderName: (value: string) => void;

  onCreateNew: () => void;
  onOpenRecipe: (id: string) => void;

  onSelectAll: () => void;
  onSelectFavorites: () => void;
  onSelectFolder: (folderId: string) => void;

  onDropToFolder: (
    folderId: string | null,
    event: DragEvent
  ) => void;
  onDragStartRecipe: (
    recipeId: string,
    event: DragEvent
  ) => void;

  onCreateFolder: () => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;

  onToggleFavorite: (
    recipeId: string,
    isFavorite: boolean,
    event: MouseEvent
  ) => void;
  onToggleVisibility: (
    recipeId: string,
    isVisible: boolean,
    event: MouseEvent
  ) => void;

  onShareToGroup: (
    recipeId: string,
    event: MouseEvent
  ) => void;
  onDuplicate: (
    recipe: RecipeListItem,
    event: MouseEvent
  ) => void;
  onEdit: (
    recipeId: string,
    event: MouseEvent
  ) => void;
  onTrash: (
    recipeId: string,
    event: MouseEvent
  ) => void;

  onMoveToFolder: (
    recipeId: string,
    folderId: string | null
  ) => void;
};