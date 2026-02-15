import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";
import { ui } from "../../styles/ui";
import { GlassPanel } from "../../styles/ui/GlassPanel";
import { setRememberMe, getRememberMe } from "../../lib/authStorage";

type RegisterFormProps = {
  onToggleMode: () => void;
};

const ROLES = [
  "Chef",
  "Sous-Chef",
  "Chef de Partie",
  "Commis",
  "Pâtissier",
  "Boulanger",
  "Cuisinier",
  "Autre",
];

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "Cuisinier",
    establishment: "",
  });

  const [rememberMe, setRemember] = useState<boolean>(() => getRememberMe());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    // ✅ persistence réelle (avant signup)
    setRememberMe(rememberMe);

    const { error } = await signUp(
      formData.email.trim(),
      formData.password,
      formData.fullName,
      formData.role,
      formData.establishment
    );

    if (error) setError("Inscription impossible. Vérifie les champs et réessaie.");
    setLoading(false);
  }

  return (
    <div className={`${ui.pageBg} relative min-h-screen`}>
      {/* Halo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-[560px]">
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
                <p className="text-sm text-slate-200/80">Créer un compte</p>
              </div>
            </div>

            {error && (
              <div className="px-8 pt-6">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={loading}
                  className="
                    h-12 w-full rounded-2xl px-4
                    bg-white/5 border border-white/10
                    text-slate-100 placeholder:text-white/35
                    outline-none transition
                    focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                    disabled:opacity-60
                  "
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="
                    h-12 w-full rounded-2xl px-4
                    bg-white/5 border border-white/10
                    text-slate-100 placeholder:text-white/35
                    outline-none transition
                    focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                    disabled:opacity-60
                  "
                  placeholder="chef@restaurant.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Fonction
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={loading}
                  className="
                    h-12 w-full rounded-2xl px-4
                    bg-white/5 border border-white/10
                    text-slate-100 outline-none transition
                    focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                    disabled:opacity-60
                  "
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="bg-slate-900">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

               <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                    className="
                      h-12 w-full rounded-2xl pl-4 pr-11
                      bg-white/5 border border-white/10
                      text-slate-100 placeholder:text-white/35
                      outline-none transition
                      focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                      disabled:opacity-60
                    "
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    disabled={loading}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-100/90">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={loading}
                    className="
                      h-12 w-full rounded-2xl pl-4 pr-11
                      bg-white/5 border border-white/10
                      text-slate-100 placeholder:text-white/35
                      outline-none transition
                      focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/15
                      disabled:opacity-60
                    "
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                    aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4 text-white/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/50" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={loading}
                    className="
                      h-5 w-5 rounded-md
                      border border-white/15 bg-white/5
                      accent-yellow-300 cursor-pointer
                      disabled:cursor-not-allowed
                    "
                  />
                  <span className="text-sm text-slate-100/85">Se souvenir de moi</span>
                </label>
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
                    Création...
                  </span>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onToggleMode}
                  disabled={loading}
                  className="text-sm font-semibold text-yellow-300/90 hover:text-yellow-200 transition disabled:opacity-50"
                >
                  Déjà un compte ? Se connecter
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
