# Project rules

## Project overview
Form builder to be consumed by businesses.

## Workflow rules
- perform multi-file edits in a single turn
- DO NOT run tests or linters between individual file edits; wait until all files are modified.
- if a change is straightforward, use `write_to_file` to overwrite rather than complex `sed`-style diffs which eat context.

## Git
- **Practices:** Use `` and `gh` cli for managing .
- **Commits:** Concise, focusing on "Why" (e.g., `feat: update schema to support JSON serialization`).
- **Review:** Ensure tests pass and data integrity constraints are met.