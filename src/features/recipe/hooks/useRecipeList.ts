import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  createRecipeFolder,
  deleteRecipe,
  duplicateRecipe,
  loadRecipeListData,
  moveRecipeToFolder,
  removeRecipeFolder,
  renameRecipeFolder,
  setRecipeFavorite,
  setRecipeVisibility,
} from "../services/recipeListService";
import type {
  RecipeFolder,
  RecipeListItem,
} from "../types/recipe.types";
import { useIsDesktop } from "../../../hooks/useMediaQuery";

type UseRecipeListArgs = {
  recipeToOpenId?: string | null;
  onRecipeOpened?: () => void;
};

function getErrorMessage(
  error: unknown,
  fallback: string
) {
  return error instanceof Error
    ? error.message
    : fallback;
}

export function useRecipeList({
  recipeToOpenId,
  onRecipeOpened,
}: UseRecipeListArgs) {
  const { user } = useAuth();
  const userId = user?.id;
  const isDesktop = useIsDesktop();

  const [recipes, setRecipes] = useState<
    RecipeListItem[]
  >([]);
  const [folders, setFolders] = useState<
    RecipeFolder[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] =
    useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("Toutes");

  const [viewingRecipe, setViewingRecipe] =
    useState<string | null>(null);

  const [selectedFolder, setSelectedFolder] =
    useState<string | null>(null);
  const [
    showFavoritesOnly,
    setShowFavoritesOnly,
  ] = useState(false);

  const [newFolderName, setNewFolderName] =
    useState("");
  const [
    showNewFolderInput,
    setShowNewFolderInput,
  ] = useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    showGroupsModal,
    setShowGroupsModal,
  ] = useState(false);
  const [activeRecipeId, setActiveRecipeId] =
    useState<string | null>(null);

  const [
    folderMenuOpenId,
    setFolderMenuOpenId,
  ] = useState<string | null>(null);

  const folderMenuRef =
    useRef<HTMLDivElement | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setRecipes([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data =
        await loadRecipeListData(userId);

      setRecipes(data.recipes);
      setFolders(data.folders);
    } catch (error) {
      console.error(
        "[RecipeList] Error loading data:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    function handleDocumentMouseDown(
      event: globalThis.MouseEvent
    ) {
      if (!folderMenuOpenId) return;

      const target = event.target as Node | null;

      if (
        target &&
        folderMenuRef.current?.contains(target)
      ) {
        return;
      }

      setFolderMenuOpenId(null);
    }

    document.addEventListener(
      "mousedown",
      handleDocumentMouseDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentMouseDown
      );
    };
  }, [folderMenuOpenId]);

  useEffect(() => {
    if (!recipeToOpenId || !isDesktop) {
      return;
    }

    setViewingRecipe(recipeToOpenId);
    onRecipeOpened?.();
  }, [
    isDesktop,
    onRecipeOpened,
    recipeToOpenId,
  ]);

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    if (selectedFolder) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.folder_id === selectedFolder
      );
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(
        (recipe) => recipe.is_favorite
      );
    }

    const query = searchTerm
      .trim()
      .toLowerCase();

    if (query) {
      filtered = filtered.filter(
        (recipe) =>
          (recipe.title ?? "")
            .toLowerCase()
            .includes(query) ||
          recipe.ingredients.some(
            (ingredient) =>
              (ingredient.designation ?? "")
                .toLowerCase()
                .includes(query)
          )
      );
    }

    if (categoryFilter !== "Toutes") {
      filtered = filtered.filter(
        (recipe) =>
          (
            recipe.category ??
            "Sans catégorie"
          ) === categoryFilter
      );
    }

    return filtered;
  }, [
    categoryFilter,
    recipes,
    searchTerm,
    selectedFolder,
    showFavoritesOnly,
  ]);

  const categories = useMemo(
    () => [
      "Toutes",
      ...Array.from(
        new Set(
          recipes.map(
            (recipe) =>
              recipe.category ??
              "Sans catégorie"
          )
        )
      ),
    ],
    [recipes]
  );

  async function handleDeleteRecipeHard(
    recipeId: string
  ) {
    if (
      !userId ||
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette recette ?"
      )
    ) {
      return;
    }

    try {
      await deleteRecipe(recipeId, userId);

      setRecipes((current) =>
        current.filter(
          (recipe) =>
            recipe.id !== recipeId
        )
      );
    } catch (error) {
      console.error(
        "[RecipeList] Error deleting recipe:",
        error
      );
      window.alert(
        "Impossible de supprimer la recette."
      );
    }
  }

  async function handleTrashClick(
    recipeId: string,
    event: MouseEvent
  ) {
    event.stopPropagation();

    if (selectedFolder) {
      await handleMoveRecipeToFolder(
        recipeId,
        null
      );
      return;
    }

    await handleDeleteRecipeHard(recipeId);
  }

  async function handleToggleVisibility(
    recipeId: string,
    currentVisibility: boolean,
    event: MouseEvent
  ) {
    event.stopPropagation();

    if (!userId) return;

    const nextVisibility =
      !currentVisibility;

    try {
      await setRecipeVisibility(
        recipeId,
        userId,
        nextVisibility
      );

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                is_visible:
                  nextVisibility,
              }
            : recipe
        )
      );
    } catch (error) {
      console.error(
        "[RecipeList] Error updating visibility:",
        error
      );
    }
  }

  async function handleToggleFavorite(
    recipeId: string,
    currentFavorite: boolean,
    event: MouseEvent
  ) {
    event.stopPropagation();

    if (!userId) return;

    const nextFavorite = !currentFavorite;

    try {
      await setRecipeFavorite(
        recipeId,
        userId,
        nextFavorite
      );

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                is_favorite:
                  nextFavorite,
              }
            : recipe
        )
      );
    } catch (error) {
      console.error(
        "[RecipeList] Error toggling favorite:",
        error
      );
    }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();

    if (!name || !userId) return;

    try {
      const folder =
        await createRecipeFolder(
          name,
          userId
        );

      setFolders((current) => {
        if (
          current.some(
            (item) => item.id === folder.id
          )
        ) {
          return current;
        }

        return [...current, folder].sort(
          (first, second) =>
            first.name.localeCompare(
              second.name
            )
        );
      });

      setSelectedFolder(folder.id);
      setShowFavoritesOnly(false);
      setNewFolderName("");
      setShowNewFolderInput(false);
    } catch (error) {
      console.error(
        "[RecipeList] Error creating folder:",
        error
      );
      window.alert(
        getErrorMessage(
          error,
          "Impossible de créer le dossier."
        )
      );
    }
  }

  async function handleMoveRecipeToFolder(
    recipeId: string,
    folderId: string | null
  ) {
    if (!userId) return;

    try {
      await moveRecipeToFolder(
        recipeId,
        folderId,
        userId
      );

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                folder_id: folderId,
              }
            : recipe
        )
      );
    } catch (error) {
      console.error(
        "[RecipeList] Error moving recipe:",
        error
      );
      window.alert(
        getErrorMessage(
          error,
          "Impossible de déplacer la recette."
        )
      );
    }
  }

  async function handleDeleteFolder(
    folderId: string
  ) {
    if (!userId) return;

    const folderName =
      folders.find(
        (folder) => folder.id === folderId
      )?.name ?? "ce dossier";

    const confirmed = window.confirm(
      `Supprimer "${folderName}" ?\n\nLes recettes ne seront pas supprimées, elles seront juste retirées du dossier.`
    );

    if (!confirmed) return;

    try {
      await removeRecipeFolder(
        folderId,
        userId
      );

      setFolders((current) =>
        current.filter(
          (folder) =>
            folder.id !== folderId
        )
      );

      setRecipes((current) =>
        current.map((recipe) =>
          recipe.folder_id === folderId
            ? {
                ...recipe,
                folder_id: null,
              }
            : recipe
        )
      );

      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }

      setFolderMenuOpenId(null);
    } catch (error) {
      console.error(
        "[RecipeList] Error deleting folder:",
        error
      );
      window.alert(
        getErrorMessage(
          error,
          "Impossible de supprimer le dossier."
        )
      );
    }
  }

  async function handleRenameFolder(
    folderId: string
  ) {
    if (!userId) return;

    const currentName =
      folders.find(
        (folder) => folder.id === folderId
      )?.name ?? "";

    const name = window
      .prompt(
        "Nouveau nom du dossier :",
        currentName
      )
      ?.trim();

    if (!name) return;

    try {
      await renameRecipeFolder(
        folderId,
        name,
        userId
      );

      setFolders((current) =>
        current
          .map((folder) =>
            folder.id === folderId
              ? { ...folder, name }
              : folder
          )
          .sort((first, second) =>
            first.name.localeCompare(
              second.name
            )
          )
      );

      setFolderMenuOpenId(null);
    } catch (error) {
      console.error(
        "[RecipeList] Error renaming folder:",
        error
      );
      window.alert(
        getErrorMessage(
          error,
          "Impossible de renommer le dossier."
        )
      );
    }
  }

  async function handleDuplicate(
    recipe: RecipeListItem,
    event: MouseEvent
  ) {
    event.stopPropagation();

    if (!userId) return;

    try {
      await duplicateRecipe(
        recipe,
        userId
      );
      await reload();
    } catch (error) {
      console.error(
        "[RecipeList] Error duplicating recipe:",
        error
      );
    }
  }

  return {
    userExists: Boolean(userId),
    isDesktop,

    recipes,
    filteredRecipes,
    categories,
    folders,
    loading,

    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,

    viewingRecipe,
    setViewingRecipe,

    selectedFolder,
    setSelectedFolder,
    showFavoritesOnly,
    setShowFavoritesOnly,

    newFolderName,
    setNewFolderName,
    showNewFolderInput,
    setShowNewFolderInput,

    sidebarOpen,
    setSidebarOpen,

    showGroupsModal,
    setShowGroupsModal,
    activeRecipeId,
    setActiveRecipeId,

    folderMenuOpenId,
    setFolderMenuOpenId,
    folderMenuRef,

    handleCreateFolder,
    handleMoveRecipeToFolder,
    handleDeleteFolder,
    handleRenameFolder,
    handleToggleFavorite,
    handleToggleVisibility,
    handleTrashClick,
    handleDuplicate,
  };
}