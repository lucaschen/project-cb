# BE 04 Step element and property editing APIs

## Goal
Add the missing read and persistence surfaces for editable step elements and their common properties.

## Scope
- Read existing step elements and their persisted properties
- Update existing step element fields supported in MVP
- Update common editable properties for existing elements
- Delete and reorder step elements if element ordering remains part of the builder UX
- Return saved element/property payloads in a builder-friendly shape

## Technical Notes
- The current backend supports creating a step element with optional properties, but not editing existing ones; FE 08 and the persistence half of FE 09 depend on this
- Keep the schema for common properties compatible with the existing element-property model
- Separate common sidebar-editable properties from richer per-step-type advanced payloads where that helps validation
- Preserve fast edit loops by making updates composable and predictable for the frontend

## Acceptance Criteria
- FE 08 can load and persist common step element properties for an existing step
- FE 09 can persist advanced edits for supported step types without creating duplicate elements
- Invalid property shapes are rejected with useful validation feedback
- Element reads return enough data for the builder to rehydrate current editable state
- Reordering or deletion behavior is persisted consistently if supported in MVP

## Dependencies
- [BE 03 Step CRUD and ordering APIs](./BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Existing step element creation support

## Open Questions
- Which editable properties are shared across all step types versus per-type
- Whether element deletion/reorder belongs in this ticket or remains a later refinement
- Whether advanced modal editing stores the same payload shape as sidebar editing or a staged superset
