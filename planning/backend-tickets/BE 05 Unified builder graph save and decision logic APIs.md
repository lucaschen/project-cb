# BE 05 Unified builder graph save and decision logic APIs

## Status
Implemented.

Current canonical write surface:
- `PUT /flows/:flowId/builder`
- Returns the same canonical shape as `GET /flows/:flowId`
- Replaced the older split write routes for step-only graph saves and decision-node creation

## Goal
Expose the single flow-graph write API required to persist, validate, and reload step structure plus decision-based routing in one consistent transaction.

## Scope
- Save the direct flow graph children in one request:
  - ordered steps
  - decision nodes
  - decision fallback routing
  - ordered decision condition lists
  - node coordinates
- Validate destination references, condition statements, and graph loops against the full post-save graph
- Return graph payloads that builder and preview can consume without local-only reconstruction
- Keep step-element content persistence out of scope; BE 04 remains the separate step-internal editing surface

## Technical Notes
- The current backend splits step-graph writes and decision-node writes too narrowly for safe builder persistence; BE 05 consolidates direct flow-child editing behind one canonical builder-save boundary
- Direct relatives of `Flow` should save together so step reordering, step deletion, decision fallback changes, and decision-condition edits succeed or fail together
- Scope is step-routing only for MVP; field-level visibility and step-element conditional display stay out of BE 05
- Keep branching tied to stable node IDs rather than step indices
- Reuse the existing shared condition DSL and supported operators only: `===`, `>=`, `<=`
- Validation should prevent broken destinations and loop-producing routing before the frontend enters preview
- The existing step-only graph write surface from BE 03 should be treated as transitional once this ticket lands

## Acceptance Criteria
- FE 07 and FE 10 can save the builder graph for steps plus decisions through one API-backed flow edit path
- Decision-node routing, fallback behavior, and ordered condition lists save and reload reliably
- The backend validates graph payloads and rejects invalid routes clearly
- Flow reads include saved branching data in a stable order
- Fallback routing, explicit conditional routing, and step ordering are represented consistently after re-fetch
- Saves that introduce loops, invalid destinations, duplicate condition ids, invalid `stepElementValue` references, or broken direct-flow-child relationships are rejected
- Saved logic can be consumed by later preview work without additional backend changes to the core branching model

## Dependencies
- [BE 01 Flow listing and builder read APIs](./BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- [BE 03 Step CRUD and ordering APIs](./BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Existing decision node creation support

## Open Questions
- Whether later preview or execution APIs should consume this builder graph shape directly or introduce a separate execution-oriented read model
