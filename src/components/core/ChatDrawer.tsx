import { useState } from "react";
import { X, Send, Mic, MessageSquare, FileSearch, Clock, Camera, Sparkles } from "lucide-react";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
}

const presets = [
  { icon: Sparkles, label: "Why is this recoverable?", color: "text-primary" },
  { icon: FileSearch, label: "What evidence is missing?", color: "text-amber" },
  { icon: Clock, label: "Summarize packet in 10 seconds", color: "text-agent-blue" },
  { icon: Camera, label: "Draft customer evidence request", color: "text-coral" },
];

interface Message {
  role: "user" | "agent";
  text: string;
}

const mockResponses: Record<string, string> = {
  "Why is this recoverable?":
    "This is recoverable because the carrier violated their service guarantee. The package was shipped via a guaranteed service level but delivered past the committed date. Under the carrier's GSR (Guaranteed Service Refund) policy, you're entitled to a full refund of shipping charges.",
  "What evidence is missing?":
    "All core evidence is present: shipment record, tracking events, and delivery guarantee source. For the strongest case, I'd also recommend having the carrier invoice line item. Overall evidence completeness: 85%.",
  "Summarize packet in 10 seconds":
    "📦 ShipStation shipment with tracking → promised delivery missed → carrier invoice confirms charges → refund eligible under service guarantee. All key evidence attached.",
  "Draft customer evidence request":
    "Hi [Customer],\n\nWe're filing a damage claim for your order and need a few photos:\n\n1. 3-5 photos of the damaged item(s)\n2. Photos of the packaging/box condition\n3. Any visible damage to the outer shipping box\n\nPlease reply to this email with the photos attached. This helps us recover the shipping costs and get you taken care of.\n\nOrder: #[ORDER_NUMBER]\nTracking: [TRACKING_NUMBER]\n\nThank you!",
};

const ChatDrawer = ({ open, onClose, caseId }: ChatDrawerProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: "I'm ready to help with this case. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = (text: string) => {
    const userMsg: Message = { role: "user", text };
    const response = mockResponses[text] || `I'll look into "${text}" for case ${caseId || "this case"}. Based on the evidence packet, here's what I found...`;
    const agentMsg: Message = { role: "agent", text: response };
    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setInput("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-agent-blue/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-agent-blue" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recovery Agent</h3>
              <p className="text-xs text-primary">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-surface border border-border text-foreground rounded-bl-md"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Presets */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => sendMessage(preset.label)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap shrink-0"
              >
                <preset.icon className={`h-3 w-3 ${preset.color}`} />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2.5 rounded-full transition-colors ${
                isRecording ? "bg-destructive text-destructive-foreground pulse-emerald" : "bg-surface hover:bg-accent text-muted-foreground"
              }`}
            >
              <Mic className="h-5 w-5" />
            </button>
            {isRecording ? (
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-destructive/30">
                <div className="flex gap-0.5">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-destructive rounded-full"
                      style={{
                        height: `${8 + Math.random() * 16}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs text-destructive ml-auto">Recording...</span>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && input.trim() && sendMessage(input.trim())}
                  placeholder="Ask about this case..."
                  className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => input.trim() && sendMessage(input.trim())}
                  disabled={!input.trim()}
                  className="p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50 glow-hover transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDrawer;
