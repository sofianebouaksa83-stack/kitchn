import {
  useEffect,
  useState,
  type DragEvent,
} from "react";
import type { NavItem } from "../types/navigation.types";
import {
  loadNavOrder,
  saveNavOrder,
} from "../services/navOrderService";
import { applySavedNavOrder } from "../utils/navigationHelpers";

type UseNavigationOrderParams = {
  userId?: string;
  baseItems: NavItem[];
};

export function useNavigationOrder({
  userId,
  baseItems,
}: UseNavigationOrderParams) {
  const [menuItems, setMenuItems] =
    useState<NavItem[]>(baseItems);
  const [dragKey, setDragKey] =
    useState<string | null>(null);

  useEffect(() => {
    const currentUserId = userId;

    if (!currentUserId) {
        setMenuItems(baseItems);
        return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        const savedKeys =
          await loadNavOrder(currentUserId);

        const ordered = applySavedNavOrder(
          baseItems,
          savedKeys
        );

        if (!cancelled) {
          setMenuItems(ordered);
        }
      } catch {
        if (!cancelled) {
          setMenuItems(baseItems);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [userId, baseItems]);

  const onDragStartItem =
    (key: string) => (event: DragEvent) => {
      setDragKey(key);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        "text/plain",
        key
      );
    };

  const onDragOverItem = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDropItem =
    (overKey: string) =>
    async (event: DragEvent) => {
      event.preventDefault();

      const fromKey =
        dragKey ||
        event.dataTransfer.getData("text/plain");

      if (!fromKey || fromKey === overKey) {
        return;
      }

      let nextKeys: string[] = [];

      setMenuItems((previousItems) => {
        const fromIndex =
          previousItems.findIndex(
            (item) => item.key === fromKey
          );

        const toIndex =
          previousItems.findIndex(
            (item) => item.key === overKey
          );

        if (fromIndex < 0 || toIndex < 0) {
          return previousItems;
        }

        const nextItems = [...previousItems];
        const [movedItem] = nextItems.splice(
          fromIndex,
          1
        );

        nextItems.splice(
          toIndex,
          0,
          movedItem
        );

        nextKeys = nextItems.map(
          (item) => item.key
        );

        return nextItems;
      });

      setDragKey(null);

      if (userId && nextKeys.length) {
        try {
          await saveNavOrder(
            userId,
            nextKeys
          );
        } catch {
          // Conservation du comportement actuel.
        }
      }
    };

  const onDragEndItem = () => {
    setDragKey(null);
  };

  return {
    menuItems,
    dragKey,
    onDragStartItem,
    onDragOverItem,
    onDropItem,
    onDragEndItem,
  };
}