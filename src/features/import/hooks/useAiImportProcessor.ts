import { useRef } from "react";
import type {
  Dispatch,
  SetStateAction,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import type { AiImportQuota } from "../../../services/aiImportQuota";
import type {
  ImportStatus,
  QueueItem,
} from "../types/import.types";

type UseAiImportProcessorOptions = {
  user: User | null;
  queueRef: {
    current: QueueItem[];
  };
  setQueue: Dispatch<
    SetStateAction<QueueItem[]>
  >;
  loadQuota: () => Promise<AiImportQuota>;
  refreshQuota: () => Promise<AiImportQuota | null>;
  setStatus: (status: ImportStatus) => void;
  setMessage: (message: string) => void;
};

export function useAiImportProcessor({
  user,
  queueRef,
  setQueue,
  loadQuota,
  refreshQuota,
  setStatus,
  setMessage,
}: UseAiImportProcessorOptions) {
  const processingRef = useRef(false);

  async function importOne(itemId: string) {
    if (!user) return;

    const item = queueRef.current.find(
      (queueItem) => queueItem.id === itemId
    );

    if (!item) return;

    try {
      setStatus("uploading");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Non authentifié");
      }

      setQueue((previousQueue) =>
        previousQueue.map((queueItem) =>
          queueItem.id === itemId
            ? {
                ...queueItem,
                status: "uploading",
                message: "Envoi du fichier...",
                progress: Math.max(
                  queueItem.progress,
                  1
                ),
              }
            : queueItem
        )
      );

      const apiUrl =
        `${import.meta.env.VITE_SUPABASE_URL}` +
        "/functions/v1/import-recipe";

      const formData = new FormData();
      formData.append(
        "file",
        item.file,
        item.file.name
      );

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("POST", apiUrl, true);
        xhr.setRequestHeader(
          "Authorization",
          `Bearer ${session.access_token}`
        );

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;

          const uploadPercentage = Math.round(
            (event.loaded / event.total) * 100
          );

          const mixedProgress = Math.min(
            70,
            Math.round(
              (uploadPercentage / 100) * 70
            )
          );

          setQueue((previousQueue) =>
            previousQueue.map((queueItem) =>
              queueItem.id === itemId
                ? {
                    ...queueItem,
                    uploadProgress:
                      uploadPercentage,
                    progress: Math.max(
                      queueItem.progress,
                      mixedProgress
                    ),
                  }
                : queueItem
            )
          );
        };

        xhr.onerror = () => {
          reject(
            new Error("Erreur réseau (upload)")
          );
        };

        xhr.onload = () => {
          try {
            const json = JSON.parse(
              xhr.responseText || "{}"
            );

            if (
              xhr.status >= 200 &&
              xhr.status < 300 &&
              json?.success
            ) {
              setQueue((previousQueue) =>
                previousQueue.map((queueItem) =>
                  queueItem.id === itemId
                    ? {
                        ...queueItem,
                        status: "success",
                        message:
                          `Recette "${json.title}" créée` +
                          ` • ${json.sectionsCount} section(s).`,
                        resultTitle: json.title,
                        uploadProgress: 100,
                        progress: 100,
                      }
                    : queueItem
                )
              );

              void refreshQuota();
              resolve();
            } else {
              if (
                json?.code ===
                "AI_IMPORT_LIMIT_REACHED"
              ) {
                setStatus("error");
                setMessage(
                  json?.error ||
                    "Limite atteinte, passez à Premium"
                );
                void refreshQuota();
              }

              reject(
                new Error(
                  json?.error ||
                    "Erreur lors de l'import"
                )
              );
            }
          } catch {
            reject(
              new Error("Réponse serveur invalide")
            );
          }
        };

        let alive = false;
        let tickTimer: number | null = null;

        xhr.onreadystatechange = () => {
          if (
            (xhr.readyState === 2 ||
              xhr.readyState === 3) &&
            !alive
          ) {
            alive = true;

            setQueue((previousQueue) =>
              previousQueue.map((queueItem) =>
                queueItem.id === itemId
                  ? {
                      ...queueItem,
                      status: "processing",
                      message:
                        "Analyse IA en cours...",
                      progress: Math.max(
                        queueItem.progress,
                        75
                      ),
                    }
                  : queueItem
              )
            );

            const tick = () => {
              if (!alive) return;

              setQueue((previousQueue) =>
                previousQueue.map(
                  (queueItem) => {
                    if (
                      queueItem.id !== itemId
                    ) {
                      return queueItem;
                    }

                    if (
                      queueItem.status !==
                      "processing"
                    ) {
                      return queueItem;
                    }

                    return {
                      ...queueItem,
                      progress: Math.min(
                        95,
                        (queueItem.progress ||
                          75) + 1
                      ),
                    };
                  }
                )
              );

              tickTimer = window.setTimeout(
                tick,
                250
              );
            };

            tickTimer = window.setTimeout(
              tick,
              250
            );

            xhr.addEventListener(
              "loadend",
              () => {
                alive = false;

                if (tickTimer) {
                  window.clearTimeout(
                    tickTimer
                  );
                }
              }
            );
          }
        };

        xhr.send(formData);
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'importation";

      setStatus("error");
      setMessage(
        errorMessage.includes(
          "OPENAI_API_KEY"
        )
          ? "⚠️ Clé OpenAI non configurée. Veuillez configurer OPENAI_API_KEY dans les secrets Supabase."
          : errorMessage
      );

      setQueue((previousQueue) =>
        previousQueue.map((queueItem) =>
          queueItem.id === itemId
            ? {
                ...queueItem,
                status: "error",
                message: errorMessage,
                progress: Math.min(
                  queueItem.progress || 0,
                  90
                ),
              }
            : queueItem
        )
      );
    } finally {
      setQueue((previousQueue) => {
        const stillBusy = previousQueue.some(
          (queueItem) =>
            queueItem.status === "uploading" ||
            queueItem.status === "processing"
        );

        setStatus(
          stillBusy ? "processing" : "idle"
        );

        return previousQueue;
      });
    }
  }

  async function processQueue() {
    if (processingRef.current) return;
    if (!user) return;

    processingRef.current = true;
    setStatus("processing");
    setMessage("");

    try {
      while (true) {
        const latestQuota =
          await loadQuota();

        if (
          latestQuota.plan === "free" &&
          !latestQuota.can_import
        ) {
          setStatus("error");
          setMessage(
            "Limite atteinte, passez à Premium"
          );
          break;
        }

        const currentQueue =
          queueRef.current;

        const nextItem = currentQueue.find(
          (queueItem) =>
            queueItem.status === "idle" ||
            queueItem.status === "error"
        );

        if (!nextItem) break;

        // eslint-disable-next-line no-await-in-loop
        await importOne(nextItem.id);
      }
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur lors du traitement"
      );
    } finally {
      processingRef.current = false;
      setStatus("idle");
      void refreshQuota();
    }
  }

  return {
    processQueue,
  };
}