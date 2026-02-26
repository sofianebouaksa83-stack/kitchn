import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { LandingPage } from "./components/Landing/";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";
import { InvitationSignup } from "./components/Auth/InvitationSignup";
import { ResetPasswordForm } from "./components/Auth/ResetPasswordForm";

// ✅ AJOUT : pages publiques (landing)
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/terms";

import { Navbar } from "./components/Layout/";

import { RecipeList, RecipeEditorWithSections } from "./components/Recipe";

import { SharedRecipes } from "./components/Sharing/";
import { WorkGroups } from "./components/Groups/";
import { RecipeImportAI } from "./components/Import/";
import { TeamManagement } from "./components/Team/TeamManagement";
import { SubscriptionManagement } from "./components/Subscription/SubscriptionManagement";
import { SubscriptionSuccess } from "./components/Subscription/SubscriptionSuccess";
import { SubscriptionCancel } from "./components/Subscription/SubscriptionCancel";

// ✅ AJOUT : page Paramètres
import SettingsPage from "./components/Settings/SettingsPage";

import { ui } from "./styles/./ui";
import "./index.css";

type View =
  | "recipes"
  | "editor"
  | "groups"
  | "shared"
  | "import-ai"
  | "team"
  | "subscription"
  | "subscription-success"
  | "subscription-cancel"
  | "settings";

function MainApp() {
  const { user, loading } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentView, setCurrentView] = useState<View>("recipes");

  // ✅ IMPORTANT: on accepte null explicitement (Create)
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [routeHash, setRouteHash] = useState<string>(() => window.location.hash.slice(1));
  const [forceResetPassword, setForceResetPassword] = useState(false);

  // ✅ URL sync (token + hash)
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);

      // 1) si on a ?reset=1
      const isResetQuery = params.get("reset") === "1";

      // 2) si Supabase met type=recovery dans le hash
      const rawHash = window.location.hash.slice(1);
      const isRecoveryHash = rawHash.includes("type=recovery");

      setForceResetPassword(isResetQuery || isRecoveryHash);

      // et si reset/recovery : on force la route reset
      if (isResetQuery || isRecoveryHash) {
        setRouteHash("/reset-password");
        return;
      }

      const hash = window.location.hash.slice(1);

      // ✅ Supabase met souvent le reset dans le hash (type=recovery)
      if (hash.includes("type=recovery")) {
        setRouteHash("/reset-password");
        return;
      }

      setRouteHash(hash);

      // Auth routes
      if (hash === "/login") setAuthMode("login");
      if (hash === "/register") setAuthMode("register");

      // ✅ Landing pages publiques (hash routing)
      // Important: on laisse le rendu "non connecté" décider (privacy/terms)
      if (hash === "/privacy" || hash === "/terms") return;

      // ✅ App routes (views)
      if (hash === "/subscription") setCurrentView("subscription");
      else if (hash === "/subscription/success") setCurrentView("subscription-success");
      else if (hash === "/subscription/cancel") setCurrentView("subscription-cancel");
      else if (hash === "/settings") setCurrentView("settings"); // ✅ AJOUT
      else if (hash === "/" || hash === "") setCurrentView("recipes");
    };

    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);
    return () => window.removeEventListener("hashchange", syncFromUrl);
  }, []);

  // ✅ Loading
  if (loading) {
    return (
      <div className={`${ui.dashboardBg} flex items-center justify-center`}>
        <div className="text-slate-200 text-xl animate-pulse">Chargement…</div>
      </div>
    );
  }

  // ✅ Invitation (prioritaire)
  if (invitationToken) {
    return <InvitationSignup token={invitationToken} />;
  }

  // ✅ Reset password (prioritaire)
  if (forceResetPassword || routeHash === "/reset-password") {
    return (
      <ResetPasswordForm
        onBackToLogin={() => {
          // nettoie ?reset=1 (si présent)
          const url = new URL(window.location.href);
          url.searchParams.delete("reset");
          window.history.replaceState({}, "", url.toString());

          // puis retour login
          window.location.hash = "/login";
        }}
      />
    );
  }

  // ✅ Non connecté → Landing / Login / Register / Privacy / Terms
  if (!user) {
    const hash = routeHash;

    if (hash === "/login") {
      return (
        <LoginForm
          onToggleMode={() => {
            setAuthMode("register");
            window.location.hash = "/register";
          }}
        />
      );
    }

    if (hash === "/register") {
      return (
        <RegisterForm
          onToggleMode={() => {
            setAuthMode("login");
            window.location.hash = "/login";
          }}
        />
      );
    }

    if (hash === "/reset-password") {
      return (
        <ResetPasswordForm
          onBackToLogin={() => {
            window.location.hash = "/login";
          }}
        />
      );
    }

    // ✅ pages publiques accessibles depuis la landing (footer)
    if (hash === "/privacy") {
      return <PrivacyPage />;
    }

    if (hash === "/terms") {
      return <TermsPage />;
    }

    return (
      <LandingPage
        onStart={() => {
          setAuthMode("register");
          window.location.hash = "/register";
        }}
        onLogin={() => {
          setAuthMode("login");
          window.location.hash = "/login";
        }}
      />
    );
  }

  // ✅ Actions recettes
  const handleCreateNew = () => {
    setEditingRecipeId(null); // ✅ Create
    setCurrentView("editor");
  };

  const handleEdit = (recipeId: string) => {
    setEditingRecipeId(recipeId);
    setCurrentView("editor");
  };

  const handleSaveComplete = () => {
    setEditingRecipeId(null);
    setCurrentView("recipes");
  };

  const handleBackFromEditor = () => {
    setEditingRecipeId(null);
    setCurrentView("recipes");
  };

  // ✅ App (connecté)
  return (
    <div className={ui.dashboardBg}>
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      <main className={`${ui.container} ${ui.page} pb-20 lg:pb-0`}>
        {currentView === "recipes" && (
          <RecipeList onCreateNew={handleCreateNew} onEdit={handleEdit} />
        )}

        {currentView === "editor" && (
          <RecipeEditorWithSections
            recipeId={editingRecipeId}
            onBack={handleBackFromEditor}
            onSave={handleSaveComplete}
            onCreated={(id) => {
              setEditingRecipeId(id);
              setCurrentView("editor");
            }}
          />
        )}

        {currentView === "shared" && <SharedRecipes />}
        {currentView === "groups" && <WorkGroups />}
        {currentView === "import-ai" && <RecipeImportAI />}
        {currentView === "team" && <TeamManagement />}

        {currentView === "subscription" && <SubscriptionManagement />}
        {currentView === "subscription-success" && <SubscriptionSuccess />}
        {currentView === "subscription-cancel" && <SubscriptionCancel />}

        {/* ✅ AJOUT : Paramètres */}
        {currentView === "settings" && <SettingsPage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;