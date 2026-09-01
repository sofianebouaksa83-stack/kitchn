import type { Ref } from "react";
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Mail,
  Settings,
  Users2,
} from "lucide-react";
import { InvitationBadge } from "./InvitationBadge";
import { NavbarAvatar } from "./NavbarAvatar";

type DesktopAccountMenuProps = {
  menuRef: Ref<HTMLDivElement>;
  open: boolean;
  displayName: string;
  email?: string;
  avatarUrl: string | null;
  avatarFallback: string;
  invitationCount: number;
  isPremium: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onOpenInvitations: () => void;
  onOpenTeam: () => void;
  onOpenSubscription: () => void;
  onOpenAssistance: () => void;
  onSignOut: () => void;
};

const dropdownItem =
  "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-sm " +
  "text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition " +
  "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40";

const left = "flex items-center gap-2.5 min-w-0";

const sectionTitle =
  "px-4 pt-3 pb-1 text-[11px] tracking-wide uppercase text-white/40";

export function DesktopAccountMenu({
  menuRef,
  open,
  displayName,
  email,
  avatarUrl,
  avatarFallback,
  invitationCount,
  isPremium,
  onToggle,
  onOpenSettings,
  onOpenInvitations,
  onOpenTeam,
  onOpenSubscription,
  onOpenAssistance,
  onSignOut,
}: DesktopAccountMenuProps) {
  return (
    <div className="hidden lg:flex items-center gap-3 ml-auto">
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={onToggle}
          className={[
            "flex items-center gap-3 rounded-2xl px-3 py-2",
            "bg-white/[0.04] hover:bg-white/[0.09] transition",
            "ring-1",
            open
              ? "ring-amber-400/30"
              : "ring-white/10 hover:ring-white/15",
          ].join(" ")}
          aria-label="Compte"
        >
          <NavbarAvatar
            avatarUrl={avatarUrl}
            fallback={avatarFallback}
          />

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-white truncate max-w-[220px]">
              {displayName}

              {isPremium && (
                <img
                  src="/toque-premium.png"
                  alt="Premium"
                  className="w-4 h-4 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                />
              )}
            </div>

            <div className="text-xs text-white/60 truncate max-w-[220px]">
              {email}
            </div>
          </div>

          {invitationCount > 0 && (
            <span className="ml-1 min-w-[22px] h-5 px-2 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-[11px] font-bold">
              {invitationCount}
            </span>
          )}
        </button>

        <div
          className={[
            "absolute right-0 mt-3 w-[320px] origin-top-right z-50",
            "transition duration-150 ease-out",
            open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-[0.98] -translate-y-1 pointer-events-none",
          ].join(" ")}
        >
          <div
            role="menu"
            aria-label="Menu compte"
            className={[
              "relative overflow-hidden",
              "rounded-3xl border border-white/10 ring-1 ring-white/10",
              "bg-slate-900/95 backdrop-blur-xl",
              "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
            ].join(" ")}
          >
            <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white/[0.06] border border-white/10" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />

            <div className="relative">
              <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center gap-3">
                <NavbarAvatar
                  avatarUrl={avatarUrl}
                  fallback={avatarFallback}
                  size="h-10 w-10"
                />

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-300/70 truncate mt-0.5">
                    {email}
                  </div>
                </div>
              </div>

              <div className={sectionTitle}>Compte</div>

              <div className="px-2 pb-2 space-y-1">
                <button
                  role="menuitem"
                  onClick={onOpenSettings}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <Settings className="w-4 h-4 text-slate-200" />
                    Paramètres
                  </span>
                </button>

                <button
                  role="menuitem"
                  onClick={onOpenInvitations}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <Mail className="w-4 h-4 text-slate-200" />
                    Invitations
                  </span>

                  <InvitationBadge count={invitationCount} />
                </button>
              </div>

              <div className="h-px bg-white/10 mx-4" />

              <div className={sectionTitle}>Organisation</div>

              <div className="px-2 pb-2 space-y-1">
                <button
                  role="menuitem"
                  onClick={onOpenTeam}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <Users2 className="w-4 h-4 text-slate-200" />
                    Équipe
                  </span>
                </button>

                <button
                  onClick={onOpenSubscription}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <CreditCard className="w-4 h-4" />
                    Abonnement
                  </span>
                </button>

                <button
                  role="menuitem"
                  onClick={onOpenAssistance}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <LifeBuoy className="w-4 h-4 text-slate-200" />
                    Centre d’assistance
                  </span>
                </button>
              </div>

              <div className="h-px bg-white/10 mx-4" />

              <div className={sectionTitle}>Session</div>

              <div className="px-2 pb-2">
                <button
                  role="menuitem"
                  onClick={onSignOut}
                  className={[
                    dropdownItem,
                    "text-red-200 hover:bg-red-500/10 active:bg-red-500/15",
                    "focus-visible:ring-red-400/40",
                  ].join(" ")}
                  type="button"
                >
                  <span className={left}>
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}