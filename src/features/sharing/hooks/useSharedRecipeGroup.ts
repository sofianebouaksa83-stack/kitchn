import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabase";
import type {
  GroupFolder,
  RecipeRow,
} from "../types/sharing.types";

type UseSharedRecipeGroupOptions = {
  groupId: string;
};

export function useSharedRecipeGroup({
  groupId,
}: UseSharedRecipeGroupOptions) {
  const { user } = useAuth();
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<GroupFolder[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);

  const [selectedFolder, setSelectedFolder] =
    useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("Toutes");

  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] =
    useState(false);

  const [memberRole, setMemberRole] =
    useState<string | null>(null);

  const canShare =
    memberRole === "admin" || memberRole === "second";

  const canEdit =
    memberRole === "admin" || memberRole === "second";

  const canRemoveFromGroup =
    memberRole === "admin" || memberRole === "second";

  const canManageFolders =
    memberRole === "chef" || memberRole === "admin";

  const loadMembership = useCallback(async () => {
    if (!userId) {
      setMemberRole(null);
      return;
    }

    const { data, error } = await supabase
      .from("group_members")
      .select("role")
      .eq("work_group_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return;

    setMemberRole(
      (data as { role?: string } | null)?.role ?? null
    );
  }, [groupId, userId]);

  const loadFolders = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("work_group_folders")
      .select("id,group_id,name,created_by")
      .eq("group_id", groupId)
      .order("name");

    if (error) return;

    setFolders((data ?? []) as GroupFolder[]);
  }, [groupId, userId]);

  const loadRecipes = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("work_group_recipes")
      .select(`
        recipes (
          id,
          title,
          category,
          servings,
          prep_time,
          cook_time
        )
      `)
      .eq("group_id", groupId);

    if (error) return;

    const list: RecipeRow[] = (data ?? [])
      .map((row: any) => row.recipes)
      .filter(Boolean)
      .map((recipe: any) => ({
        id: String(recipe.id),
        title: recipe.title ?? null,
        category: recipe.category ?? null,
        servings: recipe.servings ?? null,
        prep_time: recipe.prep_time ?? null,
        cook_time: recipe.cook_time ?? null,
      }));

    const { data: mapData, error: mapError } =
      await supabase
        .from("work_group_folder_recipes")
        .select("recipe_id, folder_id")
        .eq("group_id", groupId);

    if (mapError) return;

    const folderByRecipeId =
      new Map<string, string | null>();

    for (const row of mapData ?? []) {
      folderByRecipeId.set(
        String((row as any).recipe_id),
        (row as any).folder_id
      );
    }

    const { data: favoriteData, error: favoriteError } =
      await supabase
        .from("favorite_recipes")
        .select("recipe_id")
        .eq("user_id", userId);

    if (favoriteError) return;

    const favoriteRecipeIds = new Set(
      (favoriteData ?? []).map((row: any) =>
        String(row.recipe_id)
      )
    );

    setRecipes(
      list.map((recipe) => ({
        ...recipe,
        folder_id:
          folderByRecipeId.get(String(recipe.id)) ?? null,
        is_favorite: favoriteRecipeIds.has(
          String(recipe.id)
        ),
      }))
    );
  }, [groupId, userId]);

  const loadAll = useCallback(async () => {
    setLoading(true);

    try {
      await Promise.all([
        loadMembership(),
        loadFolders(),
        loadRecipes(),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadFolders, loadMembership, loadRecipes]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const categories = useMemo(() => {
    const recipeCategories = recipes.map(
      (recipe) => recipe.category || "Sans catégorie"
    );

    return [
      "Toutes",
      ...Array.from(new Set(recipeCategories)),
    ];
  }, [recipes]);

  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();

    recipes.forEach((recipe) => {
      if (!recipe.folder_id) return;

      counts.set(
        recipe.folder_id,
        (counts.get(recipe.folder_id) ?? 0) + 1
      );
    });

    return counts;
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    const hasSearch = normalizedSearch.length > 0;

    return recipes.filter((recipe) => {
      if (showFavoritesOnly && !recipe.is_favorite) {
        return false;
      }

      if (
        !hasSearch &&
        selectedFolder &&
        recipe.folder_id !== selectedFolder
      ) {
        return false;
      }

      if (
        categoryFilter !== "Toutes" &&
        (recipe.category || "Sans catégorie") !==
          categoryFilter
      ) {
        return false;
      }

      if (
        hasSearch &&
        !(recipe.title || "")
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });
  }, [
    recipes,
    showFavoritesOnly,
    selectedFolder,
    categoryFilter,
    searchTerm,
  ]);

  const handleCreateFolder = useCallback(async () => {
    if (!userId || !canManageFolders) return;

    const name = newFolderName.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("work_group_folders")
      .insert({
        group_id: groupId,
        name,
        created_by: userId,
      })
      .select()
      .maybeSingle();

    if (error || !data) return;

    setFolders((previousFolders) => {
      const folder = data as GroupFolder;
      const alreadyExists = previousFolders.some(
        (item) => item.id === folder.id
      );

      const nextFolders = alreadyExists
        ? previousFolders
        : [...previousFolders, folder];

      return nextFolders
        .slice()
        .sort((first, second) =>
          first.name.localeCompare(second.name)
        );
    });

    setNewFolderName("");
    setShowNewFolderInput(false);
  }, [
    canManageFolders,
    groupId,
    newFolderName,
    userId,
  ]);

  const handleRenameFolder = useCallback(
    async (folderId: string) => {
      if (!canManageFolders) return;

      const folder = folders.find(
        (item) => item.id === folderId
      );

      const nextName = prompt(
        "Nouveau nom :",
        folder?.name ?? ""
      );

      if (!nextName?.trim()) return;

      await supabase
        .from("work_group_folders")
        .update({ name: nextName.trim() })
        .eq("id", folderId)
        .eq("group_id", groupId);

      await loadFolders();
    },
    [
      canManageFolders,
      folders,
      groupId,
      loadFolders,
    ]
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      if (!canManageFolders) return;
      if (!confirm("Supprimer ce dossier ?")) return;

      await supabase
        .from("work_group_folder_recipes")
        .delete()
        .eq("group_id", groupId)
        .eq("folder_id", folderId);

      await supabase
        .from("work_group_folders")
        .delete()
        .eq("id", folderId)
        .eq("group_id", groupId);

      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }

      await loadAll();
    },
    [
      canManageFolders,
      groupId,
      loadAll,
      selectedFolder,
    ]
  );

  const handleToggleFavorite = useCallback(
    async (
      recipeId: string,
      isFavorite: boolean
    ) => {
      if (!userId) return;

      if (isFavorite) {
        await supabase
          .from("favorite_recipes")
          .delete()
          .eq("user_id", userId)
          .eq("recipe_id", recipeId);
      } else {
        await supabase
          .from("favorite_recipes")
          .insert({
            user_id: userId,
            recipe_id: recipeId,
          });
      }

      setRecipes((previousRecipes) =>
        previousRecipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                is_favorite: !isFavorite,
              }
            : recipe
        )
      );
    },
    [userId]
  );

  const handleMoveToFolder = useCallback(
    async (
      recipeId: string,
      folderId: string | null
    ) => {
      if (!userId || !canManageFolders) return;

      await supabase
        .from("work_group_folder_recipes")
        .delete()
        .eq("group_id", groupId)
        .eq("recipe_id", recipeId);

      if (folderId) {
        await supabase
          .from("work_group_folder_recipes")
          .insert({
            group_id: groupId,
            recipe_id: recipeId,
            folder_id: folderId,
          });
      }

      setRecipes((previousRecipes) =>
        previousRecipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                folder_id: folderId,
              }
            : recipe
        )
      );
    },
    [
      canManageFolders,
      groupId,
      userId,
    ]
  );

  const handleRemoveFromGroup = useCallback(
    async (recipeId: string) => {
      if (!canRemoveFromGroup) return;

      if (!confirm("Retirer cette recette du groupe ?")) {
        return;
      }

      await supabase
        .from("work_group_recipes")
        .delete()
        .eq("group_id", groupId)
        .eq("recipe_id", recipeId);

      await supabase
        .from("work_group_folder_recipes")
        .delete()
        .eq("group_id", groupId)
        .eq("recipe_id", recipeId);

      await loadRecipes();
    },
    [
      canRemoveFromGroup,
      groupId,
      loadRecipes,
    ]
  );

  const handleRemoveFromFolder = useCallback(
    async (recipeId: string) => {
      if (!canManageFolders) return;

      if (!confirm("Retirer cette recette du dossier ?")) {
        return;
      }

      await supabase
        .from("work_group_folder_recipes")
        .delete()
        .eq("group_id", groupId)
        .eq("recipe_id", recipeId);

      setRecipes((previousRecipes) =>
        previousRecipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                folder_id: null,
              }
            : recipe
        )
      );
    },
    [
      canManageFolders,
      groupId,
    ]
  );

  return {
    loading,
    folders,
    recipes,
    recipesCount: recipes.length,

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

    memberRole,
    canShare,
    canEdit,
    canRemoveFromGroup,
    canManageFolders,

    categories,
    folderCounts,
    filteredRecipes,

    loadAll,
    loadFolders,
    loadRecipes,

    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleToggleFavorite,
    handleMoveToFolder,
    handleRemoveFromGroup,
    handleRemoveFromFolder,
  };
}

export type SharedRecipeGroupController =
  ReturnType<typeof useSharedRecipeGroup>;