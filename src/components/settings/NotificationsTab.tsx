import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotifSetting {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const settings: NotifSetting[] = [
  { id: "recovery", label: "Recovery Alerts", description: "Get notified when a refund is deposited", defaultOn: true },
  { id: "weekly", label: "Weekly Digest", description: "Summary of claims and recoveries each week", defaultOn: true },
  { id: "claims", label: "Claim Updates", description: "Status changes on individual claims", defaultOn: false },
  { id: "sms", label: "SMS Notifications", description: "Receive text messages for important updates", defaultOn: false },
];

const NotificationsTab = () => {
  const [values, setValues] = useState<Record<string, boolean>>(
    Object.fromEntries(settings.map((s) => [s.id, s.defaultOn]))
  );

  const toggle = (id: string) => setValues((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-1">
      <h3 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h3>
      {settings.map((s) => (
        <div
          key={s.id}
          className="flex items-center justify-between py-4 border-b border-border last:border-0"
        >
          <div className="space-y-0.5">
            <Label className="text-foreground font-medium">{s.label}</Label>
            <p className="text-sm text-muted-foreground">{s.description}</p>
          </div>
          <Switch
            checked={values[s.id]}
            onCheckedChange={() => toggle(s.id)}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationsTab;
