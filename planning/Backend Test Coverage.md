# Backend Test Coverage

## Purpose
This document defines the backend test coverage that should exist for Project
CB's current server surface. It is intentionally written from a
correct-behavior perspective rather than a "test whatever the code happens to
do today" perspective.

The goal is to retroactively add backend-only end-to-end coverage that proves:

- the HTTP contracts behave correctly for valid requests
- invalid and unauthorized requests fail predictably
- transactional writes do not leave partial data behind when a request fails
- the database remains internally consistent across multi-entity operations

This document is not a frontend test plan and is not limited by current gaps in
the implementation. If the implementation and the correct behavior differ, the
tests should target the correct behavior and the code should be brought into
compliance.

## Test Strategy
All coverage in this document should be implemented as backend-only end-to-end
tests using `Vitest` and an isolated in-memory Sequelize database.

Each test suite should:

- boot the backend application without the frontend
- exercise the public HTTP surface through real requests
- use a fresh in-memory database per test or per suite with deterministic
  seeding
- assert both HTTP responses and resulting persisted state
- verify rollback behavior by querying the database after failed writes, not
  just by checking that an error response was returned
- verify dependent persistence immediately after success responses so tests can
  detect "response returned before write completed" failures

The preferred test harness should behave like this:

1. Create a test-only app/bootstrap path that returns an Express app without
   calling `listen`.
2. Create a test-only Sequelize setup that targets an in-memory database and
   runs schema sync from model definitions.
3. Seed only the minimum data needed for each scenario.
4. Use HTTP-level requests against the app to validate route, middleware,
   schema enforcement, auth, and persistence behavior together.

### Test Harness Expectations
The test harness should prove more than unit-isolated helpers. It should cover:

- route registration
- middleware sequencing
- schema validation
- auth and permission enforcement
- entity persistence and relationships
- transaction rollback guarantees

For write endpoints, the default expectation is:

- if the request succeeds, all intended writes commit
- if the request succeeds, all required dependent writes are already committed,
  not merely scheduled or launched asynchronously
- if the request fails at any point, no partial mutation remains in the
  database unless partial persistence is an explicit and documented product
  requirement
- rollback assertions inspect all affected tables, not only the top-level
  resource table

This coverage map intentionally excludes:

- concurrency and lock-contention behavior
- Postgres-vs-in-memory database parity behavior

## Coverage Domains

## Cross-Cutting Edge Classes
These checks should be applied across the relevant route domains rather than
treated as one-off cases.

### Atomic response semantics
- A `200` or `201` response means every required side effect for that route has
  already committed.
- Tests should explicitly catch "async helper called but not awaited" failures
  by checking dependent rows immediately after the response.

### Retry and idempotency semantics
- Repeated single-request retries should have a defined behavior wherever
  clients may safely retry.
- This especially applies to logout, safe reads, and create-like operations
  when clients can supply stable identifiers.

### Nested ownership validation
- Routes that accept both parent and child identifiers must prove the child
  belongs to the named parent resource.
- Authorization on a parent flow is not sufficient if the nested `stepId`,
  `nodeId`, or similar child id points at another resource graph.

### Null, empty, and omitted field semantics
- Tests must distinguish between leaving a field unchanged, explicitly clearing
  it, and sending an invalid empty value.
- Response and persistence behavior should match the documented contract exactly.

### Unknown-resource precedence
- Each route family should define whether a missing resource surfaces as
  `404`, auth failure, or another error first.
- That precedence should remain consistent within the route family.

### Referential cleanup
- Failed writes and removal-style writes must not leave dangling coordinates,
  properties, conditions, join rows, or other dependent records.

### Application bootstrap and routing
Tests should prove that the server boots a complete app with the expected route
tree, healthcheck route, middleware stack, and mounted domain routers.

#### Happy path
- `GET /healthcheck` returns the expected success response.
- The main routers for `sessions`, `users`, `organizations`, and `flows` are
  mounted and reachable.
- Unknown routes return the expected not-found behavior without crashing the
  process.

#### Unhappy path
- Boot should fail loudly if the app is misconfigured in a way that would
  invalidate request handling.
- Routes should not silently disappear because of conditional setup or missing
  middleware registration.

#### Edge cases
- Route matching should remain correct for nested resources such as flow steps,
  step elements, and decision-node endpoints.
- Route registration order should not cause protected routes to be shadowed by
  generic handlers.

### Request context and middleware
Tests should prove that every request receives the expected request-scoped
context and middleware services before route logic executes.

#### Happy path
- JSON request bodies are parsed correctly.
- Cookies are parsed correctly and available to session-aware routes.
- The Express context entity is attached for routes that depend on it.
- CORS behavior is applied consistently for allowed origins.

#### Unhappy path
- Malformed JSON fails with a predictable client error and does not reach domain
  logic.
- Missing request context should fail loudly rather than letting downstream
  logic proceed in a broken state.

#### Edge cases
- Empty bodies, missing cookies, and missing optional headers should not crash
  the middleware chain.
- Middleware ordering should preserve login lookup before protected route logic
  runs.

### Schema enforcement and route error handling
Tests should prove that request validation and error translation protect the
domain layer from malformed input and translate failures into stable HTTP
contracts.

#### Happy path
- Valid params, query values, cookies, and bodies pass schema enforcement.
- Successful route handlers serialize responses that conform to shared output
  schemas.

#### Unhappy path
- Invalid request bodies fail with the correct client error.
- Invalid route params fail with the correct client error.
- Domain errors are translated into the correct HTTP status and response shape.
- Unexpected errors do not leak internal stack details to the client.

#### Edge cases
- Extra fields should either be rejected or ignored consistently according to
  the schema contract.
- Type coercion behavior should be stable and explicit rather than accidental.
- Error translation should distinguish authentication, authorization, not-found,
  and invalid-operation failures.

### Authentication and sessions
Tests should prove that session creation, lookup, and deletion work correctly
and enforce identity boundaries.

#### Happy path
- Valid credentials create a session, issue the expected cookie or token, and
  allow subsequent authenticated requests.
- `GET current session` returns the correct user identity when the session is
  valid.
- Deleting the current session invalidates subsequent authenticated access.

#### Unhappy path
- Invalid credentials do not create a session record and do not set an
  authenticated cookie.
- Requests without a valid session to protected routes are rejected.
- Session deletion for an unauthenticated request returns the correct protected
  failure rather than mutating unrelated state.

#### Edge cases
- Repeated logout requests should behave idempotently or fail in a clearly
  documented way; they must never delete another user's session.
- Expired, tampered, or malformed session tokens must not authenticate a user.
- Concurrent sessions for different users must remain isolated.
- Session cookie or token state must be absent after invalid login, not merely
  unusable.
- `GET current session` after logout must fail immediately with no stale
  authenticated state.

#### Rollback expectations
- If session creation fails after any intermediate persistence step, no orphaned
  or partially initialized session should remain.
- If session deletion fails, the original session must remain valid unless the
  operation can be proven to have completed atomically.

### User accounts
Tests should prove that user creation and user-scoped lookup behavior are
correct, unique, and safe.

#### Happy path
- A valid user can be created and later authenticated.
- A signed-in user can query the organizations they belong to and receive only
  those organizations.

#### Unhappy path
- Duplicate email or other unique identity conflicts are rejected cleanly.
- Invalid user creation input is rejected before persistence.
- Unauthenticated requests to current-user organization endpoints fail
  correctly.

#### Edge cases
- Case sensitivity around unique user identity should be explicit and tested.
- A newly created user with no organization membership should receive a valid
  empty organizations response.
- User creation should not accidentally create session or membership records
  unless the product contract explicitly says so.

#### Rollback expectations
- If user creation involves multiple writes in the future, a failure in any
  later step must not leave a half-created user relationship graph behind.

### Organization domain
Tests should prove that organizations can be created correctly, associated to
the right user, and later resolved through membership-aware queries.

#### Happy path
- An authenticated user can create an organization.
- The creating user is persisted with the correct membership or ownership
  relationship for later authorization checks.
- The organization appears in that user's current-organization list.
- `create organization` success guarantees the creator membership row exists
  before the response returns.

#### Unhappy path
- Unauthenticated organization creation is rejected.
- Invalid organization payloads are rejected before persistence.
- A user must not see organizations they do not belong to.

#### Edge cases
- Creating multiple organizations for the same user should preserve clear
  ownership and list ordering expectations.
- Organization names that differ only by whitespace or casing should follow a
  deliberate validation policy.
- The creating user must appear in subsequent membership-backed lookups
  immediately after the create response.

#### Rollback expectations
- If organization creation includes both organization and membership writes, a
  failure after the first write must not leave an orphaned organization or a
  dangling membership record.

### Authorization and permission model
Tests should prove that read and write permissions are enforced by resource
ownership and organization membership rather than by trusted client behavior.

#### Happy path
- A signed-in user can read and mutate only resources belonging to flows and
  organizations they are allowed to access.

#### Unhappy path
- Unauthenticated requests to protected routes fail consistently.
- Authenticated users are rejected from flows, organizations, steps, and
  decision nodes they do not own or cannot access.

#### Edge cases
- Authorization must be enforced for nested resources, not just top-level flow
  routes.
- Users who belong to one organization must not gain access to another
  organization's flows through guessed ids.
- Authorization checks should occur before write operations, not after partial
  mutation work has started.
- Nested ids such as `stepId` must be validated against the route's `flowId`,
  not trusted independently.

#### Rollback expectations
- When authorization fails for a write endpoint, the database must remain
  unchanged.

### Flow lifecycle
Tests should prove that flows can be created, listed, fetched, and updated as
top-level resources with correct organization scoping.

#### Happy path
- An authorized user can create a flow in an organization they can edit.
- Organization-scoped flow listing returns only flows for the requested
  organization that the caller may access.
- Fetching a flow returns the expected top-level metadata and builder payload.
- Updating flow metadata persists the new values and returns the updated flow.
- `create flow` success guarantees any required bootstrap records exist before
  the response returns.

#### Unhappy path
- Creating a flow for an unauthorized organization is rejected.
- Invalid create and update payloads are rejected before persistence.
- Unknown flow ids return the correct not-found behavior.

#### Edge cases
- Flow creation should enforce required metadata and slug rules deterministically.
- Clearing optional metadata fields such as description should round-trip to the
  expected persisted null or empty state.
- Flow lists should remain stable when an organization has zero flows.
- Slug uniqueness or conflict behavior should be explicit and tested if slugs
  are intended to be unique.
- Partial metadata updates must leave omitted fields unchanged.

#### Rollback expectations
- If flow creation fails after any intermediate write, no partial flow or
  backing node graph record should remain.
- If metadata update fails validation or persistence, the previous metadata must
  remain unchanged.

### Flow builder read model
Tests should prove that the builder read endpoint returns a coherent graph
representation, not just individually correct rows.

#### Happy path
- Fetching a flow returns all steps, decision nodes, node ids, and relationships
  needed by the builder.
- Nodes with persisted coordinates return those exact coordinates.
- Nodes without persisted coordinates return the expected nullable coordinate
  shape without breaking the payload contract.

#### Unhappy path
- Builder fetch for a missing or unauthorized flow fails cleanly.
- Invalid backing graph state should fail predictably rather than returning a
  silently inconsistent payload.

#### Edge cases
- Empty flows should return a valid empty builder payload.
- Mixed graphs with both steps and decision nodes should serialize consistently.
- Relationship fields such as `nextNodeId`, fallback node ids, and decision
  conditions must reference valid nodes or fail loudly.
- Payload ordering should be deterministic enough for the frontend to render
  stable builder layouts.
- A fetched flow must never contain references to nodes outside that flow.
- Builder payloads must not include orphaned coordinates or orphaned graph rows.
- Empty arrays versus omitted fields should follow one stable response contract.

### Step domain
Tests should prove that steps can be created, listed, and saved as an ordered
graph-backed collection with strong integrity guarantees.

#### Happy path
- An authorized user can create a step for a flow.
- Listing steps returns the persisted ordered step set for a flow.
- Saving a full step list updates ordering, names, coordinates, and supported
  next-node relationships coherently.
- `create step` success guarantees node, step, and coordinates all exist before
  the response returns.

#### Unhappy path
- Creating or saving steps for an unauthorized flow is rejected.
- Invalid step payloads are rejected before persistence.
- Saving steps with duplicate ids, invalid next-node references, invalid
  decision-node references, or disconnected graph rules is rejected cleanly.
- `nextNodeId` must either reference a valid node in the same flow or be
  rejected.
- Whole-list save must reject submitted step node ids that belong to another
  flow, even if the caller can edit the current flow.

#### Edge cases
- Saving an empty step list for a flow should follow a deliberate rule: either
  validly clear all steps or fail clearly if an empty flow is not allowed.
- Reordering steps must preserve stable order indexes with no gaps or duplicate
  positions.
- Re-saving an unchanged step list should be idempotent.
- Removing a step through whole-list save should also clean up the step's
  dependent records if that is the product contract.
- Whole-list save should define whether self-references are allowed and test
  that behavior explicitly.
- Unchanged whole-list save should preserve stable persisted values rather than
  silently rewriting unrelated fields.

#### Rollback expectations
- `save steps` is a transaction-critical path: if any step in the submitted list
  is invalid, none of the step, node, coordinate, or dependent relationship
  writes should persist.
- If deletion of removed steps is part of the operation, a later failure must
  not leave the flow half-pruned.
- Removal through whole-list save must also remove dependent step elements,
  step-element properties, and step conditions with no leftovers.

### Decision node domain
Tests should prove that decision nodes can be created correctly and participate
in the builder graph without corrupting flow integrity.

#### Happy path
- An authorized user can create a decision node for a flow.
- Newly created decision nodes appear in the builder-read payload for that flow.
- Decision-node conditions and fallback relationships serialize correctly.
- `create decision node` success guarantees both the base node and the
  decision-node row exist before the response returns.

#### Unhappy path
- Unauthorized decision-node creation is rejected.
- Invalid input for decision-node creation is rejected before persistence.
- A decision node must not be attached to a flow the caller cannot edit.

#### Edge cases
- Creating multiple decision nodes in one flow should preserve unique node
  identities.
- Decision nodes with zero conditions should follow a deliberate product rule:
  either valid draft state or explicit rejection.
- Fallback relationships should be nullable only when the domain contract allows
  it.
- `fallbackNextNodeId` must either reference a valid node in the same flow or
  be rejected.
- Builder fetch after decision-node creation must not expose a half-created
  decision node with missing related state.

#### Rollback expectations
- If decision-node creation requires multiple related writes, failure in any
  later step must not leave orphaned node or condition records.

### Step element domain
Tests should prove that step elements are inserted in the correct place,
persist their properties coherently, and do not corrupt ordering when creation
fails.

#### Happy path
- An authorized user can create an element for a step.
- Creating an element at a specific position results in the expected final
  ordering for all elements in the step.
- Element properties persist and are returned with the correct shape.
- `create step element` success guarantees both the element row and all
  provided properties exist before the response returns.

#### Unhappy path
- Creating a step element for a step outside the caller's accessible flow is
  rejected.
- Invalid element payloads or invalid properties are rejected before committing
  partial state.
- The route must reject a `stepId` that does not belong to the `flowId` in the
  URL, even if the caller can edit that flow.

#### Edge cases
- Inserting at the beginning, middle, and end of the element list should all
  behave correctly.
- Order shifting for existing elements should be deterministic and gap-free.
- Repeated property keys should follow a single clear upsert rule.
- Empty or optional properties should round-trip predictably.
- Insert-order behavior should be tested at `0`, middle, append, oversized
  order, and negative order boundaries.
- Property upsert behavior should define whether omitted properties stay
  unchanged and whether explicit null-like values are allowed.

#### Rollback expectations
- Element insertion and order shifting must be atomic: if property persistence
  fails after the element row is created, both the new element and any order
  shifts must roll back.
- Property updates must not leave a partially updated property set when one
  property write fails.

### Entity layer contracts
Tests should prove that the entity layer preserves invariants that the HTTP
layer depends on, especially around relationships and persistence boundaries.

#### Happy path
- Core entity create, find, update, and save methods produce valid persisted
  records and relationships.
- Entities load the related records their higher-level flows depend on.

#### Unhappy path
- Entity lookup methods fail predictably for missing records.
- Invalid state transitions are rejected explicitly rather than producing silent
  corruption.

#### Edge cases
- Relationship traversal between user, session, organization, flow, step,
  decision node, and step element entities should remain correct under mixed
  seeded data.
- Entity methods should be safe under repeated invocation where idempotency is
  expected.

#### Rollback expectations
- Entity methods that wrap multi-write operations in transactions must either
  fully commit or fully roll back.

### Domain errors and invalid operations
Tests should prove that domain-specific errors are raised in the right
situations and translated into the correct external behavior.

#### Happy path
- Valid operations do not incorrectly raise domain errors.

#### Unhappy path
- `InvalidRequestError` is raised for invalid client requests.
- `InvalidCredentialsError` is raised for bad authentication attempts.
- `NotFoundError` is raised for missing domain resources.
- `InvalidOperationError` is raised for validly shaped but domain-invalid state
  transitions.
- `UnexpectedError` is reserved for true server faults.

#### Edge cases
- Error precedence should be stable when multiple problems exist in one request.
- The same failure mode should not surface as different error categories across
  different routes.

### Shared HTTP schema contracts
Tests should prove that the request and response contracts shared with other
packages stay aligned with real server behavior.

#### Happy path
- Every successful route response conforms to its shared output schema.
- Every supported request payload shape accepted by the schemas is accepted by
  the server.

#### Unhappy path
- Payloads rejected by shared input schemas are also rejected by the server.
- Server responses must not drift from the shared output schemas.

#### Edge cases
- Optional and nullable fields should round-trip exactly as the contract
  defines.
- Nested schemas for steps, decision nodes, and step elements should remain
  stable as related entities evolve.

## Rollback-Focused Priority Areas
These flows deserve explicit failure-in-the-middle test cases because they
touch multiple rows and must prove atomicity:

- session creation and deletion
- organization creation with membership linkage
- flow creation
- flow metadata update
- whole-list step save and reorder
- decision-node creation when related rows are created together
- step-element creation with order shifting
- step-element property persistence

For each of these, the test suite should include at least:

1. a successful commit case
2. a domain-validation failure case
3. a persistence failure case injected after some writes would normally have
   occurred
4. a database-state assertion proving whether rollback fully succeeded

## Rollback Verification Matrix
Every transactional or multi-write endpoint should have the same minimum
rollback matrix:

- one success case proving all related tables changed
- one domain-validation failure proving no related tables changed
- one injected persistence failure proving previously written related rows are
  gone after failure

Apply that matrix explicitly to:

- `POST /sessions`
- `DELETE /sessions/current`
- `POST /organizations`
- `POST /flows`
- `PATCH /flows/:flowId`
- `POST /flows/:flowId/steps`
- `PUT /flows/:flowId/steps`
- `POST /flows/:flowId/decision-nodes`
- `POST /flows/:flowId/steps/:stepId/elements`

## Required Scenario Shapes
Every route family in this document should be covered with the applicable
scenario shapes below:

- success response plus immediate DB inspection across all affected tables
- validation failure plus DB unchanged
- auth failure plus DB unchanged
- not-found failure plus DB unchanged
- persistence failure injected after an early write plus full rollback verified
- repeated single-request retry where behavior must be deterministic

## Out of Scope For This Coverage Map
- Frontend behavior or frontend-integrated tests
- Browser or cross-stack end-to-end coverage
- Concurrency and lock-contention coverage
- Postgres-vs-in-memory parity coverage
- Future-only backlog areas from BE 04, BE 05, and BE 06 that are not yet part
  of the intended backend scope
- Public preview, submission, or runtime execution behavior that is not part of
  the current authenticated backend management surface
