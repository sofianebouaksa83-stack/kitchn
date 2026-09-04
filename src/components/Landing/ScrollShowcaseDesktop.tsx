import {
  useEffect,
  useRef,
  useState,  
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";
import { cn } from "../../utils/cn";

import {
  DESKTOP_SHOWCASE_STEPS as steps,
  type ShowcaseStepKey,
} from "../../features/landing/config/showcaseSteps";
import { AutoFitDemo } from "../../features/landing/components/AutoFitDemo";


export function ScrollShowcaseDesktop() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<ShowcaseStepKey>("recipes");

  const activeBg =
    steps.find((step) => step.key === active)?.bg ?? "transparent";

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  



  useEffect(() => {
  const scroller = scrollerRef.current;
  const track = trackRef.current;

  if (!scroller || !track) return;

  let raf = 0;
  const stepCount = steps.length;

  const computeTarget = () => {
    const maxY = scroller.scrollHeight - scroller.clientHeight;
    const progress = maxY <= 0 ? 0 : scroller.scrollTop / maxY;
    const boosted = Math.min(1, progress * 1.45);
    const index = Math.round(boosted * (stepCount - 1));
    const maxX = (stepCount - 1) * scroller.clientWidth;

    const x =
      stepCount <= 1
        ? 0
        : (index / (stepCount - 1)) * maxX;

    return {
      x: Math.max(0, Math.min(maxX, x)),
      index,
    };
  };

  const update = (animated: boolean) => {
    const { x, index } = computeTarget();
    const nextStep = steps[index];

    track.style.transition =
      animated && !prefersReducedMotion
        ? "transform 180ms cubic-bezier(0.33, 1, 0.68, 1)"
        : "none";

    track.style.transform = `translate3d(${-x}px, 0, 0)`;

    if (nextStep) setActive(nextStep.key);
  };

  const onScroll = () => {
    if (raf) return;

    raf = window.requestAnimationFrame(() => {
      raf = 0;
      update(true);
    });
  };

  const onResize = () => update(false);

  update(false);

  scroller.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  return () => {
    scroller.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);

    if (raf) window.cancelAnimationFrame(raf);
  };
}, [steps, prefersReducedMotion]);

  const fade = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === active)
  );

  const highlights = [
    { value: "4", label: "vues clés" },
    { value: "UI", label: "comme l’app" },
    { value: "Pro", label: "pensé brigade" },
  ];

  const scrollToStep = (idx: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const stepCount = steps.length;
    const maxY = scroller.scrollHeight - scroller.clientHeight;
    const speed = 1.45;

    const targetBoosted = stepCount <= 1 ? 0 : idx / (stepCount - 1);
    const targetProgress = idx >= stepCount - 1 ? 1 : targetBoosted / speed;

    scroller.scrollTo({
      top: maxY * targetProgress,
      behavior: "smooth",
    });
  };

  return (
    <section id="decouvre-kitch-n" className="relative mt-14 sm:mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] p-5 sm:p-7 lg:p-8 shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div aria-hidden className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div aria-hidden className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 grid gap-7 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <div className={cn(ui.badge, "inline-flex")}>Découvre Kitch’n</div>

              <h2 className="mt-4 max-w-2xl text-2xl sm:text-4xl font-semibold leading-tight text-slate-100">
                De l’import à la recette partagée, tout devient fluide
              </h2>

              <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300/80 leading-relaxed">
                Une démo guidée pour montrer concrètement comment Kitch’n aide une brigade à créer, ranger, retrouver et partager ses recettes sans perdre de temps.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 max-w-xl">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3"
                  >
                    <div className="text-lg sm:text-xl font-semibold text-amber-200">
                      {item.value}
                    </div>
                    <div className="mt-0.5 text-[11px] sm:text-xs text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-2 gap-2">
              {steps.map((s, idx) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => scrollToStep(idx)}
                  className={cn(
                    "group rounded-2xl border px-3 py-3 text-left transition-all cursor-pointer",
                    active === s.key
                      ? "border-amber-300/40 bg-amber-300/10 shadow-[0_0_0_1px_rgba(251,191,36,0.12)]"
                      : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
                  )}
                  title={s.title}
                  aria-label={`Aller à l’étape ${idx + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold",
                        active === s.key
                          ? "bg-amber-300 text-slate-950"
                          : "bg-white/10 text-slate-300 group-hover:bg-white/15"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-100">
                      {s.label}
                    </span>
                  </div>
                  <div className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                    {s.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[34px] ring-1 ring-white/10 bg-white/[0.04] backdrop-blur-sm">
          <div
            aria-hidden
            className="absolute left-0 top-0 z-30 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 transition-all duration-300"
            style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ background: activeBg }}
          />

          <div className="absolute inset-0 bg-[#0B1224]/60" aria-hidden />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0B1224] to-transparent z-20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0B1224] to-transparent z-20" />

          <div
            ref={scrollerRef}
            className={cn(
              "relative z-10 max-h-[78vh] overflow-y-auto no-scrollbar",
              "scroll-smooth"
            )}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="relative" style={{ height: `${steps.length * 45}vh` }}>
              <div className="sticky top-0 h-[78vh] overflow-hidden">
                <div
                  ref={trackRef}
                  className="h-full flex will-change-transform"
                  style={{ width: `${steps.length * 100}%` }}
                >
                  {steps.map((s, idx) => {
                    const demoSideRight = s.align === "right";
                    const isActive = active === s.key;

                    return (
                      <div
                        key={s.key}                        
                        className="h-full flex-shrink-0 px-4 sm:px-8 py-10 sm:py-14 flex items-center"
                        style={{ width: `${100 / steps.length}%` }}
                      >
                        <div
                          className={cn(
                            "w-full grid gap-8 lg:gap-12 items-center",
                            "lg:grid-cols-2"
                          )}
                        >
                          <motion.div
                            variants={fade}
                            initial="hidden"
                            animate="show"
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.6,
                              delay: prefersReducedMotion ? 0 : 0.05,
                            }}
                            className={cn(
                              demoSideRight ? "lg:order-1" : "lg:order-2",
                              "max-w-xl"
                            )}
                          >
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                              Étape {idx + 1} · {s.label}
                            </div>

                            <div className="mt-4 text-3xl sm:text-4xl font-semibold text-slate-100 leading-tight">
                              {s.title}
                            </div>

                            <div className="mt-4 text-lg text-slate-300/85 leading-relaxed">
                              {s.body}
                            </div>

                            <ul className="mt-6 space-y-2">
                              {s.bullets.map((b) => (
                                <li
                                  key={b}
                                  className="flex items-center gap-3 text-slate-200/90"
                                >
                                  <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-sm text-slate-400 ring-1 ring-white/10">
                              <span className="text-amber-300">{isActive ? "Actif" : "Démo"}</span>
                              <span>Scroll ou clique sur une étape</span>
                            </div>
                          </motion.div>

                          <motion.div
                            variants={fade}
                            initial="hidden"
                            animate="show"
                            transition={{
                              duration: prefersReducedMotion ? 0 : 0.6,
                              delay: prefersReducedMotion ? 0 : 0.12,
                            }}
                            className={cn(
                              demoSideRight ? "lg:order-2" : "lg:order-1"
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-[34px] overflow-hidden",
                                "shadow-[0_28px_120px_rgba(0,0,0,0.55)]",
                                "ring-1 ring-white/10",
                                "bg-[#071126]/55 backdrop-blur-sm",
                                "p-3 sm:p-4",
                                "w-full max-w-[560px] mx-auto"
                              )}
                            >
                              

                              <div className="h-[420px] sm:h-[540px] lg:h-[365px] overflow-hidden rounded-[24px] ring-1 ring-white/10">
                                <div className="min-w-[1100px]">
                                  <AutoFitDemo
                                    variant="desktop"
                                    baseWidth={950}
                                    baseHeight={1500}
                                    padding={8}
                                    className="h-[520px] sm:h-[620px] lg:h-[720px] overflow-hidden"
                                  >
                                    {s.demo}
                                  </AutoFitDemo>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}