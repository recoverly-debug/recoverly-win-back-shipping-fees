import { useState, useCallback } from "react";
import AppNav from "@/components/navigation/AppNav";
import ApprovalList from "@/components/core/ApprovalList";
import UndoToast from "@/components/core/UndoToast";
import { allCases } from "@/lib/case-data";
import type { Case } from "@/lib/case-data";

const ApprovalQueue = () => {
  const [cases, setCases] = useState<Case[]>(allCases);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);

  const handleApprove = useCallback((ids: string[]) => {
    const original = [...cases];
    setCases((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, status: "SUBMITTED" as const } : c)));
    const total = cases.filter((c) => ids.includes(c.id)).reduce((sum, c) => sum + c.amount, 0);
    setUndoAction({
      message: `${ids.length} case${ids.length > 1 ? "s" : ""} approved ($${total.toFixed(2)}).`,
      undo: () => setCases(original),
    });
  }, [cases]);

  const handleHold = useCallback((ids: string[]) => {
    setUndoAction({
      message: `${ids.length} case${ids.length > 1 ? "s" : ""} placed on hold.`,
      undo: () => {},
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container px-4 py-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Approval Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve cases for filing.</p>
        </div>
        <ApprovalList cases={cases} onApprove={handleApprove} onHold={handleHold} />
      </main>
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

export default ApprovalQueue;
