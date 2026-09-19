import { useState, useEffect } from 'react';
import { ArrowLeft, Scale, Users, Download, FileText, Eye } from 'lucide-react';
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

type RecipeScalerProps = {
  recipe: { id: string };
  onClose: () => void;
};

const UNIT_CONVERSIONS: { [key: string]: { [key: string]: number } } = {
  g: { g: 1, kg: 0.001 },
  kg: { g: 1000, kg: 1 },
  mL: { mL: 1, L: 0.001, cl: 0.1 },
  L: { mL: 1000, L: 1, cl: 100 },
  cl: { mL: 10, L: 0.01, cl: 1 }
};

function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return quantity;

  if (UNIT_CONVERSIONS[fromUnit] && UNIT_CONVERSIONS[fromUnit][toUnit]) {
    return quantity * UNIT_CONVERSIONS[fromUnit][toUnit];
  }

  return quantity;
}

function getBestUnit(quantity: number, currentUnit: string): { quantity: number; unit: string } {
  if (currentUnit === 'g' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'kg' };
  }
  if (currentUnit === 'kg' && quantity < 1) {
    return { quantity: quantity * 1000, unit: 'g' };
  }
  if (currentUnit === 'mL' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'L' };
  }
  if (currentUnit === 'L' && quantity < 1) {
    return { quantity: quantity * 1000, unit: 'mL' };
  }
  if (currentUnit === 'cl' && quantity >= 100) {
    return { quantity: quantity / 100, unit: 'L' };
  }

  return { quantity, unit: currentUnit };
}

export function RecipeScaler({ recipe: recipeProp, onClose }: RecipeScalerProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetServings, setTargetServings] = useState(4);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [viewerType, setViewerType] = useState<'google' | 'office'>('google');

  useEffect(() => {
    loadRecipe();
  }, [recipeProp.id]);

  const loadRecipe = async () => {
    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeProp.id)
        .single();

      if (recipeError) throw recipeError;

      const { data: sections, error: sectionsError } = await supabase
        .from('recipe_sections')
        .select('*')
        .eq('recipe_id', recipeProp.id)
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
        .eq('recipe_id', recipeProp.id);

      const sectionedIngredientIds = new Set(
        sectionsWithIngredients.flatMap(s => s.ingredients.map(i => i.id))
      );

      const unsectionedIngredients = (allIngredients || []).filter(
        ing => !sectionedIngredientIds.has(ing.id)
      );

      setRecipe({
        ...recipeData,
        sections: sectionsWithIngredients,
        unsectionedIngredients
      });
      setTargetServings(recipeData.servings || 4);

      if (recipeData.file_url) {
        loadFileContentDirectly(recipeData.file_url, recipeData.file_name);
      }
    } catch (err) {
      console.error('Error loading recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContentDirectly = async (fileUrl: string, fileName?: string) => {
    setLoadingFile(true);
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('recipe-files')
        .getPublicUrl(fileUrl);

      setFileContent(publicUrl);
    } catch (err) {
      console.error('Error loading file:', err);
    } finally {
      setLoadingFile(false);
    }
  };

  const downloadOriginalFile = async () => {
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

  const downloadRecipe = () => {
    if (!recipe) return;

    const scaleFactor = targetServings / recipe.servings;
    let content = `${recipe.title}\n${'='.repeat(recipe.title.length)}\n\n`;
    content += `Pour ${targetServings} ${targetServings > 1 ? 'personnes' : 'personne'}`;

    if (scaleFactor !== 1) {
      content += ` (facteur: ×${scaleFactor.toFixed(2)})`;
    }
    content += `\n\n`;

    if (recipe.sections.length > 0) {
      recipe.sections.forEach(section => {
        content += `${section.title} :\n${'-'.repeat(section.title.length + 2)}\n\n`;

        if (section.ingredients.length > 0) {
          section.ingredients.forEach(ingredient => {
            const scaledQuantity = ingredient.quantity * scaleFactor;
            const optimized = getBestUnit(scaledQuantity, ingredient.unit);
            const displayQty = optimized.quantity.toFixed(optimized.quantity < 10 ? 1 : 0);
            content += `• ${displayQty}${optimized.unit} de ${ingredient.designation}\n`;
          });
          content += `\n`;
        }

        if (section.instructions) {
          content += `${section.instructions}\n\n`;
        }
      });
    } else if (recipe.unsectionedIngredients.length > 0) {
      content += `Ingrédients :\n-------------\n\n`;
      recipe.unsectionedIngredients.forEach(ingredient => {
        const scaledQuantity = ingredient.quantity * scaleFactor;
        const optimized = getBestUnit(scaledQuantity, ingredient.unit);
        const displayQty = optimized.quantity.toFixed(optimized.quantity < 10 ? 1 : 0);
        content += `• ${displayQty}${optimized.unit} de ${ingredient.designation}\n`;
      });
      content += `\n`;
    }

    if (recipe.instructions) {
      content += `Instructions générales :\n-----------------------\n\n${recipe.instructions}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title.replace(/[^a-z0-9]/gi, '_')}_${targetServings}p.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Recette introuvable</p>
      </div>
    );
  }

  const scaleFactor = targetServings / recipe.servings;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{recipe.title}</h1>

      {fileContent && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {recipe.file_name}
              </h2>
            </div>
            <button
              onClick={() => setFileContent(null)}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Masquer
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewerType('google')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewerType === 'google'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Google Viewer
              </button>
              <button
                onClick={() => setViewerType('office')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewerType === 'office'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Office Viewer
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
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
      )}

      {!fileContent && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Scale className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-gray-900">Mise à l'échelle</h2>
          </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-slate-900 dark:text-slate-100" />
              <span className="font-medium text-gray-700">Recette de base:</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold">{recipe.servings} couverts</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-medium text-gray-700">Nombre souhaité:</span>
              <input
                type="number"
                min="1"
                value={targetServings}
                onChange={(e) => setTargetServings(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900 dark:text-slate-100"
              />
              <span className="text-gray-700">couverts</span>
            </div>
          </div>

          {scaleFactor !== 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-2 border-amber-300">
              <p className="text-sm text-gray-600">
                Facteur de multiplication: <span className="font-bold text-slate-900 dark:text-slate-100">×{scaleFactor.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
      )}

      {!fileContent && (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        {recipe.sections.length > 0 ? (
          <div className="space-y-8">
            {recipe.sections.map((section) => (
              <div key={section.id} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-gray-300 pb-2">
                  {section.title}
                </h2>

                {section.ingredients.length > 0 && (
                  <div className="space-y-3">
                    {section.ingredients.map((ingredient) => {
                      const scaledQuantity = ingredient.quantity * scaleFactor;
                      const optimized = getBestUnit(scaledQuantity, ingredient.unit);
                      const displayQty = optimized.quantity.toFixed(optimized.quantity < 10 ? 1 : 0);

                      return (
                        <div
                          key={ingredient.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-gray-700 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{ingredient.designation}</span>
                          </span>
                          <div className="flex items-center space-x-4">
                            {scaleFactor !== 1 && (
                              <span className="text-sm text-gray-400 line-through">
                                {ingredient.quantity.toFixed(ingredient.quantity < 10 ? 1 : 0)} {ingredient.unit}
                              </span>
                            )}
                            <span className="font-bold text-slate-900 dark:text-slate-100 min-w-[120px] text-right">
                              {displayQty} {optimized.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {section.instructions && (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line pl-4">
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
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Ingrédients ajustés</h2>
                <div className="space-y-3">
                  {recipe.unsectionedIngredients.map((ingredient) => {
                    const scaledQuantity = ingredient.quantity * scaleFactor;
                    const optimized = getBestUnit(scaledQuantity, ingredient.unit);
                    const displayQty = optimized.quantity.toFixed(optimized.quantity < 10 ? 1 : 0);

                    return (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-gray-700">{ingredient.designation}</span>
                        <div className="flex items-center space-x-4">
                          {scaleFactor !== 1 && (
                            <span className="text-sm text-gray-400 line-through">
                              {ingredient.quantity.toFixed(ingredient.quantity < 10 ? 1 : 0)} {ingredient.unit}
                            </span>
                          )}
                          <span className="font-bold text-slate-900 dark:text-slate-100 min-w-[120px] text-right">
                            {displayQty} {optimized.unit}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recipe.instructions && (
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Instructions</h2>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {recipe.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
