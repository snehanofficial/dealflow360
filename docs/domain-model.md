# DealFlow360 — Domain Model

## Primary Entities

- **Customer**: Customer details and pricing tier.
- **Product**: Product catalog item (one-time or recurring).
- **Quotation**: Governed commercial quote header and line items.
- **QuoteLine**: Line item with quantity, list price, proposed discount, net price, and cost.
- **PolicyRule**: Governed commercial thresholds (discount cap, minimum margin, approval roles).
- **ApprovalRequest**: Approvals required and granted for a specific commercial quote state.
- **Warehouse**: Inventory source and fulfillment center.
- **BillingSchedule**: One-time and recurring billing schedule lines.
- **DealEvent**: Immutable audit timeline events.
