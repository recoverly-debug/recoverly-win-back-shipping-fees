import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AppNav from "@/components/navigation/AppNav";
import { allCases, statusConfig, laneConfig, carrierConfig } from "@/lib/case-data";
import type { CaseStatus, CaseLane, CaseCarrier } from "@/lib/case-data";

const RecoveryReport = () => {
  const statusData = useMemo(() => {
    const grouped: Record<string, { status: string; total: number; count: number }> = {};
    allCases.forEach((c) => {
      if (!grouped[c.status]) grouped[c.status] = { status: statusConfig[c.status].label, total: 0, count: 0 };
      grouped[c.status].total += c.amount;
      grouped[c.status].count += 1;
    });
    return Object.values(grouped);
  }, []);

  const laneData = useMemo(() => {
    const grouped: Record<string, { name: string; value: number; count: number }> = {};
    allCases.forEach((c) => {
      if (!grouped[c.lane]) grouped[c.lane] = { name: laneConfig[c.lane].label, value: 0, count: 0 };
      grouped[c.lane].value += c.amount;
      grouped[c.lane].count += 1;
    });
    return Object.values(grouped);
  }, []);

  const carrierData = useMemo(() => {
    const grouped: Record<string, { name: string; total: number; approved: number; denied: number }> = {};
    allCases.forEach((c) => {
      if (!grouped[c.carrier]) grouped[c.carrier] = { name: carrierConfig[c.carrier].label, total: 0, approved: 0, denied: 0 };
      grouped[c.carrier].total += c.amount;
      if (["APPROVED", "PAID"].includes(c.status)) grouped[c.carrier].approved += c.amount;
      if (c.status === "DENIED") grouped[c.carrier].denied += c.amount;
    });
    return Object.values(grouped);
  }, []);

  const totalPipeline = allCases.reduce((s, c) => s + c.amount, 0);
  const totalApproved = allCases.filter((c) => ["APPROVED", "PAID"].includes(c.status)).reduce((s, c) => s + c.amount, 0);
  const totalDenied = allCases.filter((c) => c.status === "DENIED").reduce((s, c) => s + c.amount, 0);
  const denialReasons = allCases.filter((c) => c.status === "DENIED").map((c) => ({
    id: c.id,
    reason: c.timeline.find((e) => e.branch === "DENIAL")?.note || "No reason provided",
    amount: c.amount,
  }));

  const pieColors = ["hsl(160, 84%, 39%)", "hsl(38, 92%, 50%)", "hsl(217, 91%, 60%)", "hsl(0, 84%, 60%)"];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container px-4 py-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Recovery Report</h1>
          <p className="text-sm text-muted-foreground mt-1">Pipeline overview and performance metrics.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-xl border border-border bg-card text-center">
            <p className="label-caps mb-1">Pipeline</p>
            <p className="text-xl font-bold text-foreground">${totalPipeline.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl border border-primary/20 bg-card text-center">
            <p className="label-caps mb-1">Recovered</p>
            <p className="text-xl font-bold text-primary money-glow">${totalApproved.toFixed(2)}</p>
          </div>
          <div className="p-4 rounded-xl border border-destructive/20 bg-card text-center">
            <p className="label-caps mb-1">Denied</p>
            <p className="text-xl font-bold text-destructive">${totalDenied.toFixed(2)}</p>
          </div>
        </div>

        {/* Pipeline by Status */}
        <div className="p-4 rounded-xl border border-border bg-card mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 22%)" />
              <XAxis dataKey="status" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(215, 28%, 22%)", borderRadius: "0.5rem" }}
                labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                itemStyle={{ color: "hsl(160, 84%, 39%)" }}
              />
              <Bar dataKey="total" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown by Lane */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">By Recovery Lane</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={laneData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: $${value.toFixed(0)}`}>
                  {laneData.map((_, idx) => <Cell key={idx} fill={pieColors[idx % pieColors.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(215, 28%, 22%)", borderRadius: "0.5rem" }}
                  labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Carrier Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">By Carrier</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={carrierData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 28%, 22%)" />
                <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} width={60} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 17%)", border: "1px solid hsl(215, 28%, 22%)", borderRadius: "0.5rem" }} />
                <Bar dataKey="approved" stackId="a" fill="hsl(160, 84%, 39%)" radius={[0, 0, 0, 0]} name="Approved" />
                <Bar dataKey="denied" stackId="a" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} name="Denied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Denial Reasons */}
        {denialReasons.length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="text-sm font-semibold text-foreground mb-4">Denial Reasons</h3>
            <div className="space-y-3">
              {denialReasons.map((d) => (
                <div key={d.id} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <span className="text-xs font-mono text-muted-foreground">{d.id}</span>
                  <p className="text-sm text-foreground flex-1">{d.reason}</p>
                  <span className="text-sm font-semibold text-destructive">${d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecoveryReport;
