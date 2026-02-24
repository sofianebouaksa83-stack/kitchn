import React, { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Mail, Lock, Eye, EyeOff, Loader } from "lucide-react";
import { ui } from "../../styles/ui";
import { GlassPanel } from "../../styles/ui/GlassPanel";
import { setRememberMe, getRememberMe } from "../../lib/authStorage";

type LoginFormProps = {
  // aligné avec App.tsx
  onToggleMode?: () => void;
  onSuccess?: () => void;
};

function mapAuthError(message?: string) {
  const m = (message ?? "").toLowerCase();

  if (!m) return "Connexion impossible.";
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Email non confirmé. Vérifie ta boîte mail.";
  if (m.includes("too many requests")) return "Trop de tentatives. Réessaie dans quelques minutes.";
  if (m.includes("user not found")) return "Aucun compte trouvé avec cet email.";
  if (m.includes("password") && m.includes("invalid")) return "Mot de passe incorrect.";

  return "Connexion impossible. Vérifie tes infos et réessaie.";
}

export function LoginForm({ onToggleMode, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRemember] = useState<boolean>(() => getRememberMe());
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<null | "google" | "apple">(null);

  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canReset = useMemo(() => email.trim().length > 3, [email]);

  const disabledAll = loading || !!oauthLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    // ✅ persistence réelle (avant login)
    setRememberMe(rememberMe);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      onSuccess?.();
    } catch (err: any) {
      setError(mapAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError(null);
    setInfo(null);

    if (!canReset) {
      setError("Entre ton email pour recevoir le lien de réinitialisation.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + "/?reset=1",
      });

      if (error) throw error;

      setInfo("Email envoyé. Vérifie ta boîte mail (et les spams).");
    } catch (err: any) {
      setError(mapAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setInfo(null);
    setOauthLoading(provider);

    // ✅ Même logique que ton app (tu peux remplacer si tu as une route dédiée)
    const redirectTo = window.location.origin;

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      // si pas d'erreur, Supabase redirige → on ne fait rien ici
    } catch (err: any) {
      setError(mapAuthError(err?.message));
      setOauthLoading(null);
    }
  }

  return (
    <div className={`${ui.pageBg} relative min-h-screen`}>
      {/* Halo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px]">
          <GlassPanel className="overflow-hidden">
            {/* Header centré logo */}
            <div className="px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src="/Logo_kitchn_horizontal.svg"
                  alt="KITCH'N"
                  className="h-11 sm:h-12 w-auto select-none"
                  draggable={false}
                />
                <p className="text-sm text-slate-200/80">
                  Gestion professionnelle de recettes
                </p>
              </div>
            </div>

            <div className="px-8 pt-6">
              {/* OAuth */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOAuth("google")}
                  disabled={disabledAll}
                  className="
                    h-12 w-full rounded-2xl font-semibold
                    bg-white text-slate-950
                    border border-white/10
                    hover:bg-white/95
                    transition
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {oauthLoading === "google" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Connexion Google...
                    </span>
                  ) : (
                    "Continuer avec Google"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuth("apple")}
                  disabled={disabledAll}
                  className="
                    h-12 w-full rounded-2xl font-semibold
                    bg-black/70 text-white
                    border border-white/10
                    hover:bg-black/60
                    transition
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {oauthLoading === "apple" ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Connexion Apple...
                    </span>
                  ) : (
                    "Continuer avec Apple"
                  )}
                </button>
              </div>

              {/* Separator */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <div className="text-xs font-semibold text-white/45">ou</div>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pb-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: chef@restaurant.com"
                    disabled={disabledAll}
                    className="
                      h-12 w-full rounded-2xl pl-11 pr-4
                      bg-white/5 border border-white/10
                      text-slate-100 placeholder:text-white/35
                      outline-none transition
                      focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                      disabled:opacity-60
                    "
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={disabledAll}
                    className="
                      h-12 w-full rounded-2xl pl-11 pr-11
                      bg-white/5 border border-white/10
                      text-slate-100 placeholder:text-white/35
                      outline-none transition
                      focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                      disabled:opacity-60
                    "
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={disabledAll}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + reset */}
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-3 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={disabledAll}
                    className="
                      h-5 w-5 rounded-md
                      border border-white/15 bg-white/5
                      accent-yellow-300 cursor-pointer
                      disabled:cursor-not-allowed
                    "
                  />
                  <span className="text-sm text-slate-100/85">Se souvenir de moi</span>
                </label>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={disabledAll}
                  className="text-sm font-semibold text-yellow-300/90 hover:text-yellow-200 transition disabled:opacity-50"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {info && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {info}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={disabledAll}
                className="
                  h-12 w-full rounded-2xl font-semibold
                  text-slate-950
                  bg-gradient-to-r from-yellow-300 to-orange-400
                  hover:from-yellow-200 hover:to-orange-300
                  shadow-[0_14px_40px_rgba(255,184,0,0.18)]
                  transition
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onToggleMode?.()}
                  disabled={disabledAll}
                  className="text-sm font-semibold text-yellow-300/90 hover:text-yellow-200 transition disabled:opacity-50"
                >
                  Créer un compte
                </button>
              </div>
            </form>
          </GlassPanel>

          <div className="mt-4 text-center text-xs text-white/35">
            © {new Date().getFullYear()} KITCH&apos;N
          </div>
        </div>
      </div>
    </div>
  );
}