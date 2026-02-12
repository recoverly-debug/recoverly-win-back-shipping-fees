// Case Data Model + Demo Data for Recoverly

export type CaseLane = "OVERCHARGE" | "LATE_DELIVERY" | "LOST" | "DAMAGE";
export type CaseCarrier = "UPS" | "FEDEX" | "USPS" | "OTHER";
export type CaseStatus =
  | "FOUND"
  | "NEEDS_EVIDENCE"
  | "READY"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "DENIED"
  | "APPEALED"
  | "PAID";

export type ConfidenceLabel = "HIGH" | "MEDIUM" | "LOW";
export type TimelineActor = "AGENT" | "USER" | "CARRIER";
export type TimelineBranch = "DENIAL" | "APPEAL";

export type EvidenceType =
  | "SHIPSTATION_LABEL"
  | "SHIPSTATION_SHIPMENT"
  | "TRACKING_EVENTS"
  | "CARRIER_INVOICE_LINE"
  | "UPLOADED_PDF"
  | "PHOTOS"
  | "ADJUSTMENT_LINE"
  | "PROMISED_DELIVERY_SOURCE";

export type EvidenceSource = "SHIPSTATION" | "CARRIER_INVOICE" | "UPLOAD";

export interface TimelineEvent {
  ts: string;
  event: string;
  note: string;
  actor: TimelineActor;
  branch?: TimelineBranch;
}

export interface Evidence {
  type: EvidenceType;
  source: EvidenceSource;
  file_ref?: string;
  summary: string;
}

export interface ShopifyOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  created_at: string;
}

export interface ShipStationShipment {
  shipment_id: string;
  order_number: string;
  carrier: string;
  service: string;
  tracking_number: string;
  ship_date: string;
  weight_oz: number;
  dimensions: { l: number; w: number; h: number };
  shipping_cost: number;
  billed_weight_oz?: number;
  billed_dimensions?: { l: number; w: number; h: number };
}

export interface Case {
  id: string;
  lane: CaseLane;
  carrier: CaseCarrier;
  service: string;
  amount: number;
  deadline: string;
  status: CaseStatus;
  confidence_label: ConfidenceLabel;
  confidence_reason: string;
  submission_route: "SHIPSTATION_CLAIM_FLOW";
  tracking_number: string;
  shopify_order: ShopifyOrder;
  shipstation_shipment: ShipStationShipment;
  timeline: TimelineEvent[];
  evidence: Evidence[];
  created_at: string;
}

// Status configuration
export const statusConfig: Record<CaseStatus, { label: string; color: string; bgColor: string; glowClass?: string }> = {
  FOUND: { label: "Found", color: "text-info", bgColor: "bg-info/10" },
  NEEDS_EVIDENCE: { label: "Needs Evidence", color: "text-warning", bgColor: "bg-warning/10", glowClass: "shadow-glow-amber" },
  READY: { label: "Ready", color: "text-primary", bgColor: "bg-primary/10" },
  SUBMITTED: { label: "Submitted", color: "text-info", bgColor: "bg-info/10", glowClass: "shadow-glow-blue" },
  UNDER_REVIEW: { label: "Under Review", color: "text-warning", bgColor: "bg-warning/10" },
  APPROVED: { label: "Approved", color: "text-primary", bgColor: "bg-primary/10", glowClass: "shadow-glow-sm" },
  DENIED: { label: "Denied", color: "text-destructive", bgColor: "bg-destructive/10", glowClass: "shadow-glow-red" },
  APPEALED: { label: "Appealed", color: "text-warning", bgColor: "bg-warning/10" },
  PAID: { label: "Paid", color: "text-primary", bgColor: "bg-primary/10", glowClass: "shadow-glow-md" },
};

export const laneConfig: Record<CaseLane, { label: string; icon: string; color: string }> = {
  OVERCHARGE: { label: "Overcharge", icon: "receipt", color: "text-warning" },
  LATE_DELIVERY: { label: "Late Delivery", icon: "clock", color: "text-info" },
  LOST: { label: "Lost in Transit", icon: "package-x", color: "text-destructive" },
  DAMAGE: { label: "Damage", icon: "alert-triangle", color: "text-destructive" },
};

export const carrierConfig: Record<CaseCarrier, { label: string; color: string }> = {
  UPS: { label: "UPS", color: "text-warning" },
  FEDEX: { label: "FedEx", color: "text-info" },
  USPS: { label: "USPS", color: "text-primary" },
  OTHER: { label: "Other", color: "text-muted-foreground" },
};

// === DEMO DATA ===

// Case 1: Late Delivery (GSR) — Full lifecycle READY → SUBMITTED → PAID
export const case1_lateDelivery: Case = {
  id: "RC-1001",
  lane: "LATE_DELIVERY",
  carrier: "UPS",
  service: "UPS Ground",
  amount: 247.50,
  deadline: "2026-03-10",
  status: "PAID",
  confidence_label: "HIGH",
  confidence_reason: "High — label + service + promised ETA + delivery timestamp present.",
  submission_route: "SHIPSTATION_CLAIM_FLOW",
  tracking_number: "1Z999AA10123456784",
  shopify_order: {
    id: "shop-5001",
    order_number: "#5001",
    customer_name: "Sarah Chen",
    total: 189.99,
    items: [
      { name: "Wireless Headphones Pro", qty: 1, price: 149.99 },
      { name: "USB-C Cable 6ft", qty: 2, price: 19.99 },
    ],
    created_at: "2026-01-28T10:30:00Z",
  },
  shipstation_shipment: {
    shipment_id: "SH-2847",
    order_number: "#5001",
    carrier: "UPS",
    service: "UPS Ground",
    tracking_number: "1Z999AA10123456784",
    ship_date: "2026-01-29",
    weight_oz: 24,
    dimensions: { l: 12, w: 8, h: 4 },
    shipping_cost: 247.50,
  },
  timeline: [
    { ts: "2026-02-04T09:00:00Z", event: "Issue detected", note: "Delivery 2 days late — service guarantee violated.", actor: "AGENT" },
    { ts: "2026-02-04T09:01:00Z", event: "Evidence collected", note: "ShipStation shipment, tracking events, and promised delivery date gathered.", actor: "AGENT" },
    { ts: "2026-02-04T14:20:00Z", event: "Approved by user", note: "User approved filing.", actor: "USER" },
    { ts: "2026-02-04T14:21:00Z", event: "Claim submitted", note: "Submitted via ShipStation claim flow.", actor: "AGENT" },
    { ts: "2026-02-07T11:00:00Z", event: "Carrier reviewing", note: "UPS acknowledged receipt of claim.", actor: "CARRIER" },
    { ts: "2026-02-09T16:30:00Z", event: "Claim approved", note: "UPS approved full refund of $247.50.", actor: "CARRIER" },
    { ts: "2026-02-10T09:00:00Z", event: "Refund deposited", note: "$247.50 credited to account.", actor: "CARRIER" },
  ],
  evidence: [
    { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "ShipStation shipment SH-2847 — UPS Ground, shipped 1/29." },
    { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "14 tracking events. Promised delivery: 2/2. Actual delivery: 2/4." },
    { type: "PROMISED_DELIVERY_SOURCE", source: "SHIPSTATION", summary: "UPS guaranteed delivery by 2/2 per service commitment." },
    { type: "SHIPSTATION_LABEL", source: "SHIPSTATION", file_ref: "label-SH2847.pdf", summary: "Shipping label with service level confirmation." },
  ],
  created_at: "2026-02-04T09:00:00Z",
};

// Case 2: FedEx Overcharge (DIM adjustment) — FOUND → READY
export const case2_overcharge: Case = {
  id: "RC-1002",
  lane: "OVERCHARGE",
  carrier: "FEDEX",
  service: "FedEx Home Delivery",
  amount: 186.40,
  deadline: "2026-02-28",
  status: "READY",
  confidence_label: "HIGH",
  confidence_reason: "High — billed dims exceed actual label dims by 40%, invoice line item confirms overcharge.",
  submission_route: "SHIPSTATION_CLAIM_FLOW",
  tracking_number: "794644790132",
  shopify_order: {
    id: "shop-5042",
    order_number: "#5042",
    customer_name: "Mike Torres",
    total: 67.50,
    items: [{ name: "Ceramic Mug Set (4-pack)", qty: 1, price: 54.99 }],
    created_at: "2026-02-01T14:15:00Z",
  },
  shipstation_shipment: {
    shipment_id: "SH-2912",
    order_number: "#5042",
    carrier: "FedEx",
    service: "FedEx Home Delivery",
    tracking_number: "794644790132",
    ship_date: "2026-02-02",
    weight_oz: 96,
    dimensions: { l: 14, w: 10, h: 8 },
    shipping_cost: 24.80,
    billed_weight_oz: 128,
    billed_dimensions: { l: 18, w: 14, h: 10 },
  },
  timeline: [
    { ts: "2026-02-08T07:30:00Z", event: "Issue detected", note: "Billed dims 18×14×10 exceed label dims 14×10×8. Overcharge of $186.40.", actor: "AGENT" },
    { ts: "2026-02-08T07:31:00Z", event: "Evidence collected", note: "Label, shipment, and carrier invoice line gathered.", actor: "AGENT" },
    { ts: "2026-02-08T12:00:00Z", event: "Case ready", note: "All evidence complete. Awaiting approval.", actor: "AGENT" },
  ],
  evidence: [
    { type: "SHIPSTATION_LABEL", source: "SHIPSTATION", file_ref: "label-SH2912.pdf", summary: "Label shows 14×10×8 in, 6 lbs." },
    { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "ShipStation shipment SH-2912 — FedEx Home Delivery." },
    { type: "CARRIER_INVOICE_LINE", source: "CARRIER_INVOICE", file_ref: "fedex-inv-feb.pdf", summary: "Invoice billed 18×14×10 in, 8 lbs. $186.40 overcharge." },
    { type: "ADJUSTMENT_LINE", source: "SHIPSTATION", summary: "ShipStation adjustment: +$186.40 DIM weight correction." },
  ],
  created_at: "2026-02-08T07:30:00Z",
};

// Case 3: Damage (photos missing) — NEEDS_EVIDENCE
export const case3_damage: Case = {
  id: "RC-1003",
  lane: "DAMAGE",
  carrier: "USPS",
  service: "USPS Priority Mail",
  amount: 312.40,
  deadline: "2026-02-17",
  status: "NEEDS_EVIDENCE",
  confidence_label: "LOW",
  confidence_reason: "Low — 3 of 4 core evidence items present. Missing: damage photos from customer.",
  submission_route: "SHIPSTATION_CLAIM_FLOW",
  tracking_number: "9400111899223100012345",
  shopify_order: {
    id: "shop-5078",
    order_number: "#5078",
    customer_name: "Jessica Park",
    total: 124.00,
    items: [
      { name: "Artisan Pour-Over Set", qty: 1, price: 89.00 },
      { name: "Coffee Beans 12oz", qty: 1, price: 22.00 },
    ],
    created_at: "2026-02-05T09:45:00Z",
  },
  shipstation_shipment: {
    shipment_id: "SH-3001",
    order_number: "#5078",
    carrier: "USPS",
    service: "USPS Priority Mail",
    tracking_number: "9400111899223100012345",
    ship_date: "2026-02-06",
    weight_oz: 48,
    dimensions: { l: 16, w: 12, h: 6 },
    shipping_cost: 31.40,
  },
  timeline: [
    { ts: "2026-02-08T10:00:00Z", event: "Issue detected", note: "Customer reported item arrived damaged.", actor: "USER" },
    { ts: "2026-02-08T10:05:00Z", event: "Evidence collection started", note: "ShipStation shipment gathered. Photos needed from customer.", actor: "AGENT" },
    { ts: "2026-02-08T10:06:00Z", event: "Evidence requested", note: "Waiting for customer to provide damage photos.", actor: "AGENT" },
  ],
  evidence: [
    { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "ShipStation shipment SH-3001 — USPS Priority Mail." },
    { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "Delivered 2/9. Customer reported damage 2/10." },
    { type: "SHIPSTATION_LABEL", source: "SHIPSTATION", file_ref: "label-SH3001.pdf", summary: "Label with packaging specs." },
  ],
  created_at: "2026-02-08T10:00:00Z",
};

// Additional cases for ActivityCard feed
const additionalCases: Case[] = [
  {
    id: "RC-1004", lane: "OVERCHARGE", carrier: "UPS", service: "UPS 2nd Day Air",
    amount: 124.00, deadline: "2026-02-16", status: "UNDER_REVIEW",
    confidence_label: "MEDIUM", confidence_reason: "Medium — 2 of 4 core evidence items present. Missing: carrier invoice line item.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "1Z999AA10234567891",
    shopify_order: { id: "shop-5090", order_number: "#5090", customer_name: "David Kim", total: 245.00, items: [{ name: "Smart Watch Band", qty: 3, price: 29.99 }], created_at: "2026-02-03T11:00:00Z" },
    shipstation_shipment: { shipment_id: "SH-3015", order_number: "#5090", carrier: "UPS", service: "UPS 2nd Day Air", tracking_number: "1Z999AA10234567891", ship_date: "2026-02-04", weight_oz: 12, dimensions: { l: 8, w: 6, h: 3 }, shipping_cost: 34.00 },
    timeline: [
      { ts: "2026-02-06T08:00:00Z", event: "Issue detected", note: "Invalid residential surcharge on commercial address.", actor: "AGENT" },
      { ts: "2026-02-06T14:00:00Z", event: "Claim submitted", note: "Submitted via ShipStation claim flow.", actor: "AGENT" },
      { ts: "2026-02-09T10:00:00Z", event: "Under review", note: "UPS reviewing claim.", actor: "CARRIER" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3015 — UPS 2nd Day Air." },
      { type: "CARRIER_INVOICE_LINE", source: "CARRIER_INVOICE", summary: "Residential surcharge $124.00 on commercial address." },
    ],
    created_at: "2026-02-06T08:00:00Z",
  },
  {
    id: "RC-1005", lane: "LOST", carrier: "FEDEX", service: "FedEx Ground",
    amount: 456.00, deadline: "2026-03-05", status: "SUBMITTED",
    confidence_label: "HIGH", confidence_reason: "High — tracking stalled 16 days, no scan updates, all evidence present.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "794644790245",
    shopify_order: { id: "shop-5102", order_number: "#5102", customer_name: "Amanda Lee", total: 312.00, items: [{ name: "Yoga Mat Premium", qty: 2, price: 79.00 }], created_at: "2026-01-25T16:00:00Z" },
    shipstation_shipment: { shipment_id: "SH-3022", order_number: "#5102", carrier: "FedEx", service: "FedEx Ground", tracking_number: "794644790245", ship_date: "2026-01-26", weight_oz: 80, dimensions: { l: 36, w: 6, h: 6 }, shipping_cost: 28.50 },
    timeline: [
      { ts: "2026-02-05T07:00:00Z", event: "Issue detected", note: "Tracking stalled since 1/30. 16 days with no update.", actor: "AGENT" },
      { ts: "2026-02-05T15:00:00Z", event: "Claim submitted", note: "Submitted for lost package claim.", actor: "AGENT" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3022 — FedEx Ground, 36×6×6." },
      { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "Last scan: 1/30 at Memphis hub. No updates since." },
    ],
    created_at: "2026-02-05T07:00:00Z",
  },
  {
    id: "RC-1006", lane: "LATE_DELIVERY", carrier: "FEDEX", service: "FedEx Express Saver",
    amount: 238.75, deadline: "2026-02-14", status: "FOUND",
    confidence_label: "HIGH", confidence_reason: "High — delivered 1 day late, express service guarantee applies, all evidence present.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "794644790358",
    shopify_order: { id: "shop-5115", order_number: "#5115", customer_name: "Robert Chang", total: 445.00, items: [{ name: "Bluetooth Speaker", qty: 1, price: 199.00 }], created_at: "2026-02-06T08:30:00Z" },
    shipstation_shipment: { shipment_id: "SH-3038", order_number: "#5115", carrier: "FedEx", service: "FedEx Express Saver", tracking_number: "794644790358", ship_date: "2026-02-07", weight_oz: 40, dimensions: { l: 10, w: 8, h: 6 }, shipping_cost: 238.75 },
    timeline: [
      { ts: "2026-02-09T06:00:00Z", event: "Issue detected", note: "Delivered 1 day after express guaranteed date.", actor: "AGENT" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3038 — FedEx Express Saver." },
      { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "Promised: 2/10. Delivered: 2/11." },
      { type: "PROMISED_DELIVERY_SOURCE", source: "SHIPSTATION", summary: "FedEx Express Saver 3-day guarantee." },
    ],
    created_at: "2026-02-09T06:00:00Z",
  },
  {
    id: "RC-1007", lane: "OVERCHARGE", carrier: "USPS", service: "USPS Priority Mail",
    amount: 108.60, deadline: "2026-02-28",  status: "APPROVED",
    confidence_label: "HIGH", confidence_reason: "High — duplicate charge confirmed by carrier invoice, all evidence present.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "9400111899223100067890",
    shopify_order: { id: "shop-5128", order_number: "#5128", customer_name: "Emily Watson", total: 56.00, items: [{ name: "Scented Candle Set", qty: 1, price: 42.00 }], created_at: "2026-02-04T12:00:00Z" },
    shipstation_shipment: { shipment_id: "SH-3045", order_number: "#5128", carrier: "USPS", service: "USPS Priority Mail", tracking_number: "9400111899223100067890", ship_date: "2026-02-05", weight_oz: 32, dimensions: { l: 10, w: 8, h: 4 }, shipping_cost: 12.80 },
    timeline: [
      { ts: "2026-02-07T08:00:00Z", event: "Issue detected", note: "Duplicate handling fee detected.", actor: "AGENT" },
      { ts: "2026-02-07T16:00:00Z", event: "Claim submitted", note: "Submitted via ShipStation claim flow.", actor: "AGENT" },
      { ts: "2026-02-09T09:00:00Z", event: "Claim approved", note: "USPS confirmed duplicate charge, refund approved.", actor: "CARRIER" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3045 — USPS Priority Mail." },
      { type: "CARRIER_INVOICE_LINE", source: "CARRIER_INVOICE", summary: "Duplicate handling fee: $108.60." },
    ],
    created_at: "2026-02-07T08:00:00Z",
  },
  {
    id: "RC-1008", lane: "DAMAGE", carrier: "UPS", service: "UPS Ground",
    amount: 267.00, deadline: "2026-02-12", status: "READY",
    confidence_label: "MEDIUM", confidence_reason: "Medium — 3 of 4 core evidence items present, packaging photo would strengthen case.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "1Z999AA10345678902",
    shopify_order: { id: "shop-5145", order_number: "#5145", customer_name: "Lisa Nguyen", total: 198.00, items: [{ name: "Glass Vase Collection", qty: 1, price: 165.00 }], created_at: "2026-02-08T15:20:00Z" },
    shipstation_shipment: { shipment_id: "SH-3058", order_number: "#5145", carrier: "UPS", service: "UPS Ground", tracking_number: "1Z999AA10345678902", ship_date: "2026-02-09", weight_oz: 64, dimensions: { l: 14, w: 14, h: 12 }, shipping_cost: 18.50 },
    timeline: [
      { ts: "2026-02-09T11:00:00Z", event: "Issue detected", note: "Customer reported damaged glassware.", actor: "USER" },
      { ts: "2026-02-09T11:30:00Z", event: "Photos received", note: "3 damage photos received from customer.", actor: "USER" },
      { ts: "2026-02-09T12:00:00Z", event: "Case ready", note: "Evidence sufficient for filing.", actor: "AGENT" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3058 — UPS Ground." },
      { type: "PHOTOS", source: "UPLOAD", file_ref: "damage-photos-5145.zip", summary: "3 photos: broken vase, cracked bowl, damaged packaging." },
      { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "Delivered 2/9. Damage reported same day." },
    ],
    created_at: "2026-02-09T11:00:00Z",
  },
  {
    id: "RC-1009", lane: "OVERCHARGE", carrier: "FEDEX", service: "FedEx Ground",
    amount: 112.30, deadline: "2026-02-11", status: "DENIED",
    confidence_label: "MEDIUM", confidence_reason: "Medium — carrier disputes dims measurement, appeal in progress.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "794644790471",
    shopify_order: { id: "shop-5160", order_number: "#5160", customer_name: "James Wilson", total: 89.00, items: [{ name: "Phone Case Premium", qty: 4, price: 19.99 }], created_at: "2026-02-02T10:00:00Z" },
    shipstation_shipment: { shipment_id: "SH-3070", order_number: "#5160", carrier: "FedEx", service: "FedEx Ground", tracking_number: "794644790471", ship_date: "2026-02-03", weight_oz: 16, dimensions: { l: 10, w: 8, h: 4 }, shipping_cost: 14.50 },
    timeline: [
      { ts: "2026-02-05T09:00:00Z", event: "Issue detected", note: "DIM overcharge of $112.30.", actor: "AGENT" },
      { ts: "2026-02-05T15:00:00Z", event: "Claim submitted", note: "Submitted via ShipStation claim flow.", actor: "AGENT" },
      { ts: "2026-02-08T10:00:00Z", event: "Claim denied", note: "FedEx: dims confirmed via re-weigh audit.", actor: "CARRIER", branch: "DENIAL" },
      { ts: "2026-02-08T14:00:00Z", event: "Appeal submitted", note: "Appealing with photo evidence of package dims.", actor: "AGENT", branch: "APPEAL" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3070 — FedEx Ground." },
      { type: "CARRIER_INVOICE_LINE", source: "CARRIER_INVOICE", summary: "Billed dims 14×10×6 vs label 10×8×4." },
      { type: "UPLOADED_PDF", source: "UPLOAD", file_ref: "dims-photo-evidence.pdf", summary: "Photo of actual package with measuring tape." },
    ],
    created_at: "2026-02-05T09:00:00Z",
  },
  {
    id: "RC-1010", lane: "LATE_DELIVERY", carrier: "UPS", service: "UPS Next Day Air",
    amount: 389.00, deadline: "2026-02-15", status: "FOUND",
    confidence_label: "HIGH", confidence_reason: "High — Next Day Air delivered 3 days late, clear guarantee violation, all evidence present.",
    submission_route: "SHIPSTATION_CLAIM_FLOW", tracking_number: "1Z999AA10456789013",
    shopify_order: { id: "shop-5175", order_number: "#5175", customer_name: "Chris Martinez", total: 520.00, items: [{ name: "Drone Pro Kit", qty: 1, price: 499.00 }], created_at: "2026-02-09T09:00:00Z" },
    shipstation_shipment: { shipment_id: "SH-3085", order_number: "#5175", carrier: "UPS", service: "UPS Next Day Air", tracking_number: "1Z999AA10456789013", ship_date: "2026-02-10", weight_oz: 56, dimensions: { l: 18, w: 14, h: 8 }, shipping_cost: 389.00 },
    timeline: [
      { ts: "2026-02-10T07:00:00Z", event: "Issue detected", note: "Next Day Air delivered 3 days late.", actor: "AGENT" },
    ],
    evidence: [
      { type: "SHIPSTATION_SHIPMENT", source: "SHIPSTATION", summary: "Shipment SH-3085 — UPS Next Day Air, $389.00." },
      { type: "TRACKING_EVENTS", source: "SHIPSTATION", summary: "Promised: 2/11. Delivered: 2/14." },
      { type: "PROMISED_DELIVERY_SOURCE", source: "SHIPSTATION", summary: "UPS Next Day Air guarantee." },
    ],
    created_at: "2026-02-10T07:00:00Z",
  },
];

export const allCases: Case[] = [
  case1_lateDelivery,
  case2_overcharge,
  case3_damage,
  ...additionalCases,
];

// Helpers
export function getCaseById(id: string): Case | undefined {
  return allCases.find((c) => c.id === id);
}

export function getCasesByStatus(status: CaseStatus): Case[] {
  return allCases.filter((c) => c.status === status);
}

export function getCasesByLane(lane: CaseLane): Case[] {
  return allCases.filter((c) => c.lane === lane);
}

export function getTotalRecovery(): number {
  return allCases.filter((c) => ["APPROVED", "PAID"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
}

export function getPipelineTotal(): number {
  return allCases.filter((c) => !["PAID"].includes(c.status)).reduce((sum, c) => sum + c.amount, 0);
}

export function getReadyCases(): Case[] {
  return allCases.filter((c) => ["FOUND", "READY"].includes(c.status));
}

export function getNeedsAttentionCases(): Case[] {
  return allCases.filter((c) => ["NEEDS_EVIDENCE", "DENIED"].includes(c.status));
}

export function getFoundCases(): Case[] {
  return allCases.filter((c) => c.status === "FOUND");
}

export function getFoundTotal(): number {
  return getFoundCases().reduce((sum, c) => sum + c.amount, 0);
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
