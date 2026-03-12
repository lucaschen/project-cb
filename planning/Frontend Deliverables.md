# Frontend Deliverables

## Goal
Deliver a stakeholder-ready MVP frontend for Project CB using `React + Vite`, `Tailwind`, `TanStack Query`, and `Zustand`, with API-backed state treated as the source of truth wherever possible.

## MVP Principles
- Working over mocked
- Internal-user only for MVP
- Presentable to stakeholders
- Granular delivery so each ticket can be implemented and verified before moving forward
- `TanStack Query` for server state, `Zustand` for local editor and UI state only

## Delivery Sequence
### Foundation and access
- Frontend app setup and architecture
  - [FE 01 Project setup](./frontend-tickets/FE%2001%20Project%20setup.md)
- Authentication and session handling
  - [FE 02 Authentication and sessions](./frontend-tickets/FE%2002%20Authentication%20and%20sessions.md)
- Initial organization creation during onboarding
  - [FE 03 Organization creation and onboarding](./frontend-tickets/FE%2003%20Organization%20creation%20and%20onboarding.md)

### Core flow management
- Flow list and basic flow lifecycle
  - [FE 04 Flow list page](./frontend-tickets/FE%2004%20Flow%20list%20page.md)
  - [FE 05 Flow creation and metadata](./frontend-tickets/FE%2005%20Flow%20creation%20and%20metadata.md)

### Flow builder
- Builder shell, routing, and editor state
  - [FE 06 Flow builder shell](./frontend-tickets/FE%2006%20Flow%20builder%20shell.md)
- Step list management
  - [FE 07 Step list management](./frontend-tickets/FE%2007%20Step%20list%20management.md)
- Step property editing
  - [FE 08 Step properties sidebar](./frontend-tickets/FE%2008%20Step%20properties%20sidebar.md)
- Advanced step editing UX
  - [FE 09 Step modal editor](./frontend-tickets/FE%2009%20Step%20modal%20editor.md)
- Conditional logic and branching
  - [FE 10 Flow branching and logic](./frontend-tickets/FE%2010%20Flow%20branching%20and%20logic.md)
- Step-level preview during editing
  - [FE 11 Step preview in editor](./frontend-tickets/FE%2011%20Step%20preview%20in%20editor.md)

### Preview and execution
- Full flow preview and playthrough for internal users
  - [FE 12 Flow preview and playthrough](./frontend-tickets/FE%2012%20Flow%20preview%20and%20playthrough.md)
- Submission handling and completion states
  - [FE 13 Preview submission flow](./frontend-tickets/FE%2013%20Preview%20submission%20flow.md)

### Later-stage org management
- Organization switching and management surfaces
  - [FE 14 Organization management surfaces](./frontend-tickets/FE%2014%20Organization%20management%20surfaces.md)

## Deliverable Areas
### 1. App foundation
Set up the frontend application structure, routing, environment handling, API client conventions, query providers, state boundaries, and shared UI primitives required by all later tickets.

### 2. Auth and onboarding
Provide email/password sign-in, session persistence, route protection, and a first-run organization creation path so an internal user can enter the product and start building.

### 3. Flow management
Provide list and create flows experiences, flow metadata editing, and the top-level navigation into the builder.

### 4. Flow builder and step editing
Provide the main builder experience for composing multi-step flows, including step CRUD, reordering, property editing, richer modal editing for complex step types, and local editing state.

### 5. Logic and preview
Provide meaningful conditional logic and stakeholder-ready preview behavior. This includes step preview while editing, real playthrough navigation, validation, branching, and submission handling.

### 6. Organization management
After the core builder and preview flows are stable, add the remaining org-management surfaces such as switching orgs, member/invite management, org settings, and delete org.

## Out of Scope for MVP
- Public/shareable respondent links
- Redux-based global state architecture
- Non-essential auth providers such as OAuth
- Over-optimizing abstractions before API shapes settle

## Open Planning Questions
- Exact step type set for MVP
- Whether registration is exposed in the frontend or handled out-of-band for internal users
- Exact member/invite permissions model for org management
- Whether autosave is required in the builder or manual save is sufficient for the first pass
