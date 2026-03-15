# FE 10 Flow branching and logic

## Status
Partially implemented.

Implemented work:
- Decision nodes can be added to the builder graph
- Fallback routing can be configured
- Ordered decision rules can be added, deleted, reordered, and pointed at target nodes
- Basic literal comparison rule editing exists
- Builder save and reload persist the authored branching model

Remaining gap:
- The current editor only covers a narrow rule-editing surface
- Field-level logic is still out of scope
- Runtime and preview consumption of the branching model still belongs to later tickets

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
- The implemented first pass is intentionally step-routing-focused and should remain aligned with the builder graph and later embedded runtime

## Acceptance Criteria
- User can define supported branching rules in the frontend
- Logic configuration can be saved and reloaded correctly
- Broken or incomplete logic is surfaced before save or preview
- Preview execution can consume the configured logic model

## Dependencies
- [FE 07 Step list management](./FE%2007%20Step%20list%20management.md)
- [FE 08 Step properties sidebar](./FE%2008%20Step%20properties%20sidebar.md)

## Backend Dependencies
- Blocked by [BE 05 Unified builder graph save and decision logic APIs](../backend-tickets/BE%2005%20Unified%20builder%20graph%20save%20and%20decision%20logic%20APIs.md)
- Requires unified flow-graph persistence so decision-node edits, fallback routing, and step-graph mutations save together instead of through separate direct-flow-child APIs

## Open Questions
- Exact condition operators supported in MVP
- Whether branching is step-level only or field-level as well
