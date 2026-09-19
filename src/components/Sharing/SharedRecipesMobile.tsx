import {
  ArrowRight,
  Folder,
  Share2,
} from "lucide-react";

import { useSharedRecipes } from "../../features/sharing/hooks/useSharedRecipes";
import type { SharedRecipeOpen } from "../../features/sharing/types/sharing.types";

import { SharedRecipeGroup } from "./SharedRecipeGroup";
import { KitchNLoader } from "../Loading/KitchNLoader";
import { ui } from "../../styles/ui";

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
      <div
        className={`
          ${ui.dashboardBg}
          flex min-h-[60vh]
          items-center justify-center
        `}
      >
        <KitchNLoader className="kitchn-loader--compact" />
      </div>
    );
  }

  if (selectedGroupId) {
    return (
      <SharedRecipeGroup
        variant="mobile"
        groupId={selectedGroupId}
        groupName={
          selectedGroup?.name ?? "Groupe"
        }
        initialRecipeId={recipeToOpenId}
        onInitialRecipeOpened={
          handleInitialRecipeOpened
        }
        onBack={closeGroup}
      />
    );
  }

  return (
    <div
      className={`
        ${ui.dashboardBg}
        min-h-screen
      `}
    >
      <div className="px-4 pb-28 pt-6">
        {/* HEADER */}
        <div>
          <p
            className="
              mb-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Collaboration
          </p>

          <div className="flex items-start gap-3">
            <div
              className="
                grid h-11 w-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
                ring-1 ring-[#173E31]/8
              "
            >
              <Share2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1
                className="
                  font-serif
                  text-3xl
                  font-semibold
                  leading-tight
                  text-[#173E31]
                "
              >
                Partagées
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  leading-relaxed
                  text-[#718078]
                "
              >
                Recettes accessibles via tes
                groupes.
              </p>
            </div>
          </div>
        </div>

        {/* EMPTY */}
        {groups.length === 0 ? (
          <div
            className="
              mt-7
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-8
              text-center
              shadow-[0_8px_24px_rgba(23,62,49,0.04)]
            "
          >
            <div
              className="
                mx-auto
                grid h-14 w-14
                place-items-center
                rounded-[20px]
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <Share2 className="h-6 w-6" />
            </div>

            <p
              className="
                mt-5
                font-serif
                text-xl
                font-semibold
                text-[#173E31]
              "
            >
              Aucun groupe
            </p>

            <p
              className="
                mt-2
                text-sm
                leading-relaxed
                text-[#718078]
              "
            >
              Les groupes auxquels tu
              participes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() =>
                  openGroup(group.id)
                }
                className="
                  group
                  flex w-full
                  items-center gap-3
                  rounded-[24px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-4
                  text-left
                  shadow-[0_6px_20px_rgba(23,62,49,0.04)]
                  transition
                  active:scale-[0.99]
                "
                type="button"
              >
                {/* FOLDER ICON */}
                <div
                  className="
                    grid h-11 w-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-[#E7EEE8]
                    text-[#184C3A]
                  "
                >
                  <Folder className="h-5 w-5" />
                </div>

                {/* TEXT */}
                <div className="min-w-0 flex-1">
                  <div
                    className="
                      truncate
                      font-serif
                      text-lg
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    {group.name}
                  </div>

                  <div
                    className="
                      mt-1
                      text-sm
                      text-[#718078]
                    "
                  >
                    Ouvrir le groupe
                  </div>
                </div>

                {/* ARROW */}
                <div
                  className="
                    grid h-9 w-9
                    shrink-0
                    place-items-center
                    rounded-full
                    bg-[#F0F2EC]
                    text-[#718078]
                  "
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}