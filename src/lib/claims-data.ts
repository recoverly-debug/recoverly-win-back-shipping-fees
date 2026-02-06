export type ClaimStatus = "detected" | "filed" | "approved" | "denied";

export interface Claim {
  id: string;
  tracking: string;
  carrier: "UPS" | "FedEx" | "USPS";
  issue: string;
  amount: number;
  status: ClaimStatus;
  date: string;
}

export const claimsData: Claim[] = [
  { id: "CLM-001", tracking: "1Z999AA10123456784", carrier: "UPS", issue: "Late Delivery", amount: 42.5, status: "approved", date: "2025-01-28" },
  { id: "CLM-002", tracking: "9400111899223100001", carrier: "USPS", issue: "Weight Overcharge", amount: 24.0, status: "filed", date: "2025-01-27" },
  { id: "CLM-003", tracking: "794644790132", carrier: "FedEx", issue: "Invalid Surcharge", amount: 18.2, status: "approved", date: "2025-01-26" },
  { id: "CLM-004", tracking: "1Z999AA10123456785", carrier: "UPS", issue: "Duplicate Charge", amount: 31.4, status: "detected", date: "2025-01-26" },
  { id: "CLM-005", tracking: "794644790133", carrier: "FedEx", issue: "DIM Weight Error", amount: 56.8, status: "approved", date: "2025-01-25" },
  { id: "CLM-006", tracking: "9400111899223100002", carrier: "USPS", issue: "Late Delivery", amount: 12.75, status: "denied", date: "2025-01-24" },
  { id: "CLM-007", tracking: "1Z999AA10123456786", carrier: "UPS", issue: "Billing Mistake", amount: 89.0, status: "approved", date: "2025-01-23" },
  { id: "CLM-008", tracking: "794644790134", carrier: "FedEx", issue: "Late Delivery", amount: 37.5, status: "filed", date: "2025-01-22" },
  { id: "CLM-009", tracking: "1Z999AA10123456787", carrier: "UPS", issue: "Weight Overcharge", amount: 15.6, status: "detected", date: "2025-01-21" },
  { id: "CLM-010", tracking: "9400111899223100003", carrier: "USPS", issue: "Invalid Surcharge", amount: 22.3, status: "approved", date: "2025-01-20" },
  { id: "CLM-011", tracking: "794644790135", carrier: "FedEx", issue: "Duplicate Charge", amount: 44.9, status: "filed", date: "2025-01-19" },
  { id: "CLM-012", tracking: "1Z999AA10123456788", carrier: "UPS", issue: "Late Delivery", amount: 28.0, status: "approved", date: "2025-01-18" },
  { id: "CLM-013", tracking: "9400111899223100004", carrier: "USPS", issue: "DIM Weight Error", amount: 63.2, status: "detected", date: "2025-01-17" },
  { id: "CLM-014", tracking: "794644790136", carrier: "FedEx", issue: "Billing Mistake", amount: 19.4, status: "denied", date: "2025-01-16" },
  { id: "CLM-015", tracking: "1Z999AA10123456789", carrier: "UPS", issue: "Late Delivery", amount: 34.75, status: "approved", date: "2025-01-15" },
  { id: "CLM-016", tracking: "794644790137", carrier: "FedEx", issue: "Weight Overcharge", amount: 41.0, status: "filed", date: "2025-01-14" },
  { id: "CLM-017", tracking: "9400111899223100005", carrier: "USPS", issue: "Invalid Surcharge", amount: 8.5, status: "approved", date: "2025-01-13" },
  { id: "CLM-018", tracking: "1Z999AA10123456790", carrier: "UPS", issue: "Duplicate Charge", amount: 52.3, status: "detected", date: "2025-01-12" },
  { id: "CLM-019", tracking: "794644790138", carrier: "FedEx", issue: "Late Delivery", amount: 27.6, status: "approved", date: "2025-01-11" },
  { id: "CLM-020", tracking: "9400111899223100006", carrier: "USPS", issue: "Billing Mistake", amount: 33.9, status: "filed", date: "2025-01-10" },
];

export const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  detected: { label: "Detected", className: "border-primary text-primary bg-transparent" },
  filed: { label: "Filed", className: "bg-coral text-primary-foreground border-transparent" },
  approved: { label: "Approved", className: "bg-primary text-primary-foreground border-transparent" },
  denied: { label: "Denied", className: "border-destructive text-destructive bg-transparent" },
};
