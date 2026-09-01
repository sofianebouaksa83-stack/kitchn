import  { useMemo, } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ui } from "../../styles/ui";
import { KitchNLoader } from "../Loading/KitchNLoader";
import { TeamInvitationsSection } from "../../features/team/components/TeamInvitationsSection";
import { TeamMembersSection } from "../../features/team/components/TeamMembersSection";
import { TeamHeader } from "../../features/team/components/TeamHeader"; 
import { TeamAccessDenied } from "../../features/team/components/TeamAccessDenied";
import { useTeamPlan } from "../../features/team/hooks/useTeamPlan";
import { useTeamGroups } from "../../features/team/hooks/useTeamGroups";
import { useTeamData } from "../../features/team/hooks/useTeamData";
import { useTeamMemberActions } from "../../features/team/hooks/useTeamMemberActions";
import { useTeamInvitationActions } from "../../features/team/hooks/useTeamInvitationActions";

export function TeamManagement() {

  const { user, profile } = useAuth();
  const { loadingPlan, isPremium, refreshPremiumStatus,} = useTeamPlan({ userId: user?.id, profile,});
  const { groups, activeGroupId, setActiveGroupId, loadingGroups,} = useTeamGroups({ userId: user?.id,});
  const { teamMembers, invitations, loading, canAccess, groupOwnerId, myRole, loadTeamData,} = useTeamData({ userId: user?.id, activeGroupId,});     
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

  const { showInviteForm, setShowInviteForm, inviteEmail, setInviteEmail, inviteRole, setInviteRole, inviteStatus, inviteMessage, handleSendInvitation, handleDeleteInvitation,} = useTeamInvitationActions({
  activeGroupId, isPremium, currentCount, isOwner, teamMembers, invitations, refreshPremiumStatus, loadTeamData,});

  const remainingSlots = useMemo(() => {
    if (!Number.isFinite(maxMembers)) return Infinity;
    return Math.max(0, (maxMembers as number) - currentCount);
  }, [maxMembers, currentCount]);
  
  
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