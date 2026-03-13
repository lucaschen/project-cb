# BE 04 Step element and property editing APIs

## Goal
Add the missing read and persistence surfaces for editable step elements and their common properties.

## Scope
- Read the full ordered element list for a selected step
- Save the full ordered element list for a selected step in one request
- Update existing step element fields and common editable properties
- Create new step elements within the selected-step save payload using client-generated stable ids
- Delete and reorder step elements by omission and array order
- Return a hydrated builder-friendly element/property payload after reads and writes

## Technical Notes
- The current backend supports creating a step element with optional properties, but not editing existing ones; FE 08 depends on this ticket
- BE 04 is the persistence layer for FE 08 only; FE 09 advanced modal payloads remain out of scope for now
- Persist one selected step at a time using a full replacement payload instead of granular element CRUD routes
- Keep property validation compatible with the existing `ElementProperties` and `StepElementProperties` model
- Run saves transactionally so reorder, create, update, and delete all succeed or fail together

## Acceptance Criteria
- FE 08 can load the full current ordered element list for a selected step
- FE 08 can persist element creates, updates, deletes, and reorder for a selected step through one save action
- Element reads and writes return enough hydrated data for the builder to rehydrate current editable state
- Invalid property ids, invalid property types, and missing required properties are rejected with useful validation feedback
- Saved element ordering is stable and consistent after re-fetch

## Dependencies
- [BE 03 Step CRUD and ordering APIs](./BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Existing step element creation support

## Open Questions
- Exact FE 08 payload shape for representing element property edits before save
- Whether later FE 09 modal editing should reuse the same full-step save payload or introduce a separate ticket and contract
