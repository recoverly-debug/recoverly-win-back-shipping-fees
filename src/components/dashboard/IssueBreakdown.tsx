import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const issues = [
  { label: "Late Deliveries", amount: 2140, percentage: 65 },
  { label: "Invalid Surcharges", amount: 847, percentage: 40 },
  { label: "Weight Overcharges", amount: 412, percentage: 20 },
];

const IssueBreakdown = () => {
  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Issue Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{issue.label}</span>
              <span className="font-semibold text-foreground">${issue.amount.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${issue.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default IssueBreakdown;
