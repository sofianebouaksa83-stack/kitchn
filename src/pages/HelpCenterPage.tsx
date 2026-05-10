import React, {useMemo, useState} from "react";
import {
  ArrowLeft,
  BookOpen,
  Bug,
  ChevronDown,
  CreditCard,
  FolderOpen,
  HelpCircle,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";

type HelpTopic = {
  title: string;
  description: string;
  icon: React.ElementType;
};

type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

const supportEmail = "support@kitchnpro.com";

const topics: HelpTopic[] = [
  {
    title: "Créer une recette",
    description: "Ajouter une recette, modifier les ingrédients, gérer les sections et les étapes.",
    icon: BookOpen,
  },
  {
    title: "Importer une recette",
    description: "Importer un PDF, une image ou un fichier avec l’Import IA.",
    icon: UploadCloud,
  },
  {
    title: "Partager avec une équipe",
    description: "Créer un groupe, inviter des membres et partager des recettes.",
    icon: Users,
  },
  {
    title: "Gérer mes dossiers",
    description: "Classer tes recettes, déplacer une recette ou organiser tes dossiers.",
    icon: FolderOpen,
  },
  {
    title: "Abonnement Premium",
    description: "Comprendre les limites gratuites, le Premium et la gestion de l’abonnement.",
    icon: CreditCard,
  },
  {
    title: "Signaler un problème",
    description: "Prévenir le support si une page bloque, bug ou ne s’affiche pas correctement.",
    icon: Bug,
  },
];

const faqItems: FaqItem[] = [
  {
    category: "Recettes",
    question: "Comment créer une recette ?",
    answer:
      "Va dans Mes recettes, clique sur Nouvelle recette, puis remplis le nom, les ingrédients, les sections et les étapes. Tu peux ensuite l’enregistrer et la modifier à tout moment.",
  },
  {
    category: "Import",
    question: "Pourquoi mon import ne fonctionne pas ?",
    answer:
      "Vérifie que ton fichier est lisible et pas trop lourd. Si l’import IA bloque, réessaie avec un fichier plus propre ou une capture plus nette. Si le problème continue, contacte le support.",
  },
  {
    category: "Équipe",
    question: "Comment inviter un membre dans mon équipe ?",
    answer:
      "Va dans Paramètres puis Équipe. Depuis ton groupe, tu peux envoyer une invitation à un membre pour qu’il rejoigne ton espace de travail.",
  },
  {
    category: "Équipe",
    question: "Pourquoi je ne peux pas créer plusieurs groupes ?",
    answer:
      "Avec l’offre gratuite, tu peux créer un seul groupe. L’abonnement Premium permet d’aller plus loin avec moins de limites.",
  },
  {
    category: "Partage",
    question: "Si je supprime une recette partagée, est-ce qu’elle est supprimée partout ?",
    answer:
      "Non. Dans un groupe, supprimer une recette partagée la retire seulement du groupe. La recette originale reste disponible dans l’espace de son propriétaire.",
  },
  {
    category: "Abonnement",
    question: "Comment gérer mon abonnement ?",
    answer:
      "Va dans Paramètres puis Abonnement. Tu peux passer au Premium ou accéder à la gestion de ton abonnement depuis cette page.",
  },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredFaq = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return faqItems;

    return faqItems.filter((item) => {
      return (
        item.question.toLowerCase().includes(value) ||
        item.answer.toLowerCase().includes(value) ||
        item.category.toLowerCase().includes(value)
      );
    });
  }, [search]);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const contactHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Besoin d’aide avec Kitch’n"
  )}&body=${encodeURIComponent(
    "Bonjour,\n\nJ’ai besoin d’aide avec Kitch’n.\n\nPage concernée :\nProblème rencontré :\nCapture d’écran ajoutée : oui / non\n\nMerci."
  )}`;

  const bugHref = `mailto:${supportEmail}?subject=${encodeURIComponent(
    "Bug rencontré sur Kitch’n"
  )}&body=${encodeURIComponent(
    "Bonjour,\n\nJe souhaite signaler un bug sur Kitch’n.\n\nPage concernée :\nCe que j’ai fait :\nCe qui s’est passé :\nCe qui aurait dû se passer :\nCapture d’écran ajoutée : oui / non\n\nMerci."
  )}`;

  return (
    <div className="min-h-screen bg-[#07112d] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-[#d4af37]/20 blur-[90px]" />
        <div className="absolute right-[-120px] top-[180px] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[110px]" />
      </div>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <HelpCircle className="h-6 w-6" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Centre d’assistance
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
              Besoin d’aide avec Kitch’n ? Retrouve les réponses rapides pour créer,
              importer, organiser et partager tes recettes.
            </p>

            <div className="mt-6 flex max-w-xl items-center gap-3 rounded-2xl border border-white/10 bg-[#081638]/80 px-4 py-3">
              <Search className="h-5 w-5 text-white/45" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une question..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>

          <div className="grid gap-4 px-5 py-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topic.icon;

              return (
                <article
                  key={topic.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-0.5 hover:border-[#d4af37]/40 hover:bg-white/[0.07]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="text-base font-semibold text-white">
                    {topic.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/60">
                    {topic.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Questions fréquentes</h2>
                <p className="text-sm text-white/50">
                  Les réponses aux problèmes les plus courants.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaq.length > 0 ? (
                filteredFaq.map((item, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div
                      key={`${item.question}-${index}`}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#081638]/70"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
                      >
                        <div>
                          <span className="mb-1 inline-flex rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-2 py-0.5 text-xs font-medium text-[#d4af37]">
                            {item.category}
                          </span>

                          <h3 className="text-sm font-semibold text-white sm:text-base">
                            {item.question}
                          </h3>
                        </div>

                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-white/50 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-white/10 px-4 py-4 text-sm leading-6 text-white/65">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#081638]/70 p-5 text-sm text-white/60">
                  Aucune question trouvée. Tu peux contacter le support.
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#d4af37]/10 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-semibold">Contacter le support</h2>

              <p className="mt-2 text-sm leading-6 text-white/65">
                Tu n’as pas trouvé ta réponse ? Envoie un message au support Kitch’n.
              </p>

              <a
                href={contactHref}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#d4af37] px-4 py-3 text-sm font-bold text-[#07112d] transition hover:brightness-110"
              >
                Contacter le support
              </a>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                <Bug className="h-5 w-5" />
              </div>

              <h2 className="text-lg font-semibold">Signaler un bug</h2>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Précise la page, ce que tu as fait et ajoute une capture d’écran si possible.
              </p>

              <a
                href={bugHref}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Signaler un problème
              </a>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
                Conseil
              </div>

              <p className="text-sm leading-6 text-white/55">
                Pour une réponse plus rapide, indique toujours ton email de compte,
                la page concernée et une capture d’écran du problème.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}