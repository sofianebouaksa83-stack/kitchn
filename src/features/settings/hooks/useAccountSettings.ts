import { supabase } from "../../../lib/supabase";

type UseAccountSettingsProps = {
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
};

export function useAccountSettings({
  setError,
  setSuccess,
}: UseAccountSettingsProps) {
  async function onDeleteAccount() {
    const confirmed = window.confirm(
      "⚠️ Supprimer ton compte ?\nCette action est irréversible (recettes, groupes, profil, etc.)."
    );

    if (!confirmed) return;

    setError(null);
    setSuccess(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setError(
          "Session introuvable. Déconnecte-toi puis reconnecte-toi avant de réessayer."
        );
        return;
      }

      const { data, error } =
        await supabase.functions.invoke("delete-account", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

      if (error) {
        let message =
          error.message || "Erreur suppression compte";

        try {
          const raw = await error.context?.json?.();

          message =
            raw?.details ||
            raw?.error ||
            message;
        } catch {
          // ignore
        }

        setError(message);
        return;
      }

      if (!data?.ok) {
        setError(
          data?.error || "Erreur suppression compte"
        );
        return;
      }

      await supabase.auth.signOut();

      window.location.hash = "/";
      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Erreur inconnue"
      );
    }
  }

  return {
    onDeleteAccount,
  };
}