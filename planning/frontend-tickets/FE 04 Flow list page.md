# FE 04 Flow list page

## Goal
Provide the main internal page for viewing and entering flows within the active organization.

## Scope
- Flow list page route
- Empty state for no flows
- Loading, error, and populated states
- Entry points to create or open a flow
- Basic organization-context awareness

## Technical Notes
- Use `TanStack Query` for list fetching and cache invalidation
- The page should be simple and reliable before adding rich filtering or sorting
- Design the page so it can later expand to org-wide views if needed

## Acceptance Criteria
- User can view flows for the active org
- Empty, loading, and error states are implemented
- User can navigate from the list into flow creation or flow editing
- Active org context is reflected consistently on the page

## Dependencies
- [FE 03 Organization creation and onboarding](./FE%2003%20Organization%20creation%20and%20onboarding.md)

## Open Questions
- Required metadata to display in the list
- Whether archived/draft separation exists in MVP
