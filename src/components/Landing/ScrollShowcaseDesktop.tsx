import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowDown,
  Check,
  Sparkles,
} from "lucide-react";

import { cn } from "../../utils/cn";

import {
  DESKTOP_SHOWCASE_STEPS as steps,
  type ShowcaseStepKey,
} from "../../features/landing/config/showcaseSteps";

import { AutoFitDemo } from "../../features/landing/components/AutoFitDemo";

export function ScrollShowcaseDesktop() {
  const prefersReducedMotion =
    useReducedMotion();

  const [active, setActive] =
    useState<ShowcaseStepKey>(
      "recipes",
    );

  const activeBg =
    steps.find(
      (step) =>
        step.key === active,
    )?.bg ?? "transparent";

  const scrollerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const trackRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(() => {
    const scroller =
      scrollerRef.current;

    const track =
      trackRef.current;

    if (!scroller || !track) {
      return;
    }

    let raf = 0;

    const stepCount =
      steps.length;

    const computeTarget =
      () => {
        const maxY =
          scroller.scrollHeight -
          scroller.clientHeight;

        const progress =
          maxY <= 0
            ? 0
            : scroller.scrollTop /
              maxY;

        const boosted =
          Math.min(
            1,
            progress * 1.45,
          );

        const index =
          Math.round(
            boosted *
              (stepCount - 1),
          );

        const maxX =
          (stepCount - 1) *
          scroller.clientWidth;

        const x =
          stepCount <= 1
            ? 0
            : (index /
                (stepCount - 1)) *
              maxX;

        return {
          x: Math.max(
            0,
            Math.min(
              maxX,
              x,
            ),
          ),
          index,
        };
      };

    const update = (
      animated: boolean,
    ) => {
      const {
        x,
        index,
      } = computeTarget();

      const nextStep =
        steps[index];

      track.style.transition =
        animated &&
        !prefersReducedMotion
          ? "transform 180ms cubic-bezier(0.33, 1, 0.68, 1)"
          : "none";

      track.style.transform =
        `translate3d(${-x}px, 0, 0)`;

      if (nextStep) {
        setActive(
          nextStep.key,
        );
      }
    };

    const onScroll = () => {
      if (raf) {
        return;
      }

      raf =
        window.requestAnimationFrame(
          () => {
            raf = 0;
            update(true);
          },
        );
    };

    const onResize = () =>
      update(false);

    update(false);

    scroller.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      onResize,
    );

    return () => {
      scroller.removeEventListener(
        "scroll",
        onScroll,
      );

      window.removeEventListener(
        "resize",
        onResize,
      );

      if (raf) {
        window.cancelAnimationFrame(
          raf,
        );
      }
    };
  }, [prefersReducedMotion]);

  const fade = {
    hidden: {
      opacity: 0,
      y: 18,
      filter: "blur(6px)",
    },

    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
  };

  const activeIndex =
    Math.max(
      0,
      steps.findIndex(
        (step) =>
          step.key === active,
      ),
    );

  const highlights = [
    {
      value: "4",
      label: "vues clés",
    },
    {
      value: "UI",
      label: "comme l’app",
    },
    {
      value: "Pro",
      label: "pensé brigade",
    },
  ];

  const scrollToStep = (
    index: number,
  ) => {
    const scroller =
      scrollerRef.current;

    if (!scroller) {
      return;
    }

    const stepCount =
      steps.length;

    const maxY =
      scroller.scrollHeight -
      scroller.clientHeight;

    const speed = 1.45;

    const targetBoosted =
      stepCount <= 1
        ? 0
        : index /
          (stepCount - 1);

    const targetProgress =
      index >= stepCount - 1
        ? 1
        : targetBoosted /
          speed;

    scroller.scrollTo({
      top:
        maxY *
        targetProgress,
      behavior: "smooth",
    });
  };

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
            rounded-[34px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            p-6
            shadow-[0_18px_50px_rgba(23,62,49,0.05)]
            sm:p-8
          "
        >
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              -left-24
              -top-24
              h-64
              w-64
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
              top-10
              h-64
              w-64
              rounded-full
              bg-[#E7EEE8]
              blur-3xl
            "
          />

          <div
            className="
              relative
              z-10
              grid
              gap-8
              lg:grid-cols-[1fr_420px]
              lg:items-end
            "
          >
            <div>
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
                  mt-5
                  max-w-2xl
                  font-serif
                  text-3xl
                  font-semibold
                  leading-tight
                  tracking-[-0.025em]
                  text-[#173E31]
                  sm:text-4xl
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
                  mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-[#617168]
                  sm:text-base
                "
              >
                Une démo guidée pour montrer
                concrètement comment Kitch’n
                aide une brigade à créer,
                ranger, retrouver et partager
                ses recettes sans perdre de
                temps.
              </p>

              <div
                className="
                  mt-6
                  grid
                  max-w-xl
                  grid-cols-3
                  gap-3
                "
              >
                {highlights.map(
                  (item) => (
                    <div
                      key={
                        item.label
                      }
                      className="
                        rounded-[20px]
                        border border-[#173E31]/8
                        bg-[#F7F5EF]
                        px-4 py-3
                      "
                    >
                      <div
                        className="
                          font-serif
                          text-xl
                          font-semibold
                          text-[#A8833E]
                        "
                      >
                        {
                          item.value
                        }
                      </div>

                      <div
                        className="
                          mt-0.5
                          text-xs
                          text-[#718078]
                        "
                      >
                        {
                          item.label
                        }
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* STEPS NAV */}
            <div
              className="
                hidden
                grid-cols-2
                gap-2
                lg:grid
              "
            >
              {steps.map(
                (
                  step,
                  index,
                ) => {
                  const isActive =
                    active ===
                    step.key;

                  return (
                    <button
                      key={
                        step.key
                      }
                      type="button"
                      onClick={() =>
                        scrollToStep(
                          index,
                        )
                      }
                      className={cn(
                        "group rounded-[20px] border px-3 py-3 text-left transition-all",
                        isActive
                          ? "border-[#184C3A]/15 bg-[#E7EEE8] shadow-[0_8px_20px_rgba(23,62,49,0.05)]"
                          : "border-[#173E31]/8 bg-[#F7F5EF] hover:border-[#173E31]/15 hover:bg-[#F0F2EC]",
                      )}
                      title={
                        step.title
                      }
                      aria-label={`Aller à l’étape ${
                        index + 1
                      }`}
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold transition",
                            isActive
                              ? "bg-[#184C3A] text-[#FBFAF6]"
                              : "bg-[#E7EEE8] text-[#617168] group-hover:text-[#184C3A]",
                          )}
                        >
                          {index + 1}
                        </span>

                        <span
                          className="
                            text-sm
                            font-semibold
                            text-[#173E31]
                          "
                        >
                          {
                            step.label
                          }
                        </span>
                      </div>

                      <div
                        className="
                          mt-2
                          line-clamp-2
                          text-xs
                          leading-5
                          text-[#718078]
                        "
                      >
                        {
                          step.title
                        }
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* INTERACTIVE DEMO */}
        <div
          className="
            relative
            mt-8
            overflow-hidden
            rounded-[34px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            shadow-[0_20px_60px_rgba(23,62,49,0.07)]
          "
        >
          {/* progress */}
          <div
            aria-hidden
            className="
              absolute
              left-0
              top-0
              z-30
              h-1
              bg-[#C7A45D]
              transition-all
              duration-300
            "
            style={{
              width: `${
                ((activeIndex +
                  1) /
                  steps.length) *
                100
              }%`,
            }}
          />

          {/* subtle per-step accent */}
          <motion.div
            aria-hidden
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.05]
            "
            animate={{
              opacity: 0.05,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            style={{
              background:
                activeBg,
            }}
          />

          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[#FBFAF6]/90
            "
          />

          <div
            ref={scrollerRef}
            className={cn(
              "relative z-10 max-h-[78vh] overflow-y-auto no-scrollbar",
              "scroll-smooth",
            )}
            style={{
              WebkitOverflowScrolling:
                "touch",
            }}
          >
            <div
              className="relative"
              style={{
                height: `${
                  steps.length *
                  45
                }vh`,
              }}
            >
              <div
                className="
                  sticky
                  top-0
                  h-[78vh]
                  overflow-hidden
                "
              >
                <div
                  ref={
                    trackRef
                  }
                  className="
                    flex
                    h-full
                    will-change-transform
                  "
                  style={{
                    width: `${
                      steps.length *
                      100
                    }%`,
                  }}
                >
                  {steps.map(
                    (
                      step,
                      index,
                    ) => {
                      const demoSideRight =
                        step.align ===
                        "right";

                      const isActive =
                        active ===
                        step.key;

                      return (
                        <div
                          key={
                            step.key
                          }
                          className="
                            flex
                            h-full
                            flex-shrink-0
                            items-center
                            px-6
                            py-10
                            sm:px-8
                            sm:py-14
                          "
                          style={{
                            width: `${
                              100 /
                              steps.length
                            }%`,
                          }}
                        >
                          <div
                            className="
                              grid
                              w-full
                              items-center
                              gap-10
                              lg:grid-cols-2
                              lg:gap-12
                            "
                          >
                            {/* TEXT */}
                            <motion.div
                              variants={
                                fade
                              }
                              initial="hidden"
                              animate="show"
                              transition={{
                                duration:
                                  prefersReducedMotion
                                    ? 0
                                    : 0.6,

                                delay:
                                  prefersReducedMotion
                                    ? 0
                                    : 0.05,
                              }}
                              className={cn(
                                demoSideRight
                                  ? "lg:order-1"
                                  : "lg:order-2",
                                "max-w-xl",
                              )}
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
                                  mt-5
                                  font-serif
                                  text-3xl
                                  font-semibold
                                  leading-tight
                                  tracking-[-0.025em]
                                  text-[#173E31]
                                  sm:text-4xl
                                "
                              >
                                {
                                  step.title
                                }
                              </h3>

                              <p
                                className="
                                  mt-4
                                  text-base
                                  leading-7
                                  text-[#617168]
                                  sm:text-lg
                                "
                              >
                                {
                                  step.body
                                }
                              </p>

                              <ul
                                className="
                                  mt-6
                                  space-y-3
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
                                        text-sm
                                        text-[#29493E]
                                        sm:text-base
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

                              <div
                                className="
                                  mt-8
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-full
                                  bg-[#F0F2EC]
                                  px-4
                                  py-2
                                  text-sm
                                  text-[#718078]
                                "
                              >
                                <span
                                  className="
                                    font-semibold
                                    text-[#A8833E]
                                  "
                                >
                                  {isActive
                                    ? "Actif"
                                    : "Démo"}
                                </span>

                                <span>
                                  ·
                                </span>

                                <ArrowDown className="h-3.5 w-3.5" />

                                <span>
                                  Scroll ou
                                  choisis une
                                  étape
                                </span>
                              </div>
                            </motion.div>

                            {/* DEMO */}
                            <motion.div
                              variants={
                                fade
                              }
                              initial="hidden"
                              animate="show"
                              transition={{
                                duration:
                                  prefersReducedMotion
                                    ? 0
                                    : 0.6,

                                delay:
                                  prefersReducedMotion
                                    ? 0
                                    : 0.12,
                              }}
                              className={cn(
                                demoSideRight
                                  ? "lg:order-2"
                                  : "lg:order-1",
                              )}
                            >
                              <div
                                className="
                                  mx-auto
                                  w-full
                                  max-w-[560px]
                                  overflow-hidden
                                  rounded-[30px]
                                  border border-[#173E31]/10
                                  bg-[#F3F0E8]
                                  p-3
                                  shadow-[0_24px_70px_rgba(23,62,49,0.14)]
                                  sm:p-4
                                "
                              >
                                {/* fake browser bar */}
                                <div
                                  className="
                                    mb-3
                                    flex
                                    items-center
                                    gap-2
                                    px-2
                                  "
                                >
                                  <span className="h-2.5 w-2.5 rounded-full bg-[#DDAE9D]" />

                                  <span className="h-2.5 w-2.5 rounded-full bg-[#C7A45D]/55" />

                                  <span className="h-2.5 w-2.5 rounded-full bg-[#184C3A]/35" />

                                  <div
                                    className="
                                      ml-2
                                      h-6
                                      flex-1
                                      rounded-full
                                      bg-[#E7EEE8]
                                    "
                                  />
                                </div>

                                <div
                                  className="
                                    h-[365px]
                                    overflow-hidden
                                    rounded-[22px]
                                    border border-[#173E31]/8
                                    bg-[#FBFAF6]
                                  "
                                >
                                  <div className="min-w-[1100px]">
                                    <AutoFitDemo
                                      variant="desktop"
                                      baseWidth={
                                        950
                                      }
                                      baseHeight={
                                        1500
                                      }
                                      padding={
                                        8
                                      }
                                      className="
                                        h-[720px]
                                        overflow-hidden
                                      "
                                    >
                                      {
                                        step.demo
                                      }
                                    </AutoFitDemo>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SCROLL INDICATION */}
        <div
          className="
            mt-4
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-[#8B9791]
          "
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Fais défiler la démo pour
          découvrir les étapes
        </div>
      </div>
    </section>
  );
}