# DealFlow360 — Canonical Business Rules & Commercial Governance

For detailed mathematical formulations and policy thresholds, see [`05_BUSINESS_RULES.md`](./05_BUSINESS_RULES.md).

---

## 1. Five Non-Negotiable Governance Principles

1. **Governance is the Differentiator**: Every risk score or approval requirement must be explainable with exact policy violations, allowed thresholds, proposed values, and margin impact.
2. **Backend is Commercial Authority**: Frontend display logic is non-authoritative. The server and `packages/domain` compute all totals, margins, risk scores, and approval rules.
3. **Every Governed Mutation Re-evaluates**: Any price, discount, or line quantity edit triggers automatic re-execution of the commercial pipeline:
   `Pricing → Margin → Policy Evaluation → Risk Scoring → Approval Requirements`.
4. **Approvals Belong to a Commercial State**: An approval is valid ONLY for the exact commercial state evaluated. Material commercial changes set existing approvals to `SUPERSEDED` and trigger fresh evaluation.
5. **Truthful Inventory & Billing**: Fulfillment allocations cannot exceed available warehouse stock (`allocated <= available`). One-time lines and recurring subscription lines must be handled distinctly in billing schedules.

---

## 2. Commercial Pipeline Calculations

### 2.1 Pricing & Margin Engine
- **Line Subtotal**: $\text{Quantity} \times \text{List Price}$
- **Discount Amount**: $\text{Line Subtotal} \times (\text{Discount \%} / 100)$
- **Net Line Value**: $\text{Line Subtotal} - \text{Discount Amount}$
- **Line Cost Total**: $\text{Quantity} \times \text{Standard Cost}$
- **Gross Margin Amount**: $\text{Net Line Value} - \text{Line Cost Total}$
- **Gross Margin %**: $(\text{Gross Margin Amount} / \text{Net Line Value}) \times 100$

### 2.2 Policy Evaluation Matrix
Evaluates proposed discount and gross margin % against policy thresholds governed by Customer Tier (`STANDARD`, `GOLD`, `PLATINUM`) and Product Category.
- **Discount Violation**: Proposed Discount > Max Governed Discount.
- **Margin Violation**: Gross Margin % < Min Governed Margin %.

### 2.3 Blended Commercial Risk Score
Produces a deterministic score between `0.0` (Lowest Risk) and `10.0` (Highest Risk):
- Base Score derived from total discount depth, margin erosion below threshold, and total deal size.
- Policy Violation penalties added deterministically (+2.5 per policy violation).
- Risk Severity Levels: `LOW` (< 3.0), `MEDIUM` (3.0 – 6.0), `HIGH` (6.1 – 8.5), `CRITICAL` (> 8.5).

### 2.4 Approval Routing Rules
- **No Violations & Low Risk**: Automatic approval (`APPROVED`).
- **Discount Policy Violation or Medium Risk**: Requires `SALES_MANAGER` approval.
- **Margin Policy Violation, High Risk (> 6.0), or Deal Size > $100k**: Requires `FINANCE_OPERATIONS` approval (or both Sales Manager & Finance).

### 2.5 Customer Portal Counteroffer & Supersession Workflow
1. Customer submits proposed discount / target line prices via portal token.
2. Server validates token, quote state (`NEGOTIATING`), and payload.
3. Server executes commercial pipeline on new target prices.
4. Any previous `APPROVED` state is set to `SUPERSEDED`.
5. Audit event `CUSTOMER_COUNTEROFFER_SUBMITTED` recorded.
6. If new state requires approvals, quote transitions to `PENDING_MANAGER` or `PENDING_FINANCE`.

### 2.6 Multi-Warehouse Fulfillment Allocation
- Heuristic: Prioritize single-warehouse complete fulfillment first.
- If split required: Allocate from primary warehouse up to `available` quantity, remaining from secondary warehouse.
- Constraint: $\text{Allocated Quantity} \le \text{Available Quantity}$. Server validates manual overrides.

### 2.7 Billing Schedule & Proration
- **One-Time Lines**: Billed 100% on order confirmation / fulfillment start.
- **Recurring Lines**: Billed according to frequency (`MONTHLY` or `ANNUAL`).
- **Proration**: Billed proportionally based on days active in partial initial billing period:
  $\text{Prorated Amount} = \text{Recurring Amount} \times (\text{Active Days} / \text{Days in Period})$.
