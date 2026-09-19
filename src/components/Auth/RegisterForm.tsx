import React, {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

import { useAuth } from "../../contexts/AuthContext";

import {
  getRememberMe,
  setRememberMe,
} from "../../lib/authStorage";

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

function getRedirectFromHash():
  | string
  | null {
  const qs =
    window.location.hash.split(
      "?",
    )[1] || "";

  const redirect =
    new URLSearchParams(
      qs,
    ).get("redirect");

  if (!redirect) {
    return null;
  }

  if (
    !redirect.startsWith("/")
  ) {
    return null;
  }

  return redirect;
}

export function RegisterForm({
  onToggleMode,
}: RegisterFormProps) {
  const { signUp } =
    useAuth();

  const [
    formData,
    setFormData,
  ] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "Cuisinier",
    establishment: "",
  });

  const [
    rememberMe,
    setRemember,
  ] = useState<boolean>(
    () => getRememberMe(),
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
    error,
    setError,
  ] = useState("");

  const [
    successInfo,
    setSuccessInfo,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const redirect =
    useMemo(
      () =>
        getRedirectFromHash(),
      [],
    );

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccessInfo("");

    const email =
      formData.email
        .trim()
        .toLowerCase();

    const fullName =
      formData.fullName.trim();

    const role =
      formData.role;

    const establishment =
      formData.establishment.trim();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );

      return;
    }

    if (
      formData.password.length <
      6
    ) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères.",
      );

      return;
    }

    if (!email) {
      setError(
        "Email invalide.",
      );

      return;
    }

    if (!fullName) {
      setError(
        "Entre ton nom complet.",
      );

      return;
    }

    setLoading(true);

    setRememberMe(
      rememberMe,
    );

    try {
      const {
        error:
          signUpError,
        needsEmailConfirmation,
      } = await signUp(
        email,
        formData.password,
        fullName,
        role,
        establishment,
      );

      if (signUpError) {
        setError(
          signUpError.message ||
            "Inscription impossible. Vérifie les champs et réessaie.",
        );

        setLoading(false);

        return;
      }

      if (
        needsEmailConfirmation
      ) {
        setSuccessInfo(
          "Compte créé ✅ Vérifie ta boîte mail pour confirmer ton compte.",
        );

        setLoading(false);

        return;
      }

      setLoading(false);

      window.location.hash =
        redirect ?? "/";
    } catch (err: any) {
      setError(
        err?.message ??
          "Inscription impossible.",
      );

      setLoading(false);
    }
  }

  function goToLogin() {
    if (redirect) {
      window.location.hash =
        `/login?redirect=${encodeURIComponent(
          redirect,
        )}`;
    } else {
      window.location.hash =
        "/login";
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

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#F3F0E8]
        text-[#173E31]
      "
    >
      {/* DECORATION */}
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

      <div
        className="
          relative
          flex
          min-h-screen
          items-center
          justify-center
          px-4
          py-8
          sm:py-12
        "
      >
        <div
          className="
            w-full
            max-w-[560px]
          "
        >
          {/* CARD */}
          <div
            className="
              overflow-hidden
              rounded-[32px]
              border
              border-[#173E31]/10
              bg-[#FBFAF6]
              shadow-[0_24px_70px_rgba(23,62,49,0.08)]
            "
          >
            {/* HEADER */}
            <div
              className="
                border-b
                border-[#173E31]/8
                px-6
                pb-6
                pt-7
                text-center
                sm:px-8
                sm:pt-8
              "
            >
              <img
                src="/logo_kitchn_sans_fond.png"
                alt="KITCH'N"
                className="
                  mx-auto
                  h-10
                  w-auto
                  select-none
                  sm:h-20
                "
                draggable={
                  false
                }
              />

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
                Crée ton espace Kitch’n
              </h1>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-[#718078]
                "
              >
                Commence à organiser tes
                recettes et construis ton
                espace de travail.
              </p>
            </div>

            {/* ERROR */}
            {error ? (
              <div
                className="
                  px-6
                  pt-6
                  sm:px-8
                "
              >
                <div
                  className="
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
                    text-[#9B4944]
                  "
                >
                  <AlertCircle
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                    "
                  />

                  <p>
                    {error}
                  </p>
                </div>
              </div>
            ) : null}

            {/* SUCCESS */}
            {successInfo ? (
              <div
                className="
                  px-6
                  pt-6
                  sm:px-8
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-[#184C3A]/10
                    bg-[#E7EEE8]
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-[#184C3A]
                  "
                >
                  <CheckCircle2
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                    "
                  />

                  <p>
                    {
                      successInfo
                    }
                  </p>
                </div>
              </div>
            ) : null}

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="
                space-y-4
                px-6
                py-7
                sm:px-8
              "
            >
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
                    autoComplete="name"
                    value={
                      formData.fullName
                    }
                    onChange={(
                      event,
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          fullName:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    required
                    disabled={
                      loading
                    }
                    className={`${inputClass} pl-11 pr-4`}
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>

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
                    autoComplete="email"
                    value={
                      formData.email
                    }
                    onChange={(
                      event,
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          email:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    required
                    disabled={
                      loading
                    }
                    className={`${inputClass} pl-11 pr-4`}
                    placeholder="chef@restaurant.com"
                  />
                </div>
              </div>

              {/* ROLE */}
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
                  Fonction
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
                      formData.role
                    }
                    onChange={(
                      event,
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          role:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    disabled={
                      loading
                    }
                    className={`
                      ${inputClass}
                      appearance-none
                      pl-11
                      pr-10
                    `}
                  >
                    {ROLES.map(
                      (
                        role,
                      ) => (
                        <option
                          key={
                            role
                          }
                          value={
                            role
                          }
                          className="
                            bg-[#FBFAF6]
                            text-[#173E31]
                          "
                        >
                          {
                            role
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <div
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
                  </div>
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
                    autoComplete="new-password"
                    value={
                      formData.password
                    }
                    onChange={(
                      event,
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          password:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    required
                    disabled={
                      loading
                    }
                    className={`${inputClass} pl-11 pr-12`}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (
                          visible,
                        ) =>
                          !visible,
                      )
                    }
                    disabled={
                      loading
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
                    autoComplete="new-password"
                    value={
                      formData.confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setFormData(
                        {
                          ...formData,
                          confirmPassword:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    required
                    disabled={
                      loading
                    }
                    className={`${inputClass} pl-11 pr-12`}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        (
                          visible,
                        ) =>
                          !visible,
                      )
                    }
                    disabled={
                      loading
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
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
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

              {/* REMEMBER */}
              <label
                className="
                  flex
                  w-fit
                  cursor-pointer
                  select-none
                  items-center
                  gap-3
                  pt-1
                "
              >
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event,
                  ) =>
                    setRemember(
                      event.target
                        .checked,
                    )
                  }
                  disabled={
                    loading
                  }
                  className="
                    h-5
                    w-5
                    cursor-pointer
                    rounded
                    accent-[#184C3A]
                    disabled:cursor-not-allowed
                  "
                />

                <span
                  className="
                    text-sm
                    text-[#617168]
                  "
                >
                  Se souvenir de moi
                </span>
              </label>

              {/* CREATE */}
              <button
                type="submit"
                disabled={
                  loading
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
                  shadow-[0_8px_22px_rgba(120,73,57,0.12)]
                  transition
                  hover:-translate-y-0.5
                  hover:bg-[#D5A18E]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />

                    Création…
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>

              {/* SUCCESS -> LOGIN */}
              {successInfo ? (
                <button
                  type="button"
                  onClick={
                    goToLogin
                  }
                  disabled={
                    loading
                  }
                  className="
                    h-12
                    w-full
                    rounded-full
                    bg-[#E7EEE8]
                    px-5
                    text-sm
                    font-semibold
                    text-[#184C3A]
                    transition
                    hover:bg-[#DDE8DF]
                    disabled:opacity-60
                  "
                >
                  Aller à la connexion
                </button>
              ) : null}

              {/* LOGIN LINK */}
              <div
                className="
                  pt-2
                  text-center
                "
              >
                <span
                  className="
                    text-sm
                    text-[#718078]
                  "
                >
                  Déjà un compte ?{" "}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    goToLogin();
                    onToggleMode();
                  }}
                  disabled={
                    loading
                  }
                  className="
                    text-sm
                    font-semibold
                    text-[#A8833E]
                    transition
                    hover:text-[#173E31]
                    disabled:opacity-50
                  "
                >
                  Se connecter
                </button>
              </div>
            </form>
          </div>

          {/* COPYRIGHT */}
          <div
            className="
              mt-5
              text-center
              text-xs
              text-[#8B9791]
            "
          >
            ©{" "}
            {new Date().getFullYear()}{" "}
            KITCH&apos;N
          </div>
        </div>
      </div>
    </div>
  );
}