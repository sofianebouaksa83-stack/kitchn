type InvitationBadgeProps = {
  count: number;
};

export function InvitationBadge({ count }: InvitationBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="min-w-[26px] h-6 px-2 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-xs font-bold">
      {count}
    </span>
  );
}