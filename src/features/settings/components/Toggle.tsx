import { cn } from "../utils/cn";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export function Toggle({
  label,
  checked,
  onChange,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-sm text-white/85">{label}</div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "h-7 w-12 rounded-full p-1 transition ring-1 ring-white/10",
          checked ? "bg-amber-400/80" : "bg-white/10"
        )}
        aria-pressed={checked}
      >
        <div
          className={cn(
            "h-5 w-5 rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}