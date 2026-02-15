import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ChefHat,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  Loader,
  LogOut,
} from 'lucide-react';
import { ui } from '../../styles/ui';

interface InvitationSignupProps {
  token: string;
}

interface InvitationData {
  email: string;
  restaurantName: string;
  expired: boolean;
}

export function InvitationSignup({ token }: InvitationSignupProps) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('Cuisinier');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputClass = ui.inputSoft ?? ui.input;
  const textareaClass = ui.textareaSoft ?? ui.textarea ?? inputClass;
  const selectClass = ui.selectSoft ?? ui.inputSoft ?? ui.input;
  const btnPrimary = ui.btnPrimary;
  const pageBg = ui.dashboardBg;

  // Vérifier le token d'invitation au chargement
  useEffect(() => {
    async function checkInvitation() {
      try {
        setLoading(true);
        setError('');

        // Vérifier si un utilisateur est déjà connecté
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser({ email: user.email || '' });
        }

        // Vérifier que le token existe et n'est pas expiré
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .select('email, restaurant_id, expires_at')
          .eq('token', token)
          .is('accepted_at', null)
          .maybeSingle();

        if (invitationError || !invitationData) {
          setError('Invitation introuvable.');
          setLoading(false);
          return;
        }

        // Vérifier si l'invitation est expirée
        if (new Date(invitationData.expires_at) < new Date()) {
          setInvitation({
            email: invitationData.email,
            restaurantName: '',
            expired: true,
          });
          setError('Cette invitation a expiré.');
          setLoading(false);
          return;
        }

        // Récupérer le nom du restaurant
        const { data: restaurantData } = await supabase
          .from('restaurants')
          .select('name')
          .eq('id', invitationData.restaurant_id)
          .maybeSingle();

        setInvitation({
          email: invitationData.email,
          restaurantName: restaurantData?.name || 'un restaurant',
          expired: false,
        });

        setLoading(false);
      } catch (err) {
        console.error('Error checking invitation:', err);
        setError("Erreur lors de la vérification de l'invitation.");
        setLoading(false);
      }
    }

    checkInvitation();
  }, [token]);

  // Créer le compte et accepter l'invitation
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!invitation) return;

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // 1. Créer le compte utilisateur avec Supabase Auth
      // On ajoute un flag invitation_signup pour que le trigger ne crée pas de restaurant
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            job_title: jobTitle,
            invitation_signup: true,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // 2. Attendre un peu pour que le trigger se termine
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. Appeler la fonction accept_invitation pour lier au restaurant
      const { data: acceptResult, error: acceptError } = await supabase.rpc(
        'accept_invitation',
        {
          invitation_token: token,
          new_user_id: authData.user.id,
          full_name: fullName,
          job_title: jobTitle,
        }
      );

      if (acceptError) {
        throw new Error(
          `Erreur lors de l'acceptation de l'invitation: ${acceptError.message}`
        );
      }

      if (!acceptResult || !acceptResult.success) {
        throw new Error(
          acceptResult?.error ||
            "Erreur inconnue lors de l'acceptation de l'invitation"
        );
      }

      setSuccess(true);

      // Rediriger vers la page principale après 2 secondes
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte');
      setSubmitting(false);
    }
  }

  // Fonction pour se déconnecter
  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      setCurrentUser(null);
      setLoggingOut(false);
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
    }
  }

  // Écran de chargement
  if (loading) {
    return (
      <div className={`${pageBg} flex min-h-screen items-center justify-center px-4`}>
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
          <p className={ui.muted}>Vérification de l'invitation...</p>
        </div>
      </div>
    );
  }

  // Écran de déconnexion nécessaire
  if (currentUser && !success) {
    return (
      <div className={`${pageBg} flex min-h-screen items-center justify-center px-4`}>
        <div className={`${ui.glassPanel} w-full max-w-md p-6 sm:p-8`}>
          <div className="text-center mb-6">
            <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/25 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] mb-4">
              <ChefHat className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-2">Déjà connecté</h2>
            <p className={`${ui.muted} mb-4`}>Vous êtes actuellement connecté avec le compte :</p>

            <div className="bg-slate-950/30 border border-slate-800/70 rounded-xl p-3 mb-6">
              <p className="text-amber-400 font-medium break-words">{currentUser.email}</p>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Pour accepter cette invitation et créer un nouveau compte, vous devez d'abord vous déconnecter.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className={`${btnPrimary} w-full disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loggingOut ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Déconnexion...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  <span>Se déconnecter et continuer</span>
                </>
              )}
            </button>

            <a
              href="/"
              className={`${ui.btnGhost} w-full justify-center`}
            >
              Retour à l'accueil
            </a>
          </div>

          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl">
            <p className="text-amber-200 text-sm">
              <strong>💡 Astuce :</strong> Vous pouvez aussi ouvrir ce lien dans une fenêtre de navigation privée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error && !invitation) {
    return (
      <div className={`${pageBg} flex min-h-screen items-center justify-center px-4`}>
        <div className={`${ui.glassPanel} w-full max-w-md p-6 sm:p-8`}>
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Invitation invalide</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <a href="/" className={`${ui.btnGhost} justify-center w-full`}>
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Écran de succès
  if (success) {
    return (
      <div className={`${pageBg} flex min-h-screen items-center justify-center px-4`}>
        <div className={`${ui.glassPanel} w-full max-w-md p-6 sm:p-8`}>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Compte créé avec succès !
            </h2>
            <p className="text-emerald-200 mb-2">
              Bienvenue dans l'équipe de {invitation?.restaurantName} !
            </p>
            <p className={ui.muted}>Redirection en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  // Formulaire d'inscription
  return (
    <div className={pageBg}>
      <div className={`${ui.containerWide} flex min-h-screen items-center justify-center px-4 py-12`}>
        <div className={`${ui.glassPanel} w-full max-w-md p-6 sm:p-8`}>
          {/* En-tête */}
          <div className="text-center mb-8">
            <div className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/25 ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)] mb-4">
              <ChefHat className="w-8 h-8 text-amber-400" />
            </div>

            <h1 className="text-3xl font-bold text-amber-400 mb-2">KITCH&apos;N</h1>
            <p className={ui.muted}>Vous avez été invité à rejoindre</p>
            <p className="text-amber-300 font-semibold text-lg mt-1">
              {invitation?.restaurantName}
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-400/20 ring-1 ring-red-400/10">
              <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email (lecture seule) */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={invitation?.email || ''}
                  disabled
                  className={`${inputClass} pl-11 opacity-70 cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jean Dupont"
                  className={`${inputClass} pl-11`}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Poste */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Poste
              </label>
              <select
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={selectClass}
              >
                <option>Cuisinier</option>
                <option>Commis de cuisine</option>
                <option>Chef de partie</option>
                <option>Sous-Chef</option>
                <option>Pâtissier</option>
                <option>Plongeur</option>
                <option>Autre</option>
              </select>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={`${inputClass} pl-11`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={`${inputClass} pl-11`}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`${btnPrimary} w-full disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <span>Créer mon compte</span>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            En créant un compte, vous acceptez de rejoindre l&apos;équipe de{' '}
            <span className="text-slate-200">{invitation?.restaurantName}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
