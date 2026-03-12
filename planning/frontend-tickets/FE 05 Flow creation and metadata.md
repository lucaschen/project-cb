# FE 05 Flow creation and metadata

## Goal
Allow internal users to create a new flow and manage its top-level metadata.

## Scope
- Create flow action from list page
- Flow metadata form or panel
- Edit name, description, and status fields if supported
- Persist flow creation and metadata updates

## Technical Notes
- Keep metadata editing separate from deep step editing concerns
- Flow identity should be established early so downstream builder routes can rely on it
- If autosave is not confirmed, prefer explicit save actions in the first pass

## Acceptance Criteria
- User can create a flow from the frontend
- User can update supported metadata fields
- Save/update states are clear to the user
- Created flow routes correctly into the builder

## Dependencies
- [FE 04 Flow list page](./FE%2004%20Flow%20list%20page.md)

## Open Questions
- Exact metadata fields supported by backend
- Whether status transitions exist in MVP
