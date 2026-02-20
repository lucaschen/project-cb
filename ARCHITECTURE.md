# Project Architecture

## Overview

This project is a TypeScript-based web application with a monorepo structure that implements a flow-based system for creating and managing step elements with properties. The architecture follows clean separation of concerns with clear boundaries between the API layer, business logic, data access, and shared components.

## Project Structure

```
project-cb/
├── server/                    # Main application server
│   ├── src/
│   │   ├── http/              # HTTP layer (routes, controllers)
│   │   │   └── routes/
│   │   │       └── flows/
│   │   │           └── steps/
│   │   │               └── elements/
│   │   │                   └── createStepElement.ts  # Main implementation
│   │   ├── entities/          # Business entities and their methods
│   │   ├── db/                # Database models and connections
│   │   └── utils/             # Utility functions
│   └── package.json
├── packages/
│   └── shared/              # Shared packages for types and schemas
│       ├── src/
│       │   ├── http/
│       │   │   └── schemas/   # API contract schemas
│       │   └── utils/         # Shared utilities
│       └── package.json
└── README.md
```

## Core Components

### 1. HTTP Layer
- **Routes**: Define API endpoints and request handling
- **Controllers**: Handle request/response logic and validation
- **Middleware**: Shared utilities for request processing

### 2. Entities Layer
- **Business Logic**: Represent core business objects and their operations
- **Entity Pattern**: Each entity has a corresponding entity class with static methods
- **Separation of Concerns**: Business logic is separated from data access

### 3. Database Layer
- **Models**: Sequelize models for database tables
- **Relationships**: Defined associations between entities
- **Data Access**: Direct database interaction through models

### 4. Shared Package
- **Schemas**: Zod schemas for API contracts (input/output validation)
- **Types**: Shared TypeScript types and interfaces
- **Utilities**: Common utility functions used across the application

## Key Features

### Step Element Management
- Create step elements with associated properties
- Automatic creation of property records when elements are created
- Validation of step and element existence
- Proper error handling with descriptive messages

### Schema Validation
- Zod-based validation for all API endpoints
- Shared schemas between client and server
- Consistent error response format

### Entity Relationships
- StepElement → Element (many-to-one)
- StepElement → Step (many-to-one)
- StepElement → StepElementProperties (one-to-many)

## Architecture Principles

### 1. Separation of Concerns
- HTTP layer handles requests/responses
- Entities handle business logic
- Database layer handles data persistence
- Shared package handles common contracts

### 2. Consistency
- All routes follow the same pattern
- Error handling is consistent
- Schema validation is applied uniformly
- Naming conventions are consistent

### 3. Extensibility
- Modular design allows for easy addition of new features
- Shared schemas enable consistent API contracts
- Entity pattern supports easy extension

## Implementation Details

### Step Element Creation Flow
1. Request validation using shared Zod schemas
2. Verify step exists
3. Verify element exists
4. Create StepElement record
5. Create StepElementProperties records for each property
6. Return created element with properties

### Error Handling
- All routes use a consistent error handling wrapper
- Descriptive error messages for debugging
- Proper HTTP status codes
- Consistent error response format

### Database Design
- StepElement table stores core element data
- StepElementProperties table stores key-value property pairs
- Relationships maintained through foreign keys
- Unique constraints for data integrity

## Technology Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (via Sequelize)
- **Validation**: Zod
- **Build System**: TypeScript compiler
- **Package Management**: pnpm
- **Architecture**: Entity-based services pattern

## Design Patterns Used

### 1. Entity Pattern
Each business entity has its own class with static methods for operations:
- `StepElementEntity` with `create`, `findById` methods
- `StepElementPropertiesEntity` for property management

### 2. Schema Validation Pattern
- Shared Zod schemas for input/output validation
- Consistent validation across all routes
- Type safety at compile time

### 3. Error Handling Pattern
- Centralized error handling wrapper
- Consistent error response format
- Proper HTTP status codes

## Architecture Benefits

1. **Consistency**: All routes follow same patterns with entities and schemas
2. **Maintainability**: Business logic centralized in entity classes
3. **Type Safety**: Shared schemas ensure perfect contract consistency
4. **Scalability**: Entities can be extended without changing route structure
5. **Testability**: Clear separation of concerns makes testing straightforward

## Implementation Patterns

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

## Data Flow Example: Create Step Element
1. **HTTP Layer**: `createStepElement.ts` receives request
2. **Validation**: Shared schema validates input
3. **Business Logic**: StepEntity.findById() to validate step exists
4. **Business Logic**: ElementEntity.findById() to validate element exists
5. **Data Access**: StepElementEntity.create() creates the element
6. **Data Access**: StepElementProperties.create() for each property
7. **Response**: JSON with complete element data including properties

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
- Handle complex operations like element creation with proper associations

## Services & Components

The "services" are actually the entities themselves:
- Each entity acts as a service that manages its domain objects
- No separate service layer - entities provide all required functionality
- Static methods handle CRUD, instance methods handle business logic

## Future Considerations

### Scalability
- Consider caching for frequently accessed elements
- Implement pagination for large result sets
- Add connection pooling for database operations

### Testing
- Add unit tests for entity methods
- Add integration tests for API endpoints
- Implement mock database for testing

### Monitoring
- Add request logging
- Implement health checks
- Add performance monitoring