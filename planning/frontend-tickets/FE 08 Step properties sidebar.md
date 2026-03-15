# FE 08 Step properties sidebar

## Status
Not started.

Current state:
- The current selection panel supports node-level edits such as step name, next-node connection, decision fallback, and decision rules
- Step-element property editing itself is not implemented yet

## Goal
Provide the primary editing surface for common step properties.

## Scope
- Edit labels, help text, placeholders, required state
- Edit supported validation settings
- Edit basic display and behavior settings
- Persist changes for the selected step

## Technical Notes
- Keep fast, high-frequency edits in a sidebar or equivalent always-available panel
- Validation config should be represented in a backend-friendly shape early
- Use controlled state carefully so the editor remains responsive during frequent edits

## Acceptance Criteria
- User can edit common step properties for the selected step
- Changes are reflected in the builder state immediately
- Persisted step configuration matches backend expectations
- Invalid property input is surfaced clearly

## Dependencies
- [FE 07 Step list management](./FE%2007%20Step%20list%20management.md)

## Backend Dependencies
- Blocked by [BE 04 Step element and property editing APIs](../backend-tickets/BE%2004%20Step%20element%20and%20property%20editing%20APIs.md)
- Requires read/update persistence for existing step element properties, not only create-time element payloads

## Open Questions
- Exact validation types required for MVP
- Whether all step types share one sidebar schema or require per-type panels
