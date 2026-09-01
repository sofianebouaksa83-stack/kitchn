import { supabase } from "../../../lib/supabase";

type DownloadDriveFileResponse = {
  success: boolean;
  error?: string;
  fileData: number[];
  mimeType: string;
  fileName: string;
};

export async function downloadGoogleDriveFile(
  fileId: string,
  accessToken: string
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Non authentifié");
  }

  const downloadUrl =
    `${import.meta.env.VITE_SUPABASE_URL}` +
    "/functions/v1/download-drive-file";

  const response = await fetch(downloadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId,
      accessToken,
    }),
  });

  const result =
    (await response.json()) as DownloadDriveFileResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Erreur lors du téléchargement"
    );
  }

  const fileData = new Uint8Array(result.fileData);
  const blob = new Blob([fileData], {
    type: result.mimeType,
  });

  return new File([blob], result.fileName, {
    type: result.mimeType,
    lastModified: Date.now(),
  });
}