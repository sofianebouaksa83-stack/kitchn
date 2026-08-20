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
import { KitchNLoader } from "../Loading/KitchNLoader";

type Group = {
  id: string;
  name: string;
  created_at?: string;
  created_by?: string;
};

type GroupRole = "admin" | "chef_de_partie" | "commis";

type TeamMember = {
  id: string;
  email: string;
  full_name: string;
  job_title: string;
  role: GroupRole;
};

type Invitation = {
  id: string;
  email: string;
  role: GroupRole;
  token: string;
  created_at: string;
  accepted_at: string | null;
  expires_at: string | null;
  work_group_id?: string | null;
};

function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function roleLabel(role: GroupRole) {
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

function normalizeRole(value: unknown): GroupRole {
  if (value === "admin" || value === "chef_de_partie" || value === "commis") {
    return value;
  }
  return "commis";
}

export function TeamManagement() {
  const { user, profile } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>("");

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<GroupRole>("commis");

  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [inviteMessage, setInviteMessage] = useState("");

  const [canAccess, setCanAccess] = useState(false);
  const [groupOwnerId, setGroupOwnerId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GroupRole | null>(null);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);

  const [freshPlan, setFreshPlan] = useState<string | null>(null);
  const GROUP_MEMBERS_TO_WORK_GROUPS_FK = "group_members_work_group_id_fkey";

  useEffect(() => {
    if (!user?.id) {
      setFreshPlan(null);
      setLoadingPlan(false);
      return;
    }

    let cancelled = false;

    async function loadPlan() {
      setLoadingPlan(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("plan, subscription_status, is_premium")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        if (data?.plan) {
          setFreshPlan(String(data.plan));
        } else if (data?.is_premium === true || data?.subscription_status === "active") {
          setFreshPlan("premium");
        } else {
          setFreshPlan("free");
        }
      } catch (err) {
        console.error("[TeamManagement] loadPlan error:", err);
        if (!cancelled) {
          const fallbackPlan =
            profile?.plan === "premium" ||
            (profile as any)?.is_premium === true ||
            (profile as any)?.subscription_status === "active"
              ? "premium"
              : "free";

          setFreshPlan(fallbackPlan);
        }
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    }

    void loadPlan();

    return () => {
      cancelled = true;
    };
  }, [user?.id, profile]);

  useEffect(() => {
    if (!user?.id) {
      setGroups([]);
      setActiveGroupId("");
      setLoadingGroups(false);
      return;
    }

    void loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!activeGroupId) {
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
      setGroupOwnerId(null);
      setMyRole(null);
      setLoading(false);
      return;
    }

    void loadTeamData(activeGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId]);

  const isPremium = useMemo(() => {
    if (freshPlan) return freshPlan === "premium";

    return (
      profile?.plan === "premium" ||
      (profile as any)?.is_premium === true ||
      (profile as any)?.subscription_status === "active"
    );
  }, [freshPlan, profile]);

  const maxMembers = isPremium ? Infinity : 10;

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId),
    [groups, activeGroupId]
  );

  const isOwner = useMemo(() => {
    if (!user?.id) return false;
    return Boolean(groupOwnerId && groupOwnerId === user.id);
  }, [groupOwnerId, user?.id]);

  const isSecond = useMemo(() => myRole === "admin", [myRole]);

  const roleOptionsForManager = useMemo(() => {
    if (isOwner) {
      return [
        { value: "admin" as const, label: "Second" },
        { value: "chef_de_partie" as const, label: "Chef de partie (lecture seule)" },
        { value: "commis" as const, label: "Commis (lecture seule)" },
      ];
    }

    return [
      { value: "chef_de_partie" as const, label: "Chef de partie (lecture seule)" },
      { value: "commis" as const, label: "Commis (lecture seule)" },
    ];
  }, [isOwner]);

  const currentCount = useMemo(
    () => teamMembers.length + invitations.length,
    [teamMembers.length, invitations.length]
  );

  const remainingSlots = useMemo(() => {
    if (!Number.isFinite(maxMembers)) return Infinity;
    return Math.max(0, (maxMembers as number) - currentCount);
  }, [maxMembers, currentCount]);

  async function loadGroups() {
    if (!user?.id) return;

    setLoadingGroups(true);

    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(
          `
          work_group_id,
          role,
          work_groups!${GROUP_MEMBERS_TO_WORK_GROUPS_FK} (
            id,
            name,
            created_at,
            created_by
          )
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;

      const nextGroups: Group[] = (data ?? [])
        .map((m: any) => {
          const wg = m.work_groups;
          return Array.isArray(wg) ? wg[0] : wg;
        })
        .filter(Boolean);

      const unique = Array.from(new Map(nextGroups.map((g) => [g.id, g])).values());
      unique.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      setGroups(unique);
      setActiveGroupId((prev) => prev || unique[0]?.id || "");
    } catch (e) {
      console.error("[TeamManagement] loadGroups error:", e);
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
      const { data: group, error: groupErr } = await supabase
        .from("work_groups")
        .select("id, created_by, name, restaurant_id")
        .eq("id", workGroupId)
        .maybeSingle();

      if (groupErr) throw groupErr;

      setGroupOwnerId(group?.created_by ?? null);
      setActiveRestaurantId(group?.restaurant_id ?? null);

      const isOwnerNow = (group?.created_by ?? null) === user.id;

      const { data: myMembership, error: memErr } = await supabase
        .from("group_members")
        .select("role")
        .eq("work_group_id", workGroupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (memErr) throw memErr;

      const my = normalizeRole(myMembership?.role);
      setMyRole(myMembership ? my : null);

      const isSecondNow = myMembership?.role === "admin";
      setCanAccess(Boolean(isOwnerNow || isSecondNow));

      const { data: gm, error: gmErr } = await supabase
        .from("group_members")
        .select(
          `
          user_id,
          role,
          profiles!group_members_user_id_fkey (
            id, email, full_name, job_title
          )
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
          role: normalizeRole(row.role),
        }))
        .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));

      setTeamMembers(members);

      const { data: invites, error: invErr } = await supabase
        .from("invitations")
        .select("*")
        .eq("work_group_id", workGroupId)
        .is("accepted_at", null);

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
      console.error("[TeamManagement] loadTeamData error:", err);
      setTeamMembers([]);
      setInvitations([]);
      setCanAccess(false);
      setGroupOwnerId(null);
      setMyRole(null);
      setActiveRestaurantId(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshPremiumStatus() {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("plan, subscription_status, is_premium")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.plan) {
        setFreshPlan(String(data.plan));
      } else if (data?.is_premium === true || data?.subscription_status === "active") {
        setFreshPlan("premium");
      } else {
        setFreshPlan("free");
      }
    } catch (err) {
      console.error("[TeamManagement] refreshPremiumStatus error:", err);
    }
  }

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

    if (!isOwner && inviteRole === "admin") {
      setInviteStatus("error");
      setInviteMessage("Seul le Chef peut inviter un Second.");
      return;
    }

    try {
      setInviteStatus("sending");
      setInviteMessage("");

      await refreshPremiumStatus();

      const { data, error } = await supabase.functions.invoke("send-invitation", {
        body: {
          email,
          role: inviteRole,
          workGroupId: activeGroupId,
        },
      });

      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Erreur lors de l’envoi");

      setInviteStatus("success");
      setInviteMessage(`Invitation envoyée à ${email}`);
      setInviteEmail("");
      setInviteRole("commis");
      setShowInviteForm(false);

      setTimeout(() => {
        void loadTeamData(activeGroupId);
        void refreshPremiumStatus();
        setInviteStatus("idle");
        setInviteMessage("");
      }, 600);
    } catch (err: any) {
      setInviteStatus("error");
      setInviteMessage(err?.message ?? "Erreur lors de l’envoi");
    }
  }

  async function handleChangeRole(memberId: string, nextRole: GroupRole) {
    if (!activeGroupId || !user?.id || !canAccess) return;

    if (groupOwnerId && memberId === groupOwnerId) return;
    if (!isOwner && isSecond && nextRole === "admin") return;

    const { data: updated, error } = await supabase
      .from("group_members")
      .update({ role: nextRole })
      .eq("work_group_id", activeGroupId)
      .eq("user_id", memberId)
      .select("work_group_id, user_id, role");

    if (error) {
      console.error("UPDATE ERROR", error);
      alert("UPDATE ERROR: " + error.message);
      return;
    }

    if (!updated || updated.length === 0) {
      alert("UPDATE: 0 ligne modifiée (WHERE ne match pas)");
      return;
    }

    await loadTeamData(activeGroupId);
  }

  async function handleRemoveMember(memberId: string) {
    if (!activeGroupId || !user?.id || !canAccess) return;

    if (groupOwnerId && memberId === groupOwnerId) return;
    if (memberId === user.id) return;

    const ok = confirm("Supprimer ce membre du groupe ?");
    if (!ok) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("work_group_id", activeGroupId)
      .eq("user_id", memberId);

    if (error) {
      console.error("DELETE ERROR", error);
      alert("DELETE ERROR: " + error.message);
      return;
    }

    await loadTeamData(activeGroupId);
  }

  async function handleDeleteInvitation(id: string) {
    if (!confirm("Supprimer cette invitation ?")) return;

    const { error } = await supabase.from("invitations").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (activeGroupId) {
      await loadTeamData(activeGroupId);
    }
  }

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
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Équipe</h1>
                <p className="text-sm text-slate-300/70 mt-1">
                  Gestion des membres, invitations et rôles (par groupe)
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="text-xs text-slate-400">Groupe :</div>

                  {loadingGroups ? (
                    <div className="inline-flex items-center gap-2 text-xs text-slate-300/70">
                      <KitchNLoader className="kitchn-loader--mini" />
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
                    </div>
                  )}

                  {groups.length > 0 && (
                    <div className="text-xs text-slate-400">
                      {loadingPlan ? (
                        <span className="inline-flex items-center gap-2 text-slate-300/70">
                          <KitchNLoader className="kitchn-loader--mini" />
                          Vérification de l’abonnement…
                        </span>
                      ) : isPremium ? (
                        <span className="text-emerald-300">Premium — membres illimités</span>
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
                    {activeRestaurantId ? "" : ""}
                    {canAccess ? (
                      <span className="ml-2 text-emerald-300/90">
                        (Gestion : {isOwner ? "Chef" : isSecond ? "Second" : "—"})
                      </span>
                    ) : null}
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
              <h2 className="text-lg font-semibold text-slate-100 mb-2">Accès refusé</h2>
              <p className="text-sm text-slate-300/70">
                Seuls le <span className="text-slate-200">Chef</span> (créateur du groupe) ou le{" "}
                <span className="text-slate-200">Second</span> peuvent gérer l’équipe de{" "}
                <span className="text-slate-200">{activeGroup?.name ?? "ce groupe"}</span>.
              </p>
            </div>
          )}

          {groups.length > 0 && canAccess && (
            <>
              {loading ? (
                <div className="flex justify-center py-24">
                  <KitchNLoader className="kitchn-loader--compact" />
                </div>
              ) : (
                <>
                  {showInviteForm && (
                    <div className="mt-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                      {!loadingPlan && !isPremium && currentCount >= 10 ? (
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
                            onChange={(e) => setInviteRole(e.target.value as GroupRole)}
                            className={ui.input}
                          >
                            {isOwner && <option value="admin">Second</option>}
                            <option value="chef_de_partie">Chef de partie (lecture seule)</option>
                            <option value="commis">Commis (lecture seule)</option>
                          </select>

                          <button
                            type="submit"
                            disabled={inviteStatus === "sending" || loadingPlan}
                            className={ui.btnPrimary}
                          >
                            <Mail className="w-4 h-4" />
                            {inviteStatus === "sending"
                              ? "Envoi…"
                              : loadingPlan
                              ? "Vérification…"
                              : "Envoyer l’invitation"}
                          </button>

                          {!loadingPlan && !isPremium && (
                            <p className="text-xs text-slate-400">
                              Free : 10 membres max (membres + invitations en attente). Actuellement :{" "}
                              {currentCount}/10.
                            </p>
                          )}

                          {!loadingPlan && isPremium && (
                            <p className="text-xs text-emerald-300/90">
                              Premium actif : membres et invitations illimités.
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
                      {teamMembers.map((m) => {
                        const isMe = m.id === user?.id;
                        const isOwnerMember = Boolean(groupOwnerId && m.id === groupOwnerId);
                        const rightLabel = isMe ? "Vous" : isOwnerMember ? "Chef" : roleLabel(m.role);
                        const canEditThisMember = canAccess && !isMe && !isOwnerMember;

                        return (
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

                            {canEditThisMember ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={m.role}
                                  onChange={(e) => handleChangeRole(m.id, e.target.value as GroupRole)}
                                  className={cn(ui.input, "max-w-[220px]")}
                                >
                                  {roleOptionsForManager.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.id)}
                                  className="p-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 ring-1 ring-transparent hover:ring-red-500/20"
                                  title="Supprimer le membre"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-300/70 whitespace-nowrap">
                                {rightLabel}
                              </div>
                            )}
                          </div>
                        );
                      })}
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