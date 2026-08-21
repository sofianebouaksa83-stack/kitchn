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
  setPwShow: (value: boolean) => void;

  pw1: string;
  setPw1: (value: string) => void;

  pw2: string;
  setPw2: (value: string) => void;

  pwStrength: number;
  pwMatch: boolean;

  canChangePassword: boolean;
  pwSaving: boolean;

  onChangePassword: () => void;
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
  return (
    <Section
      title="Sécurité"
      icon={<Shield className="h-4 w-4" />}
      loading={loading}
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-white/80" />
            <div className="text-sm font-medium">
              Changer le mot de passe
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPwShow(!pwShow)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs border border-white/10 bg-white/10 hover:bg-white/15 transition"
          >
            {pwShow ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}

            {pwShow ? "Masquer" : "Afficher"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-white/60 mb-1">
              Nouveau mot de passe
            </div>

            <input
              type={pwShow ? "text" : "password"}
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20"
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-yellow-300/50"
                  style={{
                    width: `${(pwStrength / 5) * 100}%`,
                  }}
                />
              </div>

              <div className="text-[11px] text-white/60">
                {pw1.length === 0
                  ? "—"
                  : pwStrength <= 2
                  ? "Faible"
                  : pwStrength === 3
                  ? "OK"
                  : "Fort"}
              </div>
            </div>

            <div className="mt-1 text-[11px] text-white/50">
              Min. 8 caractères.
            </div>
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">
              Confirmer
            </div>

            <input
              type={pwShow ? "text" : "password"}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className={cn(
                "w-full rounded-xl bg-white/5 border px-3 py-2 text-sm outline-none",
                "focus:border-white/20",
                pw2.length > 0 && !pwMatch
                  ? "border-red-500/40"
                  : "border-white/10"
              )}
              placeholder="••••••••"
              autoComplete="new-password"
            />

            {pw2.length > 0 && !pwMatch && (
              <div className="mt-1 text-xs text-red-200">
                Les mots de passe ne correspondent pas.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onChangePassword}
            disabled={!canChangePassword || pwSaving}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border",
              "border-white/10 bg-white/10 hover:bg-white/15 transition",
              (!canChangePassword || pwSaving) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {pwSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}

            Mettre à jour
          </button>

          <div className="mt-2 text-xs text-white/50">
            Si Supabase refuse (session trop vieille), déconnecte-toi puis
            reconnecte-toi et réessaie.
          </div>
        </div>
      </div>
    </Section>
  );
}