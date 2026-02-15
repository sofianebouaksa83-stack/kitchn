import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase, type Recipe, type Ingredient } from "../../../lib/supabase";
import { Plus } from "lucide-react";

import { RecipeScaler } from "./RecipeScaler";
import RecipeDisplay from "./RecipeDisplay";
import { RecipeGroupsModal } from "./RecipeGroupsModal";

import { RecipeListMobile } from "./RecipeListMobile";
import { RecipeListDesktop } from "./RecipeListDesktop";

import { ui } from "../../../styles/ui";

type RecipeListProps = {
  onCreateNew: () => void;
  onEdit: (recipeId: string) => void;
};

type RecipeWithIngredients = Recipe & {
  ingredients: Ingredient[];
  is_visible?: boolean;
  folder_id?: string | null;
  is_favorite?: boolean;
};

type RecipeFolder = {
  id: string;
  name: string;
  created_by: string;
};

export function RecipeList({ onCreateNew, onEdit }: RecipeListProps) {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const [selectedRecipe, setSelectedRecipe] =
    useState<RecipeWithIngredients | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<string | null>(null);

  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  // --- menu "..." folders
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const folderMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent | globalThis.MouseEvent) {
      if (!folderMenuOpenId) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (folderMenuRef.current && folderMenuRef.current.contains(target)) return;
      setFolderMenuOpenId(null);
    }
    document.addEventListener("mousedown", onDocMouseDown as any);
    return () =>
      document.removeEventListener("mousedown", onDocMouseDown as any);
  }, [folderMenuOpenId]);

  useEffect(() => {
    if (!user) return;
    void loadRecipes();
    void loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function loadRecipes() {
    if (!user) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: recipesData, error: recipesError } = await supabase
        .from("recipes")
        .select(
          `
          *,
          favorite_recipes(user_id)
        `
        )
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (recipesError) throw recipesError;

      const recipesWithIngredients = await Promise.all(
        (recipesData || []).map(async (recipe: any) => {
          const { data: ingredients, error: ingErr } = await supabase
            .from("ingredients")
            .select("*")
            .eq("recipe_id", recipe.id)
            .order("order_index");

          if (ingErr) console.error("[RecipeList] ingredients error:", ingErr);

          const isFav = Array.isArray(recipe.favorite_recipes)
            ? recipe.favorite_recipes.some((f: any) => f.user_id === user.id)
            : false;

          return {
            ...recipe,
            ingredients: ingredients || [],
            is_favorite: isFav,
          } as RecipeWithIngredients;
        })
      );

      setRecipes(recipesWithIngredients);
    } catch (err) {
      console.error("[RecipeList] Error loading recipes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    if (!user) return;

    const { data, error } = await supabase
      .from("recipe_folders")
      .select("*")
      .eq("created_by", user.id)
      .order("name");

    if (error) console.error("[RecipeList] Error loading folders:", error);
    setFolders((data || []) as RecipeFolder[]);
  }

  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    if (selectedFolder) {
      filtered = filtered.filter((r) => r.folder_id === selectedFolder);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((r) => r.is_favorite);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          (r.title || "").toLowerCase().includes(q) ||
          (r.ingredients || []).some((ing) =>
            (ing.designation || "").toLowerCase().includes(q)
          )
      );
    }

    if (categoryFilter !== "Toutes") {
      filtered = filtered.filter(
        (r) => (r.category || "Sans catégorie") === categoryFilter
      );
    }

    return filtered;
  }, [recipes, selectedFolder, showFavoritesOnly, searchTerm, categoryFilter]);

  const categories = useMemo(
    () => [
      "Toutes",
      ...Array.from(new Set(recipes.map((r) => r.category || "Sans catégorie"))),
    ],
    [recipes]
  );

  async function handleDeleteRecipeHard(recipeId: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) return;

    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipeId);
      if (error) throw error;

      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    } catch (err) {
      console.error("[RecipeList] Error deleting recipe:", err);
      alert("Impossible de supprimer la recette (RLS ?).");
    }
  }

  // ✅ Trash behavior:
  // - If inside a folder => remove from folder only (folder_id=null)
  // - Otherwise => hard delete recipe
  async function handleTrashClick(recipeId: string, e: MouseEvent) {
    e.stopPropagation();

    if (selectedFolder) {
      await handleMoveToFolder(recipeId, null);
      return;
    }

    await handleDeleteRecipeHard(recipeId);
  }

  async function handleToggleVisibility(
    recipeId: string,
    currentVisibility: boolean,
    e: MouseEvent
  ) {
    e.stopPropagation();
    const next = !currentVisibility;

    const { error } = await supabase
      .from("recipes")
      .update({ is_visible: next })
      .eq("id", recipeId);

    if (!error) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, is_visible: next } : r))
      );
    }
  }

  async function handleToggleFavorite(
    recipeId: string,
    isFavorite: boolean,
    e: MouseEvent
  ) {
    e.stopPropagation();
    if (!user) return;

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_recipes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorite_recipes")
          .insert({ user_id: user.id, recipe_id: recipeId });
        if (error) throw error;
      }

      setRecipes((prev) =>
        prev.map((r) =>
          r.id === recipeId ? { ...r, is_favorite: !isFavorite } : r
        )
      );
    } catch (err) {
      console.error("[RecipeList] Error toggling favorite:", err);
    }
  }

  // ✅ Create folder: return created row + select it
  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name || !user) return;

    try {
      const { data, error } = await supabase
        .from("recipe_folders")
        .insert({ name, created_by: user.id })
        .select("id,name,created_by")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Création dossier : aucune donnée retournée.");

      setFolders((prev) => {
        const exists = prev.some((f) => f.id === (data as any).id);
        const next = exists ? prev : [...prev, data as RecipeFolder];
        return next.slice().sort((a, b) => a.name.localeCompare(b.name));
      });

      setSelectedFolder((data as any).id);
      setShowFavoritesOnly(false);

      setNewFolderName("");
      setShowNewFolderInput(false);
    } catch (err: any) {
      console.error("[RecipeList] Error creating folder:", err);
      alert(
        err?.message ??
          "Impossible de créer le dossier (RLS / contrainte DB)."
      );
    }
  }

  // ✅ Move recipe into folder (or null to remove from folder)
  async function handleMoveToFolder(recipeId: string, folderId: string | null) {
    try {
      const { error } = await supabase
        .from("recipes")
        .update({ folder_id: folderId })
        .eq("id", recipeId);

      if (error) throw error;

      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, folder_id: folderId } : r))
      );
    } catch (err) {
      console.error("[RecipeList] Error moving to folder:", err);
      alert("Impossible de déplacer la recette (RLS ?).");
    }
  }

  // ✅ Delete folder: detach recipes then delete folder
  async function handleDeleteFolder(folderId: string) {
    const folderName = folders.find((f) => f.id === folderId)?.name ?? "ce dossier";

    const ok = confirm(
      `Supprimer "${folderName}" ?\n\nLes recettes ne seront pas supprimées, elles seront juste retirées du dossier.`
    );
    if (!ok) return;

    try {
      const { error: unlinkErr } = await supabase
        .from("recipes")
        .update({ folder_id: null })
        .eq("folder_id", folderId);
      if (unlinkErr) throw unlinkErr;

      const { error: delErr } = await supabase
        .from("recipe_folders")
        .delete()
        .eq("id", folderId);
      if (delErr) throw delErr;

      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setRecipes((prev) =>
        prev.map((r) =>
          r.folder_id === folderId ? { ...r, folder_id: null } : r
        )
      );

      if (selectedFolder === folderId) setSelectedFolder(null);
      setFolderMenuOpenId(null);
    } catch (err: any) {
      console.error("[RecipeList] Error deleting folder:", err);
      alert(err?.message ?? "Impossible de supprimer le dossier (RLS ?).");
    }
  }

  async function handleRenameFolder(folderId: string) {
    const currentName = folders.find((f) => f.id === folderId)?.name ?? "";
    const next = prompt("Nouveau nom du dossier :", currentName)?.trim();
    if (!next) return;

    try {
      const { error } = await supabase
        .from("recipe_folders")
        .update({ name: next })
        .eq("id", folderId);

      if (error) throw error;

      setFolders((prev) =>
        prev
          .map((f) => (f.id === folderId ? { ...f, name: next } : f))
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      setFolderMenuOpenId(null);
    } catch (err: any) {
      console.error("[RecipeList] rename folder error:", err);
      alert(err?.message ?? "Impossible de renommer le dossier");
    }
  }

  async function handleDuplicate(recipe: RecipeWithIngredients, e: MouseEvent) {
    e.stopPropagation();
    if (!user) return;

    try {
      const { data: newRecipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          created_by: user.id,
          title: `${recipe.title} (copie)`,
          category: recipe.category,
          servings: recipe.servings,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          allergens: recipe.allergens,
          steps: recipe.steps,
          notes: recipe.notes,
          is_base_recipe: recipe.is_base_recipe,
          is_visible: recipe.is_visible,
          folder_id: recipe.folder_id,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      if (recipe.ingredients.length > 0) {
        await supabase.from("ingredients").insert(
          recipe.ingredients.map((ing, index) => ({
            recipe_id: (newRecipe as any).id,
            order_index: index,
            quantity: ing.quantity,
            unit: ing.unit,
            designation: ing.designation,
            sub_recipe_id: ing.sub_recipe_id,
            cost_per_unit: ing.cost_per_unit,
          }))
        );
      }

      void loadRecipes();
    } catch (err) {
      console.error("[RecipeList] Error duplicating recipe:", err);
    }
  }

  // -----------------------------
  // UI routing
  // -----------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-300">Chargement des recettes...</div>
      </div>
    );
  }

  if (viewingRecipe) {
    return (
      <RecipeDisplay
        recipeId={viewingRecipe}
        onBack={() => setViewingRecipe(null)}
      />
    );
  }

  if (selectedRecipe) {
    return (
      <RecipeScaler recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
    );
  }

  // -----------------------------
  // Controller helpers to pass down
  // -----------------------------
  const userExists = !!user;

  const recipesCount = recipes.length;
  const filteredCount = filteredRecipes.length;

  const onSelectAll = () => {
    setSelectedFolder(null);
    setShowFavoritesOnly(false);
  };

  const onSelectFavorites = () => {
    setSelectedFolder(null);
    setShowFavoritesOnly(true);
  };

  const onSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    setShowFavoritesOnly(false);
  };

  const onOpenRecipe = (id: string) => {
    setViewingRecipe(id);
  };

  const onShareToGroup = (recipeId: string, e: MouseEvent) => {
    e.stopPropagation();
    setActiveRecipeId(recipeId);
    setShowGroupsModal(true);
  };

  const onEditRecipe = (recipeId: string, e: MouseEvent) => {
    e.stopPropagation();
    onEdit(recipeId);
  };

  return (
    <>
      {/* ✅ MOBILE = plein écran */}
      <div className="lg:hidden">
        <RecipeListMobile
          userExists={userExists}
          recipesCount={recipesCount}
          filteredCount={filteredCount}
          filteredRecipes={filteredRecipes}
          categories={categories}
          folders={folders}
          searchTerm={searchTerm}
          onChangeSearch={setSearchTerm}
          categoryFilter={categoryFilter}
          onChangeCategory={setCategoryFilter}
          selectedFolder={selectedFolder}
          showFavoritesOnly={showFavoritesOnly}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          folderMenuOpenId={folderMenuOpenId}
          setFolderMenuOpenId={setFolderMenuOpenId}
          folderMenuRef={folderMenuRef}
          showNewFolderInput={showNewFolderInput}
          setShowNewFolderInput={setShowNewFolderInput}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          onCreateNew={onCreateNew}
          onOpenRecipe={onOpenRecipe}
          onSelectAll={onSelectAll}
          onSelectFavorites={onSelectFavorites}
          onSelectFolder={onSelectFolder}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onToggleFavorite={handleToggleFavorite}
          onToggleVisibility={handleToggleVisibility}
          onShareToGroup={onShareToGroup}
          onDuplicate={handleDuplicate}
          onEdit={onEditRecipe}
          onTrash={handleTrashClick}
        />
      </div>

      {/* ✅ DESKTOP = plus de “carte de fond” (on enlève PageShell variant="panel") */}
      <div className="hidden lg:block">
        <div className={ui.dashboardBg}>
          <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
            {/* Header desktop CTA */}
            {userExists && (
              <div className="mb-6 flex justify-end">
                <button onClick={onCreateNew} className={ui.btnPrimary} type="button">
                  <Plus className="w-4 h-4" />
                  Nouvelle recette
                </button>
              </div>
            )}

            <RecipeListDesktop
              userExists={userExists}
              recipesCount={recipesCount}
              filteredRecipes={filteredRecipes}
              categories={categories}
              folders={folders}
              searchTerm={searchTerm}
              onChangeSearch={setSearchTerm}
              categoryFilter={categoryFilter}
              onChangeCategory={setCategoryFilter}
              selectedFolder={selectedFolder}
              showFavoritesOnly={showFavoritesOnly}
              folderMenuOpenId={folderMenuOpenId}
              setFolderMenuOpenId={setFolderMenuOpenId}
              folderMenuRef={folderMenuRef}
              showNewFolderInput={showNewFolderInput}
              setShowNewFolderInput={setShowNewFolderInput}
              newFolderName={newFolderName}
              setNewFolderName={setNewFolderName}
              onCreateNew={onCreateNew}
              onOpenRecipe={onOpenRecipe}
              onSelectAll={onSelectAll}
              onSelectFavorites={onSelectFavorites}
              onSelectFolder={onSelectFolder}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onToggleFavorite={handleToggleFavorite}
              onToggleVisibility={handleToggleVisibility}
              onShareToGroup={onShareToGroup}
              onDuplicate={handleDuplicate}
              onEdit={onEditRecipe}
              onTrash={handleTrashClick}
            />
          </div>
        </div>
      </div>

      {/* Modal unique */}
      <RecipeGroupsModal
        open={showGroupsModal}
        recipeId={activeRecipeId ?? ""}
        onClose={() => {
          setShowGroupsModal(false);
          setActiveRecipeId(null);
        }}
      />
    </>
  );
}
