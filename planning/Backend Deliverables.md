# Backend Deliverables

See [Product Spec](./Product%20Spec.md) for the canonical product framing, intended usage model, and MVP boundaries. Treat this file as the derived backend execution backlog.

## Goal
Deliver the backend APIs required to support Project CB as an internal authoring platform plus embeddable guided-form runtime, keeping the API surface aligned with a React-first MVP where flows are authored inside Project CB and rendered inside a client app by API credentials plus flow identity.

## MVP Principles
- Unblock the frontend in dependency order
- Prefer real persisted behavior over placeholder endpoints
- Keep contracts explicit through shared schemas
- Reuse the existing session, organization, and flow permission model where possible
- Treat the embedded runtime as part of MVP, not just internal preview tooling
- Keep submission ownership with the host app unless and until the product scope changes

## Implementation Status
- [BE 01 Flow listing and builder read APIs](./backend-tickets/BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md): implemented
- [BE 02 Flow metadata read and update APIs](./backend-tickets/BE%2002%20Flow%20metadata%20read%20and%20update%20APIs.md): implemented
- [BE 03 Step CRUD and ordering APIs](./backend-tickets/BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md): implemented for ordered step reads; the earlier step-only write path has been superseded by BE 05 and removed from public routing
- [BE 04 Step element and property editing APIs](./backend-tickets/BE%2004%20Step%20element%20and%20property%20editing%20APIs.md): implemented
- [BE 05 Unified builder graph save and decision logic APIs](./backend-tickets/BE%2005%20Unified%20builder%20graph%20save%20and%20decision%20logic%20APIs.md): implemented as the canonical write path for direct `Flow` children
- [BE 06 Organization management APIs](./backend-tickets/BE%2006%20Organization%20management%20APIs.md): implemented, including member management, email invites, soft delete, and dedicated organization API key management routes backed by `organizationApiKeys`

## Delivery Sequence
### Flow read surfaces
- Flow listing and builder read APIs
  - [BE 01 Flow listing and builder read APIs](./backend-tickets/BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- Flow metadata read and update APIs
  - [BE 02 Flow metadata read and update APIs](./backend-tickets/BE%2002%20Flow%20metadata%20read%20and%20update%20APIs.md)

### Builder persistence
- Step CRUD and ordering APIs
  - [BE 03 Step CRUD and ordering APIs](./backend-tickets/BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Step element and property editing APIs
  - [BE 04 Step element and property editing APIs](./backend-tickets/BE%2004%20Step%20element%20and%20property%20editing%20APIs.md)
- Unified builder graph save and decision logic APIs
  - [BE 05 Unified builder graph save and decision logic APIs](./backend-tickets/BE%2005%20Unified%20builder%20graph%20save%20and%20decision%20logic%20APIs.md)

### Organization administration
- Organization management APIs
  - [BE 06 Organization management APIs](./backend-tickets/BE%2006%20Organization%20management%20APIs.md)

### Backend debt follow-up
- Backend architecture and contract cleanup
  - [BE Debt 01 Organization admin follow-up cleanup](./backend-tickets/BE%20Debt%2001%20Organization%20admin%20follow-up%20cleanup.md)

## Deliverable Areas
### 1. Flow retrieval
Provide org-scoped flow listing and a builder-ready flow read payload so the frontend can load existing flows without inventing local-only state.

### 2. Flow metadata management
Expand the flow API surface from create-only into read/update behavior for the top-level metadata supported in MVP.

### 3. Builder persistence
Provide the missing persistence surfaces for ordered steps, step-internal content, and unified flow-graph editing so direct `Flow` children save together while step content remains isolated.

### 4. Organization management
Add the member, invite, settings, and delete-org surfaces required after the core builder path is stable.

### 5. Backend debt cleanup
Track post-implementation follow-up work where shipped behavior is functional but still needs contract, transaction, or naming cleanup to stay aligned with the intended architecture.

## Out of Scope for This Backlog
- Public respondent APIs
- OAuth or external identity providers
- Final preview submission persistence semantics before product scope is fixed
- Overly broad role systems beyond the current admin/editor/viewer model unless required by the product

## Open Planning Questions
- Whether organization detail should remain admin-only or gain a separate member-readable read surface beyond the current summary list
- Whether preview/playthrough and submission APIs should stay as separate tickets or converge on a broader execution surface later
