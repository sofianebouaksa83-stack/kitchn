import type { SharedRecipeOpen } from "../../features/sharing/types/sharing.types";
import { useIsDesktop } from "../../hooks/useMediaQuery";
import { SharedRecipesDesktop } from "./SharedRecipesDesktop";
import { SharedRecipesMobile } from "./SharedRecipesMobile";

type Props = {
  recipeToOpen?: SharedRecipeOpen | null;
  onRecipeOpened?: () => void;
};

export function SharedRecipes(props: Props) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <SharedRecipesDesktop {...props} />
  ) : (
    <SharedRecipesMobile {...props} />
  );
}