import { ArrowRight } from "lucide-react";

type HomeListItemProps = {
  title: string;
  subtitle: string;
  onClick?: () => void;
};

export function HomeListItem({
  title,
  subtitle,
  onClick,
}: HomeListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-left transition hover:bg-white/[0.06]"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words font-medium text-white">
          {title}
        </p>
        <p className="mt-1 truncate text-sm text-white/45">
          {subtitle}
        </p>
      </div>

      <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-white/35" />
    </button>
  );
}