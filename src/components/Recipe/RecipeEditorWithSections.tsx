import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type RecipeEditorProps = {
  recipeId?: string;
  onBack: () => void;
  onSave: () => void;
};

interface SectionIngredient {
  tempId: string;
  quantity: number;
  unit: string;
  designation: string;
}

interface RecipeSection {
  tempId: string;
  id?: string;
  title: string;
  instructions: string;
  order_index: number;
  ingredients: SectionIngredient[];
}

const UNITS = ['g', 'kg', 'L', 'mL', 'cl', 'unité', 'pincée', 'càs', 'càc', 'bouquet'];

export function RecipeEditorWithSections({ recipeId, onBack, onSave }: RecipeEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState(4);
  const [instructions, setInstructions] = useState('');
  const [sections, setSections] = useState<RecipeSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  async function loadRecipe() {
    if (!recipeId) return;

    setLoading(true);
    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError) throw recipeError;

      setTitle(recipe.title);
      setServings(recipe.servings || 4);
      setInstructions(recipe.notes || '');

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('recipe_sections')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      if (sectionsData && sectionsData.length > 0) {
        const loadedSections = await Promise.all(
          sectionsData.map(async (section) => {
            const { data: sectionIngLinks } = await supabase
              .from('section_ingredients')
              .select('ingredient_id, order_index')
              .eq('section_id', section.id)
              .order('order_index');

            const ingredientIds = sectionIngLinks?.map(si => si.ingredient_id) || [];

            let ingredients: SectionIngredient[] = [];
            if (ingredientIds.length > 0) {
              const { data: ingredientsData } = await supabase
                .from('ingredients')
                .select('*')
                .in('id', ingredientIds);

              ingredients = ingredientIds
                .map(id => ingredientsData?.find(ing => ing.id === id))
                .filter(Boolean)
                .map(ing => ({
                  tempId: crypto.randomUUID(),
                  quantity: ing.quantity,
                  unit: ing.unit,
                  designation: ing.designation || ''
                }));
            }

            return {
              tempId: crypto.randomUUID(),
              id: section.id,
              title: section.title,
              instructions: section.instructions,
              order_index: section.order_index,
              ingredients
            };
          })
        );

        setSections(loadedSections);
        setExpandedSections(new Set(loadedSections.map(s => s.tempId)));
      }
    } catch (err) {
      setError('Erreur lors du chargement de la recette');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    if (!title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Récupérer le restaurant_id du profil de l'utilisateur
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile || !profile.restaurant_id) {
        setError('Vous devez être rattaché à un restaurant pour créer des recettes');
        setSaving(false);
        return;
      }

      let currentRecipeId = recipeId;

      // 2. Préparer les données de la recette avec restaurant_id
      const recipeData = {
        title: title.trim(),
        servings: Math.max(1, servings),
        notes: instructions.trim(),
        user_id: user.id,
        restaurant_id: profile.restaurant_id
      };

      if (recipeId) {
        const { error: updateError } = await supabase
          .from('recipes')
          .update({
            ...recipeData,
            updated_at: new Date().toISOString()
          })
          .eq('id', recipeId);

        if (updateError) throw updateError;

        await supabase.from('section_ingredients').delete().in(
          'section_id',
          (await supabase.from('recipe_sections').select('id').eq('recipe_id', recipeId)).data?.map(s => s.id) || []
        );
        await supabase.from('ingredients').delete().eq('recipe_id', recipeId);
        await supabase.from('recipe_sections').delete().eq('recipe_id', recipeId);
      } else {
        const { data: newRecipe, error: insertError } = await supabase
          .from('recipes')
          .insert(recipeData)
          .select()
          .single();

        if (insertError) throw insertError;
        currentRecipeId = newRecipe.id;
      }

      if (currentRecipeId && sections.length > 0) {
        for (let i = 0; i < sections.length; i++) {
          const section = sections[i];

          const { data: newSection, error: sectionError } = await supabase
            .from('recipe_sections')
            .insert({
              recipe_id: currentRecipeId,
              title: section.title,
              instructions: section.instructions,
              order_index: i
            })
            .select()
            .single();

          if (sectionError) throw sectionError;

          if (section.ingredients.length > 0) {
            const ingredientsToInsert = section.ingredients
              .filter(ing => ing.designation.trim() && ing.quantity > 0)
              .map((ing, idx) => ({
                recipe_id: currentRecipeId,
                designation: ing.designation.trim(),
                quantity: Number(ing.quantity),
                unit: ing.unit,
                order_index: idx
              }));

            if (ingredientsToInsert.length > 0) {
              const { data: insertedIngredients, error: ingredientsError } = await supabase
                .from('ingredients')
                .insert(ingredientsToInsert)
                .select();

              if (ingredientsError) throw ingredientsError;

              const sectionIngLinks = insertedIngredients.map((ing, idx) => ({
                section_id: newSection.id,
                ingredient_id: ing.id,
                order_index: idx
              }));

              const { error: linksError } = await supabase
                .from('section_ingredients')
                .insert(sectionIngLinks);

              if (linksError) throw linksError;
            }
          }
        }
      }

      onSave();
    } catch (err: any) {
      console.error('Erreur complète:', err);
      const errorMessage = err?.message || 'Erreur lors de la sauvegarde';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  function addSection() {
    const newSection: RecipeSection = {
      tempId: crypto.randomUUID(),
      title: '',
      instructions: '',
      order_index: sections.length,
      ingredients: []
    };
    setSections([...sections, newSection]);
    setExpandedSections(new Set([...expandedSections, newSection.tempId]));
  }

  function removeSection(tempId: string) {
    setSections(sections.filter(s => s.tempId !== tempId));
    const newExpanded = new Set(expandedSections);
    newExpanded.delete(tempId);
    setExpandedSections(newExpanded);
  }

  function updateSection(tempId: string, field: keyof RecipeSection, value: any) {
    setSections(sections.map(s => s.tempId === tempId ? { ...s, [field]: value } : s));
  }

  function addIngredientToSection(sectionTempId: string) {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        return {
          ...s,
          ingredients: [
            ...s.ingredients,
            { tempId: crypto.randomUUID(), quantity: 0, unit: 'g', designation: '' }
          ]
        };
      }
      return s;
    }));
  }

  function removeIngredientFromSection(sectionTempId: string, ingredientTempId: string) {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        return {
          ...s,
          ingredients: s.ingredients.filter(i => i.tempId !== ingredientTempId)
        };
      }
      return s;
    }));
  }

  function updateIngredientInSection(
    sectionTempId: string,
    ingredientTempId: string,
    field: keyof SectionIngredient,
    value: any
  ) {
    setSections(sections.map(s => {
      if (s.tempId === sectionTempId) {
        return {
          ...s,
          ingredients: s.ingredients.map(i =>
            i.tempId === ingredientTempId ? { ...i, [field]: value } : i
          )
        };
      }
      return s;
    }));
  }

  function toggleSection(tempId: string) {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(tempId)) {
      newExpanded.delete(tempId);
    } else {
      newExpanded.add(tempId);
    }
    setExpandedSections(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-300">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-0">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Retour</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mx-4 truncate">
            {recipeId ? 'Modifier' : 'Nouvelle recette'}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
           className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/80 ring-1 ring-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Titre de la recette *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 ring-1 ring-white/5 text-slate-100 placeholder:text-slate-400 transition-all duration-200 hover:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40"
            placeholder="Ex: Foie gras, coing et lie de vin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Nombre de couverts
          </label>
          <input
            type="number"
            min="1"
            value={servings || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 1 : parseInt(e.target.value);
              setServings(isNaN(value) ? 1 : Math.max(1, value));
            }}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Sections (sous-recettes)
            </label>
            <button
              onClick={addSection}
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une section</span>
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, sectionIdx) => (
              <div key={section.tempId} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <div
                  className="bg-slate-50 dark:bg-slate-700 px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                  onClick={() => toggleSection(section.tempId)}
                >
                  {/* Label Section */}
                  <div className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Section {sectionIdx + 1}
                  </div>

                  {/* Input titre */}
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateSection(section.tempId, 'title', e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-10 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Nom de la section (ex: Foie gras)"
                  />

                  {/* Actions à droite */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.tempId);
                      }}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="Supprimer la section"
                      aria-label="Supprimer la section"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <span className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors">
                      {expandedSections.has(section.tempId) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </span>
                  </div>
                </div>
                {expandedSections.has(section.tempId) && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Ingrédients
                      </label>
                      <div className="space-y-2">
                        {section.ingredients.map((ingredient) => (
                          <div key={ingredient.tempId} className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={ingredient.quantity || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                updateIngredientInSection(
                                  section.tempId,
                                  ingredient.tempId,
                                  'quantity',
                                  isNaN(value) ? 0 : value
                                );
                              }}
                              className="flex-1 h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Qté"
                            />
                            <select
                              value={ingredient.unit}
                              onChange={(e) =>
                                updateIngredientInSection(
                                  section.tempId,
                                  ingredient.tempId,
                                  'unit',
                                  e.target.value
                                )
                              }
                            className="w-24 h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                              {UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={ingredient.designation}
                              onChange={(e) =>
                                updateIngredientInSection(
                                  section.tempId,
                                  ingredient.tempId,
                                  'designation',
                                  e.target.value
                                )
                              }
                              className="flex-1 h-10 px-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400ex-1 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
                              placeholder="Nom de l'ingrédient"
                            />
                            <button
                              onClick={() =>
                                removeIngredientFromSection(section.tempId, ingredient.tempId)
                              }
                              className="h-10 w-10 flex items-center justify-center self-center rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addIngredientToSection(section.tempId)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter un ingrédient</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={section.instructions}
                        onChange={(e) => updateSection(section.tempId, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                        rows={4}
                        placeholder="Instructions pour cette section..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {sections.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              Aucune section. Cliquez sur "Ajouter une section" pour commencer.
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Instructions générales (optionnel)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            rows={4}
            placeholder="Instructions générales pour la recette complète..."
          />
        </div>
      </div>
    </div>
  );
}
