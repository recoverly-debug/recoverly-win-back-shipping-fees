// Enriched claim detail data for /claims/:id pages

export interface ClaimShipment {
  shipment_id: string;
  carrier: string;
  service: string;
  tracking: string;
  ship_date: string;
  delivery_date: string | null;
  weight_oz: number;
  dimensions: { l: number; w: number; h: number };
  shipping_cost: number;
  billed_weight_oz?: number;
  billed_dimensions?: { l: number; w: number; h: number };
  origin: string;
  destination: string;
}

export interface ClaimOrder {
  order_number: string;
  customer_name: string;
  total: number;
  items: { name: string; qty: number; price: number }[];
  created_at: string;
}

export interface ClaimTimelineEvent {
  ts: string;
  event: string;
  note: string;
  actor: "AGENT" | "USER" | "CARRIER";
}

export interface ClaimDocument {
  id: string;
  name: string;
  type: "label" | "invoice" | "tracking_log" | "photo" | "pdf";
  source: string;
  size: string;
  date: string;
}

export interface ClaimDetail {
  id: string;
  tracking: string;
  carrier: "UPS" | "FedEx" | "USPS";
  issue: string;
  issue_description: string;
  amount: number;
  status: "detected" | "submitted" | "approved" | "denied";
  date: string;
  shipment: ClaimShipment;
  order: ClaimOrder;
  timeline: ClaimTimelineEvent[];
  documents: ClaimDocument[];
}

export const claimDetails: Record<string, ClaimDetail> = {
  "CLM-001": {
    id: "CLM-001",
    tracking: "1Z999AA10123456784",
    carrier: "UPS",
    issue: "Late Delivery",
    issue_description: "Package delivered 2 days after UPS Ground guaranteed delivery date. Service guarantee (GSR) applies — full refund of shipping cost eligible.",
    amount: 42.5,
    status: "approved",
    date: "2025-01-28",
    shipment: {
      shipment_id: "SH-4201",
      carrier: "UPS",
      service: "UPS Ground",
      tracking: "1Z999AA10123456784",
      ship_date: "2025-01-22",
      delivery_date: "2025-01-28",
      weight_oz: 24,
      dimensions: { l: 12, w: 8, h: 4 },
      shipping_cost: 42.5,
      origin: "Los Angeles, CA 90012",
      destination: "Portland, OR 97201",
    },
    order: {
      order_number: "#6201",
      customer_name: "Sarah Chen",
      total: 189.99,
      items: [
        { name: "Wireless Headphones Pro", qty: 1, price: 149.99 },
        { name: "USB-C Cable 6ft", qty: 2, price: 19.99 },
      ],
      created_at: "2025-01-21T10:30:00Z",
    },
    timeline: [
      { ts: "2025-01-22T09:00:00Z", event: "Shipped", note: "Package picked up by UPS. Label created via ShipStation.", actor: "AGENT" },
      { ts: "2025-01-24T14:00:00Z", event: "In Transit", note: "Package scanned at UPS facility, Phoenix, AZ.", actor: "CARRIER" },
      { ts: "2025-01-26T08:00:00Z", event: "Guaranteed date passed", note: "UPS Ground guaranteed delivery by 1/26. Package still in transit.", actor: "AGENT" },
      { ts: "2025-01-28T11:30:00Z", event: "Delivered", note: "Delivered 2 days late. Left at front door.", actor: "CARRIER" },
      { ts: "2025-01-28T12:00:00Z", event: "Late delivery detected", note: "Agent detected GSR violation — $42.50 refund eligible.", actor: "AGENT" },
      { ts: "2025-01-28T14:00:00Z", event: "Claim submitted", note: "Submitted via ShipStation claim flow.", actor: "AGENT" },
      { ts: "2025-01-30T09:00:00Z", event: "Claim approved", note: "UPS approved full refund of $42.50.", actor: "CARRIER" },
    ],
    documents: [
      { id: "doc-1", name: "Shipping Label", type: "label", source: "ShipStation", size: "124 KB", date: "2025-01-22" },
      { id: "doc-2", name: "Tracking Event Log", type: "tracking_log", source: "UPS", size: "8 KB", date: "2025-01-28" },
      { id: "doc-3", name: "Service Guarantee Proof", type: "pdf", source: "UPS", size: "45 KB", date: "2025-01-28" },
    ],
  },
  "CLM-002": {
    id: "CLM-002",
    tracking: "94001118992231000012",
    carrier: "USPS",
    issue: "Weight Overcharge",
    issue_description: "Billed weight exceeds actual package weight by 12 oz. USPS charged based on 3 lbs instead of actual 2.25 lbs, resulting in $24.00 overcharge.",
    amount: 24.0,
    status: "submitted",
    date: "2025-01-27",
    shipment: {
      shipment_id: "SH-4215",
      carrier: "USPS",
      service: "USPS Priority Mail",
      tracking: "94001118992231000012",
      ship_date: "2025-01-24",
      delivery_date: "2025-01-27",
      weight_oz: 36,
      dimensions: { l: 10, w: 8, h: 5 },
      shipping_cost: 38.0,
      billed_weight_oz: 48,
      origin: "Brooklyn, NY 11201",
      destination: "Austin, TX 78701",
    },
    order: {
      order_number: "#6215",
      customer_name: "James Rodriguez",
      total: 94.50,
      items: [{ name: "Organic Skincare Bundle", qty: 1, price: 79.50 }],
      created_at: "2025-01-23T14:15:00Z",
    },
    timeline: [
      { ts: "2025-01-24T08:00:00Z", event: "Shipped", note: "Label created, 2.25 lbs actual weight.", actor: "AGENT" },
      { ts: "2025-01-27T15:00:00Z", event: "Delivered", note: "Delivered to mailbox.", actor: "CARRIER" },
      { ts: "2025-01-27T16:00:00Z", event: "Overcharge detected", note: "Billed 3 lbs vs 2.25 lbs actual. $24.00 difference.", actor: "AGENT" },
      { ts: "2025-01-27T16:30:00Z", event: "Claim submitted", note: "Submitted weight adjustment claim via ShipStation.", actor: "AGENT" },
    ],
    documents: [
      { id: "doc-4", name: "Shipping Label", type: "label", source: "ShipStation", size: "118 KB", date: "2025-01-24" },
      { id: "doc-5", name: "Carrier Invoice Line", type: "invoice", source: "USPS", size: "32 KB", date: "2025-01-27" },
      { id: "doc-6", name: "Weight Discrepancy Report", type: "pdf", source: "ShipStation", size: "22 KB", date: "2025-01-27" },
    ],
  },
  "CLM-003": {
    id: "CLM-003",
    tracking: "794644790132",
    carrier: "FedEx",
    issue: "Invalid Surcharge",
    issue_description: "FedEx applied a residential delivery surcharge to a commercial address. Verified via USPS address database — destination is a registered business.",
    amount: 18.2,
    status: "approved",
    date: "2025-01-26",
    shipment: {
      shipment_id: "SH-4228",
      carrier: "FedEx",
      service: "FedEx Home Delivery",
      tracking: "794644790132",
      ship_date: "2025-01-22",
      delivery_date: "2025-01-25",
      weight_oz: 48,
      dimensions: { l: 14, w: 10, h: 8 },
      shipping_cost: 32.40,
      origin: "Chicago, IL 60601",
      destination: "Denver, CO 80202",
    },
    order: {
      order_number: "#6228",
      customer_name: "Mike Torres",
      total: 67.50,
      items: [{ name: "Ceramic Mug Set (4-pack)", qty: 1, price: 54.99 }],
      created_at: "2025-01-21T14:00:00Z",
    },
    timeline: [
      { ts: "2025-01-22T10:00:00Z", event: "Shipped", note: "FedEx Home Delivery label created.", actor: "AGENT" },
      { ts: "2025-01-25T13:00:00Z", event: "Delivered", note: "Signed by receptionist at front desk.", actor: "CARRIER" },
      { ts: "2025-01-26T08:00:00Z", event: "Surcharge detected", note: "Residential surcharge applied to verified commercial address.", actor: "AGENT" },
      { ts: "2025-01-26T10:00:00Z", event: "Claim submitted", note: "Submitted invalid surcharge claim via ShipStation.", actor: "AGENT" },
      { ts: "2025-01-29T09:00:00Z", event: "Claim approved", note: "FedEx confirmed error. $18.20 refund issued.", actor: "CARRIER" },
    ],
    documents: [
      { id: "doc-7", name: "Shipping Label", type: "label", source: "ShipStation", size: "120 KB", date: "2025-01-22" },
      { id: "doc-8", name: "Address Verification", type: "pdf", source: "USPS", size: "15 KB", date: "2025-01-26" },
      { id: "doc-9", name: "FedEx Invoice Line", type: "invoice", source: "FedEx", size: "28 KB", date: "2025-01-26" },
    ],
  },
  "CLM-004": {
    id: "CLM-004",
    tracking: "1Z999AA10123456785",
    carrier: "UPS",
    issue: "Duplicate Charge",
    issue_description: "UPS billed for the same shipment twice on consecutive invoices. Second charge of $31.40 is a duplicate that should be refunded.",
    amount: 31.4,
    status: "detected",
    date: "2025-01-26",
    shipment: {
      shipment_id: "SH-4240",
      carrier: "UPS",
      service: "UPS Ground",
      tracking: "1Z999AA10123456785",
      ship_date: "2025-01-20",
      delivery_date: "2025-01-24",
      weight_oz: 32,
      dimensions: { l: 16, w: 12, h: 6 },
      shipping_cost: 31.4,
      origin: "Seattle, WA 98101",
      destination: "San Francisco, CA 94102",
    },
    order: {
      order_number: "#6240",
      customer_name: "Anna Williams",
      total: 145.00,
      items: [
        { name: "Bamboo Cutting Board", qty: 1, price: 89.00 },
        { name: "Kitchen Knife Set", qty: 1, price: 45.00 },
      ],
      created_at: "2025-01-19T11:00:00Z",
    },
    timeline: [
      { ts: "2025-01-20T09:00:00Z", event: "Shipped", note: "Package picked up by UPS.", actor: "AGENT" },
      { ts: "2025-01-24T14:00:00Z", event: "Delivered", note: "Left at front door.", actor: "CARRIER" },
      { ts: "2025-01-26T07:00:00Z", event: "Duplicate charge detected", note: "Same tracking billed on invoice #INV-0122 and #INV-0123.", actor: "AGENT" },
    ],
    documents: [
      { id: "doc-10", name: "Shipping Label", type: "label", source: "ShipStation", size: "115 KB", date: "2025-01-20" },
      { id: "doc-11", name: "Invoice #INV-0122", type: "invoice", source: "UPS", size: "42 KB", date: "2025-01-22" },
      { id: "doc-12", name: "Invoice #INV-0123 (Duplicate)", type: "invoice", source: "UPS", size: "42 KB", date: "2025-01-24" },
    ],
  },
  "CLM-005": {
    id: "CLM-005",
    tracking: "794644790133",
    carrier: "FedEx",
    issue: "DIM Weight Error",
    issue_description: "FedEx applied DIM weight pricing using incorrect dimensions. Billed as 18×14×10 instead of actual 12×10×8, resulting in $56.80 overcharge.",
    amount: 56.8,
    status: "approved",
    date: "2025-01-25",
    shipment: {
      shipment_id: "SH-4255",
      carrier: "FedEx",
      service: "FedEx Ground",
      tracking: "794644790133",
      ship_date: "2025-01-20",
      delivery_date: "2025-01-24",
      weight_oz: 64,
      dimensions: { l: 12, w: 10, h: 8 },
      shipping_cost: 28.50,
      billed_weight_oz: 96,
      billed_dimensions: { l: 18, w: 14, h: 10 },
      origin: "Nashville, TN 37201",
      destination: "Miami, FL 33101",
    },
    order: {
      order_number: "#6255",
      customer_name: "Carlos Mendez",
      total: 234.00,
      items: [{ name: "Premium Coffee Maker", qty: 1, price: 199.00 }],
      created_at: "2025-01-19T16:00:00Z",
    },
    timeline: [
      { ts: "2025-01-20T10:00:00Z", event: "Shipped", note: "FedEx Ground label created.", actor: "AGENT" },
      { ts: "2025-01-24T12:00:00Z", event: "Delivered", note: "Signed for by recipient.", actor: "CARRIER" },
      { ts: "2025-01-25T06:00:00Z", event: "DIM error detected", note: "Billed 18×14×10 vs actual 12×10×8. $56.80 overcharge.", actor: "AGENT" },
      { ts: "2025-01-25T08:00:00Z", event: "Claim submitted", note: "Submitted DIM weight adjustment claim via ShipStation.", actor: "AGENT" },
      { ts: "2025-01-28T11:00:00Z", event: "Claim approved", note: "FedEx confirmed DIM error. Full refund of $56.80.", actor: "CARRIER" },
    ],
    documents: [
      { id: "doc-13", name: "Shipping Label", type: "label", source: "ShipStation", size: "122 KB", date: "2025-01-20" },
      { id: "doc-14", name: "FedEx Invoice Line", type: "invoice", source: "FedEx", size: "35 KB", date: "2025-01-25" },
      { id: "doc-15", name: "DIM Comparison Report", type: "pdf", source: "ShipStation", size: "18 KB", date: "2025-01-25" },
    ],
  },
};

// Generate basic details for claims without explicit detail data
export function getClaimDetail(claimId: string): ClaimDetail | undefined {
  return claimDetails[claimId];
}
