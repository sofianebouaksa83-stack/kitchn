import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";
import {
  getErrorMessage,
  storagePathFromPublicUrl,
  withCacheBuster,
} from "../services/settingsHelpers";
import type { ProfileRow } from "../types/settings.types";

type SettingsUser = {
  id: string;
  email?: string | null;
};

type UseAvatarSettingsProps = {
  user?: SettingsUser | null;
  profile: ProfileRow | null;
  setProfile: Dispatch<SetStateAction<ProfileRow | null>>;
  fullName: string;
  username: string;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
};

type UndoPayload = {
  prevAvatarUrl: string;
  prevAvatarPath: string | null;
};

export function useAvatarSettings({
  user,
  profile,
  setProfile,
  fullName,
  username,
  setError,
  setSuccess,
}: UseAvatarSettingsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const undoTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [avatarAnimOut, setAvatarAnimOut] = useState(false);
  const [undoVisible, setUndoVisible] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);
  const [undoPayload, setUndoPayload] = useState<UndoPayload | null>(null);

  const avatarInitial = useMemo(() => {
    const value =
      fullName.trim()[0] ||
      username.trim()[0] ||
      user?.email?.trim()[0] ||
      "?";

    return value.toUpperCase();
  }, [fullName, username, user?.email]);

  const defaultAvatarBg = useMemo(() => {
    const seed = `${user?.id ?? ""}-${avatarInitial}`;
    let hash = 0;

    for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }

    const hue = hash % 360;
    return `linear-gradient(135deg, hsla(${hue}, 85%, 60%, 0.35), hsla(${(hue + 40) % 360}, 85%, 55%, 0.18))`;
  }, [user?.id, avatarInitial]);

  function clearUndoTimers() {
    if (undoTimerRef.current) {
      window.clearInterval(undoTimerRef.current);
    }

    if (deleteTimerRef.current) {
      window.clearTimeout(deleteTimerRef.current);
    }

    undoTimerRef.current = null;
    deleteTimerRef.current = null;
  }

  async function onPickAvatar(file: File) {
    if (!user?.id) return;

    setAvatarUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `${user.id}/avatar.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: saveError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (saveError) throw saveError;

      clearUndoTimers();
      setUndoVisible(false);
      setUndoPayload(null);
      setAvatarAnimOut(false);
      setAvatarPreview(withCacheBuster(publicUrl, String(Date.now())));
      setSuccess("Avatar mis à jour ✅");

      window.setTimeout(() => setSuccess(null), 2200);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erreur upload avatar"));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function onRemoveAvatar() {
    if (!user?.id) return;
    if (!profile?.avatar_url && !avatarPreview) return;

    const confirmed = window.confirm("Supprimer ton avatar ?");
    if (!confirmed) return;

    setAvatarRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      const previousUrl = (profile?.avatar_url ?? avatarPreview ?? "").split("?")[0];

      if (!previousUrl) {
        setAvatarRemoving(false);
        return;
      }

      const previousPath = previousUrl.startsWith("http")
        ? storagePathFromPublicUrl(previousUrl, "avatars")
        : previousUrl;

      setAvatarAnimOut(true);

      window.setTimeout(async () => {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", user.id);

        if (updateError) throw updateError;

        setAvatarPreview(null);
        setProfile((current) =>
          current ? { ...current, avatar_url: null } : current
        );
        setUndoPayload({
          prevAvatarUrl: previousUrl,
          prevAvatarPath: previousPath,
        });
        setUndoVisible(true);
        setUndoSecondsLeft(5);
        setSuccess("Avatar supprimé. Annuler ?");

        if (undoTimerRef.current) {
          window.clearInterval(undoTimerRef.current);
        }

        undoTimerRef.current = window.setInterval(() => {
          setUndoSecondsLeft((seconds) => Math.max(seconds - 1, 0));
        }, 1000);

        if (deleteTimerRef.current) {
          window.clearTimeout(deleteTimerRef.current);
        }

        deleteTimerRef.current = window.setTimeout(async () => {
          try {
            setUndoVisible(false);
            setUndoPayload(null);
            setSuccess(null);

            if (undoTimerRef.current) {
              window.clearInterval(undoTimerRef.current);
            }

            undoTimerRef.current = null;

            if (previousPath) {
              await supabase.storage.from("avatars").remove([previousPath]);
            }
          } catch {
            // La suppression différée ne doit pas interrompre l'interface.
          } finally {
            deleteTimerRef.current = null;
          }
        }, 5000);

        setAvatarAnimOut(false);
      }, 160);
    } catch (error: unknown) {
      setAvatarAnimOut(false);
      setError(getErrorMessage(error, "Erreur suppression avatar"));
    } finally {
      setAvatarRemoving(false);
    }
  }

  async function onUndoRemoveAvatar() {
    if (!user?.id || !undoPayload) return;

    clearUndoTimers();
    setUndoVisible(false);
    setUndoSecondsLeft(0);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: undoPayload.prevAvatarUrl })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((current) =>
        current
          ? { ...current, avatar_url: undoPayload.prevAvatarUrl }
          : current
      );
      setAvatarPreview(
        withCacheBuster(undoPayload.prevAvatarUrl, String(Date.now()))
      );
      setSuccess("Avatar restauré ✅");

      window.setTimeout(() => setSuccess(null), 2200);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Impossible d’annuler"));
    } finally {
      setUndoPayload(null);
    }
  }

  useEffect(() => {
    return () => clearUndoTimers();
  }, []);

  return {
    fileRef,
    avatarPreview,
    setAvatarPreview,
    avatarUploading,
    avatarRemoving,
    avatarAnimOut,
    avatarInitial,
    defaultAvatarBg,
    undoVisible,
    undoSecondsLeft,
    onPickAvatar,
    onRemoveAvatar,
    onUndoRemoveAvatar,
  };
}
