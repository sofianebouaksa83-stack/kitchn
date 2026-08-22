export type Group = {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
};

export type GroupRole =
  | "admin"
  | "chef_de_partie"
  | "commis";

export type TeamMember = {
  id: string;
  email: string;
  full_name: string;
  job_title: string;
  role: GroupRole;
};

export type Invitation = {
  id: string;
  email: string;
  role: GroupRole;
  token: string;
  created_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  work_group_id?: string | null;
};

export type InviteStatus =
  | "idle"
  | "sending"
  | "success"
  | "error";