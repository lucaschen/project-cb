# FE 08 Builder sidebar UX refresh

## Status
Not started.

Current state:
- The current builder sidebar supports flow metadata editing, builder save/discard, and node-level graph edits
- The selection panel works functionally, but it is visually bulky, unevenly spaced, and too form-like for quick builder interactions
- Real step-internal editing is not implemented yet and should not be forced into the sidebar

## Goal
Make the builder sidebar feel compact, responsive, and modern while keeping it focused on quick graph-level editing.

## Scope
- Tighten the sidebar shell, spacing, hierarchy, and responsiveness
- Improve the `Flow` / `Selection` tab treatment and action grouping
- Refine step, decision, edge, and empty-selection states into compact control surfaces
- Improve nearby builder chrome that visually interacts with the sidebar, such as inspector toggle controls
- Keep the sidebar limited to fast graph-level edits only

## Technical Notes
- The sidebar should support quick edits and navigation, not deep step configuration
- Decision rule controls should remain usable in a narrow drawer without feeling like mini pages
- The sidebar should remain compatible with the current builder graph and save/discard flow
- Avoid introducing step-element/property persistence work in this ticket

## Acceptance Criteria
- Flow tab is denser, easier to scan, and keeps primary builder actions prominent
- Selection states for step, decision, edge, and empty selection feel compact and intentional
- Decision rule controls remain usable with multiple rules in the narrower control surface
- Sidebar remains responsive without obvious clipping or awkward wrapping
- Existing graph-level edits, validation behavior, and save/discard behavior continue to work unchanged

## Dependencies
- [FE 07 Step list management](./FE%2007%20Step%20list%20management.md)

## Backend Dependencies
None for FE 08.

## Open Questions
- How far to push nearby builder chrome polish without turning FE 08 into a full builder-shell redesign
- Which compact sidebar patterns should be reused later by FE 09 modal entry points
