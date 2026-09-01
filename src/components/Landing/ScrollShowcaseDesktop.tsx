import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";
import { cn } from "../../utils/cn";

import { WorkGroupsDemoPanel } from "../Groups/";
import { RecipeImportAIDemoPanel } from "../Import/";
import { SharedRecipesDemoPanel } from "../Sharing/";

import {
  RecipeListDemoPanel,
  RecipeDisplayDemo,
} from "../Recipe";

type StepKey = "recipes" | "groups" | "import" | "share";

type Step = {
  key: StepKey;
  title: string;
  body: string;
  bullets: string[];
  align: "left" | "right";
  demo: ReactNode;
  bg: string;
};

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

function DemoCursor({
  x,
  y,
  click = false,
  visible = true,
}: {
  x: number;
  y: number;
  click?: boolean;
  visible?: boolean;
}) {
  return (
    <motion.div
      animate={{
        x,
        y,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 24,
        mass: 0.7,
      }}
      className="absolute z-[80] pointer-events-none"
    >
      <motion.div
        animate={{ scale: click ? 0.92 : 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="relative"
      >
        {/* ombre légère */}
        <div className="absolute left-[2px] top-[2px]">
          <svg
            width="18"
            height="24"
            viewBox="0 0 18 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-25"
          >
            <path
              d="M2.2 1.5L15.7 13.7L9.4 14.2L12.5 21.4L9.7 22.5L6.7 15.4L2.4 19V1.5Z"
              fill="black"
            />
          </svg>
        </div>

        {/* curseur principal */}
        <svg
          width="18"
          height="24"
          viewBox="0 0 18 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative"
        >
          <path
            d="M1.5 1L15.5 13.5L9.1 14L12.2 21.3L9.3 22.4L6.3 15.2L2 18.8V1Z"
            fill="white"
            stroke="#111827"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>

        {/* petit ripple au clic */}
        <motion.div
          animate={
            click
              ? { scale: 1.8, opacity: 0 }
              : { scale: 1, opacity: 0 }
          }
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute left-[-2px] top-[-2px] h-6 w-6 rounded-full border border-white/60"
        />
      </motion.div>
    </motion.div>
  );
}

function RecipeStepDemoInteractive() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("demo-1");
  const [demoTick, setDemoTick] = useState(0);

  const [cursor, setCursor] = useState({
    x: 120,
    y: 120,
    click: false,
    visible: true,
  });

  useEffect(() => {
    let cancelled = false;
    let timers: number[] = [];

    const push = (delay: number, fn: () => void) => {
      const id = window.setTimeout(() => {
        if (cancelled) return;
        fn();
      }, delay);
      timers.push(id);
    };

    const runSequence = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];

      // reset soft
      push(0, () => {
        setView("list");
        setSelectedRecipeId("demo-1");
        setCursor({
          x: 120,
          y: 92,
          click: false,
          visible: true,
        });
      });

      // move to recipe 1
      push(350, () => {
        setCursor({
          x: 405,
          y: 188,
          click: false,
          visible: true,
        });
      });

      // click recipe 1
      push(980, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(1120, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // open recipe 1
      push(1250, () => {
        setSelectedRecipeId("demo-1");
        setView("detail");
        setDemoTick((t) => t + 1);
      });

      // cursor disappears a bit during detail reveal
      push(1500, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });

      // cursor reappears in detail near produit en croix
      push(2850, () => {
        setCursor({
          x: 175,
          y: 248,
          click: false,
          visible: true,
        });
      });

      // click in produit en croix area
      push(3300, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(3450, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // back to list with recipe 2
      push(5600, () => {
        setSelectedRecipeId("demo-2");
        setView("list");
        setCursor({
          x: 120,
          y: 92,
          click: false,
          visible: true,
        });
      });

      // move to recipe 2
      push(6100, () => {
        setCursor({
          x: 405,
          y: 245,
          click: false,
          visible: true,
        });
      });

      // click recipe 2
      push(6750, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(6900, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // open recipe 2
      push(7050, () => {
        setSelectedRecipeId("demo-2");
        setView("detail");
        setDemoTick((t) => t + 1);
      });

      // hide a little
      push(7300, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });

      // show in detail again
      push(8600, () => {
        setCursor({
          x: 175,
          y: 248,
          click: false,
          visible: true,
        });
      });

      push(9050, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(9200, () => {
        setCursor((c) => ({ ...c, click: false }));
      });
    };

    runSequence();

    const loop = window.setInterval(() => {
      runSequence();
    }, 11200);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      window.clearInterval(loop);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0.96, scale: 0.992 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-white/10 bg-white/[0.02]"
    >
      <DemoCursor
        x={cursor.x}
        y={cursor.y}
        click={cursor.click}
        visible={cursor.visible}
      />

      {/* LIST */}
      <motion.div
        initial={false}
        animate={view === "list" ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            x: 0,
            scale: 1,
            pointerEvents: "auto" as const,
          },
          closed: {
            opacity: 0,
            x: -18,
            scale: 0.985,
            pointerEvents: "none" as const,
          },
        }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="absolute inset-0 z-10"
      >
        <RecipeListDemoPanel
          onCreateNew={() => {}}
          onOpenRecipe={(id) => {
            setSelectedRecipeId(id);
            setView("detail");
            setDemoTick((t) => t + 1);
          }}
          autoDemo
          highlightedRecipeId={selectedRecipeId}
        />
      </motion.div>

      {/* DETAIL */}
      <motion.div
        initial={false}
        animate={view === "detail" ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            x: 0,
            scale: 1,
            pointerEvents: "auto" as const,
          },
          closed: {
            opacity: 0,
            x: 18,
            scale: 0.985,
            pointerEvents: "none" as const,
          },
        }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="absolute inset-0 z-20"
      >
        <RecipeDisplayDemo
          recipeId={selectedRecipeId}
          onBack={() => setView("list")}
          autoDemo
          demoKey={demoTick}
        />
      </motion.div>
    </motion.div>
  );
}

export function ScrollShowcase() {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<StepKey>("recipes");

  const steps: Step[] = useMemo(
    () => [
      {
        key: "recipes",
        title: "Retrouve une recette en quelques secondes",
        body: "Toutes tes recettes restent propres, rangées et prêtes pour le service, même quand la carte change.",
        bullets: ["Recherche rapide", "Dossiers & favoris", "Vue recette lisible"],
        align: "left",
        demo: <RecipeStepDemoInteractive />,
        bg: "radial-gradient(1200px 600px at 20% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%)",
      },
      {
        key: "groups",
        title: "Partage le bon contenu à la bonne équipe",
        body: "Crée des groupes par restaurant ou par poste, puis donne accès uniquement aux recettes utiles.",
        bullets: ["Invitations par mail", "Rôles de brigade", "Groupes sécurisés"],
        align: "right",
        demo: <WorkGroupsDemoPanel />,
        bg: "radial-gradient(1100px 600px at 75% 35%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 25% 20%, rgba(59,130,246,0.16), transparent 60%)",
      },
      {
        key: "import",
        title: "Transforme tes fichiers en fiches propres",
        body: "Copie un texte ou dépose un PDF/Word : l’import IA remet la recette au format Kitch’n.",
        bullets: ["PDF / Word / texte", "Sections automatiques", "Recette prête à corriger"],
        align: "left",
        demo: <RecipeImportAIDemoPanel />,
        bg: "radial-gradient(1100px 650px at 20% 35%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 20%, rgba(59,130,246,0.14), transparent 60%)",
      },
      {
        key: "share",
        title: "Travaille sans mélanger les recettes",
        body: "Les recettes partagées restent rangées par groupe, avec une lecture rapide sur mobile ou desktop.",
        bullets: ["Dossiers partagés", "Accès contrôlé", "Lecture claire"],
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
      const next =
        stepCount <= 1 ? 0 : (snappedIndex / (stepCount - 1)) * maxX;

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

  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === active)
  );

  const stepLabels: Record<StepKey, string> = {
    recipes: "Recettes",
    groups: "Équipe",
    import: "Import IA",
    share: "Partage",
  };

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
                      {stepLabels[s.key]}
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
                              Étape {idx + 1} · {stepLabels[s.key]}
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
