# BE 05 Branching and decision condition APIs

## Goal
Expose the backend APIs required to persist, validate, and reload branching rules for decision-based flow behavior.

## Scope
- Read decision nodes and their conditions as part of flow loading
- CRUD endpoints for decision node conditions
- Validation for destination references, ordering, and condition statements
- Persist fallback routing and explicit conditional routes
- Return logic payloads that builder and preview can consume without local-only reconstruction

## Technical Notes
- The current backend supports creating a decision node, but not managing its conditions; FE 10 needs that persistence layer
- Keep branching tied to stable node IDs rather than step indices
- Use the existing condition statement model as the starting point rather than inventing a second logic DSL
- Validation should prevent obviously broken routes before the frontend enters preview

## Acceptance Criteria
- FE 10 can create, edit, delete, and reload supported branching rules
- The backend validates condition payloads and rejects invalid routes clearly
- Flow reads include saved branching data in a stable order
- Fallback routing and explicit conditional routing are both represented consistently
- Saved logic can be consumed by later preview work without additional backend changes to the core branching model

## Dependencies
- [BE 01 Flow listing and builder read APIs](./BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- [BE 03 Step CRUD and ordering APIs](./BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Existing decision node creation support

## Open Questions
- Exact condition operators supported in MVP
- Whether MVP branching is limited to step-to-step routing or also covers field-level visibility
- Whether branching validation should reject cycles or only structurally invalid destinations
