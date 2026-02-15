import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";

import { WorkGroupsDemoPanel } from "../Groups/";
import { RecipeImportAIDemoPanel } from "../Import/";
import { SharedRecipesDemoPanel } from "../Sharing/";

import {
  RecipeListDemoPanel,
  RecipeEditorDemoPanel,
  RecipeDisplayDemo,
} from "../Recipe";

type StepKey = "recipes" | "groups" | "import" | "share";

type Step = {
  key: StepKey;
  title: string;
  body: string;
  bullets: string[];
  align: "left" | "right";
  demo: React.ReactNode;
  bg: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function AutoFitDemo({
  children,
  className,
  baseWidth = 950,
  baseHeight = 1500,
  padding = 8,
}: {
  children: ReactNode;
  className?: string;
  baseWidth?: number;
  baseHeight?: number;
  padding?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = Math.max(1, el.clientWidth - padding * 2);
      const h = Math.max(1, el.clientHeight - padding * 2);
      const s = Math.min(w / baseWidth, h / baseHeight, 1);
      setScale(Number.isFinite(s) ? s : 1);
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [baseWidth, baseHeight, padding]);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `translate(${padding}px, ${padding}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div style={{ width: baseWidth, height: baseHeight }}>{children}</div>
      </div>
    </div>
  );
}

function RecipeStepDemoInteractive() {
  const [view, setView] = useState<"list" | "editor" | "detail">("list");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("demo-1");

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-white/10 bg-white/[0.02]">
      {/* LIST */}
      <motion.div
        initial={false}
        animate={view === "list" ? "open" : "closed"}
        variants={{
          open: { opacity: 1, x: 0, pointerEvents: "auto" as any },
          closed: { opacity: 0, x: -24, pointerEvents: "none" as any },
        }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 z-10"
      >
        <RecipeListDemoPanel
          onCreateNew={() => setView("editor")}
          onOpenRecipe={(id) => {
            setSelectedRecipeId(id);
            setView("detail");
          }}
        />
      </motion.div>

      {/* EDITOR */}
      <motion.div
        initial={false}
        animate={view === "editor" ? "open" : "closed"}
        variants={{
          open: { opacity: 1, x: 0, pointerEvents: "auto" as any },
          closed: { opacity: 0, x: 24, pointerEvents: "none" as any },
        }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 z-20"
      >
        <RecipeEditorDemoPanel onBack={() => setView("list")} />
      </motion.div>

      {/* DETAIL */}
      <motion.div
        initial={false}
        animate={view === "detail" ? "open" : "closed"}
        variants={{
          open: { opacity: 1, x: 0, pointerEvents: "auto" as any },
          closed: { opacity: 0, x: 24, pointerEvents: "none" as any },
        }}
        transition={{ duration: 0.22 }}
        className="absolute inset-0 z-30"
      >
        <RecipeDisplayDemo
          recipeId={selectedRecipeId}
          onBack={() => setView("list")}
        />
      </motion.div>
    </div>
  );
}

export function ScrollShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<StepKey>("recipes");

  const steps: Step[] = useMemo(
    () => [
      {
        key: "recipes",
        title: "Tes recettes, toujours propres",
        body: "Une liste claire, rapide à filtrer, pensée pour le service.",
        bullets: ["Dossiers & favoris", "Recherche immédiate", "Actions simples"],
        align: "left",
        demo: <RecipeStepDemoInteractive />,
        bg: "radial-gradient(1200px 600px at 20% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%)",
      },
      {
        key: "groups",
        title: "Travaille en équipe",
        body: "Crée des groupes et partage uniquement ce qui doit l’être.",
        bullets: ["Groupes par poste", "Membres invités", "Partage contrôlé"],
        align: "right",
        demo: <WorkGroupsDemoPanel />,
        bg: "radial-gradient(1100px 600px at 75% 35%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 25% 20%, rgba(59,130,246,0.16), transparent 60%)",
      },
      {
        key: "import",
        title: "Import intelligent",
        body: "Dépose un fichier. Kitch’n le transforme en recette structurée.",
        bullets: ["PDF / Word / Texte", "Sections automatiques", "File d’attente"],
        align: "left",
        demo: <RecipeImportAIDemoPanel />,
        bg: "radial-gradient(1100px 650px at 20% 35%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 20%, rgba(59,130,246,0.14), transparent 60%)",
      },
      {
        key: "share",
        title: "Partager sans confusion",
        body: "Tu vois les recettes seulement via tes groupes de travail.",
        bullets: ["Dossiers par groupe", "Recettes visibles", "Lecture rapide"],
        align: "right",
        demo: <SharedRecipesDemoPanel />,
        bg: "radial-gradient(1100px 650px at 75% 35%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 520px at 25% 25%, rgba(251,191,36,0.10), transparent 60%)",
      },
    ],
    []
  );

  const activeBg = useMemo(() => {
    return steps.find((s) => s.key === active)?.bg ?? "transparent";
  }, [steps, active]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const nodes = steps
      .map((s) => slideRefs.current[s.key])
      .filter(Boolean) as HTMLElement[];

    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          )[0];

        const key = visible?.target?.getAttribute("data-step") as StepKey | null;
        if (key) setActive(key);
      },
      {
        root,
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0.15, 0.35, 0.55, 0.75],
      }
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [steps]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    let raf = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    let currentX = 0;
    let targetX = 0;
    let animating = false;

    const stepCount = steps.length;

    const computeTargetX = () => {
      const maxY = scroller.scrollHeight - scroller.clientHeight;

      const speed = 1.45;

      const progress = maxY <= 0 ? 0 : scroller.scrollTop / maxY;
      const boosted = Math.min(1, progress * speed);
      const raw = boosted * (stepCount - 1);

      const snappedIndex = Math.round(raw);

      const maxX = (stepCount - 1) * scroller.clientWidth;
      const next = stepCount <= 1 ? 0 : (snappedIndex / (stepCount - 1)) * maxX;

      return Math.max(0, Math.min(maxX, next));
    };

    const apply = (x: number) => {
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    };

    const animateTo = (to: number) => {
      if (prefersReducedMotion) {
        currentX = to;
        targetX = to;
        apply(currentX);
        return;
      }

      targetX = to;
      if (animating) return;
      animating = true;

      const from = currentX;
      const duration = 180;
      const start = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = easeOutCubic(t);
        currentX = from + (targetX - from) * eased;
        apply(currentX);

        if (t < 1) requestAnimationFrame(tick);
        else {
          animating = false;
          currentX = targetX;
          apply(currentX);
        }
      };

      requestAnimationFrame(tick);
    };

    const update = () => {
      raf = 0;
      animateTo(computeTargetX());
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    const onResize = () => {
      const to = computeTargetX();
      currentX = to;
      targetX = to;
      apply(currentX);
    };

    onResize();

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [steps.length, prefersReducedMotion]);

  const fade = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <section className="mt-14 sm:mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className={cn(ui.badge, "inline-flex")}>Découvre Kitch’n</div>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-100">
              Une expérience claire, étape par étape
            </h2>
            <p className="mt-2 text-slate-300/80">
              Scroll pour voir chaque page, exactement comme dans le site.
            </p>
          </div>

          {/* Mini progress */}
          <div className="hidden lg:flex items-center gap-2">
            {steps.map((s, idx) => (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  const scroller = scrollerRef.current;
                  if (!scroller) return;

                  const stepCount = steps.length;
                  const maxY = scroller.scrollHeight - scroller.clientHeight;

                  const speed = 1.45;

                  const targetBoosted =
                    stepCount <= 1 ? 0 : idx / (stepCount - 1);

                  const targetProgress =
                    idx >= stepCount - 1 ? 1 : targetBoosted / speed;

                  scroller.scrollTo({
                    top: maxY * targetProgress,
                    behavior: "smooth",
                  });
                }}
                className={cn(
                  "h-2 rounded-full transition-all cursor-pointer",
                  active === s.key
                    ? "w-10 bg-amber-400/80"
                    : "w-8 bg-white/10 hover:bg-white/25"
                )}
                title={s.title}
                aria-label={`Aller à l’étape ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Section démo + fond dynamique */}
        <div className="relative mt-10 overflow-hidden rounded-[34px] ring-1 ring-white/10 bg-white/[0.04] backdrop-blur-sm">
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
                        data-step={s.key}
                        ref={(el) => {
                          slideRefs.current[s.key] = el;
                        }}
                        className="h-full flex-shrink-0 px-4 sm:px-8 py-10 sm:py-14 flex items-center"
                        style={{ width: `${100 / steps.length}%` }}
                      >
                        <div
                          className={cn(
                            "w-full grid gap-8 lg:gap-12 items-center",
                            "lg:grid-cols-2"
                          )}
                        >
                          {/* TEXT */}
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
                            <div className="text-xs tracking-widest uppercase text-slate-400">
                              Étape {idx + 1} / {steps.length}
                            </div>

                            <div className="mt-3 text-3xl sm:text-4xl font-semibold text-slate-100 leading-tight">
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

                            <div className="mt-8 text-sm text-slate-400">
                              {isActive ? "➡️ Scroll pour l’étape suivante" : " "}
                            </div>
                          </motion.div>

                          {/* DEMO */}
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
                                "bg-white/[0.02] backdrop-blur-sm",
                                "p-3 sm:p-4",
                                "w-full max-w-[560px] mx-auto"
                              )}
                            >
                              <div className="h-[420px] sm:h-[540px] lg:h-[365px] overflow-hidden">
                                <div className="min-w-[1100px]">
                                  <AutoFitDemo
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

/**
 * ✅ Export attendu par LandingPage.tsx :
 * import { ScrollShowcaseDesktop } from "./ScrollShowcaseDesktop";
 */
export { ScrollShowcase as ScrollShowcaseDesktop };
