import React, { useMemo, useRef, useState, useEffect, type DragEvent } from "react";
import {
  Share2,
  Clock,
  Users,
  Folder,
  Eye,
  Heart,
  Filter,
  X,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Search,
  Plus,
  AlertCircle,
  Tag,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type GroupMini = { id: string; name: string };

type DemoFolder = {
  id: string;
  name: string;
};

type DemoIngredient = {
  name: string;
  qty: number | null;
  unit: string | null;
};

type DemoSection = {
  id: string;
  title: string;
  ingredients: DemoIngredient[];
  steps: string[];
};

type DemoRecipeDetails = {
  sections: DemoSection[];
  notes?: string;
  allergens?: string[];
};

type DemoRecipe = {
  id: string;
  title: string;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;

  // demo state
  folder_id: string | null;
  is_favorite: boolean;
  is_owner: boolean;

  // details (vue recette)
  details: DemoRecipeDetails;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function formatQty(qty: number | null, unit: string | null) {
  if (qty === null && !unit) return "—";
  if (qty === null) return unit ? unit : "—";
  if (!unit) return `${qty}`;
  return `${qty} ${unit}`;
}

export function SharedRecipesDemoPanel() {
  // ------------------------------
  // DEMO DATA
  // ------------------------------
  const userGroups = useMemo<GroupMini[]>(
    () => [
      { id: "bistro", name: "BISTRO" },
      { id: "jdb", name: "JDB" },
      { id: "lab", name: "LAB" },
    ],
    []
  );

  const groupFoldersByGroup = useMemo<Record<string, DemoFolder[]>>(
    () => ({
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
    }),
    []
  );

  const initialRecipesByGroup = useMemo<Record<string, DemoRecipe[]>>(
    () => ({
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
                  "Égoutter (garder un peu de liquide), mixer.",
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
            notes: "Bien froide (4°C). Monter au dernier moment pour un pic net.",
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
                  "Infuser vanille dans la crème (option : une nuit).",
                  "Filtrer, ajouter sucre glace.",
                  "Monter souple à ferme selon besoin.",
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
            notes: "Cuire entre deux feuilles silicone pour platitude parfaite.",
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
                  "Crémer beurre + sucre + sel.",
                  "Ajouter jaunes.",
                  "Incorporer farine + levure (sans trop travailler).",
                  "Étaler, détailler, cuire 160°C ~15 min.",
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
            notes: "Ajuster l’acidité au citron selon maturité de l’abricot.",
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
                  "Mélanger purée + sucre + agar.",
                  "Porter à ébullition 30 secondes.",
                  "Hors feu ajouter jus d’olive.",
                  "Couler, gélifier, mixer lisse.",
                ],
              },
            ],
          },
        },
      ],
    }),
    []
  );

  // ------------------------------
  // NAV / VIEW STATE
  // ------------------------------
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);

  // vue recette (même UX que ton site)
  const [multiplier, setMultiplier] = useState(1);

  // group view state
  const [folders, setFolders] = useState<DemoFolder[]>([]);
  const [recipes, setRecipes] = useState<DemoRecipe[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  // new folder UI (demo)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // drag&drop (demo)
  const [draggedRecipe, setDraggedRecipe] = useState<string | null>(null);

  // mobile sidebar (demo)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // folder menu ⋮
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const menuRootRef = useRef<HTMLDivElement | null>(null);

  // init group content on enter
  useEffect(() => {
    if (!selectedGroupId) return;

    setFolders(groupFoldersByGroup[selectedGroupId] ?? []);
    setRecipes(initialRecipesByGroup[selectedGroupId] ?? []);

    setSelectedFolder(null);
    setShowFavoritesOnly(false);
    setSearchTerm("");
    setCategoryFilter("Toutes");

    setShowNewFolderInput(false);
    setNewFolderName("");

    setViewingRecipeId(null);
    setMultiplier(1);

    setSidebarOpen(false);
    setFolderMenuOpenId(null);
  }, [selectedGroupId, groupFoldersByGroup, initialRecipesByGroup]);

  // close ⋮ menu on outside click
  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!folderMenuOpenId) return;
      const t = e.target as Node | null;
      if (!t) return;
      if (menuRootRef.current && menuRootRef.current.contains(t)) return;
      setFolderMenuOpenId(null);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [folderMenuOpenId]);

  const selectedGroupName =
    selectedGroupId ? userGroups.find((g) => g.id === selectedGroupId)?.name ?? "Groupe" : null;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of recipes) set.add(r.category || "Sans catégorie");
    return ["Toutes", ...Array.from(set)];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let out = recipes.slice();

    if (selectedFolder) out = out.filter((r) => r.folder_id === selectedFolder);
    if (showFavoritesOnly) out = out.filter((r) => r.is_favorite);

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      out = out.filter((r) => (r.title || "").toLowerCase().includes(q));
    }

    if (categoryFilter !== "Toutes") {
      out = out.filter((r) => (r.category || "Sans catégorie") === categoryFilter);
    }

    return out;
  }, [recipes, selectedFolder, showFavoritesOnly, searchTerm, categoryFilter]);

  // ------------------------------
  // ACTIONS (DEMO)
  // ------------------------------
  function handleToggleFavorite(recipeId: string) {
    setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, is_favorite: !r.is_favorite } : r)));
  }

  function handleMoveToFolder(recipeId: string, folderId: string | null) {
    setRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, folder_id: folderId } : r)));
  }

  function handleRemoveFromGroup(recipeId: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (viewingRecipeId === recipeId) setViewingRecipeId(null);
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const id = `f_${Math.random().toString(36).slice(2, 8)}`;
    const next: DemoFolder = { id, name };
    setFolders((prev) => [...prev, next].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedFolder(id);
    setShowFavoritesOnly(false);
    setNewFolderName("");
    setShowNewFolderInput(false);
  }

  function handleRenameFolder(folderId: string) {
    const current = folders.find((f) => f.id === folderId)?.name ?? "";
    const next = prompt("Nouveau nom du dossier :", current)?.trim();
    if (!next) return;
    setFolders((prev) =>
      prev
        .map((f) => (f.id === folderId ? { ...f, name: next } : f))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setFolderMenuOpenId(null);
  }

  function handleDeleteFolder(folderId: string) {
    const ok = confirm("Supprimer ce dossier ?\nLes recettes seront juste retirées de ce dossier.");
    if (!ok) return;

    setRecipes((prev) => prev.map((r) => (r.folder_id === folderId ? { ...r, folder_id: null } : r)));
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (selectedFolder === folderId) setSelectedFolder(null);
    setFolderMenuOpenId(null);
  }

  function handleDragStart(recipeId: string, e: DragEvent) {
    setDraggedRecipe(recipeId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(folderId: string | null, e: DragEvent) {
    e.preventDefault();
    if (!draggedRecipe) return;
    handleMoveToFolder(draggedRecipe, folderId);
    setDraggedRecipe(null);
  }

  // ------------------------------
  // VIEW 1) LISTE DES GROUPES
  // ------------------------------
  if (!selectedGroupId) {
    const emptyState = userGroups.length === 0;

    return (
      <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <Share2 className="w-5 h-5 text-amber-200" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Partager</h1>
              <p className="text-sm text-slate-300/70 mt-1">Recettes visibles via tes groupes de travail</p>
              <p className="text-xs text-slate-400 mt-2">Démo • vue Groupes → vue Groupe → vue Recette</p>
            </div>
          </div>
        </div>

        {emptyState ? (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
            <Share2 className="w-14 h-14 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-200 text-lg font-semibold">Tu n’es dans aucun groupe pour le moment</p>
            <p className="text-sm text-slate-300/70 mt-2">Demande une invitation ou crée un groupe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {userGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroupId(g.id)}
                title={`Ouvrir ${g.name}`}
                type="button"
                className={[
                  "text-left",
                  "relative rounded-3xl border ring-1 overflow-hidden",
                  "border-white/10 ring-white/10 bg-white/[0.06]",
                  "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                  "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
                ].join(" ")}
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                      <Folder className="w-5 h-5 text-amber-200" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-slate-100 truncate">{g.name}</div>
                      <div className="text-sm text-slate-300/70">Ouvrir le groupe</div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ------------------------------
  // VIEW 2.5) VUE RECETTE (identique site)
  // ------------------------------
  if (viewingRecipeId) {
    const r = recipes.find((x) => x.id === viewingRecipeId);
    const details = r?.details;

    const displayedTitle = r?.title ?? "Recette";
    const displayedCategory = r?.category ?? "Sans catégorie";
    const displayedPrep = r?.prep_time ?? 0;
    const displayedCook = r?.cook_time ?? 0;

    return (
      <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                <Tag className="w-5 h-5 text-amber-200" />
              </span>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100 truncate">{displayedTitle}</h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  {displayedCategory} · Prép {displayedPrep}min · Cuisson {displayedCook}min
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setViewingRecipeId(null);
              setMultiplier(1);
            }}
            className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl inline-flex items-center gap-2`}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* 2 colonnes (comme ton screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Colonne gauche */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-4">
              <div className="text-sm text-slate-300/70 mb-3">Multiplier</div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-slate-100 font-semibold">x{multiplier}</div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
                    className="h-10 w-10 rounded-2xl bg-black/15 ring-1 ring-white/10 text-slate-100 hover:bg-black/20 transition"
                    aria-label="Diminuer"
                  >
                    –
                  </button>
                  <button
                    type="button"
                    onClick={() => setMultiplier((m) => m + 1)}
                    className="h-10 w-10 rounded-2xl bg-amber-500/20 ring-1 ring-amber-400/30 text-amber-100 hover:bg-amber-500/25 transition"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMultiplier(1)}
                className="mt-3 text-xs text-slate-300/70 hover:text-slate-200 transition"
              >
                Reset
              </button>
            </div>

            <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-4">
              <div className="text-sm font-semibold text-slate-100">Allergènes</div>
              <p className="text-sm text-slate-300/70 mt-2">
                {details?.allergens && details.allergens.length > 0 ? details.allergens.join(" · ") : "—"}
              </p>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="space-y-5">
            {(details?.sections ?? []).map((s) => (
              <div key={s.id} className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5">
                <div className="text-slate-100 font-semibold mb-3">{s.title}</div>
                <div className="h-px bg-white/10 mb-4" />

                <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-2">
                  Ingrédients
                </div>

                <div className="space-y-2 mb-4">
                  {s.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-sm text-slate-100">
                      <span className="truncate">{ing.name}</span>
                      <span className="text-slate-300/80 shrink-0">{formatQty(ing.qty, ing.unit)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-2">
                  Étapes
                </div>

                <div className="text-sm text-slate-200/90 whitespace-pre-line leading-relaxed">
                  {s.steps.join("\n")}
                </div>
              </div>
            ))}

            <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5">
              <div className="text-slate-100 font-semibold mb-3">Notes</div>
              <div className="text-sm text-slate-200/90 whitespace-pre-line leading-relaxed">
                {details?.notes?.trim() ? details.notes : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------
  // VIEW 2) DANS UN GROUPE (list cards)
  // ------------------------------
  const emptyStateRecipes = recipes.length === 0;
  const emptyStateFiltered = filteredRecipes.length === 0 && !emptyStateRecipes;

  return (
    <div
      ref={menuRootRef}
      className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
            <Share2 className="w-5 h-5 text-amber-200" />
          </span>

          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedGroupId(null)}
                className="h-11 w-11 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-slate-200 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                title="Retour"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Partager</h1>
            </div>

            <p className="text-sm text-slate-300/70 mt-2">
              {selectedFolder
                ? `Dossier : ${folders.find((f) => f.id === selectedFolder)?.name ?? ""}`
                : showFavoritesOnly
                ? "Favoris"
                : "Toutes"}{" "}
              · <span className="text-slate-100 font-semibold">{filteredRecipes.length}</span>{" "}
              <span className="text-slate-300/70">· Groupe : {selectedGroupName}</span>
            </p>

            <p className="text-xs text-slate-400 mt-2">Démo • dossiers + favoris + filtres + actions + vue recette</p>
          </div>
        </div>
      </div>

      {/* overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setFolderMenuOpenId(null);
          }}
        />
      )}

      <div className="flex gap-6 relative">
        {/* Sidebar */}
        <div
          className={cn(
            `
            fixed lg:static top-0 left-0 h-full lg:h-auto
            w-80 lg:w-72
            rounded-[28px]
            bg-white/[0.06] ring-1 ring-white/10
            shadow-[0_18px_60px_rgba(0,0,0,0.30)]
            backdrop-blur-md
            p-5
            transform transition-transform duration-300 ease-in-out z-50
          `,
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase">Dossiers</h3>
            <button
              onClick={() => {
                setSidebarOpen(false);
                setFolderMenuOpenId(null);
              }}
              className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/15 ring-1 ring-white/10 text-slate-200 hover:bg-black/20 transition-colors"
              aria-label="Fermer"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* drop zone "Toutes" */}
          <button
            onClick={() => {
              setSelectedFolder(null);
              setShowFavoritesOnly(false);
              setSidebarOpen(false);
              setFolderMenuOpenId(null);
            }}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-2xl mb-2 transition-all duration-200",
              selectedFolder === null && !showFavoritesOnly
                ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
            )}
            type="button"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(null, e)}
            title="Déposer ici pour retirer du dossier"
          >
            Toutes les recettes
          </button>

          <button
            onClick={() => {
              setShowFavoritesOnly(true);
              setSelectedFolder(null);
              setSidebarOpen(false);
              setFolderMenuOpenId(null);
            }}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-2xl mb-3 flex items-center gap-2 transition-all duration-200",
              showFavoritesOnly
                ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
            )}
            type="button"
          >
            <Heart className="w-4 h-4" />
            Mes favoris
          </button>

          <div className="h-px bg-white/10 my-4" />

          {folders.map((folder) => (
            <div key={folder.id} className="relative">
              <button
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setShowFavoritesOnly(false);
                  setSidebarOpen(false);
                  setFolderMenuOpenId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("ring-2", "ring-amber-400/25");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
                }}
                onDrop={(e) => {
                  e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
                  handleDrop(folder.id, e);
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-2xl mb-2 flex items-center gap-2 transition-all duration-200",
                  selectedFolder === folder.id
                    ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                )}
                type="button"
              >
                <Folder className="w-4 h-4" />
                <span className="flex-1 truncate">{folder.name}</span>

                {/* ⋮ */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                  }}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors text-slate-200"
                  title="Options"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </button>

              {folderMenuOpenId === folder.id && (
                <div className="absolute right-2 top-[52px] z-50 w-48 rounded-2xl bg-[#0B1020]/95 ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.35)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleRenameFolder(folder.id)}
                    className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/5 transition"
                  >
                    Renommer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="w-full px-4 py-3 text-left text-sm text-red-200 hover:bg-red-500/10 transition"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* New folder */}
          <div className="mt-4">
            {showNewFolderInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                  placeholder="Nom du dossier"
                  className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10
                             text-slate-100 placeholder:text-slate-400/70 outline-none
                             focus:ring-2 focus:ring-amber-400/25"
                  autoFocus
                />
                <button onClick={handleCreateFolder} className={`${ui.btnPrimary} h-11 px-4 rounded-2xl`} type="button">
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName("");
                  }}
                  className={`${ui.btnGhost} h-11 px-4 rounded-2xl`}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
                type="button"
              >
                <Plus className="w-4 h-4" />
                Nouveau dossier
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* search + category */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom…"
                className="w-full h-11 pl-12 pr-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10
                           text-slate-100 placeholder:text-slate-400/70 outline-none
                           focus:ring-2 focus:ring-amber-400/25"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10
                         text-slate-100 outline-none focus:ring-2 focus:ring-amber-400/25"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0B1020]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Empty / Grid */}
          {emptyStateRecipes ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
              <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">Aucune recette partagée dans ce groupe</p>
              <p className="text-sm text-slate-300/70 mt-2">Les recettes apparaissent ici quand quelqu’un partage.</p>
            </div>
          ) : emptyStateFiltered ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
              <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">Aucune recette trouvée</p>
              <p className="text-sm text-slate-300/70 mt-2">Change tes filtres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  draggable
                  onDragStart={(e) => handleDragStart(recipe.id, e)}
                  onClick={() => setViewingRecipeId(recipe.id)}
                  className="cursor-pointer"
                >
                  <div
                    className={[
                      "relative rounded-3xl border ring-1 overflow-hidden",
                      "border-white/10 ring-white/10 bg-white/[0.06]",
                      "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                      "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">{recipe.title}</h3>
                          <div className="mt-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/15 ring-1 ring-white/10 text-slate-100">
                              {recipe.category || "Sans catégorie"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300/80">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings ?? 0} couverts</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300/80">
                          <Clock className="w-4 h-4" />
                          <span>
                            Prép: {recipe.prep_time ?? 0}min · Cuisson: {recipe.cook_time ?? 0}min
                          </span>
                        </div>
                      </div>

                      {/* actions en bas */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(recipe.id);
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors"
                            type="button"
                            title="Favori"
                          >
                            <Heart
                              className={cn(
                                "w-4 h-4",
                                recipe.is_favorite ? "fill-red-500 text-red-500" : "text-slate-300/70"
                              )}
                            />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingRecipeId(recipe.id);
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors"
                            type="button"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4 text-slate-300/70" />
                          </button>

                          {/* si dans un dossier: poubelle = retirer du dossier */}
                          {selectedFolder && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToFolder(recipe.id, null);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/30 hover:bg-red-500/20 transition-colors"
                              type="button"
                              title="Retirer du dossier"
                            >
                              <Trash2 className="w-4 h-4 text-red-200" />
                            </button>
                          )}
                        </div>

                        {/* retirer du groupe (owner only) */}
                        {recipe.is_owner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromGroup(recipe.id);
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-400/30 hover:bg-red-500/20 transition-colors"
                            type="button"
                            title="Retirer du groupe"
                          >
                            <X className="w-4 h-4 text-red-200" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile open sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-24 right-4 h-12 w-12 rounded-2xl bg-white/[0.08] ring-1 ring-white/10 backdrop-blur-md text-slate-100 shadow-xl"
        type="button"
        aria-label="Ouvrir dossiers"
      >
        <Filter className="w-6 h-6 mx-auto" />
      </button>
    </div>
  );
}
