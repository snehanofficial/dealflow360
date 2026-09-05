---
name: domain
description: Business rules, domain services, state transitions, policy evaluation, risk, approvals, and scenario tests for DealFlow360.
---

# Domain Skill — DealFlow360

## Guidelines
- `packages/domain` contains framework-independent commercial engines.
- Do NOT import Express, React, Prisma, or browser APIs in `packages/domain`.
- All commercial engines (pricing, margin, policy, risk, approval, fulfillment, billing) must be deterministic and pure.
