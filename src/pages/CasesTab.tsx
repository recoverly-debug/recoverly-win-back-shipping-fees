import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/navigation/BottomNav";
import Logo from "@/components/Logo";
import ActivityCard from "@/components/core/ActivityCard";
import UndoToast from "@/components/core/UndoToast";
import { allCases } from "@/lib/case-data";
import type { Case, CaseStatus, CaseLane } from "@/lib/case-data";

type Filter = "all" | "actionable" | CaseStatus;

const filterOptions: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Actionable", value: "actionable" },
  { label: "Found", value: "FOUND" },
  { label: "Ready", value: "READY" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Paid", value: "PAID" },
];

const CasesTab = () => {
  const [cases, setCases] = useState<Case[]>(allCases);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);

  const filteredCases = useMemo(() => {
    let result = cases;
    if (filter === "actionable") {
      result = result.filter(c => ["FOUND", "READY", "NEEDS_EVIDENCE"].includes(c.status));
    } else if (filter !== "all") {
      result = result.filter(c => c.status === filter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.tracking_number.toLowerCase().includes(q) ||
        c.shopify_order.order_number.toLowerCase().includes(q) ||
        c.shopify_order.customer_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cases, filter, search]);

  const handleApprove = useCallback((id: string) => {
    const original = [...cases];
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: "SUBMITTED" as const } : c));
    setUndoAction({
      message: `Case ${id} submitted.`,
      undo: () => setCases(original),
    });
  }, [cases]);

  const handleHold = useCallback((id: string) => {
    setUndoAction({ message: `Case ${id} placed on hold.`, undo: () => {} });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container px-4 h-14 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container px-4 py-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-foreground mb-3">Cases</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking, order, or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-9 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Case List */}
        <div className="space-y-2">
          {filteredCases.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No cases match your filters.</div>
          ) : (
            filteredCases.map(c => (
              <ActivityCard key={c.id} caseData={c} onApprove={handleApprove} onHold={handleHold} />
            ))
          )}
        </div>
      </main>

      <BottomNav />

      {undoAction && (
        <UndoToast
          message={undoAction.message}
          onUndo={() => { undoAction.undo(); setUndoAction(null); }}
          onDismiss={() => setUndoAction(null)}
        />
      )}
    </div>
  );
};

export default CasesTab;
