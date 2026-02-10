import { useState } from "react";
import { X, Send, Camera } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RequestPhotosModalProps {
  open: boolean;
  onClose: () => void;
  orderNumber: string;
  trackingNumber: string;
  customerName: string;
  caseId: string;
  onSent?: () => void;
}

const RequestPhotosModal = ({
  open,
  onClose,
  orderNumber,
  trackingNumber,
  customerName,
  caseId,
  onSent,
}: RequestPhotosModalProps) => {
  const defaultMessage = `Hi ${customerName},

We're filing a damage claim for your order and need a few photos to proceed:

✅ 3–5 photos of the damaged item(s)
✅ 2 photos of packaging and shipping label

You can upload them here:
recoverly.link/upload/${caseId}

Order: ${orderNumber}
Tracking: ${trackingNumber}

Thank you for your help — this allows us to recover shipping costs and get you taken care of quickly.`;

  const [message, setMessage] = useState(defaultMessage);

  if (!open) return null;

  const handleSend = () => {
    toast({
      title: "Request sent",
      description: `Photo request sent to ${customerName}.`,
    });
    onSent?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber" />
            <h2 className="text-base font-semibold text-foreground">Request Photos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="label-caps mb-2 block">Message to Customer</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
            />
          </div>

          <div className="p-3 rounded-lg bg-surface border border-border">
            <p className="label-caps mb-1">Required from customer</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 3–5 photos of item damage</li>
              <li>• 2 photos of packaging/label</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 rounded-xl bg-amber text-warning-foreground text-sm font-medium hover:bg-amber/90 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" /> Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestPhotosModal;
