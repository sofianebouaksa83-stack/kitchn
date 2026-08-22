import { supabase } from "../../../lib/supabase";
import type { GroupRole } from "../types/team.types";

type UseTeamMemberActionsParams = {
  userId?: string;
  activeGroupId: string;
  canAccess: boolean;
  groupOwnerId: string | null;
  isOwner: boolean;
  isSecond: boolean;
  loadTeamData: (workGroupId: string) => Promise<void>;
};

export function useTeamMemberActions({
  userId,
  activeGroupId,
  canAccess,
  groupOwnerId,
  isOwner,
  isSecond,
  loadTeamData,
}: UseTeamMemberActionsParams) {
  async function handleChangeRole(
    memberId: string,
    nextRole: GroupRole
  ) {
    if (!activeGroupId || !userId || !canAccess) return;

    if (groupOwnerId && memberId === groupOwnerId) return;
    if (!isOwner && isSecond && nextRole === "admin") return;

    const { data: updated, error } = await supabase
      .from("group_members")
      .update({ role: nextRole })
      .eq("work_group_id", activeGroupId)
      .eq("user_id", memberId)
      .select("work_group_id, user_id, role");

    if (error) {
      console.error("UPDATE ERROR", error);
      alert("UPDATE ERROR: " + error.message);
      return;
    }

    if (!updated || updated.length === 0) {
      alert("UPDATE: 0 ligne modifiée (WHERE ne match pas)");
      return;
    }

    await loadTeamData(activeGroupId);
  }

  async function handleRemoveMember(memberId: string) {
    if (!activeGroupId || !userId || !canAccess) return;

    if (groupOwnerId && memberId === groupOwnerId) return;
    if (memberId === userId) return;

    const confirmed = confirm("Supprimer ce membre du groupe ?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("work_group_id", activeGroupId)
      .eq("user_id", memberId);

    if (error) {
      console.error("DELETE ERROR", error);
      alert("DELETE ERROR: " + error.message);
      return;
    }

    await loadTeamData(activeGroupId);
  }

  return {
    handleChangeRole,
    handleRemoveMember,
  };
}