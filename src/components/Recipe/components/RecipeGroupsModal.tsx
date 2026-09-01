import {
  AlertCircle,
  CheckCircle,
  Users,
  X,
} from "lucide-react";
import { ui } from "../../../styles/ui";
import { useRecipeGroupsModal } from "../../../features/recipe/hooks/useRecipeGroupsModal";

type Props = {
  open: boolean;
  recipeId: string;
  onClose: () => void;
};

export function RecipeGroupsModal({
  open,
  recipeId,
  onClose,
}: Props) {
  const groupsModal = useRecipeGroupsModal({
    open,
    recipeId,
    onClose,
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fermer"
        type="button"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />

          <div className="relative px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-slate-100 font-semibold flex items-center gap-2">
                <span className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                  <Users className="w-5 h-5 text-amber-200" />
                </span>
                Partager à un groupe
              </div>

              <div className="text-xs text-slate-300/70 mt-1">
                Coche les groupes qui doivent voir cette recette.
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-10 w-10 rounded-2xl inline-flex items-center justify-center hover:bg-white/[0.07] transition"
              aria-label="Fermer"
              type="button"
            >
              <X className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          <div className="relative p-5 space-y-4">
            {groupsModal.status === "success" ? (
              <div className="rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex gap-3">
                <CheckCircle className="text-emerald-300" />
                <p className="text-emerald-200">
                  {groupsModal.message}
                </p>
              </div>
            ) : null}

            {groupsModal.status === "error" ? (
              <div className="rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
                <AlertCircle className="text-red-300" />
                <p className="text-red-200">
                  {groupsModal.message}
                </p>
              </div>
            ) : null}

            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
              {groupsModal.groups.length === 0 ? (
                <div className="text-sm text-slate-300/70">
                  Aucun groupe trouvé. Crée un groupe dans
                  l’onglet <b>Groupes</b> puis reviens ici pour
                  partager ta recette.
                </div>
              ) : (
                <div className="space-y-2">
                  {groupsModal.groups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 hover:bg-white/[0.05] transition cursor-pointer"
                    >
                      <div className="text-slate-100">
                        {group.name}
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          !!groupsModal.selected[group.id]
                        }
                        onChange={(event) =>
                          groupsModal.setSelected(
                            (previousSelected) => ({
                              ...previousSelected,
                              [group.id]: event.target.checked,
                            })
                          )
                        }
                        className="h-4 w-4 rounded border-white/20 bg-white/10"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className={ui.btnGhost}
                type="button"
              >
                Annuler
              </button>

              <button
                onClick={groupsModal.save}
                className={ui.btnPrimary}
                disabled={
                  groupsModal.loading ||
                  groupsModal.groups.length === 0
                }
                type="button"
              >
                {groupsModal.loading
                  ? "Sauvegarde…"
                  : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}