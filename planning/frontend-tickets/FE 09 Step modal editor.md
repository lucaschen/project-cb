# FE 09 Step modal editor

## Status
Not started.

## Goal
Support richer editing flows for complex step configuration that should not be forced into the sidebar.

## Scope
- Modal-based editor for complex step configuration
- Per-step-type advanced settings where required
- Save/cancel behavior with safe local editing state
- Validation and conflict handling before persistence

## Technical Notes
- Use this ticket to contain complexity rather than bloating the sidebar ticket
- Modal editing should support staging changes before commit if the UX requires it
- Keep the advanced editor architecture extensible by step type

## Acceptance Criteria
- User can open advanced editing for supported step types
- User can make complex edits without destabilizing the main builder shell
- Save and cancel behaviors are predictable
- Invalid advanced configuration is blocked or clearly explained

## Dependencies
- [FE 08 Step properties sidebar](./FE%2008%20Step%20properties%20sidebar.md)

## Backend Dependencies
- Partially blocked by [BE 04 Step element and property editing APIs](../backend-tickets/BE%2004%20Step%20element%20and%20property%20editing%20APIs.md)
- Persistence for advanced step edits depends on backend update support, but the FE and product teams still need to decide which step types require modal editing in MVP

## Open Questions
- Which step types definitely require advanced modal editing in MVP
- Whether modal editing writes directly or stages a draft until confirmation
