import { ui } from "../../../styles/ui";
import { cn } from "../../../utils/cn";

export function LandingFinalCta({
  onStart,
  onLogin,
}: {
  onStart: () => void;
  onLogin: () => void;
}) {
  return (
    <section className="relative mt-24 pb-10 sm:mt-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-10 text-center backdrop-blur-xl sm:p-14">
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Commence gratuitement aujourd’hui
          </h2>
          <p className="mt-4 text-base text-slate-300/70 sm:text-lg">
            Crée ton espace, organise tes recettes et partage-les avec ton équipe.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className={cn(
                ui.btnPrimary,
                "rounded-2xl px-8 py-3"
              )}
            >
              Commencer gratuitement
            </button>
            <button
              type="button"
              onClick={onLogin}
              className={cn(
                ui.btnGhost,
                "rounded-2xl px-8 py-3"
              )}
            >
              Se connecter
            </button>
          </div>
          <p className="mt-5 text-xs text-slate-400">
            Gratuit • Sans engagement
          </p>
        </div>
      </div>
    </section>
  );
}
