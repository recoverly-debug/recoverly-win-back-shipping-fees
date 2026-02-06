import { Quote } from "lucide-react";

const Testimonial = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-12 w-12 text-primary mx-auto mb-6 opacity-50" />
          
          <blockquote className="text-2xl sm:text-3xl font-medium text-foreground leading-relaxed mb-8 animate-fade-in">
            "Recoverly found <span className="text-primary money-glow">$3,200</span> in the first month. 
            Money I'd never have known about. Setup took 5 minutes and it's been passive income ever since."
          </blockquote>
          
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">SM</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Sarah Mitchell</p>
              <p className="text-sm text-muted-foreground">Owner, Mitchell Home Goods</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
