import { useEffect, useState, type MouseEvent, type DragEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Recipe, type Ingredient } from '../../lib/supabase';
import {Search,Plus,Edit,Trash2,Copy,Clock,Users,AlertCircle,Eye,EyeOff,Heart,Folder,Filter,X,} 
from 'lucide-react';
import { RecipeScaler } from './RecipeScaler';
import RecipeDisplay from './RecipeDisplay';
import { ui } from '../../styles/ui';

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
  restaurant_id: string;
};

export function RecipeList({ onCreateNew, onEdit }: RecipeListProps) {
  const { user, profile } = useAuth();

  const [recipes, setRecipes] = useState<RecipeWithIngredients[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<RecipeWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');

  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<string | null>(null);

  const [folders, setFolders] = useState<RecipeFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const [draggedRecipe, setDraggedRecipe] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ rôles (tu as renommé restaurant_role -> restaurantRole)
  const restaurantRole = profile?.restaurantRole as string | undefined;
  const isChef = restaurantRole === 'chef';
  const isSecond = restaurantRole === 'second';
  const canManage = isChef || isSecond;

  useEffect(() => {
    if (!user || !profile) return;
    loadRecipes();
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  useEffect(() => {
    filterRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, recipes, selectedFolder, showFavoritesOnly]);

  async function loadRecipes() {
    if (!user || !profile?.restaurant_id) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const restaurantId = profile.restaurant_id;

      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(
          `
          *,
          is_favorite:favorite_recipes!recipe_id(user_id)
        `
        )
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (recipesError) throw recipesError;

      const recipesWithIngredients = await Promise.all(
        (recipesData || []).map(async (recipe: any) => {
          const { data: ingredients } = await supabase
            .from('ingredients')
            .select('*')
            .eq('recipe_id', recipe.id)
            .order('order_index');

          const isFav = Array.isArray(recipe.is_favorite)
            ? recipe.is_favorite.some((f: any) => f.user_id === user.id)
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
      console.error('[RecipeList] Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    if (!user || !profile?.restaurant_id) return;

    const { data } = await supabase
      .from('recipe_folders')
      .select('*')
      .eq('restaurant_id', profile.restaurant_id)
      .order('name');

    setFolders(data || []);
  }

  function filterRecipes() {
    let filtered = recipes;

    // cacher les recettes masquées pour les employés
    if (!canManage) {
      filtered = filtered.filter((r) => r.is_visible === true || r.is_visible === null);
    }

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
          r.title.toLowerCase().includes(q) ||
          r.ingredients.some((ing) => (ing.designation || '').toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'Toutes') {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    setFilteredRecipes(filtered);
  }

  async function handleDelete(recipeId: string, e: MouseEvent) {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) return;

    try {
      const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
      if (error) throw error;
      loadRecipes();
    } catch (err) {
      console.error('Error deleting recipe:', err);
    }
  }

  async function handleToggleVisibility(recipeId: string, currentVisibility: boolean, e: MouseEvent) {
    e.stopPropagation();

    const { error } = await supabase
      .from('recipes')
      .update({ is_visible: !currentVisibility })
      .eq('id', recipeId);

    if (!error) loadRecipes();
  }

  async function handleToggleFavorite(recipeId: string, isFavorite: boolean, e: MouseEvent) {
    e.stopPropagation();
    if (!user) return;

    if (isFavorite) {
      await supabase.from('favorite_recipes').delete().eq('user_id', user.id).eq('recipe_id', recipeId);
    } else {
      await supabase.from('favorite_recipes').insert({ user_id: user.id, recipe_id: recipeId });
    }

    loadRecipes();
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim() || !profile?.restaurant_id) return;

    await supabase
      .from('recipe_folders')
      .insert({ name: newFolderName.trim(), restaurant_id: profile.restaurant_id });

    setNewFolderName('');
    setShowNewFolderInput(false);
    loadFolders();
  }

  async function handleMoveToFolder(recipeId: string, folderId: string | null) {
    await supabase.from('recipes').update({ folder_id: folderId }).eq('id', recipeId);
    loadRecipes();
  }

  function handleDragStart(recipeId: string, e: DragEvent) {
    setDraggedRecipe(recipeId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(folderId: string | null, e: DragEvent) {
    e.preventDefault();
    if (!draggedRecipe) return;
    handleMoveToFolder(draggedRecipe, folderId);
    setDraggedRecipe(null);
  }

  async function handleDuplicate(recipe: RecipeWithIngredients, e: MouseEvent) {
    e.stopPropagation();
    if (!user) return;

    try {
      const { data: newRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          restaurant_id: recipe.restaurant_id,
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
        const { data: newIngredients, error: ingredientsError } = await supabase
          .from('ingredients')
          .insert(
            recipe.ingredients.map((ing, index) => ({
              recipe_id: newRecipe.id,
              order_index: index,
              quantity: ing.quantity,
              unit: ing.unit,
              designation: ing.designation,
              sub_recipe_id: ing.sub_recipe_id,
              cost_per_unit: ing.cost_per_unit,
            }))
          )
          .select();

        if (ingredientsError) throw ingredientsError;

        const { data: originalSections } = await supabase
          .from('recipe_sections')
          .select('*')
          .eq('recipe_id', recipe.id)
          .order('order_index');

        if (originalSections && originalSections.length > 0) {
          for (const section of originalSections as any[]) {
            const { data: newSection, error: sectionError } = await supabase
              .from('recipe_sections')
              .insert({
                recipe_id: newRecipe.id,
                title: section.title,
                instructions: section.instructions,
                order_index: section.order_index,
              })
              .select()
              .single();

            if (sectionError) throw sectionError;

            const { data: sectionIngLinks } = await supabase
              .from('section_ingredients')
              .select('ingredient_id, order_index')
              .eq('section_id', section.id)
              .order('order_index');

            if (sectionIngLinks && sectionIngLinks.length > 0) {
              const ingredientMap = new Map<string, string>();
              recipe.ingredients.forEach((oldIng, index) => {
                if (newIngredients && (newIngredients as any[])[index]) {
                  ingredientMap.set(oldIng.id, (newIngredients as any[])[index].id);
                }
              });

              const newLinks = sectionIngLinks
                .map((link: any) => {
                  const newIngredientId = ingredientMap.get(link.ingredient_id);
                  if (!newIngredientId) return null;
                  return {
                    section_id: newSection.id,
                    ingredient_id: newIngredientId,
                    order_index: link.order_index,
                  };
                })
                .filter(Boolean);

              if (newLinks.length > 0) {
                const { error: linksError } = await supabase.from('section_ingredients').insert(newLinks as any[]);
                if (linksError) throw linksError;
              }
            }
          }
        }
      }

      loadRecipes();
    } catch (err) {
      console.error('Error duplicating recipe:', err);
    }
  }

  const categories = ['Toutes', ...new Set(recipes.map((r) => r.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-300">Chargement des recettes...</div>
      </div>
    );
  }

  if (viewingRecipe) {
    return <RecipeDisplay recipeId={viewingRecipe} onBack={() => setViewingRecipe(null)} />;
  }

  if (selectedRecipe) {
    return <RecipeScaler recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />;
  }

  return (
    <div className={ui.pageBg}>
      <div className={`${ui.container} py-4 sm:py-6`}>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex gap-6 relative">
          {/* Sidebar */}
          <div
            className={`
              fixed lg:static top-0 left-0 h-full lg:h-auto
              w-80 lg:w-64
              ${ui.glassPanel}
              rounded-none lg:rounded-2xl
              p-5
              transform transition-transform duration-300 ease-in-out z-50
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Dossiers</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedFolder(null);
                setShowFavoritesOnly(false);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-all duration-200 ${
                selectedFolder === null
                  ? 'bg-gradient-to-r from-amber-400/20 to-amber-600/10 text-amber-300 ring-1 ring-amber-400/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              Toutes les recettes
            </button>

            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setSelectedFolder(null);
                setSidebarOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 flex items-center gap-2 transition-all duration-200 ${
                showFavoritesOnly
                  ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              Mes favoris
            </button>

            <div className="border-t border-slate-800/80 my-3" />

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setShowFavoritesOnly(false);
                  setSidebarOpen(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('ring-1', 'ring-amber-400/40');
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('ring-1', 'ring-amber-400/40');
                }}
                onDrop={(e) => {
                  e.currentTarget.classList.remove('ring-1', 'ring-amber-400/40');
                  handleDrop(folder.id, e);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 flex items-center gap-2 transition-all duration-200 ${
                  selectedFolder === folder.id
                    ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-400/20'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                }`}
              >
                <Folder className="w-4 h-4" />
                {folder.name}
              </button>
            ))}

            {canManage && (
              <div className="mt-3">
                {showNewFolderInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                      placeholder="Nom du dossier"
                      className={`${ui.input} h-10 text-sm`}
                      autoFocus
                    />
                    <button onClick={handleCreateFolder} className={`${ui.btnPrimary} h-10 px-3`}>
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                      className={`${ui.btnGhost} h-10 px-3`}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowNewFolderInput(true)} className={`${ui.linkAmber} w-full justify-start`}>
                    <Plus className="w-4 h-4" />
                    Nouveau dossier
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg bg-slate-900/60 border border-slate-800/80 ring-1 ring-white/5 text-slate-200 hover:bg-slate-800/70 transition-colors"
                  aria-label="Ouvrir les dossiers"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <h1 className={ui.title}>Mes Recettes</h1>
              </div>

              {canManage && (
                <button onClick={onCreateNew} className={ui.btnPrimary}>
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nouvelle recette</span>
                  <span className="sm:hidden">Nouveau</span>
                </button>
              )}
            </div>

            <div className="mb-6 flex flex-col md:flex-row gap-4 md:gap-5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom ou ingrédient…"
                  className={`${ui.input} pl-12`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`${ui.input} md:w-56`}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {filteredRecipes.length === 0 ? (
              <div className={`${ui.glassPanel} p-10 text-center`}>
                <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">
                  {recipes.length === 0 ? 'Aucune recette pour le moment' : 'Aucune recette trouvée'}
                </p>

                {recipes.length === 0 && canManage && (
                  <button onClick={onCreateNew} className={`${ui.linkAmber} mt-4`}>
                    Créer votre première recette
                  </button>
                )}

                {recipes.length === 0 && !canManage && (
                  <p className="mt-4 text-slate-400">Aucune recette n'a encore été créée par votre équipe.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    draggable={canManage}
                    onDragStart={(e) => canManage && handleDragStart(recipe.id, e)}
                    onClick={() => setViewingRecipe(recipe.id)}
                    className={`${ui.card} cursor-pointer`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">
                            {recipe.title}
                          </h3>

                          {canManage && recipe.is_visible === false && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800/80 text-slate-300 text-xs rounded">
                              Masquée
                            </span>
                          )}

                          <div className="mt-2">
                            <span className="inline-block px-3 py-1 bg-slate-800/70 text-slate-100 text-xs font-medium rounded-full ring-1 ring-white/10">
                              {recipe.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleToggleFavorite(recipe.id, recipe.is_favorite || false, e)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-slate-800/70 transition-colors"
                            title={recipe.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                recipe.is_favorite ? 'fill-red-500 text-red-500' : 'text-slate-400'
                              }`}
                            />
                          </button>

                          {canManage && (
                            <button
                              onClick={(e) => handleToggleVisibility(recipe.id, recipe.is_visible ?? true, e)}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-slate-800/70 transition-colors"
                              title={recipe.is_visible === false ? 'Rendre visible' : 'Masquer'}
                            >
                              {recipe.is_visible === false ? (
                                <EyeOff className="w-5 h-5 text-slate-400" />
                              ) : (
                                <Eye className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} couverts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Clock className="w-4 h-4" />
                          <span>
                            Prép: {recipe.prep_time}min | Cuisson: {recipe.cook_time}min
                          </span>
                        </div>
                      </div>

                      {recipe.allergens?.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {recipe.allergens.slice(0, 3).map((allergen: string) => (
                              <span
                                key={allergen}
                                className="px-2 py-1 bg-red-500/10 text-red-300 text-xs rounded ring-1 ring-red-500/15"
                              >
                                {allergen}
                              </span>
                            ))}
                            {recipe.allergens.length > 3 && (
                              <span className="bg-slate-800/80 text-slate-200 ring-1 ring-white/10 rounded-md px-2.5 py-1 text-xs">
                                +{recipe.allergens.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecipe(recipe);
                          }}
                          className={ui.linkAmber}
                        >
                          Mise à l'échelle
                        </button>

                        {canManage && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleDuplicate(recipe, e)}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800/70 transition-colors"
                              title="Dupliquer"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(recipe.id);
                              }}
                              className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-amber-300 hover:bg-amber-500/10 transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {isChef && (
                              <button
                                onClick={(e) => handleDelete(recipe.id, e)}
                                className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-red-300 hover:bg-red-500/10 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
