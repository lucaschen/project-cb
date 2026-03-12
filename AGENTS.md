# Agent Working Context

- Obsidian vault: `personal`
- Project area within vault: `Project CB`
- Scope directive: all ticket and deliverable planning/editing work should be performed under `Project CB` in the `personal` vault.

## Naming conventions

- `fetch*`: asynchronous guaranteed result; throw if missing
- `find*`: asynchronous non-guaranteed result; return nullable or empty results
- `get*`: synchronous guaranteed result
- Shared HTTP schema files should use `*Input`, `*Output`, and `*Params` for endpoint contracts
- Reusable nested Zod schemas should use `*Schema`
- Do not introduce new shared schema names ending in `*Payload`
- Only create shared schemas when they are consumed
- Put persistence or domain-level schemas under `packages/shared/src/db/schemas`, not under `http/schemas`

## Route schema handling

- `enforceSchema` already validates with Zod before invoking the wrapped handler
- Do not re-run `schema.parse(...)` or `schema.safeParse(...)` inside handlers that are already wrapped by `enforceSchema`
