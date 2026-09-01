import { useIsDesktop } from "../../../hooks/useMediaQuery";
import RecipeDisplayDesktop from "./RecipeDisplayDesktop";
import RecipeDisplayMobile from "./RecipeDisplayMobile";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (id: string) => void;
};

export function RecipeDisplay(props: Props) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <RecipeDisplayDesktop {...props} />
  ) : (
    <RecipeDisplayMobile {...props} />
  );
}

export default RecipeDisplay;