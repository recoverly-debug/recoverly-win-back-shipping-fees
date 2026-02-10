import { useState, useMemo } from "react";
import { Check, Pause, Filter, X } from "lucide-react";
import type { Case, CaseLane, CaseCarrier, CaseStatus, ConfidenceLabel } from "@/lib/case-data";
import { laneConfig, carrierConfig, statusConfig } from "@/lib/case-data";
import ActivityCard from "./ActivityCard";
import MoneyBadge from "./MoneyBadge";

interface ApprovalListProps {
  cases: Case[];
  onApprove?: (ids: string[]) => void;
  onHold?: (ids: string[]) => void;
  onUndo?: () => void;
}

const ApprovalList = ({ cases, onApprove, onHold }: ApprovalListProps) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterLane, setFilterLane] = useState<CaseLane | "ALL">("ALL");
  const [filterCarrier, setFilterCarrier] = useState<CaseCarrier | "ALL">("ALL");
  const [filterConfidence, setFilterConfidence] = useState<ConfidenceLabel | "ALL">("ALL");
  const [filterStatus, setFilterStatus] = useState<CaseStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (filterLane !== "ALL" && c.lane !== filterLane) return false;
      if (filterCarrier !== "ALL" && c.carrier !== filterCarrier) return false;
      if (filterConfidence !== "ALL" && c.confidence_label !== filterConfidence) return false;
      if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
      return true;
    });
  }, [cases, filterLane, filterCarrier, filterConfidence, filterStatus]);

  const selectedTotal = useMemo(() => {
    return filtered.filter((c) => selected.has(c.id)).reduce((sum, c) => sum + c.amount, 0);
  }, [filtered, selected]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((c) => c.id)));
    }
  };

  const activeFilters = [filterLane, filterCarrier, filterConfidence, filterStatus].filter((f) => f !== "ALL").length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
          >
            {selected.size === filtered.length && filtered.length > 0 ? "Deselect All" : "Select All"}
          </button>
          <span className="text-sm text-muted-foreground">{filtered.length} cases</span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
            activeFilters > 0 ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters{activeFilters > 0 && ` (${activeFilters})`}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-surface rounded-xl border border-border animate-fade-in">
          <div>
            <label className="label-caps mb-1.5 block">Lane</label>
            <select value={filterLane} onChange={(e) => setFilterLane(e.target.value as CaseLane | "ALL")} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="ALL">All</option>
              {(Object.keys(laneConfig) as CaseLane[]).map((l) => <option key={l} value={l}>{laneConfig[l].label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-caps mb-1.5 block">Carrier</label>
            <select value={filterCarrier} onChange={(e) => setFilterCarrier(e.target.value as CaseCarrier | "ALL")} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="ALL">All</option>
              {(Object.keys(carrierConfig) as CaseCarrier[]).map((c) => <option key={c} value={c}>{carrierConfig[c].label}</option>)}
            </select>
          </div>
          <div>
            <label className="label-caps mb-1.5 block">Confidence</label>
            <select value={filterConfidence} onChange={(e) => setFilterConfidence(e.target.value as ConfidenceLabel | "ALL")} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="ALL">All</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div>
            <label className="label-caps mb-1.5 block">Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as CaseStatus | "ALL")} className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="ALL">All</option>
              {(Object.keys(statusConfig) as CaseStatus[]).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Case List */}
      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="flex items-start gap-3">
            <button
              onClick={() => toggleSelect(c.id)}
              className={`mt-4 h-5 w-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                selected.has(c.id) ? "bg-primary border-primary" : "border-border hover:border-muted-foreground"
              }`}
            >
              {selected.has(c.id) && <Check className="h-3 w-3 text-primary-foreground" />}
            </button>
            <div className="flex-1 min-w-0">
              <ActivityCard caseData={c} />
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Action Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border p-4 animate-slide-up">
          <div className="container max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <MoneyBadge amount={selectedTotal} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onHold?.([...selected])}
                className="px-4 py-2 rounded-lg border border-amber text-amber text-sm font-medium hover:bg-amber/10 transition-colors flex items-center gap-1.5"
              >
                <Pause className="h-4 w-4" /> Hold
              </button>
              <button
                onClick={() => onApprove?.([...selected])}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors glow-hover flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalList;
