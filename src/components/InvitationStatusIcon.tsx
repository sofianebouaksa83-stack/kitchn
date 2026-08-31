import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

type InviteViewState = "pending" | "expired" | "accepted" | "none";

export function InvitationStatusIcon({ state }: { state: InviteViewState }) {
  if (state === "pending") {
    return (
      <span className="inline-flex" title="Invitation en attente">
        <Clock className="w-5 h-5 text-emerald-400" />
      </span>
    );
  }

  if (state === "expired") {
    return (
      <span className="inline-flex" title="Invitation expirée">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
      </span>
    );
  }

  if (state === "accepted") {
    return (
      <span className="inline-flex" title="Invitation déjà acceptée">
        <CheckCircle className="w-5 h-5 text-slate-400" />
      </span>
    );
  }

  return null;
}
