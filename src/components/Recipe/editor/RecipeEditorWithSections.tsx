import React from "react";
import { RecipeEditorMobile } from "./RecipeEditorMobile";
import { RecipeEditorDesktop } from "./RecipeEditorDesktop";

type Props = {
  recipeId?: string | null;
  onBack?: () => void;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

export function RecipeEditorWithSections(props: Props) {
  return (
    <>
      <div className="lg:hidden">
        <RecipeEditorMobile {...props} />
      </div>

      <div className="hidden lg:block">
        <RecipeEditorDesktop {...props} />
      </div>
    </>
  );
}
