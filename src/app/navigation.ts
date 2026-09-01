export function cleanPath(route: string) {
  const path = (route || "/").split("?")[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function normalizeRouteForUrl(route: string) {
  const withSlash = route.startsWith("/") ? route : `/${route}`;
  const queryIndex = withSlash.indexOf("?");

  const path = queryIndex >= 0 ? withSlash.slice(0, queryIndex) : withSlash;
  const query = queryIndex >= 0 ? withSlash.slice(queryIndex) : "";

  return `${cleanPath(path)}${query}`;
}

export function getRouteQuery(route: string) {
  const queryIndex = route.indexOf("?");
  const q = queryIndex >= 0 ? route.slice(queryIndex + 1) : "";
  return new URLSearchParams(q);
}

export function isStaticPath(route: string) {
  const path = cleanPath(route);

  return (
    path === "/privacy" ||
    path === "/terms" ||
    path === "/legal" ||
    path === "/assistance" ||
    path === "/auth/callback"
  );
}

export function isInvitationPath(route: string) {
  const path = cleanPath(route);
  return path.startsWith("/invitation/") || path.startsWith("/invite/");
}

export function extractInvitationToken(route: string) {
  const path = cleanPath(route);

  if (!isInvitationPath(path)) return null;

  const token = path.startsWith("/invite/")
    ? path.replace("/invite/", "").trim()
    : path.replace("/invitation/", "").trim();

  return token.length > 0 ? token : null;
}

export function getCurrentRouteFromUrl() {
  const rawHash = window.location.hash.slice(1);

  if (rawHash.includes("type=recovery")) {
    return "/reset-password";
  }

  if (rawHash.startsWith("/")) {
    const target = normalizeRouteForUrl(rawHash || "/");
    const current = `${window.location.pathname || "/"}${
      window.location.search || ""
    }`;

    if (current !== target || window.location.hash) {
      window.history.replaceState({}, "", target);
    }

    return target;
  }

  return `${window.location.pathname || "/"}${window.location.search || ""}`;
}