// src/components/PremiumModal.tsx
import { X } from "lucide-react";
import { ui } from "../styles/ui";
import { getPremiumCopy, PremiumGateKey } from "../lib/entitlements";

type Props = {
  open: boolean;
  gateKey: PremiumGateKey | null;
  onClose: () => void;
  onGoSubscription: () => void;
};

export function PremiumModal({ open, gateKey, onClose, onGoSubscription }: Props) {
  if (!open || !gateKey) return null;

  const copy = getPremiumCopy(gateKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`${ui.card} relative w-[92vw] max-w-md`}>
        <button
          className="absolute right-3 top-3 p-2 rounded-xl hover:bg-white/5"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5">
          <div className="text-lg font-semibold">{copy.title}</div>
          <div className="text-sm opacity-80 mt-2">{copy.body}</div>

          <div className="mt-5 flex gap-2 justify-end">
            <button className={ui.btnSecondary} onClick={onClose}>
              Plus tard
            </button>
            <button className={ui.btnPrimary} onClick={onGoSubscription}>
              {copy.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
