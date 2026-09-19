import {
  lazy,
  Suspense,
  type ReactNode,
} from "react";

import { motion } from "framer-motion";

import {
  ArrowRight,
  Check,
  ChefHat,
  Play,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import { LandingBenefits } from "../../features/landing/components/LandingBenefits";
import { LandingFaq } from "../../features/landing/components/LandingFaq";
import { LandingFinalCta } from "../../features/landing/components/LandingFinalCta";
import { LandingPricing } from "../../features/landing/components/LandingPricing";

import { useLandingSubscription } from "../../features/landing/hooks/useLandingSubscription";

import { Footer } from "../Layout/Footer";

const ScrollShowcase = lazy(() =>
  import("./ScrollShowcase").then(
    (module) => ({
      default:
        module.ScrollShowcase,
    }),
  ),
);

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },

  show: {
    opacity: 1,
    y: 0,
  },
};

type LandingPageProps = {
  brand?: ReactNode;

  onStart: () => void;

  onLogin: () => void;
};

export function LandingPage({
  brand = (
    <img
      src="/logo_kitchn_sans_fond.png"
      alt="KITCH'N"
      className="
        h-16
        w-auto
        select-none
        sm:h-20
      "
      draggable={false}
    />
  ),

  onStart,
  onLogin,
}: LandingPageProps) {
  const { user } = useAuth();

  const subscription =
    useLandingSubscription(
      user?.id,
    );

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F3F0E8]
        text-[#173E31]
      "
    >
      {/* DECORATION */}
      <div
        className="
          pointer-events-none
          absolute inset-x-0 top-0
          h-[760px]
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            -top-[320px]
            left-1/2
            h-[650px]
            w-[900px]
            -translate-x-1/2
            rounded-[50%]
            bg-[#E7EEE8]
            blur-[1px]
          "
        />

        <div
          className="
            absolute
            right-[-160px]
            top-[180px]
            h-[360px]
            w-[360px]
            rounded-full
            bg-[#DDAE9D]/12
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-[-180px]
            top-[320px]
            h-[320px]
            w-[320px]
            rounded-full
            bg-[#C7A45D]/10
            blur-3xl
          "
        />
      </div>

      {/* HEADER + HERO */}
      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          pb-14
          pt-4
          sm:px-6
          sm:pb-20
          sm:pt-6
          lg:px-8
        "
      >
        {/* NAV */}
        <header
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
            "
          >
            {brand}
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={
                onLogin
              }
              className="
                hidden
                h-10
                items-center
                justify-center
                rounded-full
                px-4
                text-sm
                font-semibold
                text-[#184C3A]
                transition
                hover:bg-[#E7EEE8]
                sm:inline-flex
              "
            >
              Se connecter
            </button>

            <button
              type="button"
              onClick={
                onStart
              }
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#184C3A]
                px-4
                text-sm
                font-semibold
                text-[#F7F3EA]
                shadow-[0_8px_22px_rgba(23,62,49,0.15)]
                transition
                hover:-translate-y-0.5
                hover:bg-[#123C2E]
                active:scale-[0.98]
              "
            >
              Commencer

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* HERO */}
        <div
          className="
            mx-auto
            mt-16
            max-w-4xl
            text-center
            sm:mt-24
            lg:mt-28
          "
        >
          {/* BADGE */}
          <motion.div
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.55,
              ease: "easeOut",
            }}
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              border border-[#C7A45D]/20
              bg-[#FBFAF6]/80
              px-4 py-2
              text-xs
              font-semibold
              text-[#8B6C32]
              shadow-[0_6px_18px_rgba(23,62,49,0.04)]
              backdrop-blur
            "
          >
            <ChefHat className="h-4 w-4" />

            Conçu par un cuisinier,
            pour les cuisiniers
          </motion.div>

          {/* TITLE */}
          <motion.h1
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.65,
              delay: 0.05,
              ease: "easeOut",
            }}
            className="
              mx-auto
              mt-7
              max-w-4xl
              font-serif
              text-[42px]
              font-semibold
              leading-[1.04]
              tracking-[-0.035em]
              text-[#173E31]

              sm:text-6xl
              lg:text-[76px]
            "
          >
            La cuisine organisée
            <span
              className="
                block
                text-[#A8833E]
              "
            >
              comme elle devrait l’être.
            </span>
          </motion.h1>

          {/* SUBTITLE */}
          <motion.p
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.65,
              delay: 0.12,
              ease: "easeOut",
            }}
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-[#617168]
              sm:text-lg
              sm:leading-8
            "
          >
            Crée, importe, organise et
            partage toutes tes recettes
            dans un seul espace pensé
            pour les cuisines
            professionnelles.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.65,
              delay: 0.18,
              ease: "easeOut",
            }}
            className="
              mt-8
              flex
              flex-col
              justify-center
              gap-3
              sm:flex-row
            "
          >
            <button
              type="button"
              onClick={
                onStart
              }
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#DDAE9D]
                px-7 py-3
                text-sm
                font-semibold
                text-[#173E31]
                shadow-[0_10px_26px_rgba(120,73,57,0.12)]
                transition
                hover:-translate-y-0.5
                hover:bg-[#D5A18E]
                active:scale-[0.98]
              "
            >
              Commencer gratuitement

              <ArrowRight className="h-4 w-4" />
            </button>

            <a
              href="#demo"
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                gap-2
                rounded-full
                border border-[#173E31]/10
                bg-[#FBFAF6]/75
                px-7 py-3
                text-sm
                font-semibold
                text-[#184C3A]
                shadow-[0_8px_22px_rgba(23,62,49,0.04)]
                backdrop-blur
                transition
                hover:-translate-y-0.5
                hover:bg-[#FBFAF6]
                active:scale-[0.98]
              "
            >
              <Play className="h-4 w-4" />

              Voir comment ça marche
            </a>
          </motion.div>

          {/* TRUST */}
          <motion.div
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.65,
              delay: 0.24,
              ease: "easeOut",
            }}
            className="
              mt-6
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-5
              gap-y-2
              text-xs
              font-medium
              text-[#718078]
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <Check className="h-3.5 w-3.5 text-[#184C3A]" />
              Gratuit pour commencer
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <Check className="h-3.5 w-3.5 text-[#184C3A]" />
              Sans engagement
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <Check className="h-3.5 w-3.5 text-[#184C3A]" />
              Pensé pour la brigade
            </span>
          </motion.div>

          {/* SMALL BRAND MESSAGE */}
          <motion.div
            variants={
              fadeUp
            }
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.65,
              delay: 0.3,
              ease: "easeOut",
            }}
            className="
              mx-auto
              mt-12
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#E7EEE8]
              px-4 py-2
              text-xs
              font-medium
              text-[#184C3A]
            "
          >
            <Sparkles className="h-3.5 w-3.5 text-[#A8833E]" />

            Une seule source de vérité
            pour toute la cuisine.
          </motion.div>
        </div>
      </div>

      {/* DEMO */}
      <section
        id="demo"
        className="
          relative
          min-h-[70vh]
        "
      >
        <Suspense
          fallback={
            <div
              className="
                flex
                min-h-[500px]
                items-center
                justify-center
              "
            >
              <div
                className="
                  h-8 w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-[#173E31]/15
                  border-t-[#184C3A]
                "
              />
            </div>
          }
        >
          <ScrollShowcase />
        </Suspense>
      </section>

      {/* RESTE LANDING */}
      <LandingBenefits />

      <LandingPricing
        userPresent={
          Boolean(user)
        }
        onStart={
          onStart
        }
        subscription={
          subscription
        }
      />

      <LandingFaq />

      <LandingFinalCta
        onStart={
          onStart
        }
        onLogin={
          onLogin
        }
      />

      <Footer
        onStart={
          onStart
        }
      />
    </div>
  );
}
