# DealFlow360 - Sales-to-Cash Commercial Governance Platform

DealFlow360 is a policy-driven B2B sales-to-cash platform designed for enterprise deal governance.

## Architecture

Modular Monolith with `pnpm` Workspaces:

```
dealflow360/
├── apps/
│   ├── web/           # React 19 + Vite frontend
│   └── api/           # Express 5 backend API
├── packages/
│   ├── db/            # Prisma 7 PostgreSQL schema & seed logic
│   ├── contracts/     # Shared Zod schemas & API types
│   └── domain/        # Framework-independent commercial engine logic
├── docs/              # Specifications, business rules & API contracts
├── skills/            # Agent workflow & domain skills
├── AGENTS.md          # Project operating manual & governance rules
├── DESIGN.md          # Design system tokens & visual rules
└── TASKS.md           # Implementation task list
```

## Getting Started

### Prerequisites

- Node.js >= 24 LTS
- pnpm >= 10.x
- PostgreSQL >= 18.x

### Installation

```bash
pnpm install
```

### Commands

- `pnpm dev`: Start web & API development servers
- `pnpm build`: Build all workspace packages and apps
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm lint`: Run code linting
- `pnpm test`: Execute Vitest test suites
