import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Save,
  Tag,
} from "lucide-react";

import { PageShell } from "../../Layout/PageShell";
import { ui } from "../../../styles/ui";
import { useRecipeEditor } from "../../../features/recipe/hooks/useRecipeEditor";
import { RecipeEditorForm } from "./RecipeEditorForm";

type Props = {
  recipeId?: string | null;
  onBack?: () => void;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

export function RecipeEditorDesktop({
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

  const title = editor.isEdit
    ? editor.title.trim() || "Modifier la recette"
    : "Nouvelle recette";

  return (
    <PageShell
      withPanel={false}
      title={title}
      subtitle={
        editor.isEdit
          ? "Modifier votre recette"
          : "Créer une nouvelle recette"
      }
      icon={<Tag className="h-5 w-5" />}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBack?.()}
            className={ui.btnGhost}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={ui.btnPrimary}
            type="button"
          >
            <Save className="h-4 w-4" />

            {editor.saving
              ? "Enregistrement…"
              : "Enregistrer"}
          </button>
        </div>
      }
    >
      {editor.loading ? (
        <div
          className="
            flex items-center justify-center
            rounded-[28px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            p-10
          "
        >
          <Loader2 className="h-6 w-6 animate-spin text-[#A8833E]" />

          <div className="ml-3 text-[#617168]">
            Chargement…
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          {editor.errorMsg ? (
            <div
              className="
                mb-5 flex items-center gap-2
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
            variant="desktop"
          />
        </div>
      )}
    </PageShell>
  );
}