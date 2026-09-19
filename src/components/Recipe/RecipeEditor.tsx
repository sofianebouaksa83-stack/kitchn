import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Ingredient } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, AlertCircle } from 'lucide-react';

type RecipeEditorProps = {
  recipeId?: string;
  onBack: () => void;

  
  onSave: () => void;
};

const CATEGORIES = [
  'Entrée', 'Plat Principal', 'Dessert', 'Sauce', 'Base', 'Accompagnement', 'Pâtisserie', 'Boulangerie', 'Autre'
];

const UNITS = ['g', 'kg', 'L', 'mL', 'cl', 'unité', 'pincée', 'càs', 'càc', 'bouquet'];

const ALLERGENS = [
  'Gluten', 'Crustacés', 'Œufs', 'Poisson', 'Arachides', 'Soja', 'Lait', 'Fruits à coque',
  'Céleri', 'Moutarde', 'Graines de sésame', 'Sulfites', 'Lupin', 'Mollusques'
];

export function RecipeEditor({ recipeId, onBack, onSave }: RecipeEditorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Autre',
    servings: 4,
    prep_time: 0,
    cook_time: 0,
    notes: '',
    is_base_recipe: false
  });

  const [allergens, setAllergens] = useState<string[]>([]);
  const [steps, setSteps] = useState<{ step: number; description: string }[]>([
    { step: 1, description: '' }
  ]);
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id' | 'recipe_id' | 'created_at'>[]>([
    { order_index: 0, quantity: 0, unit: 'g', designation: '', sub_recipe_id: null, cost_per_unit: null }
  ]);

  useEffect(() => {
    if (recipeId) {
      loadRecipe();
    }
  }, [recipeId]);

  async function loadRecipe() {
  if (!recipeId) return;

  setLoading(true);
  setError('');

  try {
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .single();

    if (recipeError) throw recipeError;

    setFormData({
      title: recipe.title ?? '',
      category: recipe.category ?? 'Autre',
      servings: recipe.servings ?? 4,
      prep_time: recipe.prep_time ?? 0,
      cook_time: recipe.cook_time ?? 0,
      notes: recipe.notes ?? '',
      is_base_recipe: recipe.is_base_recipe ?? false,
    });

    setAllergens(Array.isArray(recipe.allergens) ? recipe.allergens : []);

    setSteps(
      Array.isArray(recipe.steps) && recipe.steps.length > 0
        ? recipe.steps
        : [{ step: 1, description: '' }]
    );

    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('ingredients')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('order_index');

    if (ingredientsError) throw ingredientsError;

    setIngredients(
      (ingredientsData || []).map((ing: any) => ({
        order_index: ing.order_index ?? 0,
        quantity: ing.quantity ?? 0,
        unit: ing.unit ?? 'g',
        designation: ing.designation ?? '',
        sub_recipe_id: ing.sub_recipe_id ?? null,
        cost_per_unit: ing.cost_per_unit ?? null,
      }))
    );
  } catch (err) {
    console.error(err);
    setError('Erreur lors du chargement de la recette');
  } finally {
    setLoading(false);
  }
}


  async function handleSave() {
    if (!user) return;
    if (!formData.title.trim()) {
      setError('Le titre est obligatoire');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let currentRecipeId = recipeId;

      const filteredSteps = steps
        .filter(s => s.description.trim())
        .map((s, index) => ({ step: index + 1, description: s.description.trim() }));

      const recipeData = {
        title: formData.title.trim(),
        category: formData.category,
        servings: Math.max(1, formData.servings),
        prep_time: Math.max(0, formData.prep_time),
        cook_time: Math.max(0, formData.cook_time),
        allergens: allergens,
        steps: filteredSteps.length > 0 ? filteredSteps : [],
        notes: formData.notes.trim(),
        is_base_recipe: formData.is_base_recipe
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

        await supabase.from('ingredients').delete().eq('recipe_id', recipeId);
      } else {
        const { data: newRecipe, error: insertError } = await supabase
          .from('recipes')
          .insert({
            ...recipeData,
            user_id: user.id
          })
          .select()
          .single();

        if (insertError) throw insertError;
        currentRecipeId = newRecipe.id;
      }

      if (currentRecipeId) {
        const ingredientsToInsert = ingredients
          .filter(ing => ing.designation.trim() && ing.quantity > 0)
          .map((ing, index) => ({
            recipe_id: currentRecipeId,
            order_index: index,
            quantity: Number(ing.quantity),
            unit: ing.unit.trim(),
            designation: ing.designation.trim(),
            sub_recipe_id: ing.sub_recipe_id,
            cost_per_unit: ing.cost_per_unit ? Number(ing.cost_per_unit) : null
          }));

        if (ingredientsToInsert.length > 0) {
          const { error: ingredientsError } = await supabase
            .from('ingredients')
            .insert(ingredientsToInsert);

          if (ingredientsError) throw ingredientsError;
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

  function addIngredient() {
    setIngredients([
      ...ingredients,
      { order_index: ingredients.length, quantity: 0, unit: 'g', designation: '', sub_recipe_id: null, cost_per_unit: null }
    ]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: string, value: any) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  function addStep() {
    setSteps([...steps, { step: steps.length + 1, description: '' }]);
  }

  function removeStep(index: number) {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step: i + 1 })));
  }

  function updateStep(index: number, description: string) {
    const updated = [...steps];
    updated[index] = { ...updated[index], description };
    setSteps(updated);
  }

  function toggleAllergen(allergen: string) {
    if (allergens.includes(allergen)) {
      setAllergens(allergens.filter(a => a !== allergen));
    } else {
      setAllergens([...allergens, allergen]);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-300">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {recipeId ? 'Modifier la recette' : 'Nouvelle recette'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-400/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5
"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-800/80 ring-1 ring-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Titre de la recette *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 ring-1 ring-white/5 text-slate-100 placeholder:text-slate-400 transition-all duration-200 hover:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40"
              placeholder="Ex: Blanquette de veau"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Nombre de couverts
            </label>
            <input
              type="number"
              min="1"
              value={formData.servings || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 1 : parseInt(e.target.value);
                setFormData({ ...formData, servings: isNaN(value) ? 1 : Math.max(1, value) });
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Temps de préparation (min)
            </label>
            <input
              type="number"
              min="0"
              value={formData.prep_time || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                setFormData({ ...formData, prep_time: isNaN(value) ? 0 : Math.max(0, value) });
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Temps de cuisson (min)
            </label>
            <input
              type="number"
              min="0"
              value={formData.cook_time || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                setFormData({ ...formData, cook_time: isNaN(value) ? 0 : Math.max(0, value) });
              }}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_base_recipe}
              onChange={(e) => setFormData({ ...formData, is_base_recipe: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Cette recette est une base réutilisable
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Ingrédients
          </label>
          <div className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={ingredient.quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                    updateIngredient(index, 'quantity', isNaN(value) ? 0 : value);
                  }}
                  className="w-24 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Qté"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-28 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={ingredient.designation}
                  onChange={(e) => updateIngredient(index, 'designation', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Désignation"
                />
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addIngredient}
            className="mt-2 flex items-center space-x-2 text-amber-500 hover:text-amber-600 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un ingrédient</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Étapes de préparation
          </label>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex space-x-2">
                <div className="flex items-center justify-center w-8 h-10 bg-custom-blue text-slate-900 dark:text-slate-100 font-bold rounded-lg flex-shrink-0">
                  {step.step}
                </div>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  rows={2}
                  placeholder="Décrire l'étape..."
                />
                <button
                  onClick={() => removeStep(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addStep}
            className="mt-2 flex items-center space-x-2 text-amber-500 hover:text-amber-600 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter une étape</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Allergènes
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map(allergen => (
              <button
                key={allergen}
                onClick={() => toggleAllergen(allergen)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  allergens.includes(allergen)
                    ? 'bg-red-100 text-red-700 border-2 border-red-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-transparent hover:border-slate-300 dark:border-slate-600'
                }`}
              >
                {allergen}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            rows={3}
            placeholder="Notes additionnelles..."
          />
        </div>
      </div>
    </div>
  );
}
