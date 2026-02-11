import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, MoreHorizontal } from "lucide-react";

const tabs = [
  { label: "Home", path: "/agent", icon: Home },
  { label: "Cases", path: "/cases", icon: FolderOpen },
  { label: "More", path: "/more", icon: MoreHorizontal },
];

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/agent") return location.pathname === "/agent" || location.pathname === "/";
    if (path === "/cases") return location.pathname === "/cases" || location.pathname.startsWith("/case/");
    if (path === "/more") return ["/more", "/connectors", "/app-settings", "/report"].some(p => location.pathname.startsWith(p));
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 px-6 py-1.5 rounded-lg transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
