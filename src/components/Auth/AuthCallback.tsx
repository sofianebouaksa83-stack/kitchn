import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export function AuthCallback() {
  const [
    state,
    setState,
  ] = useState<
    "loading" | "ok" | "error"
  >("loading");

  const [
    msg,
    setMsg,
  ] = useState(
    "Validation du lien…",
  );

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.exchangeCodeForSession(
            window.location.href,
          );

        console.log(
          "exchange data:",
          data,
        );

        console.log(
          "exchange error:",
          error,
        );

        if (error) {
          throw error;
        }

        if (!alive) {
          return;
        }

        setState("ok");

        setMsg(
          "Connexion confirmée. Redirection en cours…",
        );

        window.location.replace(
          "/#/",
        );
      } catch (error: any) {
        if (!alive) {
          return;
        }

        setState("error");

        setMsg(
          error?.message ??
            "Impossible de confirmer le compte.",
        );
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, []);

  const isLoading =
    state === "loading";

  const isSuccess =
    state === "ok";

  const isError =
    state === "error";

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
          py-10
        "
      >
        <div
          className="
            w-full
            max-w-[520px]
          "
        >
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
                  select-none
                  sm:h-12
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
                <ShieldCheck className="h-6 w-6" />
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
                Validation de connexion
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
                Kitch’n vérifie tes
                informations avant de
                te connecter.
              </p>
            </div>

            {/* CONTENT */}
            <div
              className="
                px-6
                py-7
                sm:px-8
              "
            >
              <div
                className={`
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  px-4
                  py-4
                  ${
                    isError
                      ? "border-[#C05C56]/20 bg-[#F8EAE7]"
                      : isSuccess
                        ? "border-[#184C3A]/10 bg-[#E7EEE8]"
                        : "border-[#173E31]/8 bg-[#F7F5EF]"
                  }
                `}
              >
                {/* ICON */}
                <div
                  className="
                    mt-0.5
                    shrink-0
                  "
                >
                  {isLoading ? (
                    <Loader2
                      className="
                        h-5
                        w-5
                        animate-spin
                        text-[#A8833E]
                      "
                    />
                  ) : null}

                  {isSuccess ? (
                    <CheckCircle2
                      className="
                        h-5
                        w-5
                        text-[#184C3A]
                      "
                    />
                  ) : null}

                  {isError ? (
                    <AlertCircle
                      className="
                        h-5
                        w-5
                        text-[#A54C48]
                      "
                    />
                  ) : null}
                </div>

                {/* TEXT */}
                <div className="min-w-0">
                  <div
                    className={`
                      font-semibold
                      ${
                        isError
                          ? "text-[#A54C48]"
                          : "text-[#173E31]"
                      }
                    `}
                  >
                    {isLoading
                      ? "Validation…"
                      : isSuccess
                        ? "C’est bon !"
                        : "Une erreur est survenue"}
                  </div>

                  <div
                    className={`
                      mt-1
                      text-sm
                      leading-6
                      ${
                        isError
                          ? "text-[#9B4944]"
                          : "text-[#617168]"
                      }
                    `}
                  >
                    {msg}
                  </div>
                </div>
              </div>

              {/* LOADING PROGRESS */}
              {isLoading ? (
                <div
                  className="
                    mt-6
                    overflow-hidden
                    rounded-full
                    bg-[#E7EEE8]
                  "
                >
                  <div
                    className="
                      h-1
                      w-1/2
                      animate-pulse
                      rounded-full
                      bg-[#C7A45D]
                    "
                  />
                </div>
              ) : null}

              {/* SUCCESS */}
              {isSuccess ? (
                <div
                  className="
                    mt-6
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-xs
                    text-[#718078]
                  "
                >
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  Redirection vers Kitch’n…
                </div>
              ) : null}

              {/* ERROR */}
              {isError ? (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash =
                        "/login";
                    }}
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
                      shadow-[0_8px_22px_rgba(120,73,57,0.10)]
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#D5A18E]
                      active:scale-[0.98]
                    "
                  >
                    <ArrowLeft className="h-4 w-4" />

                    Retour à la connexion
                  </button>
                </div>
              ) : null}
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