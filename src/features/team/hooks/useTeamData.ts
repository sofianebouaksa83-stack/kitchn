import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  GroupRole,
  Invitation,
  TeamMember,
} from "../types/team.types";
import { normalizeRole } from "../utils/teamHelpers";

type UseTeamDataParams = {
  userId?: string;
  activeGroupId: string;
};

export function useTeamData({
  userId,
  activeGroupId,
}: UseTeamDataParams) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [groupOwnerId, setGroupOwnerId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GroupRole | null>(null);

  useEffect(() => {
    if (!activeGroupId) {
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
      setGroupOwnerId(null);
      setMyRole(null);
      setLoading(false);
      return;
    }

    void loadTeamData(activeGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  async function loadTeamData(workGroupId: string) {
    if (!userId) return;

    setLoading(true);

    try {
      const { data: group, error: groupErr } = await supabase
        .from("work_groups")
        .select("id, created_by, name, restaurant_id")
        .eq("id", workGroupId)
        .maybeSingle();

      if (groupErr) throw groupErr;

      setGroupOwnerId(group?.created_by ?? null);
      
      const isOwnerNow = (group?.created_by ?? null) === userId;

      const { data: myMembership, error: memErr } = await supabase
        .from("group_members")
        .select("role")
        .eq("work_group_id", workGroupId)
        .eq("user_id", userId)
        .maybeSingle();

      if (memErr) throw memErr;

      const my = normalizeRole(myMembership?.role);
      setMyRole(myMembership ? my : null);

      const isSecondNow = myMembership?.role === "admin";
      setCanAccess(Boolean(isOwnerNow || isSecondNow));

      const { data: gm, error: gmErr } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          role,
          profiles!group_members_user_id_fkey (
            id, email, full_name, job_title
          )
        `
        )
        .eq("work_group_id", workGroupId);

      if (gmErr) throw gmErr;

      const members: TeamMember[] = (gm ?? [])
        .map((row: any) => ({
          id: row.user_id,
          email: row.profiles?.email ?? "",
          full_name: row.profiles?.full_name ?? "Sans nom",
          job_title: row.profiles?.job_title ?? "",
          role: normalizeRole(row.role),
        }))
        .sort((a, b) =>
          (a.full_name || "").localeCompare(b.full_name || "")
        );

      setTeamMembers(members);

      const { data: invites, error: invErr } = await supabase
        .from("invitations")
        .select("*")
        .eq("work_group_id", workGroupId)
        .is("accepted_at", null);

      if (invErr) {
        console.warn(
          "[TeamManagement] Invitations query failed. Vérifie invitations.work_group_id.",
          invErr
        );
        setInvitations([]);
      } else {
        setInvitations((invites ?? []) as Invitation[]);
      }
    } catch (error) {
      console.error("[TeamManagement] loadTeamData error:", error);
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
      setGroupOwnerId(null);
      setMyRole(null);      
    } finally {
      setLoading(false);
    }
  }

  return {
    teamMembers,
    invitations,
    loading,
    canAccess,
    groupOwnerId,
    myRole,
    loadTeamData,
  };
}