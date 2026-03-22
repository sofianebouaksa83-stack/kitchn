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
  ChevronUp,
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
  isOpen = false,
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
  const [openTools, setOpenTools] = useState(true);

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

  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [sheetRecipe, setSheetRecipe] = useState<DemoRecipe | null>(null);

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
    setOpenTools(true);
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
    setOpenTools(true);

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
    setOpenTools(true);

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
    setOpenTools(true);

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
  }, []);

  if (!selectedGroupId) {
    const emptyState = userGroups.length === 0;

    return (
      <>
        {/* MOBILE */}
        <div className="lg:hidden h-full w-full bg-transparent overflow-hidden">
          <div className="h-full min-h-0 bg-[#0B1332]/95 px-0 pt-0 pb-0">
            <div className="h-full min-h-0 px-4 pt-4 pb-6">
              <h1 className="text-xl font-semibold text-slate-100">Partagées</h1>
              <p className="mt-1 text-sm text-slate-300/70">
                Recettes visibles via tes groupes
              </p>

              {emptyState ? (
                <div className="mt-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 text-center">
                  <Share2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-200 text-lg font-semibold">
                    Tu n’es dans aucun groupe pour le moment
                  </p>
                  <p className="text-sm text-slate-300/70 mt-2">
                    Demande une invitation ou crée un groupe.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {userGroups.map((g) => (
                    <button
                      key={g.id}
                      data-demo-target={g.id === "bistro" ? "group-bistro" : undefined}
                      onClick={() => setSelectedGroupId(g.id)}
                      type="button"
                      className="w-full rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                          <Folder className="w-5 h-5 text-amber-200" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-lg font-semibold text-slate-100 truncate">
                            {g.name}
                          </div>
                          <div className="text-sm text-slate-300/70">
                            Ouvrir le groupe
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP — inchangé */}
        <div className="hidden lg:block rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Share2 className="w-5 h-5 text-amber-200" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                  Partager
                </h1>
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
                        <div className="text-sm text-slate-300/70">
                          Ouvrir le groupe
                        </div>
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
        {/* MOBILE */}
        <div className="lg:hidden h-full w-full bg-transparent overflow-hidden">
          <div className="h-full min-h-0 bg-[#0B1332]/95 px-0 pt-0 pb-0">
            <div className="h-full min-h-0 px-4 pt-4 pb-4">
              <div className="mb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-[18px] font-semibold text-slate-100 truncate">
                      {recipe?.title ?? "Recette"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-300/70 truncate">
                      {(recipe?.category ?? "Autre")} · Prép {recipe?.prep_time ?? 0}min ·
                      Cuisson {recipe?.cook_time ?? 0}min
                    </p>
                  </div>
                </div>

                <button
                  data-demo-target="recipe-back-button"
                  type="button"
                  onClick={() => {
                    setViewingRecipeId(null);
                    setMultiplier(1);
                    setDemoNote("");
                    setOpenTools(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar space-y-4">
                <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenTools((prev) => !prev)}
                    className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-slate-100 font-semibold truncate">
                        Multiplicateur
                      </div>
                    </div>

                    <div className="shrink-0 text-slate-300/70">
                      {openTools ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>

                  {openTools ? (
                    <div className="px-4 pb-4">
                      <div className="h-px bg-white/10 mb-4" />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-xs text-slate-300/60">Multiplier</div>
                            <div className="text-sm text-slate-100 font-semibold">
                              x{multiplier}
                            </div>
                            <div className="mt-0.5 text-[12px] text-slate-300/55">
                              {servingsBase * multiplier} couvert(s) (base {servingsBase})
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setMultiplier((m) => Math.max(1, m - 1))}
                              className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                              type="button"
                            >
                              –
                            </button>

                            <button
                              data-demo-target="multiplier-plus"
                              onClick={() => setMultiplier((m) => m + 1)}
                              className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center text-amber-100"
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="h-px bg-white/10" />

                        <div>
                          <div className="text-xs text-slate-300/60 mb-2">
                            Ingrédient de référence
                          </div>

                          <div className="w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-sm text-slate-100 flex items-center justify-between">
                            <span className="truncate">{selectedBase}</span>
                            <ChevronDown className="w-4 h-4 text-slate-300/70" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-slate-300/60">Base</div>
                            <input
                              type="text"
                              value={baseValue}
                              onChange={(e) => setBaseValue(e.target.value)}
                              className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 outline-none"
                            />
                          </div>

                          <div>
                            <div className="text-xs text-slate-300/60">J’ai</div>
                            <input
                              type="text"
                              value={haveValue}
                              onChange={(e) => setHaveValue(e.target.value)}
                              placeholder="ex: 350"
                              className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 placeholder:text-slate-300/40 outline-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setMultiplier(1);
                            setBaseValue("500");
                            setHaveValue("");
                          }}
                          className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                          type="button"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {details?.allergens && details.allergens.length > 0 ? (
                  <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                    <div className="text-slate-100 font-semibold mb-2">Allergènes</div>
                    <div className="text-sm text-slate-300/80">
                      {details.allergens.join(" · ")}
                    </div>
                  </div>
                ) : null}

                {primarySection ? (
                  <RecipeSectionCard
                    title={primarySection.title}
                    subtitle={`${primarySection.ingredients.length} ingrédient(s) · Étapes`}
                  />
                ) : null}

                {secondarySection ? (
                  <RecipeSectionCard
                    title={secondarySection.title}
                    subtitle={`${secondarySection.ingredients.length} ingrédient(s) · Étapes`}
                  />
                ) : null}

                <div
                  data-demo-target="recipe-notes"
                  className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-slate-100 font-semibold">Mes notes</div>
                    <div className="text-xs text-slate-300/60">Enregistré</div>
                  </div>

                  <textarea
                    value={demoNote}
                    onChange={(e) => setDemoNote(e.target.value)}
                    placeholder="Écris tes notes ici..."
                    className="mt-3 min-h-[140px] w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/70 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP — inchangé */}
        <div className="hidden lg:block rounded-[28px] bg-transparent">
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
                  {(recipe?.category ?? "Autre")} · Prép {recipe?.prep_time ?? 0}min ·
                  Cuisson {recipe?.cook_time ?? 0}min
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
                  <div className="text-slate-100 font-semibold mb-3">
                    {primarySection.title}
                  </div>
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
                  <div className="text-slate-100 font-semibold mb-3">
                    {secondarySection.title}
                  </div>
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
      {/* MOBILE */}
      <div className="lg:hidden h-full w-full bg-transparent overflow-hidden">
        <div className="h-full min-h-0 bg-[#0B1332]/95 px-0 pt-0 pb-0">
          <div className="h-full min-h-0 px-4 pt-4 pb-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold text-slate-100 tracking-tight">
                  Partager
                </div>
                <div className="mt-1 text-sm text-slate-300/80">
                  {selectedGroupName ?? "Groupe"} ·{" "}
                  <span className="text-slate-100 font-semibold">
                    {filteredRecipes.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedGroupId(null)}
                  className="mt-2 text-sm text-slate-300 hover:text-slate-100 transition"
                >
                  ← Retour
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="h-12 w-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                aria-label="Ouvrir les filtres"
              >
                <Filter className="w-5 h-5 text-slate-100" />
              </button>
            </div>

            <div className="mt-5 relative" data-demo-target="search-input">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom…"
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
              />
            </div>

            <div className="mt-4">
              <div className="overflow-x-auto [-webkit-overflow-scrolling:touch] no-scrollbar">
                <div className="flex items-center gap-2 min-w-max pr-2">
                  {categories.map((cat) => {
                    const active = categoryFilter === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={cn(
                          "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 transition",
                          active
                            ? "bg-amber-400/20 ring-amber-300/30 text-amber-100"
                            : "bg-white/[0.05] ring-white/10 text-slate-200 hover:bg-white/[0.07]"
                        )}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {emptyStateRecipes ? (
                <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-200 text-lg font-semibold">
                    Aucune recette partagée dans ce groupe
                  </p>
                  <p className="text-sm text-slate-300/70 mt-2">
                    Les recettes apparaissent ici quand quelqu’un partage.
                  </p>
                </div>
              ) : emptyStateFiltered ? (
                <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-200 text-lg font-semibold">
                    Aucune recette trouvée
                  </p>
                  <p className="text-sm text-slate-300/70 mt-2">
                    Change tes filtres ou ton dossier.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filteredRecipes.map((recipe) => {
                    const folderName = recipe.folder_id
                      ? folders.find((f) => f.id === recipe.folder_id)?.name
                      : null;

                    return (
                      <div
                        key={recipe.id}
                        data-demo-target={recipe.id === "r1" ? "recipe-row-r1" : undefined}
                        className="py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewingRecipeId(recipe.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setViewingRecipeId(recipe.id);
                              }
                            }}
                            className="min-w-0 flex-1 outline-none"
                          >
                            <div className="text-[15px] font-medium tracking-tight text-white truncate">
                              {recipe.title || "Sans titre"}
                            </div>

                            <div className="mt-1 text-xs text-white/50 flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-white/40" />
                              {recipe.category || "Autre"}
                            </div>

                            {searchTerm.trim() && folderName && (
                              <div className="mt-1 text-[11px] text-white/40">
                                Dossier : {folderName}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSheetRecipe(recipe);
                            }}
                            className="h-10 w-10 rounded-full bg-white/[0.04] ring-1 ring-white/10 inline-flex items-center justify-center text-white/60"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-3 text-white/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRecipeId(recipe.id);
                              setShowGroupsModal(true);
                            }}
                            className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center"
                            title="Partager"
                          >
                            <Share2 className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            data-demo-target={
                              recipe.id === "r1" ? "favorites-button" : undefined
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(recipe.id);
                            }}
                            className={cn(
                              "h-10 w-10 rounded-full transition inline-flex items-center justify-center",
                              recipe.is_favorite
                                ? "text-red-500"
                                : "hover:bg-white/[0.06] hover:text-white"
                            )}
                            title="Favori"
                          >
                            <Heart
                              className={cn(
                                "w-5 h-5",
                                recipe.is_favorite && "fill-current"
                              )}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingRecipeId(recipe.id);
                            }}
                            className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <div className="flex-1" />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedFolder && recipe.folder_id === selectedFolder) {
                                handleRemoveFromFolder(recipe.id);
                              } else if (recipe.is_owner) {
                                handleRemoveFromGroup(recipe.id);
                              }
                            }}
                            className="h-10 w-10 rounded-full hover:bg-red-500/10 transition inline-flex items-center justify-center text-white/60 hover:text-red-200"
                            title={selectedFolder ? "Retirer du dossier" : "Retirer du groupe"}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP — inchangé */}
      <div
        ref={menuRootRef}
        className="hidden lg:block rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <span className="h-12 w-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <Share2 className="w-5 h-5 text-amber-200" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Partager
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Groupe : <span className="font-semibold text-slate-100">{selectedGroupName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Démo animée automatique
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedGroupId(null)}
            className="h-11 px-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 text-slate-100 hover:bg-white/[0.08] transition"
          >
            Retour aux groupes
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300/70 pointer-events-none" />
                <input
                  data-demo-target="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom..."
                  className="w-full h-11 pl-11 pr-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly((v) => !v)}
                  className={cn(
                    "h-10 px-4 rounded-2xl ring-1 text-sm transition",
                    showFavoritesOnly
                      ? "bg-red-500/15 ring-red-400/25 text-red-200"
                      : "bg-white/[0.04] ring-white/10 text-slate-200"
                  )}
                >
                  Favoris
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFolder(null);
                    setCategoryFilter("Toutes");
                  }}
                  className="h-10 px-4 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-slate-200 text-sm"
                >
                  Réinitialiser
                </button>
              </div>
            </div>

            <div className="rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="text-sm font-semibold text-slate-100">Dossiers</div>
                <button
                  type="button"
                  onClick={() => setShowNewFolderInput((v) => !v)}
                  className="h-9 w-9 rounded-xl bg-white/[0.04] ring-1 ring-white/10 inline-flex items-center justify-center text-slate-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {showNewFolderInput && (
                <div className="mb-3 flex items-center gap-2">
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Nouveau dossier"
                    className="flex-1 h-10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 px-4 text-sm text-slate-100 placeholder:text-slate-400/70 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    className="h-10 w-10 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/25 text-emerald-200 inline-flex items-center justify-center"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedFolder(null)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition",
                    selectedFolder === null
                      ? "bg-white/[0.08] ring-1 ring-white/10 text-white"
                      : "text-slate-300 hover:bg-white/[0.04]"
                  )}
                >
                  <span>Toutes</span>
                  <span className="text-slate-400">{recipes.length}</span>
                </button>

                {folders.map((folder) => (
                  <div key={folder.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setSelectedFolder(folder.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition",
                        selectedFolder === folder.id
                          ? "bg-white/[0.08] ring-1 ring-white/10 text-white"
                          : "text-slate-300 hover:bg-white/[0.04]"
                      )}
                    >
                      <Folder className="w-4 h-4 text-amber-200" />
                      <span className="flex-1 truncate">{folder.name}</span>
                      <span className="text-slate-400">
                        {recipes.filter((r) => r.folder_id === folder.id).length}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {categories.map((cat) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "h-10 px-4 rounded-full text-sm font-medium ring-1 transition",
                      active
                        ? "bg-amber-400/20 ring-amber-300/30 text-amber-100"
                        : "bg-white/[0.04] ring-white/10 text-slate-200 hover:bg-white/[0.06]"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {emptyStateRecipes ? (
              <div className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-200 text-lg font-semibold">
                  Aucune recette partagée dans ce groupe
                </p>
                <p className="text-sm text-slate-300/70 mt-2">
                  Les recettes apparaissent ici quand quelqu’un partage.
                </p>
              </div>
            ) : emptyStateFiltered ? (
              <div className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-200 text-lg font-semibold">
                  Aucune recette trouvée
                </p>
                <p className="text-sm text-slate-300/70 mt-2">
                  Change tes filtres ou ton dossier.
                </p>
              </div>
            ) : (
              <div className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
                <div className="divide-y divide-white/10">
                  {filteredRecipes.map((recipe) => {
                    const folderName = recipe.folder_id
                      ? folders.find((f) => f.id === recipe.folder_id)?.name
                      : null;

                    return (
                      <div
                        key={recipe.id}
                        data-demo-target={recipe.id === "r1" ? "recipe-row-r1" : undefined}
                        className="px-5 py-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewingRecipeId(recipe.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                setViewingRecipeId(recipe.id);
                              }
                            }}
                            className="min-w-0 flex-1"
                          >
                            <div className="text-slate-100 font-semibold truncate">
                              {recipe.title || "Sans titre"}
                            </div>
                            <div className="mt-1 text-sm text-slate-300/70">
                              Prép {recipe.prep_time ?? 0}min · Cuisson {recipe.cook_time ?? 0}min ·{" "}
                              {recipe.servings ?? 0} couverts
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                              <Tag className="w-3.5 h-3.5" />
                              <span>{recipe.category || "Autre"}</span>
                              {searchTerm.trim() && folderName ? (
                                <>
                                  <span>•</span>
                                  <span>Dossier : {folderName}</span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRecipeId(recipe.id);
                                setShowGroupsModal(true);
                              }}
                              className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center text-slate-300"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              data-demo-target={
                                recipe.id === "r1" ? "favorites-button" : undefined
                              }
                              onClick={() => handleToggleFavorite(recipe.id)}
                              className={cn(
                                "h-10 w-10 rounded-full transition inline-flex items-center justify-center",
                                recipe.is_favorite
                                  ? "text-red-500"
                                  : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                              )}
                            >
                              <Heart
                                className={cn("w-4 h-4", recipe.is_favorite && "fill-current")}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => setViewingRecipeId(recipe.id)}
                              className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center text-slate-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (selectedFolder && recipe.folder_id === selectedFolder) {
                                  handleRemoveFromFolder(recipe.id);
                                } else if (recipe.is_owner) {
                                  handleRemoveFromGroup(recipe.id);
                                }
                              }}
                              className="h-10 w-10 rounded-full hover:bg-red-500/10 transition inline-flex items-center justify-center text-slate-300 hover:text-red-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <FakeMouse {...cursor} />
    </>
  );
}