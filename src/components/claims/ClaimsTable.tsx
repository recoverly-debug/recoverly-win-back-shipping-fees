import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Claim } from "@/lib/claims-data";
import { statusConfig } from "@/lib/claims-data";

interface ClaimsTableProps {
  claims: Claim[];
}

const ClaimsTable = ({ claims }: ClaimsTableProps) => (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          <TableHead className="label-caps">Tracking</TableHead>
          <TableHead className="label-caps">Carrier</TableHead>
          <TableHead className="label-caps">Issue</TableHead>
          <TableHead className="label-caps text-right">Amount</TableHead>
          <TableHead className="label-caps">Status</TableHead>
          <TableHead className="label-caps">Date</TableHead>
          <TableHead className="label-caps text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {claims.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
              No claims found.
            </TableCell>
          </TableRow>
        ) : (
          claims.map((claim) => {
            const config = statusConfig[claim.status];
            return (
              <TableRow
                key={claim.id}
                className="border-border hover:bg-surface-elevated/50 transition-colors"
              >
                <TableCell className="font-mono text-sm text-foreground">
                  {claim.tracking}
                </TableCell>
                <TableCell className="text-foreground">{claim.carrier}</TableCell>
                <TableCell className="text-muted-foreground">{claim.issue}</TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  ${claim.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${config.className} text-xs font-medium`}
                  >
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(claim.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    to={`/claims/${claim.id}`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    View
                  </Link>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  </div>
);

export default ClaimsTable;
