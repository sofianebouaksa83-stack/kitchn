import type { RefObject } from "react";
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

  fileRef: RefObject<HTMLInputElement>;

  onRemoveAvatar: () => void;
  onPickAvatar: (file: File) => void;

  fullName: string;
  setFullName: (value: string) => void;

  username: string;
  setUsername: (value: string) => void;
  usernameError?: string;

  locale: "fr" | "en";
  setLocale: (value: "fr" | "en") => void;

  bio: string;
  setBio: (value: string) => void;
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
  return (
    <Section
      title="Profil"
      icon={<User className="h-4 w-4" />}
      loading={loading}
    >
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div
            className={cn(
              "h-14 w-14 rounded-2xl overflow-hidden border border-white/10 bg-white/10",
              "transition-all duration-200",
              avatarAnimOut
                ? "opacity-0 scale-[0.96]"
                : "opacity-100 scale-100"
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
                className="h-full w-full flex items-center justify-center"
                style={{ backgroundImage: defaultAvatarBg }}
              >
                <div className="h-10 w-10 rounded-full bg-black/20 ring-1 ring-white/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white/80">
                    {avatarInitial}
                  </span>
                </div>
              </div>
            )}
          </div>

          {avatarPreview && (
            <button
              type="button"
              onClick={onRemoveAvatar}
              disabled={avatarRemoving || avatarUploading}
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 rounded-full",
                "bg-red-500/80 hover:bg-red-500 text-white",
                "ring-1 ring-slate-950/70 border border-white/10",
                "flex items-center justify-center transition",
                "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100",
                "duration-150 ease-out",
                (avatarRemoving || avatarUploading) &&
                  "opacity-60 cursor-not-allowed"
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
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={avatarUploading || avatarRemoving}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/10 hover:bg-white/15 transition",
              (avatarUploading || avatarRemoving) &&
                "opacity-60 cursor-not-allowed"
            )}
          >
            {avatarUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Changer l’avatar
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                onPickAvatar(file);
              }

              e.currentTarget.value = "";
            }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nom complet">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
            placeholder="Paul Bocuse"
          />
        </Field>

        <Field
          label="Nom d’utilisateur"
          error={usernameError}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
            placeholder="Pseudo"
          />
        </Field>

        <Field label="Langue">
          <select
            value={locale}
            onChange={(e) =>
              setLocale(e.target.value as "fr" | "en")
            }
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Field>

        <Field
          label="Bio"
          className="sm:col-span-2"
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
            placeholder="Quelques mots…"
          />
        </Field>
      </div>
    </Section>
  );
}