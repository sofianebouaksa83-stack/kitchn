import { Trash2, UserPlus, X } from "lucide-react";

export function ManageGroupModal(props: {
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

  isPremium: boolean;
  ent: { maxMembersPerGroup: number };
}) {
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
    isPremium,
    ent,
  } = props;

  if (!open || !selectedGroup) return null;

  const isMembersLimitReached =
    !isPremium &&
    (selectedGroup.members?.length ?? 0) >= ent.maxMembersPerGroup;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-100 truncate">
            {canManageGroups ? "Gérer" : "Détails"} : {selectedGroup.name}
          </h2>

          <button onClick={onClose} className={ui.btnGhost}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {!canManageGroups && (
          <div className="rounded-2xl bg-black/10 ring-1 ring-white/10 p-3 text-sm text-slate-200">
            Seul le <b>propriétaire</b> du groupe peut gérer les membres et les paramètres.
          </div>
        )}

        {canManageGroups && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <h3 className="text-white font-semibold mb-3">
              Ajouter un membre (équipe)
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={ui.input + " flex-1"}
                disabled={manageLoading || isMembersLimitReached}
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
                className={ui.btnPrimary + " flex items-center gap-2"}
                onClick={onAddMember}
                disabled={manageLoading || !selectedUserId || isMembersLimitReached}
              >
                <UserPlus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {!isPremium && (
              <div className="mt-2 text-xs text-slate-400">
                Limite : {ent.maxMembersPerGroup} membres par groupe (actuel :{" "}
                {selectedGroup.members.length})
              </div>
            )}

            {isMembersLimitReached && (
              <div className="mt-2 text-xs text-amber-200">
                Limite atteinte. Passe Premium pour ajouter plus de membres.
              </div>
            )}

            {!availableTeam.length && (
              <p className="text-white/60 text-sm mt-2">
                Tout le monde de l’équipe est déjà dans ce groupe.
              </p>
            )}
          </div>
        )}

        <div className="border-t border-slate-800 pt-4 mt-6">
          <h3 className="text-sm font-medium text-slate-300 mb-3">
            Membres ({selectedGroup.members.length})
          </h3>

          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {selectedGroup.members.map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-2xl bg-black/10 ring-1 ring-white/10 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm text-slate-100 truncate">
                    {m.full_name ?? "Sans nom"}
                  </div>
                  <div className="text-xs text-slate-400">{m.role}</div>
                </div>

                {canManageGroups && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m.id)}
                    className="text-red-400 hover:text-red-300 disabled:opacity-40"
                    title="Retirer du groupe"
                    disabled={manageLoading || m.id === userId}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {canManageGroups && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => onDeleteGroup(selectedGroup.id)}
                disabled={manageLoading}
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer le groupe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
