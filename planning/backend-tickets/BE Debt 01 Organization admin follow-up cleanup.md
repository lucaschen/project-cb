# BE Debt 01 Organization admin follow-up cleanup

## Status
Open.

## Goal
Document and resolve the backend follow-up issues discovered after implementing BE 06 so the organization admin surface stays aligned with the intended architecture and contracts.

## Scope
- Reconcile the implemented `GET /organizations/:organizationId` behavior with the planned read-access model
- Make organization soft delete atomic with API key revocation
- Clean up stale naming around organization detail payload helpers

## Technical Notes
- The current implementation makes `GET /organizations/:organizationId` admin-only, while the broader BE 06 planning discussion previously treated organization reads as mixed-access
- The current `softDelete()` flow revokes organization API keys and then saves `deletedAt` outside a transaction, which can leave the org active but keyless if the second write fails
- `getAdminDetail()` now returns the same shape as the summary payload, so the name implies a distinction that no longer exists after the API key table refactor
- This ticket is follow-up debt, not a blocker for the already-implemented BE 06 user flows

## Acceptance Criteria
- The org detail contract is explicit and implemented consistently:
  - either keep admin-only detail and document it everywhere
  - or add a separate member-readable detail route/surface
- Organization soft delete becomes atomic with any coupled API key lifecycle updates
- Organization detail helper naming reflects the actual payload shape and access semantics
- Backend planning docs stay consistent with the final chosen behavior

## Dependencies
- [BE 06 Organization management APIs](./BE%2006%20Organization%20management%20APIs.md)

## Open Questions
- Should `GET /organizations/:organizationId` remain admin-only, or should members get a safe detail payload beyond the current summary list?
- If member-readable org detail is added, should it reuse the current summary shape or introduce a separate member-detail shape?
