import {
  supabase,
  type Profile,
  type WorkGroup,
} from "../../../lib/supabase";
import type { GroupWithMembers } from "../types/groups.types";

type GroupMemberRow = {
  role: string;
  profiles: Profile | Profile[] | null;
};

export async function fetchTeamUsers(restaurantId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, restaurant_id, restaurant_role")
    .eq("restaurant_id", restaurantId)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchWorkGroups(userId: string) {
  const { data: membershipData, error: membershipError } =
    await supabase
      .from("group_members")
      .select("work_group_id")
      .eq("user_id", userId);

  if (membershipError) throw membershipError;

  const memberships = (membershipData ?? []) as Array<{
    work_group_id: string;
  }>;

  const { data: ownedGroups, error: ownedError } =
    await supabase
      .from("work_groups")
      .select("id")
      .eq("created_by", userId);

  if (ownedError) throw ownedError;

  const groupIds = [
    ...new Set([
      ...memberships.map(
        (membership) => membership.work_group_id
      ),
      ...((ownedGroups ?? []) as Array<{ id: string }>).map(
        (group) => group.id
      ),
    ]),
  ];

  if (!groupIds.length) return [];

  const { data: groupsData, error: groupsError } =
    await supabase
      .from("work_groups")
      .select("*")
      .in("id", groupIds);

  if (groupsError) throw groupsError;

  return Promise.all(
    ((groupsData ?? []) as WorkGroup[]).map(
      async (group): Promise<GroupWithMembers> => {
        const { data: members, error: membersError } =
          await supabase
            .from("group_members")
            .select(
              "role, profiles!group_members_user_id_fkey(*)"
            )
            .eq("work_group_id", group.id);

        if (membersError) throw membersError;

        const normalizedMembers = (
          (members ?? []) as unknown as GroupMemberRow[]
        ).flatMap((member) => {
          const profile = Array.isArray(member.profiles)
            ? member.profiles[0]
            : member.profiles;

          return profile
            ? [{ ...profile, role: member.role }]
            : [];
        });

        return {
          ...group,
          members: normalizedMembers,
          isOwner: group.created_by === userId,
        };
      }
    )
  );
}

export async function fetchUserRestaurantId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("restaurant_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return (
    data as Pick<Profile, "restaurant_id"> | null
  )?.restaurant_id ?? null;
}

export async function canCreateWorkGroup() {
  const { data, error } = await supabase.rpc(
    "can_create_group"
  );

  if (error) throw error;
  return Boolean(data);
}

export async function createWorkGroup({
  name,
  description,
  restaurantId,
  userId,
}: {
  name: string;
  description: string | null;
  restaurantId: string | null;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("work_groups")
    .insert({
      name,
      description,
      restaurant_id: restaurantId,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("Création du groupe impossible");

  return data as WorkGroup;
}

export async function addGroupOwner(
  groupId: string,
  userId: string
) {
  const { error } = await supabase
    .from("group_members")
    .insert({
      work_group_id: groupId,
      user_id: userId,
      role: "admin",
    });

  if (
    error &&
    !error.message.toLowerCase().includes("duplicate")
  ) {
    throw error;
  }
}

export async function canAddGroupMember(groupId: string) {
  const { data, error } = await supabase.rpc(
    "can_add_group_member",
    { p_group_id: groupId }
  );

  if (error) throw error;
  return Boolean(data);
}

export async function addGroupMember(
  groupId: string,
  userId: string
) {
  const { error } = await supabase
    .from("group_members")
    .insert({
      work_group_id: groupId,
      user_id: userId,
      role: "commis",
    });

  if (error) throw error;
}

export async function deleteWorkGroup(groupId: string) {
  const { error } = await supabase
    .from("work_groups")
    .delete()
    .eq("id", groupId);

  if (error) throw error;
}

export async function renameWorkGroup(
  groupId: string,
  name: string
) {
  const { error } = await supabase
    .from("work_groups")
    .update({ name })
    .eq("id", groupId);

  if (error) throw error;
}

export async function removeGroupMember(
  groupId: string,
  userId: string
) {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("work_group_id", groupId)
    .eq("user_id", userId);

  if (error) throw error;
}
