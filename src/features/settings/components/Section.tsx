import React from "react";
import { Loader2 } from "lucide-react";

type SectionProps = {
  title?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
};

export function Section({
  title,
  icon,
  loading,
  children,
}: SectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      {(title || icon || loading) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon ? <span className="text-white/80">{icon}</span> : null}
            {title ? (
              <h2 className="text-base font-semibold">{title}</h2>
            ) : null}
          </div>

          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
          ) : null}
        </div>
      )}

      <div className={title || icon || loading ? "mt-4" : ""}>
        {children}
      </div>
    </section>
  );
}