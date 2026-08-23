import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  LogOut,
  Users,
  Share2,
  Sparkles,
  BookOpen,
  CreditCard,
  Users2,
  Settings,
  LifeBuoy,
  X,
  Mail,
} from "lucide-react";
import { ui } from "../../styles/ui";
import { useSubscription } from "../../hooks/useSubscription";
import type { View } from "../../app/routes";
import type { NavItem } from "../../features/navigation/types/navigation.types";
import { useNavigationOrder } from "../../features/navigation/hooks/useNavigationOrder";
import { useNavbarProfile } from "../../features/navigation/hooks/useNavbarProfile";
import { usePendingInvitationsCount } from "../../features/navigation/hooks/usePendingInvitationsCount";
import { NavbarAvatar } from "../../features/navigation/components/NavbarAvatar";
import { InvitationBadge } from "../../features/navigation/components/InvitationBadge";


type NavbarProps = {
  currentView: View;
  onViewChange: (view: View) => void;
};


export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, signOut } = useAuth();
  const { displayName, avatarUrl, avatarFallback,} = useNavbarProfile({ userId: user?.id, email: user?.email,});
  const invCount = usePendingInvitationsCount({ userId: user?.id,});
  const handleViewChange = (view: View) => onViewChange(view);

  const navPill = (active: boolean) =>
    [
      "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition select-none",
      "ring-1",
      active
        ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
        : "bg-white/[0.04] text-slate-200/90 ring-white/10 hover:bg-white/[0.07] hover:ring-white/15",
    ].join(" ");

  const mobileIconBtn = (active: boolean) =>
    [
      "h-12 w-12 rounded-2xl inline-flex items-center justify-center transition",
      "ring-1 ring-white/10",
      active
        ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
        : "bg-white/[0.04] text-slate-200/90 hover:bg-white/[0.07]",
    ].join(" ");

  const baseItems: NavItem[] = useMemo(
    () => [
      {
        key: "recipes",
        view: "recipes",
        label: "Mes recettes",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        key: "shared",
        view: "shared",
        label: "Partagées",
        icon: <Share2 className="w-4 h-4" />,
      },
      {
        key: "groups",
        view: "groups",
        label: "Groupes",
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "import-ai",
        view: "import-ai",
        label: "Import",
        icon: <Sparkles className="w-4 h-4" />,
      },
    ],
    []
  );

  const { menuItems, dragKey, onDragStartItem, onDragOverItem, onDropItem, onDragEndItem,} = useNavigationOrder({  userId: user?.id, baseItems,});
  
 
  // Desktop dropdown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Mobile bottom sheet
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ Profile local pour navbar (fiable)
  const { isPremium } = useSubscription(user?.id ?? null);

  
  // ESC ferme tout + clic dehors ferme dropdown desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAccountMenuOpen(false);
        setMobileSheetOpen(false);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!accountMenuOpen) return;
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [accountMenuOpen]);

 
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

  // ✅ plus lisible : hauteur + align + séparation + typo
  const dropdownItem =
    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-sm " +
    "text-slate-100 hover:bg-white/[0.08] active:bg-white/[0.12] transition " +
    "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40";

  const left =
    "flex items-center gap-2.5 min-w-0";

  const sectionTitle =
    "px-4 pt-3 pb-1 text-[11px] tracking-wide uppercase text-white/40";

  



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
          <div className="flex-1 hidden lg:flex justify-center">
            <div className="flex items-center gap-2">
              {menuItems.map((item) => {
                const active = currentView === item.view;
                const isDragging = dragKey === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleViewChange(item.view)}
                    className={`${navPill(active)} ${isDragging ? "opacity-60 scale-[0.98]" : ""}`}
                    draggable
                    onDragStart={onDragStartItem(item.key)}
                    onDragOver={onDragOverItem}
                    onDrop={onDropItem(item.key)}
                    onDragEnd={onDragEndItem}
                    title="Glisse-dépose pour réordonner"
                    type="button"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DROITE — DESKTOP : avatar + nom + dropdown */}
          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className={[
                  "flex items-center gap-3 rounded-2xl px-3 py-2",
                  "bg-white/[0.04] hover:bg-white/[0.09] transition",
                  "ring-1",
                  accountMenuOpen ? "ring-amber-400/30" : "ring-white/10 hover:ring-white/15",
                ].join(" ")}
                aria-label="Compte"
              >
             <NavbarAvatar
  avatarUrl={avatarUrl}
  fallback={avatarFallback}
/>

                {/* ✅ badge discret sur le bouton */}
                {invCount > 0 && (
                  <span className="ml-1 min-w-[22px] h-5 px-2 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-[11px] font-bold">
                    {invCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              <div
                className={[
                  "absolute right-0 mt-3 w-[320px] origin-top-right z-50",
                  "transition duration-150 ease-out",
                  accountMenuOpen
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
                          {user?.email}
                        </div>
                      </div>
                    </div>

                    <div className={sectionTitle}>Compte</div>
                    <div className="px-2 pb-2 space-y-1">
                      <button role="menuitem" onClick={openSettings} className={dropdownItem} type="button">
                        <span className={left}>
                          <Settings className="w-4 h-4 text-slate-200" />
                          Paramètres
                        </span>
                      </button>

                      <button role="menuitem" onClick={openInvitations} className={dropdownItem} type="button">
                        <span className={left}>
                          <Mail className="w-4 h-4 text-slate-200" />
                          Invitations
                        </span>
                        <InvitationBadge count={invCount} />
                      </button>
                    </div>

                    <div className="h-px bg-white/10 mx-4" />

                    <div className={sectionTitle}>Organisation</div>
                    <div className="px-2 pb-2 space-y-1">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleViewChange("team");
                        }}
                        className={dropdownItem}
                        type="button"
                      >
                        <span className={left}>
                          <Users2 className="w-4 h-4 text-slate-200" />
                          Équipe
                        </span>
                      </button>

                      <button
                        onClick={openSubscriptionSettings}
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
                      onClick={() => {
                        setAccountMenuOpen(false);
                        window.history.pushState({}, "", "/assistance");
                        window.dispatchEvent(new Event("popstate"));
                      }}
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
                        onClick={() => {
                          setAccountMenuOpen(false);
                          signOut();
                        }}
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
              {/* end dropdown */}
            </div>
          </div>
        </div>
      </nav>

      {/* BOTTOM NAV (MOBILE) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/55 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-3 py-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleViewChange("recipes")}
              className={mobileIconBtn(currentView === "recipes")}
              aria-label="Mes recettes"
              title="Mes recettes"
              type="button"
            >
              <BookOpen className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleViewChange("shared")}
              className={mobileIconBtn(currentView === "shared")}
              aria-label="Partagées"
              title="Partagées"
              type="button"
            >
              <Share2 className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleViewChange("groups")}
              className={mobileIconBtn(currentView === "groups")}
              aria-label="Groupes"
              title="Groupes"
              type="button"
            >
              <Users className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleViewChange("import-ai")}
              className={mobileIconBtn(currentView === "import-ai")}
              aria-label="Importer"
              title="Importer"
              type="button"
            >
              <Sparkles className="w-6 h-6" />
            </button>

            <button
              onClick={() => setMobileSheetOpen(true)}
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
              {invCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-[11px] font-bold">
                  {invCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE ACCOUNT SHEET (bottom) */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Fermer"
            onClick={() => setMobileSheetOpen(false)}
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
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileSheetOpen(false)}
                    className="h-10 w-10 rounded-2xl inline-flex items-center justify-center hover:bg-white/[0.07] transition"
                    aria-label="Fermer"
                    type="button"
                  >
                    <X className="w-5 h-5 text-slate-200" />
                  </button>
                </div>

                <div className="p-2 space-y-1">
                  <button onClick={openSettings} className={dropdownItem} type="button">
                    <span className={left}>
                      <Settings className="w-4 h-4" />
                      Paramètres
                    </span>
                  </button>

                  <button onClick={openInvitations} className={dropdownItem} type="button">
                    <span className={left}>
                      <Mail className="w-4 h-4" />
                      Invitations
                    </span>
                    <InvitationBadge count={invCount} />
                  </button>

                  <div className="h-px bg-white/10 my-2" />

                  <button
                    onClick={() => {
                      setMobileSheetOpen(false);
                      handleViewChange("team");
                    }}
                    className={dropdownItem}
                    type="button"
                  >
                    <span className={left}>
                      <Users2 className="w-4 h-4" />
                      Équipe
                    </span>
                  </button>

                  <button
                    onClick={openSubscriptionSettings}
                    className={dropdownItem}
                    type="button"
                  >
                    <span className={left}>
                      <CreditCard className="w-4 h-4" />
                      Abonnement
                    </span>
                  </button>
                  
                  <div className="h-px bg-white/10 my-2" />

                  <button
                    onClick={() => {
                      setMobileSheetOpen(false);
                      signOut();
                    }}
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
      )}
    </>
  );
}