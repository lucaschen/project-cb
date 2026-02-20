# MENTAL_MAP.md - Backend Architecture Overview

## Core Architecture Layers

### 1. HTTP Layer (`server/src/http/routes/`)
- **Purpose**: Handles all incoming requests and responses  
- **Components**: Route handlers, middleware, error handling
- **Pattern**: Direct implementation with validation via shared schemas

### 2. Business Logic Layer (`server/src/entities/`) 
- **Purpose**: Contains application-specific business rules and workflows
- **Components**: Entity classes and static methods for CRUD operations
- **Pattern**: Entities encapsulate business logic and data access

### 3. Data Access Layer (`server/src/db/models/`)
- **Purpose**: Handles all database interactions through ORM  
- **Components**: Sequelize models with associations
- **Pattern**: Direct model interaction with entity layer abstraction

### 4. Shared Package Integration (`@packages/shared/`)
- **Purpose**: Provides reusable components across the entire system
- **Components**: API schemas, type definitions, shared utilities
- **Pattern**: Schema validation and consistent typing between frontend/backend

## Entity Structure (Core Services)

The backend uses a layered entity pattern:

### Flow Entities:
```
FlowEntity
├── staticMethods/
│   ├── create() 
│   └── findById()
└── instanceMethods/
    └── (business methods)
```

### Node Entities:  
```
NodeEntity
├── staticMethods/
│   ├── create()
│   └── findById()
└── instanceMethods/
    └── (node-specific business logic)
```

### Step Entities:
```
StepEntity
├── staticMethods/
│   ├── create() 
│   └── findById()
└── instanceMethods/
    └── (step-specific business logic)  
```

### Decision Node Entities:
```
DecisionNodeEntity
├── staticMethods/
│   ├── create()
│   └── findById()
└── instanceMethods/
    ├── createDecisionNodeCondition() 
    └── fetchDecisionNodeConditions()
```

### Step Element Entities:
```
StepElementEntity  
├── staticMethods/
│   ├── create()
│   └── findById()
└── instanceMethods/
    └── (element-specific business logic)
```

## Route Pattern Examples

### Flow Creation
`POST /flows` → `createFlow.ts`
- Creates Flow entity
- Returns flow data with ID

### Step Creation  
`POST /flows/:flowId/steps` → `createStep.ts`
- Uses FlowEntity.findById() to validate flow exists
- Creates NodeEntity for step node
- Creates StepEntity with nodeId reference
- Returns complete step data structure  

### Decision Node Creation
`POST /flows/:flowId/decision-nodes` → `createDecisionNode.ts`
- Validates flow exists via FlowEntity.findById()
- Creates NodeEntity (type: DECISION)
- Creates DecisionNodeEntity with node relationship  
- Returns decision node data

## Key Implementation Patterns

### 1. Entity-Based Architecture
All business logic is encapsulated in entities:
- Entities are the primary way to interact with domain objects
- Static methods handle creation and retrieval 
- Instance methods provide object-specific functionality

### 2. Schema Validation Pattern
Routes use shared Zod schemas for validation:
```typescript
const createStepNode = enforceSchema({
  handler: async (req, res) => { /* business logic */ },
  inputSchema: createStepInput,
  outputSchema: createStepOutput,
});
```

### 3. Error Handling Consistency  
All routes use consistent error handling wrapper:
- `handleRouteError()` to catch and format errors
- Specific error types for different scenarios (NotFoundError, etc.)

### 4. Flow Relationships  
Entities maintain proper relationships through foreign keys:
- Node → Step/DecisionNode (one-to-one)
- Flow → Nodes (one-to-many) 
- StepElement ↔ Element (many-to-many)

## Data Flow Example: Create Step

1. **HTTP Layer**: `createStep.ts` receives request
2. **Validation**: Shared schema validates input  
3. **Business Logic**: FlowEntity.findById() to validate flow exists
4. **Data Access**: NodeEntity.create(), StepEntity.create()
5. **Response**: JSON with complete step data

## Integration Points

### 1. Shared Schemas: `@packages/shared/src/http/schemas/`
- Validate all requests at route level  
- Ensure frontend/backend contracts match exactly
- Enable type inference for TypeScript safety

### 2. Database Models: `server/src/db/models/` 
- Sequelize models with associations
- Proper foreign key relationships maintained
- Migration support for schema changes

### 3. Entities: `server/src/entities/`
- Encapsulate business logic and data access
- Provide consistent API for route handlers  
- Handle complex operations like node creation with proper associations

## Services & Components

The "services" are actually the entities themselves:
- Each entity acts as a service that manages its domain objects  
- No separate service layer - entities provide all required functionality
- Static methods handle CRUD, instance methods handle business logic

## Architecture Benefits

1. **Consistency**: All routes follow same patterns with entities and schemas
2. **Maintainability**: Business logic centralized in entity classes
3. **Type Safety**: Shared schemas ensure perfect contract consistency  
4. **Scalability**: Entities can be extended without changing route structure
5. **Testability**: Clear separation of concerns makes testing straightforward

This mental map represents the actual backend architecture used by this project, with entities as the core services and proper validation through shared schemas.