import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { QueueItem } from "../types/import.types";
import { uid } from "../utils/importHelpers";

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

  function enqueueFiles(files: File[]) {
    const items: QueueItem[] = files.map(
      (file) => ({
        id: uid(),
        file,
        status: "idle",
        progress: 0,
        uploadProgress: 0,
        relativePath:
          (file as any).webkitRelativePath || "",
      })
    );

    setQueue((previousQueue) => {
      const signature = (file: File) =>
        `${file.name}__${file.size}__${file.lastModified}`;

      const seen = new Set(
        previousQueue.map((item) =>
          signature(item.file)
        )
      );

      const newItems = items.filter((item) => {
        const itemSignature =
          signature(item.file);

        if (seen.has(itemSignature)) {
          return false;
        }

        seen.add(itemSignature);
        return true;
      });

      const nextQueue = [
        ...previousQueue,
        ...newItems,
      ];

      setSelectedId(
        (currentId) =>
          currentId ||
          newItems[0]?.id ||
          nextQueue[0]?.id ||
          null
      );

      return nextQueue;
    });
  }

  function removeItem(id: string) {
    setQueue((previousQueue) => {
      const nextQueue = previousQueue.filter(
        (item) => item.id !== id
      );

      setSelectedId((currentId) =>
        currentId === id
          ? nextQueue[0]?.id ?? null
          : currentId
      );

      return nextQueue;
    });
  }

  function clearDone() {
    setQueue((previousQueue) => {
      const nextQueue = previousQueue.filter(
        (item) => item.status !== "success"
      );

      setSelectedId((currentId) =>
        currentId &&
        nextQueue.some(
          (item) => item.id === currentId
        )
          ? currentId
          : nextQueue[0]?.id ?? null
      );

      return nextQueue;
    });
  }

  return {
    queue,
    setQueue,
    queueRef,
    setSelectedId,
    overall,
    selected,
    enqueueFiles,
    removeItem,
    clearDone,
  };
}