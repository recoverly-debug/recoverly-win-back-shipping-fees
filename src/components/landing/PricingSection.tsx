import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PricingSection = () => {
  return (
    <section className="py-20 bg-card/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Simple, Fair Pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We make money when you make money. No monthly fees, no commitments.
          </p>
        </div>

        <Card className="max-w-md mx-auto bg-card border-border card-accent-top animate-fade-in">
          <CardHeader className="text-center pt-10">
            <div className="mb-4">
              <span className="text-7xl sm:text-8xl font-extrabold text-primary money-glow">25%</span>
            </div>
            <p className="text-xl text-muted-foreground">of recovered funds</p>
          </CardHeader>
          <CardContent className="text-center pb-10">
            <p className="text-foreground mb-8 max-w-xs mx-auto">
              We make money when you make money. You keep <span className="font-semibold">75%</span> of every dollar we recover.
            </p>
            
            <ul className="text-left max-w-xs mx-auto mb-8 space-y-3">
              {[
                "Free store connection",
                "Automatic claim filing",
                "All major carriers supported",
                "Real-time tracking dashboard",
                "Cancel anytime",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              asChild
              size="lg" 
              className="w-full text-lg py-6 glow-hover bg-primary text-primary-foreground font-semibold"
            >
              <Link to="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;
