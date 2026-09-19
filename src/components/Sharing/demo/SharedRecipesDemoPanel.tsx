import { useEffect, useMemo, useRef, useState } from "react";
import {
  Share2,
  Folder,
  Eye,
  Heart,
  Filter,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Search,
  Plus,
  AlertCircle,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  demoFoldersByGroup,
  demoGroups,
  demoRecipesByGroup,
  type DemoFolder,
  type DemoRecipe,
  type DemoSection,
} from "./SharedRecipesDemoData";
import { useIsDesktop } from "../../../hooks/useMediaQuery";

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

function RecipeSectionDetailsCard({
    section,
    multiplier,
  }: {
    section: DemoSection;
    multiplier: number;
  }) {
    return (
      <div className="rounded-[26px] bg-white/[0.05] p-5 ring-1 ring-white/10">
        <div className="mb-3 font-semibold text-slate-100">
          {section.title}
        </div>

        <div className="mb-4 h-px bg-white/10" />

        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300/70">
          Ingrédients
        </div>

        <div className="mb-5 space-y-2">
          {section.ingredients.map((ingredient, index) => (
            <div
              key={`${section.id}-${ingredient.name}-${index}`}
              className="flex items-center justify-between gap-3 text-sm text-slate-100"
            >
              <span className="truncate">{ingredient.name}</span>

              <span className="shrink-0 text-slate-300/80">
                {formatQty(
                  ingredient.qty === null
                    ? null
                    : ingredient.qty * multiplier,
                  ingredient.unit
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300/70">
          Étapes
        </div>

        <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200/90">
          {section.steps
            .map((step, index) => `${index + 1}. ${step}`)
            .join("\n")}
        </div>
      </div>
    );
  }

function RecipeMultiplierCard({
  compact = false,
  open = true,
  onToggle,
  multiplier,
  servingsBase,
  selectedBase,
  baseValue,
  haveValue,
  onBaseValueChange,
  onHaveValueChange,
  onDecrease,
  onIncrease,
  onReset,
}: {
  compact?: boolean;
  open?: boolean;
  onToggle?: () => void;
  multiplier: number;
  servingsBase: number;
  selectedBase: string;
  baseValue: string;
  haveValue: string;
  onBaseValueChange: (value: string) => void;
  onHaveValueChange: (value: string) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}) {
  const showContent = !compact || open;

  return (
    <div
      className={cn(
        compact
          ? "overflow-hidden rounded-3xl bg-white/[0.06] ring-1 ring-white/10"
          : "rounded-[26px] bg-white/[0.05] p-5 ring-1 ring-white/10"
      )}
    >
      {compact ? (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <span className="truncate font-semibold text-slate-100">
            Multiplicateur
          </span>

          {open ? (
            <ChevronUp className="h-5 w-5 text-slate-300/70" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-300/70" />
          )}
        </button>
      ) : (
        <div className="mb-3 text-sm text-slate-300/80">
          Multiplier
        </div>
      )}

      {showContent ? (
        <div className={compact ? "px-4 pb-4" : undefined}>
          {compact ? <div className="mb-4 h-px bg-white/10" /> : null}

          <div
            className={cn(
              compact
                ? "flex items-center justify-between gap-3"
                : undefined
            )}
          >
            <div className="min-w-0">
              {compact ? (
                <div className="text-xs text-slate-300/60">
                  Multiplier
                </div>
              ) : null}

              <div
                className={cn(
                  "font-semibold text-slate-100",
                  compact ? "text-sm" : "text-lg"
                )}
              >
                x{multiplier}
              </div>

              <div
                className={cn(
                  "mt-1 text-slate-300/60",
                  compact ? "text-[12px]" : "text-sm"
                )}
              >
                {servingsBase * multiplier} couvert(s) (base {servingsBase})
              </div>
            </div>

            <div
              className={cn(
                "flex items-center gap-2",
                compact ? undefined : "mt-4"
              )}
            >
              <button
                type="button"
                onClick={onDecrease}
                className={cn(
                  "rounded-2xl bg-white/[0.04] text-slate-100 ring-1 ring-white/10 transition hover:bg-white/[0.07]",
                  compact ? "h-10 w-10" : "h-11 w-11"
                )}
              >
                –
              </button>

              <button
                data-demo-target="multiplier-plus"
                type="button"
                onClick={onIncrease}
                className={cn(
                  "rounded-2xl bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30 transition hover:bg-amber-500/25",
                  compact ? "h-10 w-10" : "h-11 w-11"
                )}
              >
                +
              </button>
            </div>
          </div>

          <div className="my-5 h-px bg-white/10" />

          <div
            className={cn(
              "mb-3 text-slate-300/80",
              compact ? "text-xs" : "text-sm"
            )}
          >
            Ingrédient de référence
          </div>

          <div
            className={cn(
              "flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 text-slate-100 ring-1 ring-white/10",
              compact ? "h-11 text-sm" : "h-12"
            )}
          >
            <span className="truncate">{selectedBase}</span>
            <ChevronDown className="h-4 w-4 text-slate-300/70" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div
                className={cn(
                  "mb-2 text-slate-300/80",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                Base
              </div>

              <input
                type="text"
                value={baseValue}
                onChange={(event) =>
                  onBaseValueChange(event.target.value)
                }
                className={cn(
                  "w-full rounded-2xl bg-white/[0.04] px-4 text-slate-100 outline-none ring-1 ring-white/10",
                  compact ? "h-11" : "h-12"
                )}
              />
            </div>

            <div>
              <div
                className={cn(
                  "mb-2 text-slate-300/80",
                  compact ? "text-xs" : "text-sm"
                )}
              >
                J’ai
              </div>

              <input
                type="text"
                value={haveValue}
                onChange={(event) =>
                  onHaveValueChange(event.target.value)
                }
                placeholder="ex: 350"
                className={cn(
                  "w-full rounded-2xl bg-white/[0.04] px-4 text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-400/70",
                  compact ? "h-11" : "h-12"
                )}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className={cn(
              "mt-4 w-full rounded-2xl bg-white/[0.04] text-slate-100 ring-1 ring-white/10 transition hover:bg-white/[0.06]",
              compact ? "py-3 text-sm" : "h-12"
            )}
          >
            Reset
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SharedRecipesDemoPanel() {
  const isDesktop = useIsDesktop();
  const userGroups = demoGroups;
  const selectedBase = "Manuel (pas d'ingrédient)";

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);

  const [multiplier, setMultiplier] = useState(1);
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



  const [cursor, setCursor] = useState<CursorState>({
    x: 80,
    y: 80,
    visible: false,
    clicking: false,
  });


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
    setBaseValue("500");
    setHaveValue("");
    setDemoNote("");
    setOpenTools(true);
  }, [selectedGroupId]);



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
      <div
        className={cn(
          "h-full min-h-0 w-full overflow-hidden bg-[#0B1332]/95 px-4 pb-6 pt-4",
          "lg:h-auto lg:overflow-visible lg:rounded-[28px] lg:bg-white/[0.06] lg:p-7",
          "lg:ring-1 lg:ring-white/10 lg:shadow-[0_18px_70px_rgba(0,0,0,0.35)] lg:backdrop-blur-md"
        )}
      >
        <div className="lg:hidden">
          <h1 className="text-xl font-semibold text-slate-100">
            Partagées
          </h1>

          <p className="mt-1 text-sm text-slate-300/70">
            Recettes visibles via tes groupes
          </p>
        </div>

        <div className="mb-6 hidden items-start justify-between gap-4 lg:flex">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25">
              <Share2 className="h-5 w-5 text-amber-200" />
            </span>

            <div>
              <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">
                Partager
              </h1>

              <p className="mt-1 text-sm text-slate-300/70">
                Recettes visibles via tes groupes de travail
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Démo animée automatique
              </p>
            </div>
          </div>
        </div>

        {emptyState ? (
          <div className="mt-6 rounded-3xl bg-white/[0.04] p-8 text-center ring-1 ring-white/10 lg:mt-0 lg:p-10">
            <Share2 className="mx-auto mb-4 h-12 w-12 text-slate-500 lg:h-14 lg:w-14" />

            <p className="text-lg font-semibold text-slate-200">
              Tu n’es dans aucun groupe pour le moment
            </p>

            <p className="mt-2 text-sm text-slate-300/70">
              Demande une invitation ou crée un groupe.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 lg:mt-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:space-y-0">
            {userGroups.map((group) => (
              <button
                key={group.id}
                data-demo-target={
                  group.id === "bistro" ? "group-bistro" : undefined
                }
                onClick={() => setSelectedGroupId(group.id)}
                type="button"
                className={cn(
                  "relative w-full rounded-3xl bg-white/[0.06] p-5 text-left ring-1 ring-white/10",
                  "lg:overflow-hidden lg:border lg:border-white/10",
                  "lg:shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                  "lg:transition-transform lg:duration-200",
                  "lg:hover:-translate-y-1 lg:hover:bg-white/[0.08] lg:active:scale-[0.99]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/10 ring-1 ring-white/10">
                    <Folder className="h-5 w-5 text-amber-200" />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-slate-100">
                      {group.name}
                    </div>

                    <div className="text-sm text-slate-300/70">
                      Ouvrir le groupe
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-b from-white/5 to-transparent opacity-60 lg:block" />
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
    const recipe = recipes.find((item) => item.id === viewingRecipeId);
    const details = recipe?.details;
    const sections = details?.sections.slice(0, 2) ?? [];
    const servingsBase = recipe?.servings ?? 4;
    const hasAllergens = Boolean(details?.allergens?.length);

    const closeRecipe = () => {
      setViewingRecipeId(null);
      setMultiplier(1);

      if (!isDesktop) {
        setDemoNote("");
        setOpenTools(true);
      }
    };

    const resetMultiplier = () => {
      setMultiplier(1);
      setBaseValue("500");
      setHaveValue("");
    };

    return (
      <>
        <div className="h-full w-full overflow-hidden bg-transparent lg:h-auto lg:overflow-visible lg:rounded-[28px]">
          <div className="h-full min-h-0 bg-[#0B1332]/95 px-4 pb-4 pt-4 lg:bg-transparent lg:p-0">
            <div className="mb-5 lg:mb-6">
              <div className="flex items-start gap-4">
                <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 lg:grid">
                  <Tag className="h-5 w-5 text-amber-200" />
                </span>

                <div className="min-w-0">
                  <h1 className="truncate text-[18px] font-semibold tracking-tight text-slate-100 lg:text-[28px]">
                    {recipe?.title ?? "Recette"}
                  </h1>

                  <p className="mt-1 truncate text-sm text-slate-300/70 lg:mt-2 lg:whitespace-normal lg:text-base">
                    {recipe?.category ?? "Autre"} · Prép{" "}
                    {recipe?.prep_time ?? 0}min · Cuisson{" "}
                    {recipe?.cook_time ?? 0}min
                  </p>

                  <button
                    data-demo-target="recipe-back-button"
                    type="button"
                    onClick={closeRecipe}
                    className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white lg:text-base lg:text-slate-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar lg:overflow-visible">
              <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[320px_1fr] xl:gap-6">
                <div className="space-y-4 lg:space-y-5">
                  <RecipeMultiplierCard
                    compact={!isDesktop}
                    open={openTools}
                    onToggle={() =>
                      setOpenTools((current) => !current)
                    }
                    multiplier={multiplier}
                    servingsBase={servingsBase}
                    selectedBase={selectedBase}
                    baseValue={baseValue}
                    haveValue={haveValue}
                    onBaseValueChange={setBaseValue}
                    onHaveValueChange={setHaveValue}
                    onDecrease={() =>
                      setMultiplier((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    onIncrease={() =>
                      setMultiplier((current) => current + 1)
                    }
                    onReset={resetMultiplier}
                  />

                  <div
                    className={cn(
                      "rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10",
                      "lg:rounded-[26px] lg:bg-white/[0.05] lg:p-5",
                      !hasAllergens && "hidden lg:block"
                    )}
                  >
                    <div className="mb-2 font-semibold text-slate-100 lg:text-lg">
                      Allergènes
                    </div>

                    <div className="text-sm text-slate-300/80 lg:mt-3 lg:text-slate-300/70">
                      {hasAllergens
                        ? details?.allergens?.join(" · ")
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {sections.map((section) => (
                    <RecipeSectionCard
                      key={section.id}
                      title={section.title}
                      subtitle={`${section.ingredients.length} ingrédient(s) · Étapes`}
                    />
                  ))}

                  <div
                    data-demo-target="recipe-notes"
                    className="rounded-3xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:rounded-[28px] lg:bg-white/[0.06] lg:p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-100 lg:text-[26px] lg:tracking-tight">
                        Mes notes
                      </div>

                      <div className="text-xs text-slate-300/60 lg:text-sm">
                        Enregistré
                      </div>
                    </div>

                    <textarea
                      value={demoNote}
                      onChange={(event) =>
                        setDemoNote(event.target.value)
                      }
                      placeholder="Écris tes notes ici..."
                      className="mt-3 min-h-[140px] w-full resize-none rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-400/70 lg:mt-4 lg:min-h-[170px] lg:rounded-[18px] lg:py-4 lg:text-base"
                    />
                  </div>

                  <div className="hidden space-y-4 lg:block">
                    {sections.map((section) => (
                      <RecipeSectionDetailsCard
                        key={section.id}
                        section={section}
                        multiplier={multiplier}
                      />
                    ))}
                  </div>
                </div>
              </div>
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
      className={cn(
        "h-full min-h-0 w-full overflow-hidden bg-[#0B1332]/95 px-4 pb-24 pt-4",
        "lg:h-auto lg:overflow-visible lg:rounded-[28px] lg:bg-white/[0.06] lg:p-7",
        "lg:ring-1 lg:ring-white/10 lg:shadow-[0_18px_70px_rgba(0,0,0,0.35)] lg:backdrop-blur-md"
      )}
    >
      <div className="flex items-start justify-between gap-3 lg:mb-6">
        <div className="flex items-start gap-4">
          <span className="hidden h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 lg:grid">
            <Share2 className="h-5 w-5 text-amber-200" />
          </span>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">
              Partager
            </h1>

            <div className="mt-1 text-sm text-slate-300/80 lg:hidden">
              {selectedGroupName ?? "Groupe"} ·{" "}
              <span className="font-semibold text-slate-100">
                {filteredRecipes.length}
              </span>
            </div>

            <p className="mt-1 hidden text-sm text-slate-300/70 lg:block">
              Groupe :{" "}
              <span className="font-semibold text-slate-100">
                {selectedGroupName}
              </span>
            </p>

            <p className="mt-2 hidden text-xs text-slate-400 lg:block">
              Démo animée automatique
            </p>

            <button
              type="button"
              onClick={() => setSelectedGroupId(null)}
              className="mt-2 text-sm text-slate-300 transition hover:text-slate-100 lg:hidden"
            >
              ← Retour
            </button>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] ring-1 ring-white/10 transition hover:bg-white/[0.08] lg:hidden"
          aria-label="Ouvrir les filtres"
        >
          <Filter className="h-5 w-5 text-slate-100" />
        </button>

        <button
          type="button"
          onClick={() => setSelectedGroupId(null)}
          className="hidden h-11 rounded-2xl bg-white/[0.05] px-4 text-slate-100 ring-1 ring-white/10 transition hover:bg-white/[0.08] lg:block"
        >
          Retour aux groupes
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-6 lg:mt-0 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <div className="lg:rounded-[26px] lg:bg-white/[0.05] lg:p-4 lg:ring-1 lg:ring-white/10">
            <div
              data-demo-target="search-input"
              className="relative"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300/70 lg:h-4 lg:w-4" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Rechercher par nom…"
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.05] pl-12 pr-4 text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-400/70 focus:ring-2 focus:ring-amber-400/25 lg:h-11 lg:bg-white/[0.04] lg:pl-11"
              />
            </div>

            <div className="mt-3 hidden items-center justify-between gap-2 lg:flex">
              <button
                type="button"
                onClick={() =>
                  setShowFavoritesOnly((current) => !current)
                }
                className={cn(
                  "h-10 rounded-2xl px-4 text-sm ring-1 transition",
                  showFavoritesOnly
                    ? "bg-red-500/15 text-red-200 ring-red-400/25"
                    : "bg-white/[0.04] text-slate-200 ring-white/10"
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
                className="h-10 rounded-2xl bg-white/[0.04] px-4 text-sm text-slate-200 ring-1 ring-white/10"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="hidden rounded-[26px] bg-white/[0.05] p-4 ring-1 ring-white/10 lg:block">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-100">
                Dossiers
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowNewFolderInput((current) => !current)
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-100 ring-1 ring-white/10"
                aria-label="Créer un dossier"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {showNewFolderInput ? (
              <div className="mb-3 flex items-center gap-2">
                <input
                  value={newFolderName}
                  onChange={(event) =>
                    setNewFolderName(event.target.value)
                  }
                  placeholder="Nouveau dossier"
                  className="h-10 flex-1 rounded-2xl bg-white/[0.04] px-4 text-sm text-slate-100 outline-none ring-1 ring-white/10 placeholder:text-slate-400/70"
                />

                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25"
                  aria-label="Valider le dossier"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedFolder(null)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition",
                  selectedFolder === null
                    ? "bg-white/[0.08] text-white ring-1 ring-white/10"
                    : "text-slate-300 hover:bg-white/[0.04]"
                )}
              >
                <span>Toutes</span>
                <span className="text-slate-400">
                  {recipes.length}
                </span>
              </button>

              {folders.map((folder) => (
                <div key={folder.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedFolder(folder.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition",
                      selectedFolder === folder.id
                        ? "bg-white/[0.08] text-white ring-1 ring-white/10"
                        : "text-slate-300 hover:bg-white/[0.04]"
                    )}
                  >
                    <Folder className="h-4 w-4 text-amber-200" />

                    <span className="flex-1 truncate">
                      {folder.name}
                    </span>

                    <span className="text-slate-400">
                      {
                        recipes.filter(
                          (recipe) =>
                            recipe.folder_id === folder.id
                        ).length
                      }
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <div className="overflow-x-auto no-scrollbar lg:overflow-visible">
            <div className="flex min-w-max items-center gap-2 pr-2 lg:mb-4 lg:min-w-0 lg:flex-wrap lg:pr-0">
              {categories.map((category) => {
                const active = categoryFilter === category;

                return (
                  <button
                    key={category}
                    type="button"
                    data-demo-target={
                      category === "Toutes" ? "all-recipes-button" : undefined
                    }
                    onClick={() =>
                      setCategoryFilter(category)
                    }
                    className={cn(
                      "h-10 whitespace-nowrap rounded-full px-4 text-sm font-medium ring-1 transition",
                      active
                        ? "bg-amber-400/20 text-amber-100 ring-amber-300/30"
                        : "bg-white/[0.05] text-slate-200 ring-white/10 hover:bg-white/[0.07] lg:bg-white/[0.04]"
                    )}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            {emptyStateRecipes || emptyStateFiltered ? (
              <div className="rounded-3xl bg-white/[0.04] p-8 text-center ring-1 ring-white/10 lg:rounded-[28px] lg:p-10">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-500 lg:h-14 lg:w-14" />

                <p className="text-lg font-semibold text-slate-200">
                  {emptyStateRecipes
                    ? "Aucune recette partagée dans ce groupe"
                    : "Aucune recette trouvée"}
                </p>

                <p className="mt-2 text-sm text-slate-300/70">
                  {emptyStateRecipes
                    ? "Les recettes apparaissent ici quand quelqu’un partage."
                    : "Change tes filtres ou ton dossier."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10 lg:overflow-hidden lg:rounded-[28px] lg:bg-white/[0.04] lg:ring-1 lg:ring-white/10">
                {filteredRecipes.map((recipe) => {
                  const folderName = recipe.folder_id
                    ? folders.find(
                        (folder) =>
                          folder.id === recipe.folder_id
                      )?.name
                    : null;

                  return (
                    <div
                      key={recipe.id}
                      data-demo-target={
                        recipe.id === "r1"
                          ? "recipe-row-r1"
                          : undefined
                      }
                      className="py-4 lg:px-5 lg:py-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 lg:gap-4">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setViewingRecipeId(recipe.id)
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              setViewingRecipeId(recipe.id);
                            }
                          }}
                          className="min-w-0 flex-1 outline-none"
                        >
                          <div className="truncate text-[15px] font-medium tracking-tight text-white lg:font-semibold lg:text-slate-100">
                            {recipe.title || "Sans titre"}
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs text-white/50 lg:hidden">
                            <Tag className="h-3.5 w-3.5 text-white/40" />
                            {recipe.category || "Autre"}
                          </div>

                          {searchTerm.trim() && folderName ? (
                            <div className="mt-1 text-[11px] text-white/40 lg:hidden">
                              Dossier : {folderName}
                            </div>
                          ) : null}

                          <div className="mt-1 hidden text-sm text-slate-300/70 lg:block">
                            Prép {recipe.prep_time ?? 0}min ·
                            Cuisson {recipe.cook_time ?? 0}min ·{" "}
                            {recipe.servings ?? 0} couverts
                          </div>

                          <div className="mt-2 hidden items-center gap-2 text-xs text-slate-400 lg:flex">
                            <Tag className="h-3.5 w-3.5" />
                            <span>
                              {recipe.category || "Autre"}
                            </span>

                            {searchTerm.trim() && folderName ? (
                              <>
                                <span>•</span>
                                <span>
                                  Dossier : {folderName}
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-white/60 ring-1 ring-white/10 lg:hidden"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        <div className="flex basis-full items-center gap-3 text-white/60 lg:basis-auto lg:gap-2 lg:text-slate-300">
                          <button
                            type="button"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.06]"
                            title="Partager"
                          >
                            <Share2 className="h-5 w-5 lg:h-4 lg:w-4" />
                          </button>

                          <button
                            type="button"
                            data-demo-target={
                              recipe.id === "r1"
                                ? "favorites-button"
                                : undefined
                            }
                            onClick={(event) => {
                              event.stopPropagation();
                              handleToggleFavorite(recipe.id);
                            }}
                            className={cn(
                              "inline-flex h-10 w-10 items-center justify-center rounded-full transition",
                              recipe.is_favorite
                                ? "text-red-500"
                                : "hover:bg-white/[0.06] hover:text-white"
                            )}
                            title="Favori"
                          >
                            <Heart
                              className={cn(
                                "h-5 w-5 lg:h-4 lg:w-4",
                                recipe.is_favorite &&
                                  "fill-current"
                              )}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setViewingRecipeId(recipe.id);
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/[0.06]"
                            title="Voir"
                          >
                            <Eye className="h-5 w-5 lg:h-4 lg:w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              if (
                                selectedFolder &&
                                recipe.folder_id ===
                                  selectedFolder
                              ) {
                                handleRemoveFromFolder(recipe.id);
                              } else if (recipe.is_owner) {
                                handleRemoveFromGroup(recipe.id);
                              }
                            }}
                            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition hover:bg-red-500/10 hover:text-red-200 lg:ml-0 lg:text-slate-300"
                            title={
                              selectedFolder
                                ? "Retirer du dossier"
                                : "Retirer du groupe"
                            }
                          >
                            <Trash2 className="h-5 w-5 lg:h-4 lg:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    <FakeMouse {...cursor} />
  </>
);
}
