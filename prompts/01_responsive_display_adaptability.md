# Implementation Prompt: Display Adaptability & Responsiveness Rules + Audit & Fix

## Goal
1. Update `AGENTS.md` to mandate that **every implemented UI feature must be fully adaptive and responsive across display sizes from 360px to 4K displays**, and that `AGENTS.md` instructions must be **strictly followed on every prompt**.
2. Audit and update existing web application components and pages in `apps/web/src` so that all implemented features are adaptive and responsive across mobile (360px+), tablet, laptop, desktop, and ultra-wide/4K (up to 3840px+) screen sizes without breaking layouts, causing horizontal overflow, or hiding key governance capabilities.

---

## Relevant Skills Read
- `skills/frontend/SKILL.md`
- `skills/domain/SKILL.md`

---

## Code & Config Inspected
- `AGENTS.md` (specifically Section 3 "How to work" and Section 4 "UI work")
- `apps/web/src/components/layout/` (Navbar, Sidebar, AppLayout)
- `apps/web/src/features/dashboard/HomePage.tsx`
- `apps/web/src/features/quotes/`
- `apps/web/src/features/auth/LoginForm.tsx`
- `apps/web/src/features/control-tower/`
- `apps/web/src/features/approvals/`
- `apps/web/src/features/portal/`

---

## Decisions & Assumptions
1. **Rule Enforcement**: Update `AGENTS.md` Section 3 ("How to work") and Section 4 ("UI work") to enforce:
   - `AGENTS.md` guidelines MUST be strictly adhered to for every single task/prompt without exception.
   - All UI layouts and components MUST be adaptive and responsive across all display breakpoints from mobile 360px up to 4K displays (3840px+).
   - Use fluid layouts (`max-w-7xl` or `max-w-[1920px]`, responsive grids, flex wraps, touch-friendly targets on small screens, legible scaling on large screens).
2. **Responsive Fixes for Existing UI**:
   - Ensure App Layout sidebar / navigation collapses gracefully or provides a mobile drawer/toggle on screens < 768px.
   - Ensure DataTables, quote cards, metrics grids, and control tower cards wrap cleanly or horizontal-scroll internally without page-level body scroll overflow on mobile (360px+).
   - Container padding and grid columns should scale across breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 4k:grid-cols-6`).

---

## Expected Files to Change
- `AGENTS.md`
- `apps/web/src/components/layout/Navbar.tsx` (or main layout wrapper)
- `apps/web/src/components/layout/AppLayout.tsx`
- `apps/web/src/features/dashboard/HomePage.tsx`
- `apps/web/src/features/auth/LoginForm.tsx`
- `apps/web/src/features/quotes/` (QuoteList, QuoteDetails, etc.)
- `apps/web/src/features/control-tower/`
- `apps/web/src/features/approvals/`

---

## Security & Domain Considerations
- Responsive layout adjustments must not hide required governance controls (e.g. approval buttons, risk violation indicators, supersession badges).
- Authorization and role-based actions must remain functional regardless of screen size.

---

## Acceptance Criteria
1. `AGENTS.md` clearly states that `AGENTS.md` is strictly mandatory for every prompt/task, and explicit mobile-to-4K (360px - 3840px+) responsiveness and adaptability rules are present.
2. The web UI renders cleanly on mobile (360px), tablet (768px), desktop (1280px/1440px), and high-res/4K (2560px/3840px) displays with no unintended layout truncation or unhandled horizontal overflow.
3. Automated test suites / linters pass without regressions.

---

## Verification Steps
- Run `pnpm run lint` and `pnpm run test` (or vitest).
- Check responsive behavior in browser at 360px, 768px, 1280px, and 2560px+ screen widths.
