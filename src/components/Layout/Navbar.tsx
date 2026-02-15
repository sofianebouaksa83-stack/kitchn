import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
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
} from "lucide-react";
import { ui } from "../../styles/ui";

type View =
  | "recipes"
  | "editor"
  | "groups"
  | "shared"
  | "import-ai"
  | "team"
  | "subscription"
  | "subscription-success"
  | "subscription-cancel"
  | "settings";

type NavbarProps = {
  currentView: View;
  onViewChange: (view: View) => void;
};

type NavItem = {
  key: string;
  view: View;
  label: string;
  icon?: JSX.Element;
};

type NavbarProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

async function loadNavOrder(userId: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("nav_order")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data?.nav_order ?? []) as string[];
}

async function saveNavOrder(userId: string, keys: string[]) {
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, nav_order: keys }, { onConflict: "user_id" });

  if (error) throw error;
}

function isHttpUrl(v: string) {
  return /^https?:\/\//i.test(v);
}

function withCacheBuster(url: string, token: string) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(token)}`;
}

export function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { user, signOut } = useAuth();

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
      { key: "recipes", view: "recipes", label: "Mes recettes", icon: <BookOpen className="w-4 h-4" /> },
      { key: "shared", view: "shared", label: "Partagées", icon: <Share2 className="w-4 h-4" /> },
      { key: "groups", view: "groups", label: "Groupes", icon: <Users className="w-4 h-4" /> },
      { key: "import-ai", view: "import-ai", label: "Import", icon: <Sparkles className="w-4 h-4" /> },
    ],
    []
  );

  const baseKeys = useMemo(() => baseItems.map((i) => i.key), [baseItems]);

  const [menuItems, setMenuItems] = useState<NavItem[]>(baseItems);
  const [dragKey, setDragKey] = useState<string | null>(null);

  // Desktop dropdown
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Mobile bottom sheet
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ Profile local pour navbar (fiable)
  const [navProfile, setNavProfile] = useState<NavbarProfile | null>(null);

  // Charge profil pour la navbar (full_name + avatar_url)
  useEffect(() => {
    if (!user?.id) {
      setNavProfile(null);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, updated_at")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;
      if (!error) setNavProfile((data as NavbarProfile | null) ?? null);
    };

    fetchProfile();

    // Bonus: écoute les updates sur profiles pour refresh auto
    const channel = supabase
      .channel(`nav-profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        () => fetchProfile()
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Charge l'ordre depuis Supabase (drag/drop desktop)
  useEffect(() => {
    if (!user?.id) {
      setMenuItems(baseItems);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const savedKeys = await loadNavOrder(user.id);

        const filtered = savedKeys.filter((k) => baseKeys.includes(k));
        const missing = baseKeys.filter((k) => !filtered.includes(k));
        const finalKeys = [...filtered, ...missing];

        const byKey = new Map(baseItems.map((i) => [i.key, i] as const));
        const ordered = finalKeys.map((k) => byKey.get(k)).filter(Boolean) as NavItem[];

        if (!cancelled) setMenuItems(ordered.length ? ordered : baseItems);
      } catch {
        if (!cancelled) setMenuItems(baseItems);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, baseItems, baseKeys.join("|")]);

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

  const onDragStartItem = (key: string) => (e: React.DragEvent) => {
    setDragKey(key);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
  };

  const onDragOverItem = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDropItem = (overKey: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    const fromKey = dragKey || e.dataTransfer.getData("text/plain");
    if (!fromKey || fromKey === overKey) return;

    let nextKeys: string[] = [];

    setMenuItems((prev) => {
      const fromIndex = prev.findIndex((i) => i.key === fromKey);
      const toIndex = prev.findIndex((i) => i.key === overKey);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);

      nextKeys = next.map((i) => i.key);
      return next;
    });

    setDragKey(null);

    if (user?.id && nextKeys.length) {
      try {
        await saveNavOrder(user.id, nextKeys);
      } catch {
        // ignore
      }
    }
  };

  const onDragEndItem = () => setDragKey(null);

  const openSettings = () => {
    setAccountMenuOpen(false);
    setMobileSheetOpen(false);
    handleViewChange("settings");
  };

  const dropdownItem =
    "w-full flex items-center gap-2 px-3 py-3 rounded-2xl text-sm " +
    "text-slate-100 hover:bg-white/[0.07] active:bg-white/[0.10] transition " +
    "outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40";

  const displayName =
    navProfile?.full_name ||
    navProfile?.username ||
    user?.email ||
    "Compte";

  // ✅ Ici, ton avatar_url est déjà une URL complète (d’après ta capture)
  // Mais on garde le support path/URL au cas où.
  const avatarUrl = useMemo(() => {
    const raw = navProfile?.avatar_url?.trim();
    if (!raw) return null;

    const token = navProfile?.updated_at || "1";

    if (isHttpUrl(raw)) return withCacheBuster(raw, token);

    const publicUrl = supabase.storage.from("avatars").getPublicUrl(raw).data.publicUrl;
    return withCacheBuster(publicUrl, token);
  }, [navProfile?.avatar_url, navProfile?.updated_at]);

  const avatarFallback = (
    navProfile?.full_name?.trim()?.[0] ||
    navProfile?.username?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "?"
  ) as string;

  const Avatar = ({ size = "h-8 w-8" }: { size?: string }) => (
    <div
      className={[
        size,
        "rounded-full overflow-hidden bg-white/10",
        "ring-1 ring-white/10",
        "flex items-center justify-center shrink-0",
      ].join(" ")}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <span className="text-xs font-semibold text-white/70">{avatarFallback.toUpperCase()}</span>
      )}
    </div>
  );

  return (
    <>
      {/* TOP NAV */}
      <nav className="sticky top-0 z-40 w-full bg-slate-950/55 backdrop-blur-xl border-b border-white/10">
        <div className={`relative h-20 ${ui.containerWide} flex items-center px-4 sm:px-6`}>
          {/* LOGO — centré mobile, gauche desktop */}
          <div className="shrink-0 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <button
              onClick={() => handleViewChange("recipes")}
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
                  "bg-white/[0.04] hover:bg-white/[0.07] transition",
                  "ring-1",
                  accountMenuOpen ? "ring-amber-400/25" : "ring-white/10 hover:ring-white/15",
                ].join(" ")}
                aria-label="Compte"
              >
                <Avatar />
                <div className="min-w-0 text-left">
                  <div className="text-sm font-medium text-white truncate max-w-[220px]">{displayName}</div>
                  <div className="text-xs text-white/60 truncate max-w-[220px]">{user?.email}</div>
                </div>
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
                    "bg-white/[0.06] backdrop-blur-md",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                  ].join(" ")}
                >
                  <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 bg-white/[0.06] border border-white/10" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />

                  <div className="relative">
                    <div className="px-4 pt-4 pb-3 border-b border-white/10 flex items-center gap-3">
                      <Avatar size="h-10 w-10" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-100 truncate">{displayName}</div>
                        <div className="text-xs text-slate-300/70 truncate mt-0.5">{user?.email}</div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button role="menuitem" onClick={openSettings} className={dropdownItem} type="button">
                        <Settings className="w-4 h-4 text-slate-200" />
                        Paramètres
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleViewChange("team");
                        }}
                        className={dropdownItem}
                        type="button"
                      >
                        <Users2 className="w-4 h-4 text-slate-200" />
                        Équipe
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          handleViewChange("subscription");
                        }}
                        className={dropdownItem}
                        type="button"
                      >
                        <CreditCard className="w-4 h-4 text-slate-200" />
                        Abonnement
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          alert("Centre d’assistance (à brancher)");
                        }}
                        className={dropdownItem}
                        type="button"
                      >
                        <LifeBuoy className="w-4 h-4 text-slate-200" />
                        Centre d’assistance
                      </button>

                      <div className="h-px bg-white/10 my-2" />

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
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
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
              ].join(" ")}
              aria-label="Compte"
              title="Compte"
              type="button"
            >
              <Avatar size="h-9 w-9" />
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
                    <Avatar size="h-10 w-10" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-100 truncate">{displayName}</div>
                      <div className="text-xs text-slate-300/70 truncate">{user?.email}</div>
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

                <div className="p-2">
                  <button
                    onClick={() => openSettings()}
                    className={dropdownItem}
                    type="button"
                  >
                    <Settings className="w-4 h-4" />
                    Paramètres
                  </button>

                  <button
                    onClick={() => {
                      setMobileSheetOpen(false);
                      handleViewChange("team");
                    }}
                    className={dropdownItem}
                    type="button"
                  >
                    <Users2 className="w-4 h-4" />
                    Équipe
                  </button>

                  <button
                    onClick={() => {
                      setMobileSheetOpen(false);
                      handleViewChange("subscription");
                    }}
                    className={dropdownItem}
                    type="button"
                  >
                    <CreditCard className="w-4 h-4" />
                    Abonnement
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
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
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
