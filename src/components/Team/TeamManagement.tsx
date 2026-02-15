import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Users,
  Mail,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader,
  Plus,
  X,
  ChevronDown,
} from "lucide-react";
import { ui } from "../../styles/ui";

type Group = {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
};

type TeamMember = {
  id: string; // user_id
  email: string;
  full_name: string;
  job_title: string;
  role: string; // group_members.role
};

type Invitation = {
  id: string;
  email: string;
  created_at: string;
  accepted_at: string | null;
  work_group_id?: string | null;
};

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function TeamManagement() {
  const { user, profile } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"second" | "commis" | "stagiaire">(
    "commis"
  );

  const [inviteStatus, setInviteStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [inviteMessage, setInviteMessage] = useState("");

  const isPremium = useMemo(() => {
    const p: any = profile;
    return (
      p?.is_premium === true ||
      p?.subscription_status === "active" ||
      p?.plan === "premium"
    );
  }, [profile]);

  const maxMembers = isPremium ? Infinity : 10;

  const [canAccess, setCanAccess] = useState(false);

  // ✅ FK explicite (tu as 2 relations, donc on force celle-ci)
  const GROUP_MEMBERS_TO_WORK_GROUPS_FK = "group_members_work_group_id_fkey";

  useEffect(() => {
    void loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!activeGroupId) {
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
      setLoading(false);
      return;
    }
    void loadTeamData(activeGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  async function loadGroups() {
  if (!user?.id) {
    setGroups([]);
    setActiveGroupId("");
    setLoadingGroups(false);
    return;
  }

  setLoadingGroups(true);
  try {
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        work_group_id,
        role,
        work_groups!group_members_work_group_id_fkey (
          id,
          name,
          created_at,
          created_by
        )
      `)
      .eq("user_id", user.id);

    if (error) throw error;

    const nextGroups: Group[] = (data ?? [])
      .map((m: any) => {
        const wg = m.work_groups;
        return Array.isArray(wg) ? wg[0] : wg;
      })
      .filter(Boolean);

    const unique = Array.from(
      new Map(nextGroups.map((g) => [g.id, g])).values()
    );

    unique.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    setGroups(unique);
    setActiveGroupId((prev) => prev || unique[0]?.id || "");
  } catch (e) {
    console.error(e);
    setGroups([]);
    setActiveGroupId("");
  } finally {
    setLoadingGroups(false);
  }
}


  async function loadTeamData(workGroupId: string) {
    if (!user?.id) return;

    setLoading(true);
    try {
      // 1) Permission: owner OU chef/admin dans CE groupe
      const { data: group, error: groupErr } = await supabase
        .from("work_groups")
        .select("id, created_by, name")
        .eq("id", workGroupId)
        .maybeSingle();

      if (groupErr) throw groupErr;

      const { data: myMembership, error: memErr } = await supabase
        .from("group_members")
        .select("role")
        .eq("work_group_id", workGroupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memErr) throw memErr;

      const isOwner = group?.created_by === user.id;
      const isChef = myMembership?.role === "chef" || myMembership?.role === "admin";
      setCanAccess(Boolean(isOwner || isChef));

      // 2) Membres (group_members -> profiles)
      const { data: gm, error: gmErr } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          role,
          profiles:user_id ( id, email, full_name, job_title )
        `
        )
        .eq("work_group_id", workGroupId);

      if (gmErr) throw gmErr;

      const members: TeamMember[] = (gm ?? [])
        .map((row: any) => ({
          id: row.user_id,
          email: row.profiles?.email ?? "",
          full_name: row.profiles?.full_name ?? "Sans nom",
          job_title: row.profiles?.job_title ?? "",
          role: row.role ?? "member",
        }))
        .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

      setTeamMembers(members);

      // 3) Invitations en attente
      const { data: invites, error: invErr } = await supabase
        .from("invitations")
        .select("*")
        .eq("work_group_id", workGroupId)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (invErr) {
        console.warn(
          "[TeamManagement] Invitations query failed. Vérifie invitations.work_group_id.",
          invErr
        );
        setInvitations([]);
      } else {
        setInvitations((invites ?? []) as Invitation[]);
      }
    } catch (err) {
      console.error(err);
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
    } finally {
      setLoading(false);
    }
  }

  const currentCount = useMemo(
    () => teamMembers.length + invitations.length,
    [teamMembers.length, invitations.length]
  );

  const remainingSlots = useMemo(() => {
    if (!Number.isFinite(maxMembers)) return Infinity;
    return Math.max(0, (maxMembers as number) - currentCount);
  }, [maxMembers, currentCount]);

  async function handleSendInvitation(e: React.FormEvent) {
    e.preventDefault();

    const email = inviteEmail.trim().toLowerCase();
    if (!activeGroupId) return;

    if (!email || !isEmail(email)) {
      setInviteStatus("error");
      setInviteMessage("Email invalide.");
      return;
    }

    if (!isPremium && currentCount >= 10) {
      setInviteStatus("error");
      setInviteMessage("Limite Free atteinte : 10 membres (invitations incluses).");
      return;
    }

    const alreadyMember = teamMembers.some((m) => m.email?.toLowerCase() === email);
    const alreadyInvited = invitations.some((i) => i.email?.toLowerCase() === email);
    if (alreadyMember) {
      setInviteStatus("error");
      setInviteMessage("Cette personne est déjà membre du groupe.");
      return;
    }
    if (alreadyInvited) {
      setInviteStatus("error");
      setInviteMessage("Une invitation est déjà en attente pour cet email.");
      return;
    }

    try {
      setInviteStatus("sending");
      setInviteMessage("");

      const {
        data: { session },
      } = await supabase.auth.refreshSession();
      if (!session) throw new Error("Session expirée");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            role: inviteRole,
            workGroupId: activeGroupId,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l’envoi");
      }

      setInviteStatus("success");
      setInviteMessage(`Invitation envoyée à ${email}`);
      setInviteEmail("");
      setInviteRole("commis");
      setShowInviteForm(false);

      setTimeout(() => {
        void loadTeamData(activeGroupId);
        setInviteStatus("idle");
        setInviteMessage("");
      }, 800);
    } catch (err) {
      setInviteStatus("error");
      setInviteMessage(err instanceof Error ? err.message : "Erreur lors de l’envoi");
    }
  }

  async function handleChangeRole(memberId: string, role: string) {
    if (!activeGroupId) return;
    if (!canAccess) return;

    await supabase
      .from("group_members")
      .update({ role })
      .eq("work_group_id", activeGroupId)
      .eq("user_id", memberId);

    void loadTeamData(activeGroupId);
  }

  async function handleDeleteInvitation(id: string) {
    if (!confirm("Supprimer cette invitation ?")) return;
    await supabase.from("invitations").delete().eq("id", id);
    if (activeGroupId) void loadTeamData(activeGroupId);
  }

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId]
  );

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Users className="w-5 h-5 text-amber-200" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                  Équipe
                </h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  Gestion des membres, invitations et rôles (par groupe)
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="text-xs text-slate-400">Groupe :</div>

                  {loadingGroups ? (
                    <div className="inline-flex items-center gap-2 text-xs text-slate-300/70">
                      <Loader className="w-4 h-4 animate-spin" />
                      Chargement…
                    </div>
                  ) : groups.length === 0 ? (
                    <div className="text-xs text-red-200">
                      Aucun groupe. Crée un groupe pour inviter ton équipe.
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={activeGroupId}
                        onChange={(e) => setActiveGroupId(e.target.value)}
                        className={cn(ui.input, "pr-10 py-2 text-sm")}
                      >
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-300/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}

                  {groups.length > 0 && (
                    <div className="text-xs text-slate-400">
                      {isPremium ? (
                        <span className="text-emerald-300">Premium</span>
                      ) : (
                        <span>
                          Free — {remainingSlots} place{remainingSlots > 1 ? "s" : ""} restante
                          {remainingSlots > 1 ? "s" : ""} (max 10)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {groups.length > 0 && (
                  <p className="text-xs text-slate-400 mt-2">
                    {loading
                      ? "Chargement…"
                      : `${teamMembers.length} membre${teamMembers.length > 1 ? "s" : ""} — ${
                          invitations.length
                        } invitation${invitations.length > 1 ? "s" : ""} en attente`}
                    {activeGroup?.name ? ` — ${activeGroup.name}` : ""}
                  </p>
                )}
              </div>
            </div>

            {groups.length > 0 && canAccess && (
              <button
                onClick={() => setShowInviteForm((v) => !v)}
                className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl`}
                type="button"
              >
                {showInviteForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showInviteForm ? "Annuler" : "Inviter"}
              </button>
            )}
          </div>

          {groups.length > 0 && !loading && !canAccess && (
            <div className="mt-8 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
              <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-100 mb-2">
                Accès refusé
              </h2>
              <p className="text-sm text-slate-300/70">
                Seuls le créateur du groupe ou un chef/admin peuvent gérer l’équipe de{" "}
                <span className="text-slate-200">{activeGroup?.name ?? "ce groupe"}</span>.
              </p>
            </div>
          )}

          {groups.length > 0 && canAccess && (
            <>
              {loading ? (
                <div className="flex justify-center py-24">
                  <Loader className="w-8 h-8 animate-spin text-amber-400" />
                </div>
              ) : (
                <>
                  {showInviteForm && (
                    <div className="mt-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                      {!isPremium && currentCount >= 10 ? (
                        <div className="rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
                          <AlertCircle className="text-red-300" />
                          <p className="text-red-200 text-sm">
                            Limite Free atteinte : 10 membres (invitations incluses).
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSendInvitation} className="space-y-4">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="email@exemple.com"
                            className={ui.input}
                            required
                          />

                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value as any)}
                            className={ui.input}
                          >
                            <option value="second">Second</option>
                            <option value="commis">Commis</option>
                            <option value="stagiaire">Stagiaire</option>
                          </select>

                          <button
                            type="submit"
                            disabled={inviteStatus === "sending"}
                            className={ui.btnPrimary}
                          >
                            <Mail className="w-4 h-4" />
                            {inviteStatus === "sending" ? "Envoi…" : "Envoyer l’invitation"}
                          </button>

                          {!isPremium && (
                            <p className="text-xs text-slate-400">
                              Free : 10 membres max (membres + invitations en attente). Actuellement :{" "}
                              {currentCount}/10.
                            </p>
                          )}
                        </form>
                      )}
                    </div>
                  )}

                  {inviteStatus === "success" && (
                    <div className="mt-6 rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex gap-3">
                      <CheckCircle className="text-emerald-300" />
                      <p className="text-emerald-200">{inviteMessage}</p>
                    </div>
                  )}

                  {inviteStatus === "error" && (
                    <div className="mt-6 rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
                      <AlertCircle className="text-red-300" />
                      <p className="text-red-200">{inviteMessage}</p>
                    </div>
                  )}

                  {invitations.length > 0 && (
                    <div className="mt-8">
                      <h2 className="text-base font-semibold text-slate-100 mb-4">
                        Invitations en attente
                      </h2>
                      <div className="space-y-3">
                        {invitations.map((inv) => (
                          <div
                            key={inv.id}
                            className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex justify-between items-center"
                          >
                            <div className="min-w-0">
                              <p className="text-slate-100 truncate">{inv.email}</p>
                              <p className="text-xs text-slate-300/70">
                                Envoyée le {new Date(inv.created_at).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteInvitation(inv.id)}
                              className="text-red-300 hover:text-red-200"
                              type="button"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <h2 className="text-base font-semibold text-slate-100 mb-4">Membres</h2>
                    <div className="space-y-3">
                      {teamMembers.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex justify-between items-center gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-slate-100 font-medium truncate">{m.full_name}</p>
                            <p className="text-sm text-slate-300/70 truncate">
                              {m.job_title} • {m.email}
                            </p>
                          </div>

                          {m.id !== user?.id && m.role !== "chef" ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleChangeRole(m.id, e.target.value)}
                              className={cn(ui.input, "max-w-[160px]")}
                            >
                              <option value="admin">Admin</option>
                              <option value="chef">Chef</option>
                              <option value="second">Second</option>
                              <option value="member">Membre</option>
                              <option value="commis">Commis</option>
                              <option value="stagiaire">Stagiaire</option>
                            </select>
                          ) : (
                            <div className="text-xs text-slate-300/70 whitespace-nowrap">
                              {m.id === user?.id ? "Vous" : m.role}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
