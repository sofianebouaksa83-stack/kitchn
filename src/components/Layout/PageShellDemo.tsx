import React from "react";
import { ui } from "../../styles/ui";

type PageShellDemoProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  panelClassName?: string;
};

export function PageShellDemo({
  title,
  subtitle,
  icon,
  actions,
  children,
  panelClassName,
}: PageShellDemoProps) {
  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div
          className={[
            "rounded-[28px] bg-white/[0.06] ring-1 ring-white/10",
            "shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md",
            "p-5 sm:p-7",
            panelClassName ?? "",
          ].join(" ")}
        >
          {(title || subtitle || actions) && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-100 flex items-center gap-3">
                    {icon ? (
                      <span className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                        {icon}
                      </span>
                    ) : null}
                    <span className="truncate">{title}</span>
                  </h1>
                )}

                {subtitle && (
                  <p className="text-sm text-slate-300/70 mt-2 max-w-2xl">
                    {subtitle}
                  </p>
                )}
              </div>

              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
