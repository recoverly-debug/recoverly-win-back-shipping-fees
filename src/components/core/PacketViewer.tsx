import { FileText, Image, Package, Receipt, Truck, Clock, AlertTriangle, CheckCircle2, Camera, Upload, RefreshCw, ShieldCheck } from "lucide-react";
import type { Evidence, EvidenceType } from "@/lib/case-data";

interface PacketViewerProps {
  evidence: Evidence[];
  showMissing?: boolean;
  expectedTypes?: EvidenceType[];
  onRequestPhotos?: () => void;
  onUploadPdf?: () => void;
  onRefreshTracking?: () => void;
}

const evidenceIcons: Record<EvidenceType, typeof FileText> = {
  SHIPSTATION_LABEL: FileText,
  SHIPSTATION_SHIPMENT: Package,
  TRACKING_EVENTS: Truck,
  CARRIER_INVOICE_LINE: Receipt,
  UPLOADED_PDF: FileText,
  PHOTOS: Image,
  ADJUSTMENT_LINE: Receipt,
  PROMISED_DELIVERY_SOURCE: Clock,
};

const evidenceLabels: Record<EvidenceType, string> = {
  SHIPSTATION_LABEL: "Shipping Label",
  SHIPSTATION_SHIPMENT: "Shipment Record",
  TRACKING_EVENTS: "Tracking Events",
  CARRIER_INVOICE_LINE: "Invoice Line Item",
  UPLOADED_PDF: "Uploaded Document",
  PHOTOS: "Photos",
  ADJUSTMENT_LINE: "Adjustment Record",
  PROMISED_DELIVERY_SOURCE: "Delivery Guarantee",
};

const sourceLabels = {
  SHIPSTATION: "ShipStation",
  CARRIER_INVOICE: "Carrier Invoice",
  UPLOAD: "User Upload",
};

const PacketViewer = ({ evidence, showMissing = true, expectedTypes, onRequestPhotos, onUploadPdf, onRefreshTracking }: PacketViewerProps) => {
  const presentTypes = new Set(evidence.map((e) => e.type));
  const missingTypes = expectedTypes
    ? expectedTypes.filter((t) => !presentTypes.has(t))
    : [];

  const totalExpected = expectedTypes?.length ?? 0;
  const totalPresent = totalExpected - missingTypes.length;
  const isAuditReady = totalExpected > 0 && missingTypes.length === 0;

  // Group by source
  const grouped: Record<string, Evidence[]> = {};
  evidence.forEach((e) => {
    const key = sourceLabels[e.source];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  });

  const getMissingAction = (type: EvidenceType) => {
    if (type === "PHOTOS" && onRequestPhotos) {
      return { label: "Request from Customer", icon: Camera, onClick: onRequestPhotos };
    }
    if ((type === "CARRIER_INVOICE_LINE" || type === "UPLOADED_PDF" || type === "ADJUSTMENT_LINE") && onUploadPdf) {
      return { label: "Upload PDF", icon: Upload, onClick: onUploadPdf };
    }
    if (type === "TRACKING_EVENTS" && onRefreshTracking) {
      return { label: "Refresh Tracking", icon: RefreshCw, onClick: onRefreshTracking };
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Audit-Ready / Needs Evidence Badge */}
      {totalExpected > 0 && (
        <div className={`p-3 rounded-lg border ${isAuditReady ? "border-primary/20 bg-primary/5" : "border-warning/20 bg-warning/5"}`}>
          <div className="flex items-center gap-2 mb-0.5">
            {isAuditReady ? (
              <>
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Audit-Ready</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-semibold text-warning">Needs evidence</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalPresent} of {totalExpected} core {totalExpected === 1 ? "item" : "items"} present
            {!isAuditReady && missingTypes.length > 0 && (
              <> — missing {missingTypes.map((t) => evidenceLabels[t].toLowerCase()).join(", ")}</>
            )}
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([source, items]) => (
        <div key={source}>
          <h4 className="label-caps mb-2">{source}</h4>
          <div className="space-y-2">
            {items.map((item, idx) => {
              const Icon = evidenceIcons[item.type];
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-surface/40 hover:bg-accent/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-agent-blue/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-agent-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{evidenceLabels[item.type]}</p>
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.summary}</p>
                    {item.file_ref && (
                      <button className="text-xs text-primary hover:underline mt-1">{item.file_ref}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Missing Evidence */}
      {showMissing && missingTypes.length > 0 && (
        <div>
          <h4 className="label-caps mb-2 text-warning">Missing Evidence</h4>
          <div className="space-y-2">
            {missingTypes.map((type) => {
              const Icon = evidenceIcons[type];
              const action = getMissingAction(type);
              return (
                <div
                  key={type}
                  className="flex items-start gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5"
                >
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{evidenceLabels[type]}</p>
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    </div>
                    <p className="text-xs text-warning">Required — not yet provided</p>
                    {action && (
                      <button
                        onClick={action.onClick}
                        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg border border-warning/20 text-xs font-medium text-warning hover:bg-warning/10 transition-colors"
                      >
                        <action.icon className="h-3.5 w-3.5" /> {action.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PacketViewer;
