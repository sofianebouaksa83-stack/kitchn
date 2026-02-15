import { X } from "lucide-react";

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
  const { ui, open, onClose, manageLoading, newGroupName, setNewGroupName, newGroupDescription, setNewGroupDescription, onCreate, isPremium, ent } =
    props;

  if (!open) return null;

  return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-100">Créer un groupe</h2>
          <button onClick={onClose} className={ui.btnGhost}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Nom du groupe" className={ui.input} />

          <textarea
            value={newGroupDescription}
            onChange={(e) => setNewGroupDescription(e.target.value)}
            placeholder="Description"
            className={ui.textarea}
          />

          <div className="flex gap-3">
            <button onClick={onClose} className={ui.btnGhost + " rounded-2xl"}>
              Annuler
            </button>
            <button onClick={onCreate} disabled={!newGroupName.trim() || manageLoading} className={ui.btnPrimary + " flex-1"}>
              Créer
            </button>
          </div>

          {!isPremium && <div className="text-xs text-slate-400">Offre actuelle : {ent.maxGroups} groupe / {ent.maxMembersPerGroup} membres.</div>}
        </div>
      </div>
    </div>
  );
}
