export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-yellow-300">
          Politique de confidentialité
        </h1>

        <p className="text-white/80">
          KITCH’N collecte uniquement les informations nécessaires à
          l’authentification et à l’utilisation de l’application.
        </p>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Données collectées</h2>
          <ul className="list-disc pl-6 text-white/80 space-y-1">
            <li>Adresse e-mail</li>
            <li>Nom / identifiant de profil (si disponible via le fournisseur)</li>
            <li>Données techniques nécessaires au fonctionnement (session, sécurité)</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Utilisation des données</h2>
          <ul className="list-disc pl-6 text-white/80 space-y-1">
            <li>Créer et gérer votre compte</li>
            <li>Assurer la sécurité (authentification, prévention des abus)</li>
            <li>Fournir les fonctionnalités de l’application</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Partage des données</h2>
          <p className="text-white/80">
            Vos données ne sont ni revendues ni partagées à des tiers à des fins
            commerciales. Elles peuvent être traitées par des prestataires
            techniques nécessaires au fonctionnement (ex : hébergement,
            authentification).
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Conservation</h2>
          <p className="text-white/80">
            Les données sont conservées tant que votre compte est actif, ou le
            temps nécessaire au respect d’obligations légales et de sécurité.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Vos droits</h2>
          <p className="text-white/80">
            Vous pouvez demander l’accès, la modification ou la suppression de
            vos données.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10">
          <p className="text-white/80">
            Contact :{" "}
            <a
              className="underline text-yellow-300"
              href="mailto:sofiane.bouaksa83@gmail.com"
            >
              sofiane.bouaksa83@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}