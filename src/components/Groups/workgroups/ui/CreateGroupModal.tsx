import { useEffect } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import { X } from "lucide-react";

function useLockBodyScroll(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);
}

export function CreateGroupModal(props: {
  ui: any;
  open: boolean;
  onClose: () => void;
  manageLoading: boolean;

  newGroupName: string;
  setNewGroupName: (v: string) => void;
  newGroupDescription: string;
  setNewGroupDescription: (v: string) => void;

  onCreate: () => Promise<void>;
  isPremium: boolean;
  ent: { maxGroups: number; maxMembersPerGroup: number };
}) {
  const {
    ui,
    open,
    onClose,
    manageLoading,
    newGroupName,
    setNewGroupName,
    newGroupDescription,
    setNewGroupDescription,
    onCreate,
    isPremium,
    ent,
  } = props;

  const dragControls = useDragControls();
  useLockBodyScroll(open);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-[#020617]/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#071127] shadow-[0_-20px_80px_rgba(0,0,0,0.55)] sm:max-w-md sm:rounded-[28px] sm:border sm:border-white/10 sm:bg-white/[0.06] sm:ring-1 sm:ring-white/10 sm:shadow-[0_18px_70px_rgba(0,0,0,0.35)] sm:backdrop-blur-md"
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
              className="sticky top-0 z-20 border-b border-white/10 bg-[#071127]/95 px-4 pb-3 pt-3 backdrop-blur-xl sm:bg-transparent sm:px-6 sm:pt-5"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25 sm:hidden" />

              <div className="flex items-center justify-between gap-3">
                <h2 className="truncate text-xl font-semibold text-slate-100">
                  Créer un groupe
                </h2>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/15"
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 pb-8 pt-4 sm:p-6 sm:pt-4">
              <div className="space-y-4">
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nom du groupe"
                  className={ui.input}
                />

                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Description"
                  className={ui.textarea}
                />

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className={ui.btnGhost + " rounded-2xl"}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={onCreate}
                    disabled={!newGroupName.trim() || manageLoading}
                    className={ui.btnPrimary + " flex-1"}
                  >
                    {manageLoading ? "Création…" : "Créer"}
                  </button>
                </div>

                {!isPremium && (
                  <div className="text-xs text-slate-400">
                    Offre actuelle : {ent.maxGroups} groupe / {ent.maxMembersPerGroup} membres.
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
