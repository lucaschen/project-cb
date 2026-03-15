# BE 01 Flow listing and builder read APIs

## Status
Implemented.

Current surface:
- `GET /organizations/:organizationId/flows`
- `GET /flows/:flowId`
- Builder reads return canonical flow metadata plus hydrated `flow.nodes`

## Goal
Add the read APIs required to list flows within an organization and load an existing flow into the builder with a stable, builder-ready payload.

## Scope
- Org-scoped flow list endpoint for the active internal user
- Flow detail endpoint for builder loading
- Builder payload that includes flow metadata and ordered flow nodes
- Read shape for existing steps, decision nodes, and step elements needed by the frontend
- Auth and org-permission enforcement for all flow reads

## Technical Notes
- The current backend only supports flow creation; this ticket adds the read surface needed by FE 04 and FE 06
- Prefer one builder-oriented detail payload over multiple chatty read calls for the initial MVP
- Use stable node and step identifiers so later reorder and branching work does not rely on list position
- Keep the payload aligned with current persisted entities rather than inventing an alternate read model

## Acceptance Criteria
- Authenticated users can list flows for organizations they can access
- The flow list response contains the agreed metadata required by FE 04
- Authenticated users with access can load a single flow into the builder
- The builder read response includes enough ordered structure for FE 06 to render without synthetic placeholders
- Unauthorized or cross-org flow reads are rejected cleanly

## Dependencies
- Existing session/auth APIs
- Existing organization membership lookup
- Existing flow creation persistence

## Open Questions
- Exact flow list metadata required for MVP beyond `id`, `name`, and `slug`
- Whether the builder payload should include both raw nodes and a frontend-shaped derived structure
- Whether archived or draft states exist yet and must affect flow listing
