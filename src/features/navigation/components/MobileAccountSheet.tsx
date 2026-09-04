import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Mail,
  Settings,
  Users2,
  X,
} from "lucide-react";
import { InvitationBadge } from "./InvitationBadge";
import { NavbarAvatar } from "./NavbarAvatar";

type MobileAccountSheetProps = {
  open: boolean;
  displayName: string;
  email?: string;
  avatarUrl: string | null;
  avatarFallback: string;
  invitationCount: number;
  onClose: () => void;
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

export function MobileAccountSheet({
  open,
  displayName,
  email,
  avatarUrl,
  avatarFallback,
  invitationCount,
  onClose,
  onOpenSettings,
  onOpenInvitations,
  onOpenTeam,
  onOpenSubscription,
  onOpenAssistance,
  onSignOut,
}: MobileAccountSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button
        className="absolute inset-0 bg-black/60"
        aria-label="Fermer"
        onClick={onClose}
        type="button"
      />

      <div className="absolute left-0 right-0 bottom-0">
        <div className="mx-auto max-w-3xl px-3 pb-3">
          <div className="rounded-t-3xl rounded-b-2xl border border-white/10 bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden">
            <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="min-w-0 flex items-center gap-3">
                <NavbarAvatar
                  avatarUrl={avatarUrl}
                  fallback={avatarFallback}
                  size="h-10 w-10"
                />

                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100 truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-slate-300/70 truncate">
                    {email}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-2xl inline-flex items-center justify-center hover:bg-white/[0.07] transition"
                aria-label="Fermer"
                type="button"
              >
                <X className="w-5 h-5 text-slate-200" />
              </button>
            </div>

            <div className="p-2 space-y-1">
              <button
                onClick={onOpenSettings}
                className={dropdownItem}
                type="button"
              >
                <span className={left}>
                  <Settings className="w-4 h-4" />
                  Paramètres
                </span>
              </button>

              <button
                onClick={onOpenInvitations}
                className={dropdownItem}
                type="button"
              >
                <span className={left}>
                  <Mail className="w-4 h-4" />
                  Invitations
                </span>

                <InvitationBadge count={invitationCount} />
              </button>

              <div className="h-px bg-white/10 my-2" />

              <button
                onClick={onOpenTeam}
                className={dropdownItem}
                type="button"
              >
                <span className={left}>
                  <Users2 className="w-4 h-4" />
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
                onClick={onOpenAssistance}
                className={dropdownItem}
                type="button"
              >
                <span className={left}>
                  <LifeBuoy className="w-4 h-4" />
                  Centre d’assistance
                </span>
              </button>

              <div className="h-px bg-white/10 my-2" />

              <button
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

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}