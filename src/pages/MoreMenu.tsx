import { Link } from "react-router-dom";
import { Plug, FileText, Settings, ChevronRight } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";
import Logo from "@/components/Logo";

const menuItems = [
  { label: "Connectors", description: "ShipStation, Shopify & more", icon: Plug, path: "/connectors" },
  { label: "Recovery Report", description: "Pipeline overview & metrics", icon: FileText, path: "/report" },
  { label: "Settings", description: "Theme, notifications, rules", icon: Settings, path: "/app-settings" },
];

const MoreMenu = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container px-4 h-14 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container px-4 py-6 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-foreground mb-4">More</h1>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MoreMenu;
