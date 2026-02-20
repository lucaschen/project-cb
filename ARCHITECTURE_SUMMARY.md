# Architecture Summary

## Core Pattern: Entity-Based Services

The backend follows an entity-based service pattern where:
- **Entities** (`server/src/entities/`) are the core services that encapsulate business logic
- Each entity class provides both static methods (CRUD operations) and instance methods (business logic)
- Routes call entity methods directly rather than using separate service layers

## Key Components

### 1. HTTP Layer
- Route handlers in `server/src/http/routes/`
- Use `enforceSchema()` with shared Zod schemas from `@packages/shared` for validation
- All routes use consistent error handling wrapper `handleRouteError()`

### 2. Business Logic Layer  
- Entities (e.g., `StepEntity`, `DecisionNodeEntity`, `FlowEntity`)
- Static methods handle creation/retrieval, instance methods handle business logic
- Examples: `create()` method for entity instantiation and business rules

### 3. Data Access Layer
- Sequelize models in `server/src/db/models/`
- Proper foreign key relationships maintained through associations
- Entities interact with models but maintain separation of concerns

### 4. Shared Package Integration  
- Zod schemas from `@packages/shared/src/http/schemas/` for validation
- Consistent API contracts between frontend and backend
- Type safety achieved through schema-based inference

## Key Implementation Examples  

### Step Creation Pattern:
```
POST /flows/:flowId/steps
→ createStep.ts route handler
  → FlowEntity.findById() to validate flow exists  
  → NodeEntity.create() for step node
  → StepEntity.create() with nodeId relationship
  → Returns complete step data structure
```

### Decision Node Creation Pattern:
```
POST /flows/:flowId/decision-nodes  
→ createDecisionNode.ts route handler
  → FlowEntity.findById() to validate flow exists
  → NodeEntity.create() (type: DECISION)
  → DecisionNodeEntity.create() with node relationship
  → Returns decision node data
```

## Architecture Benefits

1. **Consistency**: All routes follow same patterns and entity usage  
2. **Maintainability**: Business logic centralized in entities
3. **Type Safety**: Shared schemas ensure perfect contract consistency
4. **Scalability**: Entities can be extended without changing route structure
5. **Testability**: Clear separation of concerns makes testing straightforward

This architecture is well-documented and consistent, with `MENTAL_MAP.md` providing the current state reference for all implementation decisions.