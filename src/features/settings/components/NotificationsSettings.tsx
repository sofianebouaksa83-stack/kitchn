import {
  Bell,
  Mail,
  Megaphone,
  Smartphone,
} from "lucide-react";

import { Section } from "./Section";
import { Toggle } from "./Toggle";

type NotificationsSettingsProps = {
  loading: boolean;

  notifEmail: boolean;
  setNotifEmail: (
    value: boolean,
  ) => void;

  notifPush: boolean;
  setNotifPush: (
    value: boolean,
  ) => void;

  marketingEmail: boolean;
  setMarketingEmail: (
    value: boolean,
  ) => void;
};

export function NotificationsSettings({
  loading,

  notifEmail,
  setNotifEmail,

  notifPush,
  setNotifPush,

  marketingEmail,
  setMarketingEmail,
}: NotificationsSettingsProps) {
  return (
    <Section
      title="Notifications"
      icon={
        <Bell className="h-4 w-4" />
      }
      loading={loading}
    >
      <p
        className="
          mb-4
          text-sm
          sm:mb-5
          leading-relaxed
          text-[#718078]
        "
      >
        Choisis comment Kitch’n peut
        te prévenir des activités,
        partages et nouveautés.
      </p>

      <div className="space-y-4 sm:space-y-3">
        <div>
          <div
            className="
              mb-2
              flex items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#A8833E]
            "
          >
            <Mail className="h-3.5 w-3.5" />
            Activité
          </div>

          <Toggle
            label="Email — activité & partages"
            checked={notifEmail}
            onChange={
              setNotifEmail
            }
          />
        </div>

        <div>
          <div
            className="
              mb-2
              flex items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#A8833E]
            "
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </div>

          <Toggle
            label="Notifications Push — bientôt"
            checked={notifPush}
            onChange={
              setNotifPush
            }
          />
        </div>

        <div>
          <div
            className="
              mb-2
              flex items-center
              gap-2
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#A8833E]
            "
          >
            <Megaphone className="h-3.5 w-3.5" />
            Nouveautés
          </div>

          <Toggle
            label="Emails marketing"
            checked={
              marketingEmail
            }
            onChange={
              setMarketingEmail
            }
          />
        </div>
      </div>
    </Section>
  );
}