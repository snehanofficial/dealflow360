# Implementation Prompt: Fix Login UI Layout & Grid Responsiveness

## Goal
Redesign `LoginForm.tsx` UI to follow enterprise-grade design standards and proper layout grids across screen sizes (360px to 4K displays). Eliminate cramped cards, awkward text wrapping, floating card padding bottlenecks, and hardcoded narrow column constraints.

---

## Relevant Skills Read
- `skills/frontend/SKILL.md`
- `skills/domain/SKILL.md`

---

## Code & Config Inspected
- `apps/web/src/features/auth/LoginForm.tsx`
- Screenshot evidence showing 4 cards crammed into 90px columns with vertical text breaking (`Smart\nQuoting`, `End-\nto-\nEnd`) and fixed floating container boundaries.

---

## Decisions & Assumptions
1. **Full Viewport Split-Screen Layout**:
   - Replace the cramped inner container (`max-w-5xl`) with a full viewport split screen layout (`min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full bg-white`).
   - **Left Form Section**: Takes `lg:col-span-5 xl:col-span-4` (or 50% flex column) centered cleanly with ideal typographic width and line heights.
   - **Right Hero Section**: Takes `lg:col-span-7 xl:col-span-8` with rich `#714B67` background, responsive padding, and clear typographic hierarchy.
2. **2x2 Feature Grid for Hero Cards**:
   - Change the feature cards grid from `lg:grid-cols-4` (which crammed 4 cards horizontally into ~400px space) to a clean 2x2 grid (`grid-cols-1 sm:grid-cols-2 gap-4 xl:gap-6`).
   - This gives each card ample horizontal width (~240px+), allowing titles ("Smart Quoting", "Explainable Risk", "Automated Approvals", "End-to-End Fulfillment") and descriptions to render cleanly without awkward word breaks.
3. **Stat Badges & Metrics**:
   - Format footer stats ("2.4x Faster deal cycles", "35% Lower risk exposure", "98% On-time fulfillment") with responsive flex/grid layouts so they align cleanly on large and high-res screen sizes without overflow.

---

## Expected Files to Change
- `apps/web/src/features/auth/LoginForm.tsx`

---

## Security & Domain Considerations
- All authentication handlers (`handleSubmit`, Zod schema validation, API error alerts, navigation state) remain untouched and secure.

---

## Acceptance Criteria
1. The login page fills the screen cleanly without awkward floating card margins.
2. Feature cards in the right hero section render in a spacious 2x2 grid without cramped single-word vertical breaks.
3. Responsive behavior works seamlessly from 360px mobile up to 4K displays.
4. TypeScript compilation and existing tests pass.
