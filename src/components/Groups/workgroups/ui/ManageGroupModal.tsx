import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { Trash2, UserPlus, X } from "lucide-react";

function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);
}

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

  const dragControls = useDragControls();
  const [renderedGroup, setRenderedGroup] = useState<any | null>(selectedGroup);

  useEffect(() => {
    if (selectedGroup) setRenderedGroup(selectedGroup);
  }, [selectedGroup]);

  useLockBodyScroll(open);

  const group = renderedGroup;
  const members = group?.members ?? [];

  const isMembersLimitReached =
    !isPremium && members.length >= ent.maxMembersPerGroup;

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
                <div className="rounded-2xl bg-black/10 ring-1 ring-amber-400/15 p-3 text-sm text-slate-200">
                  Seul le <b>propriétaire</b> du groupe peut gérer les membres et les paramètres.
                </div>
              )}

              {canManageGroups && (
                <div className="rounded-2xl bg-black/10 ring-1 ring-amber-400/15 p-4">
                  <h3 className="mb-3 font-semibold text-white">
                    Ajouter un membre (équipe)
                  </h3>

                  <div className="flex flex-col gap-2 sm:flex-row">
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
                      className={ui.btnPrimary + " flex items-center justify-center gap-2"}
                      onClick={onAddMember}
                      disabled={manageLoading || !selectedUserId || isMembersLimitReached}
                    >
                      <UserPlus className="h-4 w-4" />
                      Ajouter
                    </button>
                  </div>

                  {!isPremium && (
                    <div className="mt-2 text-xs text-slate-400">
                      Limite : {ent.maxMembersPerGroup} membres par groupe (actuel : {members.length})
                    </div>
                  )}

                  {isMembersLimitReached && (
                    <div className="mt-2 text-xs text-amber-200">
                      Limite atteinte. Passe Premium pour ajouter plus de membres.
                    </div>
                  )}

                  {!availableTeam.length && (
                    <p className="mt-2 text-sm text-white/60">
                      Tout le monde de l’équipe est déjà dans ce groupe.
                    </p>
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
                          {m.full_name ?? "Sans nom"}
                        </div>
                        <div className="text-xs text-slate-400">{m.role}</div>
                      </div>

                      {canManageGroups && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(m.id)}
                          className="text-red-400 transition hover:text-red-300 disabled:opacity-40"
                          title="Retirer du groupe"
                          disabled={manageLoading || m.id === userId}
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
                      disabled={manageLoading}
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
