import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Sparkles, Monitor } from "lucide-react";
import AppNav from "@/components/navigation/AppNav";
import { Switch } from "@/components/ui/switch";

const AppSettings = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [confetti, setConfetti] = useState(true);
  const [confettiStyle, setConfettiStyle] = useState<"subtle" | "full">("subtle");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [autoApproveHigh, setAutoApproveHigh] = useState(false);
  const [autoApproveUnder, setAutoApproveUnder] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Reduced motion</p>
                  <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Confetti on paid claims</p>
                  <p className="text-xs text-muted-foreground">Celebrate when refunds are deposited</p>
                </div>
                <Switch checked={confetti} onCheckedChange={setConfetti} />
              </div>
              {confetti && (
                <div className="pl-4 border-l-2 border-border">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConfettiStyle("subtle")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        confettiStyle === "subtle" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      Subtle
                    </button>
                    <button
                      onClick={() => setConfettiStyle("full")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        confettiStyle === "full" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      Full celebration 🎉
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Email notifications</p>
                  <p className="text-xs text-muted-foreground">Recovery updates, approvals, and deposits</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Push notifications</p>
                  <p className="text-xs text-muted-foreground">Real-time alerts on your device</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Weekly digest</p>
                  <p className="text-xs text-muted-foreground">Summary of recoveries and pipeline updates</p>
                </div>
                <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
              </div>
            </div>
          </div>

          {/* Auto-approval Rules */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Auto-Approval Rules</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-muted-foreground">Preview</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Auto-approve HIGH confidence</p>
                  <p className="text-xs text-muted-foreground">Automatically file cases with high confidence</p>
                </div>
                <Switch checked={autoApproveHigh} onCheckedChange={setAutoApproveHigh} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Auto-approve under $25</p>
                  <p className="text-xs text-muted-foreground">Skip approval for small recovery amounts</p>
                </div>
                <Switch checked={autoApproveUnder} onCheckedChange={setAutoApproveUnder} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSettings;
