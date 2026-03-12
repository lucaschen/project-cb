# FE 12 Flow preview and playthrough

## Goal
Provide a full internal-only respondent-style preview experience for a flow.

## Scope
- Launch preview from the builder
- Render the flow as a real step-by-step form experience
- Support navigation between steps
- Enforce supported validation behavior
- Evaluate branching/conditional logic during playthrough

## Technical Notes
- This experience must be real enough for stakeholder demos, not a visual mock
- Share rendering logic with step preview where practical, but keep the execution model separate from editor state
- Restrict access to authenticated internal users only for MVP

## Acceptance Criteria
- Internal user can launch preview from a flow
- User can move through the flow like a respondent would
- Validation blocks invalid progression where appropriate
- Branching logic affects navigation correctly during preview
- Preview experience is clearly separated from editing mode

## Dependencies
- [FE 10 Flow branching and logic](./FE%2010%20Flow%20branching%20and%20logic.md)
- [FE 11 Step preview in editor](./FE%2011%20Step%20preview%20in%20editor.md)

## Backend Dependencies
- No concrete backend blocker ticket is defined yet
- This ticket still needs product and API clarification on whether preview should run from local draft state, saved backend state, or both

## Open Questions
- Whether preview opens inline, in a drawer, or on a dedicated route
- Whether preview starts from draft data or only saved data
