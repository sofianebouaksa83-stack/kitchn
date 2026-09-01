import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type { Group } from "../types/team.types";

const GROUP_MEMBERS_TO_WORK_GROUPS_FK =
  "group_members_work_group_id_fkey";

export function useTeamGroups({
  userId,
}: {
  userId?: string;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setActiveGroupId("");
      setLoadingGroups(false);
      return;
    }

    void loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadGroups() {
    if (!userId) return;

    setLoadingGroups(true);

    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          work_group_id,
          role,
          work_groups!${GROUP_MEMBERS_TO_WORK_GROUPS_FK} (
            id,
            name,
            created_at,
            created_by
          )
        `
        )
        .eq("user_id", userId);

      if (error) throw error;

      const nextGroups: Group[] = (data ?? [])
        .map((member: any) => {
          const workGroup = member.work_groups;
          return Array.isArray(workGroup) ? workGroup[0] : workGroup;
        })
        .filter(Boolean);

      const uniqueGroups = Array.from(
        new Map(nextGroups.map((group) => [group.id, group])).values()
      );

      uniqueGroups.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setGroups(uniqueGroups);
      setActiveGroupId(
        (previousId) => previousId || uniqueGroups[0]?.id || ""
      );
    } catch (error) {
      console.error("[TeamManagement] loadGroups error:", error);
      setGroups([]);
      setActiveGroupId("");
    } finally {
      setLoadingGroups(false);
    }
  }

  return {
    groups,
    activeGroupId,
    setActiveGroupId,
    loadingGroups,
  };
}