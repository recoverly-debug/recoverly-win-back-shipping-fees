const Testimonial = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center animate-fade-in">
            <blockquote className="text-xl sm:text-2xl font-medium text-foreground leading-relaxed mb-4">
              "~80% of carrier invoices contain billing discrepancies."
            </blockquote>
            <p className="text-sm text-muted-foreground">
              Intelligent Audit industry reporting
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
