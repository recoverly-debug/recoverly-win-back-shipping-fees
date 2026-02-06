import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const invoices = [
  { date: "Jan 2025", amount: "$1,061.96", fee: "$265.49", status: "Paid" },
  { date: "Dec 2024", amount: "$892.40", fee: "$223.10", status: "Paid" },
  { date: "Nov 2024", amount: "$743.20", fee: "$185.80", status: "Paid" },
  { date: "Oct 2024", amount: "$1,204.50", fee: "$301.13", status: "Paid" },
];

const BillingTab = () => (
  <div className="space-y-6">
    <div className="rounded-lg border border-border bg-card p-6 card-accent-top space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Your Plan</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-extrabold text-primary money-glow">25%</span>
        <span className="text-muted-foreground">of recovered funds</span>
      </div>
      <p className="text-sm text-muted-foreground">
        We only charge when we successfully recover money for you. No hidden fees, no minimums.
      </p>
    </div>

    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Payment Method</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-surface-elevated flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Visa ending in 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2026</p>
          </div>
        </div>
        <Button variant="outline" size="sm">Update</Button>
      </div>
    </div>

    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Billing History</h3>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="label-caps">Period</TableHead>
              <TableHead className="label-caps text-right">Recovered</TableHead>
              <TableHead className="label-caps text-right">Fee</TableHead>
              <TableHead className="label-caps">Status</TableHead>
              <TableHead className="label-caps text-right">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.date} className="border-border hover:bg-surface-elevated/50">
                <TableCell className="text-foreground">{inv.date}</TableCell>
                <TableCell className="text-right text-foreground font-medium">{inv.amount}</TableCell>
                <TableCell className="text-right text-muted-foreground">{inv.fee}</TableCell>
                <TableCell>
                  <span className="text-sm text-primary">{inv.status}</span>
                </TableCell>
                <TableCell className="text-right">
                  <button className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
);

export default BillingTab;
