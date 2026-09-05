# DealFlow360 — Shared Contracts Specification

## 1. Overview

This document specifies the frozen interface contracts shared between **Developer A** and **Developer B** in `packages/contracts`.

The purpose of these contracts is to ensure **complete developer independence**:
Developer B can construct and test Quotations, Fulfillment, Billing, and Portals using `CustomerReferenceDto` and `ProductReferenceDto` contracts without requiring Developer A's internal implementation to be finished.

---

## 2. Customer Contracts

### `CustomerReferenceDto`
Consumed by: Developer B (Quotation, Customer Portal)  
Produced by: Developer A (Customer Module)

```typescript
export const CustomerReferenceSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  tier: CustomerTierEnum, // 'ENTERPRISE' | 'GOLD' | 'SILVER' | 'BRONZE'
});

export type CustomerReferenceDto = z.infer<typeof CustomerReferenceSchema>;
```

---

## 3. Product Contracts

### `ProductReferenceDto`
Consumed by: Developer B (Quotation, Upsell, Fulfillment)  
Produced by: Developer A (Product Catalog)

```typescript
export const ProductReferenceSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: ProductCategoryEnum,
  type: ProductTypeEnum, // 'ONE_TIME' | 'RECURRING'
  unitPrice: z.number(),
  costPrice: z.number(),
  maxAllowedDiscount: z.number(),
});

export type ProductReferenceDto = z.infer<typeof ProductReferenceSchema>;
```

---

## 4. Commercial Governance Evaluation Contract

### `CommercialEvaluationDto`
Consumed by: Developer B (Negotiation Portal, Control Tower)  
Produced by: Developer A (Discount Governance & Risk Engine)

```typescript
export const CommercialEvaluationSchema = z.object({
  quoteId: z.string(),
  netTotal: z.number(),
  marginAmount: z.number(),
  marginPercentage: z.number(),
  riskScore: z.number().min(0).max(10),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  violations: z.array(PolicyViolationSchema),
  requiredApprovalRoles: z.array(z.enum(['SALES_MANAGER', 'FINANCE'])),
  requiresApproval: z.boolean(),
  evaluatedAt: z.string(),
});

export type CommercialEvaluationDto = z.infer<typeof CommercialEvaluationSchema>;
```

---

## 5. Summary Envelope Standard

All REST API responses follow the standard JSON envelope defined in `packages/contracts/src/common/index.ts`:

```json
{
  "success": true,
  "data": { ... },
  "message": null,
  "meta": null
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "POLICY_VIOLATION",
    "message": "Discount exceeds threshold for SILVER customer",
    "details": { ... }
  }
}
```
