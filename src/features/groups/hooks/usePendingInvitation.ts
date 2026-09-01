import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  InvitationRow,
  InviteViewState,
} from "../types/groups.types";

type InvitationQueryRow = Omit<
  InvitationRow,
  "restaurants"
> & {
  restaurants:
    | Array<{ name: string | null }>
    | { name: string | null }
    | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function computeInviteState(inv: InvitationRow | null): InviteViewState {
  if (!inv) return "none";
  if (inv.accepted_at) return "accepted";
  if (inv.expires_at) {
    const exp = new Date(inv.expires_at).getTime();
    if (!Number.isNaN(exp) && exp < Date.now()) return "expired";
  }
  return "pending";
}

export function usePendingInvitation(opts: {
  userId: string | null;
  refreshProfile: () => Promise<void>;
  onAccepted: () => Promise<void>;
}) {
  const { userId, refreshProfile, onAccepted } = opts;

  const [checkingInvite, setCheckingInvite] = useState(false);
  const [acceptingInvite, setAcceptingInvite] = useState(false);
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState<InvitationRow | null>(null);
  const [inviteState, setInviteState] = useState<InviteViewState>("none");
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  async function loadPendingInvitation() {
    if (!userId) return;

    setCheckingInvite(true);
    setInviteMsg(null);
    setPendingInvite(null);
    setInviteState("none");
    setAcceptSuccess(false);

    try {
      const { data, error } = await supabase
        .from("invitations")
        .select(
          "id, restaurant_id, invited_user_id, role, token, expires_at, accepted_at, created_at, restaurants(name)"
        )
        .eq("invited_user_id", userId)
        .is("accepted_at", null)
        .or("expires_at.is.null,expires_at.gt.now()")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setPendingInvite(null);
        setInviteState("none");
        setInviteMsg("Aucune invitation en attente pour ce compte.");
        return;
      }

      const row = data as unknown as InvitationQueryRow;
      const restaurants = Array.isArray(row.restaurants)
        ? row.restaurants[0] ?? null
        : row.restaurants;
      const inv: InvitationRow = {
        ...row,
        restaurants,
      };
      setPendingInvite(inv);
      setInviteState(computeInviteState(inv));
    } catch (error: unknown) {
      setInviteMsg(
        getErrorMessage(
          error,
          "Erreur lors de la détection de l’invitation."
        )
      );
      setInviteState("none");
    } finally {
      setCheckingInvite(false);
    }
  }

  async function handleAcceptInvitation() {
    const inviteToken = pendingInvite?.token;
    if (!inviteToken) {
      setInviteMsg("Token d'invitation introuvable.");
      return;
    }

    setAcceptingInvite(true);
    setInviteMsg(null);
    setAcceptSuccess(false);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const { error } = await supabase.functions.invoke("accept-invitation", {
        body: { token: inviteToken },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (error) throw error;

      await refreshProfile();
      setAcceptSuccess(true);
      await onAccepted();
    } catch (error: unknown) {
      setInviteMsg(
        getErrorMessage(
          error,
          "Impossible d’accepter l’invitation."
        )
      );
    } finally {
      setAcceptingInvite(false);
    }
  }

  return {
    checkingInvite,
    acceptingInvite,
    inviteMsg,
    pendingInvite,
    inviteState,
    acceptSuccess,
    loadPendingInvitation,
    handleAcceptInvitation,
  };
}
