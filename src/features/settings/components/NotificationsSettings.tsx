import { Bell } from "lucide-react";
import { Section } from "./Section";
import { Toggle } from "./Toggle";

type NotificationsSettingsProps = {
  loading: boolean;
  notifEmail: boolean;
  setNotifEmail: (value: boolean) => void;
  notifPush: boolean;
  setNotifPush: (value: boolean) => void;
  marketingEmail: boolean;
  setMarketingEmail: (value: boolean) => void;
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
      icon={<Bell className="h-4 w-4" />}
      loading={loading}
    >
      <Toggle
        label="Email (activité & partages)"
        checked={notifEmail}
        onChange={setNotifEmail}
      />

      <div className="h-2" />

      <Toggle
        label="Push (mobile) — plus tard"
        checked={notifPush}
        onChange={setNotifPush}
      />

      <div className="h-2" />

      <Toggle
        label="Emails marketing"
        checked={marketingEmail}
        onChange={setMarketingEmail}
      />
    </Section>
  );
}