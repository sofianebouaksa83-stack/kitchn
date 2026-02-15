import { ui } from "../../styles/ui";

export function DashboardPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${ui.glassPanel} p-6 sm:p-8`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
