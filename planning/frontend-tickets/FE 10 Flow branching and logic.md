# FE 10 Flow branching and logic

## Goal
Allow flows to express meaningful conditional behavior between steps.

## Scope
- Configure branching rules between steps
- Define conditional visibility or navigation logic where supported
- Show logic configuration in a comprehensible editor UI
- Validate logic before persistence

## Technical Notes
- Branching rules must operate on stable step identifiers, not only list indices
- Prefer a minimal but real logic model for MVP rather than a visually elaborate but shallow experience
- The editor should help prevent impossible or broken routing states

## Acceptance Criteria
- User can define supported branching rules in the frontend
- Logic configuration can be saved and reloaded correctly
- Broken or incomplete logic is surfaced before save or preview
- Preview execution can consume the configured logic model

## Dependencies
- [FE 07 Step list management](./FE%2007%20Step%20list%20management.md)
- [FE 08 Step properties sidebar](./FE%2008%20Step%20properties%20sidebar.md)

## Open Questions
- Exact condition operators supported in MVP
- Whether branching is step-level only or field-level as well
