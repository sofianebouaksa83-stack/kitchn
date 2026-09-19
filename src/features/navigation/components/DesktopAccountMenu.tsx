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
  "w-full flex items-center justify-between gap-3 px-3 py-2.5 " +
  "rounded-2xl text-sm text-[#29493E] " +
  "hover:bg-[#E7EEE8] active:bg-[#DDE8DF] transition " +
  "outline-none focus-visible:ring-2 focus-visible:ring-[#C7A45D]/30";

const left =
  "flex items-center gap-2.5 min-w-0";

const sectionTitle =
  "px-4 pt-3 pb-1 text-[11px] tracking-[0.14em] " +
  "uppercase font-semibold text-[#8B6C32]";

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
    <div className="ml-auto hidden items-center gap-3 lg:flex">
      <div className="relative" ref={menuRef}>
        {/* ACCOUNT TRIGGER */}
        <button
          type="button"
          onClick={onToggle}
          className={[
            "flex items-center gap-3 rounded-[20px] px-3 py-2",
            "bg-[#F7F5EF] transition-all duration-200",
            "border",
            open
              ? "border-[#C7A45D]/40 bg-[#FBFAF6]"
              : "border-[#173E31]/8 hover:border-[#173E31]/15 hover:bg-[#F0F2EC]",
          ].join(" ")}
          aria-label="Compte"
        >
          <NavbarAvatar
            avatarUrl={avatarUrl}
            fallback={avatarFallback}
          />

          <div className="min-w-0 text-left">
            <div
              className="
                flex max-w-[220px]
                items-center gap-2 truncate
                text-sm font-semibold
                text-[#173E31]
              "
            >
              {displayName}

              {isPremium && (
                <img
                  src="/toque-premium.png"
                  alt="Premium"
                  className="
                    h-4 w-4
                    drop-shadow-[0_2px_5px_rgba(199,164,93,0.35)]
                  "
                />
              )}
            </div>

            <div
              className="
                max-w-[220px] truncate
                text-xs text-[#7A8981]
              "
            >
              {email}
            </div>
          </div>

          {invitationCount > 0 && (
            <span
              className="
                ml-1 inline-flex
                h-5 min-w-[22px]
                items-center justify-center
                rounded-full
                bg-[#C7A45D]
                px-2
                text-[11px] font-bold
                text-[#173E31]
              "
            >
              {invitationCount}
            </span>
          )}
        </button>

        {/* DROPDOWN */}
        <div
          className={[
            "absolute right-0 z-50 mt-3 w-[320px] origin-top-right",
            "transition duration-150 ease-out",
            open
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1 scale-[0.98] opacity-0",
          ].join(" ")}
        >
          <div
            role="menu"
            aria-label="Menu compte"
            className="
              relative overflow-hidden
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]/98
              backdrop-blur-xl
              shadow-[0_20px_55px_rgba(23,62,49,0.13)]
            "
          >
            {/* pointe */}
            <div
              className="
                absolute -top-2 right-7
                h-4 w-4 rotate-45
                border-l border-t
                border-[#173E31]/10
                bg-[#FBFAF6]
              "
            />

            <div className="relative">
              {/* PROFILE */}
              <div
                className="
                  flex items-center gap-3
                  border-b border-[#173E31]/8
                  px-4 pb-3 pt-4
                "
              >
                <NavbarAvatar
                  avatarUrl={avatarUrl}
                  fallback={avatarFallback}
                  size="h-10 w-10"
                />

                <div className="min-w-0">
                  <div
                    className="
                      truncate text-sm
                      font-semibold text-[#173E31]
                    "
                  >
                    {displayName}
                  </div>

                  <div
                    className="
                      mt-0.5 truncate
                      text-xs text-[#7A8981]
                    "
                  >
                    {email}
                  </div>
                </div>
              </div>

              <div className={sectionTitle}>
                Compte
              </div>

              <div className="space-y-1 px-2 pb-2">
                <button
                  role="menuitem"
                  onClick={onOpenSettings}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <Settings className="h-4 w-4 text-[#557064]" />
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
                    <Mail className="h-4 w-4 text-[#557064]" />
                    Invitations
                  </span>

                  <InvitationBadge
                    count={invitationCount}
                  />
                </button>
              </div>

              <div className="mx-4 h-px bg-[#173E31]/8" />

              <div className={sectionTitle}>
                Organisation
              </div>

              <div className="space-y-1 px-2 pb-2">
                <button
                  role="menuitem"
                  onClick={onOpenTeam}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <Users2 className="h-4 w-4 text-[#557064]" />
                    Équipe
                  </span>
                </button>

                <button
                  onClick={onOpenSubscription}
                  className={dropdownItem}
                  type="button"
                >
                  <span className={left}>
                    <CreditCard className="h-4 w-4 text-[#557064]" />
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
                    <LifeBuoy className="h-4 w-4 text-[#557064]" />
                    Centre d’assistance
                  </span>
                </button>
              </div>

              <div className="mx-4 h-px bg-[#173E31]/8" />

              <div className={sectionTitle}>
                Session
              </div>

              <div className="px-2 pb-3">
                <button
                  role="menuitem"
                  onClick={onSignOut}
                  className={[
                    dropdownItem,
                    "text-[#A54C48]",
                    "hover:bg-[#F5E4E0]",
                    "active:bg-[#EFD7D2]",
                    "focus-visible:ring-[#C97570]/30",
                  ].join(" ")}
                  type="button"
                >
                  <span className={left}>
                    <LogOut className="h-4 w-4" />
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