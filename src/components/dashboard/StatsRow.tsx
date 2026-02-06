import { TrendingUp, Clock, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  variant: "cyan" | "coral" | "white";
  actionLink?: { label: string; to: string };
}

const StatCard = ({ label, value, subtext, trend, variant, actionLink }: StatCardProps) => {
  const borderClass = {
    cyan: "border-accent-cyan",
    coral: "border-accent-coral",
    white: "border-accent-white",
  }[variant];

  const valueClass = {
    cyan: "text-primary money-glow",
    coral: "text-coral",
    white: "text-foreground",
  }[variant];

  const trendClass = {
    cyan: "text-primary",
    coral: "text-coral",
    white: "text-foreground",
  }[variant];

  return (
    <Card className={`bg-card border-border ${borderClass} animate-fade-in`}>
      <CardContent className="p-6">
        <p className="label-caps mb-2">{label}</p>
        <p className={`text-4xl font-extrabold mb-2 ${valueClass}`}>
          {value}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{subtext}</p>
          {trend && (
            <span className={`text-sm font-medium flex items-center gap-1 ${trendClass}`}>
              <TrendingUp className="h-3 w-3" />
              {trend}
            </span>
          )}
          {actionLink && (
            <Link 
              to={actionLink.to}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              {actionLink.label}
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatsRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        label="Recovered"
        value="$4,247.83"
        subtext="This month"
        trend="↑ 23% vs last month"
        variant="cyan"
      />
      <StatCard
        label="Pending Review"
        value="$892.40"
        subtext="12 claims"
        variant="coral"
      />
      <StatCard
        label="Ready to File"
        value="$1,156.20"
        subtext="24 issues found"
        variant="white"
        actionLink={{ label: "File All", to: "/claims" }}
      />
    </div>
  );
};

export default StatsRow;
