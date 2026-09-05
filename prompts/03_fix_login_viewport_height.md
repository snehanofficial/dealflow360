# Implementation Prompt: Fix Login Page Viewport Height Scaling (100% Zoom 1080p Fit)

## Goal
Fix the root cause of vertical content overflow and cut-off elements on `LoginForm.tsx` when viewed at 100% browser zoom on standard 1080p displays (viewport height ~800px-900px). Ensure the entire login page (header branding, form, SSO, footer, hero tagline, feature cards, and stat badges) fits inside the viewport without requiring vertical scrolling or forcing users to zoom out to 67%.

---

## Relevant Skills Read
- `skills/frontend/SKILL.md`
- `skills/domain/SKILL.md`

---

## Code & Config Inspected
- `apps/web/src/features/auth/LoginForm.tsx`
- User screenshot evidence showing at 100% zoom on 1080p:
  - Bottom 2 feature cards and stats footer are pushed off screen.
  - Left column copyright footer and social login buttons are truncated.
  - Excessive vertical padding (`xl:p-20` = 160px vertical padding), large element margins (`my-8`, `py-8`, `mb-8`), and uncalibrated typography heights.

---

## Decisions & Assumptions
1. **Viewport Height Constraints (`lg:h-screen lg:max-h-screen`)**:
   - On desktop viewports (`lg:` >= 1024px), restrict the layout container to `lg:h-screen lg:max-h-screen flex flex-col justify-between`.
   - On mobile/tablet screens (< 1024px), allow full vertical scrolling (`overflow-y-auto`).
2. **Compact & Proportional Vertical Spacing**:
   - **Paddings**: Reduce container padding from `p-12/p-16/p-20` to `p-6 lg:p-8 xl:p-12`.
   - **Margins & Gaps**: Reduce vertical gaps (`space-y-4` instead of `space-y-5`, `my-4 xl:my-6` instead of `my-8`, remove redundant `py-8`).
3. **Optimized Typography & Card Densities**:
   - Headline: Change from `text-4xl xl:text-5xl 2xl:text-6xl` to `text-3xl lg:text-4xl xl:text-[2.75rem]` with compact line-height.
   - Hero Cards: Reduce padding to `p-3.5 xl:p-4`, icon size to `w-8 h-8` (20px icon), title to `text-sm font-semibold`, description to `text-xs leading-normal`.
   - Footer stats: Reduce padding top to `pt-4 xl:pt-6`, numbers to `text-lg xl:text-xl font-bold`.

---

## Expected Files to Change
- `apps/web/src/features/auth/LoginForm.tsx`

---

## Security & Domain Considerations
- All authentication handlers, form inputs, validation rules, and error states remain fully functional.

---

## Acceptance Criteria
1. At 100% zoom on a standard 1080p display (viewport height ~850px), the complete login form, 2x2 hero feature cards, and bottom stats footer fit fully on screen without vertical scrollbars or cut-off content.
2. The UI looks crisp, proportional, and enterprise-grade without sparse gaps or oversized text blocks.
3. TypeScript compilation and existing tests pass.
