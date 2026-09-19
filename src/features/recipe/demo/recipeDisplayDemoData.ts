export type IngredientRow = {
  id: string;
  quantity: number | null;
  unit: string | null;
  designation: string | null;
  order_index: number | null;
};

export type RecipeSectionRow = {
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

export type RecipeRow = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  notes: string | null;
  allergens: string | null;
  created_at: string | null;
};

type DemoBundle = {
  sections: RecipeSectionRow[];
  ingredients: IngredientRow[];
  links: SectionIngredientRow[];
};

export const DEMO_RECIPES: Record<string, RecipeRow> = {
  "demo-1": {
    id: "demo-1",
    title: "Carpaccio de bar, citron confit",
    category: "Entrée",
    servings: 4,
    prep_time: 15,
    cook_time: 0,
    notes: "Dresser très froid. Assaisonner au dernier moment.",
    allergens: "Poisson",
    created_at: null,
  },
  "demo-2": {
    id: "demo-2",
    title: "Volaille rôtie, jus réduit",
    category: "Plat",
    servings: 6,
    prep_time: 25,
    cook_time: 45,
    notes: "Laisser reposer 8–10 min avant découpe.",
    allergens: "",
    created_at: null,
  },
  "demo-3": {
    id: "demo-3",
    title: "Pomme de terre fondante, beurre noisette",
    category: "Garniture",
    servings: 8,
    prep_time: 20,
    cook_time: 35,
    notes: "Arroser régulièrement. Finition au beurre noisette.",
    allergens: "Lait",
    created_at: null,
  },
  "demo-4": {
    id: "demo-4",
    title: "Ganache chocolat, fleur de sel",
    category: "Dessert",
    servings: 10,
    prep_time: 15,
    cook_time: 10,
    notes: "Chocolat noir 70% minimum. Laisser cristalliser au froid.",
    allergens: "Lait",
    created_at: null,
  },
};

/** ✅ Détails fake */
export const DEMO_DETAILS: Record<string, DemoBundle> = {
  "demo-1": {
    sections: [
      {
        id: "s1",
        title: "Carpaccio de bar",
        instructions:
          "Lever les filets, parer.\nTailler finement.\nAssaisonner avec huile d’olive, citron confit, sel et poivre.\nDresser immédiatement.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Condiment",
        instructions:
          "Hacher citron confit et herbes.\nMonter à l’huile d’olive.\nFinition au zeste et fleur de sel.",
        order_index: 2,
      },
    ],
    ingredients: [
      {
        id: "i1",
        designation: "Bar (filet)",
        quantity: 2,
        unit: "pièce",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Citron confit",
        quantity: 30,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Huile d’olive",
        quantity: 40,
        unit: "g",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Ciboulette",
        quantity: 5,
        unit: "g",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Fleur de sel",
        quantity: null,
        unit: "QS",
        order_index: 5,
      },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s2", ingredient_id: "i2", order_index: 1 },
      { section_id: "s2", ingredient_id: "i4", order_index: 2 },
      { section_id: "s2", ingredient_id: "i5", order_index: 3 },
    ],
  },

  "demo-2": {
    sections: [
      {
        id: "s1",
        title: "Volaille",
        instructions:
          "Assaisonner, ficeler.\nRôtir sur le coffre.\nArroser régulièrement.\nRepos avant découpe.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Jus réduit",
        instructions:
          "Déglacer.\nAjouter fond / jus.\nRéduire.\nMonter au beurre si besoin.",
        order_index: 2,
      },
    ],
    ingredients: [
      {
        id: "i1",
        designation: "Volaille",
        quantity: 1,
        unit: "pièce",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Beurre",
        quantity: 40,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Ail",
        quantity: 2,
        unit: "gousse",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Thym",
        quantity: 2,
        unit: "branche",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Fond / jus",
        quantity: 0.5,
        unit: "L",
        order_index: 5,
      },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s1", ingredient_id: "i4", order_index: 3 },
      { section_id: "s2", ingredient_id: "i5", order_index: 1 },
      { section_id: "s2", ingredient_id: "i2", order_index: 2 },
    ],
  },

  "demo-3": {
    sections: [
      {
        id: "s1",
        title: "Cuisson fondante",
        instructions:
          "Cuire à couvert avec un fond.\nMaintenir une petite ébullition.\nVérifier la pointe.\nGlacer en fin de cuisson.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Beurre noisette",
        instructions:
          "Cuire le beurre jusqu’à noisette.\nFiltrer.\nNapper au service.",
        order_index: 2,
      },
    ],
    ingredients: [
      {
        id: "i1",
        designation: "Pomme de terre grenaille",
        quantity: 800,
        unit: "g",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Beurre",
        quantity: 120,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Bouillon",
        quantity: 0.3,
        unit: "L",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Sel",
        quantity: null,
        unit: "QS",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Persil",
        quantity: 10,
        unit: "g",
        order_index: 5,
      },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s1", ingredient_id: "i4", order_index: 3 },
      { section_id: "s2", ingredient_id: "i2", order_index: 1 },
      { section_id: "s2", ingredient_id: "i5", order_index: 2 },
    ],
  },

  "demo-4": {
    sections: [
      {
        id: "s1",
        title: "Ganache",
        instructions:
          "Faire bouillir la crème.\nVerser sur le chocolat.\nÉmulsion.\nRefroidir.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Finition",
        instructions:
          "Mettre en poche.\nDresser.\nFleur de sel au dernier moment.",
        order_index: 2,
      },
    ],
    ingredients: [
      {
        id: "i1",
        designation: "Chocolat noir",
        quantity: 250,
        unit: "g",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Crème",
        quantity: 200,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Beurre",
        quantity: 30,
        unit: "g",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Fleur de sel",
        quantity: null,
        unit: "QS",
        order_index: 4,
      },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i2", order_index: 1 },
      { section_id: "s1", ingredient_id: "i1", order_index: 2 },
      { section_id: "s1", ingredient_id: "i3", order_index: 3 },
      { section_id: "s2", ingredient_id: "i4", order_index: 1 },
    ],
  },
};