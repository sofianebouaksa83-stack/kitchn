import type { ReactNode } from "react";

type HomePanelProps = {
  title: string;
  onClick: () => void;
  children: ReactNode;
};

export function HomePanel({
  title,
  onClick,
  children,
}: HomePanelProps) {
  return (
    <div className="w-full min-w-0 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
        <h3 className="min-w-0 truncate font-semibold">
          {title}
        </h3>

        <button
          type="button"
          onClick={onClick}
          className="shrink-0 text-sm text-[#D4AF37]"
        >
          Voir tout
        </button>
      </div>

      {children}
    </div>
  );
}