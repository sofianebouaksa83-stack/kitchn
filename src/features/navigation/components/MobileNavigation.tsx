import {
  BookOpen,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import type { View } from "../../../app/routes";
import { NavbarAvatar } from "./NavbarAvatar";

type MobileNavigationProps = {
  currentView: View;
  onViewChange: (view: View) => void;
  avatarUrl: string | null;
  avatarFallback: string;
  invitationCount: number;
  onOpenAccount: () => void;
};

function mobileIconBtn(active: boolean) {
  return [
    "h-12 w-12 rounded-[18px]",
    "inline-flex items-center justify-center",
    "transition-all duration-200",
    active
      ? [
          "bg-[#E7EEE8]",
          "text-[#184C3A]",
          "ring-1 ring-[#184C3A]/10",
        ].join(" ")
      : [
          "bg-transparent",
          "text-[#718078]",
          "hover:bg-[#F0F2EC]",
          "hover:text-[#184C3A]",
        ].join(" "),
  ].join(" ");
}

export function MobileNavigation({
  currentView,
  onViewChange,
  avatarUrl,
  avatarFallback,
  invitationCount,
  onOpenAccount,
}: MobileNavigationProps) {
  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t border-[#173E31]/10
        bg-[#FBFAF6]/95
        backdrop-blur-xl
        shadow-[0_-8px_30px_rgba(23,62,49,0.06)]
        lg:hidden
      "
    >
      <div className="mx-auto max-w-3xl px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              onViewChange("recipes")
            }
            className={mobileIconBtn(
              currentView === "recipes",
            )}
            aria-label="Mes recettes"
            title="Mes recettes"
            type="button"
          >
            <BookOpen className="h-6 w-6" />
          </button>

          <button
            onClick={() =>
              onViewChange("shared")
            }
            className={mobileIconBtn(
              currentView === "shared",
            )}
            aria-label="Partagées"
            title="Partagées"
            type="button"
          >
            <Share2 className="h-6 w-6" />
          </button>

          <button
            onClick={() =>
              onViewChange("groups")
            }
            className={mobileIconBtn(
              currentView === "groups",
            )}
            aria-label="Groupes"
            title="Groupes"
            type="button"
          >
            <Users className="h-6 w-6" />
          </button>

          <button
            onClick={() =>
              onViewChange("import-ai")
            }
            className={mobileIconBtn(
              currentView === "import-ai",
            )}
            aria-label="Importer"
            title="Importer"
            type="button"
          >
            <Sparkles className="h-6 w-6" />
          </button>

          <button
            onClick={onOpenAccount}
            className="
              relative inline-flex
              h-12 w-12
              items-center justify-center
              rounded-[18px]
              bg-[#F0F2EC]
              ring-1 ring-[#173E31]/8
              transition
              hover:bg-[#E7EEE8]
            "
            aria-label="Compte"
            title="Compte"
            type="button"
          >
            <NavbarAvatar
              avatarUrl={avatarUrl}
              fallback={avatarFallback}
              size="h-9 w-9"
            />

            {invitationCount > 0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  inline-flex h-[18px]
                  min-w-[18px]
                  items-center justify-center
                  rounded-full
                  bg-[#C7A45D]
                  px-1
                  text-[11px] font-bold
                  text-[#173E31]
                "
              >
                {invitationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}