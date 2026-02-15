import { useEffect, useRef, useState } from "react";
import { Users, Plus } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";
import { getGroupEntitlements, PremiumGateKey } from "../../lib/entitlements";

import { ui } from "../../styles/ui";
import { PremiumModal } from "../PremiumModal";

import { useWorkGroupsData } from "./workgroups/hooks/useWorkGroupsData";
import { usePendingInvitation } from "./workgroups/hooks/usePendingInvitation";

import { SoloModeCard } from "./workgroups/ui/SoloModeCard";
import { GroupsGrid } from "./workgroups/ui/GroupsGrid";
import { CreateGroupModal } from "./workgroups/ui/CreateGroupModal";
import { ManageGroupModal } from "./workgroups/ui/ManageGroupModal";

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
      <div className="rounded-2xl bg-black/70 ring-1 ring-white/15 backdrop-blur-md px-4 py-3 text-sm text-slate-100 shadow-[0_18px_70px_rgba(0,0,0,0.45)]">
        {msg}
      </div>
    </div>
  );
}

export function WorkGroups() {
  const { user, refreshProfile } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription(user?.id ?? null);

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumKey, setPremiumKey] = useState<PremiumGateKey>("groups");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const groupsAnchorRef = useRef<HTMLDivElement | null>(null);

  const openPremium = (key: PremiumGateKey) => {
    setPremiumKey(key);
    setPremiumOpen(true);
  };

  const goSubscription = () => {
    // branche ta navigation / checkout ici si besoin
  };

  const ent = getGroupEntitlements(!!isPremium);

  const wg = useWorkGroupsData({
    userId: user?.id ?? null,
    isPremium: !!isPremium,
    ent,
    openPremium,
    onCreatedToast: (name) => {
      setToastMsg(`Groupe “${name}” créé ✅`);
    },
  });

  const inv = usePendingInvitation({
    userId: user?.id ?? null,
    refreshProfile: async () => {
      await refreshProfile?.();
    },
    onAccepted: async () => {
      await wg.reloadProfileAndData();
    },
  });

  const requestCreate = () => {
    if (!isPremium && wg.groups.length >= ent.maxGroups) {
      openPremium("groups.limit");
      return;
    }
    wg.setShowCreateModal(true);
  };

  // ✅ Transition automatique : après création on scroll vers la grille + on ouvre la gestion (bonus)
  const handleCreateAndGo = async () => {
    const createdId = await wg.handleCreateGroup();
    if (!createdId) return;

    // petit délai pour laisser React afficher la grille
    setTimeout(() => {
      groupsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);

    // bonus : ouvrir directement la modale de gestion du groupe créé
    setTimeout(() => {
      const g = wg.groups.find((x) => x.id === createdId);
      if (g) wg.openManage(g);
    }, 450);
  };

  const showGrid = wg.groups.length > 0;

  // ✅ Mode solo
  if (!wg.restaurantId) {
    return (
      <div className={ui.dashboardBg}>
        <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
          <div className="max-w-4xl mx-auto">
            <SoloModeCard
              ui={ui}
              errorMsg={wg.errorMsg}
              checkingInvite={inv.checkingInvite}
              acceptingInvite={inv.acceptingInvite}
              inviteMsg={inv.inviteMsg}
              inviteState={inv.inviteState}
              pendingInvite={inv.pendingInvite}
              acceptSuccess={inv.acceptSuccess}
              onRefreshInvite={inv.loadPendingInvitation}
              onAcceptInvite={inv.handleAcceptInvitation}
            />

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={requestCreate}
                className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl`}
                disabled={subLoading}
                title={
                  !isPremium && wg.groups.length >= ent.maxGroups
                    ? "Limite Free atteinte"
                    : "Créer un groupe"
                }
              >
                <Plus className="w-5 h-5" /> Créer mon premier groupe
              </button>
            </div>

            {/* ✅ Vue Groupes (Étape 3) */}
            <div ref={groupsAnchorRef} className="mt-6">
              {wg.errorMsg && (
                <div className="mb-5 rounded-2xl bg-red-500/10 text-red-200 ring-1 ring-red-400/20 px-4 py-3 text-sm">
                  {wg.errorMsg}
                </div>
              )}

              <GroupsGrid
                ui={ui}
                groups={wg.groups}
                canManageGroups={wg.canManageGroups}
                editingId={wg.editingId}
                editName={wg.editName}
                setEditName={wg.setEditName}
                manageLoading={wg.manageLoading}
                onStartRename={(groupId, name) => {
                  wg.setEditingId(groupId);
                  wg.setEditName(name);
                }}
                onCancelRename={() => {
                  wg.setEditingId(null);
                  wg.setEditName("");
                }}
                onConfirmRename={wg.handleRenameGroup}
                onOpenManage={wg.openManage}
                onRequestCreate={requestCreate}
              />
            </div>

            <CreateGroupModal
              ui={ui}
              open={wg.showCreateModal}
              onClose={() => wg.setShowCreateModal(false)}
              manageLoading={wg.manageLoading}
              newGroupName={wg.newGroupName}
              setNewGroupName={wg.setNewGroupName}
              newGroupDescription={wg.newGroupDescription}
              setNewGroupDescription={wg.setNewGroupDescription}
              // ✅ ici on branche la transition auto
              onCreate={handleCreateAndGo}
              isPremium={!!isPremium}
              ent={ent}
            />

            <ManageGroupModal
              ui={ui}
              open={wg.showManageModal && !!wg.selectedGroupFresh}
              onClose={wg.closeManage}
              canManageGroups={!!wg.selectedGroupFresh?.isOwner}
              manageLoading={wg.manageLoading}
              selectedGroup={wg.selectedGroupFresh}
              userId={user?.id ?? null}
              availableTeam={wg.availableTeam}
              selectedUserId={wg.selectedUserId}
              setSelectedUserId={wg.setSelectedUserId}
              onAddMember={wg.handleAddMemberFromTeam}
              onRemoveMember={wg.handleRemoveMember}
              onDeleteGroup={wg.handleDeleteGroup}
              isPremium={!!isPremium}
              ent={ent}
            />

            <PremiumModal
              open={premiumOpen}
              gateKey={premiumKey}
              onClose={() => setPremiumOpen(false)}
              onGoSubscription={goSubscription}
            />

            {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Restaurant OK
  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-100 flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Users className="w-5 h-5 text-amber-200" />
              </span>
              Groupes de travail
            </h1>
            <p className="text-sm text-slate-300/70 mt-2">
              Collaborez avec votre équipe (partage de recettes par groupe).
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isPremium ? "Premium activé" : "Version gratuite"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!subLoading ? (
              <button
                type="button"
                onClick={requestCreate}
                className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl`}
              >
                <Plus className="w-5 h-5" /> Créer un groupe
              </button>
            ) : (
              <div className="text-slate-300/70 text-sm">Chargement…</div>
            )}
          </div>
        </div>

        <div ref={groupsAnchorRef}>
          {wg.errorMsg && (
            <div className="mb-5 rounded-2xl bg-red-500/10 text-red-200 ring-1 ring-red-400/20 px-4 py-3 text-sm">
              {wg.errorMsg}
            </div>
          )}

          <GroupsGrid
            ui={ui}
            groups={wg.groups}
            canManageGroups={wg.canManageGroups}
            editingId={wg.editingId}
            editName={wg.editName}
            setEditName={wg.setEditName}
            manageLoading={wg.manageLoading}
            onStartRename={(groupId, name) => {
              wg.setEditingId(groupId);
              wg.setEditName(name);
            }}
            onCancelRename={() => {
              wg.setEditingId(null);
              wg.setEditName("");
            }}
            onConfirmRename={wg.handleRenameGroup}
            onOpenManage={wg.openManage}
            onRequestCreate={requestCreate}
          />
        </div>

        <CreateGroupModal
          ui={ui}
          open={wg.showCreateModal && wg.canManageGroups}
          onClose={() => wg.setShowCreateModal(false)}
          manageLoading={wg.manageLoading}
          newGroupName={wg.newGroupName}
          setNewGroupName={wg.setNewGroupName}
          newGroupDescription={wg.newGroupDescription}
          setNewGroupDescription={wg.setNewGroupDescription}
          onCreate={handleCreateAndGo}
          isPremium={!!isPremium}
          ent={ent}
        />

        <ManageGroupModal
          ui={ui}
          open={wg.showManageModal && !!wg.selectedGroupFresh}
          onClose={wg.closeManage}
          canManageGroups={!!wg.selectedGroupFresh?.isOwner}
          manageLoading={wg.manageLoading}
          selectedGroup={wg.selectedGroupFresh}
          userId={user?.id ?? null}
          availableTeam={wg.availableTeam}
          selectedUserId={wg.selectedUserId}
          setSelectedUserId={wg.setSelectedUserId}
          onAddMember={wg.handleAddMemberFromTeam}
          onRemoveMember={wg.handleRemoveMember}
          onDeleteGroup={wg.handleDeleteGroup}
          isPremium={!!isPremium}
          ent={ent}
        />
      </div>

      <PremiumModal
        open={premiumOpen}
        gateKey={premiumKey}
        onClose={() => setPremiumOpen(false)}
        onGoSubscription={goSubscription}
      />

      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
    </div>
  );
}
