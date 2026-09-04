import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";
import { cn } from "../../utils/cn";
import { AnimatedSection } from "./AnimatedSection";

import { MOBILE_SHOWCASE_STEPS as steps } from "../../features/landing/config/showcaseSteps";
import { AutoFitDemo } from "../../features/landing/components/AutoFitDemo";



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

  const fade = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
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
                    Étape {idx + 1} · {s.label}
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
                      <AutoFitDemo
                        variant="mobile"
                        baseWidth={s.demoBaseWidth ?? 390}
                        baseHeight={s.demoBaseHeight ?? 980}
                        padding={6}
                        offsetY={s.demoOffsetY ?? 0}
                        maxScale={s.demoMaxScale ?? 1}
                        cropTop={0}
                        className="h-full w-full overflow-hidden"
                      >
                        {s.demo}
                      </AutoFitDemo>
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
