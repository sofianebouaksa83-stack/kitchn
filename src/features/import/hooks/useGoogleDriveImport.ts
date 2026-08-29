import type { ImportStatus } from "../types/import.types";
import { downloadGoogleDriveFile } from "../services/googleDriveImportService";
import { useGoogleDriveScripts } from "./useGoogleDriveScripts";

type UseGoogleDriveImportOptions = {
  addFilesToQueue: (files: File[]) => Promise<void>;
  setStatus: (status: ImportStatus) => void;
  setMessage: (message: string) => void;
};

export function useGoogleDriveImport({
  addFilesToQueue,
  setStatus,
  setMessage,
}: UseGoogleDriveImportOptions) {
  const isGapiLoaded = useGoogleDriveScripts();

  async function downloadFileFromDrive(
    fileId: string,
    accessToken: string
  ) {
    try {
      setStatus("uploading");
      setMessage(
        "Téléchargement depuis Google Drive..."
      );

      const file = await downloadGoogleDriveFile(
        fileId,
        accessToken
      );

      await addFilesToQueue([file]);

      setStatus("idle");
      setMessage(`Fichier téléchargé: ${file.name}`);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Erreur téléchargement Google Drive"
      );
    }
  }

  async function handleGoogleDrivePicker() {
    if (!isGapiLoaded) {
      setStatus("error");
      setMessage(
        "Les APIs Google ne sont pas encore chargées. Veuillez réessayer."
      );
      return;
    }

    const apiKey =
      import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!apiKey || !clientId) {
      setStatus("error");
      setMessage(
        "⚠️ Configuration Google Drive manquante. Vérifiez VITE_GOOGLE_API_KEY et VITE_GOOGLE_CLIENT_ID dans le .env."
      );
      return;
    }

    if (
      apiKey === "votre_cle_api_google_ici" ||
      clientId === "votre_client_id_google_ici"
    ) {
      setStatus("error");
      setMessage(
        "⚠️ Remplace les valeurs par défaut dans le .env avec tes vraies clés Google."
      );
      return;
    }

    try {
      const tokenClient =
        window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope:
            "https://www.googleapis.com/auth/drive.readonly",
          callback: async (response: any) => {
            if (response.error) {
              setStatus("error");
              setMessage(
                "Erreur d'authentification Google: " +
                  response.error
              );
              return;
            }

            const token = response.access_token;

            try {
              await window.gapi.client.init({
                apiKey,
                discoveryDocs: [
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
              });

              const picker =
                new window.google.picker.PickerBuilder()
                  .addView(
                    window.google.picker.ViewId.DOCS
                  )
                  .setDeveloperKey(apiKey)
                  .setOAuthToken(token)
                  .setAppId(clientId.split("-")[0])
                  .setCallback(async (data: any) => {
                    if (
                      data.action ===
                      window.google.picker.Action.PICKED
                    ) {
                      const file = data.docs[0];

                      await downloadFileFromDrive(
                        file.id,
                        token
                      );
                    }
                  })
                  .build();

              picker.setVisible(true);
            } catch (initError) {
              setStatus("error");
              setMessage(
                "Erreur init Google Picker: " +
                  (initError instanceof Error
                    ? initError.message
                    : "Erreur inconnue")
              );
            }
          },
        });

      tokenClient.requestAccessToken();
    } catch (error) {
      setStatus("error");
      setMessage(
        "Erreur ouverture Google Drive Picker: " +
          (error instanceof Error
            ? error.message
            : "Erreur inconnue")
      );
    }
  }

  return {
    isGapiLoaded,
    handleGoogleDrivePicker,
  };
}