import React, { useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { ui } from "../../styles/ui";
import { KitchNLoader } from "../Loading/KitchNLoader";
import type { GroupRole, InviteStatus,} from "../../features/team/types/team.types";
import { TeamInvitationsSection } from "../../features/team/components/TeamInvitationsSection";
import { TeamMembersSection } from "../../features/team/components/TeamMembersSection";
import { TeamHeader } from "../../features/team/components/TeamHeader"; 
import { TeamAccessDenied } from "../../features/team/components/TeamAccessDenied";
import { useTeamPlan } from "../../features/team/hooks/useTeamPlan";
import { useTeamGroups } from "../../features/team/hooks/useTeamGroups";
import { useTeamData } from "../../features/team/hooks/useTeamData";
import { useTeamMemberActions } from "../../features/team/hooks/useTeamMemberActions";

export function TeamManagement() {

  const { user, profile } = useAuth();
  const { loadingPlan, isPremium, refreshPremiumStatus,} = useTeamPlan({ userId: user?.id, profile,});
  const { groups, activeGroupId, setActiveGroupId, loadingGroups,} = useTeamGroups({ userId: user?.id,});
  const { teamMembers, invitations, loading, canAccess, groupOwnerId, myRole, loadTeamData,} = useTeamData({ userId: user?.id, activeGroupId,});
      
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<GroupRole>("commis");

  const [inviteStatus, setInviteStatus] = useState<InviteStatus>("idle");

  const [inviteMessage, setInviteMessage] = useState("");  
  
  const maxMembers = isPremium ? Infinity : 10;

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId]
  );

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return Boolean(groupOwnerId && groupOwnerId === user.id);
  }, [groupOwnerId, user?.id]);

  const isSecond = useMemo(() => myRole === "admin", [myRole]);

  const { handleChangeRole, handleRemoveMember,} = useTeamMemberActions({ userId: user?.id, activeGroupId, canAccess, groupOwnerId, isOwner, isSecond, loadTeamData,});

  const roleOptionsForManager = useMemo(() => {
    if (isOwner) {
      return [
        { value: "admin" as const, label: "Second" },
        { value: "chef_de_partie" as const, label: "Chef de partie (lecture seule)" },
        { value: "commis" as const, label: "Commis (lecture seule)" },
      ];
    }

    return [
      { value: "chef_de_partie" as const, label: "Chef de partie (lecture seule)" },
      { value: "commis" as const, label: "Commis (lecture seule)" },
    ];
  }, [isOwner]);

  const currentCount = useMemo(
    () => teamMembers.length + invitations.length,
    [teamMembers.length, invitations.length]
  );

  const remainingSlots = useMemo(() => {
    if (!Number.isFinite(maxMembers)) return Infinity;
    return Math.max(0, (maxMembers as number) - currentCount);
  }, [maxMembers, currentCount]);
  
  async function handleSendInvitation(e: React.FormEvent) {
    e.preventDefault();

    const email = inviteEmail.trim().toLowerCase();
    if (!activeGroupId) return;

    if (!email || !isEmail(email)) {
      setInviteStatus("error");
      setInviteMessage("Email invalide.");
      return;
    }

    if (!isPremium && currentCount >= 10) {
      setInviteStatus("error");
      setInviteMessage("Limite Free atteinte : 10 membres (invitations incluses).");
      return;
    }

    const alreadyMember = teamMembers.some((m) => m.email?.toLowerCase() === email);
    const alreadyInvited = invitations.some((i) => i.email?.toLowerCase() === email);

    if (alreadyMember) {
      setInviteStatus("error");
      setInviteMessage("Cette personne est déjà membre du groupe.");
      return;
    }

    if (alreadyInvited) {
      setInviteStatus("error");
      setInviteMessage("Une invitation est déjà en attente pour cet email.");
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

      const { data, error } = await supabase.functions.invoke("send-invitation", {
        body: {
          email,
          role: inviteRole,
          workGroupId: activeGroupId,
        },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Erreur lors de l’envoi");

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
    } catch (err: any) {
      setInviteStatus("error");
      setInviteMessage(err?.message ?? "Erreur lors de l’envoi");
    }
  }

  
  async function handleDeleteInvitation(id: string) {
    if (!confirm("Supprimer cette invitation ?")) return;

    const { error } = await supabase.from("invitations").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (activeGroupId) {
      await loadTeamData(activeGroupId);
    }
  }

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          <TeamHeader
            groups={groups}
            loadingGroups={loadingGroups}
            activeGroupId={activeGroupId}
            onActiveGroupChange={setActiveGroupId}
            loadingPlan={loadingPlan}
            isPremium={isPremium}
            remainingSlots={remainingSlots}
            loading={loading}
            membersCount={teamMembers.length}
            invitationsCount={invitations.length}
            activeGroupName={activeGroup?.name}
            canAccess={canAccess}
            isOwner={isOwner}
            isSecond={isSecond}
            showInviteForm={showInviteForm}
            onToggleInviteForm={() =>
              setShowInviteForm((visible) => !visible)
            }
          />

          {groups.length > 0 &&
            !loading &&
            !canAccess && (
              <TeamAccessDenied
                groupName={activeGroup?.name}
              />
            )}

          {groups.length > 0 && canAccess && (
            <>
              {loading ? (
                <div className="flex justify-center py-24">
                  <KitchNLoader className="kitchn-loader--compact" />
                </div>
              ) : (
                <>
                 <TeamInvitationsSection
                    showInviteForm={showInviteForm}
                    loadingPlan={loadingPlan}
                    isPremium={isPremium}
                    currentCount={currentCount}
                    isOwner={isOwner}
                    inviteEmail={inviteEmail}
                    onInviteEmailChange={setInviteEmail}
                    inviteRole={inviteRole}
                    onInviteRoleChange={setInviteRole}
                    inviteStatus={inviteStatus}
                    inviteMessage={inviteMessage}
                    invitations={invitations}
                    onSubmit={handleSendInvitation}
                    onDeleteInvitation={handleDeleteInvitation}
                  />
                <TeamMembersSection
                    members={teamMembers}
                    currentUserId={user?.id}
                    groupOwnerId={groupOwnerId}
                    canAccess={canAccess}
                    roleOptions={roleOptionsForManager}
                    onChangeRole={handleChangeRole}
                    onRemoveMember={handleRemoveMember}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}