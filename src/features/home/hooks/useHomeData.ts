import { useEffect, useState } from "react";
import type {
  RecipeItem,
  SharedRecipeItem,
} from "../types/home.types";
import {
  getHomeGroupIds,
  getHomeImportCount,
  getHomeUserIdentity,
  getLatestSharedRecipes,
  getMyLatestRecipes,
  getMyRecipesCount,
  getSharedRecipesCount,
} from "../services/homeDataService";

export function useHomeData(isPremium: boolean) {
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("Chef");
  const [recipesCount, setRecipesCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [importCount, setImportCount] = useState(0);
  const [latestRecipes, setLatestRecipes] = useState<
    RecipeItem[]
  >([]);
  const [
    latestSharedRecipes,
    setLatestSharedRecipes,
  ] = useState<SharedRecipeItem[]>([]);

  useEffect(() => {
    void loadHomeData();

    const onRefresh = () => void loadHomeData();

    const onVisibility = () => {
      if (!document.hidden) {
        void loadHomeData();
      }
    };

    window.addEventListener("focus", onRefresh);
    window.addEventListener("popstate", onRefresh);
    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener(
        "popstate",
        onRefresh
      );
      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  async function loadHomeData() {
    try {
      setLoading(true);

      const userIdentity =
        await getHomeUserIdentity();

      if (!userIdentity) return;

      setFirstName(userIdentity.displayName);

      const periodKey = new Date()
        .toISOString()
        .slice(0, 7);

      const [
        recipesData,
        recipesTotal,
        groupIds,
        currentImportCount,
      ] = await Promise.all([
        getMyLatestRecipes(userIdentity.id),
        getMyRecipesCount(userIdentity.id),
        getHomeGroupIds(userIdentity.id),
        getHomeImportCount(
          userIdentity.id,
          periodKey
        ),
      ]);

      setLatestRecipes(recipesData);
      setRecipesCount(recipesTotal);
      setImportCount(currentImportCount);

      setSharedCount(0);
      setLatestSharedRecipes([]);

      if (groupIds.length === 0) return;

      const sharedTotal =
        await getSharedRecipesCount(groupIds);

      setSharedCount(sharedTotal);

      const latestShared =
        await getLatestSharedRecipes(groupIds);

      setLatestSharedRecipes(latestShared);
    } catch (error) {
      console.error(
        "[HomePage] loadHomeData error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    firstName,
    recipesCount,
    sharedCount,
    importCount,
    latestRecipes,
    latestSharedRecipes,
  };
}