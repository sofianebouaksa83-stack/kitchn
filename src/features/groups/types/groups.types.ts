import type { Profile, WorkGroup } from "../../../lib/supabase";

export type GroupWithMembers = WorkGroup & {
  members: Array<Profile & { role: string }>;
  isOwner: boolean;
};

export type InvitationRow = {
  id: string;
  restaurant_id: string;
  invited_user_id?: string | null;
  email?: string | null;
  role: string | null;
  token: string | null;
  expires_at: string | null;
  accepted_at: string | null;
  created_at: string | null;
  restaurants?: { name: string | null } | null;
};

export type InviteViewState =
  | "none"
  | "pending"
  | "expired"
  | "accepted";

export type InviteRole =
  | "admin"
  | "chef_de_partie"
  | "commis";
