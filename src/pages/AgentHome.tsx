import { useState, useCallback, useMemo } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import AppNav from "@/components/navigation/AppNav";
import StatusCard from "@/components/core/StatusCard";
import ActivityCard from "@/components/core/ActivityCard";
import UndoToast from "@/components/core/UndoToast";
import { allCases, formatMoney } from "@/lib/case-data";
import type { Case } from "@/lib/case-data";

const AgentHome = () => {
  const [cases, setCases] = useState<Case[]>(allCases);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalRecovery = useMemo(() => cases.filter((c) => ["APPROVED", "PAID"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);
  const pipelineTotal = useMemo(() => cases.filter((c) => !["PAID", "UNRECOVERABLE"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);
  const readyCases = useMemo(() => cases.filter((c) => ["FOUND", "READY"].includes(c.status)), [cases]);
  const needsAttention = useMemo(() => cases.filter((c) => ["NEEDS_EVIDENCE", "DENIED"].includes(c.status)), [cases]);
  const foundCases = useMemo(() => cases.filter((c) => c.status === "FOUND"), [cases]);
  const foundTotal = useMemo(() => foundCases.reduce((sum, c) => sum + c.amount, 0), [foundCases]);

  const handleApprove = useCallback((id: string) => {
    const original = [...cases];
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, status: "SUBMITTED" as const } : c)));
    setUndoAction({
      message: `Case ${id} approved and submitted.`,
      undo: () => setCases(original),
    });
  }, [cases]);

  const handleHold = useCallback((id: string) => {
    setUndoAction({
      message: `Case ${id} placed on hold.`,
      undo: () => {},
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Agent Greeting */}
        <div className="flex items-start gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-agent-blue/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-agent-blue" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              I found {foundCases.length} new issues worth {formatMoney(foundTotal)}.
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {readyCases.length} ready to file • {needsAttention.length} need attention
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatusCard label="Recovered" value={formatMoney(totalRecovery)} icon="money" glowColor="emerald" trend="+12% this month" />
          <StatusCard label="Pipeline" value={formatMoney(pipelineTotal)} subValue={`${cases.length} cases`} icon="trending" glowColor="blue" />
          <StatusCard label="Ready to File" value={readyCases.length} icon="check" glowColor="emerald" />
          <StatusCard label="Needs Attention" value={needsAttention.length} icon="alert" glowColor="amber" />
        </div>

        {/* Pull to refresh */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Activity</h2>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          {cases.map((c) => (
            <ActivityCard
              key={c.id}
              caseData={c}
              onApprove={handleApprove}
              onHold={handleHold}
            />
          ))}
        </div>
      </main>

      {/* Undo Toast */}
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

export default AgentHome;
