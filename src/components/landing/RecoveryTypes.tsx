import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const recoveryTypes = [
  { title: "Late Deliveries", description: "Get refunds when carriers miss guaranteed delivery times" },
  { title: "Duplicate Charges", description: "Catch and recover double-billed shipments" },
  { title: "Weight Overcharges", description: "Recover fees from incorrect weight calculations" },
  { title: "Invalid Surcharges", description: "Challenge wrongly applied residential or rural surcharges" },
  { title: "DIM Weight Errors", description: "Dispute inaccurate dimensional weight pricing" },
  { title: "Billing Mistakes", description: "Find and fix carrier invoice discrepancies" },
];

const RecoveryTypes = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What We Recover
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our AI identifies 6 major categories of shipping overcharges
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {recoveryTypes.map((type, index) => (
            <Card 
              key={type.title}
              className="bg-card border-border hover:border-primary/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <CardContent className="p-5 flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecoveryTypes;
