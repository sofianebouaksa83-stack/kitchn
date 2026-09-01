import { LegalLayout, LegalSection } from "../components/Legal/LegalLayout";

export default function Legal() {
  return (
    <LegalLayout
      badge="Légal"
      title="Mentions légales"
      intro="Les présentes mentions légales identifient l’éditeur du service Kitch’n, ses prestataires techniques et les règles applicables au site."
    >
      <LegalSection title="1. Éditeur du site">
        <p>KITCH’N</p>
        <p className="mt-2">Responsable de publication : Sofiane Bouaksa</p>
        <p className="mt-2">
          Contact :
          <a
            href="mailto:support@kitchnpro.com"
            className="ml-2 text-amber-300 hover:text-amber-200 underline underline-offset-4"
          >
            support@kitchnpro.com
          </a>
        </p>
      </LegalSection>

      <LegalSection title="2. Hébergement">
        <p>Le site et l’application sont hébergés par Vercel.</p>
      </LegalSection>

      <LegalSection title="3. Services techniques">
        <p>
          Certaines fonctionnalités peuvent s’appuyer sur des services tiers
          nécessaires au fonctionnement de la plateforme, notamment Supabase
          pour la base de données et l’authentification, ainsi que Stripe pour
          la gestion des abonnements et paiements.
        </p>
      </LegalSection>

      <LegalSection title="4. Propriété intellectuelle">
        <p>
          Les éléments visuels, textes, logos, composants, structure et identité
          de Kitch’n sont protégés. Toute reproduction, diffusion ou
          réutilisation non autorisée est interdite.
        </p>
      </LegalSection>

      <LegalSection title="5. Contact">
        <p>Pour toute demande relative au site ou à son exploitation :</p>
        <p className="mt-2">
          <a
            href="mailto:support@kitchnpro.com"
            className="text-amber-300 hover:text-amber-200 underline underline-offset-4"
          >
            support@kitchnpro.com
          </a>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
