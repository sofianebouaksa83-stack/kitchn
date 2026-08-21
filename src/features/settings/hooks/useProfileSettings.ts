import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

import type { ProfileRow } from "../types/settings.types";

import {
  isValidUrl,
  isValidUsername,
  storagePathFromPublicUrl,
  withCacheBuster,
} from "../services/settingsHelpers";

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
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [profile, setProfile] =
    useState<ProfileRow | null>(null);

  const [fullName, setFullName] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [website, setWebsite] =
    useState("");

  const [locale, setLocale] =
    useState<"fr" | "en">("fr");

  const [notifEmail, setNotifEmail] =
    useState(true);

  const [notifPush, setNotifPush] =
    useState(false);

  const [
    marketingEmail,
    setMarketingEmail,
  ] = useState(false);

  const [
    restaurantRole,
    setRestaurantRole,
  ] = useState("");

  const fileRef =
    useRef<HTMLInputElement | null>(null);

  const [
    avatarPreview,
    setAvatarPreview,
  ] = useState<string | null>(null);

  const [
    avatarUploading,
    setAvatarUploading,
  ] = useState(false);

  const [
    avatarRemoving,
    setAvatarRemoving,
  ] = useState(false);

  const [
    avatarAnimOut,
    setAvatarAnimOut,
  ] = useState(false);

  const undoTimerRef =
    useRef<number | null>(null);

  const deleteTimerRef =
    useRef<number | null>(null);

  const [
    undoVisible,
    setUndoVisible,
  ] = useState(false);

  const [
    undoSecondsLeft,
    setUndoSecondsLeft,
  ] = useState(0);

  const [
    undoPayload,
    setUndoPayload,
  ] = useState<{
    prevAvatarUrl: string;
    prevAvatarPath: string | null;
  } | null>(null);

  const canSave = useMemo(() => {
    if (!user?.id) return false;

    if (!isValidUsername(username))
      return false;

    if (!isValidUrl(website))
      return false;

    return true;
  }, [
    user?.id,
    username,
    website,
  ]);

  const avatarInitial = useMemo(() => {
    const value =
      fullName?.trim()?.[0] ||
      username?.trim()?.[0] ||
      user?.email?.trim()?.[0] ||
      "?";

    return String(value).toUpperCase();
  }, [
    fullName,
    username,
    user?.email,
  ]);

  const defaultAvatarBg =
    useMemo(() => {
      const seed = `${
        user?.id ?? ""
      }-${avatarInitial}`;

      let hash = 0;

      for (
        let index = 0;
        index < seed.length;
        index++
      ) {
        hash =
          (hash * 31 +
            seed.charCodeAt(index)) >>>
          0;
      }

      const hue = hash % 360;

      return `linear-gradient(135deg, hsla(${hue}, 85%, 60%, 0.35), hsla(${
        (hue + 40) % 360
      }, 85%, 55%, 0.18))`;
    }, [
      user?.id,
      avatarInitial,
    ]);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);
      setSuccess(null);

      const { data, error } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (!alive) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      let row =
        (data as ProfileRow | null) ??
        null;

      if (!row) {
        const {
          data: inserted,
          error: insertError,
        } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            locale: "fr",
          })
          .select("*")
          .single();

        if (!alive) return;

        if (insertError) {
          setError(insertError.message);
          setLoading(false);
          return;
        }

        row = inserted as ProfileRow;
      }

      setProfile(row);

      setFullName(
        row.full_name ?? ""
      );

      setUsername(
        row.username ?? ""
      );

      setBio(row.bio ?? "");
      setWebsite(row.website ?? "");

      setLocale(
        (row.locale as "fr" | "en") ||
          "fr"
      );

      setNotifEmail(
        row.notifications_email ??
          true
      );

      setNotifPush(
        row.notifications_push ??
          false
      );

      setMarketingEmail(
        row.marketing_email ??
          false
      );

      setRestaurantRole(
        row.restaurant_role ?? ""
      );

      const nextAvatar =
        row.avatar_url &&
        row.updated_at
          ? withCacheBuster(
              row.avatar_url,
              row.updated_at
            )
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
    setError(null);
    setSuccess(null);

    const payload:
      Partial<ProfileRow> = {
      full_name:
        fullName.trim() || null,

      username:
        username.trim() || null,

      bio:
        bio.trim() || null,

      website:
        website.trim() || null,

      locale,

      notifications_email:
        notifEmail,

      notifications_push:
        notifPush,

      marketing_email:
        marketingEmail,

      restaurant_role:
        restaurantRole.trim() ||
        null,
    };

    const { error } =
      await supabase
        .from("profiles")
        .update(payload)
        .eq("id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSuccess("Enregistré ✅");
    setSaving(false);

    window.setTimeout(() => {
      setSuccess(null);
    }, 2200);
  }

  async function onPickAvatar(
    file: File
  ) {
    if (!user?.id) return;

    setAvatarUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "png";

      const path =
        `${user.id}/avatar.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(path, file, {
            upsert: true,
            contentType:
              file.type,
          });

      if (uploadError)
        throw uploadError;

      const { data } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(path);

      const publicUrl =
        data.publicUrl;

      const { error: saveError } =
        await supabase
          .from("profiles")
          .update({
            avatar_url:
              publicUrl,
          })
          .eq("id", user.id);

      if (saveError)
        throw saveError;

      if (undoTimerRef.current) {
        window.clearInterval(
          undoTimerRef.current
        );
      }

      if (deleteTimerRef.current) {
        window.clearTimeout(
          deleteTimerRef.current
        );
      }

      undoTimerRef.current = null;
      deleteTimerRef.current =
        null;

      setUndoVisible(false);
      setUndoPayload(null);

      setAvatarAnimOut(false);

      setAvatarPreview(
        withCacheBuster(
          publicUrl,
          String(Date.now())
        )
      );

      setSuccess(
        "Avatar mis à jour ✅"
      );

      window.setTimeout(() => {
        setSuccess(null);
      }, 2200);
    } catch (error: any) {
      setError(
        error?.message ??
          "Erreur upload avatar"
      );
    } finally {
      setAvatarUploading(false);
    }
  }

  async function onRemoveAvatar() {
    if (!user?.id) return;

    if (
      !profile?.avatar_url &&
      !avatarPreview
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Supprimer ton avatar ?"
      );

    if (!confirmed) return;

    setAvatarRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      const previousUrl =
        (
          profile?.avatar_url ??
          avatarPreview ??
          ""
        ).split("?")[0];

      if (!previousUrl) {
        setAvatarRemoving(false);
        return;
      }

      const previousPath =
        previousUrl.startsWith(
          "http"
        )
          ? storagePathFromPublicUrl(
              previousUrl,
              "avatars"
            )
          : previousUrl;

      setAvatarAnimOut(true);

      window.setTimeout(
        async () => {
          const {
            error: updateError,
          } = await supabase
            .from("profiles")
            .update({
              avatar_url: null,
            })
            .eq(
              "id",
              user.id
            );

          if (updateError)
            throw updateError;

          setAvatarPreview(null);

          setProfile(
            (current) =>
              current
                ? {
                    ...current,
                    avatar_url:
                      null,
                  }
                : current
          );

          setUndoPayload({
            prevAvatarUrl:
              previousUrl,

            prevAvatarPath:
              previousPath,
          });

          setUndoVisible(true);
          setUndoSecondsLeft(5);

          setSuccess(
            "Avatar supprimé. Annuler ?"
          );

          if (
            undoTimerRef.current
          ) {
            window.clearInterval(
              undoTimerRef.current
            );
          }

          undoTimerRef.current =
            window.setInterval(
              () => {
                setUndoSecondsLeft(
                  (seconds) => {
                    const next =
                      seconds - 1;

                    return next <= 0
                      ? 0
                      : next;
                  }
                );
              },
              1000
            );

          if (
            deleteTimerRef.current
          ) {
            window.clearTimeout(
              deleteTimerRef.current
            );
          }

          deleteTimerRef.current =
            window.setTimeout(
              async () => {
                try {
                  setUndoVisible(
                    false
                  );

                  setUndoPayload(
                    null
                  );

                  setSuccess(null);

                  if (
                    undoTimerRef.current
                  ) {
                    window.clearInterval(
                      undoTimerRef.current
                    );
                  }

                  undoTimerRef.current =
                    null;

                  if (
                    previousPath
                  ) {
                    await supabase.storage
                      .from(
                        "avatars"
                      )
                      .remove([
                        previousPath,
                      ]);
                  }
                } catch {
                  // ignore
                } finally {
                  deleteTimerRef.current =
                    null;
                }
              },
              5000
            );

          setAvatarAnimOut(false);
        },
        160
      );
    } catch (error: any) {
      setAvatarAnimOut(false);

      setError(
        error?.message ??
          "Erreur suppression avatar"
      );
    } finally {
      setAvatarRemoving(false);
    }
  }

  async function onUndoRemoveAvatar() {
    if (!user?.id) return;
    if (!undoPayload) return;

    if (undoTimerRef.current) {
      window.clearInterval(
        undoTimerRef.current
      );
    }

    if (deleteTimerRef.current) {
      window.clearTimeout(
        deleteTimerRef.current
      );
    }

    undoTimerRef.current = null;
    deleteTimerRef.current = null;

    setUndoVisible(false);
    setUndoSecondsLeft(0);

    setError(null);
    setSuccess(null);

    try {
      const { error } =
        await supabase
          .from("profiles")
          .update({
            avatar_url:
              undoPayload.prevAvatarUrl,
          })
          .eq("id", user.id);

      if (error) throw error;

      setProfile(
        (current) =>
          current
            ? {
                ...current,
                avatar_url:
                  undoPayload.prevAvatarUrl,
              }
            : current
      );

      setAvatarPreview(
        withCacheBuster(
          undoPayload.prevAvatarUrl,
          String(Date.now())
        )
      );

      setSuccess(
        "Avatar restauré ✅"
      );

      window.setTimeout(() => {
        setSuccess(null);
      }, 2200);
    } catch (error: any) {
      setError(
        error?.message ??
          "Impossible d’annuler"
      );
    } finally {
      setUndoPayload(null);
    }
  }

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        window.clearInterval(
          undoTimerRef.current
        );
      }

      if (deleteTimerRef.current) {
        window.clearTimeout(
          deleteTimerRef.current
        );
      }
    };
  }, []);

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

    fileRef,

    avatarPreview,
    avatarUploading,
    avatarRemoving,
    avatarAnimOut,

    avatarInitial,
    defaultAvatarBg,

    undoVisible,
    undoSecondsLeft,

    onSave,
    onPickAvatar,
    onRemoveAvatar,
    onUndoRemoveAvatar,
  };
}