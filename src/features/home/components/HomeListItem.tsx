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
      className="
        group
        flex w-full min-w-0
        items-center justify-between
        rounded-[20px]
        border border-[#173E31]/8
        bg-[#F7F5EF]
        px-4 py-4
        text-left
        transition-all duration-200
        hover:border-[#173E31]/15
        hover:bg-[#EEF2EC]
        active:scale-[0.995]
      "
    >
      <div className="min-w-0 flex-1">
        <p
          className="
            line-clamp-2 break-words
            font-medium
            text-[#173E31]
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1 truncate
            text-sm
            text-[#7A8981]
          "
        >
          {subtitle}
        </p>
      </div>

      <ArrowRight
        className="
          ml-3 h-4 w-4 shrink-0
          text-[#184C3A]/45
          transition-transform duration-200
          group-hover:translate-x-1
          group-hover:text-[#184C3A]
        "
      />
    </button>
  );
}