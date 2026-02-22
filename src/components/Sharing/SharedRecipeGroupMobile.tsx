import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Search,
    Users,
    AlertCircle,
  Folder,
  MoreVertical,
    Heart,
  Share2,
  Trash2,
  X,
  Filter,
  Plus,
} from "lucide-react";
import { ui } from "../../styles/ui";
import { RecipeGroupsModal } from "../Recipe/components/RecipeGroupsModal";
import { RecipeDisplay } from "../Recipe/components/RecipeDisplay";

type Props = {
  groupId: string;
  groupName?: string;
  onBack?: () => void;
};

type GroupFolder = { id: string; name: string; created_by: string };

type RecipeRow = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  is_favorite?: boolean;
  folder_id?: string | null;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-2 min-w-max pr-2">
        {categories.map((cat) => {
          const active = cat === value;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
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
  );
}

export function SharedRecipeGroupMobile({
  groupId,
  groupName = "Groupe",
  onBack,
}: Props) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [folders, setFolders] = useState<GroupFolder[]>([]);
  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [recipesCount, setRecipesCount] = useState(0);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const [draggedRecipe, setDraggedRecipe] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);

  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null);
  const folderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, user?.id]);

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!folderMenuOpenId) return;
      const target = e.target as Node;
      if (folderMenuRef.current && !folderMenuRef.current.contains(target)) {
        setFolderMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [folderMenuOpenId]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (sidebarOpen) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [sidebarOpen]);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([loadFolders(), loadRecipes()]);
    } finally {
      setLoading(false);
    }
  }

  async function loadFolders() {
    if (!user) return;

    const { data } = await supabase
      .from("work_group_folders")
      .select("id,name,created_by")
      .eq("group_id", groupId)
      .order("name");

    setFolders((data ?? []) as GroupFolder[]);
  }

  async function loadRecipes() {
    if (!user) return;

    const { data, error } = await supabase
      .from("work_group_recipes")
      .select(
        `
        recipes (
          id,
          title,
          category,
          servings,
          prep_time,
          cook_time
        )
      `
      )
      .eq("group_id", groupId);

    if (error) return;

    const list: RecipeRow[] =
      (data ?? [])
        .map((r: any) => r.recipes)
        .filter(Boolean)
        .map((r: any) => ({
          id: String(r.id),
          title: r.title ?? null,
          category: r.category ?? null,
          servings: r.servings ?? null,
          prep_time: r.prep_time ?? null,
          cook_time: r.cook_time ?? null,
        })) ?? [];

    setRecipesCount(list.length);

    // ⚠️ Si tu as encore des 404 ici : table manquante côté Supabase
    const { data: mapData } = await supabase
      .from("work_group_folder_recipes")
      .select("recipe_id, folder_id")
      .eq("group_id", groupId);

    const folderByRecipeId = new Map<string, string | null>();
    for (const row of mapData ?? []) {
      folderByRecipeId.set(
        String((row as any).recipe_id),
        (row as any).folder_id
      );
    }

    const { data: favData } = await supabase
      .from("favorite_recipes")
      .select("recipe_id")
      .eq("user_id", user.id);

    const favSet = new Set((favData ?? []).map((x: any) => String(x.recipe_id)));

    setRecipes(
      list.map((r) => ({
        ...r,
        folder_id: folderByRecipeId.get(String(r.id)) ?? null,
        is_favorite: favSet.has(String(r.id)),
      }))
    );
  }

  const categories = useMemo(
    () => [
      "Toutes",
      ...Array.from(new Set(recipes.map((r) => r.category || "Sans catégorie"))),
    ],
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    return recipes.filter((r) => {
      if (showFavoritesOnly && !r.is_favorite) return false;
      if (selectedFolder && r.folder_id !== selectedFolder) return false;

      if (categoryFilter !== "Toutes") {
        const cat = r.category || "Sans catégorie";
        if (cat !== categoryFilter) return false;
      }

      if (searchTerm.trim()) {
        const t = (r.title || "").toLowerCase();
        if (!t.includes(searchTerm.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [recipes, showFavoritesOnly, selectedFolder, categoryFilter, searchTerm]);

  async function handleCreateFolder() {
    if (!user) return;
    const name = newFolderName.trim();
    if (!name) return;

    const { data, error } = await supabase
      .from("work_group_folders")
      .insert({ group_id: groupId, name, created_by: user.id })
      .select()
      .maybeSingle();

    if (!error && data) {
      setFolders((prev) => {
        const exists = prev.some((f) => f.id === (data as any).id);
        const next = exists ? prev : [...prev, data as GroupFolder];
        return next.slice().sort((a, b) => a.name.localeCompare(b.name));
      });

      setNewFolderName("");
      setShowNewFolderInput(false);
    }
  }

  async function handleRenameFolder(folderId: string) {
    const folder = folders.find((f) => f.id === folderId);
    const next = prompt("Nouveau nom :", folder?.name ?? "");
    if (!next) return;

    await supabase.from("work_group_folders").update({ name: next }).eq("id", folderId);
    await loadFolders();
    setFolderMenuOpenId(null);
  }

  async function handleDeleteFolder(folderId: string) {
    const ok = confirm("Supprimer ce dossier ?");
    if (!ok) return;

    await supabase.from("work_group_folders").delete().eq("id", folderId);
    await supabase
      .from("work_group_folder_recipes")
      .delete()
      .eq("group_id", groupId)
      .eq("folder_id", folderId);

    if (selectedFolder === folderId) setSelectedFolder(null);
    setFolderMenuOpenId(null);
    await loadAll();
  }

  async function handleToggleFavorite(recipeId: string, isFavorite: boolean) {
    if (!user) return;

    if (isFavorite) {
      await supabase
        .from("favorite_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
    } else {
      await supabase
        .from("favorite_recipes")
        .insert({ user_id: user.id, recipe_id: recipeId });
    }

    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, is_favorite: !isFavorite } : r))
    );
  }

  async function handleMoveToFolder(recipeId: string, folderId: string | null) {
    if (!user) return;

    await supabase
      .from("work_group_folder_recipes")
      .delete()
      .eq("group_id", groupId)
      .eq("recipe_id", recipeId);

    if (folderId) {
      await supabase.from("work_group_folder_recipes").insert({
        group_id: groupId,
        recipe_id: recipeId,
        folder_id: folderId,
      });
    }

    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, folder_id: folderId } : r))
    );
  }

  async function handleRemoveFromGroup(recipeId: string) {
    const ok = confirm("Retirer cette recette du groupe ?");
    if (!ok) return;

    await supabase
      .from("work_group_recipes")
      .delete()
      .eq("group_id", groupId)
      .eq("recipe_id", recipeId);

    await supabase
      .from("work_group_folder_recipes")
      .delete()
      .eq("group_id", groupId)
      .eq("recipe_id", recipeId);

    await loadRecipes();
  }

  function handleDragStart(recipeId: string) {
    setDraggedRecipe(recipeId);
  }

  async function handleDrop(folderId: string | null, e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedRecipe) return;
    await handleMoveToFolder(draggedRecipe, folderId);
    setDraggedRecipe(null);
  }

  if (viewingRecipeId) {
    return (
      <RecipeDisplay
        recipeId={viewingRecipeId}
        onBack={() => setViewingRecipeId(null)}
      />
    );
  }

  return (
    <div className="relative px-4 pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-2">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-slate-100 truncate">
            Partagées
          </div>
          <div className="mt-2 text-sm text-slate-300/70">
            {groupName} ·{" "}
            <span className="text-slate-100 font-semibold">
              {filteredRecipes.length}
            </span>
          </div>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-3 text-sm text-slate-200 hover:text-slate-100 transition"
            >
              ← Retour aux groupes
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSidebarOpen(true);
            setFolderMenuOpenId(null);
          }}
          className="shrink-0 h-12 w-12 inline-flex items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 text-slate-100 hover:bg-white/[0.08] active:scale-[0.98] transition"
          aria-label="Ouvrir filtres"
          title="Filtres"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/60 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom…"
            className="w-full h-14 pl-12 pr-4 rounded-3xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
          />
        </div>
      </div>

      {/* Chips categories */}
      <div className="mt-5">
        <CategoryChips
          categories={categories}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {/* Drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[110] bg-black/70"
          onClick={() => {
            setSidebarOpen(false);
            setFolderMenuOpenId(null);
          }}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-[120] h-full w-[340px] max-w-[88vw]",
          "rounded-r-[28px]",
          "bg-[#0B1020] ring-1 ring-white/10",
          "shadow-[0_18px_70px_rgba(0,0,0,0.55)]",
          "p-5 transition-transform duration-300 ease-in-out will-change-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
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
            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-slate-200 hover:bg-white/10 transition-colors"
            aria-label="Fermer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            setSelectedFolder(null);
            setShowFavoritesOnly(false);
            setSidebarOpen(false);
          }}
          onDrop={(e) => handleDrop(null, e)}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-2xl mb-2 transition-all duration-200",
            !selectedFolder && !showFavoritesOnly
              ? "bg-white/10 text-slate-100 ring-1 ring-white/10"
              : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
          )}
          type="button"
        >
          Toutes les recettes
        </button>

        <button
          onClick={() => {
            setShowFavoritesOnly(true);
            setSelectedFolder(null);
            setSidebarOpen(false);
          }}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-2xl mb-3 flex items-center gap-2 transition-all duration-200",
            showFavoritesOnly
              ? "bg-white/10 text-slate-100 ring-1 ring-white/10"
              : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
          )}
          type="button"
        >
          <Heart className="w-4 h-4" />
          Mes favoris
        </button>

        <div className="h-px bg-white/10 my-4" />

        {/* ✅ FIX ici : plus de button dans button */}
        <div className="space-y-2">
          {folders.map((folder) => (
            <div key={folder.id} className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setShowFavoritesOnly(false);
                  setSidebarOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedFolder(folder.id);
                    setShowFavoritesOnly(false);
                    setSidebarOpen(false);
                  }
                }}
                onDrop={(e) => handleDrop(folder.id, e)}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-200 cursor-pointer",
                  selectedFolder === folder.id
                    ? "bg-white/10 text-slate-100 ring-1 ring-white/10"
                    : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                )}
              >
                <Folder className="w-4 h-4" />
                <span className="flex-1 truncate">{folder.name}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFolderMenuOpenId((prev) =>
                      prev === folder.id ? null : folder.id
                    );
                  }}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-slate-200"
                  aria-label="Options dossier"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {folderMenuOpenId === folder.id && (
                <div
                  ref={folderMenuRef}
                  className="absolute right-2 top-[52px] z-[130] w-48 rounded-2xl bg-[#0B1020] ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                >
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
        </div>

        <div className="mt-4">
          {showNewFolderInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Nom du dossier"
                className="w-full h-11 px-4 rounded-2xl bg-white/5 ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none"
                autoFocus
              />
              <button onClick={handleCreateFolder} className={ui.btnPrimary} type="button">
                ✓
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName("");
                }}
                className={ui.btnGhost}
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
      <div className="mt-10">
        {loading ? (
          <div className="text-slate-300/80 text-center py-10">Chargement…</div>
        ) : filteredRecipes.length === 0 ? (
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
          <div className="mt-2 -mx-4">
            {filteredRecipes.map((r, idx) => (
              <div
                key={r.id}
                className={cn(
                  "group px-4 py-4 border-white/10 transition-colors",
                  "hover:bg-white/[0.05] active:bg-white/[0.07]",
                  idx === filteredRecipes.length - 1 ? "" : "border-b"
                )}
                onClick={() => setViewingRecipeId(r.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium tracking-tight text-slate-100 truncate">
                      {r.title || "Sans titre"}
                    </div>

                    <div className="mt-1 text-xs text-slate-300/60">
                      {(r.category || "Sans catégorie")} • Prép {r.prep_time ?? 0}min / {r.cook_time ?? 0}min • {r.servings ?? "—"} couverts
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleToggleFavorite(r.id, !!r.is_favorite);
                    }}
                    className="shrink-0 h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10 text-slate-200 hover:bg-white/[0.06] active:scale-[0.98] transition"
                    title="Favori"
                    aria-label="Favori"
                  >
                    <Heart
                      className={cn(
                        "w-4.5 h-4.5",
                        r.is_favorite ? "text-amber-300" : "text-slate-200/80"
                      )}
                      fill={r.is_favorite ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 text-slate-200/70">
                  <button
                    type="button"
                    className={cn(ui.iconBtn, "h-10 w-10")}
                    title="Ouvrir"
                    aria-label="Ouvrir"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewingRecipeId(r.id);
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className={cn(ui.iconBtn, "h-10 w-10")}
                    title="Partager"
                    aria-label="Partager"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveRecipeId(r.id);
                      setShowGroupsModal(true);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    className={cn(ui.iconBtn, "h-10 w-10")}
                    title="Déplacer"
                    aria-label="Déplacer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDraggedRecipe(r.id);
                      setSidebarOpen(true);
                    }}
                  >
                    <Folder className="w-4 h-4" />
                  </button>

                  <div className="flex-1" />

                  <button
                    type="button"
                    className={cn(ui.iconBtnDanger, "h-10 w-10")}
                    title="Retirer du groupe"
                    aria-label="Retirer du groupe"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleRemoveFromGroup(r.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RecipeGroupsModal
        open={showGroupsModal}
        recipeId={activeRecipeId}
        onClose={() => {
          setShowGroupsModal(false);
          setActiveRecipeId(null);
        }}
      />
    </div>
  );
}
