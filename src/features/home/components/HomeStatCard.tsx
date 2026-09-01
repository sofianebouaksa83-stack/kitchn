import type { ReactNode } from "react";

type HomeStatCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
};

export function HomeStatCard({
  icon,
  value,
  label,
}: HomeStatCardProps) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:rounded-3xl sm:p-5">
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] sm:h-11 sm:w-11">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xl font-bold leading-none sm:text-3xl">
            {value}
          </p>
          <p className="mt-1 text-[11px] leading-tight text-white/55 sm:text-sm">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}