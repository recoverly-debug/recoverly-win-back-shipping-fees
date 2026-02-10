import { TrendingUp, Clock, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";

interface StatusCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  icon?: "money" | "clock" | "alert" | "check" | "trending";
  glowColor?: "emerald" | "amber" | "blue" | "red";
}

const iconMap = {
  money: DollarSign,
  clock: Clock,
  alert: AlertTriangle,
  check: CheckCircle2,
  trending: TrendingUp,
};

const glowMap = {
  emerald: "shadow-glow-sm border-primary/30",
  amber: "shadow-glow-amber border-amber/30",
  blue: "shadow-glow-blue border-agent-blue/30",
  red: "shadow-glow-red border-destructive/30",
};

const iconColorMap = {
  emerald: "text-primary bg-primary/10",
  amber: "text-amber bg-amber/10",
  blue: "text-agent-blue bg-agent-blue/10",
  red: "text-destructive bg-destructive/10",
};

const StatusCard = ({ label, value, subValue, trend, icon = "money", glowColor = "emerald" }: StatusCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div className={`relative rounded-xl border bg-card p-5 transition-all duration-300 hover:scale-[1.02] ${glowMap[glowColor]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-caps mb-2">{label}</p>
          <p className={`text-2xl font-bold ${glowColor === "emerald" ? "money-glow text-primary" : "text-foreground"}`}>
            {typeof value === "number" ? `$${value.toLocaleString()}` : value}
          </p>
          {subValue && <p className="text-sm text-muted-foreground mt-1">{subValue}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconColorMap[glowColor]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs text-primary">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
