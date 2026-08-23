import { useEffect, useRef, useState } from "react";

export function useNavbarMenus() {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        setMobileSheetOpen(false);
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (!accountMenuOpen) return;

      const target = event.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [accountMenuOpen]);

  return {
    accountMenuOpen,
    setAccountMenuOpen,
    mobileSheetOpen,
    setMobileSheetOpen,
    menuRef,
  };
}