import React, { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  Share2,
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
  Pencil,
  Check,
  ChevronDown,
} from "lucide-react";
import { ui } from "../../../styles/ui";
import {
  demoFoldersByGroup,
  demoGroups,
  demoRecipesByGroup,
  type DemoFolder,
  type DemoGroup,
  type DemoRecipe,
} from "./SharedRecipesDemoData";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function formatQty(qty: number | null, unit: string | null) {
  if (qty === null && !unit) return "—";
  if (qty === null) return unit ?? "—";
  if (!unit) return `${qty}`;
  return `${qty} ${unit}`;
}

type CursorState = {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
};

function FakeMouse({ x, y, visible, clicking }: CursorState) {
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[300] transition-[transform,opacity] duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate(${x}px, ${y}px) scale(${clicking ? 0.94 : 1})`,
      }}
    >
      <div className="relative">
        <svg
          width="24"
          height="30"
          viewBox="0 0 24 30"
          className="drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
        >
          <path
            d="M3 2 L3 24 L8.8 18.7 L12.3 27.2 L16.2 25.5 L12.7 17.4 L20.3 17.2 Z"
            fill="white"
            stroke="#0b1220"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>

        <span
          className={cn(
            "absolute left-[-7px] top-[-6px] h-7 w-7 rounded-full border border-white/45 bg-white/10",
            "transition-all duration-200",
            clicking ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
        />
      </div>
    </div>
  );
}

function RecipeSectionCard({
  title,
  subtitle,
  isOpen = true,
}: {
  title: string;
  subtitle: string;
  isOpen?: boolean;
}) {
  return (
    <div className="rounded-[26px] bg-white/[0.06] ring-1 ring-white/10 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <div className="min-w-0">
          <div className="text-slate-100 font-semibold truncate">{title}</div>
          <div className="text-sm text-slate-300/60 mt-1">{subtitle}</div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-slate-300/70 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </div>
    </div>
  );
}

export function SharedRecipesDemoPanel() {
  const userGroups = useMemo<DemoGroup[]>(() => demoGroups, []);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);

  const [multiplier, setMultiplier] = useState(1);
  const [selectedBase, setSelectedBase] = useState("Manuel (pas d'ingrédient)");
  const [baseValue, setBaseValue] = useState("500");
  const [haveValue, setHaveValue] = useState("");
  const [demoNote, setDemoNote] = useState("");

  const [folders, setFolders] = useState<DemoFolder[]>([]);
  const [recipes, setRecipes] = useState<DemoRecipe[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [draggedRecipe, setDraggedRecipe] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const [moveFolderOpen, setMoveFolderOpen] = useState(false);
  const [moveRecipe, setMoveRecipe] = useState<DemoRecipe | null>(null);

  const [cursor, setCursor] = useState<CursorState>({
    x: 80,
    y: 80,
    visible: false,
    clicking: false,
  });

  const menuRootRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number>(0);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (!selectedGroupId) return;

    const nextFolders = demoFoldersByGroup[selectedGroupId] ?? [];
    const nextRecipes = demoRecipesByGroup[selectedGroupId] ?? [];

    setFolders(nextFolders.map((f) => ({ ...f })));
    setRecipes(nextRecipes.map((r) => ({ ...r })));

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
    setMoveFolderOpen(false);
    setMoveRecipe(null);
    setSelectedBase("Manuel (pas d'ingrédient)");
    setBaseValue("500");
    setHaveValue("");
    setDemoNote("");
  }, [selectedGroupId]);

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

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (moveFolderOpen) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [moveFolderOpen]);

  const selectedGroupName = selectedGroupId
    ? userGroups.find((g) => g.id === selectedGroupId)?.name ?? "Groupe"
    : null;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of recipes) set.add(r.category || "Sans catégorie");
    return ["Toutes", ...Array.from(set)];
  }, [recipes]);

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    recipes.forEach((r) => {
      if (!r.folder_id) return;
      map.set(r.folder_id, (map.get(r.folder_id) ?? 0) + 1);
    });
    return map;
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    const hasSearch = searchTerm.trim().length > 0;

    return recipes.filter((r) => {
      if (showFavoritesOnly && !r.is_favorite) return false;
      if (!hasSearch && selectedFolder && r.folder_id !== selectedFolder) return false;

      if (
        categoryFilter !== "Toutes" &&
        (r.category || "Sans catégorie") !== categoryFilter
      ) {
        return false;
      }

      if (
        hasSearch &&
        !(r.title || "").toLowerCase().includes(searchTerm.trim().toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [recipes, showFavoritesOnly, selectedFolder, categoryFilter, searchTerm]);

  function handleToggleFavorite(recipeId: string) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, is_favorite: !r.is_favorite } : r))
    );
  }

  function handleMoveToFolder(recipeId: string, folderId: string | null) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, folder_id: folderId } : r))
    );
  }

  function handleSelectMoveFolder(folderId: string | null) {
    if (!moveRecipe) return;
    handleMoveToFolder(moveRecipe.id, folderId);
    setMoveFolderOpen(false);
    setMoveRecipe(null);
  }

  function handleRemoveFromGroup(recipeId: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (viewingRecipeId === recipeId) setViewingRecipeId(null);
  }

  function handleRemoveFromFolder(recipeId: string) {
    handleMoveToFolder(recipeId, null);
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
    const next = prompt("Nouveau nom :", current)?.trim();
    if (!next) return;

    setFolders((prev) =>
      prev
        .map((f) => (f.id === folderId ? { ...f, name: next } : f))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setFolderMenuOpenId(null);
  }

  function handleDeleteFolder(folderId: string) {
    const ok = confirm("Supprimer ce dossier ? Les recettes seront retirées du dossier.");
    if (!ok) return;

    setRecipes((prev) =>
      prev.map((r) => (r.folder_id === folderId ? { ...r, folder_id: null } : r))
    );
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
    e.stopPropagation();
    if (!draggedRecipe) return;
    handleMoveToFolder(draggedRecipe, folderId);
    setDraggedRecipe(null);
  }

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  async function moveCursorToTarget(target: string, ox = 0, oy = 0, speed = 700) {
    const el = document.querySelector<HTMLElement>(`[data-demo-target="${target}"]`);
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width * 0.5 + ox;
    const y = rect.top + rect.height * 0.5 + oy;

    setCursor((prev) => ({
      ...prev,
      x,
      y,
      visible: true,
      clicking: false,
    }));

    await wait(speed);
    return true;
  }

  async function clickCursor() {
    setCursor((prev) => ({ ...prev, clicking: true, visible: true }));
    await wait(120);
    setCursor((prev) => ({ ...prev, clicking: false, visible: true }));
    await wait(180);
  }

  async function typeSearch(text: string) {
    setSearchTerm("");
    for (let i = 0; i < text.length; i += 1) {
      setSearchTerm(text.slice(0, i + 1));
      await wait(80);
    }
    await wait(350);
  }

  async function clearSearch() {
    const current = searchTerm;
    for (let i = current.length; i >= 0; i -= 1) {
      setSearchTerm(current.slice(0, i));
      await wait(45);
    }
  }

  async function runLoop() {
    if (cancelRef.current) return;

    loopRef.current += 1;
    const currentLoop = loopRef.current;

    setCursor({ x: 70, y: 70, visible: true, clicking: false });
    setSelectedGroupId(null);
    setViewingRecipeId(null);
    setSelectedFolder(null);
    setShowFavoritesOnly(false);
    setSearchTerm("");
    setCategoryFilter("Toutes");
    setMultiplier(1);
    setDemoNote("");
    setBaseValue("500");
    setHaveValue("");

    await wait(900);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("group-bistro", 0, 0, 900);
    await clickCursor();
    if (cancelRef.current || currentLoop !== loopRef.current) return;
    setSelectedGroupId("bistro");

    await wait(1200);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("favorites-button", 0, 0, 700);
    await clickCursor();
    setShowFavoritesOnly(true);
    setSelectedFolder(null);

    await wait(1100);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("all-recipes-button", 0, 0, 650);
    await clickCursor();
    setShowFavoritesOnly(false);

    await wait(900);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("search-input", -120, 0, 700);
    await clickCursor();
    await typeSearch("carpaccio");
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await wait(500);
    await moveCursorToTarget("recipe-row-r1", 0, 0, 650);
    await clickCursor();
    setViewingRecipeId("r1");

    await wait(1200);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("multiplier-plus", 0, 0, 650);
    await clickCursor();
    setMultiplier(2);

    await wait(900);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    await moveCursorToTarget("recipe-notes", 0, -30, 650);
    await clickCursor();
    setDemoNote("Réserver au frais.\nDressage minute.");
    await wait(900);

    await moveCursorToTarget("recipe-back-button", 0, 0, 700);
    await clickCursor();
    setViewingRecipeId(null);
    setMultiplier(1);
    setDemoNote("");

    await wait(700);
    await clearSearch();

    await wait(1200);
    if (cancelRef.current || currentLoop !== loopRef.current) return;

    void runLoop();
  }

  useEffect(() => {
    cancelRef.current = false;
    void runLoop();

    return () => {
      cancelRef.current = true;
      loopRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!selectedGroupId) {
    const emptyState = userGroups.length === 0;

    return (
      <>
        <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Share2 className="w-5 h-5 text-amber-200" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Partager</h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  Recettes visibles via tes groupes de travail
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Démo animée automatique
                </p>
              </div>
            </div>
          </div>

          {emptyState ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
              <Share2 className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">
                Tu n’es dans aucun groupe pour le moment
              </p>
              <p className="text-sm text-slate-300/70 mt-2">
                Demande une invitation ou crée un groupe.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {userGroups.map((g) => (
                <button
                  key={g.id}
                  data-demo-target={g.id === "bistro" ? "group-bistro" : undefined}
                  onClick={() => setSelectedGroupId(g.id)}
                  type="button"
                  className={[
                    "text-left relative rounded-3xl border ring-1 overflow-hidden",
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
                        <div className="text-lg font-semibold text-slate-100 truncate">
                          {g.name}
                        </div>
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

        <FakeMouse {...cursor} />
      </>
    );
  }

  if (viewingRecipeId) {
    const recipe = recipes.find((x) => x.id === viewingRecipeId);
    const details = recipe?.details;
    const primarySection = details?.sections?.[0];
    const secondarySection = details?.sections?.[1];
    const servingsBase = recipe?.servings ?? 4;

    return (
      <>
        <div className="rounded-[28px] bg-transparent">
          <div className="mb-6">
            <div className="flex items-start gap-4">
              <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                <Tag className="w-5 h-5 text-amber-200" />
              </span>

              <div className="min-w-0">
                <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-slate-100 truncate">
                  {recipe?.title ?? "Recette"}
                </h1>
                <p className="text-sm sm:text-base text-slate-300/70 mt-2">
                  {(recipe?.category ?? "Autre")} · Prép {recipe?.prep_time ?? 0}min · Cuisson{" "}
                  {recipe?.cook_time ?? 0}min
                </p>

                <button
                  data-demo-target="recipe-back-button"
                  type="button"
                  onClick={() => {
                    setViewingRecipeId(null);
                    setMultiplier(1);
                  }}
                  className="mt-4 inline-flex items-center gap-2 text-slate-200 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start">
            <div className="space-y-5">
              <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-5">
                <div className="text-sm text-slate-300/80 mb-3">Multiplier</div>

                <div className="text-slate-100 font-semibold text-lg">x{multiplier}</div>
                <div className="text-sm text-slate-300/60 mt-1">
                  {servingsBase * multiplier} couvert(s) (base {servingsBase})
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
                    className="h-11 w-11 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-slate-100 hover:bg-white/[0.07] transition"
                  >
                    –
                  </button>
                  <button
                    data-demo-target="multiplier-plus"
                    type="button"
                    onClick={() => setMultiplier((m) => m + 1)}
                    className="h-11 w-11 rounded-2xl bg-amber-500/20 ring-1 ring-amber-400/30 text-amber-100 hover:bg-amber-500/25 transition"
                  >
                    +
                  </button>
                </div>

                <div className="h-px bg-white/10 my-5" />

                <div className="text-sm text-slate-300/80 mb-3">Ingrédient de référence</div>
                <div className="h-12 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 flex items-center justify-between text-slate-100">
                  <span className="truncate">{selectedBase}</span>
                  <ChevronDown className="w-4 h-4 text-slate-300/70" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <div className="text-sm text-slate-300/80 mb-2">Base</div>
                    <input
                      value={baseValue}
                      onChange={(e) => setBaseValue(e.target.value)}
                      className="w-full h-12 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 text-slate-100 outline-none"
                    />
                  </div>
                  <div>
                    <div className="text-sm text-slate-300/80 mb-2">J’ai</div>
                    <input
                      value={haveValue}
                      onChange={(e) => setHaveValue(e.target.value)}
                      placeholder="ex: 350"
                      className="w-full h-12 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 text-slate-100 placeholder:text-slate-400/70 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMultiplier(1);
                    setBaseValue("500");
                    setHaveValue("");
                  }}
                  className="mt-4 h-12 w-full rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-slate-100 hover:bg-white/[0.06] transition"
                >
                  Reset
                </button>
              </div>

              <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-5">
                <div className="text-lg font-semibold text-slate-100">Allergènes</div>
                <div className="mt-3 text-sm text-slate-300/70">
                  {details?.allergens && details.allergens.length > 0
                    ? details.allergens.join(" · ")
                    : "—"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {primarySection && (
                <RecipeSectionCard
                  title={primarySection.title}
                  subtitle={`${primarySection.ingredients.length} ingrédient(s) · Étapes`}
                />
              )}

              {secondarySection && (
                <RecipeSectionCard
                  title={secondarySection.title}
                  subtitle={`${secondarySection.ingredients.length} ingrédient(s) · Étapes`}
                />
              )}

              <div
                data-demo-target="recipe-notes"
                className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[26px] font-semibold tracking-tight text-slate-100">
                    Mes notes
                  </div>
                  <div className="text-sm text-slate-300/60">Enregistré</div>
                </div>

                <textarea
                  value={demoNote}
                  onChange={(e) => setDemoNote(e.target.value)}
                  placeholder="Écris tes notes ici..."
                  className="mt-4 min-h-[170px] w-full rounded-[18px] bg-white/[0.03] ring-1 ring-white/10 px-4 py-4 text-slate-100 placeholder:text-slate-400/70 outline-none resize-none"
                />
              </div>

              {primarySection && (
                <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-5">
                  <div className="text-slate-100 font-semibold mb-3">{primarySection.title}</div>
                  <div className="h-px bg-white/10 mb-4" />

                  <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-3">
                    Ingrédients
                  </div>

                  <div className="space-y-2 mb-5">
                    {primarySection.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-sm text-slate-100"
                      >
                        <span className="truncate">{ing.name}</span>
                        <span className="shrink-0 text-slate-300/80">
                          {formatQty(ing.qty ? ing.qty * multiplier : ing.qty, ing.unit)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-3">
                    Étapes
                  </div>

                  <div className="text-sm text-slate-200/90 whitespace-pre-line leading-relaxed">
                    {primarySection.steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
                  </div>
                </div>
              )}

              {secondarySection && (
                <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-5">
                  <div className="text-slate-100 font-semibold mb-3">{secondarySection.title}</div>
                  <div className="h-px bg-white/10 mb-4" />

                  <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-3">
                    Ingrédients
                  </div>

                  <div className="space-y-2 mb-5">
                    {secondarySection.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-sm text-slate-100"
                      >
                        <span className="truncate">{ing.name}</span>
                        <span className="shrink-0 text-slate-300/80">
                          {formatQty(ing.qty ? ing.qty * multiplier : ing.qty, ing.unit)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-semibold tracking-wider text-slate-300/70 uppercase mb-3">
                    Étapes
                  </div>

                  <div className="text-sm text-slate-200/90 whitespace-pre-line leading-relaxed">
                    {secondarySection.steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <FakeMouse {...cursor} />
      </>
    );
  }

  const emptyStateRecipes = recipes.length === 0;
  const emptyStateFiltered = filteredRecipes.length === 0 && !emptyStateRecipes;

  return (
    <>
      <div
        ref={menuRootRef}
        className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7"
      >
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
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Partager</h1>
              </div>

              <p className="text-sm text-slate-300/70 mt-2">
                Groupe : <span className="text-slate-100 font-semibold">{selectedGroupName}</span>
                {" · "}
                <span className="text-slate-100 font-semibold">{filteredRecipes.length}</span>
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Démo animée automatique
              </p>
            </div>
          </div>
        </div>

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
          <div
            className={cn(
              `
              fixed lg:static top-0 left-0 h-full lg:h-auto
              w-80 lg:w-72 rounded-[28px]
              bg-white/[0.06] ring-1 ring-white/10
              shadow-[0_18px_60px_rgba(0,0,0,0.30)]
              backdrop-blur-md p-5
              transform transition-transform duration-300 ease-in-out z-50
            `,
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase">
                Dossiers
              </h3>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setFolderMenuOpenId(null);
                }}
                className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/15 ring-1 ring-white/10 text-slate-200 hover:bg-black/20 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              data-demo-target="all-recipes-button"
              onClick={() => {
                setSelectedFolder(null);
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
                handleDrop(null, e);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-2xl mb-2 transition-all duration-200",
                selectedFolder === null && !showFavoritesOnly
                  ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
              )}
              type="button"
            >
              Toutes les recettes
            </button>

            <button
              data-demo-target="favorites-button"
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
                    selectedFolder === folder.id && !searchTerm.trim()
                      ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                      : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
                  )}
                  type="button"
                >
                  <Folder className="w-4 h-4" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <span className="text-[11px] text-white/40">
                    ({folderCounts.get(folder.id) ?? 0})
                  </span>

                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                    }}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors text-slate-200"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </span>
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

            <div className="mt-4">
              {showNewFolderInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    placeholder="Nom du dossier"
                    className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className={`${ui.btnPrimary} h-11 px-4 rounded-2xl`}
                    type="button"
                  >
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

          <div className="flex-1 min-w-0">
            <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
              <div className="relative" data-demo-target="search-input">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom…"
                  className="w-full h-11 pl-12 pr-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 text-slate-100 outline-none focus:ring-2 focus:ring-amber-400/25"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0B1020]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {emptyStateRecipes ? (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-200 text-lg font-semibold">
                  Aucune recette partagée dans ce groupe
                </p>
                <p className="text-sm text-slate-300/70 mt-2">
                  Les recettes apparaissent ici quand quelqu’un partage.
                </p>
              </div>
            ) : emptyStateFiltered ? (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-200 text-lg font-semibold">Aucune recette trouvée</p>
                <p className="text-sm text-slate-300/70 mt-2">
                  Change tes filtres ou ton dossier.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 border-t border-white/10">
                {filteredRecipes.map((recipe) => {
                  const folderName = recipe.folder_id
                    ? folders.find((f) => f.id === recipe.folder_id)?.name
                    : null;

                  return (
                    <div
                      key={recipe.id}
                      data-demo-target={recipe.id === "r1" ? "recipe-row-r1" : undefined}
                      draggable
                      onDragStart={(e) => handleDragStart(recipe.id, e)}
                      onClick={() => setViewingRecipeId(recipe.id)}
                      className="group cursor-pointer select-none px-4 py-4 transition-colors hover:bg-white/5 active:bg-white/10"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          className="min-w-0 flex-1 text-left"
                          type="button"
                          onClick={() => setViewingRecipeId(recipe.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="min-w-0 truncate text-[15px] font-medium tracking-tight text-slate-100">
                              {recipe.title || "Sans titre"}
                            </h3>
                            {recipe.category && (
                              <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-black/15 ring-1 ring-white/10 text-slate-200/90">
                                {recipe.category}
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-white/50">
                            Prép {recipe.prep_time ?? 0}min · Cuisson {recipe.cook_time ?? 0}min ·{" "}
                            {recipe.servings ?? "—"} couverts
                          </p>

                          {searchTerm.trim() && folderName && (
                            <p className="mt-1 text-[11px] text-white/40">Dossier : {folderName}</p>
                          )}
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(recipe.id);
                            }}
                            className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                            type="button"
                            title="Favori"
                          >
                            <Heart
                              className={`w-5 h-5 ${
                                recipe.is_favorite
                                  ? "fill-red-500 text-red-500"
                                  : "text-white/50"
                              }`}
                            />
                          </button>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingRecipeId(recipe.id);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                              type="button"
                              title="Voir la recette"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                              type="button"
                              title="Modifier la recette"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMoveRecipe(recipe);
                                setMoveFolderOpen(true);
                              }}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors"
                              type="button"
                              title="Déplacer dans un dossier"
                            >
                              <Folder className="w-4 h-4" />
                            </button>

                            {selectedFolder && recipe.folder_id === selectedFolder ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromFolder(recipe.id);
                                }}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-red-300 transition-colors"
                                type="button"
                                title="Retirer du dossier"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : recipe.is_owner ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromGroup(recipe.id);
                                }}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-white/50 hover:text-red-300 transition-colors"
                                type="button"
                                title="Retirer du groupe"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {moveFolderOpen && moveRecipe && (
          <div className="fixed inset-0 z-[140]">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => {
                setMoveFolderOpen(false);
                setMoveRecipe(null);
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-[520px] rounded-[28px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.55)] p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="text-slate-100 font-semibold truncate">
                      Déplacer : {moveRecipe.title || "Sans titre"}
                    </div>
                    <div className="text-xs text-slate-300/70 mt-1">Choisir un dossier</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMoveFolderOpen(false);
                      setMoveRecipe(null);
                    }}
                    className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 text-slate-100 rotate-45" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => handleSelectMoveFolder(null)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left"
                  >
                    <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-white/10 text-slate-200">
                      <Folder className="w-5 h-5" />
                    </span>
                    <span className="flex-1 text-sm font-medium text-slate-100">À la racine</span>
                    {!moveRecipe.folder_id && <Check className="w-4 h-4 text-amber-300" />}
                  </button>

                  {folders.map((folder) => {
                    const active = moveRecipe.folder_id === folder.id;

                    return (
                      <button
                        key={folder.id}
                        type="button"
                        onClick={() => handleSelectMoveFolder(folder.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left"
                      >
                        <span className="h-10 w-10 rounded-2xl inline-flex items-center justify-center bg-white/[0.04] ring-1 ring-white/10 text-slate-200">
                          <Folder className="w-5 h-5" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-slate-100">
                            {folder.name}
                          </span>
                          <span className="block text-xs text-slate-300/60">
                            {folderCounts.get(folder.id) ?? 0} recette
                            {(folderCounts.get(folder.id) ?? 0) > 1 ? "s" : ""}
                          </span>
                        </span>
                        {active && <Check className="w-4 h-4 text-amber-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-24 right-4 h-12 w-12 rounded-2xl bg-white/[0.08] ring-1 ring-white/10 backdrop-blur-md text-slate-100 shadow-xl"
          type="button"
          aria-label="Ouvrir dossiers"
        >
          <Filter className="w-6 h-6 mx-auto" />
        </button>
      </div>

      <FakeMouse {...cursor} />
    </>
  );
}