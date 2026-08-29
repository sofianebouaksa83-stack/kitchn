import type { RecipeRow } from "../types/sharing.types";

export function cn(
  ...classes: Array<string | undefined | false>
) {
  return classes.filter(Boolean).join(" ");
}

export function safeTitle(
  recipe?: RecipeRow | null
) {
  const title = (recipe?.title || "").trim();
  return title || "Sans titre";
}

export function getPendingSharedOpen() {
  return {
    groupId:
      sessionStorage.getItem("selectedWorkGroupId") ||
      sessionStorage.getItem("selectedSharedGroupId"),
    recipeId: sessionStorage.getItem(
      "selectedSharedRecipeId"
    ),
  };
}

export function clearPendingSharedOpen() {
  sessionStorage.removeItem("selectedSharedRecipeId");
  sessionStorage.removeItem("selectedWorkGroupId");
  sessionStorage.removeItem("selectedSharedGroupId");
}