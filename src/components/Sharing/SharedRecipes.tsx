import { SharedRecipesDesktop } from "./SharedRecipesDesktop";
import { SharedRecipesMobile } from "./SharedRecipesMobile";

type SharedRecipesProps = {
  recipeToOpen?: {
    recipeId: string;
    groupId: string;
  } | null;
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
