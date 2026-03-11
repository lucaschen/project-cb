# FE 11 Step preview in editor

## Goal
Let users preview the currently edited step during the editing process.

## Scope
- Inline or side-panel step preview surface
- Reflect current editable state in the preview
- Preview supported validation and display behavior for the current step
- Support rapid edit-preview iteration

## Technical Notes
- This is distinct from the full flow playthrough
- Preview should be close enough to runtime rendering that stakeholders and builders can trust it
- Prefer sharing rendering primitives with the full preview/playthrough implementation where possible

## Acceptance Criteria
- User can preview the selected step while editing
- Preview updates as relevant step properties change
- Preview reflects basic validation and display behavior accurately
- Step preview does not require leaving the builder context

## Dependencies
- [FE 08 Step properties sidebar](./FE%2008%20Step%20properties%20sidebar.md)
- [FE 09 Step modal editor](./FE%2009%20Step%20modal%20editor.md)

## Open Questions
- Whether preview updates live or on manual refresh for more expensive step types
