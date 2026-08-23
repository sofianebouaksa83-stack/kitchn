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

type NavbarProps = {
  currentView: View;
  onViewChange: (view: View) => void;
};


export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { displayName, avatarUrl, avatarFallback,} = useNavbarProfile({ userId: user?.id, email: user?.email,});
  const invCount = usePendingInvitationsCount({ userId: user?.id,});
  const handleViewChange = (view: View) => onViewChange(view);

  const { accountMenuOpen, setAccountMenuOpen, mobileSheetOpen, setMobileSheetOpen, menuRef,} = useNavbarMenus();
 
  // ✅ Profile local pour navbar (fiable)
  const { isPremium } = useSubscription(user?.id ?? null);


  const openSettings = () => {
    setAccountMenuOpen(false);
    setMobileSheetOpen(false);
    handleViewChange("settings");
  };

  const openInvitations = () => {
    setAccountMenuOpen(false);
    setMobileSheetOpen(false);
    // ✅ ouvre l’onglet invitations dans SettingsPage
    window.location.hash = "/settings?tab=invitations";
  };

const openSubscriptionSettings = () => {
  setAccountMenuOpen(false);
  setMobileSheetOpen(false);

  handleViewChange("settings");

  setTimeout(() => {
    window.location.hash = "/settings?tab=subscription";
  }, 50);
};

 


  return (
    <>
      {/* TOP NAV */}
      <nav className="sticky top-0 z-40 w-full bg-slate-950/55 backdrop-blur-xl border-b border-white/10">
        <div className={`relative h-20 ${ui.containerWide} flex items-center px-4 sm:px-6`}>
          {/* LOGO — centré mobile, gauche desktop */}
          <div className="shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <button
              onClick={() => handleViewChange("accueil")}
              aria-label="Retour à l'accueil"
              className="flex items-center focus:outline-none"
              type="button"
            >
              <img
                src="/Logo_kitchn_horizontal.svg"
                alt="KITCH'N"
                className="h-11 sm:h-12 w-auto select-none"
                draggable={false}
              />
            </button>
          </div>

          {/* MENU CENTRE — DESKTOP + DRAG */}
              <DesktopNavigation
                userId={user?.id}
                currentView={currentView}
                onViewChange={handleViewChange}
              />

          {/* DROITE — DESKTOP : avatar + nom + dropdown */}
            <DesktopAccountMenu
              menuRef={menuRef}
              open={accountMenuOpen}
              displayName={displayName}
              email={user?.email}
              avatarUrl={avatarUrl}
              avatarFallback={avatarFallback}
              invitationCount={invCount}
              isPremium={isPremium}
              onToggle={() => setAccountMenuOpen((value) => !value)}
              onOpenSettings={openSettings}
              onOpenInvitations={openInvitations}
              onOpenTeam={() => {
                setAccountMenuOpen(false);
                handleViewChange("team");
              }}
              onOpenSubscription={openSubscriptionSettings}
              onOpenAssistance={() => {
                setAccountMenuOpen(false);
                window.history.pushState({}, "", "/assistance");
                window.dispatchEvent(new Event("popstate"));
              }}
              onSignOut={() => {
                setAccountMenuOpen(false);
                signOut();
              }}
            />                 
        </div>
      </nav> 
        

      {/* BOTTOM NAV (MOBILE) */}
        <MobileNavigation
          currentView={currentView}
          onViewChange={handleViewChange}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
          invitationCount={invCount}
          onOpenAccount={() => setMobileSheetOpen(true)}
        />

      {/* MOBILE ACCOUNT SHEET (bottom) */}
        <MobileAccountSheet
          open={mobileSheetOpen}
          displayName={displayName}
          email={user?.email}
          avatarUrl={avatarUrl}
          avatarFallback={avatarFallback}
          invitationCount={invCount}
          onClose={() => setMobileSheetOpen(false)}
          onOpenSettings={openSettings}
          onOpenInvitations={openInvitations}
          onOpenTeam={() => {
            setMobileSheetOpen(false);
            handleViewChange("team");
          }}
          onOpenSubscription={openSubscriptionSettings}
          onSignOut={() => {
            setMobileSheetOpen(false);
            signOut();
          }}
        />
    </>
  );
}