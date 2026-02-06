import { Check, Clock, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
  {
    icon: Check,
    iconClass: "text-primary bg-primary/10",
    title: "UPS refund deposited",
    amount: "+$42.50",
    amountClass: "text-primary",
    time: "2h ago",
  },
  {
    icon: Check,
    iconClass: "text-primary bg-primary/10",
    title: "FedEx claim approved",
    amount: "+$18.20",
    amountClass: "text-primary",
    time: "5h ago",
  },
  {
    icon: Clock,
    iconClass: "text-coral bg-coral/10",
    title: "USPS under review",
    amount: "$24.00",
    amountClass: "text-foreground",
    time: "1d ago",
  },
  {
    icon: Sparkles,
    iconClass: "text-primary bg-primary/10",
    title: "New issue detected",
    amount: "$31.40",
    amountClass: "text-foreground",
    time: "1d ago",
  },
];

const ActivityFeed = () => {
  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">Activity</CardTitle>
        <a href="#" className="text-sm text-primary hover:underline">View all activity</a>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.iconClass}`}>
              <activity.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
            <span className={`text-sm font-semibold ${activity.amountClass}`}>
              {activity.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
