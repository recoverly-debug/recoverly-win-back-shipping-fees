import { useState, useCallback, useMemo } from "react";
import { Sparkles, RefreshCw, Radio, Clock, Check, Eye, FileText, Mail, Upload, AlertTriangle, ChevronRight, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppNav from "@/components/navigation/AppNav";
import StatusCard from "@/components/core/StatusCard";
import ActivityCard from "@/components/core/ActivityCard";
import MoneyBadge from "@/components/core/MoneyBadge";
import ReceiptStrip from "@/components/core/ReceiptStrip";
import PacketViewer from "@/components/core/PacketViewer";
import UndoToast from "@/components/core/UndoToast";
import { allCases, formatMoney, statusConfig } from "@/lib/case-data";
import type { Case, CaseStatus, EvidenceType } from "@/lib/case-data";

const expectedEvidence: Record<string, EvidenceType[]> = {
  OVERCHARGE: ["SHIPSTATION_LABEL", "SHIPSTATION_SHIPMENT", "CARRIER_INVOICE_LINE", "ADJUSTMENT_LINE"],
  LATE_DELIVERY: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PROMISED_DELIVERY_SOURCE", "SHIPSTATION_LABEL"],
  LOST: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "SHIPSTATION_LABEL"],
  DAMAGE: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PHOTOS", "SHIPSTATION_LABEL"],
};

type TriggerItem = { icon: typeof Clock; text: string; time: string };

const recentTriggers: TriggerItem[] = [
  { icon: Radio, text: "Tracking update: Delivered scan received (FedEx)", time: "12m ago" },
  { icon: FileText, text: "Billing update: Carrier adjustment posted ($42.50)", time: "1h ago" },
  { icon: Mail, text: "Invoice received via email forwarding (UPS)", time: "3h ago" },
];

function formatDeadlineShort(deadline: string): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffMs < 0) return "Passed";
  if (diffHours <= 48) return `${diffHours}h left`;
  return `${diffDays} days left`;
}

function getDeadlineUrgency(deadline: string): "urgent" | "moderate" | "comfortable" | "passed" {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffMs < 0) return "passed";
  if (diffDays <= 2) return "urgent";
  if (diffDays <= 7) return "moderate";
  return "comfortable";
}

type PlanItem = {
  type: "approve" | "evidence" | "invoice" | "urgent";
  caseData: Case;
  title: string;
  subtitle: string;
  primaryAction: string;
  urgencyLabel: string;
};

function buildPlanItems(cases: Case[]): PlanItem[] {
  const items: PlanItem[] = [];

  // A) Approve & submit — READY cases with HIGH confidence
  const readyHigh = cases.filter(c => c.status === "READY" && c.confidence_label === "HIGH");
  if (readyHigh.length > 0) {
    items.push({
      type: "approve",
      caseData: readyHigh[0],
      title: `Approve & submit ${readyHigh.length} case${readyHigh.length > 1 ? "s" : ""}`,
      subtitle: `${formatMoney(readyHigh.reduce((s, c) => s + c.amount, 0))} ready with high confidence`,
      primaryAction: "Approve & Submit",
      urgencyLabel: formatDeadlineShort(readyHigh.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0].deadline),
    });
  }

  // B) Request evidence — NEEDS_EVIDENCE cases
  const needsEvidence = cases.filter(c => c.status === "NEEDS_EVIDENCE");
  needsEvidence.forEach(c => {
    items.push({
      type: "evidence",
      caseData: c,
      title: "Request evidence from customer",
      subtitle: `${c.shopify_order.order_number} — ${c.shopify_order.customer_name}`,
      primaryAction: "Request Photos",
      urgencyLabel: formatDeadlineShort(c.deadline),
    });
  });

  // C) Invoice missing on overcharge
  const overchargeNoInvoice = cases.filter(c =>
    c.lane === "OVERCHARGE" &&
    c.status === "FOUND" &&
    !c.evidence.some(e => e.type === "CARRIER_INVOICE_LINE")
  );
  overchargeNoInvoice.forEach(c => {
    items.push({
      type: "invoice",
      caseData: c,
      title: "Upload invoice to confirm",
      subtitle: `${c.shopify_order.order_number} — missing carrier invoice`,
      primaryAction: "Upload Invoice",
      urgencyLabel: formatDeadlineShort(c.deadline),
    });
  });

  // D) Urgent deadlines (found or ready, <=3 days)
  const urgentCases = cases.filter(c =>
    ["FOUND", "READY"].includes(c.status) &&
    getDeadlineUrgency(c.deadline) === "urgent" &&
    !items.some(i => i.caseData.id === c.id)
  );
  urgentCases.forEach(c => {
    items.push({
      type: "urgent",
      caseData: c,
      title: "Review urgent deadline",
      subtitle: `${c.id} — deadline approaching`,
      primaryAction: "Review Case",
      urgencyLabel: formatDeadlineShort(c.deadline),
    });
  });

  // Also add READY med-confidence or FOUND cases not yet covered
  const readyMed = cases.filter(c =>
    c.status === "READY" && c.confidence_label !== "HIGH" &&
    !items.some(i => i.caseData.id === c.id)
  );
  readyMed.forEach(c => {
    items.push({
      type: "approve",
      caseData: c,
      title: "Review & submit",
      subtitle: `${c.shopify_order.order_number} — ${c.confidence_label.toLowerCase()} confidence`,
      primaryAction: "Approve & Submit",
      urgencyLabel: formatDeadlineShort(c.deadline),
    });
  });

  return items.slice(0, 4);
}

// Guided approval flow step
type ApprovalStep = "preview" | "executing" | "done";

const AgentHome = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(allCases);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshPhase, setRefreshPhase] = useState<string | null>(null);
  const [invoiceFeedConnected, setInvoiceFeedConnected] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [filter, setFilter] = useState<"all" | CaseStatus | "actionable">("all");

  // Guided approval state
  const [guidedCase, setGuidedCase] = useState<Case | null>(null);
  const [approvalStep, setApprovalStep] = useState<ApprovalStep>("preview");

  // Packet viewer state
  const [packetCase, setPacketCase] = useState<Case | null>(null);

  const totalRecovery = useMemo(() => cases.filter(c => ["APPROVED", "PAID"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);
  const pipelineTotal = useMemo(() => cases.filter(c => !["PAID", "UNRECOVERABLE"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);
  const readyCases = useMemo(() => cases.filter(c => ["FOUND", "READY"].includes(c.status)), [cases]);
  const needsAttention = useMemo(() => cases.filter(c => ["NEEDS_EVIDENCE", "DENIED"].includes(c.status)), [cases]);
  const foundCases = useMemo(() => cases.filter(c => c.status === "FOUND"), [cases]);
  const foundTotal = useMemo(() => foundCases.reduce((sum, c) => sum + c.amount, 0), [foundCases]);

  const planItems = useMemo(() => buildPlanItems(cases), [cases]);

  const filteredCases = useMemo(() => {
    if (filter === "all") return cases;
    if (filter === "actionable") return cases.filter(c => ["FOUND", "READY", "NEEDS_EVIDENCE"].includes(c.status));
    return cases.filter(c => c.status === filter);
  }, [cases, filter]);

  const handleApprove = useCallback((id: string) => {
    const original = [...cases];
    setCases(prev => prev.map(c => (c.id === id ? { ...c, status: "SUBMITTED" as const } : c)));
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
    const phases = ["Processing new events…", "Updating cases…", "Re-ranking Today's plan…"];
    let idx = 0;
    setRefreshPhase(phases[0]);
    const interval = setInterval(() => {
      idx++;
      if (idx < phases.length) {
        setRefreshPhase(phases[idx]);
      } else {
        clearInterval(interval);
        setRefreshPhase(null);
        setIsRefreshing(false);
      }
    }, 600);
  }, []);

  // Guided approval flow
  const startGuidedApproval = (caseData: Case) => {
    setGuidedCase(caseData);
    setApprovalStep("preview");
  };

  const executeGuidedApproval = () => {
    if (!guidedCase) return;
    setApprovalStep("executing");
    setTimeout(() => {
      setApprovalStep("done");
      handleApprove(guidedCase.id);
      setTimeout(() => {
        setGuidedCase(null);
        setApprovalStep("preview");
      }, 2000);
    }, 2500);
  };

  const handlePlanAction = (item: PlanItem) => {
    if (item.type === "approve") {
      startGuidedApproval(item.caseData);
    } else if (item.type === "evidence") {
      navigate(`/case/${item.caseData.id}`);
    } else if (item.type === "invoice") {
      setShowInvoiceModal(true);
    } else if (item.type === "urgent") {
      navigate(`/case/${item.caseData.id}`);
    }
  };

  const planTypeIcons = {
    approve: Check,
    evidence: AlertTriangle,
    invoice: FileText,
    urgent: Clock,
  };

  const planTypeColors = {
    approve: "text-primary bg-primary/10",
    evidence: "text-amber bg-amber/10",
    invoice: "text-agent-blue bg-agent-blue/10",
    urgent: "text-destructive bg-destructive/10",
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Header: Ongoing Audit */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">Ongoing Audit</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Monitoring shipments and carrier charges in the background.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-primary pulse-emerald" />
              Monitoring: ON
            </span>
          </div>
        </div>

        {/* Sync info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last sync: 2m ago</span>
          <span>Updates since your last review: 17h ago</span>
          <button onClick={handleRefresh} className="ml-auto p-1.5 rounded-lg hover:bg-accent transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Refresh animation */}
        {refreshPhase && (
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-4 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              {refreshPhase}
            </div>
          </div>
        )}

        {/* Invoice Feed Status */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">Invoice feed:</span>
            {invoiceFeedConnected ? (
              <span className="text-primary text-xs">Connected — invoices@recoverly.ai</span>
            ) : (
              <span className="text-muted-foreground text-xs">Not connected</span>
            )}
          </div>
          {!invoiceFeedConnected ? (
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
            >
              Connect
            </button>
          ) : (
            <button onClick={() => setShowInvoiceModal(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Settings
            </button>
          )}
        </div>

        {/* Recent Triggers */}
        <div className="mb-6">
          <h3 className="label-caps mb-2">Recent triggers</h3>
          <div className="space-y-1.5">
            {recentTriggers.map((trigger, idx) => (
              <div key={idx} className="flex items-center gap-2.5 py-1.5 text-xs text-muted-foreground">
                <trigger.icon className="h-3.5 w-3.5 text-agent-blue shrink-0" />
                <span className="flex-1">{trigger.text}</span>
                <span className="text-muted-foreground/60">{trigger.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Plan */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Today's plan</h2>
            <span className="text-xs text-muted-foreground">{planItems.length} items</span>
          </div>
          <div className="space-y-3">
            {planItems.map((item, idx) => {
              const Icon = planTypeIcons[item.type];
              const colorClass = planTypeColors[item.type];
              const urgency = getDeadlineUrgency(item.caseData.deadline);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                        <MoneyBadge amount={item.caseData.amount} status={item.caseData.status} size="sm" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-medium ${
                          urgency === "urgent" ? "text-destructive" :
                          urgency === "moderate" ? "text-amber" :
                          urgency === "passed" ? "text-destructive" : "text-muted-foreground"
                        }`}>
                          {item.urgencyLabel}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item.caseData.confidence_label === "HIGH" ? "bg-primary/10 text-primary" :
                          item.caseData.confidence_label === "MEDIUM" ? "bg-amber/10 text-amber" :
                          "bg-destructive/10 text-destructive"
                        }`}>
                          {item.caseData.confidence_label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Condensed ReceiptStrip */}
                  <ReceiptStrip
                    caseData={item.caseData}
                    onViewPacket={() => setPacketCase(item.caseData)}
                    compact
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handlePlanAction(item)}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium glow-hover transition-all flex items-center justify-center gap-1.5"
                    >
                      <Icon className="h-3.5 w-3.5" /> {item.primaryAction}
                    </button>
                    <button
                      onClick={() => setPacketCase(item.caseData)}
                      className="py-2 px-3 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> View proof
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatusCard label="Recovered" value={formatMoney(totalRecovery)} icon="money" glowColor="emerald" />
          <StatusCard label="Pipeline" value={formatMoney(pipelineTotal)} subValue={`${cases.length} cases`} icon="trending" glowColor="blue" />
          <StatusCard label="Ready to File" value={readyCases.length} icon="check" glowColor="emerald" />
          <StatusCard label="Needs Attention" value={needsAttention.length} icon="alert" glowColor="amber" />
        </div>

        {/* All Cases */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">All cases</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {([
            { label: "All", value: "all" },
            { label: "Actionable", value: "actionable" },
            { label: "Found", value: "FOUND" },
            { label: "Ready", value: "READY" },
            { label: "Submitted", value: "SUBMITTED" },
            { label: "Paid", value: "PAID" },
          ] as { label: string; value: typeof filter }[]).map(f => (
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

        {/* Activity Feed */}
        <div className="space-y-3">
          {filteredCases.map(c => (
            <ActivityCard
              key={c.id}
              caseData={c}
              onApprove={handleApprove}
              onHold={handleHold}
            />
          ))}
        </div>
      </main>

      {/* Guided Approval Modal */}
      {guidedCase && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => { setGuidedCase(null); setApprovalStep("preview"); }} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            {approvalStep === "preview" && (
              <>
                <h2 className="text-lg font-bold text-foreground mb-1">Approve & Submit</h2>
                <p className="text-sm text-muted-foreground mb-4">Review before submitting via ShipStation claim flow.</p>

                <div className="p-4 rounded-xl border border-border bg-surface/40 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig[guidedCase.status].bgColor} ${statusConfig[guidedCase.status].color}`}>
                        {statusConfig[guidedCase.status].label}
                      </span>
                      <span className="text-sm font-medium text-foreground">{guidedCase.id}</span>
                    </div>
                    <MoneyBadge amount={guidedCase.amount} status={guidedCase.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{guidedCase.confidence_reason}</p>
                  <ReceiptStrip caseData={guidedCase} onViewPacket={() => setPacketCase(guidedCase)} compact />
                </div>

                <div className="p-3 rounded-lg bg-surface border border-border mb-4">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Submission:</span> ShipStation claim flow ✅
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={executeGuidedApproval}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="h-5 w-5" /> Confirm & Submit
                  </button>
                  <button
                    onClick={() => { setGuidedCase(null); setApprovalStep("preview"); }}
                    className="py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {approvalStep === "executing" && (
              <div className="py-4">
                <h2 className="text-lg font-bold text-foreground mb-4">Submitting claim…</h2>
                <ExecutionChecklist />
              </div>
            )}

            {approvalStep === "done" && (
              <div className="py-4 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1">Submitted via ShipStation claim flow ✅</h2>
                <p className="text-sm text-muted-foreground">Case {guidedCase.id} is now being tracked.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Packet Viewer Modal */}
      {packetCase && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setPacketCase(null)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Evidence Packet — {packetCase.id}</h2>
              <button onClick={() => setPacketCase(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">✕</button>
            </div>
            <PacketViewer
              evidence={packetCase.evidence}
              showMissing
              expectedTypes={expectedEvidence[packetCase.lane]}
              onRequestPhotos={() => navigate(`/case/${packetCase.id}`)}
              onUploadPdf={() => {}}
              onRefreshTracking={() => {}}
            />
          </div>
        </div>
      )}

      {/* Invoice Feed Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-lg p-6 animate-slide-up">
            <h2 className="text-lg font-bold text-foreground mb-1">Connect Invoice Feed</h2>
            <p className="text-sm text-muted-foreground mb-4">Auto-forward carrier invoices to enrich overcharge cases.</p>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 mb-4">
              <p className="text-sm font-medium text-foreground mb-2">Forward carrier invoice emails to:</p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border">
                <Mail className="h-4 w-4 text-primary" />
                <code className="text-sm font-mono text-primary">invoices@recoverly.ai</code>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">1</span>
                <span>Add a rule in your billing/AP inbox to auto-forward carrier invoices</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">2</span>
                <span>Include attachments (PDF/CSV if present)</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">3</span>
                <span>We'll ingest and match to shipments automatically</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setInvoiceFeedConnected(true); setShowInvoiceModal(false); }}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" /> Mark as Connected
              </button>
              <button onClick={() => setShowInvoiceModal(false)} className="py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <button className="w-full py-2 rounded-lg border border-border text-muted-foreground text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" /> Upload invoice manually instead
              </button>
            </div>
          </div>
        </div>
      )}

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

// Execution checklist sub-component
const ExecutionChecklist = () => {
  const [step, setStep] = useState(0);

  useState(() => {
    const steps = [0, 1, 2, 3];
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx <= steps.length) {
        setStep(idx);
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  });

  const items = [
    "Verifying tracking…",
    "Generating evidence packet…",
    "Preparing ShipStation submission…",
    "Submitted via ShipStation claim flow ✅",
  ];

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          {idx < step ? (
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
          ) : idx === step ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-surface border border-border" />
          )}
          <span className={`text-sm ${idx < step ? "text-foreground" : idx === step ? "text-primary" : "text-muted-foreground"}`}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AgentHome;
