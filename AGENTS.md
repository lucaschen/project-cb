# Agent Working Context

- Obsidian vault: `personal`
- Project area within vault: `Project CB`
- Scope directive: all ticket and deliverable planning/editing work should be performed under `Project CB` in the `personal` vault.

## Naming conventions

- `fetch*`: asynchronous guaranteed result; throw if missing
- `find*`: asynchronous non-guaranteed result; return nullable or empty results
- `get*`: synchronous guaranteed result
- In `common` HTTP schema files, Zod schema constants should end in `Schema`
- In `common` HTTP schema files, inferred TypeScript types should end in `Type`
- In non-`common` HTTP schema files, Zod schema constants should use `*Input`, `*Output`, and `*Params`
- In non-`common` HTTP schema files, inferred TypeScript types should match those names with leading capitalisation, for example `CreateFlowInput`
- Only create shared schemas when they are consumed
- Put persistence or domain-level schemas under `packages/shared/src/db/schemas`, not under `http/schemas`

## Route schema handling

- `enforceSchema` already validates with Zod before invoking the wrapped handler
- Do not re-run `schema.parse(...)` or `schema.safeParse(...)` inside handlers that are already wrapped by `enforceSchema`
