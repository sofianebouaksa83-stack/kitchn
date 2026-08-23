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
    "h-12 w-12 rounded-2xl inline-flex items-center justify-center transition",
    "ring-1 ring-white/10",
    active
      ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
      : "bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.07]",
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto max-w-3xl px-3 py-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onViewChange("recipes")}
            className={mobileIconBtn(currentView === "recipes")}
            aria-label="Mes recettes"
            title="Mes recettes"
            type="button"
          >
            <BookOpen className="w-6 h-6" />
          </button>

          <button
            onClick={() => onViewChange("shared")}
            className={mobileIconBtn(currentView === "shared")}
            aria-label="Partagées"
            title="Partagées"
            type="button"
          >
            <Share2 className="w-6 h-6" />
          </button>

          <button
            onClick={() => onViewChange("groups")}
            className={mobileIconBtn(currentView === "groups")}
            aria-label="Groupes"
            title="Groupes"
            type="button"
          >
            <Users className="w-6 h-6" />
          </button>

          <button
            onClick={() => onViewChange("import-ai")}
            className={mobileIconBtn(currentView === "import-ai")}
            aria-label="Importer"
            title="Importer"
            type="button"
          >
            <Sparkles className="w-6 h-6" />
          </button>

          <button
            onClick={onOpenAccount}
            className={[
              "h-12 w-12 rounded-2xl inline-flex items-center justify-center transition",
              "ring-1 ring-white/10",
              "bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.07]",
              "relative",
            ].join(" ")}
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
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-[11px] font-bold">
                {invitationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}