# DealFlow360 — Canonical Architecture Specification

For full architectural details, see [`07_FEATURE_MODULES.md`](./07_FEATURE_MODULES.md) and [`00_BASE_IMPLEMENTATION.md`](./00_BASE_IMPLEMENTATION.md).

---

## 1. System Overview

DealFlow360 is structured as a **Modular Monolith** using `pnpm` workspaces. It provides high developer velocity and shared safety while keeping domain boundaries clean.

```text
dealflow360/
├── apps/
│   ├── web/            # Presentation Layer: React 19 + Vite + Tailwind CSS v4
│   └── api/            # Application & HTTP Layer: Express 5 + Zod validation
└── packages/
    ├── contracts/      # Interface Layer: Shared Zod DTOs & API contract types
    ├── domain/         # Business Engine: Pure TypeScript commercial governance logic
    └── db/             # Persistence Layer: Prisma 7 ORM + PostgreSQL 18
```

---

## 2. Dependency Direction & Boundary Rules

The dependency flow is strictly unidirectional:

```text
apps/web ──► apps/api ──► Application Services ──► packages/domain ──► packages/db ──► PostgreSQL
   │                                                    ▲
   └───────────────────► packages/contracts ────────────┘
```

### Strict Boundary Constraints

1. **`packages/domain` must remain framework-independent**:
   - MUST NOT import React, Express, Prisma, Axios, or Browser APIs.
   - MUST contain pure, deterministic commercial governance functions (Pricing, Margin, Policy, Risk, Approvals, Fulfillment, Billing).
2. **`apps/web` is Presentation Only**:
   - MUST NOT execute authoritative commercial rules or risk calculations.
   - All pricing, risk scores, approval routing, inventory checks, and billing schedules must be derived server-side.
3. **`apps/api` Controllers remain thin**:
   - Controllers handle HTTP routing, request parsing, authentication, authorization, service invocation, and standardized JSON output formatting.
4. **`packages/contracts` owns boundaries**:
   - Zod schemas in `packages/contracts` validate input at runtime both on the client and server.

---

## 3. Shared Infrastructure & Security Baseline

- **Authentication**: JWT access token in `Authorization: Bearer <token>` header + HttpOnly secure cookie for refresh tokens with rotation and server-side session tracking.
- **Password Hashing**: Argon2id via `argon2` node package.
- **Authorization**: Permission-based RBAC enforced server-side. Roles: `ADMIN`, `SALES_MANAGER`, `SALES_REP`, `FINANCE_OPERATIONS`, `CUSTOMER`.
- **API Baseline**: Express 5, `helmet`, `cors`, `express-rate-limit`, `cookie-parser`, `pino` logger.
