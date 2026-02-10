import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/lib/case-data";

interface MoneyBadgeProps {
  amount: number;
  status?: CaseStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MoneyBadge = ({ amount, status, size = "md", className }: MoneyBadgeProps) => {
  const isPaid = status === "PAID";
  const isApproved = status === "APPROVED";
  const isPositive = isPaid || isApproved;

  const sizeClasses = {
    sm: "text-sm px-2 py-0.5",
    md: "text-base px-3 py-1",
    lg: "text-xl px-4 py-1.5 font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold font-mono tabular-nums",
        sizeClasses[size],
        isPositive
          ? "text-primary bg-primary/10 money-glow"
          : status === "NEEDS_EVIDENCE" || status === "DENIED"
          ? "text-amber bg-amber/10"
          : "text-foreground bg-surface-elevated",
        isPaid && "animate-count-up",
        className
      )}
    >
      {isPositive ? "+" : ""}${amount.toFixed(2)}
    </span>
  );
};

export default MoneyBadge;
