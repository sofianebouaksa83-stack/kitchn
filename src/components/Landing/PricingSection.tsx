import { ui } from "../../styles/ui";

export function PricingSection() {
  return (
    <section className="mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        <div className="text-center mb-12">
          <div className={ui.badge}>Tarifs</div>

          <h2 className="mt-4 text-3xl font-semibold text-slate-100">
            Simple et transparent
          </h2>

          <p className="mt-2 text-slate-300/80">
            Commence gratuitement. Passe à Premium quand ton équipe grandit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* FREE */}
          <div className="rounded-3xl ring-1 ring-white/10 bg-white/[0.03] p-8">
            <h3 className="text-xl font-semibold text-white">
              Free
            </h3>

            <div className="mt-4 text-4xl font-bold text-white">
              0€
            </div>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>Gestion des recettes</li>
              <li>1 groupe de travail</li>
              <li>30 imports IA / mois</li>
            </ul>
          </div>

          {/* PREMIUM */}
          <div className="rounded-3xl ring-1 ring-amber-400/30 bg-white/[0.03] p-8">

            <h3 className="text-xl font-semibold text-white">
              Premium
            </h3>

            <div className="mt-4 text-4xl font-bold text-white">
              9.90€
              <span className="text-lg text-slate-400"> / mois</span>
            </div>

            <ul className="mt-6 space-y-3 text-slate-300">
              <li>Imports IA illimités</li>
              <li>Groupes illimités</li>
              <li>Partage avancé</li>
              <li>Support prioritaire</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}