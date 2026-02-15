export function GlassCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const base =
    "relative rounded-3xl border ring-1 overflow-hidden " +
    "border-white/10 ring-white/10 bg-white/[0.06] " +
    "shadow-[0_18px_60px_rgba(0,0,0,0.30)] " +
    "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} text-left ${className}`}>
        {children}
      </button>
    );
  }

  return <div className={`${base} ${className}`}>{children}</div>;
}
