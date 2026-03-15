# FE 06 Flow builder shell

## Status
Partially implemented.

Implemented work:
- `/flows/:flowId` builder route exists and loads server-backed flow data
- Left palette, center React Flow canvas, and right inspector sidebar layout are in place
- Read-only and local-draft node rendering exists in the canvas
- `Flow` and `Selection` inspector tabs exist
- Flow-level metadata editing and builder save/discard controls exist in the sidebar

Remaining gap:
- The `Flow` tab still needs the stronger structure-outline experience originally envisioned for this shell ticket

## Goal
Create the first real visual flow-builder shell for `/flows/:flowId`, with the full page layout, React Flow canvas, panel chrome, and right-panel tab switching in place.

## Scope
- Builder route and layout
- Flow-level header and navigation controls
- Left palette/editor surface UI
- Center canvas shell
- Right inspector panel with tab selection
- Flow metadata and structure list in the `Flow` tab
- Load existing flow into builder context
- Read-only node rendering on the canvas

## Technical Notes
- Use `React Flow` for the builder canvas and visual graph shell
- Use `Zustand` only for lightweight builder UI state such as selected tab and panel visibility in this ticket
- Keep server data fetching in `TanStack Query`
- FE 06 should prioritize layout, composition, and extension points over mutation logic
- The left panel should visually communicate node creation affordances, but actual drag/drop spawn logic belongs in FE 07
- The right panel should establish the final information architecture now:
  - `Flow` tab for metadata + structure
  - `Selection` tab for node-specific details

## Acceptance Criteria
- Builder route loads an existing flow reliably
- Layout supports left palette, center canvas, and right inspector panels
- Existing nodes render in the React Flow canvas from server data
- User can switch between `Flow` and `Selection` tabs in the right panel
- `Flow` tab shows flow metadata and the current structure outline
- Local UI state is isolated from server state
- User has clear visual affordances for future builder actions without FE 07/08 logic being required yet

## Dependencies
- [FE 05 Flow creation and metadata](./FE%2005%20Flow%20creation%20and%20metadata.md)

## Backend Dependencies
- Blocked by [BE 01 Flow listing and builder read APIs](../backend-tickets/BE%2001%20Flow%20listing%20and%20builder%20read%20APIs.md)
- Requires a builder-ready flow detail payload that can load existing steps, decision nodes, and elements

## Open Questions
- Exact palette affordances for drag handles vs click affordances
- Whether the `Selection` tab should default to an empty state or contextual onboarding when no node is selected
