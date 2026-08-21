export type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  locale: string | null;

  notifications_email: boolean | null;
  notifications_push: boolean | null;
  marketing_email: boolean | null;

  restaurant_id: string | null;
  restaurant_role: string | null;
  updated_at: string | null;
};

export type SettingsTab =
  | "profile"
  | "notifications"
  | "invitations"
  | "security"
  | "subscription"
  | "account";

export type SettingsView =
  | "recipes"
  | "editor"
  | "groups"
  | "shared"
  | "import-ai"
  | "team"
  | "subscription"
  | "subscription-checkout"
  | "subscription-success"
  | "subscription-cancel"
  | "settings";