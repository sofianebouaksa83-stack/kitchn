import { useEffect, useMemo, useState } from "react";
import type { Profile } from "../../../lib/supabase";
import type { PremiumGateKey } from "../../../lib/entitlements";
import {
  addGroupMember,
  addGroupOwner,
  canAddGroupMember,
  canCreateWorkGroup,
  createWorkGroup,
  deleteWorkGroup,
  fetchTeamUsers,
  fetchUserRestaurantId,
  fetchWorkGroups,
  removeGroupMember,
  renameWorkGroup,
} from "../services/groupsService";
import type { GroupWithMembers } from "../types/groups.types";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }

  return fallback;
}

function isForbidden(error: unknown) {
  const msg = getErrorMessage(error, "").toLowerCase();
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
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

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

  const canManageGroups = !!userId;

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
    setTeamUsers(await fetchTeamUsers(restaurantIdParam));
  }

  async function loadGroups() {
    if (!userId) return;

    setErrorMsg(null);

    try {
      setGroups(await fetchWorkGroups(userId));
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(
          error,
          "Erreur lors du chargement des groupes"
        )
      );
      setGroups([]);
    }
  }

  async function reloadProfileAndData() {
    if (!userId) return;

    setErrorMsg(null);

    try {
      const rid = await fetchUserRestaurantId(userId);
      setRestaurantId(rid);

      await loadGroups();

      if (!rid) {
        setTeamUsers([]);
      }
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(
          error,
          "Erreur lors du chargement du profil"
        )
      );
      setRestaurantId(null);
      setGroups([]);
      setTeamUsers([]);
    }
  }

  useEffect(() => {
    if (!userId) return;
    void reloadProfileAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function handleCreateGroup(): Promise<string | null> {
    if (!userId || !newGroupName.trim()) return null;

    const ownedGroups = groups.filter((group) => group.isOwner).length;

    if (!isPremium && ownedGroups >= ent.maxGroups) {
      openPremium("groups.limit");
      return null;
    }

    setManageLoading(true);
    setErrorMsg(null);

    try {
      if (!(await canCreateWorkGroup())) {
        openPremium("groups.limit");
        return null;
      }

      const created = await createWorkGroup({
        name: newGroupName.trim(),
        description: newGroupDescription.trim() || null,
        restaurantId: await fetchUserRestaurantId(userId),
        userId,
      });
      await addGroupOwner(created.id, userId);

      await loadGroups();

      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");

      onCreatedToast?.(created.name ?? "Groupe");

      return created.id;
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(
          error,
          "Erreur lors de la création du groupe"
        )
      );
      return null;
    } finally {
      setManageLoading(false);
    }
  }

  async function handleAddMemberFromTeam() {
    const groupId = selectedGroupFresh?.id;
    if (!groupId) {
      setErrorMsg("Aucun groupe sélectionné");
      return;
    }

    if (!selectedUserId) {
      setErrorMsg("Choisis un utilisateur");
      return;
    }

    const currentMembers = selectedGroupFresh?.members?.length ?? 0;
    if (!isPremium && currentMembers >= ent.maxMembersPerGroup) {
      openPremium("members.limit");
      return;
    }

    setManageLoading(true);
    setErrorMsg(null);

    try {
      if (!(await canAddGroupMember(groupId))) {
        openPremium("members.limit");
        return;
      }

      await addGroupMember(groupId, selectedUserId);

      setSelectedUserId("");
      await loadGroups();

      if (selectedGroupFresh?.restaurant_id) {
        await loadTeamUsers(selectedGroupFresh.restaurant_id);
      }
    } catch (error: unknown) {
      if (!isForbidden(error)) {
        setErrorMsg(
          getErrorMessage(
            error,
            "Erreur lors de l'ajout du membre"
          )
        );
      }
    } finally {
      setManageLoading(false);
    }
  }

  async function handleDeleteGroup(groupId: string) {
    if (!confirm("Supprimer ce groupe ?")) return;

    setManageLoading(true);
    setErrorMsg(null);

    try {
      await deleteWorkGroup(groupId);

      setShowManageModal(false);
      setSelectedGroup(null);
      setSelectedUserId("");
      setTeamUsers([]);

      await loadGroups();
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(
          error,
          "Erreur lors de la suppression du groupe"
        )
      );
    } finally {
      setManageLoading(false);
    }
  }

  async function handleRenameGroup(groupId: string, name: string) {
    const next = name.trim();
    if (!next) {
      setErrorMsg("Nom requis");
      return;
    }

    setManageLoading(true);
    setErrorMsg(null);

    try {
      await renameWorkGroup(groupId, next);

      setEditingId(null);
      setEditName("");

      await loadGroups();
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(error, "Erreur lors du renommage")
      );
    } finally {
      setManageLoading(false);
    }
  }

  async function handleRemoveMember(userIdToRemove: string) {
    try {
      setErrorMsg(null);
      setManageLoading(true);

      const groupId = selectedGroupFresh?.id;
      if (!groupId) {
        setErrorMsg("Aucun groupe sélectionné");
        return;
      }

      await removeGroupMember(groupId, userIdToRemove);

      await loadGroups();

      if (selectedGroupFresh?.restaurant_id) {
        await loadTeamUsers(selectedGroupFresh.restaurant_id);
      }
    } catch (error: unknown) {
      setErrorMsg(
        getErrorMessage(
          error,
          "Erreur lors de la suppression du membre"
        )
      );
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
      } catch (error: unknown) {
        if (!isForbidden(error)) {
          setErrorMsg(
            getErrorMessage(
              error,
              "Impossible de charger l'équipe"
            )
          );
        }
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
    restaurantId,
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
