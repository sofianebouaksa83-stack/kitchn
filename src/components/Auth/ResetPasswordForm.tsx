import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Eye, EyeOff, Loader, Lock } from "lucide-react";
import { ui } from "../../styles/ui";
import { GlassPanel } from "../../styles/ui/GlassPanel";

type Props = {
  onBackToLogin?: () => void;
};

function mapError(message?: string) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("password")) return "Mot de passe invalide (minimum 6 caractères).";
  return "Impossible de changer le mot de passe. Réessaie.";
}

export function ResetPasswordForm({ onBackToLogin }: Props) {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Quand l’utilisateur arrive via le lien email,
  // Supabase met la session "recovery" en place automatiquement.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        if (data.session) {
          setReady(true);
        } else {
          setError("Lien invalide ou expiré. Relance une demande depuis la page de connexion.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

    function goToLogin(cleanQuery = true) {
    if (cleanQuery) {
        const url = new URL(window.location.href);
        url.searchParams.delete("reset");
        window.history.replaceState({}, "", url.toString());
    }
    window.location.hash = "/login";
    onBackToLogin?.();
    }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError("Mot de passe trop court (minimum 6 caractères).");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess("Mot de passe mis à jour. Redirection vers la connexion…");
      setTimeout(() => goToLogin(true), 1200);

    } catch (err: any) {
      setError(mapError(err?.message));
    } finally {
      setLoading(false);
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
            <div className="px-8 pt-8 pb-6 border-b border-white/10">
              <div className="flex flex-col items-center text-center gap-3">
                <img
                  src="/Logo_kitchn_horizontal.svg"
                  alt="KITCH'N"
                  className="h-11 sm:h-12 w-auto select-none"
                  draggable={false}
                />
                <p className="text-sm text-slate-200/80">Nouveau mot de passe</p>
              </div>
            </div>

            <div className="px-8 py-7">
              {loading && !ready && !error && (
                <div className="text-slate-200/80 flex items-center gap-2">
                  <Loader className="h-5 w-5 animate-spin" />
                  Vérification du lien…
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  {success}
                </div>
              )}

              {ready && !success && (
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-100/90">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                          h-12 w-full rounded-2xl pl-11 pr-11
                          bg-white/5 border border-white/10
                          text-slate-100 placeholder:text-white/35
                          outline-none transition
                          focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                        "
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/10 transition"
                        aria-label={show ? "Masquer" : "Afficher"}
                      >
                        {show ? (
                          <EyeOff className="h-4 w-4 text-white/50" />
                        ) : (
                          <Eye className="h-4 w-4 text-white/50" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-100/90">
                      Confirmer
                    </label>
                    <input
                      type={show ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="
                        h-12 w-full rounded-2xl px-4
                        bg-white/5 border border-white/10
                        text-slate-100 placeholder:text-white/35
                        outline-none transition
                        focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                      "
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
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
                        Mise à jour...
                      </span>
                    ) : (
                      "Mettre à jour"
                    )}
                  </button>
                </form>
              )}

              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={() => goToLogin(true)}
                  className="text-sm font-semibold text-yellow-300/90 hover:text-yellow-200 transition"
                >
                  Retour connexion
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
