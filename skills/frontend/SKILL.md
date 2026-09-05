---
name: frontend
description: React 19, Vite, design tokens, component architecture, state management, and accessibility guidelines for DealFlow360.
---

# Frontend Skill — DealFlow360

## Guidelines
- UI components live in `apps/web/src/components` and `apps/web/src/features`.
- Centralized Axios client (`apps/web/src/lib/api/axiosClient.ts`) handles API requests, Bearer authorization, and refresh loops.
- Frontend must never calculate authoritative risk scores or approval requirements.
