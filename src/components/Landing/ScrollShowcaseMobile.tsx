import React, { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ui } from "../../styles/ui";
import { AnimatedSection } from "./AnimatedSection";

import { WorkGroupsDemoPanel } from "../Groups/";
import { RecipeImportAIDemoPanel } from "../Import/";
import { SharedRecipesDemoPanel } from "../Sharing/";
import { RecipeListDemoPanel, RecipeEditorDemoPanel, RecipeDisplayDemo } from "../Recipe";

type StepKey = "recipes" | "groups" | "import" | "share";

type Step = {
  key: StepKey;
  title: string;
  body: string;
  bullets: string[];
  demo: React.ReactNode;
  bg: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function RecipeStepDemoInteractiveMobile() {
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
        <RecipeDisplayDemo recipeId={selectedRecipeId} onBack={() => setView("list")} />
      </motion.div>
    </div>
  );
}

export function ScrollShowcaseMobile() {
  const prefersReducedMotion = useReducedMotion();

  const steps: Step[] = useMemo(
    () => [
      {
        key: "recipes",
        title: "Tes recettes, toujours propres",
        body: "Une liste claire, rapide à filtrer, pensée pour le service.",
        bullets: ["Dossiers & favoris", "Recherche immédiate", "Actions simples"],
        demo: <RecipeStepDemoInteractiveMobile />,
        bg: "radial-gradient(900px 520px at 20% 20%, rgba(251,191,36,0.16), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.16), transparent 60%)",
      },
      {
        key: "groups",
        title: "Travaille en équipe",
        body: "Crée des groupes et partage uniquement ce qui doit l’être.",
        bullets: ["Groupes par poste", "Membres invités", "Partage contrôlé"],
        demo: <WorkGroupsDemoPanel />,
        bg: "radial-gradient(900px 520px at 75% 25%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 20% 10%, rgba(59,130,246,0.14), transparent 60%)",
      },
      {
        key: "import",
        title: "Import intelligent",
        body: "Dépose un fichier. Kitch’n le transforme en recette structurée.",
        bullets: ["PDF / Word / Texte", "Sections automatiques", "File d’attente"],
        demo: <RecipeImportAIDemoPanel />,
        bg: "radial-gradient(900px 520px at 20% 25%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.14), transparent 60%)",
      },
      {
        key: "share",
        title: "Partager sans confusion",
        body: "Tu vois les recettes seulement via tes groupes de travail.",
        bullets: ["Dossiers par groupe", "Recettes visibles", "Lecture rapide"],
        demo: <SharedRecipesDemoPanel />,
        bg: "radial-gradient(900px 520px at 75% 25%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 520px at 25% 15%, rgba(251,191,36,0.10), transparent 60%)",
      },
    ],
    []
  );

  const fade = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
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
              Fais défiler pour voir chaque page, exactement comme dans le site.
            </p>
          </div>
        </div>

        {/* Steps (vertical) */}
        <div className="mt-8 space-y-10 sm:space-y-14">
          {steps.map((s, idx) => (
            <AnimatedSection
              key={s.key}
              direction="none"
              className="relative overflow-hidden rounded-[28px] ring-1 ring-white/10 bg-white/[0.04] backdrop-blur-sm"
            >
              {/* fond step */}
              <div aria-hidden className="absolute inset-0" style={{ background: s.bg }} />
              <div aria-hidden className="absolute inset-0 bg-[#0B1224]/60" />

              <div className="relative z-10 p-5 sm:p-7">
                {/* Text */}
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
                  <div className="text-xs tracking-widest uppercase text-slate-400">
                    Étape {idx + 1} / {steps.length}
                  </div>

                  <div className="mt-2 text-2xl sm:text-3xl font-semibold text-slate-100 leading-tight">
                    {s.title}
                  </div>

                  <div className="mt-3 text-base sm:text-lg text-slate-300/85 leading-relaxed">
                    {s.body}
                  </div>

                  <ul className="mt-5 space-y-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-slate-200/90">
                        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Demo */}
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
                  className={cn(
                    "mt-6 rounded-[26px] overflow-hidden",
                    "shadow-[0_24px_90px_rgba(0,0,0,0.55)]",
                    "ring-1 ring-white/10",
                    "bg-white/[0.02] backdrop-blur-sm"
                  )}
                >
                  {/* 
                    IMPORTANT:
                    - Sur mobile, on ne force pas de min-w.
                    - On donne juste une hauteur confortable.
                    - Les démos restent identiques.
                  */}
                  <div className="h-[520px] sm:h-[640px] overflow-hidden">
                    {s.demo}
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
