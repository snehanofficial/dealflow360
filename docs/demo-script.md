# DealFlow360 — End-to-End Judge Demonstration Script

This document details the step-by-step judge demonstration flow proving connected, policy-driven commercial governance in DealFlow360.

---

## The Primary End-to-End Flow

```text
Quote ──► Pricing ──► Margin ──► Policy Evaluation ──► Risk ──► Approval ──► Customer Negotiation ──► Re-risk / Reapproval ──► Fulfillment ──► Billing ──► Control Tower
```

---

## Step-by-Step Demonstration Journey

### Step 1: Draft Quotation Creation (Sales Rep)
- Log in as **Sales Rep** (`sales.rep@dealflow360.com`).
- Navigate to **Quotations** → **New Quotation**.
- Select Customer (`Acme Corp`, Gold Tier) and add products (e.g. `Enterprise Server`, `Support Subscription`).
- Set custom discount on lines (e.g. 25%).
- Observe live calculation of subtotal, line discounts, net total, line margins, and gross margin %.

### Step 2: Commercial Governance & Risk Evaluation
- Click **Submit Quotation**.
- Observe backend policy evaluation:
  - Policy violation triggered: "Proposed discount 25% exceeds Gold Tier category threshold 15%".
  - Margin violation triggered: "Gross margin 22% is below governed threshold 30%".
  - Blended Risk Score computed: `HIGH RISK (7.8 / 10.0)`.
  - Required Approvals derived automatically: `SALES_MANAGER` and `FINANCE_OPERATIONS`.
  - Quote state transitions to `PENDING_FINANCE`.

### Step 3: Approval Routing & Decision (Finance Leader)
- Log out and log in as **Finance Operations** (`finance@dealflow360.com`).
- Navigate to **Approvals Workspace**.
- View the pending approval request with complete explanation (risk score, violated policy rules, margin impact).
- Click **Approve Quote** with audit note "Approved for strategic account expansion".
- Quote state transitions to `APPROVED`. Customer portal link generated.

### Step 4: Customer Portal & Counteroffer Negotiation
- Access customer portal link (`/portal/quote/<token>`).
- View clean customer-facing quote layout (without confidential margin/cost details).
- Click **Submit Counteroffer** requesting 30% discount.
- System processes counteroffer:
  - Recalculates pricing & margin.
  - Re-evaluates policy matrix & risk (`CRITICAL RISK 9.1`).
  - **Supersedes** previous approval (`Approval state: SUPERSEDED`).
  - Quote state transitions to `PENDING_FINANCE`.

### Step 5: Re-Approval & Deal Confirmation
- Finance Manager reviews superseded state, counter-proposes 22%, and approves.
- Customer accepts quote in portal. Quote state transitions to `FULFILLMENT`.

### Step 6: Multi-Warehouse Fulfillment Planning
- Navigate to **Fulfillment Planning**.
- View multi-warehouse stock breakdown (Warehouse A: 50 units, Warehouse B: 100 units).
- Run automated allocation algorithm (allocates 50 from A, 20 from B).
- Validate inventory check constraints (`allocated <= available`). Confirm allocation.

### Step 7: Hybrid Billing Schedule Generation
- Navigate to **Billing Schedule**.
- View distinct schedules:
  - **One-time hardware lines**: Billed 100% upfront upon order confirmation.
  - **Recurring subscription lines**: Annual recurring billing schedule generated with proration calculation.

### Step 8: Deal Control Tower & Operational Metrics
- Navigate to **Control Tower**.
- Observe real-time metrics derived from live deal database:
  - Deals at risk, margin leakage breakdown, pending approval bottlenecks, fulfillment risk alerts.
  - View full immutable audit event trail (`QUOTE_CREATED` → `RISK_EVALUATED` → `APPROVED` → `CUSTOMER_COUNTERED` → `SUPERSEDED` → `REAPPROVED` → `FULFILLED` → `BILLED`).
