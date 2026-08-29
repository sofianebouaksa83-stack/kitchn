import { Folder } from "lucide-react";
import { useSharedRecipes } from "../../features/sharing/hooks/useSharedRecipes";
import type { SharedRecipeOpen } from "../../features/sharing/types/sharing.types";
import { SharedRecipeGroup } from "./SharedRecipeGroup";
import { KitchNLoader } from "../Loading/KitchNLoader";

type Props = {
  recipeToOpen?: SharedRecipeOpen | null;
  onRecipeOpened?: () => void;
};

export function SharedRecipesMobile({
  recipeToOpen,
  onRecipeOpened,
}: Props) {
  const {
    loading,
    groups,
    selectedGroupId,
    recipeToOpenId,
    selectedGroup,
    openGroup,
    closeGroup,
    handleInitialRecipeOpened,
  } = useSharedRecipes({
    recipeToOpen,
    onRecipeOpened,
    autoSelectSingleGroup: false,
  });

  if (loading) {
    return (
      <KitchNLoader className="kitchn-loader--compact" />
    );
  }

  if (selectedGroupId) {
    return (
      <SharedRecipeGroup
        variant="mobile"
        groupId={selectedGroupId}
        groupName={selectedGroup?.name ?? "Groupe"}
        initialRecipeId={recipeToOpenId}
        onInitialRecipeOpened={
          handleInitialRecipeOpened
        }
        onBack={closeGroup}
      />
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-semibold text-slate-100 mb-2">
        Partagées
      </h1>

      <p className="text-sm text-slate-300/70 mb-6">
        Recettes visibles via tes groupes
      </p>

      <div className="space-y-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => openGroup(group.id)}
            className="w-full rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 text-left"
            type="button"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                <Folder className="w-5 h-5 text-amber-200" />
              </div>

              <div className="min-w-0">
                <div className="text-lg font-semibold text-slate-100 truncate">
                  {group.name}
                </div>

                <div className="text-sm text-slate-300/70">
                  Ouvrir le groupe
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}