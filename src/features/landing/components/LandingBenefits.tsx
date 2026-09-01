import { BookOpen, Sparkles, Users } from "lucide-react";
import { ui } from "../../../styles/ui";
import { cn } from "../../../utils/cn";

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
    <section className="relative mt-20 sm:mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className={cn(ui.badge, "mx-auto inline-flex")}>
            Pourquoi Kitch’n
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-slate-100 sm:text-4xl">
            Pensé pour les cuisines professionnelles
          </h2>
          <p className="mt-4 text-base text-slate-300/70 sm:text-lg">
            Kitch’n centralise les recettes, simplifie le partage et permet à toute la brigade de travailler avec la même base.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <div className="mb-4 text-amber-300">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-300/70">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
