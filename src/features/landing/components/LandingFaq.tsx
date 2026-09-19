import {
  HelpCircle,
  Plus,
} from "lucide-react";

const QUESTIONS = [
  {
    question:
      "Est-ce que Kitch’n est gratuit ?",
    answer:
      "Oui. Le plan Free permet de commencer sans paiement, avec les fonctionnalités essentielles pour créer et organiser vos recettes.",
  },
  {
    question:
      "Puis-je annuler à tout moment ?",
    answer:
      "Oui. Vous pouvez gérer ou annuler votre abonnement Premium à tout moment depuis votre espace.",
  },
  {
    question:
      "Mes recettes sont-elles privées ?",
    answer:
      "Oui. Vos recettes restent privées par défaut. Vous choisissez quand et avec qui les partager.",
  },
  {
    question:
      "Kitch’n fonctionne-t-il pour une équipe ?",
    answer:
      "Oui. Kitch’n est pensé pour la brigade, avec des groupes, des dossiers et un partage structuré.",
  },
  {
    question:
      "Comment fonctionne l’import IA ?",
    answer:
      "Vous importez un document ou un texte, et Kitch’n le transforme en recette claire, exploitable et prête à retravailler.",
  },
  {
    question:
      "Le paiement est-il sécurisé ?",
    answer:
      "Oui. Les paiements et la gestion d’abonnement sont sécurisés via Stripe.",
  },
];

export function LandingFaq() {
  return (
    <section
      className="
        relative
        mt-20
        pb-6
        sm:mt-24
      "
    >
      <div
        className="
          mx-auto
          max-w-4xl
          px-4
          sm:px-6
        "
      >
        {/* HEADER */}
        <div
          className="
            mx-auto
            max-w-2xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#E7EEE8]
              px-3.5
              py-1.5
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#A8833E]
            "
          >
            <HelpCircle className="h-3.5 w-3.5" />

            FAQ
          </div>

          <h2
            className="
              mt-6
              font-serif
              text-3xl
              font-semibold
              tracking-[-0.025em]
              text-[#173E31]
              sm:text-4xl
            "
          >
            Tout ce qu’il faut savoir
            <span className="text-[#A8833E]">
              {" "}
              avant de commencer.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-base
              leading-7
              text-[#617168]
              sm:text-lg
            "
          >
            Retrouve les réponses aux questions
            les plus fréquentes sur Kitch’n,
            les abonnements et la confidentialité
            de tes recettes.
          </p>
        </div>

        {/* FAQ */}
        <div
          className="
            mt-10
            overflow-hidden
            rounded-[30px]
            border
            border-[#173E31]/10
            bg-[#FBFAF6]
            shadow-[0_14px_40px_rgba(23,62,49,0.05)]
          "
        >
          {QUESTIONS.map(
            (
              {
                question,
                answer,
              },
              index,
            ) => (
              <details
                key={question}
                className="
                  group
                  border-b
                  border-[#173E31]/8
                  px-5
                  py-1
                  transition
                  last:border-b-0
                  open:bg-[#F7F5EF]
                  sm:px-7
                "
              >
                <summary
                  className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-4
                    py-5
                    text-left
                  "
                >
                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-4
                    "
                  >
                    <span
                      className="
                        hidden
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#E7EEE8]
                        text-xs
                        font-semibold
                        text-[#184C3A]
                        sm:flex
                      "
                    >
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <span
                      className="
                        text-sm
                        font-semibold
                        text-[#173E31]
                        sm:text-base
                      "
                    >
                      {question}
                    </span>
                  </div>

                  <span
                    className="
                      grid
                      h-9
                      w-9
                      shrink-0
                      place-items-center
                      rounded-full
                      bg-[#E7EEE8]
                      text-[#184C3A]
                      transition-all
                      duration-200
                      group-open:rotate-45
                      group-open:bg-[#DDAE9D]
                      group-open:text-[#173E31]
                    "
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>

                <div
                  className="
                    pb-5
                    pr-12
                    sm:pl-12
                  "
                >
                  <p
                    className="
                      text-sm
                      leading-7
                      text-[#617168]
                      sm:text-[15px]
                    "
                  >
                    {answer}
                  </p>
                </div>
              </details>
            ),
          )}
        </div>

        <p
          className="
            mt-5
            text-center
            text-xs
            text-[#8B9791]
          "
        >
          Une autre question ? Tu peux
          nous contacter depuis l’assistance.
        </p>
      </div>
    </section>
  );
}