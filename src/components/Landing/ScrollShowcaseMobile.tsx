import type {
  ReactNode,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Check,
  Sparkles,
} from "lucide-react";

import { cn } from "../../utils/cn";

import { AnimatedSection } from "./AnimatedSection";

import {
  MOBILE_SHOWCASE_STEPS as steps,
} from "../../features/landing/config/showcaseSteps";

import { AutoFitDemo } from "../../features/landing/components/AutoFitDemo";

function MobilePhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center py-4",
        className,
      )}
    >
      {/* halo */}
      <div
        className="
          pointer-events-none
          absolute
          h-[420px]
          w-[260px]
          rounded-full
          bg-[#E7EEE8]
          blur-3xl
        "
      />

      {/* téléphone */}
      <div
        className="
          relative
          h-[592px]
          w-[290px]
          rounded-[42px]
          border
          border-[#173E31]/15
          bg-[#173E31]
          shadow-[0_28px_70px_rgba(23,62,49,0.20)]
        "
      >
        {/* contour intérieur */}
        <div
          className="
            pointer-events-none
            absolute
            inset-[3px]
            rounded-[39px]
            border
            border-white/10
          "
        />

        {/* dynamic island */}
        <div
          className="
            absolute
            left-1/2
            top-3
            z-30
            h-[26px]
            w-[100px]
            -translate-x-1/2
            rounded-full
            bg-[#0D1814]
          "
        />

        {/* boutons */}
        <div
          className="
            absolute
            left-[-1px]
            top-[120px]
            h-[30px]
            w-[2px]
            rounded-full
            bg-[#173E31]/40
          "
        />

        <div
          className="
            absolute
            right-[-1px]
            top-[110px]
            h-[50px]
            w-[2px]
            rounded-full
            bg-[#173E31]/40
          "
        />

        <div
          className="
            absolute
            right-[-1px]
            top-[170px]
            h-[50px]
            w-[2px]
            rounded-full
            bg-[#173E31]/40
          "
        />

        {/* écran */}
        <div
          className="
            absolute
            inset-[7px]
            overflow-hidden
            rounded-[34px]
            bg-[#F3F0E8]
          "
        >
          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
            "
          >
            {children}
          </div>
        </div>

        {/* reflet */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            rounded-[42px]
            bg-gradient-to-br
            from-white/10
            via-transparent
            to-transparent
          "
        />
      </div>
    </div>
  );
}

export function ScrollShowcaseMobile() {
  const prefersReducedMotion =
    useReducedMotion();

  const fade = {
    hidden: {
      opacity: 0,
      y: 16,
    },

    show: {
      opacity: 1,
      y: 0,
    },
  };

  const highlights = [
    "Démo réelle",
    "Pensé service",
    "Mobile first",
    "Brigade prête",
  ];

  return (
    <section
      id="decouvre-kitch-n"
      className="
        relative
        mt-14
        sm:mt-20
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          sm:px-6
        "
      >
        {/* INTRO */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[30px]
            border
            border-[#173E31]/10
            bg-[#FBFAF6]
            p-5
            shadow-[0_14px_40px_rgba(23,62,49,0.05)]
          "
        >
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -left-20
              -top-20
              h-52
              w-52
              rounded-full
              bg-[#C7A45D]/8
              blur-3xl
            "
          />

          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -right-20
              top-8
              h-56
              w-56
              rounded-full
              bg-[#E7EEE8]
              blur-3xl
            "
          />

          <div className="relative z-10">
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#E7EEE8]
                px-3.5
                py-1.5
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#A8833E]
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              Découvre Kitch’n
            </div>

            <h2
              className="
                mt-4
                font-serif
                text-3xl
                font-semibold
                leading-tight
                tracking-[-0.025em]
                text-[#173E31]
              "
            >
              De l’import à la recette
              partagée,
              <span className="text-[#A8833E]">
                {" "}
                tout devient fluide.
              </span>
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-7
                text-[#617168]
                sm:text-base
              "
            >
              Fais défiler la démo pour voir
              comment Kitch’n aide une brigade
              à créer, ranger, retrouver et
              partager ses recettes.
            </p>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-2
              "
            >
              {highlights.map(
                (item) => (
                  <div
                    key={item}
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-2xl
                      border
                      border-[#173E31]/8
                      bg-[#F7F5EF]
                      px-3
                      py-2.5
                      text-xs
                      font-medium
                      text-[#29493E]
                    "
                  >
                    <span
                      className="
                        grid
                        h-5
                        w-5
                        shrink-0
                        place-items-center
                        rounded-full
                        bg-[#E7EEE8]
                        text-[#184C3A]
                      "
                    >
                      <Check className="h-3 w-3" />
                    </span>

                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* STEPS */}
        <div
          className="
            mt-8
            space-y-10
            sm:space-y-14
          "
        >
          {steps.map(
            (
              step,
              index,
            ) => (
              <AnimatedSection
                key={
                  step.key
                }
                direction="none"
                className="
                  relative
                  mt-6
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-[#173E31]/10
                  bg-[#FBFAF6]
                  shadow-[0_16px_45px_rgba(23,62,49,0.06)]
                "
              >
                {/* progress */}
                <div
                  aria-hidden
                  className="
                    absolute
                    left-0
                    top-0
                    z-20
                    h-1
                    bg-[#C7A45D]
                  "
                  style={{
                    width: `${
                      ((index +
                        1) /
                        steps.length) *
                      100
                    }%`,
                  }}
                />

                {/* accent de l'étape */}
                <div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    opacity-[0.05]
                  "
                  style={{
                    background:
                      step.bg,
                  }}
                />

                <div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-[#FBFAF6]/92
                  "
                />

                <div
                  className="
                    relative
                    z-10
                    p-5
                    sm:p-7
                  "
                >
                  {/* TEXT */}
                  <motion.div
                    variants={
                      fade
                    }
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                      once: true,
                      amount: 0.25,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.55,

                      ease:
                        "easeOut",
                    }}
                  >
                    <div
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        bg-[#E7EEE8]
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        text-[#184C3A]
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#C7A45D]
                        "
                      />

                      Étape{" "}
                      {index +
                        1}{" "}
                      ·{" "}
                      {
                        step.label
                      }
                    </div>

                    <h3
                      className="
                        mt-4
                        font-serif
                        text-2xl
                        font-semibold
                        leading-tight
                        tracking-[-0.02em]
                        text-[#173E31]
                        sm:text-3xl
                      "
                    >
                      {
                        step.title
                      }
                    </h3>

                    <p
                      className="
                        mt-3
                        text-base
                        leading-7
                        text-[#617168]
                      "
                    >
                      {
                        step.body
                      }
                    </p>

                    <ul
                      className="
                        mt-5
                        grid
                        gap-2
                      "
                    >
                      {step.bullets.map(
                        (
                          bullet,
                        ) => (
                          <li
                            key={
                              bullet
                            }
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-2xl
                              border
                              border-[#173E31]/8
                              bg-[#F7F5EF]
                              px-3
                              py-2.5
                              text-sm
                              text-[#29493E]
                            "
                          >
                            <span
                              className="
                                grid
                                h-6
                                w-6
                                shrink-0
                                place-items-center
                                rounded-full
                                bg-[#E7EEE8]
                                text-[#184C3A]
                              "
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>

                            <span>
                              {
                                bullet
                              }
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </motion.div>

                  {/* DEMO MOBILE */}
                  <motion.div
                    variants={
                      fade
                    }
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration:
                        prefersReducedMotion
                          ? 0
                          : 0.55,

                      ease:
                        "easeOut",

                      delay:
                        prefersReducedMotion
                          ? 0
                          : 0.06,
                    }}
                    className="
                      relative
                      mt-7
                    "
                  >
                    <div
                      className="
                        mb-3
                        flex
                        items-center
                        justify-between
                        px-1
                        text-xs
                        text-[#718078]
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          font-medium
                          text-[#184C3A]
                        "
                      >
                        <span
                          className="
                            h-2
                            w-2
                            rounded-full
                            bg-[#C7A45D]
                          "
                        />

                        Démo mobile
                      </span>

                      <span>
                        {index +
                          1}
                        /
                        {
                          steps.length
                        }
                      </span>
                    </div>

                    <MobilePhoneFrame>
                      <div
                        className="
                          relative
                          h-full
                          w-full
                        "
                      >
                        <AutoFitDemo
                          variant="mobile"
                          baseWidth={
                            step.demoBaseWidth ??
                            390
                          }
                          baseHeight={
                            step.demoBaseHeight ??
                            980
                          }
                          padding={
                            6
                          }
                          offsetY={
                            step.demoOffsetY ??
                            0
                          }
                          maxScale={
                            step.demoMaxScale ??
                            1
                          }
                          cropTop={
                            0
                          }
                          className="
                            h-full
                            w-full
                            overflow-hidden
                          "
                        >
                          {
                            step.demo
                          }
                        </AutoFitDemo>
                      </div>
                    </MobilePhoneFrame>
                  </motion.div>
                </div>
              </AnimatedSection>
            ),
          )}
        </div>
      </div>
    </section>
  );
}