# FE 09 Step modal editor

## Status
Not started.

## Goal
Own the first real step-internal editing experience without bloating the builder sidebar.

## Scope
- Modal-based editor for step-internal configuration
- Use BE 04 step element and property editing APIs for the selected step
- Support staging edits safely before commit
- Create a clear handoff from compact sidebar selection into deeper editing
- Keep graph-level edits in the sidebar and step-internal edits in the modal

## Technical Notes
- FE 08 now owns sidebar UX refresh only
- FE 09 is the first ticket that should consume BE 04 step element/property editing support
- Modal editing should contain step complexity rather than pushing it into the persistent sidebar
- Keep the modal architecture extensible by step type and depth of configuration

## Acceptance Criteria
- User can open a modal editor from a selected step
- User can make step-internal edits without destabilizing the main builder shell
- Save and cancel behaviors are predictable
- Invalid step configuration is blocked or clearly explained
- Persisted step content matches the backend step-element editing contract

## Dependencies
- [FE 08 Builder sidebar UX refresh](./FE%2008%20Step%20properties%20sidebar.md)

## Backend Dependencies
- Depends on [BE 04 Step element and property editing APIs](../backend-tickets/BE%2004%20Step%20element%20and%20property%20editing%20APIs.md)
- FE 09 is the intended frontend consumer of the selected-step read/update element payloads

## Open Questions
- Exact first modal scope for MVP step types
- Whether the first modal writes directly or stages a local draft before commit
