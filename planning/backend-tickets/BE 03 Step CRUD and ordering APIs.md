# BE 03 Step CRUD and ordering APIs

## Goal
Provide the CRUD and ordering APIs required for reliable step management inside the flow builder.

## Scope
- List existing steps for a flow in persisted order
- Add step detail reads needed by the builder
- Update step fields supported in MVP
- Delete steps safely
- Persist explicit step reordering

## Technical Notes
- The current backend only supports step creation; FE 07 also needs list, update, delete, and reorder behavior
- Ordering must be explicit and stable so branching logic does not depend on transient UI order alone
- Step deletion must define how linked `nextNodeId` and branching references are validated or rejected
- Reuse flow edit permissions for all step mutations

## Acceptance Criteria
- FE 07 can load the current ordered steps for a flow
- Authenticated users with edit access can add, update, delete, and reorder steps
- The persisted order is returned consistently after reorder operations
- Invalid delete or reorder requests that would leave the flow in a broken state are rejected clearly
- Re-fetching the flow reflects the saved step order and membership accurately

## Dependencies
- [BE 01 Flow listing and builder read APIs](./BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- Existing step creation support

## Open Questions
- Whether step duplication is needed in MVP
- Whether reorder should be whole-list replacement, move-by-index, or move-by-relative-position
- Minimum step summary fields required by the step list UI
