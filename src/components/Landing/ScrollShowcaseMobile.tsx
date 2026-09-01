import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";
import { cn } from "../../utils/cn";
import { AnimatedSection } from "./AnimatedSection";

import { WorkGroupsDemoPanel } from "../Groups/";
import { RecipeImportAIDemoPanel } from "../Import/";
import { SharedRecipesDemoPanel } from "../Sharing/";
import { RecipeListDemoPanel, RecipeDisplayDemo } from "../Recipe";

type StepKey = "recipes" | "groups" | "import" | "share";

type Step = {
  key: StepKey;
  title: string;
  body: string;
  bullets: string[];
  demo: ReactNode;
  bg: string;
  demoBaseWidth?: number;
  demoBaseHeight?: number;
  demoHeightClass?: string;
  demoOffsetY?: number;
  demoMaxScale?: number;
};

function AutoFitDemoMobile({
  children,
  className,
  baseWidth = 390,
  baseHeight = 980,
  padding = 0,
  offsetY = 0,
  maxScale = 1,
  cropTop = 24,
}: {
  children: ReactNode;
  className?: string;
  baseWidth?: number;
  baseHeight?: number;
  padding?: number;
  offsetY?: number;
  maxScale?: number;
  cropTop?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const w = Math.max(1, el.clientWidth - padding * 2);
      const h = Math.max(1, el.clientHeight - padding * 2);

      const widthScale = w / baseWidth;
      const heightScale = h / baseHeight;
      const next = Math.min(widthScale, heightScale, maxScale);

      setScale(Number.isFinite(next) ? next : 1);
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [baseWidth, baseHeight, padding, maxScale]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <div
        className="absolute inset-0 flex justify-center"
        style={{
          paddingTop: Math.max(0, padding + offsetY - cropTop),
          paddingBottom: padding,
          paddingLeft: padding,
          paddingRight: padding,
        }}
      >
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            willChange: "transform",
          }}
        >
          <div style={{ width: baseWidth, height: baseHeight }}>{children}</div>
        </div>
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
        stiffness: 240,
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

        <motion.div
          animate={
            click ? { scale: 1.8, opacity: 0 } : { scale: 1, opacity: 0 }
          }
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="absolute left-[-2px] top-[-2px] h-6 w-6 rounded-full border border-white/60"
        />
      </motion.div>
    </motion.div>
  );
}

function RecipeStepDemoInteractiveMobile() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("demo-1");
  const [demoTick, setDemoTick] = useState(0);

  const [cursor, setCursor] = useState({
    x: 140,
    y: 220,
    click: false,
    visible: false,
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

      // Reset list
      push(0, () => {
        setView("list");
        setSelectedRecipeId("demo-1");
        setDemoTick((t) => t + 1);
        setCursor({
          x: 150,
          y: 290,
          click: false,
          visible: false,
        });
      });

      // Cursor appears on first recipe
      push(500, () => {
        setCursor({
          x: 248,
          y: 468,
          click: false,
          visible: true,
        });
      });

      // Click first recipe
      push(1150, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(1300, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // Open first detail
      push(1420, () => {
        setSelectedRecipeId("demo-1");
        setView("detail");
        setDemoTick((t) => t + 1);
      });

      push(1600, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });

      // Back button area
      push(3350, () => {
        setCursor({
          x: 96,
          y: 150,
          click: false,
          visible: true,
        });
      });

      push(3900, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(4040, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // Return to list
      push(4170, () => {
        setView("list");
        setSelectedRecipeId("demo-2");
      });

      push(4360, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });

      // Cursor appears on second recipe
      push(4950, () => {
        setCursor({
          x: 248,
          y: 596,
          click: false,
          visible: true,
        });
      });

      // Click second recipe
      push(5600, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(5740, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      // Open second detail
      push(5880, () => {
        setSelectedRecipeId("demo-2");
        setView("detail");
        setDemoTick((t) => t + 1);
      });

      push(6080, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });

      // Small cursor life on accordion area
      push(7600, () => {
        setCursor({
          x: 312,
          y: 265,
          click: false,
          visible: true,
        });
      });

      push(8100, () => {
        setCursor((c) => ({ ...c, click: true }));
      });

      push(8240, () => {
        setCursor((c) => ({ ...c, click: false }));
      });

      push(8600, () => {
        setCursor((c) => ({ ...c, visible: false }));
      });
    };

    runSequence();

    const loop = window.setInterval(() => {
      runSequence();
    }, 9800);

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
      transition={{ duration: 0.45, ease: "easeOut" }}
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
            pointerEvents: "auto" as const,
          },
          closed: {
            opacity: 0,
            x: -24,
            pointerEvents: "none" as const,
          },
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
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
            pointerEvents: "auto" as const,
          },
          closed: {
            opacity: 0,
            x: 24,
            pointerEvents: "none" as const,
          },
        }}
        transition={{ duration: 0.28, ease: "easeInOut" }}
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

function MobilePhoneFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex justify-center items-center py-4", className)}>
      
      {/* GLOW BACKGROUND (important pour effet premium) */}
      <div className="absolute h-[420px] w-[260px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative w-[290px] h-[592px] rounded-[42px] bg-[#171717] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">

        {/* contour fin (moins épais) */}
        <div className="absolute inset-[3px] rounded-[39px] border border-white/[0.08] pointer-events-none" />

        {/* dynamic island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 h-[26px] w-[100px] rounded-full bg-black" />

        {/* boutons (plus discrets) */}
        <div className="absolute left-[-1px] top-[120px] h-[30px] w-[2px] rounded-full bg-white/20" />
        <div className="absolute right-[-1px] top-[110px] h-[50px] w-[2px] rounded-full bg-white/20" />
        <div className="absolute right-[-1px] top-[170px] h-[50px] w-[2px] rounded-full bg-white/20" />

        {/* SCREEN (IMPORTANT) */}
        <div className="absolute inset-[7px] rounded-[34px] overflow-hidden bg-[#0B1538]">
          
          {/* wrapper pour CLIPPER le curseur */}
          <div className="relative h-full w-full overflow-hidden">
            {children}
          </div>

        </div>

        {/* reflet léger */}
        <div className="pointer-events-none absolute inset-0 rounded-[42px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
      </div>
    </div>
  );
}
export function ScrollShowcaseMobile() {
  const prefersReducedMotion = useReducedMotion();

  const steps: Step[] = useMemo(
    () => [
     {
  key: "recipes",
  title: "Retrouve une recette en quelques secondes",
  body: "Une liste claire, rapide à filtrer, pensée pour le service et les changements de carte.",
  bullets: ["Recherche rapide", "Dossiers & favoris", "Vue recette lisible"],
  demo: <RecipeStepDemoInteractiveMobile />,
  bg: "radial-gradient(900px 520px at 20% 20%, rgba(251,191,36,0.16), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.16), transparent 60%)",
  demoBaseWidth: 390,
  demoBaseHeight: 980,
  demoHeightClass: "h-[760px] sm:h-[840px]",
  demoOffsetY: -6,
  demoMaxScale: 1,
},
      {
        key: "groups",
        title: "Partage le bon contenu à la bonne équipe",
        body: "Crée des groupes par restaurant ou par poste, puis donne accès uniquement aux recettes utiles.",
        bullets: ["Invitations par mail", "Rôles de brigade", "Groupes sécurisés"],
        demo: <WorkGroupsDemoPanel />,
        bg: "radial-gradient(900px 520px at 75% 25%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 20% 10%, rgba(59,130,246,0.14), transparent 60%)",
        demoBaseWidth: 430,
        demoBaseHeight: 760,
        demoHeightClass: "h-[560px] sm:h-[620px]",
        demoOffsetY: -18,
        demoMaxScale: 1.18,
      },
      {
        key: "import",
        title: "Transforme tes fichiers en fiches propres",
        body: "Copie un texte ou dépose un PDF/Word : l’import IA remet la recette au format Kitch’n.",
        bullets: ["PDF / Word / texte", "Sections automatiques", "Recette prête à corriger"],
        demo: <RecipeImportAIDemoPanel />,
        bg: "radial-gradient(900px 520px at 20% 25%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.14), transparent 60%)",
        demoBaseWidth: 430,
        demoBaseHeight: 1060,
        demoHeightClass: "h-[760px] sm:h-[840px]",
        demoOffsetY: -24,
        demoMaxScale: 1.24,
      },
      {
        key: "share",
        title: "Travaille sans mélanger les recettes",
        body: "Les recettes partagées restent rangées par groupe, avec une lecture rapide sur mobile ou desktop.",
        bullets: ["Dossiers partagés", "Accès contrôlé", "Lecture claire"],
        demo: <SharedRecipesDemoPanel />,
        bg: "radial-gradient(900px 520px at 75% 25%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 520px at 25% 15%, rgba(251,191,36,0.10), transparent 60%)",
        demoBaseWidth: 430,
        demoBaseHeight: 940,
        demoHeightClass: "h-[640px] sm:h-[720px]",
        demoOffsetY: -16,
        demoMaxScale: 1.2,
      },
    ],
    []
  );

  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  const stepLabels: Record<StepKey, string> = {
    recipes: "Recettes",
    groups: "Équipe",
    import: "Import IA",
    share: "Partage",
  };

  const highlights = [
    "Démo réelle",
    "Pensé service",
    "Mobile first",
    "Brigade prête",
  ];

  return (
    <section id="decouvre-kitch-n" className="relative mt-14 sm:mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div aria-hidden className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-amber-400/10 blur-3xl" />
          <div aria-hidden className="absolute -right-20 top-8 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className={cn(ui.badge, "inline-flex")}>Découvre Kitch’n</div>

            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold leading-tight text-slate-100">
              De l’import à la recette partagée, tout devient fluide
            </h2>

            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300/80">
              Fais défiler la démo pour voir comment Kitch’n aide une brigade à créer, ranger, retrouver et partager ses recettes.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-10 sm:space-y-14">
          {steps.map((s, idx) => (
            <AnimatedSection
              key={s.key}
              direction="none"
className={cn(
  "mt-6 rounded-[28px] overflow-hidden relative",
  "bg-white/[0.035]",
  "shadow-[0_26px_100px_rgba(0,0,0,0.55)]",
  "ring-1 ring-white/10"
)}            >
              <div
                aria-hidden
                className="absolute left-0 top-0 z-20 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200"
                style={{ width: `${((idx + 1) / steps.length) * 100}%` }}
              />

              <div
                aria-hidden
                className="absolute inset-0"
                style={{ background: s.bg }}
              />
              <div aria-hidden className="absolute inset-0 bg-[#0B1224]/60" />

              <div className="relative z-10 p-5 sm:p-7">
                <motion.div
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.55,
                    ease: "easeOut",
                  }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                    Étape {idx + 1} · {stepLabels[s.key]}
                  </div>

                  <div className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-100 leading-tight">
                    {s.title}
                  </div>

                  <div className="mt-3 text-base sm:text-lg text-slate-300/85 leading-relaxed">
                    {s.body}
                  </div>

                  <ul className="mt-5 grid gap-2">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.035] px-3 py-2 text-sm text-slate-200/90 ring-1 ring-white/10"
                      >
                        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  variants={fade}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.55,
                    ease: "easeOut",
                    delay: prefersReducedMotion ? 0 : 0.06,
                  }}
                  className="mt-6 relative"
                >
                  <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.10),transparent_65%)] blur-2xl" />

                  <div className="mb-3 flex items-center justify-between px-1 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                      Démo mobile
                    </span>
                    <span>{idx + 1}/{steps.length}</span>
                  </div>

                  <MobilePhoneFrame>
                    <div className="relative h-full w-full">
                      <AutoFitDemoMobile
                        baseWidth={s.demoBaseWidth ?? 390}
                        baseHeight={s.demoBaseHeight ?? 980}
                        padding={6}
                        offsetY={s.demoOffsetY ?? 0}
                        maxScale={s.demoMaxScale ?? 1}
                        cropTop={0}
                        className="h-full w-full overflow-hidden"
                      >
                        {s.demo}
                      </AutoFitDemoMobile>
                    </div>
                  </MobilePhoneFrame>
                </motion.div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
