import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppNav from "@/components/navigation/AppNav";
import ClaimsFilterTabs from "@/components/claims/ClaimsFilterTabs";
import ClaimsStatsBar from "@/components/claims/ClaimsStatsBar";
import ClaimsTable from "@/components/claims/ClaimsTable";
import { claimsData, type ClaimStatus } from "@/lib/claims-data";

const ITEMS_PER_PAGE = 10;

const Claims = () => {
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");
  const [carrierFilter, setCarrierFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return claimsData.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (carrierFilter !== "all" && c.carrier !== carrierFilter) return false;
      if (search && !c.tracking.toLowerCase().includes(search.toLowerCase()) && !c.issue.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, carrierFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalRecovered = claimsData
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);

  const submittedCount = claimsData.filter((c) => c.status === "submitted").length;
  const needsEvidenceCount = claimsData.filter((c) => c.status === "detected").length;

  // Reset to page 1 when filters change
  const handleStatusChange = (val: ClaimStatus | "all") => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleCarrierChange = (val: string) => {
    setCarrierFilter(val);
    setPage(1);
  };
  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <main className="container px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">Claims</h1>
          <ClaimsStatsBar
            total={claimsData.length}
            recovered={Math.round(totalRecovered)}
            submitted={submittedCount}
            needsEvidence={needsEvidenceCount}
          />
        </div>

        <ClaimsFilterTabs active={statusFilter} onChange={handleStatusChange} />

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracking or issue…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={carrierFilter} onValueChange={handleCarrierChange}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border">
              <SelectValue placeholder="Carrier" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Carriers</SelectItem>
              <SelectItem value="UPS">UPS</SelectItem>
              <SelectItem value="FedEx">FedEx</SelectItem>
              <SelectItem value="USPS">USPS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ClaimsTable claims={paginated} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm rounded-md bg-surface text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  page === i + 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm rounded-md bg-surface text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Claims;
