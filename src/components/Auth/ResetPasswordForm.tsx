import React, {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Lock,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type Props = {
  onBackToLogin?: () => void;
};

function mapError(
  message?: string,
) {
  const m = (
    message ?? ""
  ).toLowerCase();

  if (
    m.includes("password")
  ) {
    return "Mot de passe invalide (minimum 6 caractères).";
  }

  return "Impossible de changer le mot de passe. Réessaie.";
}

export function ResetPasswordForm({
  onBackToLogin,
}: Props) {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirm,
    setConfirm,
  ] = useState("");

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
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (data.session) {
          setReady(true);
        } else {
          setError(
            "Lien invalide ou expiré. Relance une demande depuis la page de connexion.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  function goToLogin(
    cleanQuery = true,
  ) {
    if (cleanQuery) {
      const url = new URL(
        window.location.href,
      );

      url.searchParams.delete(
        "reset",
      );

      window.history.replaceState(
        {},
        "",
        url.toString(),
      );
    }

    window.location.hash =
      "/login";

    onBackToLogin?.();
  }

  async function handleSubmit(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    setError(null);
    setSuccess(null);

    if (
      password.length < 6
    ) {
      setError(
        "Mot de passe trop court (minimum 6 caractères).",
      );

      return;
    }

    if (
      password !== confirm
    ) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );

      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser(
          {
            password,
          },
        );

      if (error) {
        throw error;
      }

      setSuccess(
        "Mot de passe mis à jour. Redirection vers la connexion…",
      );

      setTimeout(
        () =>
          goToLogin(true),
        1200,
      );
    } catch (err: any) {
      setError(
        mapError(
          err?.message,
        ),
      );
    } finally {
      setLoading(false);
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
                  sm:h-12
                "
                draggable={false}
              />

              <div
                className="
                  mx-auto
                  mt-5
                  grid
                  h-11
                  w-11
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <Lock className="h-5 w-5" />
              </div>

              <h1
                className="
                  mt-4
                  font-serif
                  text-2xl
                  font-semibold
                  text-[#173E31]
                  sm:text-3xl
                "
              >
                Nouveau mot de passe
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
                Choisis un nouveau mot de
                passe pour sécuriser ton
                compte Kitch’n.
              </p>
            </div>

            <div
              className="
                px-6
                py-7
                sm:px-8
              "
            >
              {/* VERIFYING */}
              {loading &&
              !ready &&
              !error ? (
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-[#E7EEE8]
                    px-4
                    py-4
                    text-sm
                    font-medium
                    text-[#184C3A]
                  "
                >
                  <Loader className="h-5 w-5 animate-spin" />

                  Vérification du lien…
                </div>
              ) : null}

              {/* ERROR */}
              {error ? (
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

                  <span>
                    {error}
                  </span>
                </div>
              ) : null}

              {/* SUCCESS */}
              {success ? (
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

                  <span>
                    {success}
                  </span>
                </div>
              ) : null}

              {/* FORM */}
              {ready &&
              !success ? (
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="
                    space-y-4
                  "
                >
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
                      Nouveau mot de passe
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
                          password
                        }
                        onChange={(
                          event,
                        ) =>
                          setPassword(
                            event
                              .target
                              .value,
                          )
                        }
                        className={`${inputClass} pl-11 pr-12`}
                        placeholder="••••••••"
                        required
                        disabled={
                          loading
                        }
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
                          confirm
                        }
                        onChange={(
                          event,
                        ) =>
                          setConfirm(
                            event
                              .target
                              .value,
                          )
                        }
                        className={`${inputClass} pl-11 pr-12`}
                        placeholder="••••••••"
                        required
                        disabled={
                          loading
                        }
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

                        Mise à jour…
                      </>
                    ) : (
                      "Mettre à jour"
                    )}
                  </button>
                </form>
              ) : null}

              {/* BACK */}
              <div
                className="
                  pt-6
                  text-center
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    goToLogin(
                      true,
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-[#A8833E]
                    transition
                    hover:text-[#173E31]
                  "
                >
                  <ArrowLeft className="h-4 w-4" />

                  Retour à la connexion
                </button>
              </div>
            </div>
          </div>

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