import { useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  GroupRole,
  Invitation,
  InviteStatus,
  TeamMember,
} from "../types/team.types";
import { isEmail } from "../utils/teamHelpers";

type UseTeamInvitationActionsParams = {
  activeGroupId: string;
  isPremium: boolean;
  currentCount: number;
  isOwner: boolean;
  teamMembers: TeamMember[];
  invitations: Invitation[];
  refreshPremiumStatus: () => Promise<void>;
  loadTeamData: (workGroupId: string) => Promise<void>;
};

export function useTeamInvitationActions({
  activeGroupId,
  isPremium,
  currentCount,
  isOwner,
  teamMembers,
  invitations,
  refreshPremiumStatus,
  loadTeamData,
}: UseTeamInvitationActionsParams) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<GroupRole>("commis");
  const [inviteStatus, setInviteStatus] =
    useState<InviteStatus>("idle");
  const [inviteMessage, setInviteMessage] = useState("");

  async function handleSendInvitation(event: FormEvent) {
    event.preventDefault();

    const email = inviteEmail.trim().toLowerCase();
    if (!activeGroupId) return;

    if (!email || !isEmail(email)) {
      setInviteStatus("error");
      setInviteMessage("Email invalide.");
      return;
    }

    if (!isPremium && currentCount >= 10) {
      setInviteStatus("error");
      setInviteMessage(
        "Limite Free atteinte : 10 membres (invitations incluses)."
      );
      return;
    }

    const alreadyMember = teamMembers.some(
      (member) => member.email?.toLowerCase() === email
    );

    const alreadyInvited = invitations.some(
      (invitation) => invitation.email?.toLowerCase() === email
    );

    if (alreadyMember) {
      setInviteStatus("error");
      setInviteMessage("Cette personne est déjà membre du groupe.");
      return;
    }

    if (alreadyInvited) {
      setInviteStatus("error");
      setInviteMessage(
        "Une invitation est déjà en attente pour cet email."
      );
      return;
    }

    if (!isOwner && inviteRole === "admin") {
      setInviteStatus("error");
      setInviteMessage("Seul le Chef peut inviter un Second.");
      return;
    }

    try {
      setInviteStatus("sending");
      setInviteMessage("");

      await refreshPremiumStatus();

      const { data, error } = await supabase.functions.invoke(
        "send-invitation",
        {
          body: {
            email,
            role: inviteRole,
            workGroupId: activeGroupId,
          },
        }
      );

      if (error) throw error;
      if (!data?.ok) {
        throw new Error(data?.error || "Erreur lors de l’envoi");
      }

      setInviteStatus("success");
      setInviteMessage(`Invitation envoyée à ${email}`);
      setInviteEmail("");
      setInviteRole("commis");
      setShowInviteForm(false);

      setTimeout(() => {
        void loadTeamData(activeGroupId);
        void refreshPremiumStatus();
        setInviteStatus("idle");
        setInviteMessage("");
      }, 600);
    } catch (error: any) {
      setInviteStatus("error");
      setInviteMessage(error?.message ?? "Erreur lors de l’envoi");
    }
  }

  async function handleDeleteInvitation(id: string) {
    if (!confirm("Supprimer cette invitation ?")) return;

    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (activeGroupId) {
      await loadTeamData(activeGroupId);
    }
  }

  return {
    showInviteForm,
    setShowInviteForm,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteStatus,
    inviteMessage,
    handleSendInvitation,
    handleDeleteInvitation,
  };
}