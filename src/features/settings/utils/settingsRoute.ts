import type { SettingsTab } from "../types/settings.types";

const SETTINGS_TABS: readonly SettingsTab[] = [
  "profile",
  "notifications",
  "invitations",
  "security",
  "subscription",
  "account",
];

function isSettingsTab(value: string | null): value is SettingsTab {
  return SETTINGS_TABS.some((tab) => tab === value);
}

export function getSettingsPath(tab: SettingsTab) {
  return `/settings?tab=${tab}`;
}

export function getSettingsTabFromRoute(route: string): SettingsTab | null {
  const queryIndex = route.indexOf("?");
  const rawPath = queryIndex >= 0 ? route.slice(0, queryIndex) : route;
  const path =
    rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath || "/";

  if (path !== "/settings") return null;

  const query = queryIndex >= 0 ? route.slice(queryIndex + 1) : "";
  const requestedTab = new URLSearchParams(query).get("tab");

  return isSettingsTab(requestedTab) ? requestedTab : null;
}

export function getSettingsTabFromLocation(): SettingsTab | null {
  const currentRoute = `${window.location.pathname || "/"}${
    window.location.search || ""
  }`;
  const currentTab = getSettingsTabFromRoute(currentRoute);

  if (currentTab) return currentTab;

  const legacyHashRoute = window.location.hash.slice(1);
  return legacyHashRoute.startsWith("/")
    ? getSettingsTabFromRoute(legacyHashRoute)
    : null;
}

export function navigateToSettingsTab(
  tab: SettingsTab,
  options: { replace?: boolean } = {}
) {
  const target = getSettingsPath(tab);
  const current = `${window.location.pathname || "/"}${
    window.location.search || ""
  }`;

  if (current !== target || window.location.hash) {
    const method = options.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", target);
  }

  window.dispatchEvent(new Event("popstate"));
}
