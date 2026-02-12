import { Shield } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="h-10 w-10 text-primary mx-auto mb-6 opacity-60" />
          
          <blockquote className="text-2xl sm:text-3xl font-medium text-foreground leading-relaxed mb-6 animate-fade-in">
            "Most sellers don't know they're being overcharged. We check every shipment so you don't have to."
          </blockquote>
          
          <p className="text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Proof-first recovery · Audit-grade evidence packets · Always-on monitoring
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
