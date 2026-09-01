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
      subtitle="Éditeur"
      icon={<Tag className="w-5 h-5 text-amber-200" />}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBack?.()}
            className={ui.btnGhost}
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={ui.btnPrimary}
            type="button"
          >
            <Save className="w-4 h-4" />
            {editor.saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      }
    >
      {editor.loading ? (
        <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
          <div className="ml-3 text-slate-200">Chargement…</div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          {editor.errorMsg ? (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
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