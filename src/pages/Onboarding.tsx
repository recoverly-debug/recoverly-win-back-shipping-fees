import { useState } from "react";
import { Package, Store, Loader2, CheckCircle2, ArrowRight, Sparkles, Search } from "lucide-react";
import Logo from "@/components/Logo";

type Step = "shipstation" | "shopify" | "scanning" | "results";

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

  const handleScan = () => {
    setStep("scanning");
    // Simulate scan delay
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <p className="text-sm text-muted-foreground mt-2">Let's connect your accounts and start recovering.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["shipstation", "shopify", "scanning", "results"] as Step[]).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full transition-colors ${
                step === s ? "bg-primary pulse-emerald" :
                (["shipstation", "shopify", "scanning", "results"].indexOf(step) > idx) ? "bg-primary" : "bg-border"
              }`} />
              {idx < 3 && <div className={`w-8 h-px ${
                (["shipstation", "shopify", "scanning", "results"].indexOf(step) > idx) ? "bg-primary" : "bg-border"
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
              We'll pull your shipments, labels, and tracking data to find recoverable issues.
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
              onClick={() => handleConnect("scanning")}
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

        {/* Step: Scanning */}
        {step === "scanning" && (
          <ScanningStep onComplete={() => setStep("results")} />
        )}

        {/* Step: Results */}
        {step === "results" && (
          <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Found $2,194.45 to recover!</h2>
            <p className="text-sm text-muted-foreground mb-1">10 issues across UPS, FedEx, and USPS</p>
            <p className="text-4xl font-bold text-primary money-glow my-4">$2,194.45</p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Overcharges</span><br /><span className="text-foreground font-bold">4 cases</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Late Deliveries</span><br /><span className="text-foreground font-bold">3 cases</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Lost Packages</span><br /><span className="text-foreground font-bold">1 case</span></div>
              <div className="p-3 rounded-lg bg-surface"><span className="text-muted-foreground">Damages</span><br /><span className="text-foreground font-bold">2 cases</span></div>
            </div>
            <a href="/agent" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium glow-hover transition-all flex items-center justify-center gap-2">
              Go to Agent Home <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Scanning animation sub-component
const ScanningStep = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("Analyzing shipments...");

  useState(() => {
    const phases = [
      "Analyzing shipments...",
      "Checking carrier invoices...",
      "Matching tracking events...",
      "Building evidence packets...",
      "Identifying recoverable issues...",
    ];
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(Math.min(p, 100));
      const phaseIdx = Math.min(Math.floor(p / 20), phases.length - 1);
      setPhase(phases[phaseIdx]);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 80);
    return () => clearInterval(interval);
  });

  return (
    <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in text-center">
      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Search className="h-7 w-7 text-primary animate-pulse" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">Scanning your data</h2>
      <p className="text-sm text-muted-foreground mb-6">{phase}</p>
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
        <div className="h-full bg-primary rounded-full transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{progress}%</p>
    </div>
  );
};

export default Onboarding;
