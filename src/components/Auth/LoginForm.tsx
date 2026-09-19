import React, {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
  Mail,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

import {
  getRememberMe,
  setRememberMe,
} from "../../lib/authStorage";

type LoginFormProps = {
  onToggleMode?: () => void;
  onSuccess?: () => void;
};

function mapAuthError(
  message?: string,
) {
  const m = (
    message ?? ""
  ).toLowerCase();

  if (!m) {
    return "Connexion impossible.";
  }

  if (
    m.includes(
      "invalid login credentials",
    )
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (
    m.includes(
      "email not confirmed",
    )
  ) {
    return "Email non confirmé. Vérifie ta boîte mail.";
  }

  if (
    m.includes(
      "too many requests",
    )
  ) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }

  if (
    m.includes(
      "user not found",
    )
  ) {
    return "Aucun compte trouvé avec cet email.";
  }

  if (
    m.includes("password") &&
    m.includes("invalid")
  ) {
    return "Mot de passe incorrect.";
  }

  return "Connexion impossible. Vérifie tes infos et réessaie.";
}

/**
 * Lit :
 * #/login?redirect=/invitation/<token>
 */
function getRedirectFromHash():
  | string
  | null {
  const raw =
    window.location.hash.replace(
      "#",
      "",
    );

  const parts =
    raw.split("?");

  const qs =
    parts[1] ?? "";

  const params =
    new URLSearchParams(qs);

  const redirect =
    params.get("redirect");

  if (!redirect) {
    return null;
  }

  const decoded =
    decodeURIComponent(
      redirect,
    );

  if (
    !decoded.startsWith("/")
  ) {
    return "/";
  }

  return decoded;
}

export function LoginForm({
  onToggleMode,
  onSuccess,
}: LoginFormProps) {
  const [email, setEmail] =
    useState("");

  const [
    password,
    setPassword,
  ] = useState("");

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
    loading,
    setLoading,
  ] = useState(false);

  const [
    oauthLoading,
    setOauthLoading,
  ] = useState<
    null | "google" | "apple"
  >(null);

  const [
    info,
    setInfo,
  ] = useState<
    string | null
  >(null);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    canResendConfirm,
    setCanResendConfirm,
  ] = useState(false);

  const canReset =
    useMemo(
      () =>
        email.trim().length >
        3,
      [email],
    );

  const disabledAll =
    loading ||
    !!oauthLoading;

  function finishSuccess() {
    const redirect =
      getRedirectFromHash();

    if (redirect) {
      window.location.hash =
        redirect;

      return;
    }

    onSuccess?.();
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError(null);
    setInfo(null);

    setCanResendConfirm(
      false,
    );

    setLoading(true);

    setRememberMe(
      rememberMe,
    );

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email.trim(),
            password,
          },
        );

      if (error) {
        throw error;
      }

      if (!data.session) {
        setCanResendConfirm(
          true,
        );

        setError(
          "Email non confirmé. Vérifie ta boîte mail.",
        );

        return;
      }

      finishSuccess();
    } catch (err: any) {
      const message =
        mapAuthError(
          err?.message,
        );

      setError(message);

      if (
        (
          err?.message ?? ""
        )
          .toLowerCase()
          .includes(
            "email not confirmed",
          )
      ) {
        setCanResendConfirm(
          true,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError(null);
    setInfo(null);

    setCanResendConfirm(
      false,
    );

    if (!canReset) {
      setError(
        "Entre ton email pour recevoir le lien de réinitialisation.",
      );

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/#/reset-password?reset=1`,
          },
        );

      if (error) {
        throw error;
      }

      setInfo(
        "Email envoyé. Vérifie ta boîte mail (et les spams).",
      );
    } catch (err: any) {
      setError(
        mapAuthError(
          err?.message,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    setError(null);
    setInfo(null);

    if (!canReset) {
      setError(
        "Entre ton email pour renvoyer l'email de confirmation.",
      );

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.resend(
          {
            type: "signup",

            email:
              email.trim(),

            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          },
        );

      if (error) {
        throw error;
      }

      setInfo(
        "Email de confirmation renvoyé ✅ Vérifie ta boîte mail (et les spams).",
      );

      setCanResendConfirm(
        false,
      );
    } catch (err: any) {
      setError(
        mapAuthError(
          err?.message,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(
    provider:
      | "google"
      | "apple",
  ) {
    setError(null);
    setInfo(null);

    setCanResendConfirm(
      false,
    );

    setOauthLoading(
      provider,
    );

    try {
      const { error } =
        await supabase.auth.signInWithOAuth(
          {
            provider,

            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          },
        );

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(
        mapAuthError(
          err?.message,
        ),
      );

      setOauthLoading(null);
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
    "disabled:cursor-not-allowed disabled:opacity-60";

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
          absolute inset-0
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
          flex min-h-screen
          items-center
          justify-center
          px-4 py-8
          sm:py-12
        "
      >
        <div
          className="
            w-full
            max-w-[520px]
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
                draggable={false}
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
                Bon retour sur Kitch’n
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
                Connecte-toi pour retrouver
                tes recettes, tes groupes
                et toute ta brigade.
              </p>
            </div>

            {/* OAUTH */}
            <div
              className="
                px-6
                pt-6
                sm:px-8
              "
            >
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    handleOAuth(
                      "google",
                    )
                  }
                  disabled={
                    disabledAll
                  }
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#173E31]/10
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-[#173E31]
                    transition
                    hover:bg-[#F7F5EF]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {oauthLoading ===
                  "google" ? (
                    <span
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <Loader className="h-5 w-5 animate-spin" />

                      Connexion Google…
                    </span>
                  ) : (
                    "Continuer avec Google"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOAuth(
                      "apple",
                    )
                  }
                  disabled={
                    disabledAll
                  }
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#173E31]
                    px-4
                    text-sm
                    font-semibold
                    text-[#F7F3EA]
                    transition
                    hover:bg-[#123C2E]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {oauthLoading ===
                  "apple" ? (
                    <span
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <Loader className="h-5 w-5 animate-spin" />

                      Connexion Apple…
                    </span>
                  ) : (
                    "Continuer avec Apple"
                  )}
                </button>
              </div>

              {/* SEPARATOR */}
              <div
                className="
                  my-5
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    h-px
                    flex-1
                    bg-[#173E31]/8
                  "
                />

                <span
                  className="
                    text-xs
                    font-medium
                    text-[#8B9791]
                  "
                >
                  ou
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-[#173E31]/8
                  "
                />
              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                handleSubmit
              }
              className="
                space-y-4
                px-6
                pb-7
                sm:px-8
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
                    autoComplete="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    placeholder="chef@restaurant.com"
                    disabled={
                      disabledAll
                    }
                    className={`${inputClass} pl-11 pr-4`}
                    required
                  />
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
                    autoComplete="current-password"
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
                    placeholder="••••••••"
                    disabled={
                      disabledAll
                    }
                    className={`${inputClass} pl-11 pr-12`}
                    required
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
                      disabledAll
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
              </div>

              {/* REMEMBER + RESET */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <label
                  className="
                    flex
                    cursor-pointer
                    select-none
                    items-center
                    gap-3
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
                      disabledAll
                    }
                    className="
                      h-4.5
                      w-4.5
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

                <button
                  type="button"
                  onClick={
                    handleResetPassword
                  }
                  disabled={
                    disabledAll
                  }
                  className="
                    w-fit
                    text-sm
                    font-semibold
                    text-[#A8833E]
                    transition
                    hover:text-[#173E31]
                    disabled:opacity-50
                  "
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* INFO */}
              {info ? (
                <div
                  className="
                    flex
                    items-start
                    gap-2
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
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {info}
                  </span>
                </div>
              ) : null}

              {/* ERROR */}
              {error ? (
                <div
                  className="
                    flex
                    items-start
                    gap-2
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
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {error}
                  </span>
                </div>
              ) : null}

              {/* RESEND */}
              {canResendConfirm ? (
                <button
                  type="button"
                  onClick={
                    handleResendConfirmation
                  }
                  disabled={
                    disabledAll
                  }
                  className="
                    h-11
                    w-full
                    rounded-2xl
                    bg-[#E7EEE8]
                    px-4
                    text-sm
                    font-semibold
                    text-[#184C3A]
                    transition
                    hover:bg-[#DDE8DF]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  Renvoyer l’email de confirmation
                </button>
              ) : null}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  disabledAll
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

                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* CREATE ACCOUNT */}
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
                  Pas encore de compte ?{" "}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onToggleMode?.()
                  }
                  disabled={
                    disabledAll
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
                  Créer un compte
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