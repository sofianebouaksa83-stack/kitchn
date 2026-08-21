import { Trash2 } from "lucide-react";
import { Section } from "./Section";

type AccountSettingsProps = {
  loading: boolean;
  onDeleteAccount: () => void;
};

export function AccountSettings({
  loading,
  onDeleteAccount,
}: AccountSettingsProps) {
  return (
    <Section
      title="Compte"
      icon={<Trash2 className="h-4 w-4" />}
      loading={loading}
    >
      <button
        type="button"
        onClick={onDeleteAccount}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-red-500/30 bg-red-500/10 hover:bg-red-500/15 transition text-red-100"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer mon compte
      </button>
    </Section>
  );
}