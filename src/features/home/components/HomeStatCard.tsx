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
    <div
      className="
        w-full min-w-0
        rounded-[24px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-3 sm:p-5
        shadow-[0_8px_24px_rgba(23,62,49,0.05)]
      "
    >
      <div className="flex min-w-0 flex-col items-start gap-3">
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-[14px]
            bg-[#E7EEE8]
            text-[#184C3A]
            [&>svg]:h-5 [&>svg]:w-5
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p
            className="
              text-2xl font-semibold
              leading-none text-[#173E31]
              sm:text-3xl
            "
          >
            {value}
          </p>

          <p
            className="
              mt-2
              text-[11px] leading-tight
              text-[#718078]
              sm:text-sm
            "
          >
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}