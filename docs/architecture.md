# DealFlow360 — Architecture Specification

## Overview

DealFlow360 is built as a modular monolith in a monorepo structure.

## Layers & Boundary Rules

1. **`apps/web`**: React 19 + Vite presentation layer. Never authoritative for commercial rules.
2. **`apps/api`**: Express 5 backend API layer owning HTTP controllers, authentication, authorization, and transactions.
3. **`packages/contracts`**: Shared Zod schemas for request/response contracts across API and Web.
4. **`packages/domain`**: Pure, framework-independent business logic engine (pricing, margin, policy, risk, approval, fulfillment, billing). Must not import React, Express, Prisma, or browser APIs.
5. **`packages/db`**: Prisma 7 ORM persistence mapping to PostgreSQL 18.

## Dependency Direction

```
web → API → application services → domain → persistence → PostgreSQL
```
