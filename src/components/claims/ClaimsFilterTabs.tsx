import type { ClaimStatus } from "@/lib/claims-data";

const tabs: { label: string; value: ClaimStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Detected", value: "detected" },
  { label: "Submitted", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Denied", value: "denied" },
];

interface ClaimsFilterTabsProps {
  active: ClaimStatus | "all";
  onChange: (value: ClaimStatus | "all") => void;
}

const ClaimsFilterTabs = ({ active, onChange }: ClaimsFilterTabsProps) => (
  <div className="flex gap-2 flex-wrap">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active === tab.value
            ? "bg-primary text-primary-foreground"
            : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default ClaimsFilterTabs;
