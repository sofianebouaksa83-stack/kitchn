export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 px-5 py-4 flex items-center justify-between">
      <div>
        <div className="text-sm font-semibold text-slate-100">
          {value} {label}
        </div>
        <div className="text-xs text-slate-300/70">Total</div>
      </div>
      <div className="h-2 w-2 rounded-full bg-white/30" />
    </div>
  );
}
