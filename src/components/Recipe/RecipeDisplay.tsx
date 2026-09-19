import { useEffect, useState } from 'react';
import { ChevronLeft, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Ingredient {
  id: string;
  designation: string;
  quantity: number;
  unit: string;
}

interface RecipeSection {
  id: string;
  title: string;
  instructions: string;
  order_index: number;
  ingredients: Ingredient[];
}

interface Recipe {
  id: string;
  title: string;
  servings: number;
  instructions: string;
  sections: RecipeSection[];
  unsectionedIngredients: Ingredient[];
  file_url?: string;
  file_name?: string;
}

interface RecipeDisplayProps {
  recipeId: string;
  onBack: () => void;
}

export default function RecipeDisplay({ recipeId, onBack }: RecipeDisplayProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [viewerType, setViewerType] = useState<'google' | 'office'>('google');

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;

      const { data: sections, error: sectionsError } = await supabase
        .from('recipe_sections')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      const sectionsWithIngredients = await Promise.all(
        (sections || []).map(async (section) => {
          const { data: sectionIngLinks } = await supabase
            .from('section_ingredients')
            .select('ingredient_id, order_index')
            .eq('section_id', section.id)
            .order('order_index');

          const ingredientIds = sectionIngLinks?.map(si => si.ingredient_id) || [];

          if (ingredientIds.length === 0) {
            return { ...section, ingredients: [] };
          }

          const { data: ingredients } = await supabase
            .from('ingredients')
            .select('*')
            .in('id', ingredientIds);

          const orderedIngredients = ingredientIds
            .map(id => ingredients?.find(ing => ing.id === id))
            .filter(Boolean) as Ingredient[];

          return {
            ...section,
            ingredients: orderedIngredients
          };
        })
      );

      const { data: allIngredients } = await supabase
        .from('ingredients')
        .select('*')
        .eq('recipe_id', recipeId);

      const sectionedIngredientIds = new Set(
        sectionsWithIngredients.flatMap(s => s.ingredients.map((i: Ingredient) => i.id))
      );

      const unsectionedIngredients = (allIngredients || []).filter(
        ing => !sectionedIngredientIds.has(ing.id)
      );

      const finalRecipe = {
        ...recipeData,
        sections: sectionsWithIngredients,
        unsectionedIngredients
      };

      setRecipe(finalRecipe);
    } catch (err) {
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async () => {
    if (!recipe?.file_url) return;

    setLoadingFile(true);
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-files')
        .getPublicUrl(recipe.file_url);

      setFileContent(publicUrl);
    } catch (err) {
      console.error('Error loading file:', err);
    } finally {
      setLoadingFile(false);
    }
  };

  const downloadFile = async () => {
    if (!recipe?.file_url) return;

    try {
      const { data, error } = await supabase.storage
        .from('recipe-files')
        .download(recipe.file_url);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = recipe.file_name || 'recette.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-300">Chargement...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-300">Recette introuvable</p>
      </div>
    );
  }

  const hasFileContent = recipe.file_url && recipe.file_name;
  const hasStructuredContent = recipe.sections.length > 0 || recipe.unsectionedIngredients.length > 0 || recipe.instructions;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button
        onClick={onBack}
        className="flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 mb-4 sm:mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Retour
      </button>

      <div className="
          bg-slate-900/60
          backdrop-blur-sm
          rounded-2xl
          border border-slate-800/80
          ring-1 ring-white/5
          shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          p-4 sm:p-6 lg:p-8
        ">

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-6 sm:mb-8 break-words">
          {recipe.title}
        </h1>

        {hasFileContent && !fileContent && (
          <div className="mb-6 flex items-center justify-center">
            <button
              onClick={loadFileContent}
              disabled={loadingFile}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              {loadingFile ? 'Chargement...' : 'Voir le fichier'}
            </button>
          </div>
        )}

        {fileContent ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4 gap-3">
  <div className="flex items-center space-x-2 min-w-0">
    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
      {recipe.file_name}
    </h2>
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={downloadFile}
      className="inline-flex items-center px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
      title="Télécharger le fichier"
    >
      Télécharger
    </button>

    <button
      onClick={() => setFileContent(null)}
      className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
    >
      Masquer
    </button>
  </div>
</div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setViewerType('google')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    viewerType === 'google'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  Google
                </button>
                <button
                  onClick={() => setViewerType('office')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    viewerType === 'office'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  Office
                </button>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <iframe
                  src={
                    viewerType === 'google'
                      ? `https://docs.google.com/gview?url=${encodeURIComponent(fileContent)}&embedded=true`
                      : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileContent)}`
                  }
                  className="w-full h-[600px] border-0"
                  title="Aperçu du fichier"
                />
              </div>
            </div>
          </div>
        ) : hasStructuredContent ? (
          <>
            {recipe.sections.length > 0 ? (
              <div className="space-y-8">
                {recipe.sections.map((section) => (
                  <div key={section.id} className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 underline decoration-1">
                      {section.title}
                    </h2>

                    {section.ingredients.length > 0 && (
                      <ul className="space-y-2 ml-6">
                        {section.ingredients.map((ingredient) => (
                          <li key={ingredient.id} className="flex items-start text-slate-900 dark:text-white">
                            <span className="mr-2">•</span>
                            <span>
                              {ingredient.quantity}{ingredient.unit} de {ingredient.designation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.instructions && (
                      <p className="text-slate-900 dark:text-white leading-relaxed whitespace-pre-line ml-2">
                        {section.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {recipe.unsectionedIngredients.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Ingrédients</h2>
                    <ul className="space-y-2 ml-6">
                      {recipe.unsectionedIngredients.map((ingredient) => (
                        <li key={ingredient.id} className="flex items-start text-slate-900 dark:text-white">
                          <span className="mr-2">•</span>
                          <span>
                            {ingredient.quantity}{ingredient.unit} de {ingredient.designation}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.instructions && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">Instructions</h2>
                    <p className="text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                      {recipe.instructions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {recipe.servings > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Pour {recipe.servings} {recipe.servings > 1 ? 'personnes' : 'personne'}
                </p>
              </div>
            )}
          </>
        ) : hasFileContent && !fileContent ? (
          <div className="text-center py-12 text-slate-600 dark:text-slate-400">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p>Cliquez sur "Voir le fichier" pour afficher la recette</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
