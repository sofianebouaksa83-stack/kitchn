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
    "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
    "text-sm font-medium transition-all duration-200 select-none",
    "border",
    active
      ? [
          "bg-[#E7EEE8]",
          "text-[#184C3A]",
          "border-[#184C3A]/12",
          "shadow-[0_4px_14px_rgba(23,62,49,0.05)]",
        ].join(" ")
      : [
          "bg-transparent",
          "text-[#617168]",
          "border-transparent",
          "hover:bg-[#F0F2EC]",
          "hover:text-[#184C3A]",
          "hover:border-[#184C3A]/8",
        ].join(" "),
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
    <div className="hidden flex-1 justify-center lg:flex">
      <div
        className="
          flex items-center gap-1
          rounded-full
          border border-[#173E31]/8
          bg-[#F7F5EF]
          p-1
        "
      >
        {menuItems.map((item) => {
          const active = currentView === item.view;
          const isDragging = dragKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onViewChange(item.view)}
              className={`${navPill(active)} ${
                isDragging ? "scale-[0.98] opacity-60" : ""
              }`}
              draggable
              onDragStart={onDragStartItem(item.key)}
              onDragOver={onDragOverItem}
              onDrop={onDropItem(item.key)}
              onDragEnd={onDragEndItem}
              title="Glisse-dépose pour réordonner"
            >
              <span
                className={[
                  "[&>svg]:h-4 [&>svg]:w-4",
                  active
                    ? "text-[#184C3A]"
                    : "text-[#78867F]",
                ].join(" ")}
              >
                {item.icon}
              </span>

              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}