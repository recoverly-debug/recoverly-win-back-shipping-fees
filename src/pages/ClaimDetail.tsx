import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  Weight,
  Ruler,
  DollarSign,
  FileText,
  Download,
  Clock,
  User,
  Bot,
  Building2,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import AppNav from "@/components/navigation/AppNav";
import { Badge } from "@/components/ui/badge";
import { claimsData, statusConfig } from "@/lib/claims-data";
import { getClaimDetail } from "@/lib/claims-detail-data";
import type { ClaimDetail as ClaimDetailType, ClaimTimelineEvent, ClaimDocument } from "@/lib/claims-detail-data";

const actorIcons: Record<string, typeof Bot> = {
  AGENT: Bot,
  USER: User,
  CARRIER: Building2,
};

const actorColors: Record<string, string> = {
  AGENT: "text-primary bg-primary/10 border-primary/20",
  USER: "text-info bg-info/10 border-info/20",
  CARRIER: "text-amber bg-amber/10 border-amber/20",
};

const docTypeIcons: Record<string, typeof FileText> = {
  label: FileText,
  invoice: DollarSign,
  tracking_log: Clock,
  photo: Package,
  pdf: FileText,
};

const tabs = [
  { label: "Shipment", value: "shipment" },
  { label: "Issue", value: "issue" },
  { label: "Timeline", value: "timeline" },
  { label: "Documents", value: "documents" },
];

const ClaimDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("shipment");

  const claim = claimsData.find((c) => c.id === id);
  const detail = id ? getClaimDetail(id) : undefined;

  if (!claim) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="container px-4 py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Claim not found</h1>
          <p className="text-muted-foreground mb-6">The claim you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/claims")} className="text-primary hover:underline text-sm">
            Back to Claims
          </button>
        </main>
      </div>
    );
  }

  const config = statusConfig[claim.status];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="container px-4 py-6 max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/claims")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Claims
        </button>

        {/* Header Card */}
        <div className="p-5 rounded-xl border border-border bg-card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`${config.className} text-xs font-medium`}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{claim.id}</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{claim.issue}</h1>
              <p className="text-sm text-muted-foreground mt-1 font-mono">{claim.tracking}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${claim.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{claim.carrier}</p>
            </div>
          </div>
          {detail && (
            <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
              {detail.issue_description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
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
        <div className="animate-fade-in">
          {activeTab === "shipment" && <ShipmentTab detail={detail} claim={claim} />}
          {activeTab === "issue" && <IssueTab detail={detail} claim={claim} />}
          {activeTab === "timeline" && <TimelineTab detail={detail} />}
          {activeTab === "documents" && <DocumentsTab detail={detail} />}
        </div>
      </main>
    </div>
  );
};

/* ── Shipment Tab ── */
function ShipmentTab({ detail, claim }: { detail?: ClaimDetailType; claim: typeof claimsData[0] }) {
  if (!detail) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <Truck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Detailed shipment data not yet available for this claim.</p>
      </div>
    );
  }

  const s = detail.shipment;
  const hasDimDiscrepancy = s.billed_dimensions !== undefined;

  return (
    <div className="space-y-4">
      {/* Shipment Info */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="label-caps mb-4 flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> Shipment Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow icon={Package} label="Shipment ID" value={s.shipment_id} />
          <InfoRow icon={Truck} label="Service" value={s.service} />
          <InfoRow icon={Calendar} label="Ship Date" value={new Date(s.ship_date).toLocaleDateString()} />
          <InfoRow icon={Calendar} label="Delivery" value={s.delivery_date ? new Date(s.delivery_date).toLocaleDateString() : "Pending"} />
          <InfoRow icon={MapPin} label="Origin" value={s.origin} />
          <InfoRow icon={MapPin} label="Destination" value={s.destination} />
          <InfoRow icon={Weight} label="Weight" value={`${(s.weight_oz / 16).toFixed(1)} lbs (${s.weight_oz} oz)`} />
          <InfoRow icon={Ruler} label="Dimensions" value={`${s.dimensions.l}×${s.dimensions.w}×${s.dimensions.h} in`} />
          <InfoRow icon={DollarSign} label="Shipping Cost" value={`$${s.shipping_cost.toFixed(2)}`} highlight />
        </div>

        {hasDimDiscrepancy && s.billed_dimensions && (
          <div className="mt-4 p-3 rounded-lg bg-amber/5 border border-amber/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber" />
              <span className="text-xs font-semibold text-amber">Billing Discrepancy</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Actual Dims</span>
                <p className="text-foreground font-medium">{s.dimensions.l}×{s.dimensions.w}×{s.dimensions.h} in</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Billed Dims</span>
                <p className="text-amber font-medium">{s.billed_dimensions.l}×{s.billed_dimensions.w}×{s.billed_dimensions.h} in</p>
              </div>
              {s.billed_weight_oz && (
                <>
                  <div>
                    <span className="text-muted-foreground text-xs">Actual Weight</span>
                    <p className="text-foreground font-medium">{(s.weight_oz / 16).toFixed(1)} lbs</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Billed Weight</span>
                    <p className="text-amber font-medium">{(s.billed_weight_oz / 16).toFixed(1)} lbs</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Info */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="label-caps mb-4 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-primary" /> Shopify Order
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <InfoRow icon={FileText} label="Order" value={detail.order.order_number} />
          <InfoRow icon={User} label="Customer" value={detail.order.customer_name} />
          <InfoRow icon={DollarSign} label="Order Total" value={`$${detail.order.total.toFixed(2)}`} highlight />
          <InfoRow icon={Calendar} label="Date" value={new Date(detail.order.created_at).toLocaleDateString()} />
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground mb-2">Items</p>
          {detail.order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.qty}</span></span>
              <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Issue Tab ── */
function IssueTab({ detail, claim }: { detail?: ClaimDetailType; claim: typeof claimsData[0] }) {
  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl border border-border bg-card">
        <h3 className="label-caps mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber" /> Issue Details
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Issue Type</p>
            <p className="text-foreground font-semibold">{claim.issue}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm text-foreground leading-relaxed">
              {detail?.issue_description || `${claim.issue} detected on shipment ${claim.tracking}. Recovery amount: $${claim.amount.toFixed(2)}.`}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount</p>
              <p className="text-lg font-bold text-primary">${claim.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Carrier</p>
              <p className="text-foreground font-medium">{claim.carrier}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Submitted</p>
              <p className="text-foreground font-medium">{new Date(claim.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Route */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="label-caps mb-2">Submission</h3>
        <p className="text-sm text-foreground">ShipStation claim flow <span className="text-primary">✅</span></p>
      </div>
    </div>
  );
}

/* ── Timeline Tab ── */
function TimelineTab({ detail }: { detail?: ClaimDetailType }) {
  if (!detail) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Timeline data not yet available for this claim.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-0">
        {detail.timeline.map((event, i) => {
          const ActorIcon = actorIcons[event.actor] || Bot;
          const colorClass = actorColors[event.actor] || actorColors.AGENT;

          return (
            <div key={i} className="relative pl-12 pb-6 last:pb-0">
              <div className={`absolute left-2.5 top-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${colorClass}`}>
                <ActorIcon className="h-3 w-3" />
              </div>
              <div className="p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-foreground">{event.event}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.ts).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{event.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Documents Tab ── */
function DocumentsTab({ detail }: { detail?: ClaimDetailType }) {
  if (!detail) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No documents available for this claim.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {detail.documents.map((doc) => {
        const DocIcon = docTypeIcons[doc.type] || FileText;
        return (
          <div
            key={doc.id}
            className="p-4 rounded-xl border border-border bg-card flex items-center gap-4 hover:border-primary/20 transition-colors group"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <DocIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground">
                {doc.source} • {doc.size} • {new Date(doc.date).toLocaleDateString()}
              </p>
            </div>
            <button className="p-2 rounded-lg hover:bg-accent transition-colors opacity-0 group-hover:opacity-100">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── Helper ── */
function InfoRow({ icon: Icon, label, value, highlight }: { icon: typeof Package; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

export default ClaimDetailPage;
