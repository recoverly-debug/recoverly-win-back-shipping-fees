import { Check, X, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionCardProps {
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  detail?: string;
}

const ConnectionCard = ({ name, icon, connected, detail }: ConnectionCardProps) => (
  <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-surface-elevated flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium text-foreground">{name}</p>
        {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      </div>
    </div>
    {connected ? (
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm text-primary">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Connected
        </span>
        <button className="text-sm text-muted-foreground hover:text-destructive transition-colors">
          Disconnect
        </button>
      </div>
    ) : (
      <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        Connect
      </Button>
    )}
  </div>
);

const ConnectionsTab = () => (
  <div className="space-y-6">
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Store</h3>
      <ConnectionCard
        name="Shopify"
        icon={<ShoppingBag className="h-5 w-5 text-foreground" />}
        connected={true}
        detail="alexs-apparel.myshopify.com"
      />
    </div>

    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Carriers</h3>
      <div className="space-y-3">
        <ConnectionCard
          name="UPS"
          icon={<Truck className="h-5 w-5 text-foreground" />}
          connected={true}
          detail="Account ending in 4821"
        />
        <ConnectionCard
          name="FedEx"
          icon={<Truck className="h-5 w-5 text-foreground" />}
          connected={true}
          detail="Account ending in 7392"
        />
        <ConnectionCard
          name="USPS"
          icon={<Truck className="h-5 w-5 text-foreground" />}
          connected={false}
        />
      </div>
    </div>
  </div>
);

export default ConnectionsTab;
