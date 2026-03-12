# FE 07 Step list management

## Goal
Enable users to manage the ordered set of steps within a flow.

## Scope
- Add step
- Delete step
- Reorder steps
- Select active step
- Show step summary in the list

## Technical Notes
- Reordering should be explicit and stable because branching later depends on predictable step identity
- Keep temporary reorder interactions local until persisted successfully
- Step list UX should support future step type expansion without redesigning the entire panel

## Acceptance Criteria
- User can add a new step to a flow
- User can remove an existing step
- User can reorder steps and see the new order reflected consistently
- Selecting a step updates the editing context in the builder

## Dependencies
- [FE 06 Flow builder shell](./FE%2006%20Flow%20builder%20shell.md)

## Backend Dependencies
- Blocked by [BE 03 Step CRUD and ordering APIs](../backend-tickets/BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Requires step list, update, delete, and reorder APIs in addition to the current create-step support

## Open Questions
- Whether a default step template is created when adding a step
- Whether duplicate-step behavior is needed in MVP
