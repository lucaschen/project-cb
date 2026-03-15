# FE 01 Project setup

## Status
Implemented.

Implemented work:
- App bootstrapped with `React`, `Vite`, `TanStack Query`, and shared root providers
- Route structure, protected/public route handling, and shared shell patterns added
- Shared API client, env handling, query client setup, and reusable UI primitives established
- Lightweight builder state scaffolding and app-level utilities added

## Goal
Establish the frontend application foundation for the MVP using `React + Vite`, `Tailwind`, `TanStack Query`, and `Zustand`.

## Scope
- Initialize app structure and route layout
- Configure Tailwind and base design tokens
- Set up API client conventions and environment configuration
- Add `TanStack Query` provider and query defaults
- Add `Zustand` store scaffolding for local UI/editor state
- Establish folder conventions for pages, features, shared components, hooks, and services
- Add error boundary, not-found route, and loading shell patterns

## Technical Notes
- Prefer API-backed source of truth; do not mirror server state into `Zustand`
- Keep `Zustand` limited to ephemeral UI state, editor state, and transient builder interactions
- Define a consistent request wrapper for auth/session handling and future API errors
- Set up route-level code organization early so builder complexity does not sprawl

## Acceptance Criteria
- App boots locally with the agreed stack
- Shared providers are wired once at the app root
- Environment variable pattern is documented in the codebase
- Base layout, loading, and error patterns exist and are reusable
- Folder structure supports feature-based implementation for later tickets

## Dependencies
- None

## Open Questions
- Final routing library choice if not already decided
- Preferred form library if needed later for auth and step editors
