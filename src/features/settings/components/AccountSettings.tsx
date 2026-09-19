import {
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { Section } from "./Section";

type AccountSettingsProps = {
  loading: boolean;

  onDeleteAccount:
    () => void;
};

export function AccountSettings({
  loading,
  onDeleteAccount,
}: AccountSettingsProps) {
  return (
    <Section
      title="Compte"
      icon={
        <Trash2 className="h-4 w-4" />
      }
      loading={loading}
    >
      <div
        className="
          rounded-[24px]
          border border-[#C05C56]/15
          bg-[#F8EAE7]/65
          p-4
          sm:p-5
        "
      >
        <div className="flex items-start gap-3">
          <div
            className="
              grid h-10 w-10
              shrink-0
              place-items-center
              rounded-2xl
              bg-[#F3D9D5]
              text-[#A54C48]
            "
          >
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div>
            <div
              className="
                font-serif
                text-lg
                font-semibold
                text-[#8C423E]
              "
            >
              Zone dangereuse
            </div>

            <p
              className="
                mt-1
                max-w-xl
                text-sm
                leading-relaxed
                text-[#8A6661]
              "
            >
              La suppression de ton
              compte est une action
              importante. Tes données
              associées pourront être
              supprimées définitivement.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            onDeleteAccount
          }
          className="
            mt-5
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-full
            border border-[#C05C56]/20
            bg-[#F5E4E0]
            px-4 py-2.5
            text-sm
            font-semibold
            text-[#A54C48]
            transition
            hover:bg-[#F0D8D3]
          "
        >
          <Trash2 className="h-4 w-4" />

          Supprimer mon compte
        </button>
      </div>
    </Section>
  );
}