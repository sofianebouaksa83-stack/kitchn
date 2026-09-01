import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type GroupMini = {
  id: string;
  name: string;
};

type MembershipRow = {
  work_group_id: string;
  work_groups: GroupMini | GroupMini[] | null;
};

type Status = "idle" | "success" | "error";

type UseRecipeGroupsModalArgs = {
  open: boolean;
  recipeId: string;
  onClose: () => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(error.message);
  }

  return fallback;
}

export function useRecipeGroupsModal({
  open,
  recipeId,
  onClose,
}: UseRecipeGroupsModalArgs) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<GroupMini[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadGroups() {
      setLoading(true);
      setStatus("idle");
      setMessage("");

      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          throw new Error("Non connecté");
        }

        const [
          membershipResult,
          ownedGroupsResult,
          linksResult,
        ] = await Promise.all([
          supabase
            .from("group_members")
            .select(
              "work_group_id, work_groups:work_groups(id,name)"
            )
            .eq("user_id", userId),

          supabase
            .from("work_groups")
            .select("id,name")
            .eq("created_by", userId),

          supabase
            .from("work_group_recipes")
            .select("group_id")
            .eq("recipe_id", recipeId),
        ]);

        if (membershipResult.error) {
          throw membershipResult.error;
        }

        if (ownedGroupsResult.error) {
          throw ownedGroupsResult.error;
        }

        if (linksResult.error) {
          throw linksResult.error;
        }

        if (cancelled) return;

        const groupMap = new Map<string, GroupMini>();

        const memberships =
            (membershipResult.data ?? []) as MembershipRow[];
        
        for (const membership of memberships) {
            const embeddedGroup = Array.isArray(
                membership.work_groups
            )
                ? membership.work_groups[0]
                : membership.work_groups;

            if (embeddedGroup?.id) {
                groupMap.set(embeddedGroup.id, embeddedGroup);
            } else if (membership.work_group_id) {
                groupMap.set(String(membership.work_group_id), {
                id: String(membership.work_group_id),
                name: "Groupe",
                });
            }
        }

        for (const group of
          (ownedGroupsResult.data ?? []) as GroupMini[]) {
          if (group?.id) {
            groupMap.set(group.id, group);
          }
        }

        const availableGroups = Array.from(
          groupMap.values()
        ).sort((firstGroup, secondGroup) =>
          firstGroup.name.localeCompare(secondGroup.name)
        );

        const nextSelected: Record<string, boolean> = {};

        for (const group of availableGroups) {
          nextSelected[group.id] = false;
        }

        for (const link of linksResult.data ?? []) {
          const groupId = String(link.group_id ?? "");

          if (groupId) {
            nextSelected[groupId] = true;
          }
        }

        setGroups(availableGroups);
        setSelected(nextSelected);
      } catch (error: unknown) {
        if (cancelled) return;

        setGroups([]);
        setSelected({});
        setStatus("error");
        setMessage(getErrorMessage(error, "Erreur"));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadGroups();

    return () => {
      cancelled = true;
    };
  }, [open, recipeId]);

  const selectedIds = useMemo(
    () =>
      Object.keys(selected).filter(
        (groupId) => selected[groupId]
      ),
    [selected]
  );

  async function save() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const { error: deleteError } = await supabase
        .from("work_group_recipes")
        .delete()
        .eq("recipe_id", recipeId);

      if (deleteError) {
        throw deleteError;
      }

      if (selectedIds.length > 0) {
        const payload = selectedIds.map((groupId) => ({
          recipe_id: recipeId,
          group_id: groupId,
        }));

        const { error: insertError } = await supabase
          .from("work_group_recipes")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      setStatus("success");
      setMessage("Partage mis à jour.");
      setTimeout(onClose, 800);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        getErrorMessage(
          error,
          "Erreur lors de la sauvegarde"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    groups,
    selected,
    setSelected,
    status,
    message,
    save,
  };
}