export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[28px] bg-white/[0.06] ring-1 ring-white/10",
        "shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
