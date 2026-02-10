import { useRef, useState, useCallback } from "react";
import { ChevronRight, MoreVertical, Check, Pause, Eye, Copy, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Case } from "@/lib/case-data";
import { statusConfig, laneConfig, carrierConfig } from "@/lib/case-data";
import MoneyBadge from "./MoneyBadge";
import ReceiptStrip from "./ReceiptStrip";

interface ActivityCardProps {
  caseData: Case;
  onApprove?: (id: string) => void;
  onHold?: (id: string) => void;
}

function formatDeadline(deadline: string): { text: string; urgent: boolean; passed: boolean } {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    return { text: "Deadline passed", urgent: false, passed: true };
  }
  if (diffHours <= 48) {
    return { text: `Urgent: ${diffHours}h left`, urgent: true, passed: false };
  }
  const formatted = dl.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { text: `Deadline: ${formatted} (${diffDays} days)`, urgent: diffDays <= 7, passed: false };
}

const ActivityCard = ({ caseData, onApprove, onHold }: ActivityCardProps) => {
  const navigate = useNavigate();
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const [showMenu, setShowMenu] = useState(false);

  const status = statusConfig[caseData.status];
  const lane = laneConfig[caseData.lane];
  const carrier = carrierConfig[caseData.carrier];

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startX.current;
    setSwipeX(Math.max(-100, Math.min(100, diff)));
  }, [swiping]);

  const handleTouchEnd = useCallback(() => {
    setSwiping(false);
    if (swipeX > 60 && onApprove) {
      onApprove(caseData.id);
    } else if (swipeX < -60 && onHold) {
      onHold(caseData.id);
    }
    setSwipeX(0);
  }, [swipeX, onApprove, onHold, caseData.id]);

  const deadlineInfo = formatDeadline(caseData.deadline);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe backgrounds */}
      <div className="absolute inset-0 flex">
        <div className={`flex-1 flex items-center pl-6 bg-primary/20 transition-opacity ${swipeX > 30 ? "opacity-100" : "opacity-0"}`}>
          <Check className="h-6 w-6 text-primary" />
          <span className="ml-2 text-sm font-medium text-primary">Approve</span>
        </div>
        <div className={`flex-1 flex items-center justify-end pr-6 bg-amber/20 transition-opacity ${swipeX < -30 ? "opacity-100" : "opacity-0"}`}>
          <span className="mr-2 text-sm font-medium text-amber">Hold</span>
          <Pause className="h-6 w-6 text-amber" />
        </div>
      </div>

      {/* Card content */}
      <div
        className="relative bg-card border border-border rounded-xl p-4 transition-transform duration-150 cursor-pointer active:scale-[0.99]"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => navigate(`/case/${caseData.id}`)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bgColor} ${status.color}`}>
              {status.label}
            </span>
            <span className={`text-xs font-medium ${lane.color}`}>{lane.label}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={`text-xs font-medium ${carrier.color}`}>{carrier.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <MoneyBadge amount={caseData.amount} status={caseData.status} size="sm" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg hover:bg-accent transition-colors"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Order + Tracking */}
        <div className="flex items-center gap-4 mb-3 text-sm">
          <span className="text-foreground font-medium">{caseData.shopify_order.order_number}</span>
          <span className="text-muted-foreground font-mono text-xs">{caseData.tracking_number}</span>
        </div>

        {/* Confidence */}
        <p className="text-xs text-muted-foreground mb-3">{caseData.confidence_reason}</p>

        {/* Receipt Strip */}
        <ReceiptStrip
          caseData={caseData}
          onViewPacket={() => navigate(`/case/${caseData.id}?tab=packet`)}
          compact
        />

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{caseData.shopify_order.customer_name}</span>
            <span className={
              deadlineInfo.passed ? "text-destructive font-medium" :
              deadlineInfo.urgent ? "text-amber font-medium" : ""
            }>
              {deadlineInfo.text}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div
            className="absolute right-4 top-12 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { navigate(`/case/${caseData.id}`); setShowMenu(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2">
              <Eye className="h-4 w-4" /> Open Case
            </button>
            <button onClick={() => { navigate(`/case/${caseData.id}?tab=packet`); setShowMenu(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2">
              <Receipt className="h-4 w-4" /> View Packet
            </button>
            <button onClick={() => { navigator.clipboard.writeText(caseData.tracking_number); setShowMenu(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2">
              <Copy className="h-4 w-4" /> Copy Tracking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
