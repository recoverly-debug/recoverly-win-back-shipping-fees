import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Truck, RotateCcw, CreditCard, Store, ChevronDown, User, Bell, Settings, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const modules = [
  { icon: Truck, label: "Shipping", path: "/agent", active: true },
  { icon: RotateCcw, label: "Returns", path: "#", coming: true },
  { icon: CreditCard, label: "Chargebacks", path: "#", coming: true },
  { icon: Store, label: "Marketplace", path: "#", coming: true },
];

const navItems = [
  { label: "Home", path: "/agent" },
  { label: "Approvals", path: "/approvals" },
  { label: "Report", path: "/report" },
  { label: "Connectors", path: "/connectors" },
  { label: "Settings", path: "/app-settings" },
];

const AppNav = () => {
  const location = useLocation();
  const [showModules, setShowModules] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Module Switcher */}
          <div className="flex items-center gap-3">
            <Logo />
            <div className="relative">
              <button
                onClick={() => setShowModules(!showModules)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                <Truck className="h-3.5 w-3.5" />
                Shipping
                <ChevronDown className="h-3 w-3" />
              </button>
              {showModules && (
                <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-xl shadow-lg p-1.5 min-w-[180px] animate-scale-in z-50">
                  {modules.map((mod) => (
                    <button
                      key={mod.label}
                      onClick={() => setShowModules(false)}
                      disabled={mod.coming}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                        mod.active ? "bg-primary/10 text-primary font-medium" : mod.coming ? "text-muted-foreground opacity-50 cursor-not-allowed" : "hover:bg-accent text-foreground"
                      }`}
                    >
                      <mod.icon className="h-4 w-4" />
                      {mod.label}
                      {mod.coming && <span className="ml-auto text-xs text-muted-foreground">Soon</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors relative ${
                    isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-agent-blue/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem><User className="h-4 w-4 mr-2" /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><LogOut className="h-4 w-4 mr-2" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default AppNav;
