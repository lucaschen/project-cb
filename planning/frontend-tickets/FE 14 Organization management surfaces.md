# FE 14 Organization management surfaces

## Goal
Add the remaining internal organization management pages after the core builder path is working.

## Scope
- Switch active organization
- Member/invite management
- Organization settings
- Delete organization flow with safeguards

## Technical Notes
- This is intentionally sequenced later than auth, onboarding, and builder work
- Keep permission checks close to backend capabilities; do not over-assume role complexity
- Destructive actions such as delete org need clear confirmation UX

## Acceptance Criteria
- User can switch between accessible organizations
- User can manage members or invites as supported by backend APIs
- User can update supported org settings
- Org deletion flow is explicit and safeguarded

## Dependencies
- [FE 03 Organization creation and onboarding](./FE%2003%20Organization%20creation%20and%20onboarding.md)
- Core app navigation from earlier tickets

## Open Questions
- Exact roles and permissions model
- Whether invites are email-based, link-based, or both
