import { Star, MoreHorizontal, Folder } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  size: string;
  highlighted?: boolean;
  onClick: () => void;
};

export function FolderCard({ title, subtitle, size, highlighted, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left relative rounded-3xl p-5 border ring-1 overflow-hidden",
        "shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99]",
        highlighted
          ? "border-white/10 ring-white/10 bg-gradient-to-b from-violet-500/80 via-violet-500/55 to-violet-500/35"
          : "border-white/10 ring-white/10 bg-white/6 hover:bg-white/8",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span className="h-9 w-9 grid place-items-center rounded-2xl bg-black/15 ring-1 ring-white/10">
          <Star className="h-4 w-4 text-white/90" />
        </span>
        <span className="h-9 w-9 grid place-items-center rounded-2xl bg-black/15 ring-1 ring-white/10">
          <MoreHorizontal className="h-4 w-4 text-white/90" />
        </span>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="h-14 w-14 rounded-full bg-white/95 grid place-items-center shadow-sm">
          <Folder className={`h-7 w-7 ${highlighted ? "text-violet-500" : "text-slate-700"}`} />
        </div>
      </div>

      <div className="mt-5 text-center">
        <div className="text-base font-semibold text-white/95">{title}</div>
        <div className="mt-1 text-sm text-white/80">{subtitle}</div>
      </div>

      <div className="mt-6 h-px bg-white/15" />

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-white/60">File Size</div>
          <div className="mt-1 text-lg font-semibold text-white">{size}</div>
        </div>

        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-white/90 ring-2 ring-black/20 grid place-items-center text-xs font-bold text-slate-700"
            >
              🙂
            </div>
          ))}
        </div>
      </div>

      {!highlighted && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/6 to-transparent opacity-70" />
      )}
    </button>
  );
}
