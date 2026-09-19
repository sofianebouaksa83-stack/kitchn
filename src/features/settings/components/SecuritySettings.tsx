import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Shield,
} from "lucide-react";

import { Section } from "./Section";

import { cn } from "../utils/cn";

type SecuritySettingsProps = {
  loading: boolean;

  pwShow: boolean;
  setPwShow: (
    value: boolean,
  ) => void;

  pw1: string;
  setPw1: (
    value: string,
  ) => void;

  pw2: string;
  setPw2: (
    value: string,
  ) => void;

  pwStrength: number;
  pwMatch: boolean;

  canChangePassword: boolean;

  pwSaving: boolean;

  onChangePassword:
    () => void;
};

export function SecuritySettings({
  loading,

  pwShow,
  setPwShow,

  pw1,
  setPw1,

  pw2,
  setPw2,

  pwStrength,
  pwMatch,

  canChangePassword,

  pwSaving,

  onChangePassword,
}: SecuritySettingsProps) {
  const inputClass =
    "h-11 w-full rounded-2xl " +
    "border border-[#173E31]/10 " +
    "bg-[#FBFAF6] px-4 " +
    "text-sm text-[#173E31] " +
    "outline-none transition " +
    "placeholder:text-[#8B9791] " +
    "focus:border-[#C7A45D]/50 " +
    "focus:ring-2 focus:ring-[#C7A45D]/15";

  const strengthLabel =
    pw1.length === 0
      ? "—"
      : pwStrength <= 2
        ? "Faible"
        : pwStrength === 3
          ? "Correct"
          : "Fort";

  return (
    <Section
      title="Sécurité"
      icon={
        <Shield className="h-4 w-4" />
      }
      loading={loading}
    >
      <div
        className="
          rounded-[24px]
          border border-[#173E31]/8
          bg-[#F7F5EF]
          p-4
        "
      >
        {/* TITLE */}
        <div
          className="
            flex flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                grid h-10 w-10
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <KeyRound className="h-4 w-4" />
            </div>

            <div>
              <div
                className="
                  text-sm
                  font-semibold
                  text-[#173E31]
                "
              >
                Changer le mot de passe
              </div>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-[#718078]
                "
              >
                Utilise au minimum 8 caractères.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setPwShow(
                !pwShow,
              )
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#E7EEE8]
              px-3 py-2
              text-xs
              font-medium
              text-[#184C3A]
              transition
              hover:bg-[#DDE8DF]
            "
          >
            {pwShow ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}

            {pwShow
              ? "Masquer"
              : "Afficher"}
          </button>
        </div>

        {/* INPUTS */}
        <div
          className="
            mt-5
            grid grid-cols-1
            gap-4
            sm:grid-cols-2
          "
        >
          <div>
            <label
              className="
                mb-2 block
                text-xs font-semibold
                text-[#29493E]
              "
            >
              Nouveau mot de passe
            </label>

            <input
              type={
                pwShow
                  ? "text"
                  : "password"
              }
              value={pw1}
              onChange={(
                event,
              ) =>
                setPw1(
                  event.target
                    .value,
                )
              }
              className={
                inputClass
              }
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {/* STRENGTH */}
            <div
              className="
                mt-3
                flex items-center
                gap-2
              "
            >
              <div
                className="
                  h-1.5
                  flex-1
                  overflow-hidden
                  rounded-full
                  bg-[#E7EEE8]
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-[#C7A45D]
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${(
                      pwStrength / 5
                    ) * 100}%`,
                  }}
                />
              </div>

              <div
                className="
                  min-w-[48px]
                  text-right
                  text-[11px]
                  font-medium
                  text-[#718078]
                "
              >
                {
                  strengthLabel
                }
              </div>
            </div>

            <div
              className="
                mt-1
                text-[11px]
                text-[#8B9791]
              "
            >
              Min. 8 caractères.
            </div>
          </div>

          <div>
            <label
              className="
                mb-2 block
                text-xs font-semibold
                text-[#29493E]
              "
            >
              Confirmer
            </label>

            <input
              type={
                pwShow
                  ? "text"
                  : "password"
              }
              value={pw2}
              onChange={(
                event,
              ) =>
                setPw2(
                  event.target
                    .value,
                )
              }
              className={cn(
                inputClass,
                pw2.length >
                  0 &&
                  !pwMatch
                  ? "border-[#C05C56]/40 focus:border-[#C05C56]/60 focus:ring-[#C05C56]/10"
                  : "",
              )}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {pw2.length >
              0 &&
            !pwMatch ? (
              <div
                className="
                  mt-2
                  text-xs
                  font-medium
                  text-[#A54C48]
                "
              >
                Les mots de passe ne
                correspondent pas.
              </div>
            ) : null}
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-5">
          <button
            type="button"
            onClick={
              onChangePassword
            }
            disabled={
              !canChangePassword ||
              pwSaving
            }
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition",
              "bg-[#184C3A] text-[#F7F3EA] hover:bg-[#123C2E]",
              (!canChangePassword ||
                pwSaving) &&
                "cursor-not-allowed opacity-45",
            )}
          >
            {pwSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}

            Mettre à jour
          </button>

          <div
            className="
              mt-3
              max-w-xl
              text-xs
              leading-relaxed
              text-[#8B9791]
            "
          >
            Si Supabase refuse la
            modification car la session
            est trop ancienne,
            déconnecte-toi puis
            reconnecte-toi avant de
            réessayer.
          </div>
        </div>
      </div>
    </Section>
  );
}