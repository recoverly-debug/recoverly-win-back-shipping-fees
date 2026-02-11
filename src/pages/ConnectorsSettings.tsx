import { useState } from "react";
import { Plug, Store, Truck, Package, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";
import Logo from "@/components/Logo";

const connectors = [
  {
    id: "shipstation",
    name: "ShipStation",
    description: "Shipments, labels, tracking events, carrier invoices",
    icon: Package,
    status: "connected" as const,
    connectedAt: "Connected Jan 15, 2024",
    color: "text-primary",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Orders, line items, fulfillments, order values",
    icon: Store,
    status: "connected" as const,
    connectedAt: "Connected Jan 15, 2024",
    color: "text-primary",
  },
  {
    id: "amazon",
    name: "Amazon Seller",
    description: "FBA shipments, reimbursement claims",
    icon: ShoppingCart,
    status: "coming_soon" as const,
    color: "text-muted-foreground",
  },
  {
    id: "3pl",
    name: "3PL Central",
    description: "Third-party logistics data",
    icon: Truck,
    status: "coming_soon" as const,
    color: "text-muted-foreground",
  },
  {
    id: "ups",
    name: "UPS Direct",
    description: "Direct carrier portal integration",
    icon: Truck,
    status: "coming_soon" as const,
    color: "text-muted-foreground",
  },
  {
    id: "fedex",
    name: "FedEx Direct",
    description: "Direct carrier portal integration",
    icon: Truck,
    status: "coming_soon" as const,
    color: "text-muted-foreground",
  },
];

const ConnectorsSettings = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container px-4 h-14 flex items-center"><Logo /></div>
      </header>
      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Plug className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Connectors</h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage your data source connections.</p>
        </div>

        <div className="space-y-3">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className={`p-4 rounded-xl border bg-card transition-all ${
                conn.status === "connected" ? "border-primary/20" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  conn.status === "connected" ? "bg-primary/10" : "bg-surface"
                }`}>
                  <conn.icon className={`h-5 w-5 ${conn.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{conn.name}</h3>
                    {conn.status === "connected" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    {conn.status === "coming_soon" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated text-muted-foreground">Coming Soon</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{conn.description}</p>
                  {conn.connectedAt && <p className="text-xs text-primary mt-1">{conn.connectedAt}</p>}
                </div>
                {conn.status === "connected" && (
                  <button className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    Manage
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default ConnectorsSettings;
