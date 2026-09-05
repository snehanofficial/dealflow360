# Implementation Prompt: Align UpsellPanel with DealFlow360 Design Tokens

## Goal
Refactor `UpsellPanel.tsx` in `apps/web/src/features/quotes/components/` to strictly align with DealFlow360 design tokens (`DESIGN.md` & `apps/web/src/styles/index.css`), replacing arbitrary Tailwind slate/purple/indigo colors and hardcoded hex values with standard design system tokens.

---

## Relevant Skills Read
- `DESIGN.md` — Visual Guidelines, Color Tokens, Typography, Spacing, & Component Patterns
- `AGENTS.md` — UI work rules & governance visual requirements

---

## Code & Config Inspected
- `apps/web/src/features/quotes/components/UpsellPanel.tsx` — Current implementation using generic `slate-900`, `purple-500/20`, `indigo-700`, hardcoded `bg-[#714B67] hover:bg-[#5c3c54]`, `emerald-500`, etc.
- `apps/web/src/styles/index.css` — CSS variables & Tailwind v4 theme configuration
- `apps/web/src/components/ui/Badge.tsx` & `Button.tsx` — Design token standard references

---

## Decisions & Implementation Plan
1. **Header Styling**:
   - Header container: Use Primary Brand background `bg-[#714B67] text-white px-5 py-4 flex items-center justify-between rounded-t-lg`.
   - Icon badge & count pill: Use subtle primary overlays `bg-white/10 text-white border border-white/20` and `bg-white/15 text-[#F3E9F1] border border-white/20`.
   - Subtitle: `text-[#F3E9F1]/80`.

2. **Empty State & Cards**:
   - Empty state background: `bg-[#F8F9FA]` (`surface`) with `text-[#28A745]` (`success` token) for check icon, `text-[#212529]` (`text-primary`) for title, and `text-[#6C757D]` (`text-secondary`) for subtitle.
   - Recommendation card container: `bg-[#F8F9FA] hover:bg-white border border-slate-200 hover:border-[#714B67]/40 rounded-lg p-4`.

3. **Tag / Badge Refactoring**:
   - Category Tag: `bg-[#F1F3F5] text-[#6C757D]` (`muted-bg` + `text-secondary`).
   - Rank Tag: `bg-[#F3E9F1] text-[#714B67] border border-[#E2CEE0]` (`primary-light` + `primary`).
   - Promo Tag: `bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30` (`warning` soft fill + dark warning text).
   - Recurring Billing Tag: `bg-[#F3E9F1] text-[#714B67] border border-[#E2CEE0]` (`primary-light` + `primary`).

4. **Typography & Metrics Colors**:
   - Revenue Impact: `text-[#28A745]` (`success` token).
   - Positive Margin Impact: `text-[#714B67]` (`primary` brand).
   - Negative Margin Impact: `text-[#DC3545]` (`danger` token).
   - Info icon & reason: `text-[#714B67]` info icon, `bg-white border border-slate-200` box, `text-[#6C757D]` text.

5. **Primary Action Button**:
   - `bg-[#714B67] hover:bg-[#5F3D56] text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:ring-offset-2 disabled:opacity-50 min-h-[36px] cursor-pointer`.

---

## Expected Files to Change
- `apps/web/src/features/quotes/components/UpsellPanel.tsx`

---

## Acceptance Criteria
1. `UpsellPanel` uses canonical design tokens (`#714B67`, `#5F3D56`, `#F3E9F1`, `#28A745`, `#DC3545`, `#F8F9FA`, `#212529`, `#6C757D`) consistently.
2. Arbitrary non-system colors (`slate-900`, `purple-500/20`, `indigo-700`, `bg-[#5c3c54]`, `emerald-500`) are eliminated.
3. Responsive behavior (360px to 4K) remains intact.
4. TypeScript compilation succeeds without errors.
