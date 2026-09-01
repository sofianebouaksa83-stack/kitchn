import { useIsDesktop } from "../../../hooks/useMediaQuery";
import { RecipeEditorDesktop } from "./RecipeEditorDesktop";
import { RecipeEditorMobile } from "./RecipeEditorMobile";

type Props = {
  recipeId?: string | null;
  onBack?: () => void;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

export function RecipeEditorWithSections(props: Props) {
  const isDesktop = useIsDesktop();

  return isDesktop ? (
    <RecipeEditorDesktop {...props} />
  ) : (
    <RecipeEditorMobile {...props} />
  );
}