import {
  AnimatePresence,
  motion,
  useDragControls,
} from "framer-motion";

import {
  Plus,
  X,
} from "lucide-react";

import type { GroupEntitlements } from "../../../lib/entitlements";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import { ui } from "../../../styles/ui";

export function CreateGroupModal(props: {
  open: boolean;
  onClose: () => void;
  manageLoading: boolean;

  newGroupName: string;
  setNewGroupName: (v: string) => void;

  newGroupDescription: string;
  setNewGroupDescription: (v: string) => void;

  onCreate: () => Promise<void>;

  isPremium: boolean;
  ent: GroupEntitlements;
}) {
  const {
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

  const dragControls =
    useDragControls();

  useLockBodyScroll(
    open,
    true,
  );

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="
            fixed inset-0 z-50
            flex items-end
            justify-center
            sm:items-center
            sm:p-4
          "
        >
          {/* OVERLAY */}
          <motion.div
            className="
              absolute inset-0
              bg-[#173E31]/22
              backdrop-blur-[3px]
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="
              relative
              flex max-h-[92dvh]
              w-full flex-col
              overflow-hidden
              rounded-t-[32px]
              border-t
              border-[#173E31]/10
              bg-[#FBFAF6]
              shadow-[0_-20px_70px_rgba(23,62,49,0.18)]

              sm:max-w-md
              sm:rounded-[28px]
              sm:border
              sm:border-[#173E31]/10
              sm:shadow-[0_22px_65px_rgba(23,62,49,0.16)]
            "
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
            drag="y"
            dragControls={
              dragControls
            }
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.35,
            }}
            onDragEnd={(
              _,
              info,
            ) => {
              if (
                info.offset.y >
                  120 ||
                info.velocity.y >
                  700
              ) {
                onClose();
              }
            }}
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}
            <div
              className="
                sticky top-0 z-20
                border-b
                border-[#173E31]/8
                bg-[#FBFAF6]/95
                px-4 pb-3 pt-3
                backdrop-blur-xl

                sm:px-6
                sm:pt-5
              "
              onPointerDown={(
                event,
              ) =>
                dragControls.start(
                  event,
                )
              }
            >
              <div
                className="
                  mx-auto mb-3
                  h-1.5 w-12
                  rounded-full
                  bg-[#C7A45D]/45
                  sm:hidden
                "
              />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-[#A8833E]
                    "
                  >
                    Nouveau
                  </p>

                  <h2
                    className="
                      font-serif
                      text-xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    Créer un groupe
                  </h2>
                </div>

                <button
                  type="button"
                  onPointerDown={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                  onClick={onClose}
                  className="
                    flex h-10 w-10
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#E7EEE8]
                    text-[#184C3A]
                    transition
                    hover:bg-[#DDE8DF]
                  "
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div
              className="
                overflow-y-auto
                px-4 pb-8 pt-4

                sm:p-6
                sm:pt-5
              "
            >
              <div className="space-y-4">
                <div>
                  <label
                    className="
                      mb-2 block
                      text-xs font-semibold
                      text-[#29493E]
                    "
                  >
                    Nom du groupe
                  </label>

                  <input
                    value={
                      newGroupName
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewGroupName(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Ex : Menu Printemps"
                    className={
                      ui.input
                    }
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    className="
                      mb-2 block
                      text-xs font-semibold
                      text-[#29493E]
                    "
                  >
                    Description
                  </label>

                  <textarea
                    value={
                      newGroupDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setNewGroupDescription(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Décris rapidement l’utilisation du groupe…"
                    className={
                      ui.textarea
                    }
                  />
                </div>

                {!isPremium ? (
                  <div
                    className="
                      rounded-2xl
                      bg-[#E7EEE8]
                      px-4 py-3
                      text-xs
                      leading-relaxed
                      text-[#617168]
                    "
                  >
                    Offre actuelle :{" "}
                    <strong className="text-[#173E31]">
                      {ent.maxGroups}
                    </strong>{" "}
                    groupe /{" "}
                    <strong className="text-[#173E31]">
                      {
                        ent.maxMembersPerGroup
                      }
                    </strong>{" "}
                    membres.
                  </div>
                ) : null}

                <div
                  className="
                    flex gap-3
                    pt-2
                  "
                >
                  <button
                    type="button"
                    onClick={
                      onClose
                    }
                    className={`${ui.btnGhost} flex-1`}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={
                      onCreate
                    }
                    disabled={
                      !newGroupName.trim() ||
                      manageLoading
                    }
                    className={`${ui.btnPrimary} flex-[1.4]`}
                  >
                    <Plus className="h-4 w-4" />

                    {manageLoading
                      ? "Création…"
                      : "Créer"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}