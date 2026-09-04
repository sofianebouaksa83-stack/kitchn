import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Loader2,
  Save,
  User,
  Bell,
  Shield,
  LogOut,
  Trash2,
  Mail,
  CreditCard,
} from "lucide-react";
import { ui } from "../../styles/ui";

import { cn } from "../../features/settings/utils/cn";

import { NotificationsSettings } from "../../features/settings/components/NotificationsSettings";
import { SecuritySettings } from "../../features/settings/components/SecuritySettings";
import { AccountSettings } from "../../features/settings/components/AccountSettings";
import { SubscriptionSettings } from "../../features/settings/components/SubscriptionSettings";
import { InvitationsSettings } from "../../features/settings/components/InvitationsSettings";
import { ProfileSettings } from "../../features/settings/components/ProfileSettings";

import { useProfileSettings } from "../../features/settings/hooks/useProfileSettings";
import { useInvitationsSettings } from "../../features/settings/hooks/useInvitationsSettings";
import { useSecuritySettings } from "../../features/settings/hooks/useSecuritySettings";
import { useAccountSettings } from "../../features/settings/hooks/useAccountSettings";

import { isValidUsername } from "../../features/settings/services/settingsHelpers";
import {
  getSettingsTabFromLocation,
  navigateToSettingsTab,
} from "../../features/settings/utils/settingsRoute";

import type { SettingsTab, SettingsView } from "../../features/settings/types/settings.types";

type SettingsTabButtonProps = {
  tab: SettingsTab;
  label: string;
  icon: ReactNode;
  badge?: number;
  active: boolean;
  onSelect: (tab: SettingsTab) => void;
};

type SettingsPageProps = {
  onViewChange?: (view: SettingsView) => void;
};

function SettingsTabButton({
  tab,
  label,
  icon,
  badge,
  active,
  onSelect,
}: SettingsTabButtonProps) {
  const showBadge = typeof badge === "number" && badge > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(tab)}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-between gap-3 w-full rounded-2xl px-3 py-2.5 text-sm transition",
        "ring-1",
        active
          ? "bg-amber-500/15 text-amber-200 ring-amber-400/25"
          : "bg-white/[0.04] text-slate-200/90 ring-white/10 hover:bg-white/[0.07]"
      )}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-white/75">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      {showBadge ? (
        <span className="min-w-[26px] h-6 px-2 inline-flex items-center justify-center rounded-full bg-amber-300 text-slate-950 text-xs font-bold">
          {badge}
        </span>
      ) : null}
    </button>
  );
}


export default function SettingsPage({ onViewChange }: SettingsPageProps) {
  const { user, signOut } = useAuth();

  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [tab, setTab] = useState<SettingsTab>(
    () => getSettingsTabFromLocation() ?? "profile"
  );

  const profileSettings = useProfileSettings({
    user,
    setError: setErr,
    setSuccess: setOk,
  });

  const invitationsSettings = useInvitationsSettings({
    userId: user?.id,
    active: tab === "invitations",
  });

  const securitySettings = useSecuritySettings({
    userId: user?.id,
    setError: setErr,
    setSuccess: setOk,
  });

  const accountSettings = useAccountSettings({
    setError: setErr,
    setSuccess: setOk,
  });

  useEffect(() => {
    const syncTabFromUrl = () => {
      const requestedTab = getSettingsTabFromLocation();
      setTab(requestedTab ?? "profile");
    };

    syncTabFromUrl();
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("hashchange", syncTabFromUrl);

    return () => {
      window.removeEventListener("popstate", syncTabFromUrl);
      window.removeEventListener("hashchange", syncTabFromUrl);
    };
  }, []);

  const selectTab = (nextTab: SettingsTab) => {
    setTab(nextTab);
    navigateToSettingsTab(nextTab);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050b1f] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-lg font-semibold">Paramètres</div>
          <p className="mt-2 text-sm text-white/70">
            Tu dois être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen text-white", ui?.dashboardBg)}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">Paramètres</h1>
            <p className="mt-1 text-sm text-white/60">Profil, notifications et compte.</p>
          </div>

          <button
            type="button"
            onClick={profileSettings.onSave}
            disabled={
              !profileSettings.canSave ||
              profileSettings.saving ||
              profileSettings.loading
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
              "bg-amber-400 text-black shadow-lg",
              "hover:bg-amber-300 transition",
              "ring-1 ring-amber-300/60",
              (!profileSettings.canSave ||
                profileSettings.saving ||
                profileSettings.loading) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {profileSettings.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>

        {/* Alert */}
        {(err || ok) && (
          <div
            className={cn(
              "mt-5 rounded-2xl border p-4 text-sm",
              err
                ? "border-red-500/30 bg-red-500/10 text-red-100"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">{err ?? ok}</div>

              {profileSettings.undoVisible && !err && (
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={profileSettings.onUndoRemoveAvatar}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                  >
                    Annuler ({profileSettings.undoSecondsLeft}s)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left tabs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">Connecté en tant que</div>
              <div className="mt-1 text-sm font-medium break-all">{user.email}</div>

              <button
                type="button"
                onClick={signOut}
                className="
                  mt-3 inline-flex items-center gap-2
                  rounded-xl px-3 py-2 text-sm font-medium
                  border border-red-500/30
                  bg-red-500/10 text-red-100
                  hover:bg-red-500/15
                  transition
                "
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
              <div className="px-1 pt-1 text-xs text-white/50 uppercase tracking-wide">
                Navigation
              </div>

              <SettingsTabButton
                tab="profile"
                label="Profil"
                icon={<User className="h-4 w-4" />}
                active={tab === "profile"}
                onSelect={selectTab}
              />
              <SettingsTabButton
                tab="notifications"
                label="Notifications"
                icon={<Bell className="h-4 w-4" />}
                active={tab === "notifications"}
                onSelect={selectTab}
              />
              <SettingsTabButton
                tab="invitations"
                label="Invitations"
                icon={<Mail className="h-4 w-4" />}
                badge={invitationsSettings.invCount}
                active={tab === "invitations"}
                onSelect={selectTab}
              />
              <SettingsTabButton
                tab="security"
                label="Sécurité"
                icon={<Shield className="h-4 w-4" />}
                active={tab === "security"}
                onSelect={selectTab}
              />
              <SettingsTabButton
                tab="subscription"
                label="Abonnement"
                icon={<CreditCard className="h-4 w-4" />}
                active={tab === "subscription"}
                onSelect={selectTab}
              />
              <SettingsTabButton
                tab="account"
                label="Compte"
                icon={<Trash2 className="h-4 w-4" />}
                active={tab === "account"}
                onSelect={selectTab}
              />
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-8 space-y-5">
            {tab === "profile" && (
              <ProfileSettings
                loading={profileSettings.loading}
                avatarPreview={profileSettings.avatarPreview}
                avatarAnimOut={profileSettings.avatarAnimOut}
                avatarRemoving={profileSettings.avatarRemoving}
                avatarUploading={profileSettings.avatarUploading}
                avatarInitial={profileSettings.avatarInitial}
                defaultAvatarBg={profileSettings.defaultAvatarBg}
                fileRef={profileSettings.fileRef}
                onRemoveAvatar={profileSettings.onRemoveAvatar}
                onPickAvatar={profileSettings.onPickAvatar}
                fullName={profileSettings.fullName}
                setFullName={profileSettings.setFullName}
                username={profileSettings.username}
                setUsername={profileSettings.setUsername}
                usernameError={
                  !isValidUsername(profileSettings.username)
                    ? "Format invalide"
                    : undefined
                }
                locale={profileSettings.locale}
                setLocale={profileSettings.setLocale}
                bio={profileSettings.bio}
                setBio={profileSettings.setBio}
              />
            )}

            {tab === "notifications" && (
              <NotificationsSettings
                loading={profileSettings.loading}
                notifEmail={profileSettings.notifEmail}
                setNotifEmail={profileSettings.setNotifEmail}
                notifPush={profileSettings.notifPush}
                setNotifPush={profileSettings.setNotifPush}
                marketingEmail={profileSettings.marketingEmail}
                setMarketingEmail={profileSettings.setMarketingEmail}
              />
            )}

            {tab === "invitations" && (
              <InvitationsSettings
                loading={invitationsSettings.invLoading}
                error={invitationsSettings.invErr}
                invitations={invitationsSettings.invitations}
                joiningToken={invitationsSettings.joiningToken}
                onAcceptInvitation={invitationsSettings.onAcceptInvitation}
              />
            )}

            {tab === "security" && (
              <SecuritySettings
                loading={profileSettings.loading}
                pwShow={securitySettings.pwShow}
                setPwShow={securitySettings.setPwShow}
                pw1={securitySettings.pw1}
                setPw1={securitySettings.setPw1}
                pw2={securitySettings.pw2}
                setPw2={securitySettings.setPw2}
                pwStrength={securitySettings.pwStrength}
                pwMatch={securitySettings.pwMatch}
                canChangePassword={securitySettings.canChangePassword}
                pwSaving={securitySettings.pwSaving}
                onChangePassword={securitySettings.onChangePassword}
              />
            )}

            {tab === "subscription" && (
              <SubscriptionSettings
                onOpenCheckout={() => onViewChange?.("subscription-checkout")}
              />
            )}
                     
            {tab === "account" && (
              <AccountSettings
                loading={profileSettings.loading}
                onDeleteAccount={accountSettings.onDeleteAccount}
              />
            )}
          </div>
        </div>

        {/* Save button mobile */}
        <div className="lg:hidden mt-6">
          <button
            type="button"
            onClick={profileSettings.onSave}
            disabled={
              !profileSettings.canSave ||
              profileSettings.saving ||
              profileSettings.loading
            }
            className={cn(
              "w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium border",
              "border-white/10 bg-white/10 hover:bg-white/15 transition",
              (!profileSettings.canSave ||
                profileSettings.saving ||
                profileSettings.loading) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {profileSettings.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
