import type {
  RefObject,
} from "react";

import {
  Loader2,
  Upload,
  User,
  X,
} from "lucide-react";

import { Section } from "./Section";
import { Field } from "./Field";

import { cn } from "../utils/cn";

type ProfileSettingsProps = {
  loading: boolean;

  avatarPreview: string | null;
  avatarAnimOut: boolean;
  avatarRemoving: boolean;
  avatarUploading: boolean;
  avatarInitial: string;
  defaultAvatarBg: string;

  fileRef:
    RefObject<HTMLInputElement>;

  onRemoveAvatar:
    () => void;

  onPickAvatar:
    (file: File) => void;

  fullName: string;

  setFullName:
    (value: string) => void;

  username: string;

  setUsername:
    (value: string) => void;

  usernameError?: string;

  locale: "fr" | "en";

  setLocale:
    (
      value:
        | "fr"
        | "en",
    ) => void;

  bio: string;

  setBio:
    (value: string) => void;
};

export function ProfileSettings({
  loading,

  avatarPreview,
  avatarAnimOut,
  avatarRemoving,
  avatarUploading,
  avatarInitial,
  defaultAvatarBg,

  fileRef,

  onRemoveAvatar,
  onPickAvatar,

  fullName,
  setFullName,

  username,
  setUsername,
  usernameError,

  locale,
  setLocale,

  bio,
  setBio,
}: ProfileSettingsProps) {
  const inputClass =
    "w-full h-12 sm:h-11 rounded-2xl " +
    "border border-[#173E31]/10 " +
    "bg-[#F7F5EF] px-4 " +
    "text-sm text-[#173E31] " +
    "outline-none transition " +
    "placeholder:text-[#8B9791] " +
    "focus:border-[#C7A45D]/50 " +
    "focus:ring-2 focus:ring-[#C7A45D]/15";

  return (
    <Section
      title="Profil"
      icon={
        <User className="h-4 w-4" />
      }
      loading={loading}
    >
      {/* AVATAR */}
      <div
        className="
          flex flex-col
          items-center
          gap-4
          text-center
          sm:flex-row
          sm:text-left
        "
      >
        <div className="group relative">
          <div
            className={cn(
              "h-20 w-20 overflow-hidden rounded-[24px] border border-[#173E31]/10 bg-[#E7EEE8]",
              "shadow-[0_6px_18px_rgba(23,62,49,0.05)]",
              "transition-all duration-200",
              avatarAnimOut
                ? "scale-[0.96] opacity-0"
                : "scale-100 opacity-100",
            )}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="
                  flex h-full w-full
                  items-center
                  justify-center
                "
                style={{
                  backgroundImage:
                    defaultAvatarBg,
                }}
              >
                <div
                  className="
                    flex h-12 w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FBFAF6]/70
                    ring-1
                    ring-[#173E31]/10
                  "
                >
                  <span
                    className="
                      text-sm
                      font-semibold
                      text-[#184C3A]
                    "
                  >
                    {avatarInitial}
                  </span>
                </div>
              </div>
            )}
          </div>

          {avatarPreview ? (
            <button
              type="button"
              onClick={
                onRemoveAvatar
              }
              disabled={
                avatarRemoving ||
                avatarUploading
              }
              className={cn(
                "absolute -right-1 -top-1",
                "flex h-7 w-7 items-center justify-center rounded-full",
                "bg-[#F5E4E0] text-[#A54C48]",
                "border border-[#C05C56]/12",
                "shadow-sm transition",
                "scale-100 opacity-100",
                "sm:scale-90 sm:opacity-0",
                "sm:group-hover:scale-100 sm:group-hover:opacity-100",
                (avatarRemoving ||
                  avatarUploading) &&
                  "cursor-not-allowed opacity-60",
              )}
              title="Supprimer l’avatar"
              aria-label="Supprimer l’avatar"
            >
              {avatarRemoving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <X className="h-3.5 w-3.5" />
              )}
            </button>
          ) : null}
        </div>

        <div>
          <button
            type="button"
            disabled={
              avatarUploading ||
              avatarRemoving
            }
            onClick={() =>
              fileRef.current?.click()
            }
            className={cn(
              "inline-flex w-full items-center justify-center gap-2 rounded-full",
              "bg-[#E7EEE8] px-4 py-2.5 sm:w-auto",
              "text-sm font-medium text-[#184C3A]",
              "transition hover:bg-[#DDE8DF]",
              (avatarUploading ||
                avatarRemoving) &&
                "cursor-not-allowed opacity-60",
            )}
          >
            {avatarUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}

            Changer l’avatar
          </button>

          <p
            className="
              mt-2
              text-center
              text-xs
              text-[#8B9791]
              sm:text-left
            "
          >
            Photo de profil de ton
            compte Kitch’n.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) {
                onPickAvatar(
                  file,
                );
              }

              event.currentTarget.value =
                "";
            }}
          />
        </div>
      </div>

      {/* FIELDS */}
      <div
        className="
          mt-6
          grid grid-cols-1
          gap-4
          sm:grid-cols-2
        "
      >
        <Field label="Nom complet">
          <input
            value={fullName}
            onChange={(event) =>
              setFullName(
                event.target.value,
              )
            }
            className={
              inputClass
            }
            placeholder="Paul Bocuse"
          />
        </Field>

        <Field
          label="Nom d’utilisateur"
          error={
            usernameError
          }
        >
          <input
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value,
              )
            }
            className={
              inputClass
            }
            placeholder="Pseudo"
          />
        </Field>

        <Field label="Langue">
          <select
            value={locale}
            onChange={(event) =>
              setLocale(
                event.target
                  .value as
                  | "fr"
                  | "en",
              )
            }
            className={
              inputClass
            }
          >
            <option value="fr">
              Français
            </option>

            <option value="en">
              English
            </option>
          </select>
        </Field>

        <Field
          label="Bio"
          className="sm:col-span-2"
        >
          <textarea
            value={bio}
            onChange={(event) =>
              setBio(
                event.target.value,
              )
            }
            rows={4}
            className="
              min-h-[112px]
              w-full
              resize-none
              rounded-2xl
              border border-[#173E31]/10
              bg-[#F7F5EF]
              px-4 py-3
              text-sm
              leading-relaxed
              text-[#173E31]
              outline-none
              placeholder:text-[#8B9791]
              transition
              focus:border-[#C7A45D]/50
              focus:ring-2
              focus:ring-[#C7A45D]/15
            "
            placeholder="Quelques mots…"
          />
        </Field>
      </div>
    </Section>
  );
}