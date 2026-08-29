import { SharedRecipeGroupDesktopView } from "./SharedRecipeGroupDesktopView";
import { SharedRecipeGroupMobileView } from "./SharedRecipeGroupMobileView";

type Props = {
  variant: "mobile" | "desktop";
  groupId: string;
  groupName?: string;
  onBack?: () => void;
  onEdit?: (recipeId: string) => void;
  initialRecipeId?: string | null;
  onInitialRecipeOpened?: () => void;
};

export function SharedRecipeGroup({
  variant,
  ...props
}: Props) {
  if (variant === "mobile") {
    return <SharedRecipeGroupMobileView {...props} />;
  }

  return <SharedRecipeGroupDesktopView {...props} />;
}