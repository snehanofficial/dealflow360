# DealFlow360 - Canonical API Contract Specification

For detailed field-by-field payload definitions and validation schemas, see [`06_API_CONTRACT.md`](./06_API_CONTRACT.md).

---

## 1. Base URL & Response Envelope

All API endpoints are prefixed with `/api/v1`.

### Success Response Format
```json
{
  "success": true,
  "data": {},
  "message": null,
  "meta": null
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": {}
  }
}
```

---

## 2. API Endpoints Directory

### Authentication & Foundation (`00_BASE_IMPLEMENTATION.md`)
- `POST /api/v1/auth/signup` - Register user account (Public)
- `POST /api/v1/auth/login` - Authenticate credentials, return access token & set HttpOnly refresh cookie (Public)
- `POST /api/v1/auth/refresh` - Rotate refresh token & issue new access token (Public / Cookie)
- `POST /api/v1/auth/logout` - Revoke refresh session & clear cookie (Authenticated)
- `GET  /api/v1/auth/me` - Return current authenticated user profile & permissions (Authenticated)

### Customer & Catalog Management (Developer A)
- `GET  /api/v1/customers` - List customers (`customer.view`)
- `GET  /api/v1/customers/:id` - Get customer details (`customer.view`)
- `POST /api/v1/customers` - Create customer account (`customer.create`)
- `GET  /api/v1/products` - List product catalog (`product.view`)
- `GET  /api/v1/products/:id` - Get product details (`product.view`)
- `POST /api/v1/products` - Create product catalog entry (`product.create`)

### Quotation & Commercial Governance (Developer A)
- `POST  /api/v1/quotes` - Create new draft quotation (`quotation.create`)
- `GET   /api/v1/quotes` - List quotations with filters (`quotation.view`)
- `GET   /api/v1/quotes/:id` - Get quotation detail with lines, risk evaluation & approvals (`quotation.view`)
- `POST  /api/v1/quotes/:id/lines` - Add line item to quote (`quotation.update`)
- `PATCH /api/v1/quotes/:id/lines/:lineId` - Update line quantity/discount (`quotation.update`)
- `DELETE /api/v1/quotes/:id/lines/:lineId` - Remove line item (`quotation.update`)
- `POST  /api/v1/quotes/:id/evaluate` - Recalculate pricing, margin, risk & policy rules (`quotation.update`)
- `POST  /api/v1/quotes/:id/submit` - Submit quote for approval (`quotation.submit`)

### Approval Governance (Developer A)
- `GET  /api/v1/approvals` - List pending approvals (`approval.view`)
- `POST /api/v1/approvals/:id/approve` - Approve commercial quote state (`approval.action`)
- `POST /api/v1/approvals/:id/reject` - Reject commercial quote state (`approval.action`)

### Customer Negotiation Portal (Developer B)
- `GET  /api/v1/portal/quotes/:token` - View quotation via portal token (Public / Token)
- `POST /api/v1/portal/quotes/:token/counter-offer` - Submit customer counteroffer (Public / Token)
- `POST /api/v1/portal/quotes/:token/accept` - Accept quotation (Public / Token)

### Fulfillment & Billing (Developer B)
- `GET  /api/v1/warehouses` - List warehouses & inventory (`fulfillment.view`)
- `POST /api/v1/quotes/:id/fulfillment/compute` - Compute recommended warehouse split (`fulfillment.manage`)
- `POST /api/v1/quotes/:id/fulfillment/override` - Apply manual inventory split override (`fulfillment.manage`)
- `POST /api/v1/quotes/:id/order/confirm` - Confirm order for fulfillment (`order.confirm`)
- `GET  /api/v1/quotes/:id/billing` - Generate billing schedule (`billing.view`)

### Deal Health & Control Tower (Developer B)
- `GET /api/v1/control-tower` - Operational deal dashboard metrics (`dashboard.view`)
- `GET /api/v1/quotes/:id/events` - Fetch immutable audit timeline events (`audit.view`)
