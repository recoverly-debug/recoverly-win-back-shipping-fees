import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generateMockData = () => {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  return months.map((month, index) => ({
    month,
    recovered: 1200 + Math.random() * 2000 + index * 400,
  }));
};

const RecoveryChart = () => {
  const data = useMemo(() => generateMockData(), []);

  return (
    <Card className="bg-card border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recovery Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172, 100%, 45%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(172, 100%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 6%, 20%)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(240, 5%, 55%)", fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(240, 10%, 10%)",
                  border: "1px solid hsl(240, 6%, 20%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "hsl(0, 0%, 100%)" }}
                itemStyle={{ color: "hsl(172, 100%, 45%)" }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Recovered"]}
              />
              <Area
                type="monotone"
                dataKey="recovered"
                stroke="hsl(172, 100%, 45%)"
                strokeWidth={2}
                fill="url(#colorRecovered)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecoveryChart;
