import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-mesh overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-muted/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 animate-fade-in">
          Your Carriers Owe You{" "}
          <span className="text-primary money-glow">Money</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          We automatically find and recover shipping overcharges from UPS, FedEx, and USPS 
          via Shopify + ShipStation.
        </p>
        
        <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Button 
            asChild
            size="lg" 
            className="text-lg px-8 py-6 glow-hover bg-primary text-primary-foreground font-semibold"
          >
            <Link to="/onboarding">
              Start Recovering
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Free to connect. We only earn when you do.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
