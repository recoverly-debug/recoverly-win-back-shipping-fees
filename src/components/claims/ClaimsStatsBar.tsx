interface ClaimsStatsBarProps {
  total: number;
  recovered: number;
  successRate: number;
}

const ClaimsStatsBar = ({ total, recovered, successRate }: ClaimsStatsBarProps) => (
  <div className="flex items-center gap-6 text-sm">
    <span>
      <span className="font-semibold text-foreground">{total}</span>{" "}
      <span className="text-muted-foreground">total</span>
    </span>
    <span className="w-px h-4 bg-border" />
    <span>
      <span className="font-semibold text-primary">${recovered.toLocaleString()}</span>{" "}
      <span className="text-muted-foreground">recovered</span>
    </span>
    <span className="w-px h-4 bg-border" />
    <span>
      <span className="font-semibold text-foreground">{successRate}%</span>{" "}
      <span className="text-muted-foreground">success</span>
    </span>
  </div>
);

export default ClaimsStatsBar;
