import React from "react";
import { ui } from "../../styles/ui";

type PageShellProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;

  /** defaults to ui.containerWide */
  containerClassName?: string;

  /** extra classes for the panel wrapper */
  panelClassName?: string;

  /** if false, won't render the panel wrapper */
  withPanel?: boolean;

  /** legacy layout hints kept for compatible callers */
  maxWidth?: string;
  centerHeader?: boolean;
};

export function PageShell({
  title,
  subtitle,
  icon,
  actions,
  children,
  containerClassName,
  panelClassName,
  withPanel = true,
}: PageShellProps) {
  const container =
    containerClassName ?? ui.containerWide;

  const hasHeader = Boolean(
    title ||
      subtitle ||
      actions,
  );

  const Header = hasHeader ? (
    <div
      className="
        mb-6
        flex flex-col
        gap-4
        sm:flex-row
        sm:items-start
        sm:justify-between
      "
    >
      <div className="min-w-0">
        {title ? (
          <h1
            className="
              flex items-center
              gap-3
              font-serif
              text-2xl
              font-semibold
              text-[#173E31]
              sm:text-3xl
            "
          >
            {icon ? (
              <span
                className="
                  grid h-11 w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                  ring-1
                  ring-[#173E31]/8
                "
              >
                {icon}
              </span>
            ) : null}

            <span className="truncate">
              {title}
            </span>
          </h1>
        ) : null}

        {subtitle ? (
          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-relaxed
              text-[#718078]
            "
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div className={ui.dashboardBg}>
      <div
        className={`
          ${container}
          px-4 py-6
          sm:px-6 sm:py-8
        `}
      >
        {withPanel ? (
          <div
            className={[
              "rounded-[28px]",
              "border border-[#173E31]/10",
              "bg-[#FBFAF6]",
              "shadow-[0_12px_35px_rgba(23,62,49,0.06)]",
              "p-5 sm:p-7",
              panelClassName ?? "",
            ].join(" ")}
          >
            {Header}
            {children}
          </div>
        ) : (
          <>
            {Header}
            {children}
          </>
        )}
      </div>
    </div>
  );
}