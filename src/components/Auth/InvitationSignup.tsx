import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChefHat,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
  Lock,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

interface InvitationSignupProps {
  token: string;
}

interface InvitationData {
  email: string;
  restaurantName: string;
  expired: boolean;
}

export function InvitationSignup({
  token,
}: InvitationSignupProps) {
  const [
    invitation,
    setInvitation,
  ] =
    useState<InvitationData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    currentUser,
    setCurrentUser,
  ] = useState<{
    email: string;
  } | null>(null);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    jobTitle,
    setJobTitle,
  ] = useState(
    "Cuisinier",
  );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    success,
    setSuccess,
  ] = useState(false);

  useEffect(() => {
    async function checkInvitation() {
      try {
        setLoading(true);
        setError("");

        /*
         * Vérifie si quelqu’un est
         * déjà connecté.
         */
        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (user) {
          setCurrentUser({
            email:
              user.email || "",
          });
        }

        /*
         * Vérifie l'invitation.
         */
        const {
          data:
            invitationData,
          error:
            invitationError,
        } = await supabase
          .from(
            "invitations",
          )
          .select(
            "email, restaurant_id, expires_at",
          )
          .eq(
            "token",
            token,
          )
          .is(
            "accepted_at",
            null,
          )
          .maybeSingle();

        if (
          invitationError ||
          !invitationData
        ) {
          setError(
            "Invitation introuvable.",
          );

          return;
        }

        /*
         * Vérifie l'expiration.
         */
        if (
          new Date(
            invitationData.expires_at,
          ) < new Date()
        ) {
          setInvitation({
            email:
              invitationData.email,
            restaurantName:
              "",
            expired: true,
          });

          setError(
            "Cette invitation a expiré.",
          );

          return;
        }

        /*
         * Nom du restaurant.
         */
        const {
          data:
            restaurantData,
        } = await supabase
          .from(
            "restaurants",
          )
          .select("name")
          .eq(
            "id",
            invitationData.restaurant_id,
          )
          .maybeSingle();

        setInvitation({
          email:
            invitationData.email,

          restaurantName:
            restaurantData?.name ||
            "un restaurant",

          expired: false,
        });
      } catch (err) {
        console.error(
          "Error checking invitation:",
          err,
        );

        setError(
          "Erreur lors de la vérification de l'invitation.",
        );
      } finally {
        setLoading(false);
      }
    }

    void checkInvitation();
  }, [token]);

  async function handleSignup(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!invitation) {
      return;
    }

    setError("");

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );

      return;
    }

    if (
      password.length < 6
    ) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères.",
      );

      return;
    }

    if (
      !fullName.trim()
    ) {
      setError(
        "Entre ton nom complet.",
      );

      return;
    }

    try {
      setSubmitting(true);

      /*
       * 1. Création du compte.
       *
       * invitation_signup empêche
       * le trigger de créer un
       * restaurant automatiquement.
       */
      const {
        data:
          authData,
        error:
          signUpError,
      } =
        await supabase.auth.signUp(
          {
            email:
              invitation.email,

            password,

            options: {
              data: {
                full_name:
                  fullName.trim(),

                job_title:
                  jobTitle,

                invitation_signup:
                  true,
              },
            },
          },
        );

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error(
          "Erreur lors de la création du compte",
        );
      }

      /*
       * 2. Laisse le trigger terminer.
       */
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            1500,
          ),
      );

      /*
       * 3. Lie le compte
       * au restaurant.
       */
      const {
        data:
          acceptResult,
        error:
          acceptError,
      } =
        await supabase.rpc(
          "accept_invitation",
          {
            invitation_token:
              token,

            new_user_id:
              authData.user.id,

            full_name:
              fullName.trim(),

            job_title:
              jobTitle,
          },
        );

      if (acceptError) {
        throw new Error(
          `Erreur lors de l'acceptation de l'invitation : ${acceptError.message}`,
        );
      }

      if (
        !acceptResult ||
        !acceptResult.success
      ) {
        throw new Error(
          acceptResult?.error ||
            "Erreur inconnue lors de l'acceptation de l'invitation",
        );
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href =
          "/";
      }, 2000);
    } catch (err) {
      console.error(
        "Signup error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la création du compte",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await supabase.auth.signOut();

      setCurrentUser(null);
    } catch (err) {
      console.error(
        "Logout error:",
        err,
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-2xl " +
    "border border-[#173E31]/12 " +
    "bg-[#F7F5EF] " +
    "text-sm text-[#173E31] " +
    "outline-none transition " +
    "placeholder:text-[#8B9791] " +
    "focus:border-[#C7A45D]/50 " +
    "focus:ring-2 focus:ring-[#C7A45D]/15 " +
    "disabled:cursor-not-allowed " +
    "disabled:opacity-60";

  const pageClass =
    "relative min-h-screen overflow-hidden bg-[#F3F0E8] text-[#173E31]";

  const cardClass =
    "w-full max-w-[520px] overflow-hidden rounded-[32px] " +
    "border border-[#173E31]/10 bg-[#FBFAF6] " +
    "shadow-[0_24px_70px_rgba(23,62,49,0.08)]";

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div
        className={pageClass}
      >
        <PageDecoration />

        <div
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            px-4
          "
        >
          <div
            className="
              text-center
            "
          >
            <div
              className="
                mx-auto
                grid
                h-16
                w-16
                place-items-center
                rounded-[22px]
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>

            <h2
              className="
                mt-5
                font-serif
                text-2xl
                font-semibold
                text-[#173E31]
              "
            >
              Invitation Kitch’n
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-[#718078]
              "
            >
              Vérification de
              l’invitation…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * INVITATION INVALIDE
   * OU EXPIRÉE
   */
  if (
    error &&
    (!invitation ||
      invitation.expired)
  ) {
    return (
      <div
        className={pageClass}
      >
        <PageDecoration />

        <div
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            px-4
            py-10
          "
        >
          <div
            className={cardClass}
          >
            <div
              className="
                p-7
                text-center
                sm:p-9
              "
            >
              <img
                src="/Logo_kitchn_horizontal.svg"
                alt="KITCH'N"
                className="
                  mx-auto
                  h-11
                  w-auto
                "
                draggable={false}
              />

              <div
                className="
                  mx-auto
                  mt-7
                  grid
                  h-16
                  w-16
                  place-items-center
                  rounded-[22px]
                  bg-[#F8EAE7]
                  text-[#A54C48]
                "
              >
                <AlertCircle className="h-7 w-7" />
              </div>

              <h1
                className="
                  mt-5
                  font-serif
                  text-2xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Invitation invalide
              </h1>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-[#A54C48]
                "
              >
                {error}
              </p>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-[#718078]
                "
              >
                Demande à la personne
                qui t’a invité de
                générer une nouvelle
                invitation.
              </p>

              <a
                href="/"
                className="
                  mt-7
                  inline-flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#E7EEE8]
                  px-5
                  text-sm
                  font-semibold
                  text-[#184C3A]
                  transition
                  hover:bg-[#DDE8DF]
                "
              >
                <ArrowLeft className="h-4 w-4" />

                Retour à l’accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * UTILISATEUR DÉJÀ
   * CONNECTÉ
   */
  if (
    currentUser &&
    !success
  ) {
    return (
      <div
        className={pageClass}
      >
        <PageDecoration />

        <div
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            px-4
            py-10
          "
        >
          <div
            className={cardClass}
          >
            <div
              className="
                border-b
                border-[#173E31]/8
                px-6
                pb-6
                pt-8
                text-center
                sm:px-8
              "
            >
              <img
                src="/logo_kitchn_sans_fond.png"
                alt="KITCH'N"
                className="
                  mx-auto
                  h-11
                  w-auto
                "
                draggable={false}
              />

              <div
                className="
                  mx-auto
                  mt-6
                  grid
                  h-14
                  w-14
                  place-items-center
                  rounded-[20px]
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <ChefHat className="h-6 w-6" />
              </div>

              <h1
                className="
                  mt-4
                  font-serif
                  text-2xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Tu es déjà connecté
              </h1>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-[#718078]
                "
              >
                Pour accepter cette
                invitation, il faut
                d’abord utiliser le
                compte correspondant à
                l’adresse invitée.
              </p>
            </div>

            <div
              className="
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-[#173E31]/8
                  bg-[#F7F5EF]
                  p-4
                "
              >
                <span
                  className="
                    text-xs
                    font-medium
                    text-[#8B9791]
                  "
                >
                  Compte actuellement
                  connecté
                </span>

                <p
                  className="
                    mt-1
                    break-words
                    font-semibold
                    text-[#184C3A]
                  "
                >
                  {
                    currentUser.email
                  }
                </p>
              </div>

              <div
                className="
                  mt-6
                  space-y-3
                "
              >
                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    loggingOut
                  }
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#DDAE9D]
                    px-5
                    text-sm
                    font-semibold
                    text-[#173E31]
                    transition
                    hover:bg-[#D5A18E]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loggingOut ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />

                      Déconnexion…
                    </>
                  ) : (
                    <>
                      <LogOut className="h-5 w-5" />

                      Se déconnecter et continuer
                    </>
                  )}
                </button>

                <a
                  href="/"
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#E7EEE8]
                    px-5
                    text-sm
                    font-semibold
                    text-[#184C3A]
                    transition
                    hover:bg-[#DDE8DF]
                  "
                >
                  Retour à l’accueil
                </a>
              </div>

              <div
                className="
                  mt-6
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  bg-[#F7F5EF]
                  p-4
                "
              >
                <Lightbulb
                  className="
                    mt-0.5
                    h-4
                    w-4
                    shrink-0
                    text-[#A8833E]
                  "
                />

                <p
                  className="
                    text-xs
                    leading-5
                    text-[#718078]
                  "
                >
                  Tu peux aussi ouvrir
                  le lien d’invitation
                  dans une fenêtre de
                  navigation privée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * SUCCÈS
   */
  if (success) {
    return (
      <div
        className={pageClass}
      >
        <PageDecoration />

        <div
          className="
            relative
            flex
            min-h-screen
            items-center
            justify-center
            px-4
          "
        >
          <div
            className={cardClass}
          >
            <div
              className="
                p-8
                text-center
                sm:p-10
              "
            >
              <div
                className="
                  mx-auto
                  grid
                  h-16
                  w-16
                  place-items-center
                  rounded-[22px]
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h1
                className="
                  mt-5
                  font-serif
                  text-2xl
                  font-semibold
                  text-[#173E31]
                  sm:text-3xl
                "
              >
                Compte créé avec succès
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-[#617168]
                "
              >
                Bienvenue dans
                l’équipe de{" "}
                <span
                  className="
                    font-semibold
                    text-[#A8833E]
                  "
                >
                  {
                    invitation?.restaurantName
                  }
                </span>
                .
              </p>

              <div
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#F0F2EC]
                  px-4
                  py-2
                  text-xs
                  text-[#718078]
                "
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />

                Redirection en cours…
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * FORMULAIRE
   */
  return (
    <div
      className={pageClass}
    >
      <PageDecoration />

      <div
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-10
        "
      >
        <div
          className={cardClass}
        >
          {/* HEADER */}
          <div
            className="
              border-b
              border-[#173E31]/8
              px-6
              pb-6
              pt-8
              text-center
              sm:px-8
            "
          >
            <img
              src="/Logo_kitchn_horizontal.svg"
              alt="KITCH'N"
              className="
                mx-auto
                h-11
                w-auto
              "
              draggable={false}
            />

            <div
              className="
                mx-auto
                mt-6
                grid
                h-14
                w-14
                place-items-center
                rounded-[20px]
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <ChefHat className="h-6 w-6" />
            </div>

            <div
              className="
                mt-4
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#A8833E]
              "
            >
              Invitation d’équipe
            </div>

            <h1
              className="
                mt-2
                font-serif
                text-2xl
                font-semibold
                text-[#173E31]
                sm:text-3xl
              "
            >
              Rejoins la brigade
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-[#718078]
              "
            >
              Tu as été invité à
              rejoindre
            </p>

            <p
              className="
                mt-1
                font-serif
                text-xl
                font-semibold
                text-[#A8833E]
              "
            >
              {
                invitation?.restaurantName
              }
            </p>
          </div>

          <div
            className="
              px-6
              py-7
              sm:px-8
            "
          >
            {/* ERROR */}
            {error ? (
              <div
                className="
                  mb-6
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-[#C05C56]/20
                  bg-[#F8EAE7]
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-[#A54C48]
                "
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <p>
                  {error}
                </p>
              </div>
            ) : null}

            <form
              onSubmit={
                handleSignup
              }
              className="
                space-y-4
              "
            >
              {/* EMAIL */}
              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#29493E]
                  "
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#8B9791]
                    "
                  />

                  <input
                    type="email"
                    value={
                      invitation?.email ||
                      ""
                    }
                    disabled
                    className={`
                      ${inputClass}
                      cursor-not-allowed
                      pl-11
                      pr-4
                      opacity-70
                    `}
                  />
                </div>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[#8B9791]
                  "
                >
                  Cette adresse est liée
                  à l’invitation.
                </p>
              </div>

              {/* NOM */}
              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#29493E]
                  "
                >
                  Nom complet
                </label>

                <div className="relative">
                  <UserRound
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#8B9791]
                    "
                  />

                  <input
                    type="text"
                    value={
                      fullName
                    }
                    onChange={(
                      event,
                    ) =>
                      setFullName(
                        event.target
                          .value,
                      )
                    }
                    required
                    placeholder="Jean Dupont"
                    className={`${inputClass} pl-11 pr-4`}
                    autoComplete="name"
                    disabled={
                      submitting
                    }
                  />
                </div>
              </div>

              {/* POSTE */}
              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#29493E]
                  "
                >
                  Poste
                </label>

                <div className="relative">
                  <Briefcase
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      z-10
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#8B9791]
                    "
                  />

                  <select
                    value={
                      jobTitle
                    }
                    onChange={(
                      event,
                    ) =>
                      setJobTitle(
                        event.target
                          .value,
                      )
                    }
                    className={`
                      ${inputClass}
                      appearance-none
                      pl-11
                      pr-10
                    `}
                    disabled={
                      submitting
                    }
                  >
                    <option>
                      Cuisinier
                    </option>

                    <option>
                      Commis de cuisine
                    </option>

                    <option>
                      Chef de partie
                    </option>

                    <option>
                      Sous-Chef
                    </option>

                    <option>
                      Pâtissier
                    </option>

                    <option>
                      Plongeur
                    </option>

                    <option>
                      Autre
                    </option>
                  </select>

                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-xs
                      text-[#718078]
                    "
                  >
                    ▾
                  </span>
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#29493E]
                  "
                >
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#8B9791]
                    "
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className={`${inputClass} pl-11 pr-12`}
                    autoComplete="new-password"
                    disabled={
                      submitting
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          value,
                        ) =>
                          !value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      grid
                      h-8
                      w-8
                      -translate-y-1/2
                      place-items-center
                      rounded-xl
                      text-[#718078]
                      transition
                      hover:bg-[#E7EEE8]
                      hover:text-[#184C3A]
                      disabled:opacity-50
                    "
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p
                  className="
                    mt-2
                    text-xs
                    text-[#8B9791]
                  "
                >
                  6 caractères minimum
                </p>
              </div>

              {/* CONFIRM */}
              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-[#29493E]
                  "
                >
                  Confirmer le mot de passe
                </label>

                <div className="relative">
                  <Lock
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-[#8B9791]
                    "
                  />

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className={`${inputClass} pl-11 pr-12`}
                    autoComplete="new-password"
                    disabled={
                      submitting
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        (
                          value,
                        ) =>
                          !value,
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      grid
                      h-8
                      w-8
                      -translate-y-1/2
                      place-items-center
                      rounded-xl
                      text-[#718078]
                      transition
                      hover:bg-[#E7EEE8]
                      hover:text-[#184C3A]
                      disabled:opacity-50
                    "
                    aria-label={
                      showConfirm
                        ? "Masquer la confirmation"
                        : "Afficher la confirmation"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  submitting
                }
                className="
                  mt-2
                  flex
                  h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#DDAE9D]
                  px-5
                  text-sm
                  font-semibold
                  text-[#173E31]
                  shadow-[0_8px_22px_rgba(120,73,57,0.12)]
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#D5A18E]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />

                    Création en cours…
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </form>

            <p
              className="
                mt-6
                text-center
                text-xs
                leading-5
                text-[#8B9791]
              "
            >
              En créant ton compte, tu
              acceptes de rejoindre
              l’équipe de{" "}
              <span
                className="
                  font-semibold
                  text-[#617168]
                "
              >
                {
                  invitation?.restaurantName
                }
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageDecoration() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        overflow-hidden
      "
    >
      <div
        className="
          absolute
          -top-40
          left-1/2
          h-[520px]
          w-[680px]
          -translate-x-1/2
          rounded-full
          bg-[#E7EEE8]
          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-48
          right-[-120px]
          h-[480px]
          w-[480px]
          rounded-full
          bg-[#DDAE9D]/10
          blur-3xl
        "
      />
    </div>
  );
}