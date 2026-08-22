import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { ui } from "../../styles/ui";
import { KitchNLoader } from "../Loading/KitchNLoader";
import type { Group, GroupRole, TeamMember, Invitation, InviteStatus,} from "../../features/team/types/team.types";
import { isEmail, normalizeRole,} from "../../features/team/utils/teamHelpers";
import { TeamInvitationsSection } from "../../features/team/components/TeamInvitationsSection";
import { TeamMembersSection } from "../../features/team/components/TeamMembersSection";
import { TeamHeader } from "../../features/team/components/TeamHeader"; 
import { TeamAccessDenied } from "../../features/team/components/TeamAccessDenied";

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

  const [inviteStatus, setInviteStatus] =
  useState<InviteStatus>("idle");

  const [inviteMessage, setInviteMessage] = useState("");

  const [canAccess, setCanAccess] = useState(false);
  const [groupOwnerId, setGroupOwnerId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<GroupRole | null>(null);
const [, setActiveRestaurantId] = useState<string | null>(null);
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
          <TeamHeader
            groups={groups}
            loadingGroups={loadingGroups}
            activeGroupId={activeGroupId}
            onActiveGroupChange={setActiveGroupId}
            loadingPlan={loadingPlan}
            isPremium={isPremium}
            remainingSlots={remainingSlots}
            loading={loading}
            membersCount={teamMembers.length}
            invitationsCount={invitations.length}
            activeGroupName={activeGroup?.name}
            canAccess={canAccess}
            isOwner={isOwner}
            isSecond={isSecond}
            showInviteForm={showInviteForm}
            onToggleInviteForm={() =>
              setShowInviteForm((visible) => !visible)
            }
          />

          {groups.length > 0 &&
            !loading &&
            !canAccess && (
              <TeamAccessDenied
                groupName={activeGroup?.name}
              />
            )}

          {groups.length > 0 && canAccess && (
            <>
              {loading ? (
                <div className="flex justify-center py-24">
                  <KitchNLoader className="kitchn-loader--compact" />
                </div>
              ) : (
                <>
                 <TeamInvitationsSection
                    showInviteForm={showInviteForm}
                    loadingPlan={loadingPlan}
                    isPremium={isPremium}
                    currentCount={currentCount}
                    isOwner={isOwner}
                    inviteEmail={inviteEmail}
                    onInviteEmailChange={setInviteEmail}
                    inviteRole={inviteRole}
                    onInviteRoleChange={setInviteRole}
                    inviteStatus={inviteStatus}
                    inviteMessage={inviteMessage}
                    invitations={invitations}
                    onSubmit={handleSendInvitation}
                    onDeleteInvitation={handleDeleteInvitation}
                  />
                  <TeamMembersSection
                    members={teamMembers}
                    currentUserId={user?.id}
                    groupOwnerId={groupOwnerId}
                    canAccess={canAccess}
                    roleOptions={roleOptionsForManager}
                    onChangeRole={handleChangeRole}
                    onRemoveMember={handleRemoveMember}
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}