# Product Spec

## Purpose
This doc is the canonical product-definition source of truth for Project CB. It sits above the frontend and backend deliverable backlogs and should be used to resolve ambiguity about product framing, intended usage, MVP boundaries, and system ownership.

If ticket wording or implementation details conflict with this doc, this doc should win unless the product direction has intentionally changed and this file has not yet been updated.

## Product Definition
Project CB is a platform for authoring guided, multi-step forms with branching.

It has two connected product surfaces:
- an internal authoring and administration surface where organizations create and manage flows
- an embedded client-facing runtime where those authored flows are rendered inside a client application

In MVP, the embedded runtime is React-first. A host application should be able to render a flow through an embeddable React component or package using API credentials plus a flow identifier.

Project CB is not just an internal builder. The authored flow is intended to power a real in-app user experience inside another product.

## Problem and Product Value
Teams often need guided, logic-driven form experiences that evolve quickly and should not be hardcoded each time in the host product. The more branching, step structure, and reusable field behavior a flow has, the more expensive it becomes to keep building and updating these experiences directly in app code.

Project CB exists to centralize authorship of those experiences:
- author the flow once
- manage its steps, elements, and branching in one place
- embed the runtime into the host app
- let the host app present the experience with native-feeling styling and surrounding product context

The product value is not just “form creation.” The real value is controlled authorship plus embeddable delivery of guided multi-step form experiences whose structure and logic can be changed without rewriting the host app each time.

## Users and Consumers
### Internal org admins and editors
These users create and maintain the product behavior inside Project CB.

They need to:
- create and manage organizations
- create and manage flows
- define steps, fields, and branching logic
- preview and validate behavior before release
- manage members, invites, settings, and API keys

They do not own:
- the host app shell
- end-user submission handling
- downstream product workflows after a response is submitted

Success for them means they can confidently author and maintain a flow without needing a custom frontend implementation for every change.

### Host app engineering and product teams
These teams integrate the Project CB runtime into their application.

They need:
- a stable embedded runtime contract
- a React-first integration path in MVP
- a way to make the runtime feel native in their product
- clear ownership boundaries between Project CB behavior and host-app behavior

They do not want to:
- rebuild Project CB’s flow rendering and branching logic themselves
- hardcode every guided form experience in their app

Success for them means flows can be integrated into the host app with low friction and still look and behave like part of the product.

### End users
These are the clients or customers using the guided flow inside the host app.

They need:
- a clear step-by-step experience
- predictable navigation
- branching that reflects their inputs
- a runtime that feels like part of the host app, not a foreign embedded widget

Success for them means the flow is easy to complete and adapts to their situation without confusion.

## Core Workflow
### Authoring flow
1. An internal user signs in and creates or joins an organization.
2. They create a flow.
3. They define the step structure, step contents, and branching behavior.
4. They preview and validate the authored flow in Project CB.
5. They prepare the flow for use by the host app.

### Embedding flow
1. The host app configures the embedded runtime with credentials plus a flow identifier.
2. The runtime fetches the authored flow definition from Project CB.
3. The runtime renders the guided experience inside the host application.
4. The host app provides surrounding context such as layout, navigation shell, and theming.

### End-user flow
1. An end user enters the flow inside the host app.
2. They move through guided steps.
3. Branching and conditions determine their path.
4. They complete the flow in the host product context.

### Submission ownership
Project CB owns the authored definition, runtime behavior, and rendering rules.

The host app owns submitted responses and downstream business actions. In MVP, Project CB is not the primary submission store.

## Product Maturity Phases
The product should be understood through maturity phases rather than only through engineering tickets.

### Phase 1: Authoring Foundation
Project CB first becomes a strong internal authoring product.

Core capabilities:
- auth and organization onboarding
- organization-scoped flow management
- builder shell
- flow metadata editing
- step editing
- element and property editing
- branching logic
- preview for author validation
- org admin surfaces such as members, invites, settings, and API keys

Technical implications:
- the authored flow model must be canonical
- node and step identities must be stable
- backend contracts must describe real persisted state, not placeholders
- builder and preview should work from the same authored model

### Phase 2: Embedded Runtime MVP
Project CB becomes a client-facing runtime product in addition to an authoring tool.

Core capabilities:
- embeddable React runtime in the client app
- runtime-safe flow fetch path
- host-app theming and styling support
- in-app showcase-ready rendering of authored flows

Technical implications:
- API-key-based runtime access model
- clearer distinction between internal authoring APIs and runtime delivery APIs
- strong parity expectations between authored flow behavior and embedded runtime behavior
- the runtime contract must be stable enough for external integration, even if limited to React in MVP

### Phase 3: Execution and Submission Expansion
The runtime becomes more explicit as an execution surface rather than just a renderer.

Core capabilities:
- clearer runtime execution semantics
- stronger submission lifecycle model
- host-app callbacks, events, or integration hooks
- clearer validation and completion behavior

Technical implications:
- authored definition and runtime session state may need clearer separation
- runtime contracts must define what is fetched, what is executed locally, and what is reported back
- response and completion behavior must be explicit even if the host app remains the system of record

### Phase 4: Platform Expansion
Project CB expands beyond the React-first MVP footprint.

Possible capabilities:
- non-React runtimes
- broader integrations
- possible public or shareable runtime access
- stronger platform/versioning discipline

Technical implications:
- decide whether additional runtimes are package ports or schema-driven renderers
- increase contract/version compatibility discipline
- distinguish long-term platform APIs from internal builder implementation details

## Core Domain Model
### Organization
The tenant and admin boundary for Project CB. Organizations own flows, members, invites, settings, and API keys.

### Flow
An authored guided form experience. A flow is the top-level unit managed by internal users and consumed by the runtime.

### Node
A graph unit inside a flow. Nodes define the flow’s structural shape.

### Step
A user-visible stage in the guided experience. Steps contain step elements and define the primary progression through the flow.

### Decision node
A routing node that determines branching behavior and directs the user to the next relevant part of the flow.

### Step element
An authored input or piece of content inside a step. Step elements carry the actual editable surface of the user experience.

### Embedded runtime
The React component or package that fetches and renders a flow inside the host application.

### API key
A credential used to authorize runtime access and embedding behavior for the host application context.

## System Boundaries and Ownership
### Project CB owns
- the authored flow structure
- rendering rules for the runtime
- branching logic and decision behavior
- builder/admin management surfaces
- organization-level administration
- the runtime delivery contract

### Host app owns
- the surrounding application shell and context
- theming and presentation integration
- submission handling and downstream business workflows
- product behavior that happens after the flow is completed

### MVP boundary
MVP is React-first and embedded. It is not a public-hosted respondent platform by default.

## MVP Scope and Non-Goals
### In scope
- internal authoring/admin tooling
- guided multi-step flow builder
- branching logic
- showcase-ready preview
- embedded React runtime
- org management and API keys

### Out of scope
- non-React runtimes in MVP
- Project CB as the primary submission store
- generic workflow-engine positioning
- public respondent hosting unless intentionally added later
- host-app-agnostic renderer implementations in MVP

## Anti-Framing
Project CB should not be framed as:
- just an internal form-builder admin console
- mainly a workflow or process engine
- mainly a schema-export tool where the host app does all rendering
- a standalone survey-hosting product in MVP

## Open Questions
- What is the exact runtime contract for embedding by API key plus flow identifier?
- How close must internal preview be to the embedded runtime?
- Does public or shareable runtime access become a later product phase?
- If non-React runtimes are added later, are they package ports or schema-driven renderers?
- How should longer-term submission and integration semantics evolve if Project CB remains separate from host-app response ownership?

## Related Planning Docs
- [Frontend Deliverables](./Frontend%20Deliverables.md)
- [Backend Deliverables](./Backend%20Deliverables.md)

These should be treated as derived execution backlogs under the framing established here.
