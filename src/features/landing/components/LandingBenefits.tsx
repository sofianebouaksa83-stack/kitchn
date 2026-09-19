import {
  BookOpen,
  Sparkles,
  Users,
} from "lucide-react";

const BENEFITS = [
  {
    title: "Recettes centralisées",
    description:
      "Une seule source de vérité pour toute la brigade.",
    icon: BookOpen,
  },
  {
    title: "Travail d’équipe",
    description:
      "Partage structuré par groupes et dossiers.",
    icon: Users,
  },
  {
    title: "Import intelligent",
    description:
      "Transforme un document ou un texte en recette exploitable.",
    icon: Sparkles,
  },
];

export function LandingBenefits() {
  return (
    <section
      className="
        relative
        mt-20
        sm:mt-28
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          sm:px-6
        "
      >
        {/* HEADER */}
        <div
          className="
            mx-auto
            max-w-3xl
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
            <Sparkles className="h-3.5 w-3.5" />

            Pourquoi Kitch’n
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
            Pensé pour les cuisines
            professionnelles
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-[#617168]
              sm:text-lg
            "
          >
            Kitch’n centralise les recettes,
            simplifie le partage et permet à
            toute la brigade de travailler
            avec la même base.
          </p>
        </div>

        {/* CARDS */}
        <div
          className="
            mt-12
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {BENEFITS.map(
            ({
              title,
              description,
              icon: Icon,
            }) => (
              <article
                key={title}
                className="
                  group
                  rounded-[28px]
                  border
                  border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-6
                  shadow-[0_10px_30px_rgba(23,62,49,0.04)]
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:border-[#173E31]/15
                  hover:shadow-[0_16px_40px_rgba(23,62,49,0.07)]
                "
              >
                <div
                  className="
                    mb-5
                    grid h-12 w-12
                    place-items-center
                    rounded-[18px]
                    bg-[#E7EEE8]
                    text-[#184C3A]
                    transition
                    group-hover:bg-[#DDE8DF]
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3
                  className="
                    font-serif
                    text-xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  {title}
                </h3>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-[#718078]
                  "
                >
                  {description}
                </p>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}