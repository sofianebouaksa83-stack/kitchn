import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase, type Recipe, type Ingredient } from "../../../../lib/supabase";

type RecipeSectionRow = {
  id: string;
  title: string | null;
  instructions: string | null;
  order_index: number | null;
};

type SectionIngredientRow = {
  section_id: string;
  ingredient_id: string;
  order_index: number | null;
};

type SectionForm = {
  localId: string; // id local pour React
  dbId?: string; // id DB si existant (edit)
  title: string;
  instructions: string;
  collapsed: boolean;
};

type IngredientForm = {
  localId: string;
  dbId?: string; // id DB si existant (edit)
  quantity: number | string;
  unit: string;
  designation: string;
};

export const UNITS = ["g", "kg", "L", "mL", "cl", "unité", "pincée", "càs", "càc", "bouquet"];
export const CATEGORIES = ["Entrée", "Plat", "Dessert", "Sauce", "Pâtisserie", "Autre"];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

type UseRecipeEditorArgs = {
  recipeId?: string | null;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

export function useRecipeEditor({ recipeId, onSave, onCreated }: UseRecipeEditorArgs) {
  const { user } = useAuth();

  // ƒo. Anti-bug: si on reÇõoit "undefined"/"null" en string, on ignore.
  const validRecipeId = useMemo(() => {
    const v = (recipeId ?? "").trim();
    if (!v) return null;
    if (v === "undefined" || v === "null") return null;
    return v;
  }, [recipeId]);

  const isEdit = !!validRecipeId;

  // ---------- remote (edit fetch) ----------
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [sectionsDb, setSectionsDb] = useState<RecipeSectionRow[]>([]);
  const [ingredientsDb, setIngredientsDb] = useState<Ingredient[]>([]);
  const [linksDb, setLinksDb] = useState<SectionIngredientRow[]>([]);

  // ---------- form state ----------
  const [title, setTitle] = useState<string>("");
  const [servings, setServings] = useState<number>(4);
  const [category, setCategory] = useState<string>("Autre");
  const [generalInstructions, setGeneralInstructions] = useState<string>("");

  const [sections, setSections] = useState<SectionForm[]>(() => [
    { localId: uid(), title: "", instructions: "", collapsed: false },
  ]);

  // ingredients par section localId
  const [sectionIngredients, setSectionIngredients] = useState<Record<string, IngredientForm[]>>(
    () => ({})
  );

  // init ingredients for first section (mount)
  useEffect(() => {
    setSectionIngredients((prev) => {
      const firstSection = sections[0]?.localId;
      if (!firstSection) return prev;
      if (prev[firstSection]) return prev;
      return {
        ...prev,
        [firstSection]: [{ localId: uid(), quantity: "", unit: "g", designation: "" }],
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- fetch edit ----------
  useEffect(() => {
    if (!validRecipeId) {
      // mode create : reset minimal
      setLoading(false);
      setErrorMsg(null);
      setRecipe(null);
      setSectionsDb([]);
      setIngredientsDb([]);
      setLinksDb([]);

      // form defaults
      setTitle("");
      setServings(4);
      setCategory("Autre");
      setGeneralInstructions("");
      setSections([{ localId: uid(), title: "", instructions: "", collapsed: false }]);
      setSectionIngredients({});
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const { data: recipeData, error: recipeError } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", validRecipeId)
          .maybeSingle();

        if (recipeError) throw recipeError;
        if (!recipeData) throw new Error("Recette introuvable");

        const { data: sectionsData, error: sectionsError } = await supabase
          .from("recipe_sections")
          .select("id,title,instructions,order_index")
          .eq("recipe_id", validRecipeId)
          .order("order_index", { ascending: true });

        if (sectionsError) throw sectionsError;

        const { data: ingredientsData, error: ingredientsError } = await supabase
          .from("ingredients")
          .select("*")
          .eq("recipe_id", validRecipeId)
          .order("order_index", { ascending: true });

        if (ingredientsError) throw ingredientsError;

        const sectionIds = (sectionsData ?? []).map((s) => s.id);
        const { data: linksData, error: linksError } = await supabase
          .from("section_ingredients")
          .select("section_id,ingredient_id,order_index")
          .in(
            "section_id",
            sectionIds.length ? sectionIds : ["00000000-0000-0000-0000-000000000000"]
          )
          .order("order_index", { ascending: true });

        if (linksError) throw linksError;

        if (cancelled) return;

        setRecipe(recipeData as Recipe);
        setSectionsDb((sectionsData ?? []) as RecipeSectionRow[]);
        setIngredientsDb((ingredientsData ?? []) as Ingredient[]);
        setLinksDb((linksData ?? []) as SectionIngredientRow[]);

        // ---- hydrate form ----
        setTitle((recipeData as any)?.title ?? "");
        setServings(Number((recipeData as any)?.servings ?? 4));
        setCategory(String((recipeData as any)?.category ?? "Autre"));
        // ƒsÿ‹÷? Ajuste ici si ton champ sƒ?Tappelle autrement que "notes"
        setGeneralInstructions(String((recipeData as any)?.notes ?? ""));

        // sections form
        const hydratedSections: SectionForm[] =
          (sectionsData ?? []).map((s) => ({
            localId: uid(),
            dbId: s.id,
            title: s.title ?? "",
            instructions: s.instructions ?? "",
            collapsed: false,
          })) || [];

        const safeSections = hydratedSections.length
          ? hydratedSections
          : [{ localId: uid(), title: "", instructions: "", collapsed: false }];

        setSections(safeSections);

        // map ingredient_id -> ingredient row
        const ingById = new Map<string, Ingredient>();
        (ingredientsData ?? []).forEach((i: any) => ingById.set(i.id, i));

        // build sectionIngredients from links
        const map: Record<string, IngredientForm[]> = {};
        // default: each section at least one row
        for (const s of safeSections) {
          map[s.localId] = [{ localId: uid(), quantity: "", unit: "g", designation: "" }];
        }

        // fill from links (preserve order_index)
        const linksSorted = (linksData ?? [])
          .slice()
          .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

        for (const l of linksSorted as any[]) {
          const section = safeSections.find((sf) => sf.dbId === l.section_id);
          const ing = ingById.get(l.ingredient_id);
          if (!section || !ing) continue;

          if (
            !map[section.localId] ||
            (map[section.localId].length === 1 && !map[section.localId][0].designation)
          ) {
            map[section.localId] = [];
          }

          map[section.localId].push({
            localId: uid(),
            dbId: (ing as any).id,
            quantity: (ing as any).quantity ?? "",
            unit: (ing as any).unit ?? "g",
            designation: (ing as any).designation ?? "",
          });
        }

        setSectionIngredients(map);
      } catch (e: any) {
        if (!cancelled) setErrorMsg(e?.message ?? "Erreur lors du chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [validRecipeId]);

  // ---------- section actions ----------
  function addSection() {
    const newLocalId = uid();
    setSections((prev) => [...prev, { localId: newLocalId, title: "", instructions: "", collapsed: false }]);
    setSectionIngredients((prev) => ({
      ...prev,
      [newLocalId]: [{ localId: uid(), quantity: "", unit: "g", designation: "" }],
    }));
  }

  function removeSection(sectionLocalId: string) {
    setSections((prev) => prev.filter((s) => s.localId !== sectionLocalId));
    setSectionIngredients((prev) => {
      const copy = { ...prev };
      delete copy[sectionLocalId];
      return copy;
    });
  }

  function toggleCollapse(sectionLocalId: string) {
    setSections((prev) =>
      prev.map((s) => (s.localId === sectionLocalId ? { ...s, collapsed: !s.collapsed } : s))
    );
  }

  // ---------- ingredient actions ----------
  function addIngredient(sectionLocalId: string) {
    setSectionIngredients((prev) => ({
      ...prev,
      [sectionLocalId]: [
        ...(prev[sectionLocalId] ?? []),
        { localId: uid(), quantity: "", unit: "g", designation: "" },
      ],
    }));
  }

  function removeIngredient(sectionLocalId: string, idx: number) {
    setSectionIngredients((prev) => ({
      ...prev,
      [sectionLocalId]: (prev[sectionLocalId] ?? []).filter((_, i) => i !== idx),
    }));
  }

  function updateIngredient(sectionLocalId: string, idx: number, field: keyof IngredientForm, value: any) {
    setSectionIngredients((prev) => {
      const list = [...(prev[sectionLocalId] ?? [])];
      const row = list[idx];
      if (!row) return prev;
      list[idx] = { ...row, [field]: value };
      return { ...prev, [sectionLocalId]: list };
    });
  }

// ---------- save ----------
async function handleSave() {
  if (!user) {
    setErrorMsg("Tu dois être connecté pour enregistrer.");
    return;
  }
  if (!title.trim()) {
    setErrorMsg("Le titre est obligatoire.");
    return;
  }

  setSaving(true);
  setErrorMsg(null);

  try {
    let currentRecipeId = validRecipeId;

    // ✅ Snapshot des anciens ids (pour cleanup après)
    const oldSectionIds = (sectionsDb ?? []).map((s) => s.id).filter(Boolean);
    const oldIngredientIds = (ingredientsDb ?? []).map((i: any) => i.id).filter(Boolean);

    // 1) upsert recipe
    const recipePayload: any = {
      title: title.trim(),
      servings: Math.max(1, Number(servings || 1)),
      category: (category || "Autre").trim(),
      // ⚠️ Ajuste ici si ton champ s’appelle autrement que "notes"
      notes: generalInstructions.trim(),
      updated_at: new Date().toISOString(),
    };

    if (!currentRecipeId) {
      recipePayload.created_by = user.id;
      const { data: created, error } = await supabase
        .from("recipes")
        .insert([recipePayload])
        .select("id")
        .single();
      if (error) throw error;
      currentRecipeId = created.id;
      onCreated?.(currentRecipeId);
    } else {
      const { error } = await supabase
        .from("recipes")
        .update(recipePayload)
        .eq("id", currentRecipeId);
      if (error) throw error;
    }

    if (!currentRecipeId) throw new Error("Impossible de déterminer l'id recette.");

    // 2) insert sections (nouvelle version)
    const sectionsToInsert = sections.map((s, idx) => ({
      recipe_id: currentRecipeId,
      title: s.title.trim() || null,
      instructions: s.instructions.trim() || null,
      order_index: idx,
    }));

    const { data: insertedSections, error: secErr } = await supabase
      .from("recipe_sections")
      .insert(sectionsToInsert)
      .select("id,order_index");

    if (secErr) throw secErr;

    const byOrder = new Map<number, string>();
    (insertedSections ?? []).forEach((s: any) => byOrder.set(Number(s.order_index), s.id));

    // 3) insert ingredients (nouvelle version) + préparer liens
    const ingredientsToInsert: any[] = [];
    const linkToCreate: {
      sectionDbId: string;
      ingredientTempIndex: number;
      order_index: number;
    }[] = [];

    let ingGlobalIndex = 0;

    sections.forEach((sec, secIndex) => {
      const secDbId = byOrder.get(secIndex);
      if (!secDbId) return;

      const list = sectionIngredients[sec.localId] ?? [];
      const filtered = list.filter((i) => String(i.designation ?? "").trim());

      filtered.forEach((i, idx) => {
        ingredientsToInsert.push({
          recipe_id: currentRecipeId,
          order_index: ingGlobalIndex++,
          quantity: i.quantity === "" ? 0 : Number(i.quantity),
          unit: (i.unit ?? "g").trim(),
          designation: String(i.designation ?? "").trim(),
        });

        linkToCreate.push({
          sectionDbId: secDbId,
          ingredientTempIndex: ingredientsToInsert.length - 1,
          order_index: idx,
        });
      });
    });

    let insertedIngredients: any[] = [];
    if (ingredientsToInsert.length > 0) {
      const { data: insIng, error: ingErr } = await supabase
        .from("ingredients")
        .insert(ingredientsToInsert)
        .select("id,order_index");
      if (ingErr) throw ingErr;
      insertedIngredients = insIng ?? [];
    }

    // 4) insert links section_ingredients (nouvelle version)
    if (insertedIngredients.length > 0 && linkToCreate.length > 0) {
      const linksToInsert = linkToCreate
        .map((l) => ({
          section_id: l.sectionDbId,
          ingredient_id: insertedIngredients[l.ingredientTempIndex]?.id,
          order_index: l.order_index,
        }))
        .filter((x) => !!x.ingredient_id);

      const { error: linkErr } = await supabase
        .from("section_ingredients")
        .insert(linksToInsert);

      if (linkErr) throw linkErr;
    }

    // 5) ✅ Cleanup des anciens (après succès total)
    if (oldSectionIds.length > 0) {
      const { error: delLinksErr } = await supabase
        .from("section_ingredients")
        .delete()
        .in("section_id", oldSectionIds);
      if (delLinksErr) throw delLinksErr;

      const { error: delSecErr } = await supabase
        .from("recipe_sections")
        .delete()
        .in("id", oldSectionIds);
      if (delSecErr) throw delSecErr;
    }

    if (oldIngredientIds.length > 0) {
      const { error: delIngErr } = await supabase
        .from("ingredients")
        .delete()
        .in("id", oldIngredientIds);
      if (delIngErr) throw delIngErr;
    }

    onSave?.();
  } catch (e: any) {
    setErrorMsg(e?.message ?? "Erreur lors de l’enregistrement");
  } finally {
    setSaving(false);
  }
}

  return {
    isEdit,
    loading,
    saving,
    errorMsg,
    title,
    setTitle,
    servings,
    setServings,
    category,
    setCategory,
    generalInstructions,
    setGeneralInstructions,
    sections,
    setSections,
    sectionIngredients,
    addSection,
    removeSection,
    toggleCollapse,
    addIngredient,
    removeIngredient,
    updateIngredient,
    handleSave,
  };
}
