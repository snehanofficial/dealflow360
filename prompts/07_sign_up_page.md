# Implementation Prompt: Enterprise Sign Up Page Implementation

## Goal
Implement a production-grade enterprise Sign Up page (`apps/web/src/features/auth/SignupForm.tsx`) matching DealFlow360 design standards (split-screen layout matching `LoginForm.tsx`), validating email, password, and confirm password matching via `@dealflow360/contracts`, and providing smooth navigation between Login and Signup.

## Relevant Skills Read
- `skills/frontend/SKILL.md`
- `AGENTS.md` (Product Principles & UI Display Adaptability Rules)

## Code / Config Inspected
- `packages/contracts/src/auth/index.ts` (`SignupRequestSchema`)
- `apps/api/src/controllers/authController.ts` (`signup` endpoint handling)
- `apps/web/src/features/auth/AuthContext.tsx` (`signup` method)
- `apps/web/src/features/auth/LoginForm.tsx` (hero banner split-screen UI reference)
- `apps/web/src/features/auth/SignupForm.tsx` (current basic card layout)
- `apps/web/src/routes/AppRoutes.tsx` (`/signup` route configuration)

## Decisions and Assumptions
1. Use `SignupRequestSchema` from `@dealflow360/contracts` with `react-hook-form` and `@hookform/resolvers/zod`.
2. Follow the exact enterprise split-screen design pattern used in `LoginForm.tsx` (`#714B67` primary theme color, brand identity header, hero banner panel on large screens, feature grid, and responsive mobile container).
3. Provide password visibility toggle buttons for both Password and Confirm Password inputs.
4. Show real-time match/mismatch visual feedback for Confirm Password.
5. Provide clear error feedback using the standard `Alert` component.
6. Link `LoginForm.tsx`'s sign-up trigger text to `/signup` and `SignupForm.tsx`'s sign-in trigger text to `/login`.

## Expected Files to Change
- `apps/web/src/features/auth/SignupForm.tsx` (Replace basic layout with enterprise split-screen hero layout and enhanced form controls)
- `apps/web/src/features/auth/LoginForm.tsx` (Update Sign Up link target to `/signup`)

## Requirements
- Responsive from 360px (mobile card wrap) to 4K displays (max width containers, no unhandled body scroll).
- Validation: Name (min 2 chars), Email (valid format), Password (min 8 chars), Confirm Password (matching password).
- Submitting form invokes `useAuth().signup(data)`, logs the user in, and redirects to `/app`.

## Security & Domain Considerations
- All password inputs use `type="password"` with optional eye toggles.
- Passwords are validated client-side and securely posted over HTTP POST to backend endpoint `/api/v1/auth/signup` which hashes passwords using Argon2id and sets HttpOnly refresh cookies.

## Acceptance Criteria
- [x] Sign up page layout matches DealFlow360 design tokens and enterprise split-screen design.
- [x] Form contains Full Name, Email, Password, and Confirm Password fields.
- [x] Password matching validation is enforced both via Zod schema and visually in real time.
- [x] Successful sign up logs user in and navigates to workspace dashboard (`/app`).
- [x] Navigation between `/login` and `/signup` works seamlessly.
- [x] Responsive on viewports from 360px to 3840px+.

## Checks to Run
- `pnpm --filter @dealflow360/web build`

## Exact Manual Test Steps
1. Navigate to `/signup`.
2. Enter mismatched passwords (e.g. `Password123` and `Password456`) and verify error message "Passwords do not match".
3. Enter invalid email and verify email error message.
4. Enter valid matching credentials and submit. Verify user is redirected to `/app`.
