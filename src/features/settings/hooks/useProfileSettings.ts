import { useEffect, useMemo, useState } from "react";

import {
  getErrorMessage,
  isValidUrl,
  isValidUsername,
  withCacheBuster,
} from "../services/settingsHelpers";
import {
  loadOrCreateProfile,
  saveProfile,
} from "../services/settingsProfileService";
import type { ProfileRow } from "../types/settings.types";
import { useAvatarSettings } from "./useAvatarSettings";

type UseProfileSettingsProps = {
  user?: {
    id: string;
    email?: string | null;
  } | null;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
};

export function useProfileSettings({
  user,
  setError,
  setSuccess,
}: UseProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [marketingEmail, setMarketingEmail] = useState(false);
  const [restaurantRole, setRestaurantRole] = useState("");

  const canSave = useMemo(
    () =>
      Boolean(user?.id) &&
      isValidUsername(username) &&
      isValidUrl(website),
    [user?.id, username, website]
  );

  const avatarSettings = useAvatarSettings({
    user,
    profile,
    setProfile,
    fullName,
    username,
    setError,
    setSuccess,
  });
  const { setAvatarPreview } = avatarSettings;

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const row = await loadOrCreateProfile(user.id);
        if (!alive) return;

        setProfile(row);
        setFullName(row.full_name ?? "");
        setUsername(row.username ?? "");
        setBio(row.bio ?? "");
        setWebsite(row.website ?? "");
        setLocale((row.locale as "fr" | "en") || "fr");
        setNotifEmail(row.notifications_email ?? true);
        setNotifPush(row.notifications_push ?? false);
        setMarketingEmail(row.marketing_email ?? false);
        setRestaurantRole(row.restaurant_role ?? "");

        const nextAvatar =
          row.avatar_url && row.updated_at
            ? withCacheBuster(row.avatar_url, row.updated_at)
            : row.avatar_url ?? null;

        setAvatarPreview(nextAvatar);
      } catch (error: unknown) {
        if (!alive) return;
        setError(getErrorMessage(error, "Impossible de charger le profil"));
      } finally {
        if (alive) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      alive = false;
    };
  }, [setAvatarPreview, setError, setSuccess, user?.id]);

  async function onSave() {
    if (!user?.id || !canSave) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

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

    try {
      await saveProfile(user.id, payload);
      setSuccess("Enregistré ✅");
      window.setTimeout(() => setSuccess(null), 2200);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Impossible d’enregistrer le profil"));
    } finally {
      setSaving(false);
    }
  }

  return {
    loading,
    saving,
    fullName,
    setFullName,
    username,
    setUsername,
    bio,
    setBio,
    website,
    setWebsite,
    locale,
    setLocale,
    notifEmail,
    setNotifEmail,
    notifPush,
    setNotifPush,
    marketingEmail,
    setMarketingEmail,
    restaurantRole,
    setRestaurantRole,
    canSave,
    fileRef: avatarSettings.fileRef,
    avatarPreview: avatarSettings.avatarPreview,
    avatarUploading: avatarSettings.avatarUploading,
    avatarRemoving: avatarSettings.avatarRemoving,
    avatarAnimOut: avatarSettings.avatarAnimOut,
    avatarInitial: avatarSettings.avatarInitial,
    defaultAvatarBg: avatarSettings.defaultAvatarBg,
    undoVisible: avatarSettings.undoVisible,
    undoSecondsLeft: avatarSettings.undoSecondsLeft,
    onSave,
    onPickAvatar: avatarSettings.onPickAvatar,
    onRemoveAvatar: avatarSettings.onRemoveAvatar,
    onUndoRemoveAvatar: avatarSettings.onUndoRemoveAvatar,
  };
}
