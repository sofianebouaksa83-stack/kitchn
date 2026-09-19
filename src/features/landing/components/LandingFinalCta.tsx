import {
  ArrowRight,
  Check,
  ChefHat,
} from "lucide-react";

export function LandingFinalCta({
  onStart,
  onLogin,
}: {
  onStart: () => void;
  onLogin: () => void;
}) {
  return (
    <section
      className="
        relative
        mt-24
        pb-10
        sm:mt-28
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          px-4
          sm:px-6
        "
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-[34px]
            bg-[#173E31]
            px-6
            py-10
            text-center
            shadow-[0_24px_70px_rgba(23,62,49,0.18)]
            sm:px-10
            sm:py-14
          "
        >
          {/* DECORATION */}
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -left-20
              -top-20
              h-64
              w-64
              rounded-full
              bg-[#C7A45D]/10
              blur-3xl
            "
          />

          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -bottom-24
              -right-20
              h-72
              w-72
              rounded-full
              bg-[#DDAE9D]/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
              mx-auto
              max-w-3xl
            "
          >
            {/* ICON */}
            <div
              className="
                mx-auto
                grid
                h-13
                w-13
                place-items-center
                rounded-[20px]
                bg-[#FBFAF6]/10
                text-[#C7A45D]
                ring-1
                ring-white/10
              "
            >
              <ChefHat className="h-6 w-6" />
            </div>

            {/* EYEBROW */}
            <div
              className="
                mt-5
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#C7A45D]
              "
            >
              Kitch’n
            </div>

            {/* TITLE */}
            <h2
              className="
                mt-3
                font-serif
                text-3xl
                font-semibold
                tracking-[-0.025em]
                text-[#F7F3EA]
                sm:text-4xl
                lg:text-5xl
              "
            >
              Commence gratuitement
              <span className="text-[#DDAE9D]">
                {" "}
                aujourd’hui.
              </span>
            </h2>

            {/* DESCRIPTION */}
            <p
              className="
                mx-auto
                mt-5
                max-w-2xl
                text-base
                leading-7
                text-[#F7F3EA]/70
                sm:text-lg
              "
            >
              Crée ton espace, organise tes
              recettes et partage-les avec ton
              équipe dans un outil pensé pour
              les cuisines professionnelles.
            </p>

            {/* ACTIONS */}
            <div
              className="
                mt-8
                flex
                flex-col
                justify-center
                gap-3
                sm:flex-row
              "
            >
              <button
                type="button"
                onClick={onStart}
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#DDAE9D]
                  px-7
                  py-3
                  text-sm
                  font-semibold
                  text-[#173E31]
                  shadow-[0_10px_26px_rgba(0,0,0,0.10)]
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#D5A18E]
                  active:scale-[0.98]
                "
              >
                Commencer gratuitement

                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/12
                  bg-white/5
                  px-7
                  py-3
                  text-sm
                  font-semibold
                  text-[#F7F3EA]
                  transition
                  hover:-translate-y-0.5
                  hover:bg-white/10
                  active:scale-[0.98]
                "
              >
                Se connecter
              </button>
            </div>

            {/* TRUST */}
            <div
              className="
                mt-6
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-5
                gap-y-2
                text-xs
                text-[#F7F3EA]/60
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                "
              >
                <Check className="h-3.5 w-3.5 text-[#C7A45D]" />
                Gratuit
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                "
              >
                <Check className="h-3.5 w-3.5 text-[#C7A45D]" />
                Sans engagement
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                "
              >
                <Check className="h-3.5 w-3.5 text-[#C7A45D]" />
                Aucun paiement requis
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}