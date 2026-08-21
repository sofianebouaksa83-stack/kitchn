import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { PendingInvitationRow } from "../components/InvitationsSettings";

type UseInvitationsSettingsProps = {
  userId?: string;
  active: boolean;
};

export function useInvitationsSettings({
  userId,
  active,
}: UseInvitationsSettingsProps) {
  const [invLoading, setInvLoading] =
    useState(false);

  const [invErr, setInvErr] =
    useState<string | null>(null);

  const [invitations, setInvitations] =
    useState<PendingInvitationRow[]>([]);

  const [invCount, setInvCount] =
    useState(0);

  const [joiningToken, setJoiningToken] =
    useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadCount() {
      if (!userId) return;

      try {
        const { data, error } =
          await supabase.rpc(
            "get_my_pending_invitations_count"
          );

        if (error) throw error;
        if (!alive) return;

        setInvCount(Number(data ?? 0));
      } catch {
        if (!alive) return;
        setInvCount(0);
      }
    }

    loadCount();

    const timer =
      window.setInterval(loadCount, 15000);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [userId]);

  useEffect(() => {
    let alive = true;

    async function loadInvitations() {
      if (!userId) return;
      if (!active) return;

      setInvErr(null);
      setInvLoading(true);

      try {
        const { data, error } =
          await supabase.rpc(
            "get_my_pending_invitations"
          );

        if (error) throw error;
        if (!alive) return;

        const rows =
          (
            (data as PendingInvitationRow[]) ??
            []
          ).filter(Boolean);

        setInvitations(rows);
        setInvCount(rows.length);
      } catch (error: any) {
        if (!alive) return;

        setInvErr(
          error?.message ??
            "Impossible de charger les invitations."
        );

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
  }, [userId, active]);

  async function onAcceptInvitation(
    token: string
  ) {
    if (!userId) return;

    setInvErr(null);
    setJoiningToken(token);

    try {
      const { error } = await supabase.rpc(
        "accept_group_invitation",
        {
          invitation_token: token,
        }
      );

      if (error) throw error;

      const { data } = await supabase.rpc(
        "get_my_pending_invitations"
      );

      const rows =
        (
          (data as PendingInvitationRow[]) ??
          []
        ).filter(Boolean);

      setInvitations(rows);
      setInvCount(rows.length);

      window.location.hash = "/groups";
    } catch (error: any) {
      setInvErr(
        error?.message ??
          "Impossible d'accepter l'invitation."
      );
    } finally {
      setJoiningToken(null);
    }
  }

  return {
    invLoading,
    invErr,
    invitations,
    invCount,
    joiningToken,
    onAcceptInvitation,
  };
}