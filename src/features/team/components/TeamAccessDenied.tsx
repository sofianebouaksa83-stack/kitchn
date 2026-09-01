import { AlertCircle } from "lucide-react";

type TeamAccessDeniedProps = {
  groupName?: string;
};

export function TeamAccessDenied({
  groupName,
}: TeamAccessDeniedProps) {
  return (
    <div className="mt-8 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
      <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />

      <h2 className="text-lg font-semibold text-slate-100 mb-2">
        Accès refusé
      </h2>

      <p className="text-sm text-slate-300/70">
        Seuls le{" "}
        <span className="text-slate-200">
          Chef
        </span>{" "}
        (créateur du groupe) ou le{" "}
        <span className="text-slate-200">
          Second
        </span>{" "}
        peuvent gérer l’équipe de{" "}
        <span className="text-slate-200">
          {groupName ?? "ce groupe"}
        </span>
        .
      </p>
    </div>
  );
}