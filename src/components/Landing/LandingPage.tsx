import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { LandingBenefits } from "../../features/landing/components/LandingBenefits";
import { LandingFaq } from "../../features/landing/components/LandingFaq";
import { LandingFinalCta } from "../../features/landing/components/LandingFinalCta";
import { LandingPricing } from "../../features/landing/components/LandingPricing";
import { useLandingSubscription } from "../../features/landing/hooks/useLandingSubscription";
import { ui } from "../../styles/ui";
import { cn } from "../../utils/cn";
import { Footer } from "../Layout/Footer";
import { ScrollShowcase } from "./ScrollShowcase";

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type LandingPageProps = {
  brand?: ReactNode;
  onStart: () => void;
  onLogin: () => void;
};

export function LandingPage({
  brand = (
    <img
      src="/Logo_kitchn_horizontal.svg"
      alt="KITCH'N"
      className="h-11 w-auto select-none sm:h-12"
      draggable={false}
    />
  ),
  onStart,
  onLogin,
}: LandingPageProps) {
  const { user } = useAuth();
  const subscription = useLandingSubscription(user?.id);

  return (
    <div className={cn(ui.pageBg, "relative text-slate-100")}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-[-140px] top-24 h-[480px] w-[480px] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">{brand}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogin}
              className={cn(ui.btnGhost, "h-10 px-4")}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={onStart}
              className={cn(ui.btnPrimary, "h-10 px-4")}
            >
              Commencer
            </button>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-3xl text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(ui.badge, "mx-auto inline-flex")}
          >
            Conçu par un cuisinier, pour les cuisiniers professionnels
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
            className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <button
              type="button"
              onClick={onStart}
              className={cn(
                ui.btnPrimary,
                "rounded-2xl px-7 py-3"
              )}
            >
              Commencer gratuitement
            </button>
            <a
              href="#demo"
              className={cn(
                ui.btnGhost,
                "rounded-2xl px-7 py-3 text-center"
              )}
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

      <div id="demo">
        <ScrollShowcase />
      </div>

      <LandingBenefits />
      <LandingPricing
        userPresent={Boolean(user)}
        onStart={onStart}
        subscription={subscription}
      />
      <LandingFaq />
      <LandingFinalCta onStart={onStart} onLogin={onLogin} />
      <Footer onStart={onStart} />
    </div>
  );
}
