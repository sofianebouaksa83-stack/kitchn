import { ui } from "../../../styles/ui";
import { cn } from "../../../utils/cn";

const QUESTIONS = [
  {
    question: "Est-ce que Kitch’n est gratuit ?",
    answer:
      "Oui. Le plan Free permet de commencer sans paiement, avec les fonctionnalités essentielles pour créer et organiser vos recettes.",
  },
  {
    question: "Puis-je annuler à tout moment ?",
    answer:
      "Oui. Vous pouvez gérer ou annuler votre abonnement Premium à tout moment depuis votre espace.",
  },
  {
    question: "Mes recettes sont-elles privées ?",
    answer:
      "Oui. Vos recettes restent privées par défaut. Vous choisissez quand et avec qui les partager.",
  },
  {
    question: "Kitch’n fonctionne-t-il pour une équipe ?",
    answer:
      "Oui. Kitch’n est pensé pour la brigade, avec des groupes, des dossiers et un partage structuré.",
  },
  {
    question: "Comment fonctionne l’import IA ?",
    answer:
      "Vous importez un document ou un texte, et Kitch’n le transforme en recette claire, exploitable et prête à retravailler.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    answer:
      "Oui. Les paiements et la gestion d’abonnement sont sécurisés via Stripe.",
  },
];

export function LandingFaq() {
  return (
    <section className="relative mt-20 pb-6 sm:mt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className={cn(ui.badge, "mx-auto inline-flex")}>
            FAQ
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-slate-100 sm:text-4xl">
            Tout ce qu’il faut savoir avant de commencer
          </h2>
          <p className="mt-4 text-base text-slate-300/70 sm:text-lg">
            Retrouve les réponses aux questions les plus fréquentes sur Kitch’n, les abonnements et la confidentialité de tes recettes.
          </p>
        </div>

        <div className="mt-10 divide-y divide-white/8 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          {QUESTIONS.map(({ question, answer }) => (
            <details
              key={question}
              className="group px-5 py-5 transition open:bg-white/[0.02] sm:px-7"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                <span className="text-sm font-medium text-white sm:text-base">
                  {question}
                </span>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/60 transition group-open:rotate-45 group-open:text-white">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
                  </svg>
                </span>
              </summary>
              <p className="pr-10 pt-4 text-sm leading-7 text-slate-300/75 sm:text-[15px]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
