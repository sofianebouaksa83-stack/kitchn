import {
  ArrowRight,
  Mail,
} from "lucide-react";

type FooterProps = {
  onStart?: () => void;
};

export function Footer({
  onStart,
}: FooterProps) {
  const currentYear =
    new Date().getFullYear();

  const linkClass =
    "text-sm text-[#718078] " +
    "transition-colors duration-200 " +
    "hover:text-[#184C3A]";

  return (
    <footer
      className="
        relative
        mt-16
        border-t
        border-[#173E31]/8
        bg-[#FBFAF6]
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-4 py-10
          sm:px-6
          sm:py-12
        "
      >
        <div
          className="
            grid gap-10
            md:grid-cols-3
          "
        >
          {/* MARQUE */}
          <div>
            <a
              href="/"
              className="
                inline-flex
                items-center
                transition
                hover:opacity-80
              "
            >
              <img
                src="/logo_kitchn_sans_fond.png"
                alt="KITCH'N"
                className="
                  h-20
                  w-auto
                  object-contain
                  sm:h-18
                "
                draggable={false}
              />
            </a>

            <p
              className="
                mt-4
                max-w-xs
                text-sm
                leading-6
                text-[#718078]
              "
            >
              L’outil de travail des
              cuisines modernes.
              <br />
              Pour ceux qui cuisinent
              avec passion.
            </p>

            <div
              className="
                mt-4
                text-xs
                text-[#9AA49F]
              "
            >
              © {currentYear} KITCH&apos;N
            </div>
          </div>

          {/* PRODUIT */}
          <div>
            <div
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#A8833E]
              "
            >
              Produit
            </div>

            <div
              className="
                mt-4
                flex flex-col
                items-start
                gap-3
              "
            >
              <a
                href="/#demo"
                className={linkClass}
              >
                Démo
              </a>

              <a
                href="/#pricing"
                className={linkClass}
              >
                Tarifs
              </a>

              {onStart ? (
                <button
                  type="button"
                  onClick={onStart}
                  className={`
                    ${linkClass}
                    inline-flex
                    items-center
                    gap-1.5
                  `}
                >
                  Commencer

                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {/* LÉGAL */}
          <div>
            <div
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#A8833E]
              "
            >
              Légal
            </div>

            <div
              className="
                mt-4
                flex flex-col
                items-start
                gap-3
              "
            >
              <a
                href="/privacy"
                className={linkClass}
              >
                Politique de confidentialité
              </a>

              <a
                href="/terms"
                className={linkClass}
              >
                Conditions d’utilisation
              </a>

              <a
                href="/legal"
                className={linkClass}
              >
                Mentions légales
              </a>

              <a
                href="mailto:support@kitchnpro.com"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-[#184C3A]
                  transition
                  hover:text-[#A8833E]
                "
              >
                <Mail className="h-4 w-4" />

                support@kitchnpro.com
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-10
            flex flex-col
            gap-3
            border-t
            border-[#173E31]/8
            pt-6
            text-xs
            text-[#9AA49F]

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            KITCH&apos;N · Cuisine, organisation
            et partage.
          </span>

          <span>
            Fait pour les cuisines qui
            travaillent avec passion.
          </span>
        </div>
      </div>
    </footer>
  );
}