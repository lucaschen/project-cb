# BE 05 Branching and decision condition APIs

## Goal
Expose the backend APIs required to persist, validate, and reload branching rules for decision-based flow behavior.

## Scope
- Read decision nodes and their conditions as part of flow loading
- Save one decision node’s full current branching configuration in one request
- Persist fallback routing and full ordered condition lists
- Validate destination references, condition statements, and graph loops
- Return logic payloads that builder and preview can consume without local-only reconstruction

## Technical Notes
- The current backend supports creating a decision node, but not managing its conditions; FE 10 needs that persistence layer
- Scope is step-routing only for MVP; field-level visibility stays out of BE 05
- Persist one decision node at a time using a full replacement payload instead of granular condition CRUD routes
- Keep branching tied to stable node IDs rather than step indices
- Reuse the existing shared condition DSL and supported operators only: `===`, `>=`, `<=`
- Validation should prevent broken destinations and loop-producing routing before the frontend enters preview

## Acceptance Criteria
- FE 10 can create a decision node, save its fallback route and ordered condition list, and reload that saved logic reliably
- The backend validates condition payloads and rejects invalid routes clearly
- Flow reads include saved branching data in a stable order
- Fallback routing and explicit conditional routing are represented consistently
- Saves that introduce loops, invalid destinations, duplicate condition ids, or invalid `stepElementValue` references are rejected
- Saved logic can be consumed by later preview work without additional backend changes to the core branching model

## Dependencies
- [BE 01 Flow listing and builder read APIs](./BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- [BE 03 Step CRUD and ordering APIs](./BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Existing decision node creation support

## Open Questions
- Exact request/response contract for the single decision-node save payload
- Whether decision-node delete should be added in a later ticket or stay out of MVP
