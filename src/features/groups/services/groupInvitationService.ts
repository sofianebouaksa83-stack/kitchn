import type { InviteRole } from "../types/groups.types";

export const GROUP_ROLE_OPTIONS: Array<{
  value: InviteRole;
  label: string;
  helper: string;
}> = [
  {
    value: "commis",
    label: "Commis",
    helper: "lecture seule",
  },
  {
    value: "chef_de_partie",
    label: "Chef de partie",
    helper: "accès groupe",
  },
  {
    value: "admin",
    label: "Second / admin",
    helper: "gestion du groupe",
  },
];

export function getInviteRoleLabel(role: InviteRole) {
  const option = GROUP_ROLE_OPTIONS.find(
    (candidate) => candidate.value === role
  );

  if (!option) return "Commis";

  return `${option.label}${
    option.helper ? ` (${option.helper})` : ""
  }`;
}

function getSupabaseEnv() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
    | string
    | undefined;
  const supabaseAnonKey = import.meta.env
    .VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variables Supabase manquantes. Vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getSupabaseAccessToken(supabaseUrl: string) {
  if (typeof window === "undefined") return null;

  const possibleKeys: string[] = [];

  try {
    const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
    if (projectRef) {
      possibleKeys.push(`sb-${projectRef}-auth-token`);
    }
  } catch {
    // Le parcours du stockage ci-dessous reste disponible.
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
      possibleKeys.push(key);
    }
  }

  for (const key of new Set(possibleKeys)) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as {
        access_token?: string;
        currentSession?: { access_token?: string };
        session?: { access_token?: string };
      };
      const token =
        parsed.access_token ??
        parsed.currentSession?.access_token ??
        parsed.session?.access_token;

      if (token) return token;
    } catch {
      // Les autres entrées Supabase du stockage sont ignorées.
    }
  }

  return null;
}

function getInviteErrorMessage(
  payload: unknown,
  fallback: string
) {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return fallback;

  const error = payload as Record<string, unknown>;
  const message =
    error.error_description ??
    error.error ??
    error.message ??
    error.details;

  return typeof message === "string" ? message : fallback;
}

export async function sendGroupInvitation({
  email,
  groupId,
  role,
}: {
  email: string;
  groupId: string;
  role: InviteRole;
}) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const accessToken = getSupabaseAccessToken(supabaseUrl);

  if (!accessToken) {
    throw new Error(
      "Session introuvable. Déconnecte-toi puis reconnecte-toi."
    );
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/send-invitation`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email,
        workGroupId: groupId,
        role,
      }),
    }
  );

  const payload: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      getInviteErrorMessage(
        payload,
        "Impossible d’envoyer l’invitation."
      )
    );
  }
}
