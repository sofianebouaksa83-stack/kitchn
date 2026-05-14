import { SharedRecipesDesktop } from "./SharedRecipesDesktop";
import { SharedRecipesMobile } from "./SharedRecipesMobile";

export type SharedRecipeToOpen = {
  recipeId: string;
  groupId: string;
} | null;

type SharedRecipesProps = {
  recipeToOpen?: SharedRecipeToOpen;
  onRecipeOpened?: () => void;
};

export function SharedRecipes({ recipeToOpen, onRecipeOpened }: SharedRecipesProps) {
  return (
    <>
      <div className="lg:hidden">
        <SharedRecipesMobile
          recipeToOpen={recipeToOpen}
          onRecipeOpened={onRecipeOpened}
        />
      </div>

      <div className="hidden lg:block">
        <SharedRecipesDesktop
          recipeToOpen={recipeToOpen}
          onRecipeOpened={onRecipeOpened}
        />
      </div>
    </>
  );
}
