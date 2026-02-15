import { useEffect, useMemo, useState } from "react";
import { supabase, Profile, WorkGroup } from "../../../../lib/supabase";
import type { PremiumGateKey } from "../../../../lib/entitlements";

export type GroupWithMembers = WorkGroup & {
  members: (Profile & { role: string })[];
  isOwner: boolean;
};

function isForbidden(err: any) {
  const msg = String(err?.message ?? "").toLowerCase();
  return (
    msg.includes("403") ||
    msg.includes("forbidden") ||
    msg.includes("not authorized") ||
    msg.includes("unauthorized")
  );
}

export function useWorkGroupsData(opts: {
  userId: string | null;
  isPremium: boolean;
  ent: { maxGroups: number; maxMembersPerGroup: number };
  openPremium: (key: PremiumGateKey) => void;
  onCreatedToast?: (groupName: string) => void;
}) {
  const { userId, isPremium, ent, openPremium, onCreatedToast } = opts;

  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(false);

  const [profileLoading, setProfileLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantRole, setRestaurantRole] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");

  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  const [manageLoading, setManageLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [teamUsers, setTeamUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const canManageGroups =
    !!userId && (restaurantRole === "chef" || restaurantRole === "owner" || restaurantId === null);

  const selectedGroupFresh = useMemo(() => {
    if (!selectedGroup) return null;
    return groups.find((g) => g.id === selectedGroup.id) ?? selectedGroup;
  }, [groups, selectedGroup]);

  const availableTeam = useMemo(() => {
    const g = selectedGroupFresh;
    if (!g) return [];
    const memberIds = new Set(g.members.map((m) => m.id));
    return teamUsers.filter((u) => !memberIds.has(u.id));
  }, [teamUsers, selectedGroupFresh]);

  async function loadTeamUsers(restaurantIdParam: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, restaurant_id, restaurant_role")
      .eq("restaurant_id", restaurantIdParam)
      .order("full_name", { ascending: true });

    if (error) throw error;
    setTeamUsers(data ?? []);
  }

  async function loadGroups() {
    if (!userId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // ✅ memberships : colonne = work_group_id
      const { data: membershipData, error: mErr } = await supabase
        .from("group_members")
        .select("work_group_id")
        .eq("user_id", userId);

      if (mErr) throw mErr;

      const groupIds = (membershipData ?? []).map((m: any) => m.work_group_id);

      // groupes créés par moi
      const { data: ownedGroups, error: oErr } = await supabase
        .from("work_groups")
        .select("id")
        .eq("created_by", userId);

      if (oErr) throw oErr;

      const allGroupIds = [
        ...new Set([...groupIds, ...(ownedGroups ?? []).map((g: any) => g.id)]),
      ];

      if (!allGroupIds.length) {
        setGroups([]);
        return;
      }

      const { data: groupsData, error: groupsErr } = await supabase
        .from("work_groups")
        .select("*")
        .in("id", allGroupIds);

      if (groupsErr) throw groupsErr;

      const groupsWithMembers: GroupWithMembers[] = await Promise.all(
        (groupsData ?? []).map(async (group: any) => {
          const { data: members, error: membersErr } = await supabase
            .from("group_members")
            .select("role, profiles!group_members_user_id_fkey(*)")
            .eq("work_group_id", group.id);

          if (membersErr) throw membersErr;

          return {
            ...group,
            members: (members ?? []).map((m: any) => ({ ...m.profiles, role: m.role })),
            isOwner: group.created_by === userId,
          } as GroupWithMembers;
        })
      );

      setGroups(groupsWithMembers);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du chargement des groupes");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  async function reloadProfileAndData() {
    if (!userId) return;

    setProfileLoading(true);
    setErrorMsg(null);

    try {
      const { data: me, error: meErr } = await supabase
        .from("profiles")
        .select("restaurant_id, restaurant_role")
        .eq("id", userId)
        .maybeSingle();

      if (meErr) throw meErr;

      const rid = (me as any)?.restaurant_id ?? null;
      setRestaurantId(rid);
      setRestaurantRole((me as any)?.restaurant_role ?? null);

      await loadGroups();

      if (!rid) setTeamUsers([]);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du chargement du profil");
      setRestaurantId(null);
      setRestaurantRole(null);
      setGroups([]);
      setTeamUsers([]);
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    void reloadProfileAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleCreateGroup(): Promise<string | null> {
    if (!userId || !newGroupName.trim()) return null;

    if (!isPremium && groups.length >= ent.maxGroups) {
      openPremium("groups.limit");
      return null;
    }

    setManageLoading(true);
    setErrorMsg(null);

    try {
      const { data: me, error: meErr } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", userId)
        .maybeSingle();

      if (meErr) throw meErr;

      const { data: created, error: gErr } = await supabase
        .from("work_groups")
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          restaurant_id: (me as any)?.restaurant_id ?? null,
          created_by: userId,
        })
        .select()
        .single();

      if (gErr) throw gErr;
      if (!created) throw new Error("Création du groupe impossible");

      const { error: memErr } = await supabase.from("group_members").insert({
        work_group_id: created.id,
        user_id: userId,
        role: "admin",
      });

      if (memErr && !String(memErr.message || "").toLowerCase().includes("duplicate")) {
        throw memErr;
      }

      await loadGroups();

      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");

      onCreatedToast?.(created.name ?? "Groupe");

      return created.id;
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la création du groupe");
      return null;
    } finally {
      setManageLoading(false);
    }
  }

  async function handleAddMemberFromTeam() {
    const groupId = selectedGroupFresh?.id;
    if (!groupId) return setErrorMsg("Aucun groupe sélectionné");
    if (!selectedUserId) return setErrorMsg("Choisis un utilisateur");

    const currentMembers = selectedGroupFresh?.members?.length ?? 0;
    if (!isPremium && currentMembers >= ent.maxMembersPerGroup) {
      openPremium("members.limit");
      return;
    }

    setManageLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("group_members").insert({
        work_group_id: groupId,
        user_id: selectedUserId,
        role: "member",
      });

      if (error) throw error;

      setSelectedUserId("");
      await loadGroups();

      if (selectedGroupFresh?.restaurant_id) {
        await loadTeamUsers(selectedGroupFresh.restaurant_id);
      }
    } catch (e: any) {
      if (!isForbidden(e)) setErrorMsg(e?.message ?? "Erreur lors de l'ajout du membre");
    } finally {
      setManageLoading(false);
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm("Supprimer ce groupe ?")) return;

    setManageLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("work_groups").delete().eq("id", groupId);
      if (error) throw error;

      setShowManageModal(false);
      setSelectedGroup(null);
      setSelectedUserId("");
      setTeamUsers([]);

      await loadGroups();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la suppression du groupe");
    } finally {
      setManageLoading(false);
    }
  }

  async function handleRenameGroup(groupId: string, name: string) {
    const next = name.trim();
    if (!next) return setErrorMsg("Nom requis");

    setManageLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from("work_groups").update({ name: next }).eq("id", groupId);
      if (error) throw error;

      setEditingId(null);
      setEditName("");

      await loadGroups();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors du renommage");
    } finally {
      setManageLoading(false);
    }
  }

  async function handleRemoveMember(userIdToRemove: string) {
    try {
      setErrorMsg(null);
      setManageLoading(true);

      const groupId = selectedGroupFresh?.id;
      if (!groupId) return setErrorMsg("Aucun groupe sélectionné");

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return setErrorMsg("Session expirée : reconnecte-toi");

      const { error } = await supabase.functions.invoke("remove-group-member", {
        body: { groupId, userId: userIdToRemove },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;

      await loadGroups();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Erreur lors de la suppression du membre");
    } finally {
      setManageLoading(false);
    }
  }

  async function openManage(group: GroupWithMembers) {
    setSelectedGroup(group);
    setShowManageModal(true);
    setErrorMsg(null);
    setSelectedUserId("");
    setEditingId(null);
    setEditName("");

    if (group.restaurant_id) {
      try {
        await loadTeamUsers(group.restaurant_id);
      } catch (e: any) {
        if (!isForbidden(e)) setErrorMsg(e?.message ?? "Impossible de charger l'équipe");
      }
    } else {
      setTeamUsers([]);
    }
  }

  function closeManage() {
    setShowManageModal(false);
    setSelectedGroup(null);
    setErrorMsg(null);
    setSelectedUserId("");
    setTeamUsers([]);
  }

  return {
    groups,
    loading,
    profileLoading,
    restaurantId,
    restaurantRole,
    canManageGroups,

    showCreateModal,
    setShowCreateModal,
    newGroupName,
    setNewGroupName,
    newGroupDescription,
    setNewGroupDescription,

    selectedGroupFresh,
    showManageModal,
    manageLoading,
    errorMsg,
    setErrorMsg,

    availableTeam,
    selectedUserId,
    setSelectedUserId,

    editingId,
    setEditingId,
    editName,
    setEditName,

    reloadProfileAndData,

    openManage,
    closeManage,

    handleCreateGroup,
    handleAddMemberFromTeam,
    handleDeleteGroup,
    handleRenameGroup,
    handleRemoveMember,
  };
}
