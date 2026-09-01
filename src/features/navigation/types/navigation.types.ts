import type { ReactNode } from "react";
import type { View } from "../../../app/routes";

export type NavItem = {
  key: string;
  view: View;
  label: string;
  icon?: ReactNode;
};

export type NavbarProfile = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};