import { Check, Folder, X } from "lucide-react";
import type {
  RecipeFolder,
  RecipeListItem,
} from "../../../features/recipe/types/recipe.types";

type Props = {
  open: boolean;
  recipe: RecipeListItem | null;
  folders: RecipeFolder[];
  folderCounts: ReadonlyMap<string, number>;
  onMoveToFolder: (
    recipeId: string,
    folderId: string | null
  ) => void;
  onClose: () => void;
};

function safeTitle(recipe: RecipeListItem) {
  return recipe.title?.trim() || "Sans titre";
}

export function RecipeMoveFolderDialog({
  open,
  recipe,
  folders,
  folderCounts,
  onMoveToFolder,
  onClose,
}: Props) {
  if (!open || !recipe) return null;
  const recipeId = recipe.id;

  function moveTo(folderId: string | null) {
    onMoveToFolder(recipeId, folderId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[150]">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px] lg:bg-black/60 lg:backdrop-blur-none"
      />

      <div className="absolute inset-x-0 bottom-0 p-4 pb-6 lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-4">
        <div className="mx-auto w-full max-w-[520px] rounded-[28px] border border-amber-300/10 bg-gradient-to-b from-[#0E1736] to-[#0B1020] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.65)] ring-1 ring-amber-400/15 lg:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-100">
                Déplacer : {safeTitle(recipe)}
              </div>
              <div className="mt-1 text-xs text-slate-300/70">
                Choisir un dossier
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-amber-400/15 transition hover:bg-amber-400/10"
            >
              <X className="h-5 w-5 text-slate-100" />
            </button>
          </div>

          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => moveTo(null)}
              className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-left ring-1 ring-amber-400/15 transition hover:bg-white/[0.06]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-200 ring-1 ring-amber-400/15">
                <Folder className="h-5 w-5" />
              </span>

              <span className="flex-1 text-sm font-medium text-slate-100">
                À la racine
              </span>

              {!recipe.folder_id ? (
                <Check className="h-4 w-4 text-amber-300" />
              ) : null}
            </button>

            {folders.map((folder) => {
              const active = recipe.folder_id === folder.id;
              const count = folderCounts.get(folder.id) ?? 0;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => moveTo(folder.id)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-left ring-1 ring-amber-400/15 transition hover:bg-white/[0.06]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-200 ring-1 ring-amber-400/15">
                    <Folder className="h-5 w-5" />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-medium text-slate-100">
                      {folder.name}
                    </span>
                    <span className="block text-xs text-slate-300/60 lg:hidden">
                      {count} recette{count > 1 ? "s" : ""}
                    </span>
                  </span>

                  {active ? (
                    <Check className="h-4 w-4 text-amber-300" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}