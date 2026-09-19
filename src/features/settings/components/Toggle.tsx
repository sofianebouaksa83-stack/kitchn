import { cn } from "../utils/cn";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (
    value: boolean,
  ) => void;
};

export function Toggle({
  label,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <div
      className="
        flex items-center
        justify-between
        gap-3
        rounded-2xl
        border border-[#173E31]/8
        bg-[#F7F5EF]
        px-4 py-3.5
      "
    >
      <div
        className="
          text-sm
          font-medium
          text-[#29493E]
        "
      >
        {label}
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={cn(
          "h-7 w-12 shrink-0 rounded-full p-1 transition-all duration-200",
          checked
            ? "bg-[#184C3A]"
            : "bg-[#DDE2DD]",
        )}
        aria-pressed={checked}
      >
        <div
          className={cn(
            "h-5 w-5 rounded-full bg-[#FBFAF6] shadow-sm transition-transform duration-200",
            checked
              ? "translate-x-5"
              : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}