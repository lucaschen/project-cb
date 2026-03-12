# BE 02 Flow metadata read and update APIs

## Goal
Expand flow metadata support beyond initial creation so the frontend can load and persist the MVP flow-level fields.

## Scope
- Define the supported top-level flow metadata fields for MVP
- Add flow metadata read behavior for existing flows
- Add flow metadata update endpoint(s)
- Validate supported state transitions if status is part of MVP
- Return the canonical saved metadata payload after updates

## Technical Notes
- The current create-flow schema only supports `name`, `organizationId`, and `slug`; this ticket formalizes the broader metadata contract for FE 05
- Keep metadata updates separate from step and branching persistence to avoid builder coupling
- If autosave remains undecided, the API should still support explicit save actions cleanly
- Shared schemas should become the source of truth for supported editable fields

## Acceptance Criteria
- The backend documents and validates the set of editable flow metadata fields for MVP
- Authenticated users with edit access can update supported metadata fields
- Unsupported metadata fields are rejected explicitly
- Flow metadata reads and writes return a consistent payload shape
- FE 05 can distinguish successful save, validation failure, and authorization failure states

## Dependencies
- [BE 01 Flow listing and builder read APIs](./BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- Existing flow permission checks

## Open Questions
- Whether `description` is required for MVP or optional
- Whether status transitions exist in MVP and, if so, which states are valid
- Whether `slug` remains editable after creation
