const StatsBar = () => {
  const statements = [
    { label: "Proof-first recovery", description: "Every claim backed by audit-grade evidence" },
    { label: "Always-on monitoring", description: "Continuous shipment and billing audits" },
    { label: "Audit-grade packets", description: "Complete evidence for every case" },
  ];

  return (
    <section className="py-12 border-y border-border bg-card/50">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {statements.map((item, index) => (
            <div
              key={item.label}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-lg sm:text-xl font-bold text-foreground mb-1">
                {item.label}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
