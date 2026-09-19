import {
  ArrowRight,
  Folder,
  Share2,
} from "lucide-react";

import { useSharedRecipes } from "../../features/sharing/hooks/useSharedRecipes";
import type { SharedRecipeOpen } from "../../features/sharing/types/sharing.types";

import { ui } from "../../styles/ui";
import { SharedRecipeGroup } from "./SharedRecipeGroup";
import { KitchNLoader } from "../Loading/KitchNLoader";

type Props = {
  recipeToOpen?: SharedRecipeOpen | null;
  onRecipeOpened?: () => void;
};

export function SharedRecipesDesktop({
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
    autoSelectSingleGroup: true,
  });

  if (!loading && selectedGroupId) {
    return (
      <SharedRecipeGroup
        variant="desktop"
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

  const emptyState =
    !loading && groups.length === 0;

  return (
    <div className={ui.dashboardBg}>
      <div
        className={`
          ${ui.containerWide}
          px-4 py-8
          sm:px-6
        `}
      >
        <div className="mx-auto max-w-6xl">
          {/* HEADER */}
          <div className="mb-8">
            <div
              className="
                mb-2
                text-xs font-semibold
                uppercase
                tracking-[0.18em]
                text-[#A8833E]
              "
            >
              Collaboration
            </div>

            <div className="flex items-start gap-4">
              <div
                className="
                  grid h-12 w-12
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
                    text-4xl
                    font-semibold
                    leading-none
                    text-[#173E31]
                  "
                >
                  Partagées
                </h1>

                <p
                  className="
                    mt-3
                    text-sm
                    text-[#718078]
                  "
                >
                  Retrouvez les recettes
                  accessibles via vos groupes
                  de travail.
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <KitchNLoader className="kitchn-loader--compact" />
            </div>
          ) : null}

          {/* EMPTY STATE */}
          {!loading && emptyState ? (
            <div
              className="
                rounded-[30px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-10
                text-center
                shadow-[0_12px_35px_rgba(23,62,49,0.05)]
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
                  text-2xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Aucun groupe pour le moment
              </p>

              <p
                className="
                  mx-auto mt-2
                  max-w-md
                  text-sm
                  leading-relaxed
                  text-[#718078]
                "
              >
                Rejoignez un groupe ou
                acceptez une invitation pour
                retrouver ici les recettes
                partagées.
              </p>
            </div>
          ) : null}

          {/* GROUPS */}
          {!loading && !emptyState ? (
            <div
              className="
                grid grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() =>
                    openGroup(group.id)
                  }
                  title={`Ouvrir ${group.name}`}
                  type="button"
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-[28px]
                    border border-[#173E31]/10
                    bg-[#FBFAF6]
                    p-5
                    text-left
                    shadow-[0_10px_30px_rgba(23,62,49,0.05)]
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:border-[#173E31]/18
                    hover:shadow-[0_16px_40px_rgba(23,62,49,0.08)]
                    active:scale-[0.99]
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        grid h-11 w-11
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-[#E7EEE8]
                        text-[#184C3A]
                        transition
                        group-hover:bg-[#DDE8DF]
                      "
                    >
                      <Folder className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className="
                          truncate
                          font-serif
                          text-xl
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

                    <div
                      className="
                        grid h-9 w-9
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-[#F0F2EC]
                        text-[#718078]
                        transition
                        group-hover:bg-[#E7EEE8]
                        group-hover:text-[#184C3A]
                      "
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>

                  <div
                    className="
                      mt-5
                      h-px
                      bg-[#173E31]/8
                    "
                  />

                  <div
                    className="
                      mt-4
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#A8833E]
                    "
                  >
                    Recettes partagées
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}