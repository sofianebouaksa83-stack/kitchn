import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { passwordScore } from "../services/settingsHelpers";

type UseSecuritySettingsProps = {
  userId?: string;
  setError: (value: string | null) => void;
  setSuccess: (value: string | null) => void;
};

export function useSecuritySettings({
  userId,
  setError,
  setSuccess,
}: UseSecuritySettingsProps) {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwShow, setPwShow] = useState(false);

  const pwStrength = useMemo(
    () => passwordScore(pw1),
    [pw1]
  );

  const pwMatch = pw1.length > 0 && pw1 === pw2;

  const canChangePassword = useMemo(() => {
    if (!userId) return false;
    if (!pw1 || !pw2) return false;
    if (pw1 !== pw2) return false;
    if (pw1.length < 8) return false;

    return true;
  }, [userId, pw1, pw2]);

  async function onChangePassword() {
    if (!canChangePassword) return;

    setPwSaving(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.updateUser({
      password: pw1,
    });

    if (error) {
      setError(
        error.message ||
          "Impossible de changer le mot de passe. Essaie de te reconnecter puis réessaie."
      );

      setPwSaving(false);
      return;
    }

    setPw1("");
    setPw2("");

    setSuccess("Mot de passe mis à jour ✅");
    setPwSaving(false);

    window.setTimeout(() => {
      setSuccess(null);
    }, 2200);
  }

  return {
    pw1,
    setPw1,
    pw2,
    setPw2,
    pwSaving,
    pwShow,
    setPwShow,
    pwStrength,
    pwMatch,
    canChangePassword,
    onChangePassword,
  };
}