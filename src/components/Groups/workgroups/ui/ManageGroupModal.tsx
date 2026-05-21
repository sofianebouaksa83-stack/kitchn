import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Loader2, Mail, Trash2, UserPlus, X } from "lucide-react";

type InviteRole = "admin" | "chef_de_partie" | "commis";

type ManageGroupModalProps = {
  ui: any;
  open: boolean;
  onClose: () => void;
  canManageGroups: boolean; // ici = owner-only (depuis WorkGroups)
  manageLoading: boolean;

  selectedGroup: any | null;
  userId: string | null;

  availableTeam: any[];
  selectedUserId: string;
  setSelectedUserId: (v: string) => void;

  onAddMember: () => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;

  // Optionnel : si le parent veut recharger ses données après l'envoi d'une invitation.
  onInvitationSent?: () => Promise<void> | void;

  isPremium: boolean;
  ent: { maxMembersPerGroup: number };
};

const ROLE_OPTIONS: { value: InviteRole; label: string; helper: string }[] = [
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

function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [open]);
}

function getSupabaseEnv() {
  const env = (import.meta as any).env ?? {};
  const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY as string | undefined;

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
    if (projectRef) possibleKeys.push(`sb-${projectRef}-auth-token`);
  } catch {
    // On garde le fallback plus bas.
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
      possibleKeys.push(key);
    }
  }

  for (const key of Array.from(new Set(possibleKeys))) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.access_token ??
        parsed?.currentSession?.access_token ??
        parsed?.session?.access_token;

      if (token) return token as string;
    } catch {
      // Ignore les entrées localStorage qui ne sont pas du JSON Supabase.
    }
  }

  return null;
}

function getInviteErrorMessage(payload: any, fallback: string) {
  if (typeof payload === "string") return payload;
  return (
    payload?.error_description ||
    payload?.error ||
    payload?.message ||
    payload?.details ||
    fallback
  );
}

export function ManageGroupModal(props: ManageGroupModalProps) {
  const {
    ui,
    open,
    onClose,
    canManageGroups,
    manageLoading,
    selectedGroup,
    userId,
    availableTeam,
    selectedUserId,
    setSelectedUserId,
    onAddMember,
    onRemoveMember,
    onDeleteGroup,
    onInvitationSent,
    isPremium,
    ent,
  } = props;

  const dragControls = useDragControls();
  const [renderedGroup, setRenderedGroup] = useState<any | null>(selectedGroup);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("commis");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGroup) setRenderedGroup(selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    if (!open) return;

    setInviteEmail("");
    setInviteRole("commis");
    setInviteSuccess(null);
    setInviteError(null);
  }, [open, selectedGroup?.id]);

  useLockBodyScroll(open);

  const group = renderedGroup;
  const members = group?.members ?? [];

  const isMembersLimitReached =
    !isPremium && members.length >= ent.maxMembersPerGroup;

  const selectedRoleLabel = useMemo(() => {
    const option = ROLE_OPTIONS.find((r) => r.value === inviteRole);
    if (!option) return "Commis";
    return `${option.label}${option.helper ? ` (${option.helper})` : ""}`;
  }, [inviteRole]);

  const handleInviteMemberByEmail = async () => {
    const email = inviteEmail.trim().toLowerCase();

    setInviteSuccess(null);
    setInviteError(null);

    if (!group?.id) {
      setInviteError("Groupe introuvable.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError("Entre une adresse email valide.");
      return;
    }

    if (isMembersLimitReached) {
      setInviteError("Limite atteinte. Passe Premium pour ajouter plus de membres.");
      return;
    }

    try {
      setInviteLoading(true);

      const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
      const accessToken = getSupabaseAccessToken(supabaseUrl);

      if (!accessToken) {
        throw new Error("Session introuvable. Déconnecte-toi puis reconnecte-toi.");
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email,
          workGroupId: group.id,
          role: inviteRole,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getInviteErrorMessage(payload, "Impossible d’envoyer l’invitation.")
        );
      }

      setInviteEmail("");
      setInviteRole("commis");
      setInviteSuccess(
        `Invitation envoyée à ${email} pour rejoindre “${group.name}” en ${selectedRoleLabel}.`
      );

      await onInvitationSent?.();
    } catch (err: any) {
      setInviteError(err?.message || "Impossible d’envoyer l’invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const busy = manageLoading || inviteLoading;

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!open) setRenderedGroup(null);
      }}
    >
      {open && group && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-[#020617]/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border-t border-amber-300/10 bg-gradient-to-b from-[#0E1736] via-[#0B1538] to-[#070D22] shadow-[0_-20px_80px_rgba(0,0,0,0.55)] sm:max-w-lg sm:rounded-[28px] sm:border sm:border-amber-300/10 sm:bg-[#0E1736]/85 sm:ring-1 sm:ring-amber-400/15 sm:shadow-[0_18px_70px_rgba(0,0,0,0.35)] sm:backdrop-blur-md"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.35 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 700) {
                onClose();
              }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-20 border-b border-amber-300/10 bg-[#0E1736]/95 px-4 pb-3 pt-3 backdrop-blur-xl sm:bg-transparent sm:px-6 sm:pt-5"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-amber-300/40 sm:hidden" />

              <div className="flex items-center justify-between gap-3">
                <h2 className="min-w-0 truncate text-xl font-semibold text-slate-100">
                  {canManageGroups ? "Gérer" : "Détails"} : {group.name}
                </h2>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-white/80 transition hover:bg-amber-400/20"
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 pb-8 pt-4 sm:p-6 sm:pt-4">
              {!canManageGroups && (
                <div className="rounded-2xl bg-black/10 p-3 text-sm text-slate-200 ring-1 ring-amber-400/15">
                  Seul le <b>propriétaire</b> du groupe peut gérer les membres et les paramètres.
                </div>
              )}

              {canManageGroups && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-black/10 p-4 ring-1 ring-amber-400/15">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white">
                          Inviter un membre par email
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          La personne recevra une invitation pour rejoindre directement ce groupe.
                        </p>
                      </div>
                      <div className="rounded-full bg-amber-400/15 p-2 text-amber-200">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <input
                        value={inviteEmail}
                        onChange={(e) => {
                          setInviteEmail(e.target.value);
                          setInviteError(null);
                          setInviteSuccess(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleInviteMemberByEmail();
                        }}
                        type="email"
                        placeholder="email@exemple.com"
                        className="w-full rounded-2xl border border-white/10 bg-[#10215a]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20"
                        disabled={busy || isMembersLimitReached}
                      />

                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as InviteRole)}
                        className="w-full rounded-2xl border border-white/10 bg-[#10215a]/70 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20"
                        disabled={busy || isMembersLimitReached}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label} ({role.helper})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-500 px-4 py-3 text-sm font-bold text-[#081335] shadow-lg shadow-orange-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        onClick={handleInviteMemberByEmail}
                        disabled={busy || isMembersLimitReached}
                      >
                        {inviteLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        {inviteLoading ? "Envoi..." : "Envoyer l’invitation"}
                      </button>

                      {!isPremium && (
                        <div className="text-xs text-slate-400">
                          Limite : {ent.maxMembersPerGroup} membres par groupe (actuel : {members.length}).
                        </div>
                      )}

                      {isPremium && (
                        <div className="text-xs font-semibold text-emerald-300">
                          Premium actif : membres et invitations illimités.
                        </div>
                      )}

                      {isMembersLimitReached && (
                        <div className="text-xs text-amber-200">
                          Limite atteinte. Passe Premium pour ajouter plus de membres.
                        </div>
                      )}

                      {inviteSuccess && (
                        <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
                          {inviteSuccess}
                        </div>
                      )}

                      {inviteError && (
                        <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 ring-1 ring-red-300/20">
                          {inviteError}
                        </div>
                      )}
                    </div>
                  </div>

                  {availableTeam.length > 0 && (
                    <div className="rounded-2xl bg-black/10 p-4 ring-1 ring-amber-400/15">
                      <h3 className="mb-3 font-semibold text-white">
                        Ajouter un membre déjà dans l’équipe
                      </h3>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className={ui.input + " flex-1"}
                          disabled={busy || isMembersLimitReached}
                        >
                          <option value="">-- Choisir un utilisateur --</option>
                          {availableTeam.map((u) => (
                            <option key={u.id} value={u.id}>
                              {(u.full_name || u.email) +
                                (u.restaurant_role ? ` — ${u.restaurant_role}` : "")}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className={ui.btnPrimary + " flex items-center justify-center gap-2"}
                          onClick={onAddMember}
                          disabled={busy || !selectedUserId || isMembersLimitReached}
                        >
                          <UserPlus className="h-4 w-4" />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5 border-t border-amber-300/10 pt-4">
                <h3 className="mb-3 text-sm font-medium text-slate-300">
                  Membres ({members.length})
                </h3>

                <div className="max-h-72 space-y-2 overflow-auto pr-1">
                  {members.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between rounded-2xl bg-black/10 px-3 py-2 ring-1 ring-amber-400/15"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm text-slate-100">
                          {m.full_name || m.email || "Sans nom"}
                        </div>
                        <div className="text-xs text-slate-400">{m.role}</div>
                      </div>

                      {canManageGroups && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id)}
                          className="text-red-400 transition hover:text-red-300 disabled:opacity-40"
                          title="Retirer du groupe"
                          disabled={busy || m.id === userId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {canManageGroups && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteGroup(group.id)}
                      disabled={busy}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer le groupe
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
