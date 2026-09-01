import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../../lib/supabase";
import type { NavbarProfile } from "../types/navigation.types";
import {
  isHttpUrl,
  withCacheBuster,
} from "../utils/navigationHelpers";

type UseNavbarProfileParams = {
  userId?: string;
  email?: string | null;
};

export function useNavbarProfile({
  userId,
  email,
}: UseNavbarProfileParams) {
  const [navProfile, setNavProfile] =
    useState<NavbarProfile | null>(null);

  useEffect(() => {
    if (!userId) {
      setNavProfile(null);
      return;
    }

    let cancelled = false;

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, username, avatar_url, updated_at"
        )
        .eq("id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (!error) {
        setNavProfile(
          (data as NavbarProfile | null) ?? null
        );
      }
    }

    void fetchProfile();

    const channel = supabase
      .channel(`nav-profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          void fetchProfile();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const displayName =
    navProfile?.full_name ||
    navProfile?.username ||
    email ||
    "Compte";

  const avatarUrl = useMemo(() => {
    const raw =
      navProfile?.avatar_url?.trim();

    if (!raw) return null;

    const token =
      navProfile?.updated_at || "1";

    if (isHttpUrl(raw)) {
      return withCacheBuster(raw, token);
    }

    const publicUrl = supabase.storage
      .from("avatars")
      .getPublicUrl(raw).data.publicUrl;

    return withCacheBuster(
      publicUrl,
      token
    );
  }, [
    navProfile?.avatar_url,
    navProfile?.updated_at,
  ]);

  const avatarFallback =
    navProfile?.full_name?.trim()?.[0] ||
    navProfile?.username?.trim()?.[0] ||
    email?.trim()?.[0] ||
    "?";

  return {
    displayName,
    avatarUrl,
    avatarFallback,
  };
}