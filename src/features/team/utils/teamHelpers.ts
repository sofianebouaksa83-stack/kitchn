import type { GroupRole } from "../types/team.types";

export function cn(
  ...classes: Array<string | undefined | null | false>
) {
  return classes.filter(Boolean).join(" ");
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim()
  );
}

export function roleLabel(role: GroupRole) {
  switch (role) {
    case "admin":
      return "Second";

    case "chef_de_partie":
      return "Chef de partie";

    case "commis":
      return "Commis";

    default:
      return "—";
  }
}

export function normalizeRole(
  value: unknown
): GroupRole {
  if (
    value === "admin" ||
    value === "chef_de_partie" ||
    value === "commis"
  ) {
    return value;
  }

  return "commis";
}