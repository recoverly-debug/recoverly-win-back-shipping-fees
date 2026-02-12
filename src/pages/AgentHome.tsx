import { useState, useCallback, useMemo, useEffect } from "react";
import { Sparkles, RefreshCw, Radio, Clock, Check, Eye, FileText, Mail, Upload, AlertTriangle, ChevronDown, ChevronUp, Loader2, Shield, Camera, ImagePlus, ArrowRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import Logo from "@/components/Logo";
import MoneyBadge from "@/components/core/MoneyBadge";
import ReceiptStrip from "@/components/core/ReceiptStrip";
import PacketViewer from "@/components/core/PacketViewer";
import UndoToast from "@/components/core/UndoToast";
import RequestPhotosModal from "@/components/core/RequestPhotosModal";
import ActivityCard from "@/components/core/ActivityCard";
import { allCases, formatMoney, statusConfig } from "@/lib/case-data";
import type { Case, CaseStatus, EvidenceType } from "@/lib/case-data";
import { toast } from "@/hooks/use-toast";

const expectedEvidence: Record<string, EvidenceType[]> = {
  OVERCHARGE: ["SHIPSTATION_LABEL", "SHIPSTATION_SHIPMENT", "CARRIER_INVOICE_LINE", "ADJUSTMENT_LINE"],
  LATE_DELIVERY: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PROMISED_DELIVERY_SOURCE", "SHIPSTATION_LABEL"],
  LOST: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "SHIPSTATION_LABEL"],
  DAMAGE: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PHOTOS", "SHIPSTATION_LABEL"],
};

type TriggerItem = { icon: typeof Clock; text: string; time: string; requiresInvoiceFeed?: boolean };

const recentTriggers: TriggerItem[] = [
  { icon: Radio, text: "Tracking update: Delivered scan received (FedEx)", time: "12m ago" },
  { icon: FileText, text: "Billing update: Carrier adjustment posted ($42.50)", time: "1h ago" },
  { icon: Mail, text: "Invoice received via email forwarding (UPS)", time: "3h ago", requiresInvoiceFeed: true },
];

function formatDeadlineShort(deadline: string): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffMs < 0) return "Passed";
  if (diffHours <= 48) return `Due in ${diffHours}h`;
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

// Agent reasoning per lane
function getAgentReasoning(c: Case): string {
  switch (c.lane) {
    case "OVERCHARGE": {
      const ship = c.shipstation_shipment;
      if (ship.billed_dimensions && ship.dimensions) {
        return `Detected DIM overcharge — label ${ship.dimensions.l}×${ship.dimensions.w}×${ship.dimensions.h}, carrier billed ${ship.billed_dimensions.l}×${ship.billed_dimensions.w}×${ship.billed_dimensions.h}.`;
      }
      return `Detected billing discrepancy — carrier charge exceeds expected rate.`;
    }
    case "LATE_DELIVERY": {
      const tracking = c.evidence.find(e => e.type === "TRACKING_EVENTS");
      if (tracking) {
        const match = tracking.summary.match(/Promised:\s*([^.]+)\.\s*(?:Actual delivery:|Delivered:)\s*([^.]+)/);
        if (match) return `Eligible refund — promised ${match[1].trim()}, delivered ${match[2].trim()}.`;
      }
      return `Eligible refund — delivered after guaranteed date.`;
    }
    case "DAMAGE":
      if (c.status === "NEEDS_EVIDENCE") return `Blocked — missing customer photos (item + packaging).`;
      return `Damage claim ready — customer photos and shipment data present.`;
    case "LOST": {
      const tracking = c.evidence.find(e => e.type === "TRACKING_EVENTS");
      if (tracking && tracking.summary.includes("No updates")) return `Stalled tracking — no scans in 14+ days.`;
      return `Package lost in transit — no delivery confirmation.`;
    }
    default:
      return "";
  }
}

type PlanItem = {
  type: "approve" | "evidence" | "invoice";
  cases: Case[];
  title: string;
  subtitle: string;
  primaryAction: string;
  urgencyLabel: string;
  totalAmount: number;
  reasoning: string;
};

function buildPlanItems(cases: Case[]): PlanItem[] {
  const items: PlanItem[] = [];

  const readyHigh = cases.filter(c => c.status === "READY" && c.confidence_label === "HIGH");
  const foundHigh = cases.filter(c => c.status === "FOUND" && c.confidence_label === "HIGH");
  const approvable = [...readyHigh, ...foundHigh];
  if (approvable.length > 0) {
    const total = approvable.reduce((s, c) => s + c.amount, 0);
    const earliest = approvable.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
    items.push({
      type: "approve",
      cases: approvable,
      title: approvable.length === 1
        ? `Approve & submit 1 claim`
        : `Approve & submit ${approvable.length} claims`,
      subtitle: `${formatMoney(total)} ready with high confidence`,
      primaryAction: approvable.length > 1 ? "Approve & Submit All" : "Approve & Submit",
      urgencyLabel: formatDeadlineShort(earliest.deadline),
      totalAmount: total,
      reasoning: getAgentReasoning(earliest),
    });
  }

  const needsEvidence = cases.filter(c => c.status === "NEEDS_EVIDENCE");
  needsEvidence.forEach(c => {
    items.push({
      type: "evidence",
      cases: [c],
      title: "Request evidence from customer",
      subtitle: `${c.shopify_order.order_number} — ${c.shopify_order.customer_name}`,
      primaryAction: "Send Request",
      urgencyLabel: formatDeadlineShort(c.deadline),
      totalAmount: c.amount,
      reasoning: getAgentReasoning(c),
    });
  });

  const overchargeNoInvoice = cases.filter(c =>
    c.lane === "OVERCHARGE" &&
    c.status === "FOUND" &&
    c.confidence_label !== "HIGH" &&
    !c.evidence.some(e => e.type === "CARRIER_INVOICE_LINE")
  );
  if (overchargeNoInvoice.length > 0) {
    items.push({
      type: "invoice",
      cases: overchargeNoInvoice,
      title: `Upload invoice to confirm ${overchargeNoInvoice.length} ${overchargeNoInvoice.length === 1 ? "case" : "cases"}`,
      subtitle: "Missing carrier invoice — optional enrichment",
      primaryAction: "Upload Invoice",
      urgencyLabel: formatDeadlineShort(overchargeNoInvoice[0].deadline),
      totalAmount: overchargeNoInvoice.reduce((s, c) => s + c.amount, 0),
      reasoning: getAgentReasoning(overchargeNoInvoice[0]),
    });
  }

  return items.slice(0, 3);
}

type FlowStep = "idle" | "review" | "executing" | "sending_request" | "step_done" | "all_done";

type StepResult = {
  type: "approve" | "evidence" | "invoice";
  submittedCount: number;
  evidenceRequested: boolean;
  photosReceived: boolean;
  invoiceUploaded: boolean;
};

const AgentHome = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>(allCases);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshPhase, setRefreshPhase] = useState<string | null>(null);
  const [triggersExpanded, setTriggersExpanded] = useState(false);
  const [invoiceFeedConnected, setInvoiceFeedConnected] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAllCases, setShowAllCases] = useState(false);

  // Guided flow state
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [flowPlanItems, setFlowPlanItems] = useState<PlanItem[]>([]);
  const [flowCurrentIdx, setFlowCurrentIdx] = useState(0);
  const [batchExpanded, setBatchExpanded] = useState(false);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);

  // Evidence preview message state
  const [evidenceMessage, setEvidenceMessage] = useState("");

  // Photo request state
  const [photosModalCase, setPhotosModalCase] = useState<Case | null>(null);

  // Packet viewer state
  const [packetCase, setPacketCase] = useState<Case | null>(null);

  // Computed metrics
  const pipelineTotal = useMemo(() => cases.filter(c => !["PAID", "UNRECOVERABLE"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);
  const needsAttentionCount = useMemo(() => cases.filter(c => ["NEEDS_EVIDENCE", "DENIED"].includes(c.status)).length, [cases]);
  const recoveredTotal = useMemo(() => cases.filter(c => ["APPROVED", "PAID"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0), [cases]);

  const planItems = useMemo(() => buildPlanItems(cases), [cases]);
  const updateCount = useMemo(() => {
    return recentTriggers.filter(t => !t.requiresInvoiceFeed || invoiceFeedConnected).length;
  }, [invoiceFeedConnected]);

  const visibleTriggers = useMemo(() =>
    recentTriggers.filter(t => !t.requiresInvoiceFeed || invoiceFeedConnected),
    [invoiceFeedConnected]
  );

  const handleApprove = useCallback((ids: string[]) => {
    const original = [...cases];
    setCases(prev => prev.map(c => ids.includes(c.id) ? { ...c, status: "SUBMITTED" as const } : c));
    setUndoAction({
      message: `${ids.length} ${ids.length === 1 ? "case" : "cases"} submitted.`,
      undo: () => setCases(original),
    });
  }, [cases]);

  const handleHold = useCallback((id: string) => {
    setUndoAction({ message: `Case ${id} placed on hold.`, undo: () => {} });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    const phases = ["Processing new events…", "Updating cases…", "Re-ranking today's plan…"];
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

  // Initialize evidence message when entering evidence step
  const initEvidenceMessage = useCallback((c: Case) => {
    setEvidenceMessage(
      `Hi ${c.shopify_order.customer_name} — we're sorry your order arrived damaged. To help us recover shipping costs, could you upload:\n\n• 3–5 photos of the item damage\n• 2 photos of the packaging and label\n\nUpload here: recoverly.link/upload/${c.id}\n\nOrder: ${c.shopify_order.order_number}\nTracking: ${c.tracking_number}\n\nThank you!`
    );
  }, []);

  // "Run today's plan" guided flow
  const startPlanFlow = () => {
    setFlowPlanItems(planItems);
    setFlowCurrentIdx(0);
    setFlowStep("review");
    setBatchExpanded(false);
    setStepResults([]);
    // If first step is evidence, init the message
    if (planItems[0]?.type === "evidence") {
      initEvidenceMessage(planItems[0].cases[0]);
    }
  };

  const executeCurrentItem = () => {
    const item = flowPlanItems[flowCurrentIdx];
    if (!item) return;

    if (item.type === "approve") {
      setFlowStep("executing");
      setTimeout(() => {
        handleApprove(item.cases.map(c => c.id));
        setStepResults(prev => [...prev, {
          type: "approve",
          submittedCount: item.cases.length,
          evidenceRequested: false,
          photosReceived: false,
          invoiceUploaded: false,
        }]);
        if (flowCurrentIdx < flowPlanItems.length - 1) {
          setFlowStep("step_done");
        } else {
          setFlowStep("all_done");
        }
      }, 2500);
    } else if (item.type === "invoice") {
      setShowInvoiceModal(true);
    }
  };

  const handleSendEvidenceRequest = (caseData: Case) => {
    setFlowStep("sending_request");
    // After sending animation completes, record result and advance
    setTimeout(() => {
      setStepResults(prev => [...prev, {
        type: "evidence",
        submittedCount: 0,
        evidenceRequested: true,
        photosReceived: false,
        invoiceUploaded: false,
      }]);
      setCases(prev => prev.map(c => {
        if (c.id !== caseData.id) return c;
        return {
          ...c,
          timeline: [
            ...c.timeline,
            { ts: new Date().toISOString(), event: "Customer evidence requested", note: "Photo request sent to customer.", actor: "AGENT" as const },
          ],
        };
      }));
      toast({ title: "Evidence request sent", description: `Photo request sent to ${caseData.shopify_order.customer_name}.` });
      if (flowCurrentIdx < flowPlanItems.length - 1) {
        setFlowStep("step_done");
      } else {
        setFlowStep("all_done");
      }
    }, 1800);
  };

  const handleMarkPhotosReceivedInFlow = (caseData: Case) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseData.id) return c;
      return {
        ...c,
        status: "READY" as const,
        confidence_label: "MEDIUM" as const,
        confidence_reason: "Medium — 4 of 4 core evidence items present. Customer photos received.",
        evidence: [
          ...c.evidence,
          { type: "PHOTOS" as const, source: "UPLOAD" as const, file_ref: "customer-photos.zip", summary: "5 photos: damaged item (3), packaging condition (2)." },
        ],
        timeline: [
          ...c.timeline,
          { ts: new Date().toISOString(), event: "Evidence received", note: "Customer provided 5 damage photos.", actor: "USER" as const },
          { ts: new Date().toISOString(), event: "Case ready", note: "All evidence now present. Ready for submission.", actor: "AGENT" as const },
        ],
      };
    }));
    toast({ title: "Photos received", description: "Case updated to Ready." });
    setStepResults(prev => [...prev, {
      type: "evidence",
      submittedCount: 0,
      evidenceRequested: false,
      photosReceived: true,
      invoiceUploaded: false,
    }]);
    if (flowCurrentIdx < flowPlanItems.length - 1) {
      setFlowStep("step_done");
    } else {
      setFlowStep("all_done");
    }
  };

  const handleMarkPhotosReceived = (caseData: Case) => {
    setCases(prev => prev.map(c => {
      if (c.id !== caseData.id) return c;
      return {
        ...c,
        status: "READY" as const,
        confidence_label: "MEDIUM" as const,
        confidence_reason: "Medium — 4 of 4 core evidence items present. Customer photos received.",
        evidence: [
          ...c.evidence,
          { type: "PHOTOS" as const, source: "UPLOAD" as const, file_ref: "customer-photos.zip", summary: "5 photos: damaged item (3), packaging condition (2)." },
        ],
        timeline: [
          ...c.timeline,
          { ts: new Date().toISOString(), event: "Evidence received", note: "Customer provided 5 damage photos.", actor: "USER" as const },
          { ts: new Date().toISOString(), event: "Case ready", note: "All evidence now present. Ready for submission.", actor: "AGENT" as const },
        ],
      };
    }));
    toast({ title: "Photos received", description: "Case updated to Ready." });
  };

  const advanceToNextStep = () => {
    if (flowCurrentIdx < flowPlanItems.length - 1) {
      const nextIdx = flowCurrentIdx + 1;
      setFlowCurrentIdx(nextIdx);
      setFlowStep("review");
      setBatchExpanded(false);
      // Init evidence message if next step is evidence
      if (flowPlanItems[nextIdx]?.type === "evidence") {
        initEvidenceMessage(flowPlanItems[nextIdx].cases[0]);
      }
    } else {
      setFlowStep("all_done");
    }
  };

  const closeFlow = () => {
    setFlowStep("idle");
    setFlowPlanItems([]);
    setFlowCurrentIdx(0);
    setStepResults([]);
  };

  const planTypeIcons = { approve: Check, evidence: Camera, invoice: FileText };
  const planTypeColors = { approve: "text-primary bg-primary/10", evidence: "text-warning bg-warning/10", invoice: "text-info bg-info/10" };

  // Flow summary computed from stepResults
  const flowSummary = useMemo(() => {
    const submitted = stepResults.reduce((s, r) => s + r.submittedCount, 0);
    const evidenceRequested = stepResults.some(r => r.evidenceRequested);
    const photosReceived = stepResults.some(r => r.photosReceived);
    const invoiceUploaded = stepResults.some(r => r.invoiceUploaded);

    const parts: string[] = [];
    if (submitted > 0) parts.push(`${submitted} submitted`);
    if (evidenceRequested) parts.push("1 evidence request sent");
    if (photosReceived) parts.push("1 case moved to Ready");
    if (invoiceUploaded) parts.push("1 invoice uploaded");
    const remainingEvidence = cases.filter(c => c.status === "NEEDS_EVIDENCE").length;
    if (remainingEvidence > 0 && !evidenceRequested && !photosReceived) {
      parts.push(`${remainingEvidence} waiting on customer photos`);
    }
    return parts.join(", ") || "No actions taken";
  }, [stepResults, cases]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container px-4 h-14 flex items-center justify-between">
          <Logo />
          <button onClick={handleRefresh} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="container px-4 py-5 max-w-lg mx-auto">
        {/* Zone A — Minimal header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-foreground">Ongoing Audit</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-emerald" />
              ON
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Monitoring: ON · Last sync: 2m ago</p>

          {/* Collapsible triggers */}
          <button
            onClick={() => setTriggersExpanded(!triggersExpanded)}
            className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
          >
            {updateCount} {updateCount === 1 ? "update" : "updates"} since your last review
            {triggersExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {triggersExpanded && (
            <div className="mt-2 space-y-1 animate-fade-in">
              {visibleTriggers.map((trigger, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                  <trigger.icon className="h-3 w-3 text-info shrink-0" />
                  <span className="flex-1">{trigger.text}</span>
                  <span className="text-muted-foreground/50">{trigger.time}</span>
                </div>
              ))}
            </div>
          )}
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

        {/* Zone B — Primary CTA + Today's Plan */}
        <div className="mb-5">
          {/* Plan items first, CTA at bottom for thumb-zone */}

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Today's plan</h2>
            <span className="text-xs text-muted-foreground">{planItems.length} {planItems.length === 1 ? "item" : "items"}</span>
          </div>

          <div className="space-y-2">
            {planItems.map((item, idx) => {
              const Icon = planTypeIcons[item.type];
              const colorClass = planTypeColors[item.type];
              const urgency = getDeadlineUrgency(item.cases[0].deadline);
              return (
                <div key={idx} className="p-3 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                        <MoneyBadge amount={item.totalAmount} status={item.cases[0].status} size="sm" />
                      </div>
                      {/* Agent reasoning line */}
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.reasoning}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          {urgency === "urgent" && <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />}
                          {urgency === "moderate" && <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />}
                          {item.urgencyLabel}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          item.cases[0].confidence_label === "HIGH" ? "bg-primary/10 text-primary" :
                          item.cases[0].confidence_label === "MEDIUM" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                        }`}>{item.cases[0].confidence_label}</span>
                        <button
                          onClick={() => setPacketCase(item.cases[0])}
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5 ml-auto"
                        >
                          <Eye className="h-3 w-3" /> View proof
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Primary CTA — in thumb-zone (lower half) */}
          {planItems.length > 0 && (
            <button
              onClick={startPlanFlow}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold glow-hover transition-all flex items-center justify-center gap-2 mt-4 text-sm min-h-[44px]"
            >
              <Sparkles className="h-4 w-4" /> Run today's plan
            </button>
          )}
        </div>

        {/* Compact metrics row */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 px-1">
          <span>Pipeline <span className="text-foreground font-semibold">{formatMoney(pipelineTotal)}</span></span>
          <span className="text-border">·</span>
          <span>Needs attention <span className="text-foreground font-semibold">{needsAttentionCount}</span></span>
          <span className="text-border">·</span>
          <span>Recovered <span className="text-primary font-semibold">{formatMoney(recoveredTotal)}</span></span>
        </div>

        {/* Invoice Feed Status */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card mb-5">
          <div className="flex items-center gap-2 text-xs">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Invoice feed:</span>
            {invoiceFeedConnected ? (
              <span className="text-primary">Connected</span>
            ) : (
              <span className="text-muted-foreground">Not connected</span>
            )}
          </div>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-2.5 py-1 rounded-lg border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
          >
            {invoiceFeedConnected ? "Settings" : "Connect"}
          </button>
        </div>

        {/* Zone C — All cases (collapsed by default) */}
        <button
          onClick={() => setShowAllCases(!showAllCases)}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1.5 mb-4"
        >
          {showAllCases ? "Hide all cases" : `View all ${cases.length} cases`}
          {showAllCases ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showAllCases && (
          <div className="space-y-2 animate-fade-in">
            {cases.map(c => (
              <ActivityCard key={c.id} caseData={c} onApprove={(id) => handleApprove([id])} onHold={handleHold} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      {/* ===== GUIDED FLOW MODAL ===== */}
      {flowStep !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={closeFlow} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              {/* Flow: Review step */}
              {flowStep === "review" && flowPlanItems[flowCurrentIdx] && (() => {
                const item = flowPlanItems[flowCurrentIdx];
                const Icon = planTypeIcons[item.type];
                const isBatch = item.type === "approve" && item.cases.length >= 3;

                return (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Step {flowCurrentIdx + 1} of {flowPlanItems.length}</span>
                      <button onClick={closeFlow} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
                    </div>

                    {item.type === "approve" && (
                      <>
                        <h2 className="text-lg font-bold text-foreground mb-1">{item.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{item.subtitle}</p>
                      </>
                    )}

                    {item.type === "evidence" && (
                      <>
                        <h2 className="text-lg font-bold text-foreground mb-1">
                          Request evidence from customer
                        </h2>
                        <p className="text-sm text-muted-foreground mb-4">{item.subtitle}</p>
                      </>
                    )}

                    {item.type === "invoice" && (
                      <>
                        <h2 className="text-lg font-bold text-foreground mb-1">{item.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{item.subtitle}</p>
                      </>
                    )}

                    {/* Approve flow */}
                    {item.type === "approve" && (
                      <>
                        {isBatch ? (
                          <div className="rounded-xl border border-border bg-surface/40 mb-4">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-foreground">
                                  Approve {item.cases.length} claims — {formatMoney(item.totalAmount)} total
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">All high confidence; packets ready</p>
                              <button
                                onClick={() => setBatchExpanded(!batchExpanded)}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                {batchExpanded ? "Collapse" : "Expand to review"}
                                {batchExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                            {batchExpanded && (
                              <div className="border-t border-border p-3 space-y-3 animate-fade-in">
                                {item.cases.map(c => (
                                  <div key={c.id} className="p-3 rounded-lg border border-border bg-card">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig[c.status].bgColor} ${statusConfig[c.status].color}`}>
                                          {statusConfig[c.status].label}
                                        </span>
                                        <span className="text-xs font-medium text-foreground">{c.id}</span>
                                      </div>
                                      <MoneyBadge amount={c.amount} status={c.status} size="sm" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{c.confidence_reason}</p>
                                    <ReceiptStrip caseData={c} onViewPacket={() => setPacketCase(c)} compact />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3 mb-4">
                            {item.cases.map(c => (
                              <div key={c.id} className="p-3 rounded-xl border border-border bg-surface/40">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusConfig[c.status].bgColor} ${statusConfig[c.status].color}`}>
                                      {statusConfig[c.status].label}
                                    </span>
                                    <span className="text-xs font-medium text-foreground">{c.id}</span>
                                  </div>
                                  <MoneyBadge amount={c.amount} status={c.status} size="sm" />
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{c.confidence_reason}</p>
                                <ReceiptStrip caseData={c} onViewPacket={() => setPacketCase(c)} compact />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg bg-surface border border-border mb-4">
                          <p className="text-xs text-muted-foreground">
                            <span className="text-foreground font-medium">Submission:</span> ShipStation claim flow ✅
                          </p>
                        </div>
                      </>
                    )}

                    {/* Evidence flow — Preview message */}
                    {item.type === "evidence" && (
                      <>
                        <div className="p-3 rounded-xl border border-border bg-surface/40 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">{item.cases[0].id}</span>
                              <MoneyBadge amount={item.totalAmount} status={item.cases[0].status} size="sm" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.cases[0].confidence_reason}</p>
                        </div>

                        <div className="mb-3">
                          <label className="label-caps mb-1.5 block">Preview message</label>
                          <textarea
                            value={evidenceMessage}
                            onChange={(e) => setEvidenceMessage(e.target.value)}
                            rows={10}
                            className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono leading-relaxed"
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <button
                            onClick={() => handleMarkPhotosReceivedInFlow(item.cases[0])}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-accent transition-colors"
                          >
                            <ImagePlus className="h-3.5 w-3.5" /> Mark Photos Received (Mock)
                          </button>
                        </div>
                      </>
                    )}

                    {/* Invoice flow */}
                    {item.type === "invoice" && (
                      <div className="p-4 rounded-xl border border-info/20 bg-info/5 mb-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-info mt-0.5" />
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">Carrier invoice enriches this case</h3>
                            <p className="text-xs text-muted-foreground">
                              Upload or connect invoice feed to increase confidence from Medium → High.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.type === "evidence") {
                            handleSendEvidenceRequest(item.cases[0]);
                          } else {
                            executeCurrentItem();
                          }
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium glow-hover transition-all flex items-center justify-center gap-1.5"
                      >
                        {item.type === "evidence" ? (
                          <><Send className="h-4 w-4" /> {item.primaryAction}</>
                        ) : (
                          <><Icon className="h-4 w-4" /> {item.primaryAction}</>
                        )}
                      </button>
                      <button
                        onClick={() => setPacketCase(item.cases[0])}
                        className="py-2.5 px-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> Proof
                      </button>
                    </div>

                    {/* Skip link */}
                    {flowPlanItems.length > 1 && (
                      <button
                        onClick={() => {
                          if (flowCurrentIdx < flowPlanItems.length - 1) {
                            advanceToNextStep();
                          } else {
                            setFlowStep("all_done");
                          }
                        }}
                        className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground text-center"
                      >
                        Skip this step →
                      </button>
                    )}
                  </>
                );
              })()}

              {/* Flow: Executing (approve) */}
              {flowStep === "executing" && (
                <div className="py-4">
                  <h2 className="text-lg font-bold text-foreground mb-4">Submitting…</h2>
                  <ExecutionChecklist />
                </div>
              )}

              {/* Flow: Sending request (evidence) */}
              {flowStep === "sending_request" && (
                <div className="py-4">
                  <h2 className="text-lg font-bold text-foreground mb-4">Sending request…</h2>
                  <SendingChecklist />
                </div>
              )}

              {/* Flow: Step done — transition to next step */}
              {flowStep === "step_done" && (
                <div className="py-6 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-base font-bold text-foreground mb-1">
                    Step {flowCurrentIdx + 1} complete
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stepResults[stepResults.length - 1]?.submittedCount > 0
                      ? `${stepResults[stepResults.length - 1].submittedCount} ${stepResults[stepResults.length - 1].submittedCount === 1 ? "case" : "cases"} submitted`
                      : stepResults[stepResults.length - 1]?.evidenceRequested
                      ? "Evidence request sent"
                      : stepResults[stepResults.length - 1]?.photosReceived
                      ? "Photos received, case moved to Ready"
                      : "Done"}
                  </p>
                  <button
                    onClick={advanceToNextStep}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium glow-hover transition-all flex items-center justify-center gap-1.5"
                  >
                    Continue to step {flowCurrentIdx + 2} <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Flow: All Done */}
              {flowStep === "all_done" && (
                <div className="py-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Plan complete</h2>
                  <p className="text-sm text-muted-foreground mb-4">{flowSummary}</p>

                  {/* Next check-in hook */}
                  <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-5">
                    <p className="text-sm text-foreground">
                      I'll notify you when photos arrive. <span className="font-semibold text-primary">Next check-in: tomorrow at 9am.</span>
                    </p>
                  </div>

                  <button
                    onClick={closeFlow}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium glow-hover transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Packet Viewer Modal */}
      {packetCase && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setPacketCase(null)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-lg p-5 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Evidence — {packetCase.id}</h2>
              <button onClick={() => setPacketCase(null)} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">✕</button>
            </div>
            <PacketViewer
              evidence={packetCase.evidence}
              showMissing
              expectedTypes={expectedEvidence[packetCase.lane]}
              onRequestPhotos={() => { setPacketCase(null); setPhotosModalCase(packetCase); }}
              onUploadPdf={() => setShowInvoiceModal(true)}
              onRefreshTracking={() => toast({ title: "Tracking refreshed", description: "Latest events pulled." })}
            />
          </div>
        </div>
      )}

      {/* Invoice Feed Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowInvoiceModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-lg p-5 animate-slide-up">
            <h2 className="text-base font-bold text-foreground mb-1">Connect Invoice Feed</h2>
            <p className="text-sm text-muted-foreground mb-4">Auto-forward carrier invoices to enrich overcharge cases.</p>

            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 mb-4">
              <p className="text-xs font-medium text-foreground mb-1.5">Forward carrier invoice emails to:</p>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border">
                <Mail className="h-4 w-4 text-primary" />
                <code className="text-sm font-mono text-primary">invoices@recoverly.ai</code>
              </div>
            </div>

            <div className="space-y-2 mb-5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">1</span><span>Add a rule to auto-forward carrier invoices</span></div>
              <div className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">2</span><span>Include attachments (PDF/CSV)</span></div>
              <div className="flex items-start gap-2"><span className="text-primary font-bold mt-0.5">3</span><span>We ingest and match automatically</span></div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setInvoiceFeedConnected(true);
                  setShowInvoiceModal(false);
                  toast({ title: "Invoice feed connected" });
                  if (flowStep === "review" && flowPlanItems[flowCurrentIdx]?.type === "invoice") {
                    setStepResults(prev => [...prev, {
                      type: "invoice", submittedCount: 0, evidenceRequested: false, photosReceived: false, invoiceUploaded: true,
                    }]);
                    if (flowCurrentIdx < flowPlanItems.length - 1) {
                      setFlowStep("step_done");
                    } else {
                      setFlowStep("all_done");
                    }
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium glow-hover transition-all"
              >
                Mark as Connected
              </button>
              <button onClick={() => setShowInvoiceModal(false)} className="py-2.5 px-4 rounded-xl border border-border text-foreground text-sm hover:bg-accent transition-colors">
                Cancel
              </button>
            </div>

            <button className="w-full mt-3 py-2 rounded-lg border border-border text-muted-foreground text-xs hover:bg-accent transition-colors flex items-center justify-center gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload invoice manually
            </button>
          </div>
        </div>
      )}

      {/* Request Photos Modal */}
      {photosModalCase && (
        <RequestPhotosModal
          open={true}
          onClose={() => {
            setPhotosModalCase(null);
          }}
          orderNumber={photosModalCase.shopify_order.order_number}
          trackingNumber={photosModalCase.tracking_number}
          customerName={photosModalCase.shopify_order.customer_name}
          caseId={photosModalCase.id}
          onSent={() => {
            if (flowStep === "review") {
              handleSendEvidenceRequest(photosModalCase);
            } else {
              toast({ title: "Request sent", description: `Photo request sent to ${photosModalCase.shopify_order.customer_name}.` });
              setPhotosModalCase(null);
            }
          }}
        />
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

// Execution checklist sub-component (approve)
const ExecutionChecklist = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx <= 4) {
        setStep(idx);
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

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

// Sending checklist sub-component (evidence request)
const SendingChecklist = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx <= 3) {
        setStep(idx);
      } else {
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const items = [
    "Preparing message…",
    "Generating upload link…",
    "Request sent ✅",
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
