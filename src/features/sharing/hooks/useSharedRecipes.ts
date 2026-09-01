import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../../../lib/supabase";
import type {
  GroupMini,
  SharedRecipeOpen,
} from "../types/sharing.types";
import {
  clearPendingSharedOpen,
  getPendingSharedOpen,
} from "../utils/sharingHelpers";

type MembershipRecord = {
  work_groups:
    | GroupMini
    | GroupMini[]
    | null;
};

type UseSharedRecipesOptions = {
  recipeToOpen?: SharedRecipeOpen | null;
  onRecipeOpened?: () => void;
  autoSelectSingleGroup?: boolean;
};

export function useSharedRecipes({
  recipeToOpen,
  onRecipeOpened,
  autoSelectSingleGroup = false,
}: UseSharedRecipesOptions) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupMini[]>([]);

  const [selectedGroupId, setSelectedGroupId] =
    useState<string | null>(null);

  const [recipeToOpenId, setRecipeToOpenId] =
    useState<string | null>(null);

  const latestRecipeToOpen =
    useRef<SharedRecipeOpen | null | undefined>(
      recipeToOpen
    );

  useEffect(() => {
    latestRecipeToOpen.current = recipeToOpen;

    if (!recipeToOpen) return;

    setSelectedGroupId(recipeToOpen.groupId);
    setRecipeToOpenId(recipeToOpen.recipeId);
  }, [recipeToOpen]);

  const loadGroups = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      const userId = authData.user?.id;

      if (!userId) {
        setGroups([]);
        setSelectedGroupId(null);
        setRecipeToOpenId(null);
        return;
      }

      const {
        data: membershipsData,
        error: membershipsError,
      } = await supabase
        .from("group_members")
        .select(
          "work_group_id, work_groups:work_groups(id,name)"
        )
        .eq("user_id", userId);

      if (membershipsError) {
        throw membershipsError;
      }

      const memberships =
        (membershipsData ?? []) as unknown as
          MembershipRecord[];

      const nextGroups = memberships
        .flatMap((membership) => {
          const relation = membership.work_groups;

          const group = Array.isArray(relation)
            ? relation[0] ?? null
            : relation;

          return group?.id ? [group] : [];
        })
        .sort((first, second) =>
          first.name.localeCompare(second.name)
        );

      setGroups(nextGroups);

      const requestedRecipe =
        latestRecipeToOpen.current;

      const pending = requestedRecipe
        ? {
            groupId: requestedRecipe.groupId,
            recipeId: requestedRecipe.recipeId,
          }
        : getPendingSharedOpen();

      if (pending.groupId) {
        setSelectedGroupId(pending.groupId);
        setRecipeToOpenId(pending.recipeId);
      } else if (
        autoSelectSingleGroup &&
        nextGroups.length === 1
      ) {
        setSelectedGroupId(nextGroups[0].id);
        setRecipeToOpenId(null);
      } else {
        setSelectedGroupId(null);
        setRecipeToOpenId(null);
      }
    } catch (error: unknown) {
      console.error(
        "[SharedRecipes] Error loading groups:",
        error
      );

      setGroups([]);
      setSelectedGroupId(null);
      setRecipeToOpenId(null);
    } finally {
      setLoading(false);
    }
  }, [autoSelectSingleGroup]);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return null;

    return (
      groups.find(
        (group) => group.id === selectedGroupId
      ) ?? null
    );
  }, [groups, selectedGroupId]);

  const openGroup = useCallback((groupId: string) => {
    setSelectedGroupId(groupId);
    setRecipeToOpenId(null);
  }, []);

  const closeGroup = useCallback(() => {
    setSelectedGroupId(null);
    setRecipeToOpenId(null);
  }, []);

  const handleInitialRecipeOpened =
    useCallback(() => {
      setRecipeToOpenId(null);
      clearPendingSharedOpen();
      onRecipeOpened?.();
    }, [onRecipeOpened]);

  return {
    loading,
    groups,
    selectedGroupId,
    recipeToOpenId,
    selectedGroup,

    openGroup,
    closeGroup,
    handleInitialRecipeOpened,
    reloadGroups: loadGroups,
  };
}