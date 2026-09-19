import type { ReactNode } from "react";

import { WorkGroupsDemoPanel } from "../../../components/Groups/demo/WorkGroupsDemoPanel";
import { RecipeImportAIDemoPanel } from "../../../components/Import/demo/RecipeImportAIDemoPanel";
import { SharedRecipesDemoPanel } from "../../../components/Sharing/demo/SharedRecipesDemoPanel";
import { RecipeShowcaseDemo } from "../components/RecipeShowcaseDemo";

export type ShowcaseStepKey = "recipes" | "groups" | "import" | "share";

type ShowcaseVariant = "desktop" | "mobile";

type ShowcaseContent = {
  label: string;
  title: string;
  body: string | Record<ShowcaseVariant, string>;
  bullets: string[];
};

type ShowcaseStepBase = {
  key: ShowcaseStepKey;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  demo: ReactNode;
  bg: string;
};

export type DesktopShowcaseStep = ShowcaseStepBase & {
  align: "left" | "right";
};

export type MobileShowcaseStep = ShowcaseStepBase & {
  demoBaseWidth?: number;
  demoBaseHeight?: number;
  demoOffsetY?: number;
  demoMaxScale?: number;
};

const CONTENT: Record<ShowcaseStepKey, ShowcaseContent> = {
  recipes: {
    label: "Recettes",
    title: "Retrouve une recette en quelques secondes",
    body: {
      desktop:
        "Toutes tes recettes restent propres, rangées et prêtes pour le service, même quand la carte change.",
      mobile:
        "Une liste claire, rapide à filtrer, pensée pour le service et les changements de carte.",
    },
    bullets: [
      "Recherche rapide",
      "Dossiers & favoris",
      "Vue recette lisible",
    ],
  },
  groups: {
    label: "Équipe",
    title: "Partage le bon contenu à la bonne équipe",
    body:
      "Crée des groupes par restaurant ou par poste, puis donne accès uniquement aux recettes utiles.",
    bullets: [
      "Invitations par mail",
      "Rôles de brigade",
      "Groupes sécurisés",
    ],
  },
  import: {
    label: "Import IA",
    title: "Transforme tes fichiers en fiches propres",
    body:
      "Copie un texte ou dépose un PDF/Word : l’import IA remet la recette au format Kitch’n.",
    bullets: [
      "PDF / Word / texte",
      "Sections automatiques",
      "Recette prête à corriger",
    ],
  },
  share: {
    label: "Partage",
    title: "Travaille sans mélanger les recettes",
    body:
      "Les recettes partagées restent rangées par groupe, avec une lecture rapide sur mobile ou desktop.",
    bullets: [
      "Dossiers partagés",
      "Accès contrôlé",
      "Lecture claire",
    ],
  },
};

function createStep(
  key: ShowcaseStepKey,
  variant: ShowcaseVariant,
  demo: ReactNode
): Omit<ShowcaseStepBase, "bg"> {
  const content = CONTENT[key];

  return {
    key,
    label: content.label,
    title: content.title,
    body:
      typeof content.body === "string"
        ? content.body
        : content.body[variant],
    bullets: content.bullets,
    demo,
  };
}

export const DESKTOP_SHOWCASE_STEPS: DesktopShowcaseStep[] = [
  {
    ...createStep(
      "recipes",
      "desktop",
      <RecipeShowcaseDemo variant="desktop" />
    ),
    align: "left",
    bg: "radial-gradient(1200px 600px at 20% 30%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(900px 500px at 80% 20%, rgba(59,130,246,0.18), transparent 55%)",
  },
  {
    ...createStep("groups", "desktop", <WorkGroupsDemoPanel />),
    align: "right",
    bg: "radial-gradient(1100px 600px at 75% 35%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 25% 20%, rgba(59,130,246,0.16), transparent 60%)",
  },
  {
    ...createStep("import", "desktop", <RecipeImportAIDemoPanel />),
    align: "left",
    bg: "radial-gradient(1100px 650px at 20% 35%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 20%, rgba(59,130,246,0.14), transparent 60%)",
  },
  {
    ...createStep("share", "desktop", <SharedRecipesDemoPanel />),
    align: "right",
    bg: "radial-gradient(1100px 650px at 75% 35%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 520px at 25% 25%, rgba(251,191,36,0.10), transparent 60%)",
  },
];

export const MOBILE_SHOWCASE_STEPS: MobileShowcaseStep[] = [
  {
    ...createStep(
      "recipes",
      "mobile",
      <RecipeShowcaseDemo variant="mobile" />
    ),
    bg: "radial-gradient(900px 520px at 20% 20%, rgba(251,191,36,0.16), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.16), transparent 60%)",
    demoBaseWidth: 390,
    demoBaseHeight: 980,
    demoOffsetY: -6,
    demoMaxScale: 1,
  },
  {
    ...createStep("groups", "mobile", <WorkGroupsDemoPanel />),
    bg: "radial-gradient(900px 520px at 75% 25%, rgba(34,197,94,0.16), transparent 60%), radial-gradient(900px 520px at 20% 10%, rgba(59,130,246,0.14), transparent 60%)",
    demoBaseWidth: 430,
    demoBaseHeight: 760,
    demoOffsetY: -18,
    demoMaxScale: 1.18,
  },
  {
    ...createStep("import", "mobile", <RecipeImportAIDemoPanel />),
    bg: "radial-gradient(900px 520px at 20% 25%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(59,130,246,0.14), transparent 60%)",
    demoBaseWidth: 430,
    demoBaseHeight: 1060,
    demoOffsetY: -24,
    demoMaxScale: 1.24,
  },
  {
    ...createStep("share", "mobile", <SharedRecipesDemoPanel />),
    bg: "radial-gradient(900px 520px at 75% 25%, rgba(56,189,248,0.18), transparent 60%), radial-gradient(900px 520px at 25% 15%, rgba(251,191,36,0.10), transparent 60%)",
    demoBaseWidth: 430,
    demoBaseHeight: 940,
    demoOffsetY: -16,
    demoMaxScale: 1.2,
  },
];