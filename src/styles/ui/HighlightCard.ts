export function HighlightCard({
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
    "border-white/10 ring-white/10 " +
    "bg-gradient-to-b from-violet-500/85 via-violet-500/55 to-violet-500/35 " +
    "shadow-[0_18px_70px_rgba(0,0,0,0.35)] " +
    "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99]";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${base} ${className}`}>
        {children}
      </button>
    );
  }

  return <div className={`${base} ${className}`}>{children}</div>;
}
