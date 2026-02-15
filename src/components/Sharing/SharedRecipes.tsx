import { SharedRecipesDesktop }  from "./SharedRecipesDesktop";
import { SharedRecipesMobile }  from "./SharedRecipesMobile";

export function SharedRecipes() {
  return (
    <>
      <div className="lg:hidden">
        <SharedRecipesMobile />
      </div>

      <div className="hidden lg:block">
        <SharedRecipesDesktop />
      </div>
    </>
  );
}
