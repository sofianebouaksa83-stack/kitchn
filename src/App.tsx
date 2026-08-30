// src/App.tsx
import { useCallback, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { LandingPage } from "./components/Landing/";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";
import { ResetPasswordForm } from "./components/Auth/ResetPasswordForm";
import { AuthCallback } from "./components/Auth/AuthCallback";

import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import RecipesEditorPage from "./pages/RecipesEditorPage";
import GroupsPage from "./pages/GroupsPage";
import SharedRecipesPage from "./pages/SharedRecipesPage";
import ImportPage from "./pages/ImportPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionPage from "./pages/SubscriptionPage";

import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import LegalPage from "./pages/Legal";
import InvitationPage from "./pages/InvitationPage";
import HelpCenterPage from "./pages/HelpCenterPage";

import { Navbar } from "./components/Layout/";

import { SubscriptionSuccess } from "./components/Subscription/SubscriptionSuccess";
import { SubscriptionCancel } from "./components/Subscription/SubscriptionCancel";
import { SubscriptionCheckoutPage } from "./components/Subscription/SubscriptionCheckoutPage";



import { ui } from "./styles/ui";
import "./index.css";
import AddToHomePopup from "./components/AddToHomePopup";
import { KitchNLoader } from "./components/Loading/KitchNLoader";

import { VIEW_PATHS, viewFromRoute, type View } from "./app/routes";
import {
  cleanPath,
  normalizeRouteForUrl,
  getRouteQuery,
  isStaticPath,
  isInvitationPath,
  extractInvitationToken,
  getCurrentRouteFromUrl,
} from "./app/navigation";


function MainApp() {
  const { user } = useAuth();

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
          <RecipesPage
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            recipeToOpenId={recipeToOpenId}
            onRecipeOpened={() => setRecipeToOpenId(null)}
          />
        )}

        {currentView === "editor" && (
          <RecipesEditorPage
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
          <SharedRecipesPage
            recipeToOpen={sharedRecipeToOpen}
            onRecipeOpened={() => setSharedRecipeToOpen(null)}
          />
        )}

        {currentView === "groups" && (
          <GroupsPage onViewChange={handleViewChange} />
        )}

        {currentView === "import-ai" && <ImportPage />}

        {currentView === "team" && <TeamPage />}

        {currentView === "subscription" && <SubscriptionPage />}

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

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <KitchNLoader />;
  }

  return (
    <>
      <MainApp />
      <AddToHomePopup />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
