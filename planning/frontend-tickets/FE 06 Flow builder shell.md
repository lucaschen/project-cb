# FE 06 Flow builder shell

## Goal
Create the main flow-builder shell that hosts step management, step editing, and preview entry points.

## Scope
- Builder route and layout
- Flow-level header and navigation controls
- Left/right panel structure if needed
- Local editor state boundaries
- Load existing flow into builder context

## Technical Notes
- Use `Zustand` only for local builder interaction state, selection state, panel state, and unsaved editor context
- Keep server data fetching and persistence in `TanStack Query` or feature-level service hooks
- Builder layout should anticipate sidebars, modals, and preview transitions without requiring major refactors

## Acceptance Criteria
- Builder route loads an existing flow reliably
- Layout supports step list, editing surface, and contextual panels
- Local UI state is isolated from server state
- User has clear affordances for saving and navigating builder actions

## Dependencies
- [FE 05 Flow creation and metadata](./FE%2005%20Flow%20creation%20and%20metadata.md)

## Open Questions
- Whether builder uses nested routes or a single-page state machine
- Whether unsaved-change guards are needed immediately
