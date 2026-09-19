import {
  useMemo,
  useState,
} from "react";

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
} from "lucide-react";

import { ui } from "../../../styles/ui";

import type { RecipeListItem } from "../../../features/recipe/types/recipe.types";
import type { RecipeListSharedProps } from "./RecipeList.types";

import { RecipeMoveFolderDialog } from "./RecipeMoveFolderDialog";

export function RecipeListDesktop(
  props: RecipeListSharedProps,
) {
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
    onMoveToFolder,
  } = props;

  const [
    moveFolderOpen,
    setMoveFolderOpen,
  ] = useState(false);

  const [
    moveRecipe,
    setMoveRecipe,
  ] =
    useState<RecipeListItem | null>(
      null,
    );

  const folderCounts = useMemo(() => {
    const map =
      new Map<string, number>();

    filteredRecipes.forEach(
      (recipe) => {
        if (!recipe.folder_id) return;

        map.set(
          recipe.folder_id,
          (map.get(recipe.folder_id) ??
            0) + 1,
        );
      },
    );

    return map;
  }, [filteredRecipes]);

  const iconButton =
    "inline-flex h-9 w-9 items-center justify-center " +
    "rounded-xl text-[#718078] transition " +
    "hover:bg-[#E7EEE8] hover:text-[#184C3A]";

  return (
    <>
      <div
        className="
          relative
          flex gap-6
        "
      >
        {/* ─────────────────────────
            SIDEBAR DOSSIERS
        ───────────────────────── */}
        <aside
          className="
            sticky top-24
            h-fit w-72 shrink-0
            rounded-[28px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            p-5
            shadow-[0_12px_35px_rgba(23,62,49,0.06)]
          "
        >
          <h3
            className="
              mb-4
              text-xs font-semibold
              uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Dossiers
          </h3>

          {/* ALL */}
          <button
            onClick={onSelectAll}
            onDragOver={(event) => {
              event.preventDefault();

              event.currentTarget.classList.add(
                "ring-2",
                "ring-[#C7A45D]/30",
              );
            }}
            onDragLeave={(event) => {
              event.currentTarget.classList.remove(
                "ring-2",
                "ring-[#C7A45D]/30",
              );
            }}
            onDrop={(event) => {
              event.currentTarget.classList.remove(
                "ring-2",
                "ring-[#C7A45D]/30",
              );

              onDropToFolder(
                null,
                event,
              );
            }}
            className={[
              "mb-2 w-full rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",

              selectedFolder === null &&
              !showFavoritesOnly
                ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
            ].join(" ")}
            type="button"
          >
            Toutes les recettes
          </button>

          {/* FAVORITES */}
          <button
            onClick={onSelectFavorites}
            className={[
              "mb-3 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",

              showFavoritesOnly
                ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
            ].join(" ")}
            type="button"
          >
            <Heart className="h-4 w-4" />
            Mes favoris
          </button>

          <div className="my-4 h-px bg-[#173E31]/8" />

          {/* FOLDERS */}
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="relative"
            >
              <button
                onClick={() =>
                  onSelectFolder(
                    folder.id,
                  )
                }
                onDragOver={(event) => {
                  event.preventDefault();

                  event.currentTarget.classList.add(
                    "ring-2",
                    "ring-[#C7A45D]/30",
                  );
                }}
                onDragLeave={(event) => {
                  event.currentTarget.classList.remove(
                    "ring-2",
                    "ring-[#C7A45D]/30",
                  );
                }}
                onDrop={(event) => {
                  event.currentTarget.classList.remove(
                    "ring-2",
                    "ring-[#C7A45D]/30",
                  );

                  onDropToFolder(
                    folder.id,
                    event,
                  );
                }}
                className={[
                  "mb-2 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200",

                  selectedFolder ===
                  folder.id
                    ? "bg-[#E7EEE8] font-semibold text-[#184C3A]"
                    : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
                ].join(" ")}
                type="button"
              >
                <Folder className="h-4 w-4 shrink-0" />

                <span className="flex-1 truncate">
                  {folder.name}
                </span>

                <span className="text-[11px] text-[#8B9791]">
                  {folderCounts.get(
                    folder.id,
                  ) ?? 0}
                </span>

                <div
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();

                    setFolderMenuOpenId(
                      folderMenuOpenId ===
                        folder.id
                        ? null
                        : folder.id,
                    );
                  }}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      event.stopPropagation();

                      setFolderMenuOpenId(
                        folderMenuOpenId ===
                          folder.id
                          ? null
                          : folder.id,
                      );
                    }
                  }}
                  className="
                    inline-flex
                    h-8 w-8
                    items-center justify-center
                    rounded-xl
                    text-[#718078]
                    transition
                    hover:bg-[#DDE8DF]
                    hover:text-[#184C3A]
                  "
                  title="Options"
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
              </button>

              {folderMenuOpenId ===
                folder.id && (
                <div
                  ref={folderMenuRef}
                  className="
                    absolute right-2 top-[52px]
                    z-50
                    w-48
                    overflow-hidden
                    rounded-2xl
                    border border-[#173E31]/10
                    bg-[#FBFAF6]
                    shadow-[0_18px_45px_rgba(23,62,49,0.14)]
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      onRenameFolder(
                        folder.id,
                      )
                    }
                    className="
                      w-full
                      px-4 py-3
                      text-left
                      text-sm
                      text-[#29493E]
                      transition
                      hover:bg-[#E7EEE8]
                    "
                  >
                    Renommer
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteFolder(
                        folder.id,
                      )
                    }
                    className="
                      w-full
                      px-4 py-3
                      text-left
                      text-sm
                      text-[#A54C48]
                      transition
                      hover:bg-[#F5E4E0]
                    "
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* NEW FOLDER */}
          {userExists && (
            <div className="mt-4">
              {showNewFolderInput ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(event) =>
                      setNewFolderName(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) =>
                      event.key ===
                        "Enter" &&
                      onCreateFolder()
                    }
                    placeholder="Nom du dossier"
                    className={ui.input}
                    autoFocus
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={
                        onCreateFolder
                      }
                      className={`${ui.btnDark} flex-1`}
                      type="button"
                    >
                      Créer
                    </button>

                    <button
                      onClick={() => {
                        setShowNewFolderInput(
                          false,
                        );

                        setNewFolderName(
                          "",
                        );
                      }}
                      className={`${ui.btnGhost} px-4`}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    setShowNewFolderInput(
                      true,
                    )
                  }
                  className="
                    mt-2
                    inline-flex
                    items-center gap-2
                    text-sm font-medium
                    text-[#A8833E]
                    transition-colors
                    hover:text-[#7F632F]
                  "
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  Nouveau dossier
                </button>
              )}
            </div>
          )}
        </aside>

        {/* ─────────────────────────
            CONTENT
        ───────────────────────── */}
        <main className="min-w-0 flex-1">
          {/* SEARCH + CATEGORY */}
          <div
            className="
              mb-5
              grid grid-cols-1
              gap-3
              md:grid-cols-[1fr_220px]
            "
          >
            <div className="relative">
              <Search
                className="
                  pointer-events-none
                  absolute left-4 top-1/2
                  h-5 w-5
                  -translate-y-1/2
                  text-[#718078]
                "
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  onChangeSearch(
                    event.target.value,
                  )
                }
                placeholder="Rechercher par nom ou ingrédient…"
                className="
                  h-12 w-full
                  rounded-2xl
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  pl-12 pr-4
                  text-sm
                  text-[#173E31]
                  placeholder:text-[#8B9791]
                  outline-none
                  transition
                  focus:border-[#C7A45D]/50
                  focus:ring-2
                  focus:ring-[#C7A45D]/20
                "
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                onChangeCategory(
                  event.target.value,
                )
              }
              className="
                h-12 w-full
                rounded-2xl
                border border-[#173E31]/10
                bg-[#FBFAF6]
                px-4
                text-sm font-medium
                text-[#29493E]
                outline-none
                transition
                focus:border-[#C7A45D]/50
                focus:ring-2
                focus:ring-[#C7A45D]/20
              "
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* EMPTY */}
          {filteredRecipes.length ===
          0 ? (
            <div
              className="
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-10
                text-center
              "
            >
              <AlertCircle
                className="
                  mx-auto mb-4
                  h-12 w-12
                  text-[#8B9791]
                "
              />

              <p
                className="
                  font-serif
                  text-xl
                  font-semibold
                  text-[#173E31]
                "
              >
                {recipesCount === 0
                  ? "Aucune recette pour le moment"
                  : "Aucune recette trouvée"}
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  text-[#718078]
                "
              >
                Crée une recette ou
                change tes filtres.
              </p>

              {userExists && (
                <div className="mt-6">
                  <button
                    className={
                      ui.btnPrimary
                    }
                    onClick={
                      onCreateNew
                    }
                    type="button"
                  >
                    <Plus className="h-5 w-5" />
                    Nouvelle recette
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* RECIPES */
            <div className="space-y-3">
              {filteredRecipes.map(
                (recipe) => (
                  <div
                    key={recipe.id}
                    draggable={
                      userExists
                    }
                    onDragStart={(
                      event,
                    ) =>
                      userExists &&
                      onDragStartRecipe(
                        recipe.id,
                        event,
                      )
                    }
                    onClick={() =>
                      onOpenRecipe(
                        recipe.id,
                      )
                    }
                    className="
                      group
                      cursor-pointer
                      select-none
                      rounded-[22px]
                      border border-[#173E31]/10
                      bg-[#FBFAF6]
                      px-5 py-4
                      shadow-[0_6px_18px_rgba(23,62,49,0.035)]
                      transition-all duration-200
                      hover:border-[#173E31]/18
                      hover:bg-[#F7F5EF]
                      hover:shadow-[0_10px_25px_rgba(23,62,49,0.06)]
                    "
                  >
                    <div
                      className="
                        flex items-center
                        justify-between
                        gap-4
                      "
                    >
                      <button
                        className="
                          min-w-0
                          flex-1
                          text-left
                        "
                        type="button"
                        onClick={() =>
                          onOpenRecipe(
                            recipe.id,
                          )
                        }
                      >
                        <div
                          className="
                            flex min-w-0
                            items-center
                            gap-2
                          "
                        >
                          <h3
                            className="
                              min-w-0
                              truncate
                              font-serif
                              text-[17px]
                              font-semibold
                              text-[#173E31]
                            "
                          >
                            {recipe.title ||
                              "Sans titre"}
                          </h3>

                          {recipe.category && (
                            <span
                              className="
                                shrink-0
                                rounded-full
                                bg-[#E7EEE8]
                                px-2.5 py-1
                                text-[11px]
                                font-medium
                                text-[#557064]
                              "
                            >
                              {
                                recipe.category
                              }
                            </span>
                          )}
                        </div>

                        {searchTerm.trim() &&
                          recipe.folder_id && (
                            <p
                              className="
                                mt-1
                                text-[11px]
                                text-[#8B9791]
                              "
                            >
                              Dossier :{" "}
                              {folders.find(
                                (
                                  folder,
                                ) =>
                                  folder.id ===
                                  recipe.folder_id,
                              )?.name ??
                                "—"}
                            </p>
                          )}
                      </button>

                      <div
                        className="
                          flex shrink-0
                          items-center
                          gap-1
                        "
                      >
                        {/* FAVORITE */}
                        <button
                          onClick={(
                            event,
                          ) =>
                            onToggleFavorite(
                              recipe.id,
                              !!recipe.is_favorite,
                              event,
                            )
                          }
                          className={
                            iconButton
                          }
                          type="button"
                          title="Favori"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              recipe.is_favorite
                                ? "fill-[#C96E6A] text-[#C96E6A]"
                                : ""
                            }`}
                          />
                        </button>

                        {/* VISIBILITY */}
                        <button
                          onClick={(
                            event,
                          ) =>
                            onToggleVisibility(
                              recipe.id,
                              recipe.is_visible ??
                                true,
                              event,
                            )
                          }
                          className={
                            iconButton
                          }
                          type="button"
                          title={
                            recipe.is_visible ===
                            false
                              ? "Masquée"
                              : "Visible"
                          }
                        >
                          {recipe.is_visible ===
                          false ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>

                        {userExists && (
                          <div
                            className="
                              flex items-center
                              gap-1
                              opacity-0
                              transition-opacity
                              group-hover:opacity-100
                            "
                          >
                            {/* MOVE */}
                            <button
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                setMoveRecipe(
                                  recipe,
                                );

                                setMoveFolderOpen(
                                  true,
                                );
                              }}
                              className={
                                iconButton
                              }
                              type="button"
                              title="Déplacer dans un dossier"
                            >
                              <Folder className="h-4 w-4" />
                            </button>

                            {/* SHARE */}
                            <button
                              onClick={(
                                event,
                              ) =>
                                onShareToGroup(
                                  recipe.id,
                                  event,
                                )
                              }
                              className={
                                iconButton
                              }
                              title="Partager à un groupe"
                              type="button"
                            >
                              <Users className="h-5 w-5" />
                            </button>

                            {/* DUPLICATE */}
                            <button
                              onClick={(
                                event,
                              ) =>
                                onDuplicate(
                                  recipe,
                                  event,
                                )
                              }
                              className={
                                iconButton
                              }
                              type="button"
                              title="Dupliquer"
                            >
                              <Copy className="h-4 w-4" />
                            </button>

                            {/* EDIT */}
                            <button
                              onClick={(
                                event,
                              ) =>
                                onEdit(
                                  recipe.id,
                                  event,
                                )
                              }
                              className={
                                iconButton
                              }
                              type="button"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* TRASH */}
                            <button
                              onClick={(
                                event,
                              ) =>
                                onTrash(
                                  recipe.id,
                                  event,
                                )
                              }
                              className="
                                inline-flex
                                h-9 w-9
                                items-center
                                justify-center
                                rounded-xl
                                text-[#A86A66]
                                transition
                                hover:bg-[#F5E4E0]
                                hover:text-[#A54C48]
                              "
                              type="button"
                              title={
                                selectedFolder
                                  ? "Retirer du dossier"
                                  : "Supprimer"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </main>
      </div>

      <RecipeMoveFolderDialog
        open={moveFolderOpen}
        recipe={moveRecipe}
        folders={folders}
        folderCounts={folderCounts}
        onMoveToFolder={
          onMoveToFolder
        }
        onClose={() => {
          setMoveFolderOpen(false);
          setMoveRecipe(null);
        }}
      />
    </>
  );
}