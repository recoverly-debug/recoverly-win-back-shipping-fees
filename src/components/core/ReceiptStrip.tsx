import { ClipboardList, Eye } from "lucide-react";
import type { Case } from "@/lib/case-data";

interface ReceiptStripProps {
  caseData: Case;
  onViewPacket?: () => void;
  compact?: boolean;
}

function getSourceSummary(caseData: Case): string {
  const sources = new Set(caseData.evidence.map((e) => e.source));
  const parts: string[] = [];
  if (sources.has("SHIPSTATION")) parts.push(`ShipStation #${caseData.shipstation_shipment.shipment_id}`);
  if (sources.has("CARRIER_INVOICE")) parts.push("Carrier invoice line present");
  if (sources.has("UPLOAD")) {
    const uploads = caseData.evidence.filter((e) => e.source === "UPLOAD");
    parts.push(`${uploads.length} uploaded ${uploads.length === 1 ? "file" : "files"}`);
  }
  return parts.join(" • ");
}

function getBasis(caseData: Case): string {
  switch (caseData.lane) {
    case "OVERCHARGE":
      return "Billed dims exceed label dims";
    case "LATE_DELIVERY":
      return "Delivered after promised date (Service Guarantee)";
    case "LOST":
      return "Tracking stalled 14+ days, no scan updates";
    case "DAMAGE":
      return "Item arrived damaged in transit";
  }
}

const ReceiptStrip = ({ caseData, onViewPacket, compact = false }: ReceiptStripProps) => {
  const proofCount = caseData.evidence.length;
  const missingEvidence = caseData.status === "NEEDS_EVIDENCE";

  return (
    <div className={`rounded-lg border border-border bg-surface/60 ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-start gap-2 mb-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <span className="label-caps">Receipt</span>
      </div>
      <div className={`space-y-1 ${compact ? "text-xs" : "text-sm"} text-muted-foreground`}>
        <p>
          <span className="text-foreground font-medium">Source:</span> {getSourceSummary(caseData)}
        </p>
        <p>
          <span className="text-foreground font-medium">Basis:</span> {getBasis(caseData)}
        </p>
        <div className="flex items-center justify-between">
          <p>
            <span className="text-foreground font-medium">Proof:</span>{" "}
            {proofCount} item{proofCount !== 1 ? "s" : ""}
            {missingEvidence && (
              <span className="ml-2 text-amber">• Missing evidence</span>
            )}
          </p>
          {onViewPacket && (
            <button
              onClick={onViewPacket}
              className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
            >
              <Eye className="h-3 w-3" />
              View Packet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptStrip;
