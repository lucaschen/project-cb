# FE 13 Preview submission flow

## Goal
Complete the preview/playthrough experience with final submission handling and completion states.

## Scope
- Submission action in preview mode
- Success state and completion UX
- Failure and retry handling
- Reset/restart preview behavior for repeated testing

## Technical Notes
- Keep preview submissions clearly scoped so they do not get confused with future public respondent submissions
- Query invalidation and local execution state should be reset cleanly between runs
- Completion UX should be polished enough for demos

## Acceptance Criteria
- User can submit a completed preview flow
- Success and failure states are handled clearly
- Preview can be restarted for repeated internal testing
- Submission behavior does not leave the preview in a broken state

## Dependencies
- [FE 12 Flow preview and playthrough](./FE%2012%20Flow%20preview%20and%20playthrough.md)

## Open Questions
- Whether preview submissions persist as real records or demo-only records in MVP
