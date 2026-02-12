import { Store, Search, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    icon: Store,
    title: "Connect Shopify + ShipStation",
    description: "Link your Shopify store and ShipStation account in under 2 minutes. We securely sync your shipping data.",
  },
  {
    icon: Search,
    title: "We Audit Everything",
    description: "Our AI scans every shipment for overcharges, late deliveries, and billing errors across all carriers.",
  },
  {
    icon: DollarSign,
    title: "Get Money Back",
    description: "We file claims automatically and deposit refunds directly to your account. You keep 75% of every recovery.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start recovering money in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={step.title}
              className="bg-card border-border card-accent-top animate-fade-in hover:bg-accent/50 transition-colors"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
