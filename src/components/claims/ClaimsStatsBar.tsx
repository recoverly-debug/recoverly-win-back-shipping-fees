interface ClaimsStatsBarProps {
  total: number;
  recovered: number;
  submitted: number;
  needsEvidence: number;
}

const ClaimsStatsBar = ({ total, recovered, submitted, needsEvidence }: ClaimsStatsBarProps) => (
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
      <span className="font-semibold text-foreground">{submitted}</span>{" "}
      <span className="text-muted-foreground">submitted</span>
    </span>
    <span className="w-px h-4 bg-border" />
    <span>
      <span className="font-semibold text-foreground">{needsEvidence}</span>{" "}
      <span className="text-muted-foreground">needs evidence</span>
    </span>
  </div>
);

export default ClaimsStatsBar;
