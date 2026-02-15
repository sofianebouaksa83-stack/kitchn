import { ChevronDown, Store } from "lucide-react";

type RestaurantBadgeProps = {
  onClick: () => void;
  isOpen?: boolean;
  label?: string; // ex: user.email ou "Compte"
};

export function RestaurantBadge({
  onClick,
  isOpen = false,
  label = "Compte",
}: RestaurantBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="menu"
      aria-expanded={isOpen ? "true" : "false"}
      className="
        inline-flex items-center gap-2 rounded-2xl px-3 py-2
        bg-white/5 hover:bg-white/10 border border-white/10
        text-slate-100 transition select-none
      "
      title="Menu"
    >
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-xl bg-white/10 border border-white/10">
        <Store className="w-4 h-4" />
      </span>

      <span className="hidden sm:block text-sm font-medium max-w-[160px] truncate">
        {label}
      </span>

      <ChevronDown className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} />
    </button>
  );
}
