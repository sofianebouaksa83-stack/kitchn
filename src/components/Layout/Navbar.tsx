import { useAuth } from "../../contexts/AuthContext";
import { ui } from "../../styles/ui";
import { useSubscription } from "../../hooks/useSubscription";
import type { View } from "../../app/routes";

import { useNavbarProfile } from "../../features/navigation/hooks/useNavbarProfile";
import { usePendingInvitationsCount } from "../../features/navigation/hooks/usePendingInvitationsCount";
import { useNavbarMenus } from "../../features/navigation/hooks/useNavbarMenus";

import { DesktopNavigation } from "../../features/navigation/components/DesktopNavigation";
import { MobileNavigation } from "../../features/navigation/components/MobileNavigation";
import { MobileAccountSheet } from "../../features/navigation/components/MobileAccountSheet";
import { DesktopAccountMenu } from "../../features/navigation/components/DesktopAccountMenu";

import { navigateToSettingsTab } from "../../features/settings/utils/settingsRoute";

type NavbarProps = {
  currentView: View;
  onViewChange: (view: View) => void;
};

export function Navbar({
  currentView,
  onViewChange,
}: NavbarProps) {
  const { user, signOut } = useAuth();

  const {
    displayName,
    avatarUrl,
    avatarFallback,
  } = useNavbarProfile({
    userId: user?.id,
    email: user?.email,
  });

  const invCount = usePendingInvitationsCount({
    userId: user?.id,
  });

  const handleViewChange = (view: View) =>
    onViewChange(view);

  const {
    accountMenuOpen,
    setAccountMenuOpen,
    mobileSheetOpen,
    setMobileSheetOpen,
    menuRef,
  } = useNavbarMenus();

  const { isPremium } = useSubscription(
    user?.id ?? null,
  );

  const closeAccountMenus = () => {
    setAccountMenuOpen(false);
    setMobileSheetOpen(false);
  };

  const openSettings = () => {
    closeAccountMenus();
    navigateToSettingsTab("profile");
  };

  const openInvitations = () => {
    closeAccountMenus();
    navigateToSettingsTab("invitations");
  };

  const openSubscriptionSettings = () => {
    closeAccountMenus();
    navigateToSettingsTab("subscription");
  };

  const openAssistance = () => {
    closeAccountMenus();

    window.history.pushState(
      {},
      "",
      "/assistance",
    );

    window.dispatchEvent(
      new Event("popstate"),
    );
  };

  return (
    <>
      {/* TOP NAV */}
      <nav
        className="
          sticky top-0 z-40
          w-full
          border-b border-[#173E31]/10
          bg-[#FBFAF6]/95
          backdrop-blur-xl
          shadow-[0_4px_20px_rgba(23,62,49,0.04)]
        "
      >
        <div
          className={`
            ${ui.containerWide}
            relative
            flex h-[76px]
            items-center
            px-4 sm:px-6
          `}
        >
          {/* LOGO */}
          <div
            className="
              absolute left-1/2
              shrink-0
              -translate-x-1/2
              md:static
              md:translate-x-0
            "
          >
            <button
              onClick={() =>
                handleViewChange("accueil")
              }
              aria-label="Retour à l'accueil"
              className="
                flex items-center
                rounded-xl
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#C7A45D]/40
              "
              type="button"
            >
              <img
                src="/logo_kitchn_sans_fond.png"
                alt="KITCH'N"
                className="
                  h-14
                  w-auto
                  select-none
                  object-contain
                  sm:h-16
                "
                draggable={false}
              />
            </button>
          </div>

          {/* NAVIGATION DESKTOP */}
          <DesktopNavigation
            userId={user?.id}
            currentView={currentView}
            onViewChange={
              handleViewChange
            }
          />

          {/* COMPTE DESKTOP */}
          <DesktopAccountMenu
            menuRef={menuRef}
            open={accountMenuOpen}
            displayName={displayName}
            email={user?.email}
            avatarUrl={avatarUrl}
            avatarFallback={
              avatarFallback
            }
            invitationCount={invCount}
            isPremium={isPremium}
            onToggle={() =>
              setAccountMenuOpen(
                (value) => !value,
              )
            }
            onOpenSettings={
              openSettings
            }
            onOpenInvitations={
              openInvitations
            }
            onOpenTeam={() => {
              setAccountMenuOpen(false);
              handleViewChange("team");
            }}
            onOpenSubscription={
              openSubscriptionSettings
            }
            onOpenAssistance={
              openAssistance
            }
            onSignOut={() => {
              setAccountMenuOpen(false);
              signOut();
            }}
          />
        </div>
      </nav>

      {/* BOTTOM NAV MOBILE */}
      <MobileNavigation
        currentView={currentView}
        onViewChange={handleViewChange}
        avatarUrl={avatarUrl}
        avatarFallback={avatarFallback}
        invitationCount={invCount}
        onOpenAccount={() =>
          setMobileSheetOpen(true)
        }
      />

      {/* ACCOUNT SHEET MOBILE */}
      <MobileAccountSheet
        open={mobileSheetOpen}
        displayName={displayName}
        email={user?.email}
        avatarUrl={avatarUrl}
        avatarFallback={
          avatarFallback
        }
        invitationCount={invCount}
        onClose={() =>
          setMobileSheetOpen(false)
        }
        onOpenSettings={openSettings}
        onOpenInvitations={
          openInvitations
        }
        onOpenTeam={() => {
          setMobileSheetOpen(false);
          handleViewChange("team");
        }}
        onOpenSubscription={
          openSubscriptionSettings
        }
        onOpenAssistance={
          openAssistance
        }
        onSignOut={() => {
          setMobileSheetOpen(false);
          signOut();
        }}
      />
    </>
  );
}