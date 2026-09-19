import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "../../contexts/AuthContext";

import {
  Bell,
  CreditCard,
  Loader2,
  LogOut,
  Mail,
  Save,
  Shield,
  Trash2,
  User,
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

import type {
  SettingsTab,
  SettingsView,
} from "../../features/settings/types/settings.types";

type SettingsTabButtonProps = {
  tab: SettingsTab;
  label: string;
  icon: ReactNode;
  badge?: number;
  active: boolean;
  onSelect: (tab: SettingsTab) => void;
};

type SettingsPageProps = {
  onViewChange?: (
    view: SettingsView,
  ) => void;
};

function SettingsTabButton({
  tab,
  label,
  icon,
  badge,
  active,
  onSelect,
}: SettingsTabButtonProps) {
  const showBadge =
    typeof badge === "number" &&
    badge > 0;

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(tab)
      }
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[#E7EEE8] text-[#184C3A]"
          : "text-[#617168] hover:bg-[#F0F2EC] hover:text-[#184C3A]",
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-xl transition",
            active
              ? "bg-[#FBFAF6] text-[#184C3A]"
              : "bg-[#F0F2EC] text-[#718078]",
          )}
        >
          {icon}
        </span>

        <span className="truncate">
          {label}
        </span>
      </span>

      {showBadge ? (
        <span
          className="
            inline-flex h-6
            min-w-[26px]
            items-center
            justify-center
            rounded-full
            bg-[#DDAE9D]
            px-2
            text-xs
            font-bold
            text-[#173E31]
          "
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function SettingsPage({
  onViewChange,
}: SettingsPageProps) {
  const {
    user,
    signOut,
  } = useAuth();

  const [ok, setOk] =
    useState<string | null>(
      null,
    );

  const [err, setErr] =
    useState<string | null>(
      null,
    );

  const [tab, setTab] =
    useState<SettingsTab>(
      () =>
        getSettingsTabFromLocation() ??
        "profile",
    );

  const profileSettings =
    useProfileSettings({
      user,
      setError: setErr,
      setSuccess: setOk,
    });

  const invitationsSettings =
    useInvitationsSettings({
      userId: user?.id,
      active:
        tab === "invitations",
    });

  const securitySettings =
    useSecuritySettings({
      userId: user?.id,
      setError: setErr,
      setSuccess: setOk,
    });

  const accountSettings =
    useAccountSettings({
      setError: setErr,
      setSuccess: setOk,
    });

  useEffect(() => {
    const syncTabFromUrl =
      () => {
        const requestedTab =
          getSettingsTabFromLocation();

        setTab(
          requestedTab ??
            "profile",
        );
      };

    syncTabFromUrl();

    window.addEventListener(
      "popstate",
      syncTabFromUrl,
    );

    window.addEventListener(
      "hashchange",
      syncTabFromUrl,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        syncTabFromUrl,
      );

      window.removeEventListener(
        "hashchange",
        syncTabFromUrl,
      );
    };
  }, []);

  const selectTab = (
    nextTab: SettingsTab,
  ) => {
    setTab(nextTab);

    navigateToSettingsTab(
      nextTab,
    );
  };

  if (!user) {
    return (
      <div
        className={`
          ${ui.dashboardBg}
          flex min-h-screen
          items-center
          justify-center
          p-6
        `}
      >
        <div
          className="
            w-full max-w-md
            rounded-[28px]
            border border-[#173E31]/10
            bg-[#FBFAF6]
            p-6
            shadow-[0_12px_35px_rgba(23,62,49,0.06)]
          "
        >
          <div
            className="
              font-serif
              text-2xl
              font-semibold
              text-[#173E31]
            "
          >
            Paramètres
          </div>

          <p
            className="
              mt-2
              text-sm
              leading-relaxed
              text-[#718078]
            "
          >
            Tu dois être connecté
            pour accéder à cette
            page.
          </p>
        </div>
      </div>
    );
  }

  const saveDisabled =
    !profileSettings.canSave ||
    profileSettings.saving ||
    profileSettings.loading;

  return (
    <div
      className={`
        ${ui.dashboardBg}
        min-h-screen
      `}
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          px-4 py-6
          sm:px-6
          sm:py-8
        "
      >
        {/* HEADER */}
        <div
          className="
            flex flex-col
            gap-5
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                mb-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[#A8833E]
              "
            >
              Mon compte
            </p>

            <h1
              className="
                font-serif
                text-3xl
                font-semibold
                text-[#173E31]
                sm:text-4xl
              "
            >
              Paramètres
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-[#718078]
              "
            >
              Profil, notifications,
              sécurité et abonnement.
            </p>
          </div>

          <button
            type="button"
            onClick={
              profileSettings.onSave
            }
            disabled={
              saveDisabled
            }
            className={
              ui.btnPrimary
            }
          >
            {profileSettings.saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Enregistrer
          </button>
        </div>

        {/* ALERT */}
        {(err || ok) ? (
          <div
            className={cn(
              "mt-5 rounded-2xl border px-4 py-3 text-sm",
              err
                ? "border-[#C05C56]/20 bg-[#F8EAE7] text-[#9B4944]"
                : "border-[#184C3A]/12 bg-[#E7EEE8] text-[#184C3A]",
            )}
          >
            <div
              className="
                flex items-start
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                {err ?? ok}
              </div>

              {profileSettings.undoVisible &&
              !err ? (
                <button
                  type="button"
                  onClick={
                    profileSettings.onUndoRemoveAvatar
                  }
                  className="
                    shrink-0
                    rounded-full
                    bg-[#FBFAF6]
                    px-3 py-1.5
                    text-xs
                    font-semibold
                    text-[#184C3A]
                    transition
                    hover:bg-white
                  "
                >
                  Annuler (
                  {
                    profileSettings.undoSecondsLeft
                  }
                  s)
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div
          className="
            mt-6
            grid grid-cols-1
            gap-5
            lg:grid-cols-12
          "
        >
          {/* LEFT */}
          <aside
            className="
              space-y-4
              lg:col-span-4
            "
          >
            {/* ACCOUNT */}
            <div
              className="
                rounded-[26px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-4
                shadow-[0_8px_24px_rgba(23,62,49,0.04)]
              "
            >
              <div
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-[#A8833E]
                "
              >
                Connecté en tant que
              </div>

              <div
                className="
                  mt-2
                  break-all
                  text-sm
                  font-medium
                  text-[#173E31]
                "
              >
                {user.email}
              </div>

              <button
                type="button"
                onClick={signOut}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#F5E4E0]
                  px-4 py-2.5
                  text-sm
                  font-medium
                  text-[#A54C48]
                  transition
                  hover:bg-[#F0D8D3]
                "
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>

            {/* NAV */}
            <div
              className="
                rounded-[26px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-3
                shadow-[0_8px_24px_rgba(23,62,49,0.04)]
              "
            >
              <div
                className="
                  px-2 pb-2 pt-1
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.15em]
                  text-[#A8833E]
                "
              >
                Navigation
              </div>

              <div className="space-y-1">
                <SettingsTabButton
                  tab="profile"
                  label="Profil"
                  icon={
                    <User className="h-4 w-4" />
                  }
                  active={
                    tab === "profile"
                  }
                  onSelect={
                    selectTab
                  }
                />

                <SettingsTabButton
                  tab="notifications"
                  label="Notifications"
                  icon={
                    <Bell className="h-4 w-4" />
                  }
                  active={
                    tab ===
                    "notifications"
                  }
                  onSelect={
                    selectTab
                  }
                />

                <SettingsTabButton
                  tab="invitations"
                  label="Invitations"
                  icon={
                    <Mail className="h-4 w-4" />
                  }
                  badge={
                    invitationsSettings.invCount
                  }
                  active={
                    tab ===
                    "invitations"
                  }
                  onSelect={
                    selectTab
                  }
                />

                <SettingsTabButton
                  tab="security"
                  label="Sécurité"
                  icon={
                    <Shield className="h-4 w-4" />
                  }
                  active={
                    tab === "security"
                  }
                  onSelect={
                    selectTab
                  }
                />

                <SettingsTabButton
                  tab="subscription"
                  label="Abonnement"
                  icon={
                    <CreditCard className="h-4 w-4" />
                  }
                  active={
                    tab ===
                    "subscription"
                  }
                  onSelect={
                    selectTab
                  }
                />

                <SettingsTabButton
                  tab="account"
                  label="Compte"
                  icon={
                    <Trash2 className="h-4 w-4" />
                  }
                  active={
                    tab === "account"
                  }
                  onSelect={
                    selectTab
                  }
                />
              </div>
            </div>
          </aside>

          {/* RIGHT */}
          <main
            className="
              space-y-5
              lg:col-span-8
            "
          >
            {tab === "profile" ? (
              <ProfileSettings
                loading={
                  profileSettings.loading
                }
                avatarPreview={
                  profileSettings.avatarPreview
                }
                avatarAnimOut={
                  profileSettings.avatarAnimOut
                }
                avatarRemoving={
                  profileSettings.avatarRemoving
                }
                avatarUploading={
                  profileSettings.avatarUploading
                }
                avatarInitial={
                  profileSettings.avatarInitial
                }
                defaultAvatarBg={
                  profileSettings.defaultAvatarBg
                }
                fileRef={
                  profileSettings.fileRef
                }
                onRemoveAvatar={
                  profileSettings.onRemoveAvatar
                }
                onPickAvatar={
                  profileSettings.onPickAvatar
                }
                fullName={
                  profileSettings.fullName
                }
                setFullName={
                  profileSettings.setFullName
                }
                username={
                  profileSettings.username
                }
                setUsername={
                  profileSettings.setUsername
                }
                usernameError={
                  !isValidUsername(
                    profileSettings.username,
                  )
                    ? "Format invalide"
                    : undefined
                }
                locale={
                  profileSettings.locale
                }
                setLocale={
                  profileSettings.setLocale
                }
                bio={
                  profileSettings.bio
                }
                setBio={
                  profileSettings.setBio
                }
              />
            ) : null}

            {tab ===
            "notifications" ? (
              <NotificationsSettings
                loading={
                  profileSettings.loading
                }
                notifEmail={
                  profileSettings.notifEmail
                }
                setNotifEmail={
                  profileSettings.setNotifEmail
                }
                notifPush={
                  profileSettings.notifPush
                }
                setNotifPush={
                  profileSettings.setNotifPush
                }
                marketingEmail={
                  profileSettings.marketingEmail
                }
                setMarketingEmail={
                  profileSettings.setMarketingEmail
                }
              />
            ) : null}

            {tab ===
            "invitations" ? (
              <InvitationsSettings
                loading={
                  invitationsSettings.invLoading
                }
                error={
                  invitationsSettings.invErr
                }
                invitations={
                  invitationsSettings.invitations
                }
                joiningToken={
                  invitationsSettings.joiningToken
                }
                onAcceptInvitation={
                  invitationsSettings.onAcceptInvitation
                }
              />
            ) : null}

            {tab ===
            "security" ? (
              <SecuritySettings
                loading={
                  profileSettings.loading
                }
                pwShow={
                  securitySettings.pwShow
                }
                setPwShow={
                  securitySettings.setPwShow
                }
                pw1={
                  securitySettings.pw1
                }
                setPw1={
                  securitySettings.setPw1
                }
                pw2={
                  securitySettings.pw2
                }
                setPw2={
                  securitySettings.setPw2
                }
                pwStrength={
                  securitySettings.pwStrength
                }
                pwMatch={
                  securitySettings.pwMatch
                }
                canChangePassword={
                  securitySettings.canChangePassword
                }
                pwSaving={
                  securitySettings.pwSaving
                }
                onChangePassword={
                  securitySettings.onChangePassword
                }
              />
            ) : null}

            {tab ===
            "subscription" ? (
              <SubscriptionSettings
                onOpenCheckout={() =>
                  onViewChange?.(
                    "subscription-checkout",
                  )
                }
              />
            ) : null}

            {tab === "account" ? (
              <AccountSettings
                loading={
                  profileSettings.loading
                }
                onDeleteAccount={
                  accountSettings.onDeleteAccount
                }
              />
            ) : null}
          </main>
        </div>

        {/* MOBILE SAVE */}
        <div className="mt-6 lg:hidden">
          <button
            type="button"
            onClick={
              profileSettings.onSave
            }
            disabled={
              saveDisabled
            }
            className={`${ui.btnPrimary} w-full justify-center`}
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