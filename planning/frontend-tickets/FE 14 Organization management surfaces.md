# FE 14 Organization management surfaces

## Status
Not started.

Current state:
- Active organization context is shown in the top navigation
- Dedicated org switching and management surfaces are not implemented yet

## Goal
Add the remaining internal organization management pages after the core builder path is working.

## Scope
- Switch active organization
- Member/invite management
- Organization settings
- Organization API key management
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

## Backend Dependencies
- Mostly blocked by [BE 06 Organization management APIs](../backend-tickets/BE%2006%20Organization%20management%20APIs.md)
- Requires backend support for member management, invites, settings updates, API key management, and guarded organization deletion

## Open Questions
- Exact roles and permissions model
- Whether org switching should be lightweight nav state or a fuller workspace-switching surface
