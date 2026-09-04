import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Users } from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";
import { CreateGroupModal } from "../../features/groups/components/CreateGroupModal";
import { GroupsGrid } from "../../features/groups/components/GroupsGrid";
import { ManageGroupModal } from "../../features/groups/components/ManageGroupModal";
import { SoloModeCard } from "../../features/groups/components/SoloModeCard";
import { usePendingInvitation } from "../../features/groups/hooks/usePendingInvitation";
import { useWorkGroupsData } from "../../features/groups/hooks/useWorkGroupsData";
import { navigateToSettingsTab } from "../../features/settings/utils/settingsRoute";
import { useSubscription } from "../../hooks/useSubscription";
import {
  getGroupEntitlements,
  type PremiumGateKey,
} from "../../lib/entitlements";
import { ui } from "../../styles/ui";
import { KitchNLoader } from "../Loading/KitchNLoader";
import { PremiumModal } from "../PremiumModal";

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2">
      <div className="rounded-2xl bg-black/70 px-4 py-3 text-sm text-slate-100 shadow-[0_18px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/15 backdrop-blur-md">
        {message}
      </div>
    </div>
  );
}

export function WorkGroups() {
  const { user, refreshProfile } = useAuth();
  const { isPremium, loading: subscriptionLoading } =
    useSubscription(user?.id ?? null);

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [premiumKey, setPremiumKey] =
    useState<PremiumGateKey>("groups.limit");
  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const groupsAnchorRef = useRef<HTMLDivElement | null>(null);
  const entitlements = getGroupEntitlements(Boolean(isPremium));

  const openPremium = (key: PremiumGateKey) => {
    setPremiumKey(key);
    setPremiumOpen(true);
  };

  const workGroups = useWorkGroupsData({
    userId: user?.id ?? null,
    isPremium: Boolean(isPremium),
    ent: entitlements,
    openPremium,
    onCreatedToast: (name) => {
      setToastMessage(`Groupe “${name}” créé ✅`);
    },
  });

  const invitation = usePendingInvitation({
    userId: user?.id ?? null,
    refreshProfile: async () => {
      await refreshProfile?.();
    },
    onAccepted: workGroups.reloadProfileAndData,
  });

  const ownedGroupsCount = workGroups.groups.filter(
    (group) => group.isOwner
  ).length;
  const isSolo = !workGroups.restaurantId;

  const requestCreate = () => {
    if (
      !isPremium &&
      ownedGroupsCount >= entitlements.maxGroups
    ) {
      openPremium("groups.limit");
      return;
    }

    workGroups.setShowCreateModal(true);
  };

  const handleCreateAndGo = async () => {
    const createdId = await workGroups.handleCreateGroup();
    if (!createdId) return;

    window.setTimeout(() => {
      groupsAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);

    window.setTimeout(() => {
      const createdGroup = workGroups.groups.find(
        (group) => group.id === createdId
      );
      if (createdGroup) void workGroups.openManage(createdGroup);
    }, 450);
  };

  const goSubscription = () => {
    setPremiumOpen(false);
    navigateToSettingsTab("subscription");
  };

  const closeToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} px-4 py-6 sm:px-6 sm:py-8`}>
        <div className={isSolo ? "mx-auto max-w-4xl" : undefined}>
          {isSolo ? (
            <>
              <SoloModeCard
                errorMsg={workGroups.errorMsg}
                checkingInvite={invitation.checkingInvite}
                acceptingInvite={invitation.acceptingInvite}
                inviteMsg={invitation.inviteMsg}
                inviteState={invitation.inviteState}
                pendingInvite={invitation.pendingInvite}
                acceptSuccess={invitation.acceptSuccess}
                onRefreshInvite={invitation.loadPendingInvitation}
                onAcceptInvite={invitation.handleAcceptInvitation}
              />

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={requestCreate}
                  className={`${ui.btnPrimary} rounded-2xl px-5 py-2.5`}
                  disabled={subscriptionLoading}
                  title={
                    !isPremium &&
                    ownedGroupsCount >= entitlements.maxGroups
                      ? "Limite Free atteinte"
                      : "Créer un groupe"
                  }
                >
                  <Plus className="h-5 w-5" />
                  Créer mon premier groupe
                </button>
              </div>
            </>
          ) : (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="flex items-center gap-3 text-lg font-semibold text-slate-100 sm:text-xl">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25">
                    <Users className="h-5 w-5 text-amber-200" />
                  </span>
                  Groupes de travail
                </h1>
                <p className="mt-2 text-sm text-slate-300/70">
                  Collaborez avec votre équipe (partage de recettes par groupe).
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {isPremium ? "Premium activé" : "Version gratuite"}
                </p>
              </div>

              {!subscriptionLoading ? (
                <button
                  type="button"
                  onClick={requestCreate}
                  className={`${ui.btnPrimary} rounded-2xl px-5 py-2.5`}
                >
                  <Plus className="h-5 w-5" />
                  Créer un groupe
                </button>
              ) : (
                <KitchNLoader className="kitchn-loader--compact" />
              )}
            </div>
          )}

          <div
            ref={groupsAnchorRef}
            className={isSolo ? "mt-6" : undefined}
          >
            {workGroups.errorMsg && (
              <div className="mb-5 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20">
                {workGroups.errorMsg}
              </div>
            )}

            <GroupsGrid
              groups={workGroups.groups}
              canManageGroups={workGroups.canManageGroups}
              editingId={workGroups.editingId}
              editName={workGroups.editName}
              setEditName={workGroups.setEditName}
              manageLoading={workGroups.manageLoading}
              onStartRename={(groupId, name) => {
                workGroups.setEditingId(groupId);
                workGroups.setEditName(name);
              }}
              onCancelRename={() => {
                workGroups.setEditingId(null);
                workGroups.setEditName("");
              }}
              onConfirmRename={workGroups.handleRenameGroup}
              onOpenManage={workGroups.openManage}
              onRequestCreate={requestCreate}
            />
          </div>

          <CreateGroupModal
            open={workGroups.showCreateModal}
            onClose={() => workGroups.setShowCreateModal(false)}
            manageLoading={workGroups.manageLoading}
            newGroupName={workGroups.newGroupName}
            setNewGroupName={workGroups.setNewGroupName}
            newGroupDescription={workGroups.newGroupDescription}
            setNewGroupDescription={workGroups.setNewGroupDescription}
            onCreate={handleCreateAndGo}
            isPremium={Boolean(isPremium)}
            ent={entitlements}
          />

          <ManageGroupModal
            open={
              workGroups.showManageModal &&
              Boolean(workGroups.selectedGroupFresh)
            }
            onClose={workGroups.closeManage}
            canManageGroups={Boolean(
              workGroups.selectedGroupFresh?.isOwner
            )}
            manageLoading={workGroups.manageLoading}
            selectedGroup={workGroups.selectedGroupFresh}
            userId={user?.id ?? null}
            availableTeam={workGroups.availableTeam}
            selectedUserId={workGroups.selectedUserId}
            setSelectedUserId={workGroups.setSelectedUserId}
            onAddMember={workGroups.handleAddMemberFromTeam}
            onRemoveMember={workGroups.handleRemoveMember}
            onDeleteGroup={workGroups.handleDeleteGroup}
            isPremium={Boolean(isPremium)}
            ent={entitlements}
          />
        </div>
      </div>

      <PremiumModal
        open={premiumOpen}
        gateKey={premiumKey}
        onClose={() => setPremiumOpen(false)}
        onGoSubscription={goSubscription}
      />

      {toastMessage && (
        <Toast message={toastMessage} onClose={closeToast} />
      )}
    </div>
  );
}
