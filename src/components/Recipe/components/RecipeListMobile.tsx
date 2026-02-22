import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  AlertCircle,
  Plus,
  X,
  Heart,
  Folder,
  Filter,
  Users,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  MoreVertical,
  Tag,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type IngredientRow = { designation: string | null };

export type RecipeListMobileRecipe = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  is_visible?: boolean;
  is_favorite?: boolean;
  folder_id?: string | null;
  ingredients: IngredientRow[];
};

export type RecipeListMobileFolder = {
  id: string;
  name: string;
};

type Props = {
  userExists: boolean;

  recipesCount: number;
  filteredCount: number;
  filteredRecipes: RecipeListMobileRecipe[];
  categories: string[];
  folders: RecipeListMobileFolder[];

  searchTerm: string;
  onChangeSearch: (v: string) => void;

  categoryFilter: string;
  onChangeCategory: (v: string) => void;

  selectedFolder: string | null;
  showFavoritesOnly: boolean;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  folderMenuOpenId: string | null;
  setFolderMenuOpenId: (id: string | null) => void;
  folderMenuRef: React.RefObject<HTMLDivElement>;

  showNewFolderInput: boolean;
  setShowNewFolderInput: (v: boolean) => void;
  newFolderName: string;
  setNewFolderName: (v: string) => void;

  onCreateNew: () => void;
  onOpenRecipe: (id: string) => void;

  onSelectAll: () => void;
  onSelectFavorites: () => void;
  onSelectFolder: (folderId: string) => void;

  onDropToFolder: (folderId: string | null, e: React.DragEvent) => void;
  onDragStartRecipe: (recipeId: string, e: React.DragEvent) => void;

  onCreateFolder: () => void;
  onRenameFolder: (folderId: string) => void;
  onDeleteFolder: (folderId: string) => void;

  onToggleFavorite: (
    recipeId: string,
    isFav: boolean,
    e: React.MouseEvent
  ) => void;
  onToggleVisibility: (
    recipeId: string,
    isVisible: boolean,
    e: React.MouseEvent
  ) => void;

  onShareToGroup: (recipeId: string, e: React.MouseEvent) => void;
  onDuplicate: (recipe: RecipeListMobileRecipe, e: React.MouseEvent) => void;
  onEdit: (recipeId: string, e: React.MouseEvent) => void;
  onTrash: (recipeId: string, e: React.MouseEvent) => void;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function safeTitle(r?: RecipeListMobileRecipe | null) {
  const t = (r?.title || "").trim();
  return t ? t : "Sans titre";
}

function fmtTime(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v > 0 ? `${v}min` : "0min";
}

function recipeSubtitle(r: RecipeListMobileRecipe) {
  const prep = fmtTime(r.prep_time);
  const cook = fmtTime(r.cook_time);
  return `Prépa ${prep} · Cuisson ${cook}`;
}

/** Chips catégories (horizontal scroll) */
function CategoryChips({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const chips = useMemo(() => {
    const unique = Array.from(new Set(categories.filter(Boolean)));
    if (!unique.includes("Toutes")) return ["Toutes", ...unique];
    return unique;
  }, [categories]);

  return (
    <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
      <div className="flex items-center gap-2 min-w-max pr-2">
        {chips.map((cat) => {
          const active = cat === value;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap",
                "ring-1 transition",
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

function SheetAction({
  icon,
  label,
  tone = "neutral",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl",
        "bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.06] transition text-left",
        tone === "danger" && "hover:bg-red-500/10 ring-red-500/20"
      )}
    >
      <span
        className={cn(
          "h-10 w-10 rounded-2xl inline-flex items-center justify-center",
          tone === "danger"
            ? "bg-red-500/10 ring-1 ring-red-500/20 text-red-200"
            : "bg-white/[0.04] ring-1 ring-white/10 text-slate-200"
        )}
      >
        {icon}
      </span>
      <span className={cn("text-sm font-medium", tone === "danger" ? "text-red-100" : "text-slate-100")}>
        {label}
      </span>
    </button>
  );
}

export function RecipeListMobile(props: Props) {
  const {
    userExists,
    recipesCount,
    filteredCount,
    filteredRecipes,
    categories,
    folders,

    searchTerm,
    onChangeSearch,
    categoryFilter,
    onChangeCategory,

    selectedFolder,
    showFavoritesOnly,

    sidebarOpen,
    setSidebarOpen,

    folderMenuOpenId,
    setFolderMenuOpenId,
    folderMenuRef,

    showNewFolderInput,
    setShowNewFolderInput,
    newFolderName,
    setNewFolderName,

    onCreateNew,
    onOpenRecipe,

    onSelectAll,
    onSelectFavorites,
    onSelectFolder,

    onDropToFolder,
    onDragStartRecipe,

    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,

    onToggleFavorite,
    onToggleVisibility,

    onShareToGroup,
    onDuplicate,
    onEdit,
    onTrash,
  } = props;

  // Bottom-sheet actions (⋯ recette)
  const [sheetRecipe, setSheetRecipe] = useState<RecipeListMobileRecipe | null>(
    null
  );
  const sheetOpen = !!sheetRecipe;
  const closeSheet = () => setSheetRecipe(null);

  // Lock scroll when sidebar/sheet open
  useEffect(() => {
    const shouldLock = sidebarOpen || sheetOpen;
    const prev = document.documentElement.style.overflow;
    if (shouldLock) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [sidebarOpen, sheetOpen]);

  // ESC closes sheet
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  // Header label
  const headerLabel = useMemo(() => {
    if (selectedFolder) return "Dossier";
    if (showFavoritesOnly) return "Favoris";
    return "Toutes";
  }, [selectedFolder, showFavoritesOnly]);

  const headerCount = useMemo(() => {
    if (!userExists) return `${filteredCount}`;
    return `${filteredCount}`;
  }, [filteredCount, userExists]);

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    onCreateFolder();
  }

  return (
    <div className={cn(ui.dashboardBg, "min-h-screen")}>
      {/* Top spacing (évite la navbar) */}
      <div className="px-4 pt-6 pb-28">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-slate-100 tracking-tight">
              Mes recettes
            </div>
            <div className="mt-1 text-sm text-slate-300/80">
              {headerLabel} · <span className="text-slate-100 font-semibold">{headerCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="h-12 w-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
            aria-label="Ouvrir les filtres"
            title="Filtres"
          >
            <Filter className="w-5 h-5 text-slate-100" />
          </button>
        </div>

        {/* CTA Nouvelle recette */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onCreateNew}
            className={cn(
              ui.btnPrimary,
              "w-full h-12 rounded-2xl justify-center"
            )}
          >
            <Plus className="w-5 h-5" />
            Nouvelle recette
          </button>
        </div>

        {/* Search */}
        <div className="mt-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder="Rechercher par nom ou ingrédient…"
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-100 placeholder:text-slate-400/70 outline-none focus:ring-2 focus:ring-amber-400/25"
          />
        </div>

        {/* Category chips */}
        <div className="mt-4">
          <CategoryChips
            categories={categories}
            value={categoryFilter}
            onChange={onChangeCategory}
          />
        </div>

        {/* Content */}
        <div className="mt-6">
          {filteredRecipes.length === 0 ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">
                {recipesCount === 0
                  ? "Aucune recette pour le moment"
                  : "Aucune recette trouvée"}
              </p>
              <p className="text-sm text-slate-300/70 mt-2">
                Crée une recette ou change tes filtres.
              </p>

              {userExists && (
                <div className="mt-6">
                  <button
                    type="button"
                    className={cn(ui.btnPrimary, "h-11 rounded-2xl")}
                    onClick={onCreateNew}
                  >
                    <Plus className="w-5 h-5" />
                    Nouvelle recette
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredRecipes.map((r) => {
                const fav = !!r.is_favorite;
                const visible = r.is_visible !== false;

                return (
                  <div
                    key={r.id}
                    className="group py-4"
                    draggable={false} // IMPORTANT sur mobile (évite les taps foireux iOS)
                    onDrop={(e) => onDropToFolder(r.folder_id ?? null, e)}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Zone cliquable */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onOpenRecipe(r.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") onOpenRecipe(r.id);
                        }}
                        className="min-w-0 flex-1 outline-none"
                      >
                        <div className="text-[15px] font-medium tracking-tight text-white truncate">
                          {r.title || "Sans titre"}
                        </div>

                        <div className="mt-1 text-xs text-white/50 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-white/40" />
                            {r.category || "Autre"}
                          </span>
                                             
                          <span className="text-white/25">•</span>

                          <span>{r.servings ?? "—"} couverts</span>
                        </div>
                      </div>

                      {/* Menu ⋯ */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSheetRecipe(r);
                        }}
                        className="h-9 w-9 rounded-full bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center text-white/60 hover:text-white"
                        aria-label="Actions"
                        title="Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick actions */}
                    <div className="mt-3 flex items-center gap-3 text-white/60">
                      <button
                        type="button"
                        onClick={(e) => onShareToGroup(r.id, e)}
                        className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center hover:text-white"
                        title="Partager"
                      >
                        <Users className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onToggleFavorite(r.id, fav, e)}
                        className={cn(
                          "h-10 w-10 rounded-full transition inline-flex items-center justify-center",
                          fav
                            ? "text-amber-300 hover:bg-amber-400/10"
                            : "hover:bg-white/[0.06] hover:text-white"
                        )}
                        title="Favori"
                      >
                        <Heart className={cn("w-5 h-5", fav && "fill-current")} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => onToggleVisibility(r.id, visible, e)}
                        className="h-10 w-10 rounded-full hover:bg-white/[0.06] transition inline-flex items-center justify-center hover:text-white"
                        title={visible ? "Visible" : "Masquée"}
                      >
                        {visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>

                      <div className="flex-1" />

                      <button
                        type="button"
                        onClick={(e) => onTrash(r.id, e)}
                        className="h-10 w-10 rounded-full hover:bg-red-500/10 transition inline-flex items-center justify-center text-white/60 hover:text-red-200"
                        title="Supprimer"
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

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[120]">
          <div
            className="absolute inset-0 bg-black/55"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[360px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.60)] p-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-100 font-semibold">Dossiers</div>
              <button
                type="button"
                className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-slate-100" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onSelectAll();
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full h-11 px-3 rounded-2xl text-left bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition text-slate-100"
                )}
              >
                Toutes les recettes
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectFavorites();
                  setSidebarOpen(false);
                }}
                className="w-full h-11 px-3 rounded-2xl text-left bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition text-slate-100 inline-flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Mes favoris
              </button>

              <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
                {folders.map((folder) => (
                  <div key={folder.id} className="relative">
                    {/* ✅ wrapper = DIV cliquable, pas button */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onSelectFolder(folder.id);
                        setSidebarOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onSelectFolder(folder.id);
                          setSidebarOpen(false);
                        }
                      }}
                      onDrop={(e) => onDropToFolder(folder.id, e)}
                      onDragOver={(e) => e.preventDefault()}
                      className={cn(
                        "w-full px-3 py-2.5 rounded-2xl flex items-center gap-2 transition-all duration-200 cursor-pointer",
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
                        title="Options"
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
                          onClick={() => onRenameFolder(folder.id)}
                          className="w-full px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/5 transition"
                        >
                          Renommer
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteFolder(folder.id)}
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
          </div>
        </div>
      )}

      {/* Bottom sheet actions */}
      {sheetOpen && sheetRecipe && (
        <div className="fixed inset-0 z-[140]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeSheet}
          />
          <div className="absolute left-0 right-0 bottom-0 p-4 pb-6">
            <div className="mx-auto max-w-[520px] rounded-[28px] bg-[#0B1020] ring-1 ring-white/10 shadow-[0_24px_90px_rgba(0,0,0,0.65)] p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    {safeTitle(sheetRecipe)}
                  </div>
                  <div className="text-xs text-slate-300/70 mt-1 truncate">
                    {sheetRecipe.category || "Autre"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeSheet}
                  className="h-10 w-10 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-slate-100" />
                </button>
              </div>

              <div className="space-y-2">
                <SheetAction
                  icon={<Users className="w-5 h-5" />}
                  label="Partager"
                  onClick={() => {
                    // on crée un faux event pour respecter la signature
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onShareToGroup(sheetRecipe.id, e);
                    closeSheet();
                  }}
                />
                <SheetAction
                  icon={<Copy className="w-5 h-5" />}
                  label="Dupliquer"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onDuplicate(sheetRecipe, e);
                    closeSheet();
                  }}
                />
                <SheetAction
                  icon={<Edit className="w-5 h-5" />}
                  label="Modifier"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onEdit(sheetRecipe.id, e);
                    closeSheet();
                  }}
                />
                <SheetAction
                  icon={<Heart className="w-5 h-5" />}
                  label={sheetRecipe.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onToggleFavorite(sheetRecipe.id, !!sheetRecipe.is_favorite, e);
                    closeSheet();
                  }}
                />
                <SheetAction
                  icon={sheetRecipe.is_visible === false ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  label={sheetRecipe.is_visible === false ? "Rendre visible" : "Masquer"}
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onToggleVisibility(sheetRecipe.id, sheetRecipe.is_visible !== false, e);
                    closeSheet();
                  }}
                />
                <SheetAction
                  icon={<Trash2 className="w-5 h-5" />}
                  label="Supprimer"
                  tone="danger"
                  onClick={() => {
                    const e = { stopPropagation() {} } as unknown as React.MouseEvent;
                    onTrash(sheetRecipe.id, e);
                    closeSheet();
                  }}
                />
              </div>

              <div className="mt-3 text-xs text-slate-400/70">
                Astuce : touche la carte pour ouvrir la recette, et utilise ⋯ pour les actions.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
