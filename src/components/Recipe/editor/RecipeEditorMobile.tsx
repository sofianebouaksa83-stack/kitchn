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
          <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
            <div className="ml-3 text-slate-200">Chargement…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ui.dashboardBg} overflow-x-hidden`}>
      <div className="px-4 pt-3 pb-32">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => onBack?.()}
            className={ui.btnGhost}
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="min-w-0 flex-1">
            <div className="text-[17px] leading-tight font-semibold text-slate-100 truncate">
              {headerTitle}
            </div>

            <div className="mt-1 text-xs text-slate-300/70">
              Remplis les infos puis enregistre
            </div>
          </div>

          <div className="w-10" />
        </div>

        {editor.errorMsg ? (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {editor.errorMsg}
          </div>
        ) : null}

        <RecipeEditorForm
          editor={editor}
          variant="mobile"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="rounded-[24px] bg-[#0B1020]/92 backdrop-blur ring-1 ring-white/10 shadow-[0_-18px_60px_rgba(0,0,0,0.40)] p-3 flex items-center gap-2">
          <button
            onClick={() => onBack?.()}
            className={`${ui.btnGhost} flex-1 h-11 justify-center`}
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={`${ui.btnPrimary} flex-1 h-11 justify-center`}
            type="button"
          >
            <Save className="w-4 h-4" />
            {editor.saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}