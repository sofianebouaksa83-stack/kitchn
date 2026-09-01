export type View =
  | "accueil"
  | "recipes"
  | "editor"
  | "groups"
  | "shared"
  | "import-ai"
  | "team"
  | "subscription"
  | "subscription-checkout"
  | "subscription-success"
  | "subscription-cancel"
  | "settings";

export const VIEW_PATHS: Record<View, string> = {
  accueil: "/accueil",
  recipes: "/recipes",
  editor: "/recipes/edit",
  groups: "/groups",
  shared: "/shared",
  "import-ai": "/import-ai",
  team: "/team",
  subscription: "/subscription",
  "subscription-checkout": "/subscription/checkout",
  "subscription-success": "/subscription/success",
  "subscription-cancel": "/subscription/cancel",
  settings: "/settings",
};

export function viewFromRoute(route: string): View | null {
  const path = route.length > 1 ? route.replace(/\/+$/, "") : route;

  switch (path) {
    case "/":
    case "/accueil":
    case "/home":
      return "accueil";

    case "/recipes":
      return "recipes";

    case "/recipes/new":
    case "/recipes/edit":
      return "editor";

    case "/groups":
    case "/work_groups":
    case "/work-groups":
      return "groups";

    case "/shared":
    case "/shared-recipes":
      return "shared";

    case "/import-ai":
    case "/import":
      return "import-ai";

    case "/team":
      return "team";

    case "/subscription":
      return "subscription";

    case "/subscription/checkout":
    case "/subscription-checkout":
      return "subscription-checkout";

    case "/subscription/success":
    case "/subscription-success":
      return "subscription-success";

    case "/subscription/cancel":
    case "/subscription-cancel":
      return "subscription-cancel";

    case "/settings":
      return "settings";

    default:
      return null;
  }
}