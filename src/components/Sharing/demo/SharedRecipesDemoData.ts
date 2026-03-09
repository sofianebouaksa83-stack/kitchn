export type DemoFolder = {
  id: string;
  name: string;
};

export type DemoIngredient = {
  name: string;
  qty: number | null;
  unit: string | null;
};

export type DemoSection = {
  id: string;
  title: string;
  ingredients: DemoIngredient[];
  steps: string[];
};

export type DemoRecipeDetails = {
  sections: DemoSection[];
  notes?: string;
  allergens?: string[];
};

export type DemoRecipe = {
  id: string;
  title: string;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  folder_id: string | null;
  is_favorite: boolean;
  is_owner: boolean;
  details: DemoRecipeDetails;
};

export type DemoGroup = {
  id: string;
  name: string;
};

export const demoGroups: DemoGroup[] = [
  { id: "bistro", name: "BISTRO" },
  { id: "jdb", name: "JDB" },
  { id: "lab", name: "LAB" },
];

export const demoFoldersByGroup: Record<string, DemoFolder[]> = {
  bistro: [
    { id: "f1", name: "Entrées" },
    { id: "f2", name: "Sauces" },
    { id: "f3", name: "Garnitures" },
  ],
  jdb: [
    { id: "f4", name: "Desserts" },
    { id: "f5", name: "Base pâtisserie" },
  ],
  lab: [{ id: "f6", name: "Tests & R&D" }],
};

export const demoRecipesByGroup: Record<string, DemoRecipe[]> = {
  bistro: [
    {
      id: "r1",
      title: "Carpaccio de langoustine, pomme de terre, estragon",
      category: "Entrée",
      servings: 4,
      prep_time: 10,
      cook_time: 0,
      folder_id: "f1",
      is_favorite: true,
      is_owner: true,
      details: {
        allergens: ["Crustacés"],
        notes:
          "Au moment du service, glacer les pommes de terre.\nAjouter l’estragon ciselé au dernier moment.",
        sections: [
          {
            id: "s1",
            title: "Carpaccio de langoustine",
            ingredients: [
              { name: "Langoustines", qty: 15, unit: "unité" },
              { name: "Anduja", qty: 40, unit: "g" },
              { name: "Gros sel", qty: null, unit: null },
            ],
            steps: [
              "Passer les langoustines 5 minutes au gros sel.",
              "Les écraser avec la batte entre 2 papiers guitare.",
              "Mélanger la langoustine écrasée avec l’anduja.",
              "Mettre en grand sac sous-vide et étaler le plus fin possible.",
              "Détailler en cercles et conserver en boîte.",
            ],
          },
          {
            id: "s2",
            title: "Pommes de terre",
            ingredients: [
              { name: "Petites pommes de terre", qty: 30, unit: "unité" },
              { name: "Bisque", qty: 2, unit: "L" },
              { name: "Beurre", qty: null, unit: null },
            ],
            steps: [
              "Cuire les pommes de terre dans la bisque jusqu’à cuisson fondante.",
              "Réduire légèrement le jus, monter au beurre pour glacer.",
            ],
          },
        ],
      },
    },
    {
      id: "r2",
      title: "Jus de volaille réduit au romarin",
      category: "Sauce",
      servings: 20,
      prep_time: 20,
      cook_time: 60,
      folder_id: "f2",
      is_favorite: false,
      is_owner: false,
      details: {
        allergens: [],
        notes: "Bien écumer au début. Réduire à la nappe, ajuster le sel en fin.",
        sections: [
          {
            id: "s1",
            title: "Base",
            ingredients: [
              { name: "Carcasses de volaille", qty: 3, unit: "kg" },
              { name: "Mirepoix", qty: 600, unit: "g" },
              { name: "Vin blanc", qty: 30, unit: "cl" },
              { name: "Romarin", qty: 2, unit: "branches" },
              { name: "Eau", qty: null, unit: null },
            ],
            steps: [
              "Colorer les carcasses, ajouter mirepoix.",
              "Déglacer au vin blanc, mouiller à hauteur.",
              "Cuire frémissant 45 min, écumer.",
              "Passer, réduire 10–20 min avec romarin.",
              "Filtrer fin, rectifier l’assaisonnement.",
            ],
          },
        ],
      },
    },
    {
      id: "r3",
      title: "Pickles d’oignon rouge",
      category: "Garniture",
      servings: 10,
      prep_time: 15,
      cook_time: 5,
      folder_id: "f3",
      is_favorite: false,
      is_owner: true,
      details: {
        allergens: [],
        notes: "Plus c’est fin, plus ça pickle vite. Laisser minimum 2h au frais.",
        sections: [
          {
            id: "s1",
            title: "Pickle",
            ingredients: [
              { name: "Oignons rouges", qty: 3, unit: "unité" },
              { name: "Vinaigre de cidre", qty: 25, unit: "cl" },
              { name: "Eau", qty: 25, unit: "cl" },
              { name: "Sucre", qty: 40, unit: "g" },
              { name: "Sel", qty: 10, unit: "g" },
            ],
            steps: [
              "Émincer finement les oignons.",
              "Porter vinaigre, eau, sucre, sel à frémissement.",
              "Verser sur les oignons, refroidir puis réserver au frais.",
            ],
          },
        ],
      },
    },
    {
      id: "r4",
      title: "Purée de céleri (texture lisse)",
      category: "Garniture",
      servings: 8,
      prep_time: 15,
      cook_time: 35,
      folder_id: null,
      is_favorite: true,
      is_owner: false,
      details: {
        allergens: ["Lait (si beurre/crème)"],
        notes: "Mixer très chaud. Passer tamis fin pour une texture parfaite.",
        sections: [
          {
            id: "s1",
            title: "Purée",
            ingredients: [
              { name: "Céleri-rave", qty: 1, unit: "pièce" },
              { name: "Lait", qty: 30, unit: "cl" },
              { name: "Crème", qty: 20, unit: "cl" },
              { name: "Beurre", qty: 60, unit: "g" },
            ],
            steps: [
              "Éplucher, tailler en cubes.",
              "Cuire dans lait + crème jusqu’à fondant.",
              "Égoutter en gardant un peu de liquide, puis mixer.",
              "Monter au beurre, assaisonner, passer fin.",
            ],
          },
        ],
      },
    },
  ],

  jdb: [
    {
      id: "r5",
      title: "Crème montée vanille",
      category: "Dessert",
      servings: 12,
      prep_time: 10,
      cook_time: 0,
      folder_id: "f4",
      is_favorite: false,
      is_owner: false,
      details: {
        allergens: ["Lait"],
        notes: "Bien froide à 4°C. Monter au dernier moment pour un pic net.",
        sections: [
          {
            id: "s1",
            title: "Crème",
            ingredients: [
              { name: "Crème 35%", qty: 500, unit: "g" },
              { name: "Vanille", qty: 1, unit: "gousse" },
              { name: "Sucre glace", qty: 40, unit: "g" },
            ],
            steps: [
              "Infuser la vanille dans la crème.",
              "Filtrer puis ajouter le sucre glace.",
              "Monter souple à ferme selon le besoin.",
            ],
          },
        ],
      },
    },
    {
      id: "r6",
      title: "Sablé breton",
      category: "Base pâtisserie",
      servings: 20,
      prep_time: 20,
      cook_time: 15,
      folder_id: "f5",
      is_favorite: true,
      is_owner: true,
      details: {
        allergens: ["Gluten", "Œufs", "Lait"],
        notes: "Cuire entre deux feuilles silicone pour une platitude parfaite.",
        sections: [
          {
            id: "s1",
            title: "Pâte",
            ingredients: [
              { name: "Beurre", qty: 200, unit: "g" },
              { name: "Sucre", qty: 150, unit: "g" },
              { name: "Jaunes", qty: 4, unit: "unité" },
              { name: "Farine", qty: 250, unit: "g" },
              { name: "Levure", qty: 10, unit: "g" },
              { name: "Sel", qty: 3, unit: "g" },
            ],
            steps: [
              "Crémer beurre, sucre et sel.",
              "Ajouter les jaunes.",
              "Incorporer farine et levure sans trop travailler.",
              "Étaler, détailler, cuire à 160°C environ 15 min.",
            ],
          },
        ],
      },
    },
  ],

  lab: [
    {
      id: "r7",
      title: "Gel abricot-olive (test R&D)",
      category: "Autre",
      servings: 25,
      prep_time: 25,
      cook_time: 5,
      folder_id: "f6",
      is_favorite: false,
      is_owner: true,
      details: {
        allergens: [],
        notes: "Ajuster l’acidité au citron selon la maturité de l’abricot.",
        sections: [
          {
            id: "s1",
            title: "Gel",
            ingredients: [
              { name: "Purée d’abricot", qty: 500, unit: "g" },
              { name: "Jus d’olive", qty: 30, unit: "g" },
              { name: "Sucre", qty: 40, unit: "g" },
              { name: "Agar-agar", qty: 3, unit: "g" },
            ],
            steps: [
              "Mélanger purée, sucre et agar.",
              "Porter à ébullition 30 secondes.",
              "Hors feu, ajouter le jus d’olive.",
              "Couler, laisser gélifier, puis mixer lisse.",
            ],
          },
        ],
      },
    },
  ],
};