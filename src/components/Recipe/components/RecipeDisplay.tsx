import React from "react";
import RecipeDisplayMobile from "./RecipeDisplayMobile";
import RecipeDisplayDesktop from "./RecipeDisplayDesktop";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (id: string) => void;
};

export function RecipeDisplay({ recipeId, onBack, onEdit }: Props) {
  return (
    <>
      <div className="lg:hidden">
        <RecipeDisplayMobile recipeId={recipeId} onBack={onBack} onEdit={onEdit} />
      </div>

      <div className="hidden lg:block">
        <RecipeDisplayDesktop recipeId={recipeId} onBack={onBack} onEdit={onEdit} />
      </div>
    </>
  );
}

export default RecipeDisplay;
