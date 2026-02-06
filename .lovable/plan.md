

# Recoverly - Implementation Plan

## Phase 1: Core Foundation

### 1. Design System & Theme
Set up the premium dark mode aesthetic with your exact color palette:
- Deep navy-black background (#0A0A0F)
- Surface cards (#12121A) with subtle borders (#2A2A35)
- Electric cyan primary (#00E5CC) with glow effects
- Coral accent for warnings (#FF6B6B)
- Typography system with bold headlines, glowing money amounts, and muted labels

### 2. Landing Page (/)
**Hero Section**
- "Your Carriers Owe You Money" headline with impactful typography
- Subhead explaining the $847/month average recovery
- Glowing cyan "Start Recovering" CTA button
- Trust line: "Free to connect. We only earn when you do."

**Social Proof Stats Bar**
- Animated counters: $12.4M+ recovered, 2,400+ sellers, 94% approval rate
- Cyan numbers with gray labels

**How It Works**
- 3 dark cards with cyan accent borders
- Connect → Audit → Recover flow

**Recovery Types Grid**
- 6 cards showing what we recover (Late Deliveries, Duplicate Charges, etc.)
- Cyan checkmark icons

**Testimonial Section**
- Large quote with cyan accent
- Customer photo and store details

**Pricing Card**
- Prominent "25%" in electric cyan
- "of recovered funds" messaging
- CTA to get started

### 3. Dashboard (/dashboard)

**Navigation Bar**
- Recoverly logo with cyan dot accent
- Dashboard | Claims | Settings navigation
- User avatar dropdown

**Hero Stats Row (3 cards)**
- **Recovered**: $4,247.83 in glowing cyan with celebration styling
- **Pending**: $892.40 in coral, showing claims under review
- **Ready to File**: $1,156.20 in white with action link

**Recovery Trend Chart**
- Recharts area chart with cyan gradient fill
- 6-month timeline
- Dark grid lines, hover tooltips

**Recent Activity Feed**
- Refund deposits, approvals, pending reviews
- Status icons (cyan checks, coral clocks)
- Timestamps and amounts

**Issue Breakdown**
- Horizontal bar chart showing recovery by category
- Cyan-filled progress bars

**Carrier Performance**
- UPS, FedEx, USPS with success rates
- Color-coded bars (cyan for good, coral for needs attention)

**Insight Card**
- Actionable recommendation with lightbulb icon
- Cyan left border accent

---

## Phase 2: Additional Pages (Next Iteration)

After validating the core pages, we'll add:
- **Claims List** (/claims) - Filterable table with status badges
- **Claim Detail** (/claims/[id]) - Full shipment and resolution timeline
- **Onboarding** (/onboarding) - 3-step store/carrier connection flow
- **Settings** (/settings) - Connections, billing, and notifications

---

## Design Details

**Animations & Polish**
- Subtle glow effects on money amounts
- Smooth hover state transitions
- Chart draw-in animations on load
- Skeleton loading states with cyan shimmer

**Responsive Design**
- Mobile-optimized layouts
- Touch-friendly card sizing
- Collapsible navigation

**Mock Data**
- Realistic shipping claim examples
- Varied carrier and issue types
- Believable dollar amounts and dates

