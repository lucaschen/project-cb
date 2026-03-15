# FE 07 Builder graph interactions and node management

## Status
Partially implemented.

Implemented work:
- Drag node types from the palette into the canvas
- Select nodes and edges from the canvas
- Add and remove nodes locally
- Reconnect default, fallback, and decision-rule edges
- Maintain local draft builder graph state with save/discard behavior

Remaining gap:
- No dedicated structure list UI yet
- No explicit step reorder interaction yet
- Ticket should now be read as broader graph/node management, not only a step list UI

## Goal
Add the first real builder logic on top of the FE 06 shell so users can create, select, remove, and manage nodes directly in the builder.

## Scope
- Drag node types from the left palette into the canvas to spawn draft nodes
- Click/select nodes from the canvas and from the structure list
- Keep the structure list in sync with the current builder graph
- Delete nodes
- Reorder steps where the backend supports ordered behavior
- Establish local draft graph state boundaries for builder interactions

## Technical Notes
- FE 07 owns the first actual builder interaction logic; FE 06 should remain mostly visual shell work
- Use `Zustand` for local builder graph interaction state, selection state, and unsaved editor context
- Keep persisted server state in `TanStack Query`, but introduce a local draft graph that powers the React Flow canvas
- Drag/drop from the left palette should create new draft nodes at the canvas drop location
- The structure list in the right `Flow` tab should reflect the current graph, not a separate parallel source of truth
- Reordering should stay explicit and stable because later branching logic depends on predictable node identity

## Acceptance Criteria
- User can spawn a new node into the canvas from the left palette
- User can select a node from the canvas and, once a structure list exists, keep selection state in sync there as well
- User can remove supported nodes and see the canvas and structure list update consistently
- User can reorder steps where supported and see the new order reflected consistently
- Builder interaction state is clearly separated from persisted server state

## Dependencies
- [FE 06 Flow builder shell](./FE%2006%20Flow%20builder%20shell.md)

## Backend Dependencies
- Blocked by [BE 03 Step CRUD and ordering APIs](../backend-tickets/BE%2003%20Step%20CRUD%20and%20ordering%20APIs.md)
- Depends on [BE 05 Unified builder graph save and decision logic APIs](../backend-tickets/BE%2005%20Unified%20builder%20graph%20save%20and%20decision%20logic%20APIs.md) for the canonical write path for direct flow-child graph mutations
- Requires ordered step reads plus a flow-graph save API that can persist step membership and ordering without splitting direct `Flow` child edits across multiple endpoints

## Open Questions
- Whether newly spawned nodes persist immediately or remain local drafts until an explicit save point exists
