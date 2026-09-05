# Implementation Prompt — Reusable Debounced SearchInput Component & Customer Page Search Refactor

## Goal
Create a highly performant, reusable `SearchInput` component with built-in debouncing, clear actions, visual loading/updating indicators, and keyboard shortcut support. Replace raw/ad-hoc search inputs with this component across modules, starting with `CustomerListPage` and `DashboardLayout`.

## Relevant Skills Read
- `skills/develop/SKILL.md`
- `skills/vercel-react-best-practices/SKILL.md`

## Code / Config Inspected
- `DESIGN.md` (Design system tokens, typography, and focus ring `#714B67`)
- `AGENTS.md` (UI display adaptability rules 360px to 4K)
- `apps/web/src/components/ui/Input.tsx` (Base input styling patterns)
- `apps/web/src/features/customers/CustomerListPage.tsx` (Customer list page search usage)
- `apps/web/src/components/layout/DashboardLayout.tsx` (Header global search input)
- `apps/web/src/components/ui/index.ts` (UI component barrel exports)

## Decisions & Assumptions
1. **Component Design (`SearchInput`)**:
   - Create `apps/web/src/components/ui/SearchInput.tsx` forwardRef component.
   - Internal state `query` for instant keystroke rendering (0ms input latency).
   - Debounced callback invocation via `onDebouncedChange` / `onSearch` after configurable `debounceMs` (default 300ms).
   - Controlled value synchronization: updates internal state when external `value` prop changes.
   - Interactive feedback: Loading spinner when `isLoading` or during pending debounce, one-click `X` clear button when non-empty.
   - Shortcut hint: Optional `showKbdShortcut` prop to render desktop keyboard shortcut indicator (e.g. `⌘K`).
   - Accessible: Proper `aria-label`, `role="search"`, keyboard accessibility (`Escape` key clears search).
2. **Integration in `CustomerListPage`**:
   - Replace raw inline search input and icon container with `<SearchInput>`.
   - Connect `onDebouncedChange` to update `search` query state and reset `page` to 1.
   - Pass `isLoading={isLoading}` to show seamless loading state inside the search box while TanStack Query fetches matching customer records.
3. **Integration in `DashboardLayout`**:
   - Replace header search input with `<SearchInput showKbdShortcut size="sm" placeholder="Search deals, customers, quotes..." />`.

## Expected Files to Change
- `apps/web/src/components/ui/SearchInput.tsx` [NEW]
- `apps/web/src/components/ui/index.ts` [MODIFY]
- `apps/web/src/features/customers/CustomerListPage.tsx` [MODIFY]
- `apps/web/src/components/layout/DashboardLayout.tsx` [MODIFY]
- `apps/web/src/components/ui/SearchInput.test.tsx` [NEW]

## Requirements
- Instant text field update for fast user typing experience.
- Automatic debouncing of backend query updates (default 300ms).
- Instant clear capability when clicking `X` or pressing `Escape`.
- Accessible loading/fetching indicator to indicate network activity or pending debounce.
- Full compliance with `AGENTS.md` responsive & display adaptability guidelines (360px mobile to 4K displays).

## Security & Performance Considerations
- Eliminates excessive backend API queries on every single keystroke.
- Prevents search query race conditions and unnecessary React re-renders.

## Domain / Business-Rule Considerations
- Customer searching is a core capability for deal creation and account lookup; responsive search ensures fast data retrieval without overloading backend services.

## Acceptance Criteria
- **AC-1**: `SearchInput` component created with configurable `debounceMs`, `onDebouncedChange`, `isLoading`, `showClear`, and `showKbdShortcut`.
- **AC-2**: Typing into `SearchInput` provides instant visual feedback while delaying the debounced callback by `debounceMs`.
- **AC-3**: Pressing `X` button or `Escape` key clears input instantly and triggers debounced search with empty string immediately.
- **AC-4**: `CustomerListPage` uses `SearchInput` with `isLoading` indicator, properly resetting table pagination on query changes.
- **AC-5**: `DashboardLayout` header search replaced with `SearchInput`.
- **AC-6**: Responsive across 360px mobile to 4K displays.
- **AC-7**: All TypeScript typechecks, linting, and automated tests pass.

## Checks to Run
- `pnpm --filter @dealflow360/web typecheck` (or `pnpm typecheck`)
- `pnpm --filter @dealflow360/web test` (or `pnpm test`)
- `pnpm lint`

## Exact Manual Test Steps
1. Navigate to Customer Management page (`/customers`).
2. Type "acme" into the search box quickly; verify input text updates instantly without lagging.
3. Observe loading indicator spinning during query execution after 300ms debounce.
4. Verify table filters to matching customers and pagination resets to page 1.
5. Click the `X` clear button; verify search clears immediately and full customer list re-loads.
6. Press `Escape` key while typing in search box; verify search clears.
