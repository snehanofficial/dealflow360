# DealFlow360 - Detailed Individual Feature Implementation Checklist

> **Source:** DealFlow360 hackathon problem statement / product brief (13 pages).
>
> **Purpose:** Convert the source specification into an implementation-ready, feature-by-feature checklist covering functional requirements, non-functional requirements, business rules, workflows, edge cases, validation, auditability, and acceptance criteria.
>
> **Important specification discipline:** Where the source document describes a required behavior but does **not** define an exact numeric formula, algorithm, timeout, SLA, or policy value, this checklist marks that item as **CONFIGURATION / OPEN SPECIFICATION** rather than inventing a value. The implementation should keep such behavior application-driven and configurable rather than hardcoding demo-only behavior.

---

## 0. Product Definition and Success Criteria

### Phase 1: Security & RBAC Foundation
- [~] Complete Permission Registry mapping all actions to explicit permissions
- [~] Re-write `AppRoutes.tsx` with rigorous `RoleRoute` wrappers, removing unguarded paths
- [~] Add `requirePermission` middleware to all internal API routes (replacing generic `authenticate`)
- [~] Add robust application-level 403 Forbidden and 404 Not Found error pages
- [~] Scope `GET /quotes` queries strictly to the customer's own ID when `role=CUSTOMER`
- [~] Restrict Customer portal access strictly to the customer's own token-scoped deals

*Note on Phase 1: Server-side RBAC and API tests passed (102/102). Browser verification is currently BLOCKED due to a Playwright/CDN 404 failure. Frontend/browser RBAC is unverified. Items marked `[~]` (partial).*


### 0.1 Product goal

- [ ] Build DealFlow360 as an intelligent, self-governing B2B sales operations platform.
- [ ] Support the complete sales lifecycle:
  - [ ] Quotation
  - [ ] Approval
  - [ ] Customer negotiation
  - [ ] Order confirmation
  - [ ] Multi-warehouse fulfillment
  - [ ] Backorder handling
  - [ ] One-time billing
  - [ ] Recurring billing
  - [ ] Payment / invoice status
  - [ ] Deal-health monitoring
  - [ ] Reporting
- [ ] Treat business logic, data model, and end-to-end workflow as first-class implementation concerns, not merely UI screens.
- [ ] Keep core rules in application logic rather than faking behavior for the demo.
- [ ] Allow the platform to react to pricing, stock, approval, billing, and customer negotiation state changes.

### 0.2 Core business outcomes

- [ ] A sales rep can log in and create a quote.
- [ ] Discounts automatically determine whether approval is required.
- [ ] Customer tier and product/category-specific discount limits are enforced.
- [ ] Mixed-category quotations can produce a blended risk score.
- [ ] Approval automatically routes to the highest required approval level.
- [ ] Upsell / cross-sell recommendations appear while the quote is being built.
- [ ] Adding a recommendation immediately updates quote totals and margin impact.
- [ ] Approved orders receive a warehouse fulfillment recommendation based on live stock.
- [ ] Orders can be split across multiple warehouses when required.
- [ ] Operations can manually override the recommendation.
- [ ] Remaining unavailable quantity can become a backorder.
- [ ] Newly arrived stock can trigger a consolidation prompt for the remaining backorder.
- [ ] One order can contain both one-time and recurring lines.
- [ ] Recurring lines have a billing schedule and support proration for supported changes.
- [ ] Cancellation / modification can create partial refund or credit note behavior when applicable.
- [ ] Customers can negotiate inside a restricted customer portal.
- [ ] Negotiation changes that cross approval thresholds automatically re-enter approval.
- [ ] Managers can see stalled deals, discount anomalies, and delivery-promise slippage.
- [ ] Reports support required filters and PDF/XLS export.

**Source basis:** the project overview, goals, key outcomes, and complete-flow sections describe the platform as a quote-to-cash engine with discount governance, upsell/cross-sell, warehouse splitting, hybrid billing, negotiation, anomaly monitoring, and reporting. [Source: DealFlow360 PDF, pp. 1-2, 9-13]

---

# 1. Global Non-Functional Requirements

## 1.1 Technology and architecture

- [ ] Technology stack may be selected freely: backend language, frontend framework, and relational/document database are not prescribed.
- [ ] Architecture must prioritize domain/business logic and data model correctness over framework choice.
- [ ] Separate frontend presentation from authoritative backend business decisions.
- [ ] Keep approval routing, discount governance, warehouse allocation, and billing-proration logic in application logic.
- [ ] Avoid hardcoding demo-only outcomes such as "always send this quote to manager" or "always allocate warehouse A".
- [ ] Keep configuration data separate from transaction data.
- [ ] Keep customer-facing negotiation isolated from internal sales screens.

## 1.2 Server authority / business-rule authority

- [ ] Backend validates all critical commercial decisions.
- [ ] Do not trust totals, discounts, approval statuses, stock quantities, or billing states supplied by the browser.
- [ ] Recalculate quote totals and risk before final approval / confirmation.
- [ ] Revalidate inventory before reserving or fulfilling stock.
- [ ] Revalidate approval requirements whenever material quote terms change.
- [ ] Revalidate customer-confirmed terms before converting the quote into an order.

## 1.3 Security

- [ ] Enforce authentication for all non-public endpoints.
- [ ] Enforce role-based authorization for internal operations.
- [ ] Restrict customer portal users to their own quotations/orders and permitted actions.
- [ ] Prevent a customer from accessing internal configuration or internal analytics.
- [ ] Prevent a sales rep from approving their own quotation when the approval policy requires another role.
- [ ] Enforce authorization on the server, not only by hiding UI controls.
- [ ] Record actor and timestamp for business actions that must be auditable.
- [ ] Treat portal negotiation as a real restricted surface, not an internal screen with cosmetic changes.

## 1.4 Reliability and integrity

- [ ] Use transactional operations for critical state transitions.
- [ ] Prevent duplicate approvals, duplicate order conversion, and duplicate payment recording.
- [ ] Prevent stock from being allocated beyond available quantity.
- [ ] Preserve historical approval and quotation changes rather than silently overwriting important audit information.
- [ ] Ensure failed partial operations can be rolled back safely.

## 1.5 Data consistency

- [ ] Quote totals, line totals, discount amounts, taxes, margin indicators, and approval state must remain consistent.
- [ ] Inventory availability used for fulfillment must come from current backend state.
- [ ] Approval requirements must reflect the current quote snapshot, not stale frontend state.
- [ ] Billing schedules must reflect the actual recurring lines and effective dates stored on the order.

## 1.6 Real-time / freshness expectations

- [ ] Pricing information can be refreshed from the backend.
- [ ] Stock information can be refreshed from the backend.
- [ ] Approval information can be refreshed from the backend.
- [ ] Deal-health indicators reflect current stored state.
- [ ] Changes that materially affect approval, margin, or fulfillment must trigger a fresh server-side evaluation before the next consequential action.
- [ ] A "Reload Data" action must genuinely reload backend state rather than only repainting the UI.

## 1.7 Observability / auditability

- [ ] Log approvals.
- [ ] Log rejections.
- [ ] Log quote edits relevant to commercial terms.
- [ ] Log actor/user.
- [ ] Log timestamp.
- [ ] Log reason where the workflow requires a reason.
- [ ] Preserve the audit trail in a queryable form.
- [ ] Make relevant audit entries visible in approval confirmation and/or quotation history.

## 1.8 Usability

- [ ] Each workflow step should have an obvious next action.
- [ ] Approval-required status must be visible.
- [ ] The user must be able to distinguish one-time vs recurring lines.
- [ ] Warehouse recommendations must show enough context to understand allocation, shipment count, and cost.
- [ ] Customer negotiation must clearly show current quote status.
- [ ] Alert clicks must open the related quotation directly.

## 1.9 Performance / scalability recommendations

> These are engineering recommendations; the source does not prescribe numerical SLAs.

- [ ] Keep quote recalculation efficient enough for interactive editing.
- [ ] Avoid recomputing entire historical datasets on every quote keystroke.
- [ ] Index quotations by customer, status/stage, sales rep, team, and dates used by reporting.
- [ ] Index inventory by warehouse and product/variant.
- [ ] Index approval tasks by status and assignee/role.
- [ ] Paginate quotation lists and activity/reporting datasets.
- [ ] Use background jobs for non-interactive analytics or heavy report generation if required by scale.

## 1.10 Extensibility

- [ ] Keep discount tiers configurable.
- [ ] Keep approval chains configurable.
- [ ] Keep warehouse configuration configurable.
- [ ] Keep shipping-cost weighting configurable.
- [ ] Keep subscription plans/proration/cancellation policies configurable.
- [ ] Keep upsell/cross-sell rules configurable.
- [ ] Keep dashboard/reporting filters extensible.

---

# 2. Roles and Authorization Matrix

## 2.1 Roles to implement

- [ ] `SALES_REP`
- [ ] `SALES_MANAGER / APPROVER`
- [ ] `FINANCE / OPERATIONS`
- [ ] `CUSTOMER / PORTAL USER`
- [ ] `ADMIN`

## 2.2 Sales Rep permissions

- [ ] Sign up / log in.
- [ ] Open sales workspace.
- [ ] Create quotations.
- [ ] Add/remove products.
- [ ] Adjust quantities.
- [ ] Apply permitted discounts.
- [ ] Submit quotations into automatic approval evaluation.
- [ ] View approval status.
- [ ] Add recommended upsell/cross-sell products.
- [ ] Track fulfillment progress.
- [ ] Respond to customer negotiation requests.
- [ ] View permitted deal-health information.

## 2.3 Sales Manager / Approver permissions

- [ ] Review quotations that exceed applicable approval thresholds.
- [ ] Approve.
- [ ] Reject.
- [ ] Return for revision.
- [ ] Configure discount tiers.
- [ ] Configure approval chains.
- [ ] Monitor deal-health dashboard.
- [ ] Review discount anomalies and risky deals.

## 2.4 Finance / Operations permissions

- [ ] Perform second-level approval where required.
- [ ] Manage warehouse fulfillment splits.
- [ ] Make backorder decisions.
- [ ] Reconcile recurring billing.
- [ ] Reconcile / process credit-note-related workflows.

## 2.5 Customer permissions

- [ ] Access quotation through portal login.
- [ ] View quotation.
- [ ] View current quote status.
- [ ] Add line-level comments/questions.
- [ ] Request line-level changes.
- [ ] Counter a discount.
- [ ] Submit negotiation requests.
- [ ] Confirm final terms with one click.
- [ ] Never access internal backend configuration.
- [ ] Never access internal approval controls.
- [ ] Never access other customers' quotes.

## 2.6 Admin permissions

- [ ] Manage products.
- [ ] Manage price lists.
- [ ] Manage discount tiers.
- [ ] Manage approval chains.
- [ ] Manage warehouses.
- [ ] Manage subscription plans.
- [ ] View platform-wide analytics/reporting.

---

# 3. Authentication and Session Management

## 3.1 Internal user authentication

- [ ] Support standard credential sign-up for internal users.
- [ ] Support standard credential login.
- [ ] Validate credentials server-side.
- [ ] Create an authenticated session/token after successful login.
- [ ] Associate authenticated session with a role.
- [ ] Redirect internal user to permitted sales/backend workspace.
- [ ] Deny unauthenticated access to protected internal routes.

## 3.2 Customer portal authentication

- [ ] Support customer portal login.
- [ ] Support magic-link login OR email/password as allowed by the implementation.
- [ ] Scope customer session to customer identity.
- [ ] Restrict quotation visibility by customer ownership/authorization.
- [ ] Do not expose internal role privileges through the customer session.

## 3.3 Session security

- [ ] Expire/revoke sessions according to chosen authentication model.
- [ ] Prevent privilege escalation through client-side role changes.
- [ ] Validate role on every protected request.
- [ ] Record login actor information where required for audit/security.

**Source basis:** internal users use standard credentials; customers access quotations through a portal login using a magic link or email/password. [Source: DealFlow360 PDF, p. 4]

---

# 4. Product and Variant Management

## 4.1 Product master fields

- [ ] Product name.
- [ ] Category.
- [ ] Base price.
- [ ] Unit.
- [ ] Tax.
- [ ] Product description.
- [ ] Active/inactive state recommended for operational safety.

## 4.2 Product variants

- [ ] Support attribute definitions such as Size or Pack.
- [ ] Support allowed attribute values.
- [ ] Support extra price by variant/value combination.
- [ ] Ensure selected variant contributes the correct sell price to the quotation.
- [ ] Preserve selected variant identity on quotation/order lines.

## 4.3 Product categorization

- [ ] Every product used by discount governance should have a category.
- [ ] Category must be available to the discount evaluation engine.
- [ ] Product/category changes must not silently alter historical quote snapshots.

## 4.4 Tax and pricing data handling

- [ ] Store the tax configuration required to calculate quote totals.
- [ ] Keep sell price and tax information available for invoice/billing workflows.
- [ ] Do not depend on frontend values for final commercial calculations.

## 4.5 Product acceptance criteria

- [ ] Admin can create a product.
- [ ] Admin can edit a product.
- [ ] Admin can create/edit variants.
- [ ] Variant extra pricing appears correctly in quote builder.
- [ ] Product category flows into discount-risk evaluation.
- [ ] Product can be selected in a quote only when valid/available according to configured product state.

**Source basis:** product general information includes name, category, price, unit, tax, and description; variants include attributes, values, and extra prices. [Source: DealFlow360 PDF, p. 4]

---

# 5. Price List Management

## 5.1 Price-list setup

- [ ] Support customer-tier-based pricing.
- [ ] Support currency-specific pricing/rules.
- [ ] Associate pricing rule(s) with the appropriate customer tier.
- [ ] Resolve the applicable price when a product is added to a quotation.

## 5.2 Business rules

- [ ] Customer tier must be considered when resolving pricing.
- [ ] Currency must be considered where currency-specific rules exist.
- [ ] The resolved price must be stored / snapshotted appropriately on a commercial document so historical quotes do not unexpectedly change when master pricing is later edited.

## 5.3 Open specification

- [ ] Define precedence when multiple price-list rules could apply.
- [ ] Define fallback behavior when no customer-tier/currency-specific price exists.
- [ ] Define whether an existing draft quote is re-priced automatically after a price-list change or only on explicit reload.

**Source basis:** customer-tier-based pricing and currency-specific rules are required. Multi-currency support is explicitly identified as a bonus rather than a mandatory requirement. [Source: DealFlow360 PDF, pp. 4, 10]

---

# 6. Customer and Customer-Tier Management

## 6.1 Customer master

- [ ] Customer identity.
- [ ] Customer tier (for example Bronze, Silver, Gold).
- [ ] Customer portal identity/contact.
- [ ] Relationship to quotations/orders.

## 6.2 Customer-tier business logic

- [ ] Customer tier participates in discount governance.
- [ ] Customer tier may participate in price-list resolution.
- [ ] Customer tier must be available during quotation approval evaluation.
- [ ] Historical quotations should retain the evaluated commercial state rather than being retroactively altered by tier configuration changes.

## 6.3 Acceptance criteria

- [ ] A Gold customer can be identified as such during quote creation.
- [ ] The system can retrieve the discount ceiling applicable to the customer's tier.
- [ ] Customer portal access is restricted to that customer.

---

# 7. Discount Tier and Approval Chain Configuration

## 7.1 Discount ceilings

- [ ] Configure discount ceiling per customer tier.
- [ ] Example configuration must be possible:
  - [ ] Bronze: up to 5%
  - [ ] Silver: up to 10%
  - [ ] Gold: up to 15%
- [ ] Do not hardcode these example values as universal business rules.

## 7.2 Category-specific discount ceilings

- [ ] Configure discount ceiling by product category.
- [ ] Allow categories with thin margins to have lower ceilings.
- [ ] Allow healthier-margin categories to have higher ceilings where configured.
- [ ] Evaluate each quotation line against its applicable category limit.

## 7.3 Approval-chain configuration

- [ ] Configure discount range requiring Sales Manager approval.
- [ ] Configure discount range requiring Sales Manager followed by Finance approval.
- [ ] Ensure approval routing is generated from configuration.
- [ ] Ensure approval sequence is preserved.

## 7.4 Approval decision logic

- [ ] Calculate the applicable customer-tier ceiling.
- [ ] Calculate the applicable category/product ceiling.
- [ ] Determine the effective allowed discount for each line according to configured rules.
- [ ] Detect any line whose requested discount exceeds its applicable ceiling.
- [ ] Calculate the quotation's blended risk score when required.
- [ ] Route the quotation to the highest required approval level.
- [ ] Do not require the sales rep to manually request approval when the rules require it.

## 7.5 Mixed-category quotation rule

- [ ] Evaluate all lines independently.
- [ ] Do not assume the customer-tier ceiling alone is enough.
- [ ] Where categories have different ceilings, compute the blended risk score.
- [ ] Route the entire quotation to the highest required approval level.
- [ ] A stricter line must be able to cause approval for the entire quote.

**Example from source:** Gold customer is allowed up to 15%; hardware allows 15%; service allows 10%. Laptop at 12% is within limit; setup service at 18% exceeds its 10% category limit by 8 percentage points; the quote therefore requires approval. [Source: DealFlow360 PDF, pp. 11-12]

## 7.6 Blended risk score behavior

- [ ] Support the concept of a blended quotation risk score.
- [ ] Consider the aggregate discount pattern across the quotation, not merely the single worst line.
- [ ] Ensure multiple smaller violations can contribute to overall risk.
- [ ] Ensure routing can escalate based on the aggregate pattern.
- [ ] Do not permit a quote to bypass approval merely because each individual violation appears small when the overall pattern crosses configured risk.

### 7.6.1 Formula specification gap

The source defines the intended behavior of the blended score but does **not** give an exact mathematical formula or numeric routing thresholds for the score.

- [ ] Define a documented blended-risk formula before production implementation.
- [ ] Define score bands and required approval levels.
- [ ] Define how line weights are determined (for example amount, margin, discount excess, or another approved factor) if such weighting is used.
- [ ] Store the evaluated score and contributing factors with the approval decision for explainability.
- [ ] Keep these values configurable rather than embedding hidden constants in code.

---

# 8. Approval Workflow Engine

## 8.1 Automatic routing

- [ ] Trigger approval evaluation when a quote is submitted/confirmed for approval analysis.
- [ ] Automatically create the required approval steps.
- [ ] Use Sales Manager as first level where configured.
- [ ] Add Finance as second level only when configured/required.
- [ ] Skip unnecessary approval levels.

## 8.2 Approval states

At minimum, support the source's business states and actions:

- [ ] Pending approval.
- [ ] Approved.
- [ ] Rejected.
- [ ] Returned for revision.
- [ ] Re-entered for approval after customer negotiation changes.

Recommended implementation detail:

- [ ] Keep quote status separate from individual approval-step status where necessary.
- [ ] Derive overall approval completion from all required steps.

## 8.3 Reviewer actions

- [ ] Approve.
- [ ] Reject.
- [ ] Return for revision.
- [ ] Require reason where policy/workflow calls for it.
- [ ] Write audit event with user, timestamp, action, and reason.

## 8.4 Approval authority

- [ ] Only authorized approvers can act on approval steps.
- [ ] A reviewer cannot approve a step that is not currently pending.
- [ ] A completed step cannot be acted upon again unless the quote legitimately re-enters approval.
- [ ] Prevent unauthorized users from changing approval outcome through API manipulation.

## 8.5 Re-approval rule

Approval must be re-evaluated when materially relevant commercial terms change, especially through customer negotiation.

- [ ] Detect changes to price/discount/quantity/lines/terms that affect risk.
- [ ] Recalculate quote risk after material changes.
- [ ] Re-route when new terms exceed approval thresholds.
- [ ] Clear or supersede stale approval decisions when a new approval cycle is created.
- [ ] Preserve prior approval-cycle history.

## 8.6 Approval UX acceptance criteria

- [ ] Approval screen shows blended risk score.
- [ ] Approval steps list shows Sales Manager and Finance only when required.
- [ ] After reviewer action, a confirmation screen shows the resulting audit-trail entry.

**Source basis:** approval-screen requirements and role responsibilities are defined on pages 3, 6, and 9-12 of the source document.

---

# 9. Warehouse and Fulfillment Configuration

## 9.1 Warehouse master

- [ ] Create warehouse.
- [ ] Edit warehouse.
- [ ] Identify warehouse by name.
- [ ] Maintain warehouse-specific inventory.

## 9.2 Stock configuration

- [ ] Track stock level per warehouse/product/variant as applicable.
- [ ] Configure replenishment rules per warehouse.
- [ ] Expose current availability to fulfillment logic.

## 9.3 Shipping-cost weighting configuration

- [ ] Store warehouse/shipment cost inputs needed by the split algorithm.
- [ ] Configure shipping-cost weighting.
- [ ] Use weighting to influence split selection and minimize number of shipments as required by business rules.

## 9.4 Fulfillment data integrity

- [ ] Never allocate more than physically/operationally available stock.
- [ ] Re-check stock before committing fulfillment.
- [ ] Track allocated/fulfilled/backordered quantity separately where appropriate.
- [ ] Maintain warehouse-level allocation details for every fulfilled order line.

**Source basis:** warehouses, per-warehouse stock/replenishment rules, and shipping-cost weighting are configuration requirements. [Source: DealFlow360 PDF, p. 4]

---

# 10. Automatic Multi-Warehouse Fulfillment Splitting

## 10.1 Trigger

- [ ] Run fulfillment recommendation after quote approval / when the order becomes fulfillment-eligible.
- [ ] Also support recalculation when stock availability changes before final fulfillment.

## 10.2 Allocation inputs

- [ ] Product/variant.
- [ ] Required quantity.
- [ ] Warehouse availability.
- [ ] Warehouse configuration.
- [ ] Shipping-cost weighting.
- [ ] Shipment-count implications.

## 10.3 Allocation outputs

- [ ] Warehouse name.
- [ ] Quantity fulfilled from warehouse.
- [ ] Estimated shipment count.
- [ ] Estimated shipment cost.
- [ ] Remaining unfulfilled quantity, when applicable.

## 10.4 Recommended split behavior

- [ ] Prefer an allocation that can satisfy the required quantity with current stock.
- [ ] When one warehouse cannot fully satisfy the order, allow split across multiple warehouses.
- [ ] Minimize shipment count according to configured weighting.
- [ ] Consider shipping cost when selecting between feasible allocations.
- [ ] Do not allocate unavailable quantities.

## 10.5 Manual override

- [ ] Show recommended split.
- [ ] Allow authorized operations user to choose Manual Override.
- [ ] Allow manual quantities per warehouse.
- [ ] Validate that manually requested allocations do not exceed available stock.
- [ ] Recalculate remaining quantity/backorder after manual allocation.
- [ ] Record who made the override and when.

## 10.6 Consolidation of remaining backorder

- [ ] Detect when previously unavailable stock arrives.
- [ ] Detect remaining backordered quantity that can now be consolidated.
- [ ] Display a "Consolidate Remaining Backorder" prompt automatically.
- [ ] Allow authorized operations user to accept consolidation.
- [ ] Update warehouse allocation/fulfillment state consistently.

## 10.7 Backorder business logic

- [ ] If total available stock is insufficient, fulfill available quantity.
- [ ] Record the remainder as backorder.
- [ ] Keep backorder quantity visible to operations.
- [ ] Do not mark the order fully fulfilled while quantity remains backordered.
- [ ] Re-evaluate when stock changes.

## 10.8 Algorithm specification gap

The source requires automatic splitting using live stock and shipping-cost weighting while minimizing shipment count, but it does not prescribe a mathematical optimizer.

- [ ] Document the allocation objective and priority order.
- [ ] Define tie-breaking behavior.
- [ ] Define whether shipment count or shipping cost has priority when they conflict.
- [ ] Define whether warehouses have other constraints such as product eligibility, capacity, region, or handling restrictions if those are later introduced.

---

# 11. Quotation Data Model and Lifecycle

## 11.1 Quote header

- [ ] Quote ID/reference.
- [ ] Customer.
- [ ] Sales rep.
- [ ] Currency where applicable.
- [ ] Quote status/stage.
- [ ] Approval status.
- [ ] Total amount.
- [ ] Margin indicators.
- [ ] Relevant timestamps.

## 11.2 Quote lines

- [ ] Product.
- [ ] Variant where applicable.
- [ ] Quantity.
- [ ] Base/resolved price.
- [ ] Applied discount.
- [ ] Tax.
- [ ] Line total.
- [ ] One-time vs recurring classification.
- [ ] Subscription plan reference for recurring lines.
- [ ] Margin contribution or required source data for margin calculation.

## 11.3 Quote lifecycle states

Recommended state model derived from the source flow:

- [ ] Draft.
- [ ] Pending approval.
- [ ] Approved.
- [ ] Rejected.
- [ ] Revision requested / returned.
- [ ] Sent.
- [ ] Under negotiation.
- [ ] Confirmed.
- [ ] In fulfillment.
- [ ] Partially fulfilled / backordered.
- [ ] Fulfilled.
- [ ] Billing in progress / billed.
- [ ] Paid, where payment state is tracked.

> The source explicitly uses customer-facing statuses such as **Sent**, **Under Negotiation**, and **Confirmed**, plus draft/pending approval examples and the quote-to-fulfillment/billing flow. The remaining granular states above are an implementation decomposition, not quoted source terminology.

## 11.4 State-transition safeguards

- [ ] Define legal transitions.
- [ ] Reject invalid transitions server-side.
- [ ] Prevent fulfillment before approval when approval is required.
- [ ] Prevent customer confirmation from bypassing a newly required approval cycle.
- [ ] Preserve prior state history where auditability is required.

---

# 12. Sales Workspace Navigation

## 12.1 Top navigation

- [ ] Quotations.
- [ ] Pipeline.
- [ ] Reload Data.
- [ ] Go to Back-end.
- [ ] Close Workspace.

## 12.2 Navigation behavior

- [ ] Quotations opens active/draft quotation list.
- [ ] Pipeline opens Kanban-style deal pipeline.
- [ ] Reload Data refreshes pricing, stock, and approval data from backend.
- [ ] Go to Back-end opens authorized configuration/settings.
- [ ] Close Workspace exits the current sales working session/view.

**Source basis:** sales workspace navigation and actions are explicitly defined on pages 5-6.

---

# 13. Quotation List and Pipeline

## 13.1 Quote list

- [ ] Display selectable quotation cards/rows.
- [ ] Show customer.
- [ ] Show amount.
- [ ] Show stage/status.
- [ ] Support examples such as Draft and Pending Approval.
- [ ] Selecting a quotation opens its quotation builder.

## 13.2 Pipeline/Kanban

- [ ] Provide a Kanban-style deal pipeline view.
- [ ] Represent quotation/deal stage visually.
- [ ] Allow opening the underlying quotation.
- [ ] Keep stage values synchronized with backend state.

## 13.3 List filtering/search recommendations

> The source explicitly defines reporting filters, but does not fully specify quote-list filters.

- [ ] Add pagination for large quote sets.
- [ ] Add status/stage filtering where useful.
- [ ] Add customer/rep search where useful.
- [ ] Ensure list data is authorization-filtered server-side.

---

# 14. Quotation Builder - Products and Cart

## 14.1 Product selection

- [ ] Select products across Hardware, Services, and Subscriptions.
- [ ] Select variants where applicable.
- [ ] Add product to cart.
- [ ] Retain product category for discount evaluation.

## 14.2 Quantity management

- [ ] Increase quantity.
- [ ] Decrease quantity.
- [ ] Reject invalid quantity values.
- [ ] Recalculate totals after quantity change.
- [ ] Recalculate margin impact after quantity change when required.
- [ ] Re-evaluate approval risk after material changes.

## 14.3 Discounts

- [ ] Apply line-level discount.
- [ ] Apply order-level discount.
- [ ] Display applied discount.
- [ ] Validate discount against governance rules.
- [ ] Allow quote to continue to approval workflow when discount exceeds configured limits.
- [ ] Do not let frontend validation be the only enforcement layer.

## 14.4 Totals and margin

- [ ] Show line totals.
- [ ] Show quote/order total.
- [ ] Show live margin indicator.
- [ ] Update margin immediately after product/quantity/discount changes.
- [ ] Update margin immediately after adding an upsell recommendation.

## 14.5 Submission

- [ ] Confirm and evaluate approval requirement.
- [ ] Route automatically to approval where needed.
- [ ] Move directly to fulfillment when no approval is required and all other prerequisites are met.

---

# 15. Discount Calculation and Commercial Calculation Layer

## 15.1 Calculation requirements

- [ ] Maintain unambiguous base price.
- [ ] Apply variant extra price where applicable.
- [ ] Apply applicable discount.
- [ ] Calculate line subtotal.
- [ ] Calculate tax using configured tax rules.
- [ ] Calculate order total.
- [ ] Calculate margin using configured cost/margin source.

## 15.2 Order-level vs line-level discount handling

- [ ] Define precedence when both line-level and order-level discounts exist.
- [ ] Ensure discount governance sees the effective commercial discount pattern.
- [ ] Ensure the resulting amount is auditable.

## 15.3 Specification gap

The source requires line-level and order-level discounts and a live margin indicator but does not provide the exact discount-stacking formula or tax-calculation formula.

- [ ] Document exact calculation order.
- [ ] Document rounding policy.
- [ ] Document tax-inclusion/exclusion treatment.
- [ ] Document how order-level discount affects line-level risk analysis.

---

# 16. Upsell and Cross-Sell Recommendation Engine

## 16.1 Trigger

- [ ] Display recommendation panel while building a quotation.
- [ ] Evaluate current cart/quote state.
- [ ] Refresh recommendations when relevant cart contents change.

## 16.2 Recommendation inputs

- [ ] Co-purchase history, where available.
- [ ] Active promotions.
- [ ] Minimum margin threshold.
- [ ] Current quote/cart contents.

## 16.3 Ranking

- [ ] Rank suggestions based on co-purchase history.
- [ ] Rank promoted products higher when promotion is active.
- [ ] Filter out suggestions below the minimum margin threshold.
- [ ] Avoid recommending already-added products where business rules do not permit duplicate recommendation.

## 16.4 Suggestion display

Each suggestion must show:

- [ ] Suggested product.
- [ ] Margin delta if added.
- [ ] Promotion tag where applicable.
- [ ] Add to Quote action.
- [ ] Dismiss action.

## 16.5 Immediate impact

- [ ] Clicking Add to Quote adds the item to the quote.
- [ ] Recalculate quote total immediately.
- [ ] Recalculate margin indicator immediately.
- [ ] Re-evaluate approval requirements if the added line changes discount/risk.

## 16.6 Configuration option

The source marks the setup area as optional, while the frontend special flow expects recommendations.

- [ ] Support configurable rule-based recommendation setup.
- [ ] Allow promoted products to rank higher.
- [ ] Allow minimum margin thresholds.
- [ ] Allow historical co-purchase signals.

## 16.7 Specification gap

- [ ] Define how co-purchase score is calculated.
- [ ] Define promotion boost.
- [ ] Define tie-breaking.
- [ ] Define whether recommendations are product-level or variant-level.
- [ ] Define what happens when no historical co-purchase data exists.

**Source basis:** the panel ranks suggestions from co-purchase history and active promotions and shows margin impact; backend setup includes optional product-pairing rules and minimum-margin thresholds. [Source: DealFlow360 PDF, pp. 4, 7]

---

# 17. Margin Engine

## 17.1 Live margin requirements

- [ ] Calculate quote-level margin.
- [ ] Calculate incremental margin delta for recommended product additions.
- [ ] Recompute after quantity changes.
- [ ] Recompute after discount changes.
- [ ] Recompute after product additions/removals.

## 17.2 Margin governance

- [ ] Use margin thresholds for recommendation eligibility where configured.
- [ ] Do not expose a recommendation solely because it increases revenue if it violates minimum margin rules.

## 17.3 Specification gap

The source requires a live margin indicator but does not explicitly define the cost basis or formula.

- [ ] Define product cost source.
- [ ] Define whether tax/shipping/warehouse cost contributes to margin.
- [ ] Define rounding.
- [ ] Define treatment of recurring revenue in margin calculations.

---

# 18. Fulfillment and Warehouse Split Screen

## 18.1 Screen content

- [ ] Show recommended warehouse split.
- [ ] Show warehouse name.
- [ ] Show quantity from each warehouse.
- [ ] Show estimated shipment count.
- [ ] Show estimated shipment cost.

## 18.2 User actions

- [ ] Accept Suggested Split.
- [ ] Manual Override.

## 18.3 Acceptance criteria

- [ ] Recommendation reflects current stock.
- [ ] Recommendation does not over-allocate.
- [ ] Accepting recommendation persists allocation.
- [ ] Manual override is validated.
- [ ] Backorder appears for unmet quantity.
- [ ] Stock-arrival event can prompt consolidation.

---

# 19. Subscription / Recurring Plan Configuration

## 19.1 Plan setup

- [ ] Define recurring plans.
- [ ] Support monthly plan.
- [ ] Support quarterly plan.
- [ ] Support yearly plan.
- [ ] Attach plan to specific products/services.

## 19.2 Proration configuration

- [ ] Configure proration rules for mid-cycle quantity change.
- [ ] Configure proration rules for mid-cycle plan change.
- [ ] Determine effective date for change.
- [ ] Recalculate prorated amount.

## 19.3 Cancellation/refund configuration

- [ ] Configure cancellation rules.
- [ ] Configure partial-refund rules.
- [ ] Trigger credit note when applicable.

## 19.4 Specification gaps

The source requires configurable proration and cancellation/partial-refund rules but does not specify the exact day-count convention or formula.

- [ ] Define calendar-day vs billing-period-day calculation.
- [ ] Define whether unused portion is refundable.
- [ ] Define effective-date behavior.
- [ ] Define rounding.
- [ ] Define credit-note vs refund precedence.

**Source basis:** recurring plans, proration, cancellation, and partial-refund configuration are required on page 4; the billing screen requirements are on page 7.

---

# 20. Hybrid Billing - One-Time + Recurring Lines

## 20.1 Order composition

- [ ] Permit one order to contain one-time product lines.
- [ ] Permit one order to contain recurring subscription lines.
- [ ] Keep line types clearly distinguishable.
- [ ] Prevent recurring plan data from being missing on recurring lines.

## 20.2 Billing schedule

- [ ] Generate upcoming billing schedule for recurring lines.
- [ ] Keep one-time billing separate from recurring billing.
- [ ] Show billing schedule to authorized internal users.
- [ ] Ensure recurring lines continue according to plan after initial order confirmation.

## 20.3 Billing changes

- [ ] Support mid-cycle quantity change.
- [ ] Apply configured proration.
- [ ] Support plan change.
- [ ] Apply configured proration.
- [ ] Support cancellation.
- [ ] Trigger partial refund/credit note when applicable.

## 20.4 Reconciliation

- [ ] Finance/Operations can reconcile recurring billing.
- [ ] Finance/Operations can reconcile credit-note-related transactions.

## 20.5 Acceptance criteria

- [ ] Mixed order creates one-time billing outcome plus recurring schedule.
- [ ] Recurring schedule is visible.
- [ ] Mid-cycle change creates correct configured proration.
- [ ] Cancellation creates correct refund/credit behavior according to configuration.

**Source basis:** a single order may mix one-time products and recurring subscription lines, with billing schedules and proration. [Source: DealFlow360 PDF, pp. 2, 7, 9, 11]

---

# 21. Customer Portal Negotiation

## 21.1 Separate restricted application surface

- [ ] Implement a real customer-facing route/view.
- [ ] Use customer-scoped authorization.
- [ ] Do not expose internal navigation.
- [ ] Do not expose backend configuration.
- [ ] Do not expose approval controls reserved for internal users.

## 21.2 Quote display

- [ ] Show quotation details.
- [ ] Show current status.
- [ ] Support at least Sent, Under Negotiation, Confirmed as customer-facing states.

## 21.3 Negotiation features

- [ ] Line-level comment.
- [ ] Line-level question.
- [ ] Line-level change request.
- [ ] Counter discount proposal.
- [ ] Submit Request.
- [ ] Confirm Quotation.

## 21.4 Negotiation workflow

- [ ] Customer submits request.
- [ ] Quote status changes appropriately.
- [ ] Internal sales rep can see/respond to negotiation request.
- [ ] Material commercial changes are recalculated server-side.
- [ ] Approval rules are re-evaluated.
- [ ] If thresholds are exceeded, quote re-enters approval automatically.
- [ ] If thresholds are not exceeded, quote can move directly toward fulfillment after confirmation.

## 21.5 Confirmation

- [ ] Customer can confirm final terms with one click.
- [ ] Confirmation must operate on the latest authoritative quote revision.
- [ ] Prevent confirmation against a stale/replaced quote revision when a newer negotiation change exists.

## 21.6 Customer communication/audit

- [ ] Persist customer comments and change requests.
- [ ] Link each request to the relevant quote/line.
- [ ] Record timestamps.
- [ ] Record customer actor.
- [ ] Preserve accepted/rejected negotiation history.

**Source basis:** the customer portal and automatic re-approval behavior are explicitly required on pages 3, 7-9 and in the quick test flow.

---

# 22. Deal Health and Anomaly Dashboard

## 22.1 Stalled deals

- [ ] Detect quotations inactive longer than a configured number of days.
- [ ] Make inactivity threshold configurable.
- [ ] Show stalled deals as dashboard alerts.
- [ ] Link alert directly to the related quotation.

## 22.2 Discount anomaly detection

- [ ] Detect discounts well above a sales rep's historical average.
- [ ] Configure/analyze the historical baseline.
- [ ] Show anomaly alert.
- [ ] Link alert to related quote.

## 22.3 Delivery promise slippage

- [ ] Track promised delivery date/state where available.
- [ ] Detect slippage.
- [ ] Show delivery-promise slippage indicator.
- [ ] Link to underlying quotation/order.

## 22.4 Automated nudge/escalation

- [ ] Allow a nudge or escalation action from an alert.
- [ ] Record that action for audit/history.
- [ ] Define recipient and escalation behavior as configurable workflow.

## 22.5 Specification gaps

The source defines the three alert categories but does not specify the exact anomaly formulas, lookback windows, or escalation channels.

- [ ] Define historical-average window.
- [ ] Define minimum sample size before anomaly detection becomes active.
- [ ] Define anomaly threshold.
- [ ] Define inactivity calculation (last quote edit, last customer event, or another timestamp).
- [ ] Define delivery-promise source and comparison rule.
- [ ] Define nudge/escalation recipients and channel.

**Source basis:** deal health requirements are specified on page 8.

---

# 23. Reporting and Dashboard Configuration

## 23.1 Reporting menu

- [ ] Provide dashboard/reporting area.
- [ ] Show sales performance.
- [ ] Support relevant quote/order analytics.

## 23.2 Mandatory filters

### Period

- [ ] Today.
- [ ] Week.
- [ ] Custom date range.

### Sales Team / Rep

- [ ] Filter by responsible sales rep.
- [ ] Filter by sales team.

### Approval Status

- [ ] Pending.
- [ ] Approved.
- [ ] Rejected.

### Product / Category

- [ ] Filter by product.
- [ ] Filter by category.
- [ ] Support analysis of best-selling items.
- [ ] Support analysis of most-discounted items.

## 23.3 Export

- [ ] Export reports to PDF.
- [ ] Export reports to XLS.
- [ ] Ensure exported report respects active filters.
- [ ] Ensure exported data is authorization-scoped.

## 23.4 Reporting integrity

- [ ] Use transactional data as source of truth.
- [ ] Do not use fabricated demo metrics.
- [ ] Clearly define date semantics/timezone.
- [ ] Ensure counts and totals match underlying quotation/order state.

**Source basis:** reporting configuration and filters are specified on pages 4-5; PDF/XLS export is required.

---

# 24. Payment and Invoice Status Flow

The source's quick test explicitly requires recording a payment and checking that invoice status updates correctly, even though the detailed module breakdown is lighter on payment mechanics.

## 24.1 Payment recording

- [ ] Provide an authorized way to record payment.
- [ ] Link payment to the relevant invoice/order.
- [ ] Prevent duplicate payment records where the same payment reference is reused.
- [ ] Update invoice status after payment.

## 24.2 Invoice status

- [ ] Define status values required by the billing implementation.
- [ ] At minimum, demonstrate the status update after payment in the quick test.
- [ ] Keep status transition authoritative on the backend.

## 24.3 Reconciliation

- [ ] Finance/Operations can reconcile billing and credit-note events.
- [ ] Payment state must not silently contradict invoice state.

## 24.4 Specification gaps

- [ ] Define partial-payment behavior.
- [ ] Define payment reference/idempotency rules.
- [ ] Define invoice state machine.
- [ ] Define refund/payment reversal behavior if required.

**Source basis:** quick test flow requires recording a payment and verifying invoice status updates correctly. [Source: DealFlow360 PDF, p. 11]

---

# 25. Audit Trail

## 25.1 Required audited events from source

- [ ] Approval.
- [ ] Rejection.
- [ ] Quote edit affecting commercial state.
- [ ] User/actor.
- [ ] Timestamp.
- [ ] Reason.

## 25.2 Recommended additional audited events

- [ ] Quote created.
- [ ] Quote submitted.
- [ ] Quote returned for revision.
- [ ] Quote sent to customer.
- [ ] Customer negotiation request.
- [ ] Customer counter-discount.
- [ ] Customer confirmation.
- [ ] Approval-cycle creation.
- [ ] Warehouse split acceptance.
- [ ] Warehouse manual override.
- [ ] Backorder creation.
- [ ] Backorder consolidation.
- [ ] Subscription modification.
- [ ] Cancellation/refund/credit note trigger.
- [ ] Payment recorded.

## 25.3 Audit quality

- [ ] Append-only behavior for critical audit events recommended.
- [ ] Store before/after state or structured change details where practical.
- [ ] Allow authorized users to inspect relevant history.
- [ ] Never rely solely on mutable UI state as an audit record.

---

# 26. End-to-End Workflow Implementation

## 26.1 Login and setup

- [ ] Sales rep signs up/logs in.
- [ ] Admin can configure backend basics.
- [ ] Seed/configure at least one discount tier.
- [ ] Seed/configure at least one warehouse.
- [ ] Seed/configure at least one subscription plan.

## 26.2 Quote creation

- [ ] Rep creates customer quotation.
- [ ] Adds products.
- [ ] Applies discount.
- [ ] Views margin.
- [ ] Sees upsell/cross-sell recommendations.

## 26.3 Approval branch

- [ ] High discount or elevated blended risk automatically triggers approval.
- [ ] Sales Manager sees approval task.
- [ ] Finance appears only if required.
- [ ] Approval decision is audited.

## 26.4 Fulfillment branch

- [ ] After approval/no-approval path, system generates warehouse recommendation.
- [ ] Recommendation uses current stock.
- [ ] Split across warehouses when necessary.
- [ ] Manual override available.
- [ ] Backorder created when quantity remains unavailable.

## 26.5 Billing branch

- [ ] Mixed one-time/recurring order supported.
- [ ] Billing schedule generated.
- [ ] One-time billing handled separately.
- [ ] Recurring schedule visible.

## 26.6 Negotiation branch

- [ ] Customer receives portal access/link.
- [ ] Customer views quote.
- [ ] Customer requests larger discount.
- [ ] Quote automatically re-enters approval when threshold is exceeded.

## 26.7 Confirmation branch

- [ ] Customer confirms final terms.
- [ ] System confirms latest approved commercial state.
- [ ] Fulfillment/billing proceeds.

## 26.8 Monitoring/reporting

- [ ] Manager sees deal-health signals.
- [ ] Reports can be filtered.
- [ ] Reports can be exported.

**Source basis:** the complete end-to-end flow is explicitly listed in the source's page 9 section. [Source: DealFlow360 PDF, pp. 9-10]

---

# 27. Quick Test Flow - Mandatory Acceptance Run

This section should be runnable as a formal smoke/acceptance test. The source says each step should produce a visible, correct result before continuing.

## QT-01 - Login and basic setup

- [ ] Sign up or log in.
- [ ] Configure one discount tier.
- [ ] Configure one warehouse.
- [ ] Configure one subscription plan.
- [ ] **Expected:** setup data persists and becomes available to downstream workflows.

## QT-02 - Create discounted quotation

- [ ] Create quotation.
- [ ] Add a product.
- [ ] Apply discount higher than normally allowed.
- [ ] **Expected:** quote identifies elevated approval/risk state.

## QT-03 - Automatic manager approval

- [ ] Submit/confirm quotation.
- [ ] Do not manually request approval.
- [ ] **Expected:** system automatically routes quotation to Sales Manager.

## QT-04 - Upsell and live margin

- [ ] Open quote builder.
- [ ] Accept one upsell recommendation.
- [ ] **Expected:** line is added.
- [ ] **Expected:** order total updates immediately.
- [ ] **Expected:** margin updates immediately.

## QT-05 - Warehouse allocation and split

- [ ] Approve quote.
- [ ] Open fulfillment.
- [ ] **Expected:** correct warehouse supplies available stock.
- [ ] Create a shortage scenario.
- [ ] **Expected:** order splits across two warehouses when needed.

## QT-06 - Hybrid billing

- [ ] Add one-time product.
- [ ] Add recurring subscription line.
- [ ] Confirm order.
- [ ] **Expected:** one-time billing and recurring billing/schedule are handled separately and correctly.

## QT-07 - Customer negotiation re-approval

- [ ] Open customer portal view.
- [ ] Customer requests a larger discount.
- [ ] **Expected:** quote becomes Under Negotiation / equivalent workflow state.
- [ ] **Expected:** system re-evaluates discount/risk.
- [ ] **Expected:** quote re-enters approval automatically when threshold is exceeded.

## QT-08 - Payment and invoice state

- [ ] Confirm order.
- [ ] Record payment.
- [ ] **Expected:** invoice status updates correctly.

## QT-09 - Backorder consolidation

- [ ] Create an order with unavailable quantity.
- [ ] **Expected:** available quantity is fulfilled and remainder is backordered.
- [ ] Simulate/record stock arrival.
- [ ] **Expected:** "Consolidate Remaining Backorder" prompt appears automatically.

## QT-10 - Audit trail

- [ ] Inspect quote history.
- [ ] **Expected:** approval/rejection/edit actions show actor, timestamp, and reason where applicable.

---

# 28. Feature-by-Feature Definition of Done

Every feature is complete only when all applicable items below are true:

- [ ] Backend data model exists.
- [ ] Backend service/business logic exists.
- [ ] API/input validation exists.
- [ ] Authorization is enforced server-side.
- [ ] UI exists for authorized users where required.
- [ ] Empty/loading/error states are handled.
- [ ] Business rules are covered by tests.
- [ ] Relevant state transitions are tested.
- [ ] Audit trail is implemented where applicable.
- [ ] No demo-only hardcoded behavior is used.
- [ ] Feature works with real persisted state.
- [ ] Feature participates correctly in downstream workflows.
- [ ] Feature has at least one positive and one negative/edge-case test.
- [ ] Feature can survive page reload and uses backend state as source of truth.

---

# 29. Recommended Data Model Checklist

> The source describes behavior rather than a formal schema. The following is an implementation-oriented decomposition derived from those behaviors.

## Identity / access

- [ ] User.
- [ ] Role.
- [ ] Session / authentication record as appropriate.
- [ ] Customer.
- [ ] Customer-user association.

## Commercial master data

- [ ] Product.
- [ ] Product category.
- [ ] Product variant.
- [ ] Variant attributes/values.
- [ ] Price list.
- [ ] Price list rules.
- [ ] Customer tier.
- [ ] Tax configuration.

## Discount governance

- [ ] Discount tier policy.
- [ ] Category discount policy.
- [ ] Approval-chain definition.
- [ ] Approval threshold/risk configuration.
- [ ] Approval cycle.
- [ ] Approval step.

## Sales

- [ ] Quotation.
- [ ] Quotation line.
- [ ] Quote revision/version if required.
- [ ] Discount details.
- [ ] Quote status history.
- [ ] Customer negotiation request/comment.

## Recommendation engine

- [ ] Product pairing/co-purchase rule or derived relationship.
- [ ] Promotion flag/rule.
- [ ] Minimum margin threshold configuration.
- [ ] Recommendation event/decision data if required for analytics.

## Inventory

- [ ] Warehouse.
- [ ] Warehouse stock.
- [ ] Replenishment rule.
- [ ] Shipment/fulfillment allocation.
- [ ] Backorder.
- [ ] Backorder consolidation event or state.
- [ ] Shipping-cost configuration.

## Subscription / billing

- [ ] Subscription plan.
- [ ] Recurring order line.
- [ ] Billing schedule.
- [ ] Billing event/invoice.
- [ ] Proration rule.
- [ ] Credit note.
- [ ] Payment.

## Monitoring / audit

- [ ] Deal health event/state or derived alert.
- [ ] Discount anomaly record/derived alert.
- [ ] Delivery slippage state.
- [ ] Nudge/escalation event.
- [ ] Audit event.

---

# 30. API / Service Boundary Checklist

> Exact API paths are not prescribed by the source. The objective is to ensure each business capability has a clear backend boundary.

- [ ] Authentication service.
- [ ] User/role authorization service.
- [ ] Customer service.
- [ ] Product/variant service.
- [ ] Price-list service.
- [ ] Discount-policy service.
- [ ] Approval-routing service.
- [ ] Quotation service.
- [ ] Recommendation service.
- [ ] Inventory service.
- [ ] Fulfillment-allocation service.
- [ ] Subscription service.
- [ ] Billing service.
- [ ] Payment service.
- [ ] Customer-portal service.
- [ ] Deal-health/alert service.
- [ ] Reporting/export service.
- [ ] Audit service.

## API safety checks

- [ ] Validate every mutable business request server-side.
- [ ] Check current user and role.
- [ ] Check resource ownership/scope.
- [ ] Recalculate business-critical values from authoritative data.
- [ ] Use idempotency where a retry could create duplicate business events.
- [ ] Return machine-readable validation/error states.

---

# 31. Business-Rule Engine Checklist

The following rules are central and must be implemented as reusable application logic rather than UI-specific conditions.

## BR-01 - Customer-tier discount policy

- [ ] Resolve customer tier.
- [ ] Resolve configured tier ceiling.
- [ ] Compare applied discount with ceiling.

## BR-02 - Category discount policy

- [ ] Resolve product category.
- [ ] Resolve category ceiling.
- [ ] Compare applied discount with category ceiling.

## BR-03 - Line breach detection

- [ ] Detect any line that exceeds its effective allowed limit.
- [ ] Preserve breach magnitude for risk computation/explanation.

## BR-04 - Blended quotation risk

- [ ] Aggregate line-level risk according to documented formula.
- [ ] Consider multiple small breaches.
- [ ] Determine overall quote risk.

## BR-05 - Highest required approval level

- [ ] Evaluate all relevant lines/risk.
- [ ] Determine highest required approval level.
- [ ] Build approval chain accordingly.

## BR-06 - Mandatory re-approval after material term change

- [ ] Re-evaluate discount/risk after customer negotiation or other material commercial edits.
- [ ] Invalidate/supersede stale approval when required.

## BR-07 - Upsell margin gating

- [ ] Candidate must satisfy minimum margin threshold.
- [ ] Promoted products may receive ranking boost.
- [ ] Co-purchase history may influence ranking.

## BR-08 - Live warehouse allocation

- [ ] Use current stock.
- [ ] Split across warehouses when needed.
- [ ] Account for shipment-cost weighting.
- [ ] Minimize shipment count according to configured policy.

## BR-09 - Backorder creation

- [ ] Backorder unmet quantity.
- [ ] Keep fulfilled and remaining quantities distinct.

## BR-10 - Backorder consolidation

- [ ] Re-evaluate on new stock.
- [ ] Prompt for consolidation when applicable.

## BR-11 - Hybrid billing

- [ ] Separate one-time and recurring billing obligations.
- [ ] Generate recurring schedule.

## BR-12 - Proration

- [ ] Apply configured proration when a supported mid-cycle change occurs.

## BR-13 - Cancellation/refund/credit

- [ ] Apply configured policy.
- [ ] Trigger refund or credit note when applicable.

## BR-14 - Customer confirmation

- [ ] Confirm latest quote state.
- [ ] If new terms exceed threshold, approval must run before fulfillment.

## BR-15 - Deal health

- [ ] Stalled quote detection.
- [ ] Discount anomaly detection.
- [ ] Delivery promise slippage detection.

---

# 32. Edge-Case Checklist

## Pricing / discount

- [ ] No customer-tier price found.
- [ ] No category-specific discount rule found.
- [ ] Discount exactly at ceiling.
- [ ] Discount slightly over ceiling.
- [ ] Negative discount.
- [ ] Excessive discount.
- [ ] Multiple category lines with different ceilings.
- [ ] Multiple small discount breaches.
- [ ] Quote revised after approval.

## Quotation

- [ ] Empty quote.
- [ ] Removing the last line.
- [ ] Quantity becomes zero.
- [ ] Product becomes inactive after being added.
- [ ] Price changes while quote is being edited.
- [ ] Tax configuration changes before finalization.

## Approval

- [ ] Approver sees no longer-valid quote revision.
- [ ] Two users act on the same approval step simultaneously.
- [ ] Rejection followed by revision.
- [ ] Return for revision followed by re-submission.
- [ ] Finance required only for some quotes.

## Inventory

- [ ] Stock exactly equals requested quantity.
- [ ] Stock one unit short.
- [ ] No warehouse has stock.
- [ ] Stock split across two warehouses.
- [ ] Stock split across more than two warehouses.
- [ ] Manual override requests more than available.
- [ ] Stock changes during fulfillment.
- [ ] Backorder stock becomes available later.

## Subscription / billing

- [ ] Subscription starts at boundary.
- [ ] Mid-cycle quantity increase.
- [ ] Mid-cycle quantity decrease.
- [ ] Plan change mid-cycle.
- [ ] Cancellation.
- [ ] Partial refund required.
- [ ] Credit note required.
- [ ] One-time plus recurring on same order.

## Customer portal

- [ ] Customer requests no commercial change, only a comment.
- [ ] Customer requests a price change within threshold.
- [ ] Customer requests a price change above threshold.
- [ ] Customer tries to access another customer's quote.
- [ ] Customer opens an outdated portal version after newer revision exists.

## Reporting

- [ ] Empty result set.
- [ ] Custom range with no records.
- [ ] Large date range.
- [ ] Export with filters.
- [ ] Export by restricted user role.

---

# 33. Testing Strategy Checklist

## 33.1 Unit tests

- [ ] Discount ceiling resolution.
- [ ] Category-specific ceiling resolution.
- [ ] Line breach detection.
- [ ] Blended risk calculation.
- [ ] Approval-chain selection.
- [ ] Margin calculation.
- [ ] Recommendation ranking/filtering.
- [ ] Warehouse allocation.
- [ ] Backorder quantity calculation.
- [ ] Subscription proration.
- [ ] Cancellation/refund logic.
- [ ] Deal-health rules.

## 33.2 Integration tests

- [ ] Quote creation -> approval routing.
- [ ] Approval -> fulfillment.
- [ ] Fulfillment -> backorder.
- [ ] Stock arrival -> consolidation.
- [ ] Quote -> mixed billing schedule.
- [ ] Customer negotiation -> re-approval.
- [ ] Confirmation -> fulfillment/billing.
- [ ] Payment -> invoice status update.

## 33.3 Authorization tests

- [ ] Sales rep cannot perform manager approval.
- [ ] Sales manager cannot access finance-only operation unless role policy allows it.
- [ ] Customer cannot access internal workspace.
- [ ] Customer cannot access another customer quote.
- [ ] Unauthorized user cannot mutate configuration.

## 33.4 Concurrency tests

- [ ] Two users editing same quote.
- [ ] Two approvers acting concurrently.
- [ ] Two fulfillment operations allocating same stock.
- [ ] Duplicate customer confirmation.
- [ ] Duplicate payment request.

## 33.5 End-to-end smoke tests

- [ ] Execute QT-01 through QT-10.
- [ ] Capture visible result for every required step.
- [ ] Confirm database state after each consequential step.

---

# 34. Demo and Deliverables Checklist

The source explicitly identifies these deliverables.

## Application

- [ ] Working backend.
- [ ] Working frontend.
- [ ] Sample seed data.

## Live demo

- [ ] Five-minute live demo.
- [ ] Cover at least two complete end-to-end flows.
- [ ] At least one flow reaches fulfillment and/or billing.
- [ ] Demonstrate actual business logic, not just navigation.

## Architecture

- [ ] One-page architecture diagram.
- [ ] Show data model at useful level.
- [ ] Show how major modules connect.
- [ ] Show frontend/backend boundary.
- [ ] Show core workflow/major services.

## Roadmap

- [ ] Short note explaining what would be built next with more time.

## Bonus

- [ ] Multi-currency support may be added.
- [ ] Multi-company support may be added.

**Source basis:** technical guidelines and deliverables. [Source: DealFlow360 PDF, pp. 10-11]

---

# 35. Source-Explicit Non-Functional Requirements Summary

These are directly represented or clearly implied by the source document.

- [ ] **Technology agnostic:** any backend/frontend/database stack is acceptable.
- [ ] **Business-logic first:** focus on business logic, data model, and end-to-end workflow.
- [ ] **Application-driven rules:** approval routing, discount governance, warehouse splitting, and billing proration must be real application logic, not hardcoded/faked.
- [ ] **Separate customer surface:** customer negotiation must be a real separate restricted view.
- [ ] **Production-like thinking:** real-time-ish approval routing, warehouse coordination, portal collaboration, role-based access, audit trails, recurring billing, and analytics.
- [ ] **Real persisted state:** core flow must work using actual configured/seeded data.
- [ ] **Demonstrability:** the system must support the specified live demonstration.
- [ ] **Traceability:** users/actions must be auditable for approvals/rejections/edits.
- [ ] **Configurability:** tiers, chains, warehouse behavior, subscription plans, margins, and dashboard thresholds are intended to be configurable.
- [ ] **Extensibility:** bonus multi-currency/multi-company can be added without redesigning core business logic.

---

# 36. Implementation Sequencing Recommendation

This is an implementation order derived from feature dependencies; it is not a source-mandated sequence.

## Phase 1 - Foundation

- [ ] Authentication.
- [ ] Roles/RBAC.
- [ ] Users.
- [ ] Customers.
- [ ] Audit infrastructure.
- [ ] Core configuration framework.

## Phase 2 - Product and pricing

- [ ] Products.
- [ ] Categories.
- [ ] Variants.
- [ ] Customer tiers.
- [ ] Price lists.
- [ ] Tax/pricing calculation layer.

## Phase 3 - Quotation engine

- [ ] Quote and quote lines.
- [ ] Cart operations.
- [ ] Discount calculation.
- [ ] Margin calculation.
- [ ] Quote lifecycle.

## Phase 4 - Discount governance / approval

- [ ] Discount policies.
- [ ] Blended-risk engine.
- [ ] Approval routing.
- [ ] Approval actions.
- [ ] Audit trail.

## Phase 5 - Warehouse

- [ ] Warehouses.
- [ ] Inventory.
- [ ] Allocation algorithm.
- [ ] Manual override.
- [ ] Backorder.
- [ ] Consolidation.

## Phase 6 - Hybrid billing

- [ ] Subscription plans.
- [ ] Billing schedules.
- [ ] Proration.
- [ ] Cancellation/refund/credit.
- [ ] One-time invoice.
- [ ] Payment/invoice state.

## Phase 7 - Recommendation engine

- [ ] Co-purchase data/rules.
- [ ] Promotion ranking.
- [ ] Margin threshold.
- [ ] Recommendation panel.

## Phase 8 - Customer negotiation

- [ ] Portal authentication.
- [ ] Customer quote view.
- [ ] Comments/questions.
- [ ] Counter-offers.
- [ ] Re-approval loop.
- [ ] Confirmation.

## Phase 9 - Deal health and reporting

- [ ] Stalled quote detection.
- [ ] Discount anomaly detection.
- [ ] Delivery slippage.
- [ ] Nudge/escalation.
- [ ] KPI dashboard.
- [ ] Report filters.
- [ ] PDF/XLS export.

## Phase 10 - Hardening and demo

- [ ] Authorization testing.
- [ ] Concurrency testing.
- [ ] End-to-end testing.
- [ ] Seed data.
- [ ] Architecture diagram.
- [ ] Five-minute demo script.
- [ ] Roadmap note.

---

# 37. Final Release Gate

Do not treat the implementation as complete until every applicable gate is checked.

## Functional gates

- [ ] Authentication works for internal and customer users.
- [ ] RBAC works server-side.
- [ ] Product/variant management works.
- [ ] Customer-tier pricing works.
- [ ] Discount ceilings work.
- [ ] Category-specific ceilings work.
- [ ] Blended risk works according to documented formula.
- [ ] Approval routing is automatic.
- [ ] Approval audit trail exists.
- [ ] Upsell/cross-sell recommendations work.
- [ ] Margin updates live.
- [ ] Multi-warehouse split works.
- [ ] Manual override works.
- [ ] Backorder works.
- [ ] Backorder consolidation prompt works.
- [ ] Hybrid one-time + recurring order works.
- [ ] Billing schedules work.
- [ ] Proration works according to configured rule.
- [ ] Cancellation/refund/credit behavior works.
- [ ] Customer negotiation works in a separate restricted view.
- [ ] Customer counter-discount can trigger re-approval.
- [ ] Deal health alerts work.
- [ ] Reporting filters work.
- [ ] PDF/XLS export works.
- [ ] Payment can be recorded.
- [ ] Invoice status updates correctly.

## Non-functional gates

- [ ] No critical business rule is enforced only in the frontend.
- [ ] No critical business outcome is hardcoded only for the demo.
- [ ] Customer view is truly restricted.
- [ ] Critical actions are auditable.
- [ ] Backend remains source of truth.
- [ ] Data remains consistent across quote, approval, fulfillment, billing, and payment.
- [ ] Seed data is sufficient for the complete demo.
- [ ] Architecture is documented.
- [ ] Error states are handled.
- [ ] Duplicate/concurrent actions are controlled.
- [ ] Role boundaries are tested.

## Demo gates

- [ ] At least two full end-to-end flows are rehearsed.
- [ ] One flow demonstrates discount approval.
- [ ] One flow demonstrates warehouse split and/or hybrid billing.
- [ ] Customer negotiation flow is ready.
- [ ] Dashboard/reporting flow is ready.
- [ ] All QT acceptance steps can be demonstrated without manual database intervention.

---

# 38. Specification Gaps Requiring Product Decisions Before Final Implementation

The source is strong on required behavior but intentionally leaves several exact mechanics open. These should be converted into explicit configuration or policy before implementation is considered production-ready.

- [ ] Exact blended discount risk formula.
- [ ] Numeric blended-risk thresholds for each approval level.
- [ ] Precedence between customer-tier and category-specific discount ceilings.
- [ ] Exact stacking behavior between line-level and order-level discounts.
- [ ] Margin formula and cost source.
- [ ] Warehouse allocation optimization priority when shipment count and shipping cost conflict.
- [ ] Tie-breaking among equally valid warehouses.
- [ ] Exact replenishment-rule semantics.
- [ ] Exact subscription proration formula/day-count convention.
- [ ] Cancellation effective-date rules.
- [ ] Partial refund calculation.
- [ ] Credit note issuance rules.

- [ ] Co-purchase recommendation scoring.
- [ ] Promotion ranking boost.
- [ ] Historical-average window for discount anomalies.
- [ ] Minimum data/sample size for anomaly detection.
- [ ] Exact anomaly threshold.
- [ ] Stalled-deal inactivity timestamp and threshold configuration.
- [ ] Delivery-promise source and slippage threshold.
- [ ] Nudge/escalation channels and recipients.
- [ ] Payment/invoice state machine.
- [ ] Partial-payment handling.
- [ ] Payment idempotency/reference rules.
- [ ] Quote revision/version semantics.
- [ ] Price-list change behavior for existing drafts.

**Implementation rule:** these decisions should be explicit, documented, testable, and preferably configurable. They should not exist as hidden constants scattered throughout frontend components or controller code.

---

# 39. Compact Traceability Matrix

| Requirement Area | Primary Features | Critical Business Logic | Acceptance Evidence |
|---|---|---|---|
| Authentication | A1 | Role/user authentication and customer portal access | Login/portal test |
| Products | A2 | Product/category/variant/pricing master data | Product CRUD test |
| Discount governance | A3 | Tier ceiling + category ceiling + blended risk | QT-02/QT-03 |
| Approval | A3/B4 | Automatic routing + approve/reject/revise + audit | Approval workflow |
| Warehousing | A4/B6 | Live stock + split + shipment count/cost + override | QT-05 |
| Subscription | A5/B7 | Recurring plans + proration + cancellation/credit | QT-06 |
| Upsell/Cross-sell | A6/B5 | Co-purchase + promotion + margin threshold | QT-04 |
| Sales workspace | B1 | Navigation and backend refresh | Workspace test |
| Quotation | B2/B3 | Cart + quantities + discount + totals + margin | Quote builder test |
| Customer negotiation | B8 | Customer changes + counter discount + re-approval | QT-07 |
| Deal health | B9 | Stalled + anomaly + delivery slippage | Dashboard test |
| Reporting | A7 | Date/team/status/product filters + exports | Report/export test |
| Payment/invoice | Quick test | Payment -> invoice status update | QT-08 |
| Audit | A3/B4 + cross-cutting | Actor + timestamp + reason | Audit inspection |
| End-to-end | Section 5 | Quote -> approval -> fulfillment -> billing -> reporting | QT-01 to QT-10 |

---

# 40. Source Reference Notes

- **Pages 1-2:** product overview, goal, key outcomes, and role definitions.
- **Pages 3-4:** role responsibilities and backend configuration requirements.
- **Pages 5-8:** sales workspace, quote builder, approval, recommendation, fulfillment, billing, portal, and deal-health features.
- **Pages 9-10:** complete end-to-end flow and technical guidelines.
- **Page 11:** quick test flow from login to payment.
- **Pages 11-12:** blended discount risk concept and worked example.
- **Page 13:** importance/rationale and production-like system-thinking framing.

Primary source: **DealFlow360 - An Intelligent, Self Governing Sales Operations Platform**. The source explicitly emphasizes business-logic correctness, role-based access, discount governance, multi-warehouse coordination, hybrid billing, customer negotiation, auditability, and analytics rather than UI-only implementation. [Source: DealFlow360 PDF, pp. 1, 10-13]

---

## Final implementation principle

> **Every visible feature must correspond to a persisted business state, an authoritative backend rule, an authorized action, a testable workflow transition, and (where required) an audit event.**
>
> The implementation should demonstrate the real business engine behind DealFlow360: the system should decide what needs approval, how stock should be allocated, how billing should be split/prorated, when negotiation forces re-approval, and which deals require attention - rather than relying on manual demo steps or UI-only logic.
