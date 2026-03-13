// src/App.tsx
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { LandingPage } from "./components/Landing/";
import { LoginForm } from "./components/Auth/LoginForm";
import { RegisterForm } from "./components/Auth/RegisterForm";
import { InvitationSignup } from "./components/Auth/InvitationSignup";
import { ResetPasswordForm } from "./components/Auth/ResetPasswordForm";
import { AuthCallback } from "./components/Auth/AuthCallback";

// ✅ Pages publiques (vraies routes + support hash)
import PrivacyPage from "./pages/Privacy";
import TermsPage from "./pages/Terms";
import LegalPage from "./pages/Legal";

// ✅ Nouvelle page invitation (token-based)
import InvitationPage from "./pages/InvitationPage";

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

// ✅ Page Paramètres
import SettingsPage from "./components/Settings/SettingsPage";

import { ui } from "./styles/ui";
import "./index.css";

type View =
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

/** Helpers: routing maison */
function isStaticPath(path: string) {
  return (
    path === "/privacy" ||
    path === "/terms" ||
    path === "/legal" ||
    path === "/auth/callback"
  );
}

function isInvitationPath(path: string) {
  return path.startsWith("/invitation/") || path.startsWith("/invite/");
}

function extractInvitationToken(path: string) {
  if (!isInvitationPath(path)) return null;

  const token = path.startsWith("/invite/")
    ? path.replace("/invite/", "").trim()
    : path.replace("/invitation/", "").trim();

  return token.length > 0 ? token : null;
}

function stripQuery(route: string) {
  return route.split("?")[0] || route;
}

function getHashQuery(route: string) {
  const q = route.split("?")[1] ?? "";
  return new URLSearchParams(q);
}

function MainApp() {
  const { user, loading } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [currentView, setCurrentView] = useState<View>("recipes");

  // ✅ IMPORTANT: on accepte null explicitement (Create)
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

  // (legacy) Si tu utilises encore InvitationSignup ailleurs
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  /**
   * routeHash = "route interne"
   * - support hash routing:   #/login, #/privacy, #/legal...
   * - support vraie route:    /privacy, /terms, /legal, /auth/callback, /invitation/:token
   */
  const [routeHash, setRouteHash] = useState<string>(() => {
    const path = window.location.pathname;

    // ✅ garder les vraies routes
    if (isStaticPath(path) || isInvitationPath(path)) {
      return path;
    }

    // Sinon, fallback hash
    return window.location.hash.slice(1);
  });

  const [forceResetPassword, setForceResetPassword] = useState(false);

  // ✅ URL sync (token + hash + pathname)
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const path = window.location.pathname;

      // vraies routes (privacy / terms / legal / auth)
      if (isStaticPath(path)) {
        setRouteHash(path);
        return;
      }

      // invitation
      if (isInvitationPath(path)) {
        setRouteHash(path);
        return;
}

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
      const cleanHash = stripQuery(hash);

      // ✅ Supabase met souvent le reset dans le hash (type=recovery)
      if (hash.includes("type=recovery")) {
        setRouteHash("/reset-password");
        return;
      }

      setRouteHash(hash);

      // Auth routes (support query ?redirect=...)
      if (cleanHash === "/login") setAuthMode("login");
      if (cleanHash === "/register") setAuthMode("register");

      // ✅ Landing pages publiques (hash routing)
      if (
        cleanHash === "/privacy" ||
        cleanHash === "/terms" ||
        cleanHash === "/legal"
      ) {
        return;
      }

      // ✅ Invitation route (hash routing) : #/invitation/<token>
      if (
        cleanHash.startsWith("/invitation/") ||
        cleanHash.startsWith("/invite/")
      ) {
        return;
      }

      // ✅ App routes (views)
      if (cleanHash === "/subscription") setCurrentView("subscription");
      else if (cleanHash === "/subscription/success")
        setCurrentView("subscription-success");
      else if (cleanHash === "/subscription/cancel")
        setCurrentView("subscription-cancel");
      else if (cleanHash === "/settings") setCurrentView("settings");
      else if (cleanHash === "/groups") setCurrentView("groups");
      else if (cleanHash === "/shared") setCurrentView("shared");
      else if (cleanHash === "/import-ai") setCurrentView("import-ai");
      else if (cleanHash === "/team") setCurrentView("team");
      else if (cleanHash === "/" || cleanHash === "") setCurrentView("recipes");
    };

    syncFromUrl();
    window.addEventListener("hashchange", syncFromUrl);

    return () => {
      window.removeEventListener("hashchange", syncFromUrl);
    };
  }, []);

  // ✅ Loading
  if (loading) {
    return (
      <div className={`${ui.dashboardBg} flex items-center justify-center`}>
        <div className="text-slate-200 text-xl animate-pulse">Chargement…</div>
      </div>
    );
  }

  // ✅ Route invitation (prioritaire, marche connecté ou non)
  // Support: /invitation/<token> et #/invitation/<token>
  const invitationFromRoute = extractInvitationToken(routeHash);
  if (invitationFromRoute) {
    return <InvitationPage />;
  }

  // ✅ InvitationSignup legacy (si tu l’utilises encore via state)
  if (invitationToken) {
    return <InvitationSignup token={invitationToken} />;
  }

  // ✅ Reset password (prioritaire)
  if (forceResetPassword || stripQuery(routeHash) === "/reset-password") {
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

  // ✅ Non connecté → Landing / Login / Register / Privacy / Terms / Legal / AuthCallback
  if (!user) {
    const hash = routeHash;
    const cleanHash = stripQuery(hash);

    // ✅ Support /auth/callback en vraie route (et aussi #/auth/callback)
    if (cleanHash === "/auth/callback") {
      return <AuthCallback />;
    }

    if (cleanHash === "/login") {
      return (
        <LoginForm
          onToggleMode={() => {
            setAuthMode("register");
            window.location.hash = "/register";
          }}
          onSuccess={() => {
            // ✅ redirect après login : #/login?redirect=/invitation/xxx
            const params = getHashQuery(window.location.hash.slice(1));
            const redirect = params.get("redirect");
            if (redirect) window.location.hash = redirect;
            else window.location.hash = "/"; // fallback
          }}
        />
      );
    }

    if (cleanHash === "/register") {
      return (
        <RegisterForm
          onToggleMode={() => {
            setAuthMode("login");
            window.location.hash = "/login";
          }}
        />
      );
    }

    if (cleanHash === "/reset-password") {
      return (
        <ResetPasswordForm
          onBackToLogin={() => {
            window.location.hash = "/login";
          }}
        />
      );
    }

    // ✅ pages publiques accessibles depuis la landing (footer)
    // -> marche pour /privacy /terms /legal et aussi #/privacy #/terms #/legal
    if (cleanHash === "/privacy") {
      return <PrivacyPage />;
    }

    if (cleanHash === "/terms") {
      return <TermsPage />;
    }

    if (cleanHash === "/legal") {
      return <LegalPage />;
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
        {currentView === "groups" && (
          <WorkGroups onViewChange={setCurrentView} />
        )}
        {currentView === "import-ai" && <RecipeImportAI />}
        {currentView === "team" && <TeamManagement />}
        
        {currentView === "subscription-checkout" && (
          <SubscriptionCheckoutPage
            onBack={() => setCurrentView("subscription")}
          />
        )}
        {currentView === "subscription-success" && <SubscriptionSuccess />}
        {currentView === "subscription-cancel" && <SubscriptionCancel />}

        {currentView === "settings" && (
          <SettingsPage onViewChange={setCurrentView} />
        )}
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