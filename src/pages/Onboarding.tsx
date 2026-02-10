import { useState } from "react";
import { Package, Store, Loader2, CheckCircle2, ArrowRight, Sparkles, Radio, Shield, Check } from "lucide-react";
import Logo from "@/components/Logo";

type Step = "shipstation" | "shopify" | "monitoring" | "syncing" | "results";

const Onboarding = () => {
  const [step, setStep] = useState<Step>("shipstation");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = (next: Step) => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setStep(next);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <p className="text-sm text-muted-foreground mt-2">Let's connect your accounts and turn on monitoring.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["shipstation", "shopify", "monitoring", "syncing", "results"] as Step[]).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
                step === s ? "bg-primary pulse-emerald" :
                (["shipstation", "shopify", "monitoring", "syncing", "results"].indexOf(step) > idx) ? "bg-primary" : "bg-border"
              }`} />
              {idx < 4 && <div className={`w-6 h-px ${
                (["shipstation", "shopify", "monitoring", "syncing", "results"].indexOf(step) > idx) ? "bg-primary" : "bg-border"
              }`} />}
            </div>
          ))}
        </div>

        {/* Step: ShipStation */}
        {step === "shipstation" && (
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground text-center mb-2">Connect ShipStation</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              We'll pull your shipments, labels, and tracking data to detect recoverable issues.
            </p>
            <button
              onClick={() => handleConnect("shopify")}
              disabled={connecting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {connecting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Connecting...</>
              ) : (
                <><Package className="h-5 w-5" /> Connect ShipStation</>
              )}
            </button>
          </div>
        )}

        {/* Step: Shopify */}
        {step === "shopify" && (
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">ShipStation connected</span>
            </div>
            <div className="h-14 w-14 rounded-xl bg-agent-blue/10 flex items-center justify-center mx-auto mb-4">
              <Store className="h-7 w-7 text-agent-blue" />
            </div>
            <h2 className="text-lg font-bold text-foreground text-center mb-2">Connect Shopify</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              We'll match orders to shipments to build complete evidence packets.
            </p>
            <button
              onClick={() => handleConnect("monitoring")}
              disabled={connecting}
              className="w-full py-3 rounded-xl bg-agent-blue text-info-foreground font-medium hover:bg-agent-blue/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {connecting ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Connecting...</>
              ) : (
                <><Store className="h-5 w-5" /> Connect Shopify</>
              )}
            </button>
          </div>
        )}

        {/* Step: Turn on Monitoring */}
        {step === "monitoring" && (
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-primary font-medium">Both accounts connected</span>
            </div>
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Radio className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Turn on Monitoring</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The agent will continuously monitor your shipments, charges, and tracking events to detect recovery opportunities.
            </p>
            <button
              onClick={() => { setStep("syncing"); }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2"
            >
              <Shield className="h-5 w-5" /> Turn on Ongoing Audit
            </button>
          </div>
        )}

        {/* Step: First sync */}
        {step === "syncing" && (
          <SyncingStep onComplete={() => setStep("results")} />
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Monitoring started</h2>
            <p className="text-sm text-muted-foreground mb-1">First sync completed — new issues found</p>
            <p className="text-4xl font-bold text-primary money-glow my-4">$2,194.45</p>
            <p className="text-sm text-muted-foreground mb-4">across 10 recovery opportunities</p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Overcharges</span><br /><span className="text-foreground font-bold">4 cases</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Late Deliveries</span><br /><span className="text-foreground font-bold">3 cases</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Lost Packages</span><br /><span className="text-foreground font-bold">1 case</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Damages</span><br /><span className="text-foreground font-bold">2 cases</span></div>
            </div>
            <a href="/agent" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2">
              Go to Ongoing Audit <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Syncing checklist animation
const SyncingStep = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(0);

  const items = [
    "Connecting to ShipStation API…",
    "Pulling recent shipments…",
    "Matching tracking events…",
    "Building evidence packets…",
    "Detecting recovery opportunities…",
  ];

  useState(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setStep(idx);
      if (idx >= items.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 700);
    return () => clearInterval(interval);
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Radio className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-foreground text-center mb-2">First sync running…</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">Setting up your ongoing audit</p>

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
    </div>
  );
};

export default Onboarding;
