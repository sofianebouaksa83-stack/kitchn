import { SharedRecipeGroupDesktop } from "./SharedRecipeGroupDesktop";
import { SharedRecipeGroupMobile } from "./SharedRecipeGroupMobile";

type Props = {
  groupId: string;
  groupName?: string;
  onBack?: () => void;
};

export function SharedRecipeGroup(props: Props) {
  return (
    <>
      <div className="lg:hidden">
        <SharedRecipeGroupMobile {...props} />
      </div>

      <div className="hidden lg:block">
        <SharedRecipeGroupDesktop {...props} />
      </div>
    </>
  );
}
