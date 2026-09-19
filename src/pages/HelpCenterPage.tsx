import React, {
  useMemo,
  useState,
} from "react";

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

const supportEmail =
  "support@kitchnpro.com";

const topics: HelpTopic[] = [
  {
    title: "Créer une recette",
    description:
      "Ajouter une recette, modifier les ingrédients, gérer les sections et les étapes.",
    icon: BookOpen,
  },
  {
    title: "Importer une recette",
    description:
      "Importer un PDF, une image ou un fichier avec l’Import IA.",
    icon: UploadCloud,
  },
  {
    title: "Partager avec une équipe",
    description:
      "Créer un groupe, inviter des membres et partager des recettes.",
    icon: Users,
  },
  {
    title: "Gérer mes dossiers",
    description:
      "Classer tes recettes, déplacer une recette ou organiser tes dossiers.",
    icon: FolderOpen,
  },
  {
    title: "Abonnement Premium",
    description:
      "Comprendre les limites gratuites, le Premium et la gestion de l’abonnement.",
    icon: CreditCard,
  },
  {
    title: "Signaler un problème",
    description:
      "Prévenir le support si une page bloque, bug ou ne s’affiche pas correctement.",
    icon: Bug,
  },
];

const faqItems: FaqItem[] = [
  {
    category: "Recettes",
    question:
      "Comment créer une recette ?",
    answer:
      "Va dans Mes recettes, clique sur Nouvelle recette, puis remplis le nom, les ingrédients, les sections et les étapes. Tu peux ensuite l’enregistrer et la modifier à tout moment.",
  },
  {
    category: "Import",
    question:
      "Pourquoi mon import ne fonctionne pas ?",
    answer:
      "Vérifie que ton fichier est lisible et pas trop lourd. Si l’import IA bloque, réessaie avec un fichier plus propre ou une capture plus nette. Si le problème continue, contacte le support.",
  },
  {
    category: "Équipe",
    question:
      "Comment inviter un membre dans mon équipe ?",
    answer:
      "Va dans Paramètres puis Équipe. Depuis ton groupe, tu peux envoyer une invitation à un membre pour qu’il rejoigne ton espace de travail.",
  },
  {
    category: "Équipe",
    question:
      "Pourquoi je ne peux pas créer plusieurs groupes ?",
    answer:
      "Avec l’offre gratuite, tu peux créer un seul groupe. L’abonnement Premium permet d’aller plus loin avec moins de limites.",
  },
  {
    category: "Partage",
    question:
      "Si je supprime une recette partagée, est-ce qu’elle est supprimée partout ?",
    answer:
      "Non. Dans un groupe, supprimer une recette partagée la retire seulement du groupe. La recette originale reste disponible dans l’espace de son propriétaire.",
  },
  {
    category: "Abonnement",
    question:
      "Comment gérer mon abonnement ?",
    answer:
      "Va dans Paramètres puis Abonnement. Tu peux passer au Premium ou accéder à la gestion de ton abonnement depuis cette page.",
  },
];

export default function HelpCenterPage() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    openFaq,
    setOpenFaq,
  ] =
    useState<number | null>(0);

  const filteredFaq =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return faqItems;
      }

      return faqItems.filter(
        (item) =>
          item.question
            .toLowerCase()
            .includes(value) ||
          item.answer
            .toLowerCase()
            .includes(value) ||
          item.category
            .toLowerCase()
            .includes(value),
      );
    }, [search]);

  const goBack = () => {
    if (
      window.history.length > 1
    ) {
      window.history.back();

      return;
    }

    window.history.pushState(
      {},
      "",
      "/",
    );

    window.dispatchEvent(
      new PopStateEvent(
        "popstate",
      ),
    );
  };

  const contactHref =
    `mailto:${supportEmail}?subject=${encodeURIComponent(
      "Besoin d’aide avec Kitch’n",
    )}&body=${encodeURIComponent(
      "Bonjour,\n\nJ’ai besoin d’aide avec Kitch’n.\n\nPage concernée :\nProblème rencontré :\nCapture d’écran ajoutée : oui / non\n\nMerci.",
    )}`;

  const bugHref =
    `mailto:${supportEmail}?subject=${encodeURIComponent(
      "Bug rencontré sur Kitch’n",
    )}&body=${encodeURIComponent(
      "Bonjour,\n\nJe souhaite signaler un bug sur Kitch’n.\n\nPage concernée :\nCe que j’ai fait :\nCe qui s’est passé :\nCe qui aurait dû se passer :\nCapture d’écran ajoutée : oui / non\n\nMerci.",
    )}`;

  return (
    <div
      className="
        min-h-screen
        bg-[#F3F0E8]
        text-[#173E31]
      "
    >
      <main
        className="
          mx-auto
          flex w-full
          max-w-6xl
          flex-col
          gap-6
          px-4 py-6
          sm:px-6
          lg:px-8
        "
      >
        {/* BACK */}
        <button
          type="button"
          onClick={goBack}
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-full
            bg-[#E7EEE8]
            px-4 py-2.5
            text-sm
            font-medium
            text-[#184C3A]
            transition
            hover:bg-[#DDE8DF]
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* HERO */}
        <section
          className="
            overflow-hidden
            rounded-[30px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            shadow-[0_12px_35px_rgba(23,62,49,0.05)]
          "
        >
          <div
            className="
              border-b
              border-[#173E31]/8
              px-5 py-6
              sm:px-8
              sm:py-8
            "
          >
            <div
              className="
                mb-4
                grid h-12 w-12
                place-items-center
                rounded-[18px]
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <HelpCircle className="h-6 w-6" />
            </div>

            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#A8833E]
              "
            >
              Assistance
            </p>

            <h1
              className="
                mt-1
                font-serif
                text-3xl
                font-semibold
                tracking-tight
                text-[#173E31]
                sm:text-4xl
              "
            >
              Centre d’assistance
            </h1>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-[#718078]
                sm:text-base
              "
            >
              Besoin d’aide avec
              Kitch’n ? Retrouve les
              réponses rapides pour
              créer, importer,
              organiser et partager
              tes recettes.
            </p>

            {/* SEARCH */}
            <div
              className="
                mt-6
                flex max-w-xl
                items-center
                gap-3
                rounded-2xl
                border border-[#173E31]/10
                bg-[#F7F5EF]
                px-4 py-3
                transition
                focus-within:border-[#C7A45D]/50
                focus-within:ring-2
                focus-within:ring-[#C7A45D]/15
              "
            >
              <Search className="h-5 w-5 shrink-0 text-[#8B9791]" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Rechercher une question..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-[#173E31]
                  outline-none
                  placeholder:text-[#8B9791]
                "
              />
            </div>
          </div>

          {/* TOPICS */}
          <div
            className="
              grid gap-4
              px-5 py-6
              sm:grid-cols-2
              sm:px-8
              lg:grid-cols-3
            "
          >
            {topics.map(
              (topic) => {
                const Icon =
                  topic.icon;

                return (
                  <article
                    key={
                      topic.title
                    }
                    className="
                      rounded-[24px]
                      border border-[#173E31]/8
                      bg-[#F7F5EF]
                      p-5
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-[#173E31]/15
                      hover:bg-[#F2F3EC]
                    "
                  >
                    <div
                      className="
                        mb-4
                        grid h-11 w-11
                        place-items-center
                        rounded-2xl
                        bg-[#E7EEE8]
                        text-[#184C3A]
                      "
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2
                      className="
                        font-serif
                        text-lg
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      {
                        topic.title
                      }
                    </h2>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-[#718078]
                      "
                    >
                      {
                        topic.description
                      }
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </section>

        <section
          className="
            grid gap-6
            lg:grid-cols-[1fr_360px]
          "
        >
          {/* FAQ */}
          <div
            className="
              rounded-[30px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-5
              shadow-[0_10px_30px_rgba(23,62,49,0.04)]
              sm:p-6
            "
          >
            <div
              className="
                mb-5
                flex items-center
                gap-3
              "
            >
              <div
                className="
                  grid h-10 w-10
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <Sparkles className="h-5 w-5" />
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#A8833E]
                  "
                >
                  FAQ
                </p>

                <h2
                  className="
                    mt-1
                    font-serif
                    text-xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Questions fréquentes
                </h2>

                <p className="mt-1 text-sm text-[#718078]">
                  Les réponses aux
                  problèmes les plus
                  courants.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaq.length >
              0 ? (
                filteredFaq.map(
                  (
                    item,
                    index,
                  ) => {
                    const isOpen =
                      openFaq ===
                      index;

                    return (
                      <div
                        key={`${item.question}-${index}`}
                        className="
                          overflow-hidden
                          rounded-[22px]
                          border border-[#173E31]/8
                          bg-[#F7F5EF]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenFaq(
                              isOpen
                                ? null
                                : index,
                            )
                          }
                          className="
                            flex w-full
                            items-center
                            justify-between
                            gap-4
                            px-4 py-4
                            text-left
                            transition
                            hover:bg-[#F0F2EC]
                          "
                        >
                          <div className="min-w-0">
                            <span
                              className="
                                mb-2
                                inline-flex
                                rounded-full
                                bg-[#E7EEE8]
                                px-2.5 py-1
                                text-[10px]
                                font-semibold
                                uppercase
                                tracking-[0.08em]
                                text-[#184C3A]
                              "
                            >
                              {
                                item.category
                              }
                            </span>

                            <h3
                              className="
                                text-sm
                                font-semibold
                                text-[#173E31]
                                sm:text-base
                              "
                            >
                              {
                                item.question
                              }
                            </h3>
                          </div>

                          <ChevronDown
                            className={`
                              h-5 w-5
                              shrink-0
                              text-[#718078]
                              transition
                              ${
                                isOpen
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />
                        </button>

                        {isOpen ? (
                          <div
                            className="
                              border-t
                              border-[#173E31]/8
                              px-4 py-4
                              text-sm
                              leading-6
                              text-[#617168]
                            "
                          >
                            {
                              item.answer
                            }
                          </div>
                        ) : null}
                      </div>
                    );
                  },
                )
              ) : (
                <div
                  className="
                    rounded-[22px]
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    p-5
                    text-sm
                    text-[#718078]
                  "
                >
                  Aucune question
                  trouvée. Tu peux
                  contacter le
                  support.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-4">
            {/* SUPPORT */}
            <div
              className="
                rounded-[28px]
                border border-[#C7A45D]/20
                bg-[#E7EEE8]
                p-5
                shadow-[0_8px_24px_rgba(23,62,49,0.04)]
              "
            >
              <div
                className="
                  mb-4
                  grid h-11 w-11
                  place-items-center
                  rounded-2xl
                  bg-[#FBFAF6]
                  text-[#A8833E]
                "
              >
                <Mail className="h-5 w-5" />
              </div>

              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#A8833E]
                "
              >
                Support
              </p>

              <h2
                className="
                  mt-1
                  font-serif
                  text-xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Contacter le support
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#617168]
                "
              >
                Tu n’as pas trouvé
                ta réponse ? Envoie
                un message au support
                Kitch’n.
              </p>

              <a
                href={contactHref}
                className="
                  mt-5
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#DDAE9D]
                  px-4 py-3
                  text-sm
                  font-semibold
                  text-[#173E31]
                  transition
                  hover:bg-[#D5A18E]
                "
              >
                Contacter le support
              </a>
            </div>

            {/* BUG */}
            <div
              className="
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-5
                shadow-[0_8px_24px_rgba(23,62,49,0.04)]
              "
            >
              <div
                className="
                  mb-4
                  grid h-11 w-11
                  place-items-center
                  rounded-2xl
                  bg-[#F8EAE7]
                  text-[#A54C48]
                "
              >
                <Bug className="h-5 w-5" />
              </div>

              <h2
                className="
                  font-serif
                  text-xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Signaler un bug
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#718078]
                "
              >
                Précise la page,
                ce que tu as fait
                et ajoute une
                capture d’écran
                si possible.
              </p>

              <a
                href={bugHref}
                className="
                  mt-5
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F0F2EC]
                  px-4 py-3
                  text-sm
                  font-semibold
                  text-[#184C3A]
                  transition
                  hover:bg-[#E7EEE8]
                "
              >
                Signaler un problème
              </a>
            </div>

            {/* TIP */}
            <div
              className="
                rounded-[26px]
                border border-[#173E31]/8
                bg-[#F7F5EF]
                p-5
              "
            >
              <div
                className="
                  mb-3
                  flex items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-[#173E31]
                "
              >
                <ShieldCheck className="h-4 w-4 text-[#A8833E]" />
                Conseil
              </div>

              <p
                className="
                  text-sm
                  leading-6
                  text-[#718078]
                "
              >
                Pour une réponse
                plus rapide, indique
                toujours ton email
                de compte, la page
                concernée et une
                capture d’écran du
                problème.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}