import React from "react";
import {
  Loader2,
} from "lucide-react";

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
    <section
      className="
        rounded-[28px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-5
        shadow-[0_10px_30px_rgba(23,62,49,0.045)]
        sm:p-6
      "
    >
      {title ||
      icon ||
      loading ? (
        <div
          className="
            flex items-center
            justify-between
            gap-3
          "
        >
          <div className="flex items-center gap-3">
            {icon ? (
              <span
                className="
                  grid h-10 w-10
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                {icon}
              </span>
            ) : null}

            {title ? (
              <h2
                className="
                  font-serif
                  text-xl
                  font-semibold
                  text-[#173E31]
                "
              >
                {title}
              </h2>
            ) : null}
          </div>

          {loading ? (
            <Loader2
              className="
                h-4 w-4
                animate-spin
                text-[#A8833E]
              "
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={
          title ||
          icon ||
          loading
            ? "mt-5"
            : ""
        }
      >
        {children}
      </div>
    </section>
  );
}