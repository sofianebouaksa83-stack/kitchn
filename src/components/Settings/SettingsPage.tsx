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
  Eye,
  EyeOff,
  KeyRound,
  X,
} from "lucide-react";
import { ui } from "../../styles/ui";

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

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

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

// Essaie d’extraire le path storage à partir d’une URL publique Supabase
// Ex: https://xxx.supabase.co/storage/v1/object/public/avatars/<PATH>
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

// petit cache-bust pour éviter le vieux cache navigateur
function withCacheBuster(url: string, token: string) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}v=${encodeURIComponent(token)}`;
}

export default function SettingsPage() {
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
    const v =
      fullName?.trim()?.[0] ||
      username?.trim()?.[0] ||
      user?.email?.trim()?.[0] ||
      "?";
    return String(v).toUpperCase();
  }, [fullName, username, user?.email]);

  // teinte pseudo-aléatoire stable (basée sur l’initiale + id)
  const defaultAvatarBg = useMemo(() => {
    const seed = `${user?.id ?? ""}-${avatarInitial}`;
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const hue = h % 360;
    return `linear-gradient(135deg, hsla(${hue}, 85%, 60%, 0.35), hsla(${(hue + 40) % 360}, 85%, 55%, 0.18))`;
  }, [user?.id, avatarInitial]);

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

      // cache-bust léger (si updated_at existe)
      const nextAvatar =
        row.avatar_url && row.updated_at
          ? withCacheBuster(row.avatar_url, row.updated_at)
          : row.avatar_url ?? null;

      setAvatarPreview(nextAvatar);
      setLoading(false);
    }

    loadProfile();

    return () => {
      alive = false;
    };
  }, [user?.id]);

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

      // cancel undo timers if any
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
      // on récupère la valeur la plus fiable (celle du profil chargé)
      const prevUrlRaw = (profile?.avatar_url ?? avatarPreview ?? "").split("?")[0];
      if (!prevUrlRaw) {
        setAvatarRemoving(false);
        return;
      }

      const prevPath = prevUrlRaw.startsWith("http")
        ? storagePathFromPublicUrl(prevUrlRaw, "avatars")
        : prevUrlRaw;

      // animation out
      setAvatarAnimOut(true);

      // après un petit délai, on met à null en DB + UI
      window.setTimeout(async () => {
        // DB: avatar_url = null (immédiat)
        const { error: upErr } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", user.id);

        if (upErr) throw upErr;

        // UI: retire l'image
        setAvatarPreview(null);
        setProfile((p) => (p ? { ...p, avatar_url: null } : p));

        // Undo visible 5s
        setUndoPayload({ prevAvatarUrl: prevUrlRaw, prevAvatarPath: prevPath });
        setUndoVisible(true);
        setUndoSecondsLeft(5);
        setOk("Avatar supprimé. Annuler ?");

        // countdown
        if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
        undoTimerRef.current = window.setInterval(() => {
          setUndoSecondsLeft((s) => {
            const next = s - 1;
            return next <= 0 ? 0 : next;
          });
        }, 1000);

        // suppression storage après 5s (si pas undo)
        if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
        deleteTimerRef.current = window.setTimeout(async () => {
          try {
            setUndoVisible(false);
            setUndoPayload(null);
            setOk(null);
            if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
            undoTimerRef.current = null;

            // supprime le fichier seulement si on a un path
            if (prevPath) {
              await supabase.storage.from("avatars").remove([prevPath]);
            }
          } catch {
            // ignore (si ça rate, on ne casse pas l’UI)
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

    // stop timers
    if (undoTimerRef.current) window.clearInterval(undoTimerRef.current);
    if (deleteTimerRef.current) window.clearTimeout(deleteTimerRef.current);
    undoTimerRef.current = null;
    deleteTimerRef.current = null;

    setUndoVisible(false);
    setUndoSecondsLeft(0);

    setErr(null);
    setOk(null);

    try {
      // restore DB
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
    const ok = window.confirm(
      "⚠️ Supprimer ton compte ?\nCette action est irréversible (recettes, groupes, profil, etc.)."
    );
    if (!ok) return;

    setErr(null);
    setOk(null);

    const { data, error } = await supabase.functions.invoke("delete-account");

    if (error) {
      setErr(error.message);
      return;
    }
    if (!data?.ok) {
      setErr(data?.error || "Erreur suppression compte");
      return;
    }

    await supabase.auth.signOut();
    window.location.hash = "/";
    window.location.reload();
  }

  useEffect(() => {
    // nettoyage timers
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

              {/* Undo (bonus) */}
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
          {/* Left */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">Connecté en tant que</div>
              <div className="mt-1 text-sm font-medium break-all">{user.email}</div>

              {/* bouton déconnexion déjà style OK */}
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

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Raccourcis</div>
              <div className="mt-2 text-xs text-white/60">
                (Plus tard : invitations, préférences UI, etc.)
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="lg:col-span-8 space-y-5">
            {/* Profil */}
            <Section title="Profil" icon={<User className="h-4 w-4" />} loading={loading}>
              <div className="flex items-center gap-4">
                {/* Avatar + X (bonus) */}
                <div className="relative group">
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-white/10",
                      "transition-all duration-200",
                      avatarAnimOut ? "opacity-0 scale-[0.96]" : "opacity-100 scale-100"
                    )}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center"
                        style={{ backgroundImage: defaultAvatarBg }}
                      >
                        <div className="h-10 w-10 rounded-full bg-black/20 ring-1 ring-white/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-white/80">{avatarInitial}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bouton X supprimer */}
{avatarPreview && (
  <button
    type="button"
    onClick={onRemoveAvatar}
    disabled={avatarRemoving || avatarUploading}
    className={cn(
      "absolute -top-1 -right-1 h-5 w-5 rounded-full",
      "bg-red-500/80 hover:bg-red-500 text-white",
      "ring-1 ring-slate-950/70 border border-white/10",
      "flex items-center justify-center transition",
      "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
      "duration-150 ease-out",
      (avatarRemoving || avatarUploading) && "opacity-60 cursor-not-allowed"
    )}
    title="Supprimer l’avatar"
    aria-label="Supprimer l’avatar"
  >
    {avatarRemoving ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
    ) : (
      <X className="h-3.5 w-3.5" />
    )}
  </button>
)}

                </div>

                <div>
                  <button
                    type="button"
                    disabled={avatarUploading || avatarRemoving}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/10 hover:bg-white/15 transition",
                      (avatarUploading || avatarRemoving) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Changer l’avatar
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onPickAvatar(file);
                      e.currentTarget.value = "";
                    }}
                  />               
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom complet">
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
                    placeholder="Sofiane Bouaksa"
                  />
                </Field>

                <Field
                  label="Nom d’utilisateur"
                  hint=""
                  error={!isValidUsername(username) ? "Format invalide" : undefined}
                >
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
                    placeholder="soso_chef"
                  />
                </Field>

                <Field label="Langue">
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as any)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Espagnol</option>
                  </select>
                </Field>
              </div>
            </Section>

            {/* Notifications */}
            <Section title="Notifications" icon={<Bell className="h-4 w-4" />} loading={loading}>
              <Toggle label="Email (activité & partages)" checked={notifEmail} onChange={setNotifEmail} />
              <div className="h-2" />
              <Toggle label="Push (mobile) — plus tard" checked={notifPush} onChange={setNotifPush} />
              <div className="h-2" />
              <Toggle label="Emails marketing" checked={marketingEmail} onChange={setMarketingEmail} />
            </Section>

            {/* Sécurité */}
            <Section title="Sécurité" icon={<Shield className="h-4 w-4" />} loading={loading}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-white/80" />
                    <div className="text-sm font-medium">Changer le mot de passe</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPwShow((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border border-white/10 bg-white/10 hover:bg-white/15 transition"
                  >
                    {pwShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {pwShow ? "Masquer" : "Afficher"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Nouveau mot de passe</div>
                    <input
                      type={pwShow ? "text" : "password"}
                      value={pw1}
                      onChange={(e) => setPw1(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-yellow-300/50"
                          style={{ width: `${(pwStrength / 5) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-white/60">
                        {pw1.length === 0
                          ? "—"
                          : pwStrength <= 2
                          ? "Faible"
                          : pwStrength === 3
                          ? "OK"
                          : "Fort"}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">Min. 8 caractères.</div>
                  </div>

                  <div>
                    <div className="text-xs text-white/60 mb-1">Confirmer</div>
                    <input
                      type={pwShow ? "text" : "password"}
                      value={pw2}
                      onChange={(e) => setPw2(e.target.value)}
                      className={cn(
                        "w-full rounded-xl bg-white/5 border px-3 py-2 text-sm outline-none",
                        "focus:border-white/20",
                        pw2.length > 0 && !pwMatch ? "border-red-500/40" : "border-white/10"
                      )}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {pw2.length > 0 && !pwMatch && (
                      <div className="mt-1 text-xs text-red-200">Les mots de passe ne correspondent pas.</div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onChangePassword}
                    disabled={!canChangePassword || pwSaving}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border",
                      "border-white/10 bg-white/10 hover:bg-white/15 transition",
                      (!canChangePassword || pwSaving) && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Mettre à jour
                  </button>

                  <div className="mt-2 text-xs text-white/50">
                    Si Supabase refuse (session trop vieille), déconnecte-toi puis reconnecte-toi et réessaie.
                  </div>
                </div>
              </div>
            </Section>

            {/* Restaurant */}
            <Section title="Restaurant" icon={<Building2 className="h-4 w-4" />} loading={loading}>
              <Field label="Rôle restaurant (restaurant_role)">
                <input
                  value={restaurantRole}
                  onChange={(e) => setRestaurantRole(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
                  placeholder="chef | second | employé..."
                />
              </Field>
            </Section>

            {/* Compte */}
            <Section title="Compte" icon={<Trash2 className="h-4 w-4" />} loading={loading}>
              <button
                type="button"
                onClick={onDeleteAccount}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-red-500/30 bg-red-500/50 hover:bg-red-500/15 transition text-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer mon compte
              </button>
            </Section>
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

function Section({
  title,
  icon,
  loading,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/80">{icon}</span>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-white/60" /> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        {hint ? <div className="text-xs text-white/50">{hint}</div> : null}
      </div>
      <div className="mt-2">{children}</div>
      {error ? <div className="mt-1 text-xs text-red-200">{error}</div> : null}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
    >
      <span className="text-white/80">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full border transition",
          checked ? "bg-yellow-300/20 border-yellow-300/30" : "bg-white/10 border-white/10"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 translate-x-0 rounded-full bg-white/80 transition",
            checked ? "translate-x-5" : false
          )}
        />
      </span>
    </button>
  );
}
