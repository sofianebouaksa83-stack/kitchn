import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  loadRecipeDisplayData,
  savePrivateRecipeNote,
} from "../services/recipeDisplayService";
import type {
  RecipeDisplayIngredient,
  RecipeDisplayRow,
  RecipeDisplaySection,
  RecipeSectionLink,
} from "../types/recipe.types";
import {
  getRecipeImageUrls,
  ingredientLabel,
  isQS,
  safeText,
} from "../utils/recipeHelpers";

type UseRecipeDisplayArgs = {
  recipeId: string;
  sectionsInitiallyOpen: boolean;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Erreur";
}

export function useRecipeDisplay({
  recipeId,
  sectionsInitiallyOpen,
}: UseRecipeDisplayArgs) {
  const { user } = useAuth();

  const [recipe, setRecipe] =
    useState<RecipeDisplayRow | null>(null);
  const [ingredients, setIngredients] = useState<
    RecipeDisplayIngredient[]
  >([]);
  const [sections, setSections] = useState<
    RecipeDisplaySection[]
  >([]);
  const [links, setLinks] = useState<
    RecipeSectionLink[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [servings, setServings] = useState(4);
  const [crossRefIngredientId, setCrossRefIngredientId] =
    useState("");
  const [crossBase, setCrossBase] = useState(500);
  const [crossHave, setCrossHave] = useState("");

  const [myNote, setMyNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedAt, setNoteSavedAt] =
    useState<string | null>(null);

  const [openSections, setOpenSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let active = true;

    setLoading(true);
    setNoteLoading(true);
    setError(null);

    void loadRecipeDisplayData(
      recipeId,
      user?.id
    )
      .then((data) => {
        if (!active) return;

        setRecipe(data.recipe);
        setIngredients(data.ingredients);
        setSections(data.sections);
        setLinks(data.links);
        setMyNote(data.note);
        setNoteSavedAt(data.noteUpdatedAt);

        setServings(
          Math.max(
            1,
            Number(data.recipe.servings ?? 1)
          )
        );

        setOpenSections(
          Object.fromEntries(
            data.sections.map((section) => [
              section.id,
              sectionsInitiallyOpen,
            ])
          )
        );
      })
      .catch((loadError: unknown) => {
        if (!active) return;

        setError(getErrorMessage(loadError));
        setRecipe(null);
        setIngredients([]);
        setSections([]);
        setLinks([]);
        setMyNote("");
        setNoteSavedAt(null);
        setOpenSections({});
      })
      .finally(() => {
        if (!active) return;

        setLoading(false);
        setNoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [
    recipeId,
    sectionsInitiallyOpen,
    user?.id,
  ]);

  useEffect(() => {
    if (
      loading ||
      noteLoading ||
      !recipe ||
      !user?.id
    ) {
      return;
    }

    let active = true;

    const timer = window.setTimeout(() => {
      setNoteSaving(true);

      void savePrivateRecipeNote(
        recipeId,
        user.id,
        myNote
      )
        .then((updatedAt) => {
          if (active) {
            setNoteSavedAt(updatedAt);
          }
        })
        .catch(() => {
          // La fiche reste utilisable si la note échoue.
        })
        .finally(() => {
          if (active) {
            setNoteSaving(false);
          }
        });
    }, 500);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    loading,
    myNote,
    noteLoading,
    recipe,
    recipeId,
    user?.id,
  ]);

  const recipeImages = useMemo(
    () => getRecipeImageUrls(recipe),
    [recipe]
  );

  const baseServings = Math.max(
    1,
    Number(recipe?.servings ?? 1)
  );

  const ratio = servings / baseServings;

  const refIngredient = useMemo(() => {
    if (!crossRefIngredientId) return null;

    return (
      ingredients.find(
        (ingredient) =>
          ingredient.id === crossRefIngredientId
      ) ?? null
    );
  }, [crossRefIngredientId, ingredients]);

  const refBaseQty =
    refIngredient?.quantity ?? null;
  const refUnit = refIngredient?.unit ?? null;

  const crossRatio = useMemo(() => {
    const trimmedValue = crossHave.trim();

    if (!trimmedValue) return null;

    const availableQuantity = Number(trimmedValue);

    if (
      !Number.isFinite(availableQuantity) ||
      availableQuantity <= 0
    ) {
      return null;
    }

    if (refIngredient) {
      if (
        isQS(refUnit) ||
        refBaseQty === null ||
        !Number.isFinite(refBaseQty) ||
        refBaseQty <= 0
      ) {
        return null;
      }

      return availableQuantity / refBaseQty;
    }

    if (
      !Number.isFinite(crossBase) ||
      crossBase <= 0
    ) {
      return null;
    }

    return availableQuantity / crossBase;
  }, [
    crossBase,
    crossHave,
    refBaseQty,
    refIngredient,
    refUnit,
  ]);

  const coefficient = crossRatio ?? ratio;

  const subtitle = useMemo(() => {
    if (!recipe) return null;

    const parts = [
      recipe.category || "Sans catégorie",
    ];

    if ((recipe.prep_time ?? 0) > 0) {
      parts.push(
        `Préparation : ${recipe.prep_time} min`
      );
    }

    if ((recipe.cook_time ?? 0) > 0) {
      parts.push(
        `Cuisson : ${recipe.cook_time} min`
      );
    }

    if (
      recipe.servings &&
      recipe.servings > 0
    ) {
      parts.push(
        `${recipe.servings} portion${
          recipe.servings > 1 ? "s" : ""
        }`
      );
    }

    return parts.join(" · ");
  }, [recipe]);

  const allergensText = useMemo(
    () => safeText(recipe?.allergens),
    [recipe?.allergens]
  );

  const sectionIngredients = useMemo(() => {
    const ingredientsById = new Map(
      ingredients.map((ingredient) => [
        ingredient.id,
        ingredient,
      ])
    );

    const result = new Map<
      string,
      RecipeDisplayIngredient[]
    >();

    const sortedLinks = [...links].sort(
      (first, second) =>
        (first.order_index ?? 0) -
        (second.order_index ?? 0)
    );

    for (const link of sortedLinks) {
      const ingredient = ingredientsById.get(
        link.ingredient_id
      );

      if (!ingredient) continue;

      const current =
        result.get(link.section_id) ?? [];

      result.set(link.section_id, [
        ...current,
        ingredient,
      ]);
    }

    return result;
  }, [ingredients, links]);

  const crossSelectableIngredients =
    useMemo(
      () =>
        ingredients
          .filter(
            (ingredient) =>
              ingredient.quantity !== null &&
              ingredient.quantity > 0 &&
              !isQS(ingredient.unit)
          )
          .map((ingredient) => ({
            id: ingredient.id,
            label: ingredientLabel(ingredient),
          })),
      [ingredients]
    );

  function increaseMultiplier() {
    const multiplier = Math.max(
      1,
      Math.round(coefficient || 1)
    );

    setCrossHave("");
    setServings(
      baseServings * (multiplier + 1)
    );
  }

  function decreaseMultiplier() {
    const multiplier = Math.max(
      1,
      Math.round(coefficient || 1)
    );

    setCrossHave("");
    setServings(
      baseServings *
        Math.max(1, multiplier - 1)
    );
  }

  function resetMultiplier() {
    setServings(baseServings);
    setCrossHave("");
    setCrossBase(500);
    setCrossRefIngredientId("");
  }

  function toggleSection(sectionId: string) {
    setOpenSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  }

  return {
    recipe,
    ingredients,
    sections,
    loading,
    error,

    recipeImages,
    subtitle,
    allergensText,

    servings,
    setServings,
    baseServings,
    ratio,
    coefficient,
    crossRatio,

    crossRefIngredientId,
    setCrossRefIngredientId,
    crossBase,
    setCrossBase,
    crossHave,
    setCrossHave,

    refIngredient,
    refBaseQty,
    refUnit,
    crossSelectableIngredients,

    increaseMultiplier,
    decreaseMultiplier,
    resetMultiplier,

    sectionIngredients,
    openSections,
    toggleSection,

    myNote,
    setMyNote,
    noteLoading,
    noteSaving,
    noteSavedAt,
  };
}