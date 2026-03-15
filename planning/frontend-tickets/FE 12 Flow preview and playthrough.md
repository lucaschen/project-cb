# FE 12 Flow preview and playthrough

## Status
Not started.

Vision alignment note:
- This ticket should now be understood as embedded-runtime-aligned preview work, not only an internal-only preview mode

## Goal
Provide a full respondent-style preview and playthrough experience for a flow that exercises the same runtime model the host app will eventually embed.

## Scope
- Launch preview from the builder
- Render the flow as a real step-by-step guided experience
- Support navigation between steps
- Enforce supported validation behavior
- Evaluate branching/conditional logic during playthrough
- Keep the preview architecture aligned with the future embedded React runtime

## Technical Notes
- This experience must be real enough for stakeholder demos, not a visual mock
- Share rendering logic with step preview where practical, but keep the execution model separate from editor state
- Even if launched from an internal route first, the runtime model should stay aligned with the embedded client-facing direction in the product spec

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
- This ticket still needs product and API clarification on whether preview should run from local draft state, saved backend state, or both, and how closely it should mirror the embedded runtime fetch/access path

## Open Questions
- Whether preview opens inline, in a drawer, or on a dedicated route
- Whether preview starts from draft data or only saved data
- How much of the embedded runtime contract should already be exercised by this first preview implementation
