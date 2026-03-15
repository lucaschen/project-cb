# BE 06 Organization management APIs

## Status
Implemented.

Current surface:
- `GET /organizations/:organizationId`
- `PATCH /organizations/:organizationId`
- `DELETE /organizations/:organizationId`
- `GET /organizations/:organizationId/members`
- `PATCH /organizations/:organizationId/members/:userId`
- `DELETE /organizations/:organizationId/members/:userId`
- `GET /organizations/:organizationId/invites`
- `POST /organizations/:organizationId/invites`
- `DELETE /organizations/:organizationId/invites/:inviteId`
- `GET /organizations/:organizationId/api-keys`
- `POST /organizations/:organizationId/api-keys`
- `DELETE /organizations/:organizationId/api-keys/:apiKeyId`

Implemented notes:
- Organization API keys now live in a dedicated `organizationApiKeys` table instead of an `organizations.apiKey` column
- Org detail no longer returns a raw API key; key creation returns the raw key once and list reads return metadata plus `prefix`
- Current `GET /organizations/:organizationId` behavior is admin-only and acts as the settings/detail surface
- Current-user org listing returns member-safe summaries only

## Goal
Add the remaining organization administration APIs needed after onboarding so internal users can manage org access and settings safely.

## Scope
- Member listing and membership management APIs
- Email-based invite creation, listing, and cancellation APIs
- Basic organization settings read/update APIs
- Soft-delete organization flow with explicit safeguards

## Technical Notes
- The current backend only supports organization creation plus current-user organization listing; FE 14 needs the broader admin surface
- Admin only for all organization-management mutations in MVP
- Use email-based invites for MVP instead of the current user-targeted invite shape
- The invite model now supports `email`, `permissions`, `expiresAt`, `organizationId`, and `invitedByUserId`
- Invite acceptance remains out of scope; this ticket only covers admin management surfaces
- Add soft-delete support to organizations and exclude soft-deleted orgs from reads and permission-aware access paths
- Dedicated organization API key management now sits under the same admin area, but raw keys are only returned on creation
- Destructive actions such as delete org should require dependency checks and clear failure states

## Acceptance Criteria
- FE 14 can load the member, invite, and organization settings data required for organization management pages
- Admins can update supported organization settings
- Admins can create, list, and cancel email-based invites using the MVP invite model
- Admins can update member roles and remove members while preserving at least one admin in the org
- Soft-delete organization behavior is explicit, safeguarded, and returns clear failure states when the org cannot be deleted
- Non-admin users cannot perform admin-only organization actions

## Dependencies
- Existing organization creation and membership persistence
- Existing organization list for current user

## Open Questions
- Whether later invite acceptance work should create users on accept or require an existing account first
- Whether organization detail should remain admin-only or gain a member-readable detail surface in addition to the current summary list
