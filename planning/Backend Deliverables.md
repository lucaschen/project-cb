# Backend Deliverables

## Goal
Deliver the backend APIs required to unblock the Project CB MVP frontend, keeping the API surface aligned with the current internal-user-first product scope.

## MVP Principles
- Unblock the frontend in dependency order
- Prefer real persisted behavior over placeholder endpoints
- Keep contracts explicit through shared schemas
- Reuse the existing session, organization, and flow permission model where possible
- Avoid over-designing preview/public submission behavior before product scope is fixed

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
- Branching and decision condition APIs
  - [BE 05 Branching and decision condition APIs](./backend-tickets/BE%2005%20Branching%20and%20decision%20condition%20APIs.md)

### Organization administration
- Organization management APIs
  - [BE 06 Organization management APIs](./backend-tickets/BE%2006%20Organization%20management%20APIs.md)

## Deliverable Areas
### 1. Flow retrieval
Provide org-scoped flow listing and a builder-ready flow read payload so the frontend can load existing flows without inventing local-only state.

### 2. Flow metadata management
Expand the flow API surface from create-only into read/update behavior for the top-level metadata supported in MVP.

### 3. Builder persistence
Provide the missing CRUD, ordering, and persistence surfaces for steps, step elements, editable properties, and branching rules.

### 4. Organization management
Add the member, invite, settings, and delete-org surfaces required after the core builder path is stable.

## Out of Scope for This Backlog
- Public respondent APIs
- OAuth or external identity providers
- Final preview submission persistence semantics before product scope is fixed
- Overly broad role systems beyond the current admin/editor/viewer model unless required by the product

## Open Planning Questions
- Exact flow metadata fields beyond `name` and `slug` for MVP
- Canonical builder read payload shape for flows, nodes, steps, and editable properties
- Whether decision logic should support step-level routing only or also field-level visibility in MVP
- Whether organization invites should remain user-based, become email-based, or support both
