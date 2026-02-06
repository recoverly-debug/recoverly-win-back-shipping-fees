import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const InsightCard = () => {
  return (
    <Card className="bg-card border-border border-accent-cyan animate-fade-in">
      <CardContent className="p-6 flex gap-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground mb-1">Optimization Insight</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your USPS on-time delivery rate is below average at 71%. Consider shifting Priority Mail 
            volume to UPS Ground for better reliability and fewer late delivery claims.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
