import { useEffect, useState } from "react";
import {
  getInviteRoleLabel,
  sendGroupInvitation,
} from "../services/groupInvitationService";
import type {
  GroupWithMembers,
  InviteRole,
} from "../types/groups.types";

type UseGroupInvitationArgs = {
  open: boolean;
  group: GroupWithMembers | null;
  membersLimitReached: boolean;
  onInvitationSent?: () => Promise<void> | void;
};

export function useGroupInvitation({
  open,
  group,
  membersLimitReached,
  onInvitationSent,
}: UseGroupInvitationArgs) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<InviteRole>("commis");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] =
    useState<string | null>(null);
  const [inviteError, setInviteError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setInviteEmail("");
    setInviteRole("commis");
    setInviteSuccess(null);
    setInviteError(null);
  }, [open, group?.id]);

  const clearFeedback = () => {
    setInviteSuccess(null);
    setInviteError(null);
  };

  const sendInvitation = async () => {
    const email = inviteEmail.trim().toLowerCase();
    clearFeedback();

    if (!group?.id) {
      setInviteError("Groupe introuvable.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Entre une adresse email valide.");
      return;
    }

    if (membersLimitReached) {
      setInviteError(
        "Limite atteinte. Passe Premium pour ajouter plus de membres."
      );
      return;
    }

    try {
      setInviteLoading(true);
      await sendGroupInvitation({
        email,
        groupId: group.id,
        role: inviteRole,
      });

      setInviteEmail("");
      setInviteRole("commis");
      setInviteSuccess(
        `Invitation envoyée à ${email} pour rejoindre “${group.name}” en ${getInviteRoleLabel(inviteRole)}.`
      );

      await onInvitationSent?.();
    } catch (error: unknown) {
      setInviteError(
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer l’invitation."
      );
    } finally {
      setInviteLoading(false);
    }
  };

  return {
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteLoading,
    inviteSuccess,
    inviteError,
    clearFeedback,
    sendInvitation,
  };
}

export type GroupInvitationState = ReturnType<
  typeof useGroupInvitation
>;
