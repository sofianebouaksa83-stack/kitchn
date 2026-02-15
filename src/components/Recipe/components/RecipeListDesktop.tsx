import React from "react";
import {
  Search,
  AlertCircle,
  Plus,
  Heart,
  Folder,
  MoreVertical,
  Users,
  Copy,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type IngredientRow = { designation: string | null };

export type RecipeListDesktopRecipe = {
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

export type RecipeListDesktopFolder = {
  id: string;
  name: string;
};

type Props = {
  userExists: boolean;

  recipesCount: number;
  filteredRecipes: RecipeListDesktopRecipe[];
  categories: string[];

  searchTerm: string;
  onChangeSearch: (v: string) => void;

  categoryFilter: string;
  onChangeCategory: (v: string) => void;

  folders: RecipeListDesktopFolder[];
  selectedFolder: string | null;
  showFavoritesOnly: boolean;

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

  onToggleFavorite: (recipeId: string, isFav: boolean, e: React.MouseEvent) => void;
  onToggleVisibility: (recipeId: string, isVisible: boolean, e: React.MouseEvent) => void;

  onShareToGroup: (recipeId: string, e: React.MouseEvent) => void;
  onDuplicate: (recipe: RecipeListDesktopRecipe, e: React.MouseEvent) => void;
  onEdit: (recipeId: string, e: React.MouseEvent) => void;
  onTrash: (recipeId: string, e: React.MouseEvent) => void;
};

export function RecipeListDesktop(props: Props) {
  const {
    userExists,
    recipesCount,
    filteredRecipes,
    categories,

    searchTerm,
    onChangeSearch,
    categoryFilter,
    onChangeCategory,

    folders,
    selectedFolder,
    showFavoritesOnly,

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

  return (
    <div className="flex gap-6 relative">
      {/* Sidebar desktop */}
      <div
        className={[
          "w-72 rounded-[28px] bg-white/[0.06] ring-1 ring-white/10",
          "shadow-[0_18px_60px_rgba(0,0,0,0.30)] backdrop-blur-md p-5",
          "h-fit sticky top-24",
        ].join(" ")}
      >
        <h3 className="text-sm font-semibold tracking-[0.18em] text-slate-200 uppercase mb-4">
          Dossiers
        </h3>

        <button
          onClick={onSelectAll}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-amber-400/25");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
          }}
          onDrop={(e) => {
            e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
            onDropToFolder(null, e);
          }}
          className={[
            "w-full text-left px-3 py-2.5 rounded-2xl mb-2 transition-all duration-200",
            selectedFolder === null && !showFavoritesOnly
              ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
              : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100",
          ].join(" ")}
          type="button"
        >
          Toutes les recettes
        </button>

        <button
          onClick={onSelectFavorites}
          className={[
            "w-full text-left px-3 py-2.5 rounded-2xl mb-3 flex items-center gap-2 transition-all duration-200",
            showFavoritesOnly
              ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
              : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100",
          ].join(" ")}
          type="button"
        >
          <Heart className="w-4 h-4" />
          Mes favoris
        </button>

        <div className="h-px bg-white/10 my-4" />

        {folders.map((folder) => (
          <div key={folder.id} className="relative">
            <button
              onClick={() => onSelectFolder(folder.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("ring-2", "ring-amber-400/25");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("ring-2", "ring-amber-400/25");
                onDropToFolder(folder.id, e);
              }}
              className={[
                "w-full text-left px-3 py-2.5 rounded-2xl mb-2 flex items-center gap-2 transition-all duration-200",
                selectedFolder === folder.id
                  ? "bg-white/[0.08] text-slate-100 ring-1 ring-white/10"
                  : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100",
              ].join(" ")}
              type="button"
            >
              <Folder className="w-4 h-4" />
              <span className="flex-1 truncate">{folder.name}</span>

              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setFolderMenuOpenId((prev) => (prev === folder.id ? null : folder.id));
                  }
                }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors text-slate-200 cursor-pointer"
                title="Options"
              >
                <MoreVertical className="w-5 h-5" />
              </div>
            </button>

            {folderMenuOpenId === folder.id && (
              <div
                ref={folderMenuRef}
                className="absolute right-2 top-[52px] z-50 w-48 rounded-2xl bg-[#0B1020]/95 ring-1 ring-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.35)] overflow-hidden"
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

        {userExists && (
          <div className="mt-4">
            {showNewFolderInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onCreateFolder()}
                  placeholder="Nom du dossier"
                  className="w-full h-11 px-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10
                             text-slate-100 placeholder:text-slate-400/70 outline-none
                             focus:ring-2 focus:ring-amber-400/25"
                  autoFocus
                />
                <button onClick={onCreateFolder} className={`${ui.btnPrimary} h-11 px-4 rounded-2xl`} type="button">
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
        )}
      </div>

      {/* Content desktop */}
      <div className="flex-1 min-w-0">
        {/* Search + filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Rechercher par nom ou ingrédient…"
              className="w-full h-11 pl-12 pr-4 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10
                         text-slate-100 placeholder:text-slate-400/70 outline-none
                         focus:ring-2 focus:ring-amber-400/25"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => onChangeCategory(e.target.value)}
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

        {filteredRecipes.length === 0 ? (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
            <AlertCircle className="w-14 h-14 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-200 text-lg font-semibold">
              {recipesCount === 0 ? "Aucune recette pour le moment" : "Aucune recette trouvée"}
            </p>
            <p className="text-sm text-slate-300/70 mt-2">
              Crée une recette ou change tes filtres.
            </p>
            {userExists && (
              <div className="mt-6">
                <button className={ui.btnPrimary} onClick={onCreateNew} type="button">
                  <Plus className="w-5 h-5" />
                  Nouvelle recette
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                draggable={userExists}
                onDragStart={(e) => userExists && onDragStartRecipe(recipe.id, e)}
                onClick={() => onOpenRecipe(recipe.id)}
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
                        <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">
                          {recipe.title || "Sans titre"}
                        </h3>

                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/15 ring-1 ring-white/10 text-slate-100">
                            {recipe.category || "Sans catégorie"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => onToggleFavorite(recipe.id, !!recipe.is_favorite, e)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors"
                          type="button"
                          title="Favori"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              recipe.is_favorite ? "fill-red-500 text-red-500" : "text-slate-300/70"
                            }`}
                          />
                        </button>

                        <button
                          onClick={(e) => onToggleVisibility(recipe.id, recipe.is_visible ?? true, e)}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 hover:bg-black/15 transition-colors"
                          type="button"
                          title={recipe.is_visible === false ? "Masquée" : "Visible"}
                        >
                          {recipe.is_visible === false ? (
                            <EyeOff className="w-5 h-5 text-slate-300/70" />
                          ) : (
                            <Eye className="w-5 h-5 text-slate-300/70" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300/80">
                        <Clock className="w-4 h-4" />
                        <span>
                          Prép: {recipe.prep_time ?? 0}min · Cuisson: {recipe.cook_time ?? 0}min
                        </span>
                      </div>
                      <div className="text-sm text-slate-300/80">
                        {recipe.servings ?? "—"} couverts
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      {userExists && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => onShareToGroup(recipe.id, e)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800/70 transition-colors"
                            title="Partager à un groupe"
                            type="button"
                          >
                            <Users className="w-5 h-5" />
                          </button>

                          <button
                            onClick={(e) => onDuplicate(recipe, e)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 text-slate-200 hover:bg-black/15 transition-colors"
                            type="button"
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => onEdit(recipe.id, e)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-400/20 text-amber-200 hover:bg-amber-500/15 transition-colors"
                            type="button"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => onTrash(recipe.id, e)}
                            className="h-10 w-10 inline-flex items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-400/20 text-red-200 hover:bg-red-500/15 transition-colors"
                            type="button"
                            title="Supprimer / Retirer du dossier"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
  );
}
