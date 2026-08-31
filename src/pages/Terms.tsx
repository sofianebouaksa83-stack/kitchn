import { LegalLayout, LegalSection } from "../components/Legal/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout
      badge="Légal"
      title="Conditions d’utilisation"
      intro="En utilisant Kitch’n, vous acceptez les présentes conditions d’utilisation. Elles encadrent l’accès au service et son usage."
    >
      <LegalSection title="1. Objet">
        <p>
          Kitch’n permet la gestion, l’organisation, l’importation et le partage
          de recettes professionnelles, dans un espace personnel et/ou
          collaboratif.
        </p>
      </LegalSection>

      <LegalSection title="2. Compte et sécurité">
        <p>
          Vous êtes responsable de la confidentialité de vos accès, ainsi que
          des actions effectuées depuis votre compte. Vous vous engagez à
          protéger vos identifiants et à signaler toute utilisation non
          autorisée.
        </p>
      </LegalSection>

      <LegalSection title="3. Contenu utilisateur">
        <p>
          Vous restez responsable des contenus que vous créez, importez,
          modifiez ou partagez via Kitch’n. Vous garantissez disposer des droits
          nécessaires sur les contenus utilisés.
        </p>
      </LegalSection>

      <LegalSection title="4. Comportements interdits">
        <ul className="list-disc pl-5 space-y-2">
          <li>Usage abusif, frauduleux ou contraire à la loi</li>
          <li>Tentatives d’accès non autorisé au service ou aux données</li>
          <li>Import ou partage de contenus portant atteinte aux droits d’autrui</li>
          <li>Perturbation volontaire du fonctionnement de la plateforme</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Suspension ou suppression">
        <p>
          Kitch’n se réserve le droit de suspendre, restreindre ou supprimer un
          compte en cas de violation des présentes conditions, d’abus manifeste
          ou de risque pour la sécurité du service.
        </p>
      </LegalSection>

      <LegalSection title="6. Évolution du service">
        <p>
          Certaines fonctionnalités peuvent évoluer, être modifiées ou retirées,
          notamment dans le cadre d’améliorations produit, de maintenance ou
          d’évolutions techniques.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>Pour toute question concernant ces conditions :</p>
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
