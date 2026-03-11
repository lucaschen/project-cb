# FE 03 Organization creation and onboarding

## Goal
Allow a newly authenticated internal user to create an organization as the first meaningful action in the product.

## Scope
- Post-auth onboarding decision flow
- Organization creation form
- Redirect into the main app after successful org creation
- Empty-state handling for users without an org

## Technical Notes
- Keep this flow early and minimal so users can reach flow-building quickly
- If a user already belongs to an org, bypass onboarding
- Prefer a dedicated onboarding state instead of scattering checks across pages

## Acceptance Criteria
- User without an org is directed into org creation after auth
- User can create an org successfully from the frontend
- Successful org creation places the user into the main product context
- Existing-org users are not blocked by onboarding

## Dependencies
- [FE 02 Authentication and sessions](./FE%2002%20Authentication%20and%20sessions.md)

## Open Questions
- Minimum org fields required at creation time
- Whether invite code or workspace naming constraints exist
