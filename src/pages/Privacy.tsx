import { LegalLayout, LegalSection } from "../components/Legal/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout
      badge="Légal"
      title="Politique de confidentialité"
      intro="Cette page explique quelles données Kitch’n collecte, pourquoi elles sont utilisées et comment elles sont protégées."
    >
      <LegalSection title="1. Données collectées">
        <ul className="list-disc pl-5 space-y-2">
          <li>Adresse e-mail</li>
          <li>Nom ou identifiant de profil, si disponible</li>
          <li>Données techniques nécessaires au fonctionnement de l’application</li>
          <li>Données de session, d’authentification et de sécurité</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Utilisation des données">
        <ul className="list-disc pl-5 space-y-2">
          <li>Créer et gérer votre compte utilisateur</li>
          <li>Assurer l’authentification et la sécurité de la plateforme</li>
          <li>Permettre l’accès aux fonctionnalités de Kitch’n</li>
          <li>Prévenir les abus, erreurs techniques et usages frauduleux</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Partage des données">
        <p>
          Vos données ne sont ni revendues ni utilisées à des fins commerciales
          par des tiers. Elles peuvent être traitées uniquement par des
          prestataires techniques nécessaires au fonctionnement du service,
          notamment pour l’hébergement, l’authentification, la base de données
          et le paiement.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservation">
        <p>
          Les données sont conservées pendant la durée d’activité du compte, ou
          le temps nécessaire pour répondre à des obligations techniques,
          légales ou de sécurité.
        </p>
      </LegalSection>

      <LegalSection title="5. Vos droits">
        <p>
          Vous pouvez demander l’accès, la rectification ou la suppression de
          vos données personnelles, dans la limite des obligations légales et
          techniques applicables.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact">
        <p>Pour toute question relative à la confidentialité ou à vos données :</p>
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
