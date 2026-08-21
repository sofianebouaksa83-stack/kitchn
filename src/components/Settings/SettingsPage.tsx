import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Loader2,
  Save,
  User,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Upload,
  Building2,
  EyeOff,
  Eye,
  KeyRound,
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Calendar,
  Crown,
} from "lucide-react";
import { ui } from "../../styles/ui";


import { Section } from "../../features/settings/components/Section";
import { Field } from "../../features/settings/components/Field";
import { Toggle } from "../../features/settings/components/Toggle";
import { cn } from "../../features/settings/utils/cn";

import { NotificationsSettings } from "../../features/settings/components/NotificationsSettings";
import { SecuritySettings } from "../../features/settings/components/SecuritySettings";
import { AccountSettings } from "../../features/settings/components/AccountSettings";
import { SubscriptionSettings } from "../../features/settings/components/SubscriptionSettings";
import { InvitationsSettings, type PendingInvitationRow,} from "../../features/settings/components/InvitationsSettings";
import { ProfileSettings } from "../../features/settings/components/ProfileSettings";

type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  locale: string | null;

  notifications_email: boolean | null;
  notifications_push: boolean | null;
  marketing_email: boolean | null;

  restaurant_id: string | null;
  restaurant_role: string | null; // IMPORTANT: restaurant_role
  updated_at: string | null;
};

type SettingsTab =
  | "profile"
  | "notifications"
  | "invitations"
  | "security"
  | "subscription"
  | "account";

type View =
  | "recipes"
  | "editor"
  | "groups"
  | "shared"
  | "import-ai"
  | "team"
  | "subscription"
  | "subscription-checkout"
  | "subscription-success"
  | "subscription-cancel"
  | "settings";

type SettingsPageProps = {
  onViewChange?: (view: View) => void;
};

function isValidUsername(v: string) {
  if (!v) return true;
  return /^[a-z0-9_]{3,20}$/i.test(v);
}

function isValidUrl(v: string) {
  try {
    if (!v) return true;
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

function storagePathFromPublicUrl(url: string, bucket = "avatars") {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const i = url.indexOf(marker);
    if (i === -1) return null;
    return url.slice(i + marker.length);
  } catch {
    return null;
  }
}

function withCacheBuster(url: string, token: string) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(token)}`;
}

/** lit #/settings?tab=invitations */
function getTabFromHash(): SettingsTab | null {
  const raw = window.location.hash.slice(1); // "/settings?tab=invitations"
  const qs = raw.split("?")[1] ?? "";
  const tab = new URLSearchParams(qs).get("tab");
  if (!tab) return null;

  const allowed: SettingsTab[] = [
    "profile",
    "notifications",
    "invitations",
    "security",
    "subscription",
    "account",
  ];
  return allowed.includes(tab as any) ? (tab as SettingsTab) : null;
}

/** set #/settings?tab=... */
function setTabInHash(tab: SettingsTab) {
  const p = new URLSearchParams();
  p.set("tab", tab);

  // garde la route /settings sans déclencher ton router hash
  window.history.replaceState(null, "", `#/settings?${p.toString()}`);
}

export default function SettingsPage({ onViewChange }: SettingsPageProps) {
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileRow | null>(null);

  // form
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [locale, setLocale] = useState<"fr" | "en">("fr");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(false);

  const [restaurantRole, setRestaurantRole] = useState("");

  // avatar
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [avatarAnimOut, setAvatarAnimOut] = useState(false);

  // Undo avatar removal (5s)
  const undoTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);
  const [undoPayload, setUndoPayload] = useState<{
    prevAvatarUrl: string;
    prevAvatarPath: string | null;
  } | null>(null);

  // change password
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwShow, setPwShow] = useState(false);

  // ✅ tabs
  const [tab, setTab] = useState<SettingsTab>("profile");

  // ✅ invitations
  const [invLoading, setInvLoading] = useState(false);
  const [invErr, setInvErr] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<PendingInvitationRow[]>([]);
  const [invCount, setInvCount] = useState<number>(0);
  const [joiningToken, setJoiningToken] = useState<string | null>(null);

  const pwStrength = useMemo(() => passwordScore(pw1), [pw1]);
  const pwMatch = pw1.length > 0 && pw1 === pw2;

  const canSave = useMemo(() => {
    if (!user?.id) return false;
    if (!isValidUsername(username)) return false;
    if (!isValidUrl(website)) return false;
    return true;
  }, [user?.id, username, website]);

  const canChangePassword = useMemo(() => {
    if (!user?.id) return false;
    if (!pw1 || !pw2) return false;
    if (pw1 !== pw2) return false;
    if (pw1.length < 8) return false;
    return true;
  }, [user?.id, pw1, pw2]);

  // Initiale pour avatar par défaut
  const avatarInitial = useMemo(() => {
    const v = fullName?.trim()?.[0] || username?.trim()?.[0] || user?.email?.trim()?.[0] || "?";
    return String(v).toUpperCase();
  }, [fullName, username, user?.email]);

  // teinte pseudo-aléatoire stable
  const defaultAvatarBg = useMemo(() => {
    const seed = `${user?.id ?? ""}-${avatarInitial}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `linear-gradient(135deg, hsla(${hue}, 85%, 60%, 0.35), hsla(${(hue + 40) % 360}, 85%, 55%, 0.18))`;
  }, [user?.id, avatarInitial]);

  // ✅ init tab depuis hash + écoute hashchange
  useEffect(() => {
    const t = getTabFromHash();
    if (t) setTab(t);

    const onHash = () => {
      const next = getTabFromHash();
      if (next) setTab(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // ✅ profile
  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!user?.id) return;

      setLoading(true);
      setErr(null);
      setOk(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!alive) return;

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      let row = (data as ProfileRow | null) ?? null;
      if (!row) {
        const { data: inserted, error: insErr } = await supabase
          .from("profiles")
          .insert({ id: user.id, locale: "fr" })
          .select("*")
          .single();

        if (!alive) return;

        if (insErr) {
          setErr(insErr.message);
          setLoading(false);
          return;
        }
        row = inserted as ProfileRow;
      }

      setProfile(row);

      setFullName(row.full_name ?? "");
      setUsername(row.username ?? "");
      setBio(row.bio ?? "");
      setWebsite(row.website ?? "");
      setLocale((row.locale as any) || "fr");

      setNotifEmail(row.notifications_email ?? true);
      setNotifPush(row.notifications_push ?? false);
      setMarketingEmail(row.marketing_email ?? false);

      setRestaurantRole(row.restaurant_role ?? "");

      const nextAvatar =
        row.avatar_url && row.updated_at ? withCacheBuster(row.avatar_url, row.updated_at) : row.avatar_url ?? null;

      setAvatarPreview(nextAvatar);
      setLoading(false);
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  // ✅ count badge (léger)
  useEffect(() => {
    let alive = true;

    async function loadCount() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase.rpc("get_my_pending_invitations_count");
        if (error) throw error;
        if (!alive) return;
        setInvCount(Number(data ?? 0));
      } catch {
        if (!alive) return;
        setInvCount(0);
      }
    }

    loadCount();
    const t = window.setInterval(loadCount, 15000); // rafraîchit doucement
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [user?.id]);

  // ✅ charge la liste UNIQUEMENT quand onglet invitations
  useEffect(() => {
    let alive = true;

    async function loadInvitations() {
      if (!user?.id) return;
      if (tab !== "invitations") return;

      setInvErr(null);
      setInvLoading(true);

      try {
        const { data, error } = await supabase.rpc("get_my_pending_invitations");
        if (error) throw error;
        if (!alive) return;

        const rows = ((data as PendingInvitationRow[]) ?? []).filter(Boolean);
        setInvitations(rows);
        setInvCount(rows.length);
      } catch (e: any) {
        if (!alive) return;
        setInvErr(e?.message ?? "Impossible de charger les invitations.");
        setInvitations([]);
      } finally {
        if (!alive) return;
        setInvLoading(false);
      }
    }

    loadInvitations();
    return () => {
      alive = false;
    };
  }, [user?.id, tab]);

  async function onAcceptInvitation(token: string) {
    if (!user?.id) return;

    setInvErr(null);
    setJoiningToken(token);

    try {
      const { error } = await supabase.rpc("accept_group_invitation", {
        invitation_token: token,
      });
      if (error) throw error;

      // refresh list + count
      const { data } = await supabase.rpc("get_my_pending_invitations");
      const rows = ((data as PendingInvitationRow[]) ?? []).filter(Boolean);
      setInvitations(rows);
      setInvCount(rows.length);

      // go groups
      window.location.hash = "/groups";
    } catch (e: any) {
      setInvErr(e?.message ?? "Impossible d'accepter l'invitation.");
    } finally {
      setJoiningToken(null);
    }
  }

  async function onSave() {
    if (!user?.id) return;
    if (!canSave) return;

    setSaving(true);
    setErr(null);
    setOk(null);

    const payload: Partial<ProfileRow> = {
      full_name: fullName.trim() || null,
      username: username.trim() || null,
      bio: bio.trim() || null,
      website: website.trim() || null,
      locale,
      notifications_email: notifEmail,
      notifications_push: notifPush,
      marketing_email: marketingEmail,
      restaurant_role: restaurantRole.trim() || null,
    };

    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setOk("Enregistré ✅");
    setSaving(false);
    window.setTimeout(() => setOk(null), 2200);
  }

  async function onPickAvatar(file: File) {
    if (!user?.id) return;

    setAvatarUploading(true);
    setErr(null);
    setOk(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: saveErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (saveErr) throw saveErr;

      if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
      if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
      undoTimerRef.current = null;
      deleteTimerRef.current = null;
      setUndoVisible(false);
      setUndoPayload(null);

      setAvatarAnimOut(false);
      setAvatarPreview(withCacheBuster(publicUrl, String(Date.now())));
      setOk("Avatar mis à jour ✅");
      window.setTimeout(() => setOk(null), 2200);
    } catch (e: any) {
      setErr(e?.message ?? "Erreur upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function onRemoveAvatar() {
    if (!user?.id) return;
    if (!profile?.avatar_url && !avatarPreview) return;

    const confirmOk = window.confirm("Supprimer ton avatar ?");
    if (!confirmOk) return;

    setAvatarRemoving(true);
    setErr(null);
    setOk(null);

    try {
      const prevUrlRaw = (profile?.avatar_url ?? avatarPreview ?? "").split("?")[0];
      if (!prevUrlRaw) {
        setAvatarRemoving(false);
        return;
      }

      const prevPath = prevUrlRaw.startsWith("http")
        ? storagePathFromPublicUrl(prevUrlRaw, "avatars")
        : prevUrlRaw;

      setAvatarAnimOut(true);

      window.setTimeout(async () => {
        const { error: upErr } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", user.id);

        if (upErr) throw upErr;

        setAvatarPreview(null);
        setProfile((p) => (p ? { ...p, avatar_url: null } : p));

        setUndoPayload({ prevAvatarUrl: prevUrlRaw, prevAvatarPath: prevPath });
        setUndoVisible(true);
        setUndoSecondsLeft(5);
        setOk("Avatar supprimé. Annuler ?");

        if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
        undoTimerRef.current = window.setInterval(() => {
          setUndoSecondsLeft((s) => {
            const next = s - 1;
            return next <= 0 ? 0 : next;
          });
        }, 1000);

        if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = window.setTimeout(async () => {
          try {
            setUndoVisible(false);
            setUndoPayload(null);
            setOk(null);
            if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
            undoTimerRef.current = null;

            if (prevPath) {
              await supabase.storage.from("avatars").remove([prevPath]);
            }
          } catch {
            // ignore
          } finally {
            deleteTimerRef.current = null;
          }
        }, 5000);

        setAvatarAnimOut(false);
      }, 160);
    } catch (e: any) {
      setAvatarAnimOut(false);
      setErr(e?.message ?? "Erreur suppression avatar");
    } finally {
      setAvatarRemoving(false);
    }
  }

  async function onUndoRemoveAvatar() {
    if (!user?.id) return;
    if (!undoPayload) return;

    if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    undoTimerRef.current = null;
    deleteTimerRef.current = null;

    setUndoVisible(false);
    setUndoSecondsLeft(0);

    setErr(null);
    setOk(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: undoPayload.prevAvatarUrl })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((p) => (p ? { ...p, avatar_url: undoPayload.prevAvatarUrl } : p));
      setAvatarPreview(withCacheBuster(undoPayload.prevAvatarUrl, String(Date.now())));
      setOk("Avatar restauré ✅");
      window.setTimeout(() => setOk(null), 2200);
    } catch (e: any) {
      setErr(e?.message ?? "Impossible d’annuler");
    } finally {
      setUndoPayload(null);
    }
  }

  async function onChangePassword() {
    if (!canChangePassword) return;

    setPwSaving(true);
    setErr(null);
    setOk(null);

    const { error } = await supabase.auth.updateUser({ password: pw1 });

    if (error) {
      setErr(
        error.message ||
          "Impossible de changer le mot de passe. Essaie de te reconnecter puis réessaie."
      );
      setPwSaving(false);
      return;
    }

    setPw1("");
    setPw2("");
    setOk("Mot de passe mis à jour ✅");
    setPwSaving(false);
    window.setTimeout(() => setOk(null), 2200);
  }

  async function onDeleteAccount() {
    const confirmed = window.confirm(
      "⚠️ Supprimer ton compte ?\nCette action est irréversible (recettes, groupes, profil, etc.)."
    );
    if (!confirmed) return;

    setErr(null);
    setOk(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setErr("Session introuvable. Déconnecte-toi puis reconnecte-toi avant de réessayer.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        let message = error.message || "Erreur suppression compte";

        try {
          const raw = await error.context?.json?.();
          message = raw?.details || raw?.error || message;
        } catch {
          // ignore
        }

        setErr(message);
        return;
      }

      if (!data?.ok) {
        setErr(data?.error || "Erreur suppression compte");
        return;
      }

      await supabase.auth.signOut();
      window.location.hash = "/";
      window.location.reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
      if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050b1f] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-lg font-semibold">Paramètres</div>
          <p className="mt-2 text-sm text-white/70">
            Tu dois être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  const TabBtn = ({
    k,
    label,
    icon,
    badge,
  }: {
    k: SettingsTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }) => {
    const active = tab === k;
    const showBadge = typeof badge === "number" && badge > 0;
    return (
      <button
        type="button"
        onClick={() => {
          setTab(k);
        }}
        className={cn(
          "flex items-center justify-between gap-3 w-full rounded-2xl px-3 py-2.5 text-sm transition",
          "ring-1",
          active
            ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
            : "bg-white/[0.04] text-slate-200/90 ring-white/10 hover:bg-white/[0.07]"
        )}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="text-white/75">{icon}</span>
          <span className="truncate">{label}</span>
        </span>
        {showBadge ? (
          <span className="min-w-[26px] h-6 px-2 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-xs font-bold">
            {badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className={cn("min-h-screen text-white", ui?.dashboardBg)}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Paramètres</h1>
            <p className="mt-1 text-sm text-white/60">Profil, notifications et compte.</p>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving || loading}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              "bg-amber-400 text-black shadow-lg",
              "hover:bg-amber-300 transition",
              "ring-1 ring-amber-300/60",
              (!canSave || saving || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        </div>

        {/* Alert */}
        {(err || ok) && (
          <div
            className={cn(
              "mt-5 rounded-2xl border p-4 text-sm",
              err
                ? "border-red-500/30 bg-red-500/10 text-red-100"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">{err ?? ok}</div>

              {undoVisible && !err && (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onUndoRemoveAvatar}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    Annuler ({undoSecondsLeft}s)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left tabs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">Connecté en tant que</div>
              <div className="mt-1 text-sm font-medium break-all">{user.email}</div>

              <button
                type="button"
                onClick={signOut}
                className="
                  mt-3 inline-flex items-center gap-2
                  rounded-xl px-3 py-2 text-sm font-medium
                  border border-red-500/30
                  bg-red-500/10 text-red-100
                  hover:bg-red-500/15
                  transition
                "
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="px-1 pt-1 text-xs text-white/50 uppercase tracking-wide">
                Navigation
              </div>

              <TabBtn k="profile" label="Profil" icon={<User className="h-4 w-4" />} />
              <TabBtn k="notifications" label="Notifications" icon={<Bell className="h-4 w-4" />} />
              <TabBtn
                k="invitations"
                label="Invitations"
                icon={<Mail className="h-4 w-4" />}
                badge={invCount}
              />
              <TabBtn k="security" label="Sécurité" icon={<Shield className="h-4 w-4" />} />
              <TabBtn k="subscription" label="abonnement" icon={<CreditCard className="h-4 w-4" />} />              
              <TabBtn k="account" label="Compte" icon={<Trash2 className="h-4 w-4" />} />
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-8 space-y-5">
            {tab === "profile" && (
              <ProfileSettings
                loading={loading}
                avatarPreview={avatarPreview}
                avatarAnimOut={avatarAnimOut}
                avatarRemoving={avatarRemoving}
                avatarUploading={avatarUploading}
                avatarInitial={avatarInitial}
                defaultAvatarBg={defaultAvatarBg}
                fileRef={fileRef}
                onRemoveAvatar={onRemoveAvatar}
                onPickAvatar={onPickAvatar}
                fullName={fullName}
                setFullName={setFullName}
                username={username}
                setUsername={setUsername}
                usernameError={
                  !isValidUsername(username)
                    ? "Format invalide"
                    : undefined
                }
                locale={locale}
                setLocale={setLocale}
                bio={bio}
                setBio={setBio}
              />
            )}

            {tab === "notifications" && (
              <NotificationsSettings
                loading={loading}
                notifEmail={notifEmail}
                setNotifEmail={setNotifEmail}
                notifPush={notifPush}
                setNotifPush={setNotifPush}
                marketingEmail={marketingEmail}
                setMarketingEmail={setMarketingEmail}
              />
            )}

            {tab === "invitations" && (
              <InvitationsSettings
                loading={invLoading}
                error={invErr}
                invitations={invitations}
                joiningToken={joiningToken}
                onAcceptInvitation={onAcceptInvitation}
              />
            )}

            {tab === "security" && (
              <SecuritySettings
                loading={loading}
                pwShow={pwShow}
                setPwShow={setPwShow}
                pw1={pw1}
                setPw1={setPw1}
                pw2={pw2}
                setPw2={setPw2}
                pwStrength={pwStrength}
                pwMatch={pwMatch}
                canChangePassword={canChangePassword}
                pwSaving={pwSaving}
                onChangePassword={onChangePassword}
              />
            )}

            {tab === "subscription" && (
              <SubscriptionSettings
                onOpenCheckout={() => onViewChange?.("subscription-checkout")}
              />
            )}
                     
            {tab === "account" && (
              <AccountSettings
                loading={loading}
                onDeleteAccount={onDeleteAccount}
              />
            )}
          </div>
        </div>

        {/* Save button mobile */}
        <div className="lg:hidden mt-6">
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave || saving || loading}
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium border",
              "border-white/10 bg-white/10 hover:bg-white/15 transition",
              (!canSave || saving || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
