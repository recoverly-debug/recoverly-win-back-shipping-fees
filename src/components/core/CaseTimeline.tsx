import { Bot, User, Building2 } from "lucide-react";
import type { TimelineEvent } from "@/lib/case-data";

interface CaseTimelineProps {
  events: TimelineEvent[];
}

const actorConfig = {
  AGENT: { icon: Bot, label: "Agent", color: "text-agent-blue", bg: "bg-agent-blue/10", border: "border-agent-blue/30" },
  USER: { icon: User, label: "You", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  CARRIER: { icon: Building2, label: "Carrier", color: "text-amber", bg: "bg-amber/10", border: "border-amber/30" },
};

const CaseTimeline = ({ events }: CaseTimelineProps) => {
  // Find branch points
  const hasDenialBranch = events.some((e) => e.branch === "DENIAL");
  const hasAppealBranch = events.some((e) => e.branch === "APPEAL");

  return (
    <div className="relative">
      {events.map((event, idx) => {
        const actor = actorConfig[event.actor];
        const Icon = actor.icon;
        const isLast = idx === events.length - 1;
        const isBranch = event.branch === "DENIAL" || event.branch === "APPEAL";

        return (
          <div key={idx} className={`relative flex gap-4 ${!isLast ? "pb-6" : ""}`}>
            {/* Line */}
            {!isLast && (
              <div className={`absolute left-5 top-10 w-px h-full ${
                event.branch === "DENIAL" ? "bg-destructive/30" : event.branch === "APPEAL" ? "bg-amber/30" : "bg-border"
              }`} />
            )}

            {/* Icon */}
            <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${actor.bg} ${actor.border}`}>
              <Icon className={`h-4 w-4 ${actor.color}`} />
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isBranch ? "rounded-lg border border-border bg-surface/40 p-3" : ""}`}>
              {isBranch && (
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 ${
                  event.branch === "DENIAL" ? "bg-destructive/10 text-destructive" : "bg-amber/10 text-amber"
                }`}>
                  {event.branch === "DENIAL" ? "Denied" : "Appeal"}
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{event.event}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                  <p className={`text-xs ${actor.color}`}>{actor.label}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CaseTimeline;
