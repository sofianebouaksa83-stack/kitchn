import {
  useEffect,
  useState,
} from "react";
import type { SharedRecipeOpen } from "../../features/sharing/types/sharing.types";
import { SharedRecipesDesktop } from "./SharedRecipesDesktop";
import { SharedRecipesMobile } from "./SharedRecipesMobile";

type Props = {
  recipeToOpen?: SharedRecipeOpen | null;
  onRecipeOpened?: () => void;
};

const DESKTOP_QUERY = "(min-width: 1024px)";

function getIsDesktop() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export function SharedRecipes(props: Props) {
  const [isDesktop, setIsDesktop] =
    useState(getIsDesktop);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(DESKTOP_QUERY);

    const handleChange = (
      event: MediaQueryListEvent
    ) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
    };
  }, []);

  if (isDesktop) {
    return <SharedRecipesDesktop {...props} />;
  }

  return <SharedRecipesMobile {...props} />;
}