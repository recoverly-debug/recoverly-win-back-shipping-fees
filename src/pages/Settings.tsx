import { useState } from "react";
import DashboardNav from "@/components/dashboard/DashboardNav";
import ProfileTab from "@/components/settings/ProfileTab";
import ConnectionsTab from "@/components/settings/ConnectionsTab";
import BillingTab from "@/components/settings/BillingTab";
import NotificationsTab from "@/components/settings/NotificationsTab";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "connections", label: "Connections" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container px-4 py-8 space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "connections" && <ConnectionsTab />}
          {activeTab === "billing" && <BillingTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </main>
    </div>
  );
};

export default Settings;
