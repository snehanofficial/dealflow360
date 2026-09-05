# Implementation Prompt: DealFlow360 Repository Bootstrap

## Goal
Bootstrap the DealFlow360 monorepo foundation with pnpm workspaces, strict TypeScript configuration, workspace packages (`packages/db`, `packages/contracts`, `packages/domain`), application foundations (`apps/web`, `apps/api`), official/vendor agent skills, and documentation placeholders.

## Relevant Skills Read
- `skills/domain/SKILL.md` (Domain architecture & modular boundaries)
- `skills/frontend/SKILL.md` (React 19 / Vite / Tailwind structure)
- `skills/prisma/SKILL.md` (Prisma 7 setup & database package rules)
- `skills/testing/SKILL.md` (Vitest & Supertest testing structure)

## Code / Config Inspected
- `AGENTS.md` (Project rules and architectural manual)
- `docs/*` (Vision, implementation rules, business logic context)
- `skills-lock.json` (Existing skill registrations)

## Decisions and Assumptions
- Monorepo using `pnpm` workspaces.
- Node.js 24 LTS, TypeScript 7.x, React 19.2.x, Vite 8.x, Express 5.x, Prisma 7.x stable, Vitest 4.x.
- Strict architecture boundary: `packages/domain` MUST NOT depend on React, Express, or Prisma.
- No business logic or UI component features in bootstrap task.

## Expected Files to Create/Update
- `pnpm-workspace.yaml`
- `package.json`
- `tsconfig.json`
- `.env.example`
- `.gitignore`
- `README.md`
- `packages/contracts/*` (`package.json`, `tsconfig.json`, `src/index.ts`, subfolder placeholders)
- `packages/domain/*` (`package.json`, `tsconfig.json`, `src/index.ts`, engine folder placeholders)
- `packages/db/*` (`package.json`, `tsconfig.json`, `prisma/schema.prisma`, `prisma/seed.ts`, `src/index.ts`)
- `apps/api/*` (`package.json`, `tsconfig.json`, `src/app.ts`, subfolder placeholders)
- `apps/web/*` (`package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, subfolder placeholders)
- `docs/*` (`architecture.md`, `domain-model.md`, `business-rules.md`, `api-contracts.md`, `demo-script.md`, `references/ui/README.md`)

## Security Considerations
- Ensure `.gitignore` ignores secret environment files (`.env`, `.env.local`), database credentials, and build artifacts.
- No hardcoded secrets in code, `.env.example`, or configs.

## Domain / Business-Rule Considerations
- Domain package structured into 11 distinct engine directories ready for deterministic domain implementations.
- Shared contracts package established for boundary validation using Zod.

## Acceptance Criteria
- Workspace packages resolve dependencies without errors.
- `pnpm install`, `pnpm typecheck`, `pnpm lint`, and `pnpm test` run clean.
- Vendor agent skills installed cleanly.

## Checks to Run
- `npx skills add prisma/skills@prisma-database-setup`
- `npx skills add prisma/skills@prisma-client-api`
- `npx skills add prisma/skills@prisma-cli`
- `npx skills add vercel-labs/agent-skills@vercel-react-best-practices`
- `pnpm install`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

## Exact Manual Verification Steps
1. Verify package dependency tree in `node_modules`.
2. Verify strict TypeScript compiler outputs across `packages/*` and `apps/*`.
3. Check `skills-lock.json` and local skill registrations.
