import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const carriers = [
  { name: "UPS", percentage: 92, amount: 1240, isGood: true },
  { name: "FedEx", percentage: 86, amount: 892, isGood: true },
  { name: "USPS", percentage: 71, amount: 456, isGood: false },
];

const CarrierPerformance = () => {
  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Carrier Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {carriers.map((carrier) => (
          <div key={carrier.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{carrier.name}</span>
              <div className="flex items-center gap-3">
                <span className={carrier.isGood ? "text-primary" : "text-coral"}>
                  {carrier.percentage}%
                </span>
                <span className="text-muted-foreground">
                  ${carrier.amount.toLocaleString()} recovered
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  carrier.isGood ? "bg-primary" : "bg-coral"
                }`}
                style={{ width: `${carrier.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CarrierPerformance;
