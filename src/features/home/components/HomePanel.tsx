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
    <div
      className="
        w-full min-w-0
        rounded-[28px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-4 sm:p-5
        shadow-[0_10px_30px_rgba(23,62,49,0.05)]
      "
    >
      <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
        <h3
          className="
            min-w-0 truncate
            font-serif
            text-lg font-semibold
            text-[#173E31]
            sm:text-xl
          "
        >
          {title}
        </h3>

        <button
          type="button"
          onClick={onClick}
          className="
            shrink-0
            text-sm font-medium
            text-[#A8833E]
            transition-colors
            hover:text-[#7F632F]
          "
        >
          Voir tout
        </button>
      </div>

      {children}
    </div>
  );
}