import type { View } from "../../../app/routes";
import { BASE_NAV_ITEMS } from "../config/navigationItems";
import { useNavigationOrder } from "../hooks/useNavigationOrder";

type DesktopNavigationProps = {
  userId?: string;
  currentView: View;
  onViewChange: (view: View) => void;
};

function navPill(active: boolean) {
  return [
    "inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition select-none",
    "ring-1",
    active
      ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
      : "bg-white/[0.04] text-slate-200/90 ring-white/10 hover:bg-white/[0.07] hover:ring-white/15",
  ].join(" ");
}

export function DesktopNavigation({
  userId,
  currentView,
  onViewChange,
}: DesktopNavigationProps) {
  const {
    menuItems,
    dragKey,
    onDragStartItem,
    onDragOverItem,
    onDropItem,
    onDragEndItem,
  } = useNavigationOrder({
    userId,
    baseItems: BASE_NAV_ITEMS,
  });

  return (
    <div className="flex-1 hidden lg:flex justify-center">
      <div className="flex items-center gap-2">
        {menuItems.map((item) => {
          const active = currentView === item.view;
          const isDragging = dragKey === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onViewChange(item.view)}
              className={`${navPill(active)} ${
                isDragging ? "opacity-60 scale-[0.98]" : ""
              }`}
              draggable
              onDragStart={onDragStartItem(item.key)}
              onDragOver={onDragOverItem}
              onDrop={onDropItem(item.key)}
              onDragEnd={onDragEndItem}
              title="Glisse-dépose pour réordonner"
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}