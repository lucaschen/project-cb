# FE 02 Authentication and sessions

## Status
Implemented.

Implemented work:
- Login and sign-up screens exist
- Session bootstrap happens at app load
- Protected and public-only route handling is in place
- Logout clears client-side session context and cached workspace access

## Goal
Implement email/password authentication and authenticated session handling for internal users.

## Scope
- Login screen
- Session bootstrap on app load
- Authenticated route protection
- Logout flow
- Unauthorized and expired-session handling

## Technical Notes
- Treat backend session state as authoritative
- Centralize auth bootstrap logic so route guards do not duplicate fetches
- Ensure query cache is reset appropriately on logout or auth loss
- Avoid overbuilding account management until backend behavior is known

## Acceptance Criteria
- Internal user can log in with email/password
- Authenticated routes are protected from unauthenticated access
- Session persists across refresh if backend session is still valid
- Logout clears local auth state and sensitive cached data
- Expired session redirects the user cleanly back to auth

## Dependencies
- [FE 01 Project setup](./FE%2001%20Project%20setup.md)

## Open Questions
- Whether sign-up exists in MVP or users are provisioned separately
- Exact session mechanism expected from backend
