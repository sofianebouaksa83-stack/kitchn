import React from "react";
import { motion } from "framer-motion";
import { ui } from "../../styles/ui";

// Scroll showcase (1 par 1 au scroll)
import { ScrollShowcaseMobile } from "./ScrollShowcaseMobile";
import { ScrollShowcaseDesktop } from "./ScrollShowcaseDesktop";


function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type LandingPageProps = {
  brand?: React.ReactNode;
  onStart: () => void;
  onLogin: () => void;
};

export function LandingPage({ brand = <img
                src="/Logo_kitchn_horizontal.svg"
                alt="KITCH'N"
                className="h-11 sm:h-12 w-auto select-none"
                draggable={false}
              />, onStart, onLogin }: LandingPageProps) {
  const fadeUp = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <div className={cn(ui.pageBg, "relative  text-slate-100")}>
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-24 right-[-140px] h-[480px] w-[480px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 sm:pt-24 pb-10">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">{brand}</div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onLogin} className={cn(ui.btnGhost, "h-10 px-4")}>
              Se connecter
            </button>
            <button onClick={onStart} className={cn(ui.btnPrimary, "h-10 px-4")}>
              Commencer
            </button>
          </div>
        </div>

        {/* HERO TEXT ONLY */}
          <div className="mt-24 max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(ui.badge, "inline-flex mx-auto")}
          >
            Conçu par un cuisinier, pour les cuisinier professionnelles
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.05 }}
            className={cn(ui.title, "mt-6")}
          >
            L’outil de travail des cuisines modernes
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.12 }}
            className={cn(ui.subtitle, "mt-4")}
          >
            Crée, organise et partage tes recettes avec ton équipe.
            <br />
            <span className="text-slate-200">
              Une seule source de vérité, pensée pour la brigade.
            </span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">

            <button
              onClick={onStart}
              className={cn(ui.btnPrimary, "px-7 py-3 rounded-2xl")}
            >
              Commencer gratuitement
            </button>

            <a
              href="#demo"
              className={cn(ui.btnGhost, "px-7 py-3 rounded-2xl text-center")}
            >
              Voir comment ça marche
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.7, delay: 0.24 }}
            className={cn(ui.muted, "mt-5 text-sm")}
          >
            Gratuit • Sans engagement • Pensé pour les équipes pro
          </motion.div>
        </div>
      </div>

      {/* SCROLL DEMO */}
      <div id="demo">
        <div className="block lg:hidden">
          <ScrollShowcaseMobile />
        </div>
        <div className="hidden lg:block">
          <ScrollShowcaseDesktop />
        </div>
      </div>
    </div>
  );
}
