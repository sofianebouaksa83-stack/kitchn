import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Loader2, Sparkles, Users, BookOpen } from "lucide-react";
import { ui } from "../../styles/ui";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";

// Scroll showcase
import { ScrollShowcaseMobile } from "./ScrollShowcaseMobile";
import { ScrollShowcaseDesktop } from "./ScrollShowcaseDesktop";

// Footer partagé
import { Footer } from "../Layout/Footer";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

type LandingPageProps = {
  brand?: React.ReactNode;
  onStart: () => void;
  onLogin: () => void;
};

export function LandingPage({
  brand = (
    <img
      src="/Logo_kitchn_horizontal.svg"
      alt="KITCH'N"
      className="h-11 sm:h-12 w-auto select-none"
      draggable={false}
    />
  ),
  onStart,
  onLogin,
}: LandingPageProps) {
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription(user?.id);

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);

  const resolvedPlanId = useMemo(() => {
    if (subLoading) return null;
    return isPremium ? "premium" : "free";
  }, [isPremium, subLoading]);

  async function handleUpgrade() {
    setPricingError(null);
    setLoadingCheckout(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: { planId: "premium" },
        }
      );

      if (error) {
        const details = await (
          error as { context?: { text?: () => Promise<string> } }
        ).context?.text?.().catch(() => null);

        throw new Error(details || error.message || "Erreur checkout");
      }

      if (!data?.url) {
        throw new Error("URL de paiement introuvable");
      }

      window.location.href = data.url;
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Impossible de passer au Premium";
      setPricingError(message);
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function handleManage() {
    setPricingError(null);
    setLoadingPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription"
      );

      if (error) throw error;
      if (!data?.url) throw new Error("URL du portail introuvable");

      window.location.href = data.url;
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Impossible d’ouvrir la gestion d’abonnement";
      setPricingError(message);
    } finally {
      setLoadingPortal(false);
    }
  }

  const freeIsCurrent = resolvedPlanId === "free";
  const premiumIsCurrent = resolvedPlanId === "premium";

  const fadeUp = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <div className={cn(ui.pageBg, "relative text-slate-100")}>
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

            <button
              onClick={onStart}
              className={cn(ui.btnPrimary, "h-10 px-4")}
            >
              Commencer
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="mt-24 max-w-3xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(ui.badge, "inline-flex mx-auto")}
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
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
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

      {/* DEMO */}
      <div id="demo">
        <div className="block lg:hidden">
          <ScrollShowcaseMobile />
        </div>
        <div className="hidden lg:block">
          <ScrollShowcaseDesktop />
        </div>
      </div>

      {/* POURQUOI KITCH'N */}
<section className="relative mt-20 sm:mt-28">
  <div className="mx-auto max-w-6xl px-4 sm:px-6">
    
    <div className="text-center max-w-3xl mx-auto">
      <div className={cn(ui.badge, "inline-flex mx-auto")}>
        Pourquoi Kitch’n
      </div>

      <h2 className="mt-6 text-3xl sm:text-4xl font-semibold text-slate-100">
        Pensé pour les cuisines professionnelles
      </h2>

      <p className="mt-4 text-slate-300/70 text-base sm:text-lg">
        Kitch’n centralise les recettes, simplifie le partage et permet
        à toute la brigade de travailler avec la même base.
      </p>
    </div>

    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-4 text-amber-300">
          <BookOpen className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-white">
          Recettes centralisées
        </h3>

        <p className="mt-2 text-sm text-slate-300/70 leading-6">
          Une seule source de vérité pour toute la brigade.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-4 text-amber-300">
          <Users className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-white">
          Travail d’équipe
        </h3>

        <p className="mt-2 text-sm text-slate-300/70 leading-6">
          Partage structuré par groupes et dossiers.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="mb-4 text-amber-300">
          <Sparkles className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-white">
          Import intelligent
        </h3>

        <p className="mt-2 text-sm text-slate-300/70 leading-6">
          Transforme un document ou un texte en recette exploitable.
        </p>
      </div>

    </div>
  </div>
</section>

      {/* PRICING */}
      <section id="pricing" className="relative mt-20 sm:mt-28 pb-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className={cn(ui.badge, "inline-flex mx-auto")}>Tarifs</div>

            <h2 className="mt-6 text-3xl sm:text-4xl font-semibold text-slate-100">
              Simple, clair, prêt pour ton équipe
            </h2>
          </motion.div>

          {pricingError && (
            <div className="mt-8 max-w-3xl mx-auto rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm text-center">
              {pricingError}
            </div>
          )}

          <div className="mt-10 grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* FREE */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.04 }}
              className={cn(
                ui.card,
                freeIsCurrent
                  ? "ring-2 ring-amber-400/30"
                  : "ring-1 ring-white/10",
                "rounded-3xl"
              )}
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-300">
                      Plan de base
                    </span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">
                      Free
                    </h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Pour utiliser Kitch’n au quotidien avec les fonctions
                      essentielles.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20 p-3">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-slate-100">0€</div>
                  <p className="text-sm text-slate-400 mt-1">Sans engagement</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Création de recettes</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">
                      Accès aux groupes et dossiers
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">
                      Usage standard de l’application
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Sans paiement requis</span>
                  </li>
                </ul>

                <button
                  onClick={onStart}
                  className={cn(ui.btnPrimary, "w-full")}
                  type="button"
                >
                  {user
                    ? freeIsCurrent
                      ? "Plan actuel"
                      : "Continuer avec Free"
                    : "Commencer gratuitement"}
                </button>

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Aucun paiement requis
                </p>
              </div>
            </motion.div>

            {/* PREMIUM */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={cn(
                ui.card,
                premiumIsCurrent
                  ? "ring-2 ring-amber-400/30"
                  : "ring-1 ring-white/10",
                "rounded-3xl relative overflow-hidden"
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />

              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <Crown className="w-3.5 h-3.5" />
                      Premium
                    </span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">
                      Premium
                    </h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Pour aller plus loin avec les fonctionnalités avancées de
                      Kitch’n.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                    <Users className="w-6 h-6 text-slate-200" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-slate-100">9,90€</div>
                  <p className="text-sm text-slate-400 mt-1">Par mois</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Import et génération IA</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">
                      Fonctionnalités premium débloquées
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">
                      Gestion d’abonnement via Stripe
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">
                      Évolutions futures incluses
                    </span>
                  </li>
                </ul>

                {subLoading ? (
                  <button
                    disabled
                    className={cn(ui.btnPrimary, "w-full opacity-80")}
                    type="button"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Chargement…
                    </span>
                  </button>
                ) : premiumIsCurrent ? (
                  <button
                    onClick={handleManage}
                    disabled={loadingPortal}
                    className={cn(ui.btnPrimary, "w-full")}
                    type="button"
                  >
                    {loadingPortal ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Ouverture…
                      </span>
                    ) : (
                      "Gérer mon abonnement"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={user ? handleUpgrade : onStart}
                    disabled={loadingCheckout}
                    className={cn(ui.btnPrimary, "w-full")}
                    type="button"
                  >
                    {loadingCheckout ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirection…
                      </span>
                    ) : user ? (
                      "Passer au Premium"
                    ) : (
                      "Créer un compte et passer Premium"
                    )}
                  </button>
                )}

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Paiement sécurisé via Stripe
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
<section className="relative mt-20 sm:mt-24 pb-6">
  <div className="mx-auto max-w-4xl px-4 sm:px-6">
    <div className="text-center max-w-2xl mx-auto">
      <div className={cn(ui.badge, "inline-flex mx-auto")}>
        FAQ
      </div>

      <h2 className="mt-6 text-3xl sm:text-4xl font-semibold text-slate-100">
        Tout ce qu’il faut savoir avant de commencer
      </h2>

      <p className="mt-4 text-slate-300/70 text-base sm:text-lg">
        Retrouve les réponses aux questions les plus fréquentes sur Kitch’n,
        les abonnements et la confidentialité de tes recettes.
      </p>
    </div>

    <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl overflow-hidden divide-y divide-white/8">
      {[
        {
          q: "Est-ce que Kitch’n est gratuit ?",
          a: "Oui. Le plan Free permet de commencer sans paiement, avec les fonctionnalités essentielles pour créer et organiser vos recettes.",
        },
        {
          q: "Puis-je annuler à tout moment ?",
          a: "Oui. Vous pouvez gérer ou annuler votre abonnement Premium à tout moment depuis votre espace.",
        },
        {
          q: "Mes recettes sont-elles privées ?",
          a: "Oui. Vos recettes restent privées par défaut. Vous choisissez quand et avec qui les partager.",
        },
        {
          q: "Kitch’n fonctionne-t-il pour une équipe ?",
          a: "Oui. Kitch’n est pensé pour la brigade, avec des groupes, des dossiers et un partage structuré.",
        },
        {
          q: "Comment fonctionne l’import IA ?",
          a: "Vous importez un document ou un texte, et Kitch’n le transforme en recette claire, exploitable et prête à retravailler.",
        },
        {
          q: "Le paiement est-il sécurisé ?",
          a: "Oui. Les paiements et la gestion d’abonnement sont sécurisés via Stripe.",
        },
      ].map((item, index) => (
        <details
          key={item.q}
          className="group px-5 sm:px-7 py-5 open:bg-white/[0.02] transition"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
            <span className="text-sm sm:text-base font-medium text-white">
              {item.q}
            </span>

            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] p-2 text-white/60 transition group-open:rotate-45 group-open:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 4a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V5a1 1 0 011-1z" />
              </svg>
            </span>
          </summary>

          <p className="pt-4 pr-10 text-sm sm:text-[15px] leading-7 text-slate-300/75">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  </div>
</section>

{/* FINAL CTA */}
<section className="relative mt-24 sm:mt-28 pb-10">
  <div className="mx-auto max-w-4xl px-4 sm:px-6">

    <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-10 sm:p-14 text-center">

      <h2 className="text-3xl sm:text-4xl font-semibold text-white">
        Commence gratuitement aujourd’hui
      </h2>

      <p className="mt-4 text-slate-300/70 text-base sm:text-lg">
        Crée ton espace, organise tes recettes et partage-les avec ton équipe.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">

        <button
          onClick={onStart}
          className={cn(ui.btnPrimary, "px-8 py-3 rounded-2xl")}
        >
          Commencer gratuitement
        </button>

        <button
          onClick={onLogin}
          className={cn(ui.btnGhost, "px-8 py-3 rounded-2xl")}
        >
          Se connecter
        </button>

      </div>

      <p className="mt-5 text-xs text-slate-400">
        Gratuit • Sans engagement
      </p>

    </div>

  </div>
</section>

      <Footer onStart={onStart} />
    </div>
  );
}