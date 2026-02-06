import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

const AnimatedCounter = ({ 
  end, 
  prefix = "", 
  suffix = "", 
  duration = 2000,
  decimals = 0 
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toLocaleString();

  return (
    <span className="text-primary font-extrabold money-glow">
      {prefix}{formattedCount}{suffix}
    </span>
  );
};

const StatsBar = () => {
  const stats = [
    { value: 12.4, prefix: "$", suffix: "M+", label: "recovered", decimals: 1 },
    { value: 2400, prefix: "", suffix: "+", label: "sellers", decimals: 0 },
    { value: 94, prefix: "", suffix: "%", label: "approval rate", decimals: 0 },
  ];

  return (
    <section className="py-12 border-y border-border bg-card/50">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl sm:text-4xl mb-1">
                <AnimatedCounter 
                  end={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </div>
              <p className="label-caps">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
