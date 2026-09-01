type FooterProps = {
  onStart?: () => void;
};

export function Footer({ onStart }: FooterProps) {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-black/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">

          {/* Marque */}
          <div>
            <img
            src="/logo_kitchn.PNG"
            alt="kitch'n"
            className="h-20 w-auto object-contain"
          />
            <div className="mt-3 text-sm text-white/55">
              © {new Date().getFullYear()} KITCH&apos;N
            </div>

            <p className="mt-4 max-w-xs text-sm text-white/45 leading-6">
              L’outil de travail des cuisines modernes.
              <br />
              Pour ceux qui cuisinent avec passion.
            </p>
          </div>

          {/* Produit */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Produit
            </div>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="/#demo"
                className="text-white/55 hover:text-white/85 transition"
              >
                Démo
              </a>

              <a
                href="/#pricing"
                className="text-white/55 hover:text-white/85 transition"
              >
                Tarifs
              </a>

              {onStart && (
                <button
                  onClick={onStart}
                  className="text-left text-white/55 hover:text-white/85 transition"
                >
                  Commencer
                </button>
              )}
            </div>
          </div>

          {/* Légal */}
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Légal
            </div>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="/privacy"
                className="text-white/55 hover:text-white/85 transition"
              >
                Politique de confidentialité
              </a>

              <a
                href="/terms"
                className="text-white/55 hover:text-white/85 transition"
              >
                Conditions d’utilisation
              </a>

              <a
                href="/legal"
                className="text-white/55 hover:text-white/85 transition"
              >
                Mentions légales
              </a>

              <a
                href="mailto:support@kitchnpro.com"
                className="text-white/55 hover:text-white/85 transition"
              >
                support@kitchnpro.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}