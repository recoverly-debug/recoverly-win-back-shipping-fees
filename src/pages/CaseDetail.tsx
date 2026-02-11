import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Pause, MessageSquare, Camera, Package, ImagePlus } from "lucide-react";
import BottomNav from "@/components/navigation/BottomNav";
import MoneyBadge from "@/components/core/MoneyBadge";
import ReceiptStrip from "@/components/core/ReceiptStrip";
import CaseTimeline from "@/components/core/CaseTimeline";
import PacketViewer from "@/components/core/PacketViewer";
import ChatDrawer from "@/components/core/ChatDrawer";
import UndoToast from "@/components/core/UndoToast";
import RequestPhotosModal from "@/components/core/RequestPhotosModal";
import { getCaseById, statusConfig, laneConfig, carrierConfig, formatMoney } from "@/lib/case-data";
import type { Case, EvidenceType } from "@/lib/case-data";
import { toast } from "@/hooks/use-toast";

const expectedEvidence: Record<string, EvidenceType[]> = {
  OVERCHARGE: ["SHIPSTATION_LABEL", "SHIPSTATION_SHIPMENT", "CARRIER_INVOICE_LINE", "ADJUSTMENT_LINE"],
  LATE_DELIVERY: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PROMISED_DELIVERY_SOURCE", "SHIPSTATION_LABEL"],
  LOST: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "SHIPSTATION_LABEL"],
  DAMAGE: ["SHIPSTATION_SHIPMENT", "TRACKING_EVENTS", "PHOTOS", "SHIPSTATION_LABEL"],
};

const CaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "summary";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [chatOpen, setChatOpen] = useState(false);
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [undoAction, setUndoAction] = useState<{ message: string; undo: () => void } | null>(null);
  const [caseData, setCaseData] = useState<Case | undefined>(getCaseById(id || ""));

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
          <div className="container px-4 h-14 flex items-center">
            <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
          </div>
        </header>
        <main className="container px-4 py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Case not found</h1>
          <p className="text-muted-foreground mb-6">The case you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/agent")} className="text-primary hover:underline text-sm">Back to Home</button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const status = statusConfig[caseData.status];
  const lane = laneConfig[caseData.lane];
  const carrier = carrierConfig[caseData.carrier];
  const isDamageNeedsEvidence = caseData.lane === "DAMAGE" && caseData.status === "NEEDS_EVIDENCE";

  const handleApprove = () => {
    const original = { ...caseData };
    setCaseData({ ...caseData, status: "SUBMITTED" });
    setUndoAction({
      message: `Case ${caseData.id} approved and submitted.`,
      undo: () => setCaseData(original),
    });
  };

  const handleMarkPhotosReceived = () => {
    const updatedCase: Case = {
      ...caseData,
      status: "READY",
      confidence_label: "MEDIUM",
      confidence_reason: "Medium — 4 of 4 core evidence items present. Customer photos received.",
      evidence: [
        ...caseData.evidence,
        { type: "PHOTOS", source: "UPLOAD", file_ref: "customer-photos.zip", summary: "5 photos: damaged item (3), packaging condition (2)." },
      ],
      timeline: [
        ...caseData.timeline,
        { ts: new Date().toISOString(), event: "Evidence received", note: "Customer provided 5 damage photos.", actor: "USER" as const },
        { ts: new Date().toISOString(), event: "Case ready", note: "All evidence now present. Ready for filing.", actor: "AGENT" as const },
      ],
    };
    setCaseData(updatedCase);
    toast({ title: "Photos received", description: "Case updated to Ready with 5 customer photos." });
  };

  const handlePhotosRequestSent = () => {
    setCaseData({
      ...caseData,
      timeline: [
        ...caseData.timeline,
        { ts: new Date().toISOString(), event: "Customer evidence requested", note: "Photo request sent to customer.", actor: "AGENT" as const },
      ],
    });
  };

  const handleRequestPhotos = () => setPhotosModalOpen(true);
  const handleUploadPdf = () => toast({ title: "Upload started", description: "Upload dialog would open here." });
  const handleRefreshTracking = () => toast({ title: "Tracking refreshed", description: "Latest tracking events pulled from carrier." });

  const tabs = [
    { label: "Summary", value: "summary" },
    { label: "Timeline", value: "timeline" },
    { label: "Packet", value: "packet" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border">
        <div className="container px-4 h-14 flex items-center">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
              <span className={`text-xs font-medium ${lane.color}`}>{lane.label}</span>
              <span className={`text-xs font-medium ${carrier.color}`}>{carrier.label}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{caseData.id}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {caseData.shopify_order.order_number} • {caseData.shopify_order.customer_name}
            </p>
          </div>
          <MoneyBadge amount={caseData.amount} status={caseData.status} size="lg" />
        </div>

        {/* Confidence + Submission Route */}
        <div className="p-3 rounded-lg bg-surface border border-border mb-4">
          <p className="text-xs text-muted-foreground">{caseData.confidence_reason}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-foreground font-medium">Submission:</span> ShipStation claim flow ✅
          </p>
        </div>

        {/* Damage CTA */}
        {isDamageNeedsEvidence && (
          <div className="p-4 rounded-xl border border-amber/30 bg-amber/5 mb-4 space-y-3">
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-amber mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-1">Photos needed from customer</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Request 3–5 item photos + packaging photos from {caseData.shopify_order.customer_name} to strengthen this claim.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleRequestPhotos}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber text-warning-foreground text-sm font-medium hover:bg-amber/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" /> Request Evidence from Customer
                  </button>
                  <button
                    onClick={handleMarkPhotosReceived}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" /> Mark Photos Received (Mock)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Strip */}
        <ReceiptStrip caseData={caseData} onViewPacket={() => setActiveTab("packet")} />

        {/* Tabs */}
        <div className="flex gap-1 mt-6 mb-4 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.value ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "summary" && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl border border-border bg-card">
              <h3 className="label-caps mb-3">Shopify Order</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Order:</span> <span className="text-foreground font-medium">{caseData.shopify_order.order_number}</span></div>
                <div><span className="text-muted-foreground">Total:</span> <span className="text-foreground font-medium">{formatMoney(caseData.shopify_order.total)}</span></div>
                <div><span className="text-muted-foreground">Customer:</span> <span className="text-foreground font-medium">{caseData.shopify_order.customer_name}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="text-foreground font-medium">{new Date(caseData.shopify_order.created_at).toLocaleDateString()}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <h4 className="text-xs text-muted-foreground mb-2">Items</h4>
                {caseData.shopify_order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <span className="text-foreground">{item.name} ×{item.qty}</span>
                    <span className="text-muted-foreground">{formatMoney(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card">
              <h3 className="label-caps mb-3">ShipStation Shipment</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">ID:</span> <span className="text-foreground font-mono text-xs">{caseData.shipstation_shipment.shipment_id}</span></div>
                <div><span className="text-muted-foreground">Service:</span> <span className="text-foreground font-medium">{caseData.service}</span></div>
                <div><span className="text-muted-foreground">Tracking:</span> <span className="text-foreground font-mono text-xs">{caseData.tracking_number}</span></div>
                <div><span className="text-muted-foreground">Ship Date:</span> <span className="text-foreground">{caseData.shipstation_shipment.ship_date}</span></div>
                <div><span className="text-muted-foreground">Weight:</span> <span className="text-foreground">{caseData.shipstation_shipment.weight_oz} oz</span></div>
                <div><span className="text-muted-foreground">Dims:</span> <span className="text-foreground">{`${caseData.shipstation_shipment.dimensions.l}×${caseData.shipstation_shipment.dimensions.w}×${caseData.shipstation_shipment.dimensions.h}`}</span></div>
                <div><span className="text-muted-foreground">Cost:</span> <span className="text-foreground font-medium">{formatMoney(caseData.shipstation_shipment.shipping_cost)}</span></div>
                {caseData.shipstation_shipment.billed_dimensions && (
                  <div><span className="text-muted-foreground">Billed Dims:</span> <span className="text-amber font-medium">{`${caseData.shipstation_shipment.billed_dimensions.l}×${caseData.shipstation_shipment.billed_dimensions.w}×${caseData.shipstation_shipment.billed_dimensions.h}`}</span></div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="animate-fade-in">
            <CaseTimeline events={caseData.timeline} />
          </div>
        )}

        {activeTab === "packet" && (
          <div className="animate-fade-in">
            <PacketViewer
              evidence={caseData.evidence}
              showMissing
              expectedTypes={expectedEvidence[caseData.lane]}
              onRequestPhotos={handleRequestPhotos}
              onUploadPdf={handleUploadPdf}
              onRefreshTracking={handleRefreshTracking}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-8 pb-8">
          {["FOUND", "READY"].includes(caseData.status) && (
            <button onClick={handleApprove} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2">
              <Check className="h-5 w-5" /> Approve & Submit
            </button>
          )}
          {!["PAID", "APPROVED"].includes(caseData.status) && (
            <button className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
              <Pause className="h-5 w-5" /> Hold
            </button>
          )}
          <button
            onClick={() => setChatOpen(true)}
            className="py-3 px-4 rounded-xl border border-agent-blue/30 text-agent-blue font-medium hover:bg-agent-blue/10 transition-colors flex items-center gap-2"
          >
            <MessageSquare className="h-5 w-5" /> Explain This
          </button>
        </div>
      </main>

      <BottomNav />

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} caseId={caseData.id} />

      <RequestPhotosModal
        open={photosModalOpen}
        onClose={() => setPhotosModalOpen(false)}
        orderNumber={caseData.shopify_order.order_number}
        trackingNumber={caseData.tracking_number}
        customerName={caseData.shopify_order.customer_name}
        caseId={caseData.id}
        onSent={handlePhotosRequestSent}
      />

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

export default CaseDetail;
