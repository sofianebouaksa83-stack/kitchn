import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
  RecipeDisplayDemo,
  RecipeListDemoPanel,
} from "../../../components/Recipe";
import {
  ShowcaseCursor,
  type ShowcaseCursorState,
} from "./ShowcaseCursor";

type RecipeDemoVariant = "desktop" | "mobile";
type RecipeView = "list" | "detail";

type RecipeDemoAction = {
  delay: number;
  view?: RecipeView;
  recipeId?: string;
  incrementDemo?: boolean;
  cursor?: Partial<ShowcaseCursorState>;
};

type RecipeDemoConfig = {
  initialCursor: ShowcaseCursorState;
  loopDuration: number;
  cursorStiffness: number;
  transitionDuration: number;
  listOffset: number;
  detailOffset: number;
  closedScale?: number;
  actions: RecipeDemoAction[];
};

const CONFIGS: Record<RecipeDemoVariant, RecipeDemoConfig> = {
  desktop: {
    initialCursor: {
      x: 120,
      y: 120,
      click: false,
      visible: true,
    },
    loopDuration: 11200,
    cursorStiffness: 220,
    transitionDuration: 0.45,
    listOffset: -18,
    detailOffset: 18,
    closedScale: 0.985,
    actions: [
      {
        delay: 0,
        view: "list",
        recipeId: "demo-1",
        cursor: { x: 120, y: 92, click: false, visible: true },
      },
      {
        delay: 350,
        cursor: { x: 405, y: 188, click: false, visible: true },
      },
      { delay: 980, cursor: { click: true } },
      { delay: 1120, cursor: { click: false } },
      {
        delay: 1250,
        view: "detail",
        recipeId: "demo-1",
        incrementDemo: true,
      },
      { delay: 1500, cursor: { visible: false } },
      {
        delay: 2850,
        cursor: { x: 175, y: 248, click: false, visible: true },
      },
      { delay: 3300, cursor: { click: true } },
      { delay: 3450, cursor: { click: false } },
      {
        delay: 5600,
        view: "list",
        recipeId: "demo-2",
        cursor: { x: 120, y: 92, click: false, visible: true },
      },
      {
        delay: 6100,
        cursor: { x: 405, y: 245, click: false, visible: true },
      },
      { delay: 6750, cursor: { click: true } },
      { delay: 6900, cursor: { click: false } },
      {
        delay: 7050,
        view: "detail",
        recipeId: "demo-2",
        incrementDemo: true,
      },
      { delay: 7300, cursor: { visible: false } },
      {
        delay: 8600,
        cursor: { x: 175, y: 248, click: false, visible: true },
      },
      { delay: 9050, cursor: { click: true } },
      { delay: 9200, cursor: { click: false } },
    ],
  },

  mobile: {
    initialCursor: {
      x: 140,
      y: 220,
      click: false,
      visible: false,
    },
    loopDuration: 9800,
    cursorStiffness: 240,
    transitionDuration: 0.28,
    listOffset: -24,
    detailOffset: 24,
    actions: [
      {
        delay: 0,
        view: "list",
        recipeId: "demo-1",
        incrementDemo: true,
        cursor: { x: 150, y: 290, click: false, visible: false },
      },
      {
        delay: 500,
        cursor: { x: 248, y: 468, click: false, visible: true },
      },
      { delay: 1150, cursor: { click: true } },
      { delay: 1300, cursor: { click: false } },
      {
        delay: 1420,
        view: "detail",
        recipeId: "demo-1",
        incrementDemo: true,
      },
      { delay: 1600, cursor: { visible: false } },
      {
        delay: 3350,
        cursor: { x: 96, y: 150, click: false, visible: true },
      },
      { delay: 3900, cursor: { click: true } },
      { delay: 4040, cursor: { click: false } },
      {
        delay: 4170,
        view: "list",
        recipeId: "demo-2",
      },
      { delay: 4360, cursor: { visible: false } },
      {
        delay: 4950,
        cursor: { x: 248, y: 596, click: false, visible: true },
      },
      { delay: 5600, cursor: { click: true } },
      { delay: 5740, cursor: { click: false } },
      {
        delay: 5880,
        view: "detail",
        recipeId: "demo-2",
        incrementDemo: true,
      },
      { delay: 6080, cursor: { visible: false } },
      {
        delay: 7600,
        cursor: { x: 312, y: 265, click: false, visible: true },
      },
      { delay: 8100, cursor: { click: true } },
      { delay: 8240, cursor: { click: false } },
      { delay: 8600, cursor: { visible: false } },
    ],
  },
};

export function RecipeShowcaseDemo({
  variant,
}: {
  variant: RecipeDemoVariant;
}) {
  const config = CONFIGS[variant];

  const [view, setView] = useState<RecipeView>("list");
  const [selectedRecipeId, setSelectedRecipeId] = useState("demo-1");
  const [demoTick, setDemoTick] = useState(0);
  const [cursor, setCursor] = useState<ShowcaseCursorState>(
    () => ({ ...config.initialCursor })
  );

  useEffect(() => {
    let cancelled = false;
    let timers: number[] = [];

    const runSequence = () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = config.actions.map((action) =>
        window.setTimeout(() => {
          if (cancelled) return;

          if (action.view) setView(action.view);
          if (action.recipeId) setSelectedRecipeId(action.recipeId);
          if (action.incrementDemo) {
            setDemoTick((current) => current + 1);
          }
          if (action.cursor) {
            setCursor((current) => ({
              ...current,
              ...action.cursor,
            }));
          }
        }, action.delay)
      );
    };

    runSequence();
    const loop = window.setInterval(runSequence, config.loopDuration);

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(loop);
    };
  }, [config]);

  const scaleVariants =
    config.closedScale === undefined
      ? {}
      : {
          open: { scale: 1 },
          closed: { scale: config.closedScale },
        };

  return (
    <motion.div
      initial={{ opacity: 0.96, scale: 0.992 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: variant === "desktop" ? 0.5 : 0.45,
        ease: "easeOut",
      }}
      className="relative w-full h-full rounded-3xl overflow-hidden ring-1 ring-white/10 bg-white/[0.02]"
    >
      <ShowcaseCursor
        x={cursor.x}
        y={cursor.y}
        click={cursor.click}
        visible={cursor.visible}
        stiffness={config.cursorStiffness}
      />

      <motion.div
        initial={false}
        animate={view === "list" ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            x: 0,
            pointerEvents: "auto",
            ...scaleVariants.open,
          },
          closed: {
            opacity: 0,
            x: config.listOffset,
            pointerEvents: "none",
            ...scaleVariants.closed,
          },
        }}
        transition={{
          duration: config.transitionDuration,
          ease: "easeInOut",
        }}
        className="absolute inset-0 z-10"
      >
        <RecipeListDemoPanel
          onCreateNew={() => undefined}
          onOpenRecipe={(recipeId) => {
            setSelectedRecipeId(recipeId);
            setView("detail");
            setDemoTick((current) => current + 1);
          }}
          autoDemo
          highlightedRecipeId={selectedRecipeId}
        />
      </motion.div>

      <motion.div
        initial={false}
        animate={view === "detail" ? "open" : "closed"}
        variants={{
          open: {
            opacity: 1,
            x: 0,
            pointerEvents: "auto",
            ...scaleVariants.open,
          },
          closed: {
            opacity: 0,
            x: config.detailOffset,
            pointerEvents: "none",
            ...scaleVariants.closed,
          },
        }}
        transition={{
          duration: config.transitionDuration,
          ease: "easeInOut",
        }}
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