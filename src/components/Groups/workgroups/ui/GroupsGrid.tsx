import { Check, Pencil, Users, X } from "lucide-react";

export function GroupsGrid(props: {
  ui: any;
  groups: any[];
  canManageGroups: boolean;

  editingId: string | null;
  editName: string;
  setEditName: (v: string) => void;
  manageLoading: boolean;

  onStartRename: (groupId: string, name: string) => void;
  onCancelRename: () => void;
  onConfirmRename: (groupId: string, name: string) => Promise<void>;

  onOpenManage: (g: any) => Promise<void>;
  onRequestCreate: () => void;
}) {
  const {
    ui,
    groups,
    canManageGroups,
    editingId,
    editName,
    setEditName,
    manageLoading,
    onStartRename,
    onCancelRename,
    onConfirmRename,
    onOpenManage,
    onRequestCreate,
  } = props;

  if (groups.length === 0) {
    return (
      <div className={`${ui.glassPanel} py-16 text-center`}>
        <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-300 text-lg">Aucun groupe pour le moment</p>
        {canManageGroups && (
          <button onClick={onRequestCreate} className={`${ui.linkAmber} mt-4`}>
            Créer votre premier groupe
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <div
          key={group.id}
          className={[
            "cursor-pointer text-left",
            "relative rounded-3xl border ring-1 overflow-hidden",
            "border-white/10 ring-white/10 bg-white/[0.06]",
            "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
            "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
          ].join(" ")}
          onClick={() => onOpenManage(group)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenManage(group);
          }}
        >
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {editingId === group.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={ui.input + " h-10"}
                      autoFocus
                    />
                    <button
                      className={ui.btnPrimary}
                      disabled={manageLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmRename(group.id, editName);
                      }}
                      title="Enregistrer"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <button
                      className={ui.btnGhost}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelRename();
                      }}
                      title="Annuler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-xl font-semibold text-slate-100 mb-2">
                    {group.name}
                  </h3>
                )}

                {group.description && (
                  <p className="text-sm text-slate-400 mb-3">{group.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-slate-300 mb-3">
                  <Users className="w-4 h-4" />
                  {group.members?.length ?? 0} membres
                </div>

                {group.isOwner && (
                  <span className="inline-block mb-1 px-2 py-1 text-xs rounded bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30">
                    Propriétaire
                  </span>
                )}
              </div>

              {/* ✅ owner-only rename */}
              {canManageGroups && group.isOwner && editingId !== group.id && (
                <button
                  className={ui.btnGhost}
                  title="Renommer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartRename(group.id, group.name ?? "");
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
