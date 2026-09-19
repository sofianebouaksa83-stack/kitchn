import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import { ui } from "../../../styles/ui";
import { useRecipeEditor } from "../../../features/recipe/hooks/useRecipeEditor";
import { RecipeEditorForm } from "./RecipeEditorForm";

type Props = {
  recipeId?: string | null;
  onBack?: () => void;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

export function RecipeEditorMobile({
  recipeId,
  onBack,
  onSave,
  onCreated,
}: Props) {
  const editor = useRecipeEditor({
    recipeId,
    onSave,
    onCreated,
  });

  const headerTitle = editor.isEdit
    ? editor.title.trim() || "Modifier la recette"
    : "Nouvelle recette";

  if (editor.loading) {
    return (
      <div className={`${ui.dashboardBg} overflow-x-hidden`}>
        <div className="px-4 py-10">
          <div
            className="
              flex items-center justify-center
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-8
            "
          >
            <Loader2 className="h-6 w-6 animate-spin text-[#A8833E]" />

            <div className="ml-3 text-[#617168]">
              Chargement…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ui.dashboardBg} overflow-x-hidden`}>
      <div className="px-4 pb-32 pt-5">
        {/* HEADER */}
        <div>
          <p
            className="
              mb-2 text-[11px]
              font-semibold uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Éditeur
          </p>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1
                className="
                  truncate
                  font-serif
                  text-3xl font-semibold
                  leading-tight
                  text-[#173E31]
                "
              >
                {headerTitle}
              </h1>

              <p className="mt-2 text-sm text-[#718078]">
                Remplis les informations puis enregistre ta recette.
              </p>
            </div>
          </div>

          <button
            onClick={() => onBack?.()}
            className="
              mt-4 inline-flex
              items-center gap-2
              text-sm font-medium
              text-[#718078]
              transition
              hover:text-[#184C3A]
            "
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>

        {editor.errorMsg ? (
          <div
            className="
              mt-5 flex items-center gap-2
              rounded-2xl
              border border-[#C05C56]/20
              bg-[#F8EAE7]
              px-4 py-3
              text-sm text-[#9B4944]
            "
          >
            <AlertCircle className="h-4 w-4" />
            {editor.errorMsg}
          </div>
        ) : null}

        <RecipeEditorForm
          editor={editor}
          variant="mobile"
        />
      </div>

      {/* BARRE ENREGISTRER */}
      <div
        className="
          fixed inset-x-0 bottom-0 z-[90]
          border-t border-[#173E31]/10
          bg-[#FBFAF6]/95
          px-4 pt-3
          pb-[calc(1rem+env(safe-area-inset-bottom))]
          backdrop-blur-xl
          shadow-[0_-10px_35px_rgba(23,62,49,0.08)]
        "
      >
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <button
            onClick={() => onBack?.()}
            className={`${ui.btnGhost} h-11 flex-1 justify-center`}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={`${ui.btnPrimary} h-11 flex-1 justify-center`}
            type="button"
          >
            <Save className="h-4 w-4" />

            {editor.saving
              ? "Enregistrement…"
              : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}