import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

type InviteViewState = "pending" | "expired" | "accepted" | "none";

export function InvitationStatusIcon({ state }: { state: InviteViewState }) {
  if (state === "pending") {
    return (
      <Clock
        className="w-5 h-5 text-emerald-400"
        title="Invitation en attente"
      />
    );
  }

  if (state === "expired") {
    return (
      <AlertTriangle
        className="w-5 h-5 text-amber-400"
        title="Invitation expirée"
      />
    );
  }

  if (state === "accepted") {
    return (
      <CheckCircle
        className="w-5 h-5 text-slate-400"
        title="Invitation déjà acceptée"
      />
    );
  }

  return null;
}
