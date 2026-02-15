// src/components/Sharing/SharedRecipeGroupDesktop.tsx

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
  Plus,
  Clock,
  Users,
  Tag,
  AlertCircle,
  Folder,
  MoreVertical,
  Heart,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { ui } from "../../styles/ui";
import { RecipeGroupsModal } from "../Recipe/components/RecipeGroupsModal";
import { RecipeDisplay } from "../Recipe/components/RecipeDisplay";
import { PageShell } from "../Layout/PageShell";

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

export function SharedRecipeGroupDesktop({
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

    // ⚠️ 404 si table inexistante côté Supabase
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

    // favoris (table au niveau utilisateur) — ⚠️ 404 si table inexistante
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

  const categories = useMemo(() => {
    const base = recipes.map((r) => r.category || "Sans catégorie");
    const unique = Array.from(new Set(base));
    return ["Toutes", ...unique];
  }, [recipes]);

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

    await supabase
      .from("work_group_folders")
      .update({ name: next })
      .eq("id", folderId);

    await loadFolders();
    setFolderMenuOpenId(null);
  }

  async function handleDeleteFolder(folderId: string) {
    const ok = confirm("Supprimer ce dossier ?");
    if (!ok) return;

    await supabase.from("work_group_folders").delete().eq("id", folderId);

    await supabase
      .from("recipe_folders")
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
      .from("recipe_folders")
      .delete()
      .eq("group_id", groupId)
      .eq("recipe_id", recipeId);

    if (folderId) {
      await supabase.from("recipe_folders").insert({
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
      .from("recipe_folders")
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
    <PageShell>
      <div className={cn(ui.containerWide, "py-8")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-slate-100 truncate">
              Partager
            </div>
            <div className="mt-2 text-sm text-slate-300/70">
              Groupe :{" "}
              <span className="text-slate-100 font-semibold">{groupName}</span>{" "}
              ·{" "}
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
                ← Retour
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-4 xl:col-span-3">
            <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase">
                  Dossiers
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedFolder(null);
                  setShowFavoritesOnly(false);
                }}
                onDrop={(e) => handleDrop(null, e)}
                onDragOver={(e) => e.preventDefault()}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-2xl transition-all duration-200",
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
                }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-200",
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

              <div className="space-y-2">
                {folders.map((f) => (
                  <div key={f.id} className="relative">
                    {/* ✅ FIX: wrapper n'est plus un button */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedFolder(f.id);
                        setShowFavoritesOnly(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedFolder(f.id);
                          setShowFavoritesOnly(false);
                        }
                      }}
                      onDrop={(e) => handleDrop(f.id, e)}
                      onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-2xl flex items-center gap-2 transition cursor-pointer",
                        selectedFolder === f.id
                          ? "bg-white/10 text-slate-100 ring-1 ring-white/10"
                          : "text-slate-300 hover:bg-white/5 hover:text-slate-100"
                      )}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="flex-1 truncate">{f.name}</span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFolderMenuOpenId((prev) =>
                            prev === f.id ? null : f.id
                          );
                        }}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition text-slate-200"
                        aria-label="Options dossier"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {folderMenuOpenId === f.id && (
                      <div
                        ref={folderMenuRef}
                        className="absolute right-2 top-[52px] z-[130] w-48 rounded-2xl bg-[#0B1020] ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.55)] overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => handleRenameFolder(f.id)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/5 transition"
                        >
                          Renommer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFolder(f.id)}
                          className="w-full px-4 py-3 text-left text-sm text-red-200 hover:bg-red-500/10 transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2">
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
                    <button
                      onClick={handleCreateFolder}
                      className={cn(ui.btnPrimary, "h-11 px-4 rounded-2xl")}
                      type="button"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName("");
                      }}
                      className={cn(ui.btnGhost, "h-11 px-4 rounded-2xl")}
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
          </aside>

          {/* Main */}
          <main className="col-span-12 md:col-span-8 xl:col-span-9">
            {/* Search + category */}
            <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/60 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par nom…"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-12 px-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1020]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="text-slate-300/80 text-center py-10">
                  Chargement…
                </div>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRecipes.map((r) => (
                    <div
                      key={r.id}
                      draggable
                      onDragStart={() => handleDragStart(r.id)}
                      className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.30)] overflow-hidden"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setViewingRecipeId(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setViewingRecipeId(r.id);
                          }
                        }}
                        className="p-5 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base font-semibold text-slate-100 truncate">
                              {r.title || "Sans titre"}
                            </div>

                            <div className="mt-3">
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-black/15 ring-1 ring-white/10 text-slate-100">
                                <Tag className="w-3.5 h-3.5" />
                                {r.category || "Sans catégorie"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              void handleToggleFavorite(r.id, !!r.is_favorite);
                            }}
                            className="h-11 w-11 inline-flex items-center justify-center rounded-2xl bg-black/15 ring-1 ring-white/10 hover:bg-black/20 active:scale-[0.98] transition"
                            title="Favori"
                          >
                            <Heart
                              className={cn(
                                "w-5 h-5",
                                r.is_favorite ? "text-red-400" : "text-slate-200"
                              )}
                              fill={r.is_favorite ? "currentColor" : "none"}
                            />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm text-slate-200/80">
                          <div className="inline-flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-300/70" />
                            <span>
                              Prépa {r.prep_time ?? 0}min · Cuisson{" "}
                              {r.cook_time ?? 0}min
                            </span>
                          </div>
                          <div className="text-slate-200/70">
                            {r.servings ?? "—"} couverts
                          </div>
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1">
                        <div className="h-px bg-white/10 mb-4" />

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            className={cn(ui.iconBtn, "h-11 w-11")}
                            title="Voir"
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
                            className={cn(ui.iconBtn, "h-11 w-11")}
                            title="Partager"
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
                            className={cn(ui.iconBtnDanger, "h-11 w-11")}
                            title="Retirer du groupe"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
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
    </PageShell>
  );
}
