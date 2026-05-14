// src/App.tsx
import { useCallback, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { LandingPage } from "./components/Landing/";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";
import { ResetPasswordForm } from "./components/Auth/ResetPasswordForm";
import { AuthCallback } from "./components/Auth/AuthCallback";
import HomePage from "./components/HomePage/HomePage";

import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import LegalPage from "./pages/Legal";
import InvitationPage from "./pages/InvitationPage";
import HelpCenterPage from "./pages/HelpCenterPage";

import { Navbar } from "./components/Layout/";
import { RecipeList, RecipeEditorWithSections } from "./components/Recipe";

import { SharedRecipes } from "./components/Sharing/";
import { WorkGroups } from "./components/Groups/";
import { RecipeImportAI } from "./components/Import/";
import { TeamManagement } from "./components/Team/TeamManagement";
import { SubscriptionManagement } from "./components/Subscription/SubscriptionManagement";
import { SubscriptionSuccess } from "./components/Subscription/SubscriptionSuccess";
import { SubscriptionCancel } from "./components/Subscription/SubscriptionCancel";
import { SubscriptionCheckoutPage } from "./components/Subscription/SubscriptionCheckoutPage";

import SettingsPage from "./components/Settings/SettingsPage";

import { ui } from "./styles/ui";
import "./index.css";
import AddToHomePopup from "./components/AddToHomePopup";

type View =
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

const VIEW_PATHS: Record<View, string> = {
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

function cleanPath(route: string) {
  const path = (route || "/").split("?")[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function normalizeRouteForUrl(route: string) {
  const withSlash = route.startsWith("/") ? route : `/${route}`;
  const queryIndex = withSlash.indexOf("?");

  const path = queryIndex >= 0 ? withSlash.slice(0, queryIndex) : withSlash;
  const query = queryIndex >= 0 ? withSlash.slice(queryIndex) : "";

  return `${cleanPath(path)}${query}`;
}

function getRouteQuery(route: string) {
  const queryIndex = route.indexOf("?");
  const q = queryIndex >= 0 ? route.slice(queryIndex + 1) : "";
  return new URLSearchParams(q);
}

function isStaticPath(route: string) {
  const path = cleanPath(route);

  return (
    path === "/privacy" ||
    path === "/terms" ||
    path === "/legal" ||
    path === "/assistance" ||
    path === "/auth/callback"
  );
}

function isInvitationPath(route: string) {
  const path = cleanPath(route);
  return path.startsWith("/invitation/") || path.startsWith("/invite/");
}

function extractInvitationToken(route: string) {
  const path = cleanPath(route);

  if (!isInvitationPath(path)) return null;

  const token = path.startsWith("/invite/")
    ? path.replace("/invite/", "").trim()
    : path.replace("/invitation/", "").trim();

  return token.length > 0 ? token : null;
}

function viewFromRoute(route: string): View | null {
  const path = cleanPath(route);

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

function getCurrentRouteFromUrl() {
  const rawHash = window.location.hash.slice(1);

  // Supabase reset password peut mettre les infos dans le hash
  if (rawHash.includes("type=recovery")) {
    return "/reset-password";
  }

  // Ancien routing en #/... => conversion automatique en vraie URL
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

function MainApp() {
  const { user, loading } = useAuth();

  const [, setAuthMode] = useState<"login" | "register">("login");
  const [currentView, setCurrentView] = useState<View>("accueil");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [recipeToOpenId, setRecipeToOpenId] = useState<string | null>(null);
  const [sharedRecipeToOpen, setSharedRecipeToOpen] = useState<{
    recipeId: string;
    groupId: string;
  } | null>(null);
  const [routePath, setRoutePath] = useState<string>(() =>
    getCurrentRouteFromUrl()
  );
  const [forceResetPassword, setForceResetPassword] = useState(false);

  const navigateTo = useCallback((path: string, replace = false) => {
    const target = normalizeRouteForUrl(path);

    if (replace) {
      window.history.replaceState({}, "", target);
    } else {
      window.history.pushState({}, "", target);
    }

    window.dispatchEvent(new Event("popstate"));
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.slice(1);

      const isResetQuery = params.get("reset") === "1";
      const isRecoveryHash = rawHash.includes("type=recovery");

      if (isResetQuery || isRecoveryHash) {
        setForceResetPassword(true);
        setRoutePath("/reset-password");
        return;
      }

      setForceResetPassword(false);

      const route = getCurrentRouteFromUrl();
      const cleanRoute = cleanPath(route);

      setRoutePath(route);

      if (cleanRoute === "/login") setAuthMode("login");
      if (cleanRoute === "/register") setAuthMode("register");

      if (isStaticPath(cleanRoute) || isInvitationPath(cleanRoute)) {
        return;
      }

      const nextView = viewFromRoute(cleanRoute);
      if (nextView) {
        setCurrentView(nextView);
      }
    };

    syncFromUrl();

    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener("hashchange", syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener("hashchange", syncFromUrl);
    };
  }, []);

  const handleViewChange = useCallback(
    (view: View) => {
      setCurrentView(view);

      if (view !== "editor") {
        setEditingRecipeId(null);
      }

      setRecipeToOpenId(null);
      setSharedRecipeToOpen(null);

      navigateTo(VIEW_PATHS[view]);
    },
    [navigateTo]
  );

  if (loading) {
    return (
      <div className={`${ui.dashboardBg} flex items-center justify-center`}>
        <div className="text-slate-200 text-xl animate-pulse">Chargement…</div>
      </div>
    );
  }

  const cleanRoute = cleanPath(routePath);

  // Route invitation prioritaire
  const invitationFromRoute = extractInvitationToken(routePath);
  if (invitationFromRoute) {
    return <InvitationPage />;
  }

  // Reset password prioritaire
  if (forceResetPassword || cleanRoute === "/reset-password") {
    return (
      <ResetPasswordForm
        onBackToLogin={() => {
          navigateTo("/login", true);
        }}
      />
    );
  }

  // Routes publiques
  if (cleanRoute === "/privacy") {
    return <PrivacyPage />;
  }

  if (cleanRoute === "/terms") {
    return <TermsPage />;
  }

  if (cleanRoute === "/legal") {
    return <LegalPage />;
  }

  if (cleanRoute === "/assistance") {
    return <HelpCenterPage />;
  }

  if (cleanRoute === "/auth/callback") {
    return <AuthCallback />;
  }

  // Non connecté
  if (!user) {
    if (cleanRoute === "/login") {
      return (
        <LoginForm
          onToggleMode={() => {
            setAuthMode("register");
            navigateTo("/register");
          }}
          onSuccess={() => {
            const params = getRouteQuery(routePath);
            const redirect = params.get("redirect");

            if (redirect && redirect.startsWith("/")) {
              navigateTo(redirect);
            } else {
              navigateTo("/accueil");
            }
          }}
        />
      );
    }

    if (cleanRoute === "/register") {
      return (
        <RegisterForm
          onToggleMode={() => {
            setAuthMode("login");
            navigateTo("/login");
          }}
        />
      );
    }

    if (cleanRoute === "/reset-password") {
      return (
        <ResetPasswordForm
          onBackToLogin={() => {
            navigateTo("/login");
          }}
        />
      );
    }

    return (
      <LandingPage
        onStart={() => {
          setAuthMode("register");
          navigateTo("/register");
        }}
        onLogin={() => {
          setAuthMode("login");
          navigateTo("/login");
        }}
      />
    );
  }

  const handleCreateNew = () => {
    setEditingRecipeId(null);
    setCurrentView("editor");
    navigateTo("/recipes/new");
  };

  const handleEdit = (recipeId: string) => {
    setEditingRecipeId(recipeId);
    setCurrentView("editor");
    navigateTo("/recipes/edit");
  };

  const handleSaveComplete = () => {
    setEditingRecipeId(null);
    setCurrentView("recipes");
    navigateTo("/recipes");
  };

  const handleBackFromEditor = () => {
    setEditingRecipeId(null);
    setCurrentView("recipes");
    navigateTo("/recipes");
  };

  return (
    <div className={ui.dashboardBg}>
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      <main className={`${ui.container} ${ui.page} pb-20 lg:pb-0`}>
        {currentView === "accueil" && (
          <HomePage
            navigateTo={navigateTo}
            openRecipe={(recipeId) => {
              setRecipeToOpenId(recipeId);
              setSharedRecipeToOpen(null);
              setCurrentView("recipes");
              navigateTo("/recipes");
            }}
            openSharedRecipe={(recipeId, groupId) => {
              setSharedRecipeToOpen({ recipeId, groupId });
              setRecipeToOpenId(null);
              sessionStorage.setItem("selectedSharedRecipeId", recipeId);
              sessionStorage.setItem("selectedWorkGroupId", groupId);
              setCurrentView("shared");
              navigateTo("/shared");
            }}
          />
        )}

        {currentView === "recipes" && (
          <RecipeList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            recipeToOpenId={recipeToOpenId}
            onRecipeOpened={() => setRecipeToOpenId(null)}
          />
        )}

        {currentView === "editor" && (
          <RecipeEditorWithSections
            recipeId={editingRecipeId}
            onBack={handleBackFromEditor}
            onSave={handleSaveComplete}
            onCreated={(id) => {
              setEditingRecipeId(id);
              setCurrentView("editor");
              navigateTo("/recipes/edit");
            }}
          />
        )}

        {currentView === "shared" && (
          <SharedRecipes
            recipeToOpen={sharedRecipeToOpen}
            onRecipeOpened={() => setSharedRecipeToOpen(null)}
          />
        )}

        {currentView === "groups" && (
          <WorkGroups onViewChange={handleViewChange} />
        )}

        {currentView === "import-ai" && <RecipeImportAI />}

        {currentView === "team" && <TeamManagement />}

        {currentView === "subscription" && <SubscriptionManagement />}

        {currentView === "subscription-checkout" && (
          <SubscriptionCheckoutPage
            onBack={() => handleViewChange("subscription")}
          />
        )}

        {currentView === "subscription-success" && <SubscriptionSuccess />}

        {currentView === "subscription-cancel" && <SubscriptionCancel />}

        {currentView === "settings" && (
          <SettingsPage onViewChange={handleViewChange} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
      <AddToHomePopup />
    </AuthProvider>
  );
}

export default App;