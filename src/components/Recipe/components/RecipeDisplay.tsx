// ✅ RecipeDisplay.tsx (refait) + ✅ RecipeDisplayMobile.tsx (nouveau)
// Objectif: séparer Desktop/Mobile, mobile plein écran + sticky actions + accordéons

// =====================================
// 1) RecipeDisplay.tsx  (orchestrateur)
// =====================================
import React from "react";
import RecipeDisplayMobile from "./RecipeDisplayMobile";
import RecipeDisplayDesktop from "./RecipeDisplayDesktop";
import { PageShell } from "../../Layout/PageShell";

type Props = { recipeId: string; onBack: () => void; onEdit?: (id: string) => void };

export function RecipeDisplay({ recipeId, onBack, onEdit }: Props) {
  return (
    <>
      <div className="lg:hidden">
        <RecipeDisplayMobile recipeId={recipeId} onBack={onBack} onEdit={onEdit} />
      </div>
      <div className="hidden lg:block">
        <PageShell withPanel={false}>
          <RecipeDisplayDesktop recipeId={recipeId} onBack={onBack} onEdit={onEdit} desktopMode />
        </PageShell>
      </div>
    </>
  );
}

export default RecipeDisplay;

