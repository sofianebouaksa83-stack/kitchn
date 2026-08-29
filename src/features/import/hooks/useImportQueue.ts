import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { QueueItem } from "../types/import.types";

export function useImportQueue() {
  const [queue, setQueue] =
    useState<QueueItem[]>([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const queueRef = useRef<QueueItem[]>([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const overall = useMemo(() => {
    if (!queue.length) {
      return {
        pct: 0,
        done: 0,
        total: 0,
        failed: 0,
      };
    }

    const total = queue.length;
    const done = queue.filter(
      (item) => item.status === "success"
    ).length;
    const failed = queue.filter(
      (item) => item.status === "error"
    ).length;
    const pct = Math.round(
      queue.reduce(
        (totalProgress, item) =>
          totalProgress + (item.progress || 0),
        0
      ) / total
    );

    return {
      pct,
      done,
      total,
      failed,
    };
  }, [queue]);

  const selected = useMemo(
    () =>
      queue.find(
        (item) => item.id === selectedId
      ) ||
      queue[0] ||
      null,
    [queue, selectedId]
  );

  return {
    queue,
    setQueue,
    queueRef,
    selectedId,
    setSelectedId,
    overall,
    selected,
  };
}