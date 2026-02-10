

# Patch v0.1 to v0.2 — Credibility and Polish Fixes

This patch addresses 10 issues to make the prototype credible for real merchants. Here's what changes and why.

---

## 1. Damage Case: "Request Evidence from Customer" CTA

**Current state:** CaseDetail has a basic CTA that immediately adds photos (no modal). PacketViewer shows "Required -- not yet provided" but with no action buttons.

**Changes:**
- **New component: `RequestPhotosModal`** -- A dialog with prefilled, editable message template including order #, tracking #, photo checklist, and mock upload link (`recoverly.link/upload/CASE_ID`). Two actions: "Send Request" (mock toast + timeline event) and "Cancel".
- **CaseDetail updates:** Replace the inline `handleRequestEvidence` with modal open. Add a separate "Mark Photos Received (Mock)" button that adds photo evidence, updates status to READY, and updates confidence.
- **PacketViewer updates:** Add action buttons on missing evidence cards:
  - Photos (Damage lane) -> "Request from Customer" button
  - Invoice PDF -> "Upload PDF" button (mock)
  - Tracking Events -> "Refresh Tracking" button (mock toast)

---

## 2. Home Metrics Consistency

**Current state:** Headline says "3 new issues worth $847" (hardcoded). Case amounts are small ($8-$156). `getPipelineTotal` sums ALL cases including PAID.

**Changes:**
- **Update demo data amounts** to material ranges ($18-$450+) for a $10M-$50M seller:
  - RC-1001 (Late/PAID): $247.50
  - RC-1002 (Overcharge/READY): $186.40
  - RC-1003 (Damage/NEEDS_EVIDENCE): $312.40
  - RC-1004 (Overcharge/UNDER_REVIEW): $124.00
  - RC-1005 (Lost/SUBMITTED): $456.00
  - RC-1006 (Late/FOUND): $238.75
  - RC-1007 (Overcharge/APPROVED): $108.60
  - RC-1008 (Damage/READY): $267.00
  - RC-1009 (Overcharge/DENIED): $112.30
  - RC-1010 (Late/FOUND): $389.00
- **Fix `getPipelineTotal`** to exclude PAID and add a new `getFoundCases` helper
- **Make headline dynamic:** "I found {foundCount} new issues worth ${foundTotal}" computed from FOUND cases
- **Ensure all StatusCard values are computed** from case data with 2-decimal formatting

---

## 3. Deadlines: Replace "Deadline passed" Spam

**Current state:** All deadlines are in 2024, so everything shows "Deadline passed" since dates are in the past.

**Changes:**
- **Update all deadline dates** to future dates relative to current display (using 2026-02 dates to match current date context):
  - 2-3 comfortable: 8-30 days out (e.g., Feb 28, Mar 5, Mar 10)
  - 2-3 moderate: 3-7 days out (e.g., Feb 14, Feb 16, Feb 17)
  - 1-2 urgent: 24-48h (e.g., Feb 11, Feb 12)
  - 0-1 passed: only 1 case max (the DENIED case)
- **Update ActivityCard deadline display** to show formatted date + days left:
  - "Deadline: Feb 28 (18 days)" for comfortable
  - "Urgent: 24h left" for <=2 days
  - "Deadline passed" only if truly past

---

## 4. PacketViewer: Actionable Missing Evidence

**Current state:** Missing evidence shows a static "Required -- not yet provided" label with no actions.

**Changes:**
- Add action buttons to each missing evidence type:
  - PHOTOS -> "Request from Customer" (opens RequestPhotosModal or triggers callback)
  - CARRIER_INVOICE_LINE / UPLOADED_PDF -> "Upload PDF" (mock upload toast)
  - TRACKING_EVENTS -> "Refresh Tracking" (mock toast "Tracking refreshed")
- Add evidence completeness summary: "X of Y core evidence items present" at the top of PacketViewer
- Pass `caseData` to PacketViewer so it can determine lane-specific actions

---

## 5. Status Copy: "Filed" to "Submitted"

**Current state:** Some timeline events say "Claim filed" or "Filed via ShipStation". The status enum already uses SUBMITTED.

**Changes:**
- Update all timeline event text in demo data:
  - "Claim filed" -> "Claim submitted"
  - "Filed via ShipStation" -> "Submitted via ShipStation claim flow"
  - "Filed for lost package" -> "Submitted for lost package claim"
- Audit `statusConfig` labels (already correct: "Submitted")
- Update CaseTimeline rendering if any "filed" labels exist

---

## 6. Confidence Display: Remove Arbitrary Percentages

**Current state:** ChatDrawer mock response says "Overall evidence completeness: 85%". Confidence reasons are already good (text-based).

**Changes:**
- **ChatDrawer:** Update mock responses to use "X of Y evidence items" format:
  - "What evidence is missing?" -> "4 of 5 core evidence items present. Missing: carrier invoice line item."
  - Remove any percentage from responses
- Verify all `confidence_reason` strings avoid percentages (already clean in data)

---

## 7. Submission Route on ALL Case Details

**Current state:** CaseDetail shows "Submission: ShipStation claim flow" in the confidence box. Already implemented.

**Changes:**
- Verify it renders for all lanes (it does -- the code is unconditional). No changes needed here; just confirm during testing.

---

## 8. Theme Toggle (Dark/Light) in Settings

**Current state:** Only dark mode exists. No light palette defined. AppSettings has Appearance section but no theme toggle.

**Changes:**
- **Add light mode CSS variables** in `index.css` under a `.light` class or by restructuring `:root` as light and `.dark` as dark (using `next-themes` which is already installed):
  - Background: #F8FAFC -> `210 40% 98%`
  - Cards: #FFFFFF -> `0 0% 100%`
  - Text: #0F172A -> `222 47% 11%`
  - Reduce glow intensity in light mode
- **Wire up `next-themes`** in `main.tsx` with `ThemeProvider`
- **Add "Dark mode" toggle** at top of AppSettings Appearance section
- **Update `index.css`:** Move current dark values to `.dark` class, set `:root` to light values

---

## 9. ChatDrawer: No Arbitrary Percentages

Covered in item 6 above. Same file changes.

---

## 10. USPS Tracking Number Formats

**Current state:** RC-1003 tracking is `9400111899223100012345` (22 digits, correct). RC-1007 is `9400111899223100067890` (22 digits, correct).

**Changes:**
- Verify all USPS tracking numbers are 20-22 digits (they are)
- Verify UPS starts with 1Z (they do)
- Verify FedEx is 12-15 digits (they are)
- No data changes needed for tracking formats

---

## Technical Summary of Files Changed

| File | Changes |
|------|---------|
| `src/lib/case-data.ts` | Update amounts, deadlines, timeline text ("filed"->"submitted"), fix `getPipelineTotal`, add `getFoundCases` |
| `src/pages/AgentHome.tsx` | Dynamic headline from computed FOUND cases, format money to 2 decimals |
| `src/components/core/ActivityCard.tsx` | Improve deadline display with formatted date + urgency levels |
| `src/components/core/PacketViewer.tsx` | Add action buttons on missing evidence, add "X of Y" completeness summary, accept callbacks |
| `src/components/core/ChatDrawer.tsx` | Replace "85%" with "X of Y items" in mock responses |
| `src/pages/CaseDetail.tsx` | Add RequestPhotosModal, "Mark Photos Received" button, pass callbacks to PacketViewer |
| `src/pages/AppSettings.tsx` | Add Dark mode toggle using `next-themes` |
| `src/index.css` | Add light theme variables, restructure dark/light |
| `src/main.tsx` | Wrap app in ThemeProvider from `next-themes` |
| **New file:** `src/components/core/RequestPhotosModal.tsx` | Modal with editable template, send/cancel actions |

