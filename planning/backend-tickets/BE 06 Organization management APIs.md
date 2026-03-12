# BE 06 Organization management APIs

## Goal
Add the remaining organization administration APIs needed after onboarding so internal users can manage org access and settings safely.

## Scope
- Switch/list active organization support already used by the frontend where needed
- Member listing and membership management APIs
- Invite creation and invite lifecycle APIs
- Organization settings read/update APIs
- Delete-organization flow with explicit safeguards

## Technical Notes
- The current backend only supports organization creation plus current-user organization listing; FE 14 needs the broader admin surface
- Keep permission enforcement close to the existing org membership model
- Destructive actions such as org deletion should require explicit validation and confirmation semantics
- Invite behavior should not assume more product scope than is currently decided

## Acceptance Criteria
- FE 14 can load the member/invite/settings data required for organization management pages
- Authorized users can update supported organization settings
- Authorized users can create and manage invites using the MVP invite model
- Unauthorized users cannot perform admin-only organization actions
- Delete-organization behavior is explicit, safeguarded, and returns clear failure states when the org cannot be deleted

## Dependencies
- Existing organization creation and membership persistence
- Existing organization list for current user

## Open Questions
- Whether invites are email-based, user-based, link-based, or a hybrid for MVP
- Which roles can invite, update settings, or delete an organization
- Whether org deletion requires soft-delete, dependency checks, or hard-delete semantics
