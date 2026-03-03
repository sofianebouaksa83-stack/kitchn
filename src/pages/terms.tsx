export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-yellow-300">
          Conditions d’utilisation
        </h1>

        <p className="text-white/80">
          En utilisant KITCH’N, vous acceptez les présentes conditions.
        </p>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Objet</h2>
          <p className="text-white/80">
            KITCH’N permet la gestion, l’organisation et le partage de recettes
            professionnelles au sein d’un espace personnel et/ou de groupes.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Compte & sécurité</h2>
          <p className="text-white/80">
            Vous êtes responsable de l’accès à votre compte et des actions
            effectuées depuis celui-ci.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Contenu utilisateur</h2>
          <p className="text-white/80">
            Vous restez responsable des contenus que vous créez, importez ou
            partagez. Vous garantissez disposer des droits nécessaires.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Comportements interdits</h2>
          <ul className="list-disc pl-6 text-white/80 space-y-1">
            <li>Usage abusif, frauduleux ou illégal</li>
            <li>Tentatives d’accès non autorisé</li>
            <li>Contenus portant atteinte aux droits d’autrui</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Suspension</h2>
          <p className="text-white/80">
            KITCH’N se réserve le droit de suspendre ou supprimer un compte en
            cas d’abus, de violation des présentes conditions ou de risques de
            sécurité.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="text-white/80">
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