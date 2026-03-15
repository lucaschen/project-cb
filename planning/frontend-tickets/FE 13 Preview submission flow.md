# FE 13 Preview submission flow

## Status
Not started.

Vision alignment note:
- This ticket should no longer imply that Project CB becomes the primary submission store
- The main product direction is host-app-owned submission handling, so this ticket should focus on runtime completion and submission handoff semantics

## Goal
Complete the preview or runtime playthrough experience with final submission handling, completion states, and host-app-oriented handoff behavior.

## Scope
- Submission action in preview mode
- Success state and completion UX
- Failure and retry handling
- Reset/restart preview behavior for repeated testing
- Define the first host-app-facing submission handoff behavior, even if preview still uses a simulated or sandboxed environment

## Technical Notes
- Keep preview submissions clearly scoped so they do not get confused with future public respondent submissions
- Query invalidation and local execution state should be reset cleanly between runs
- Completion UX should be polished enough for demos
- The current product direction keeps response ownership with the host app, so FE 13 should not assume Project CB stores canonical end-user submissions by default

## Acceptance Criteria
- User can submit a completed preview flow
- Success and failure states are handled clearly
- Preview can be restarted for repeated internal testing
- Submission behavior does not leave the preview in a broken state

## Dependencies
- [FE 12 Flow preview and playthrough](./FE%2012%20Flow%20preview%20and%20playthrough.md)

## Backend Dependencies
- No concrete backend blocker ticket is defined yet
- This ticket still needs product and API clarification on whether preview submissions are local-only demo actions, runtime callbacks, or a thin backend-backed handoff model

## Open Questions
- What the first host-app submission handoff contract should look like
- Whether preview submissions persist anywhere inside Project CB or stay fully demo-only in MVP
