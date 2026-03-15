# FE 04 Flow list page

## Status
Implemented.

Implemented work:
- Org-scoped flow list route exists
- Empty, loading, retry, and populated states are present
- Create-flow entry point exists on the page
- Users can open an existing flow from the list

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

## Backend Dependencies
- Blocked by [BE 01 Flow listing and builder read APIs](../backend-tickets/BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- Requires an org-scoped flow list endpoint plus the agreed list payload shape

## Open Questions
- Required metadata to display in the list
- Whether archived/draft separation exists in MVP
