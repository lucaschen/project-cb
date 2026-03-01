# Form Builder Architecture Documentation

## Executive Summary
This document describes the architecture and coding patterns of a business-grade form builder system. The system enables creation of complex workflows with conditional logic, custom properties, and multi-step forms using a monorepo structure.

---

## 1. High-Level Architecture

### 1.1 Monorepo Structure
```
project-cb/
├── app/                      # Frontend (React application)
├── server/                   # Backend API (TypeScript/Sequelize)
│   ├── src/
│   │   ├── http/             # HTTP routes & controllers
│   │   ├── db/               # Database models (Sequelize ORM)
│   │   └── entities/         # Business logic layer
├── packages/shared/          # Shared code between frontend/backend
│   ├── src/
│   │   ├── http/schemas/     # API validation schemas (Zod)
│   │   ├── types/            # TypeScript enums & shared types
│   │   └── generated/        # Auto-generated element schemas
└── memory/                   # Runtime data structures (for reference)
```

### 1.2 Data Flow
```
Frontend (app)
  → HTTP Routes (server/src/http) with Zod validation
    → Entity Layer (server/src/entities - business logic)
      → Database Models (server/src/db/models - Sequelize)
        ↔ Shared Types & Enums (packages/shared)
```

---

## 2. Core Business Domain Model

### 2.1 Key Concepts
- **Organization**: Top-level container for managing users, flows, and access
- **Flow**: Sequence of steps/nodes representing a complete workflow
- **Step**: Logical unit containing multiple UI elements with ordering and conditions
- **Element**: Individual UI component (button, input, label, etc.) tied to a specific step
- **Properties**: Custom data attached to individual elements for configuration
- **Condition**: Conditional logic determining element visibility or behavior based on user input

### 2.2 Key Relationships
```
Organization ──< User >── Organization
     │
     └──── Organization ──< Flow >──< Step >───< Element >
                         │              │             │
                         │              │             └── Condition
                         │              └── Condition
                         └──> Session (runtime execution context)
```

---

## 3. Technical Stack & Decisions

### 3.1 Core Technologies
- **Database**: PostgreSQL with Sequelize ORM
- **Validation**: Zod schemas (shared across frontend and backend)
- **Error Handling**: `enforceSchema()` wrapper + `handleRouteError()`
- **Routing**: RESTful API with `/api/{resource}/{id}/{sub-resource}` pattern

### 3.2 Critical Technical Decisions

#### Decision 1: Data Storage Strategy
- **Elements use string IDs** (not UUID) → Maintains component mapping between frontend/backend
- **Complex data stored in JSONB fields** → Flexibility for conditions, properties, custom data
- **Strategic indexing** on unique combinations and ordering fields

#### Decision 2: Separation of Concerns
- **Database Models**: Raw Sequelize definitions (direct database access)
- **Entities**: Business logic layer with validation, relationships, business rules
- **Routes**: HTTP interface layer with input/output validation and error handling

#### Decision 3: API Consistency
- All routes use shared Zod schemas for validation
- Standard error format: `{ error: "message", message?: "details" }`
- UUID generation handled uniformly across services

---

## 4. Coding Patterns & Conventions

### 4.1 File Organization Convention
Use consistent naming and location based on component:

| Type | Location | Naming Convention |
|------|----------|-------------------|
| Route | `/server/src/http/routes/{resource}/{sub-resource}/` | `createStep.ts`, `getSteps.ts` |
| Schema | `/packages/shared/src/http/schemas/flows/steps/` | `createStep.ts` (shared) |
| Model | `/server/src/db/models/` | `Step.ts`, `Element.ts` |
| Entity | `/server/src/entities/{EntityName}/` | `StepEntity.ts`, `staticMethods/create.ts` |
| Type | `/packages/shared/src/types/` | `FlowType.ts`, `ElementType.ts` |

### 4.2 Entity Pattern (Most Important)

#### Pattern Definition
```typescript
// Base entity pattern example from StepEntity
export default class StepEntity {
  dbModel: Step; // Reference to database model wrapper

  // Static methods for creation operations
  static create = create;           // Basic creation
  static createWithElements = createWithElements; // Enhanced with related data

  // Instance methods for querying and operations
  getStepElements = getStepElements;
  getStepElementProperties = getStepElementProperties;
}
```

#### Implementation Guidelines
1. **Static Methods**: Handle CRUD operations, input validation, business rules
2. **Instance Methods**: Operations on specific instances (fetching related data, transformations)
3. **Validation**: Enforced within static methods before database operations
4. **Error Handling**: Use `enforceSchema()` and custom error responses

### 4.3 Conditional Logic Pattern

#### StepElementCondition Model
- Stores condition statements using Zod-based validation
- Supports both step-level and element-specific conditions
- Conditions can reference previous user input values dynamically

#### Usage Pattern
```typescript
// Condition definition
const condition = {
  field: "previousStep.input1",
  operator: "equals",
  value: "someValue"
};

// Applied at entity layer for validation and execution
stepEntity.getConditions(); // Returns all conditions for step
elementCondition.check();   // Evaluates if element should be visible
```

---

## 5. Error Handling Strategy

### Standard Response Format
```json
{
  "error": "validation_error",
  "message": "The 'name' field is required"
}
```

### Layers of Error Handling
1. **Input Validation**: Zod schemas reject invalid input early
2. **Business Rules**: Entity methods validate domain-specific constraints
3. **Database Errors**: `handleRouteError()` catches and transforms
4. **Consistent Wrapping**: All errors standardized before response

---

## 6. Best Practices & Guidelines

### 6.1 Development Workflow
1. **Design API first** using shared Zod schemas
2. **Implement route layer** with validation and error handling
3. **Build entity layer** with business logic and relationships
4. **Create database models** as data access layer
5. **Verify data integrity** through indexes and constraints

### 6.2 Code Quality
- Use `enforceSchema()` for all external input validation
- Apply `handleRouteError()` in route handlers for consistent error responses
- Follow entity pattern for all domain objects
- Keep business logic in entities, not routes or models
- Use JSONB fields wisely - balance flexibility with data integrity

---

## 7. Reference Implementation Examples

### Creating a Step with Elements (Entity Pattern)
```typescript
// server/src/entities/StepEntity/staticMethods/createWithElements.ts
export const createWithElements = async (data: CreateStepInput) => {
  // Validate using enforceSchema()
  const validated = enforceSchema(data, createStepSchema);

  // Begin transaction
  const t = await sequelize.transaction();
  try {
    // Create step in DB
    const [step] = await Step.create(validated, { transaction: t });

    // Create elements with conditions
    for (const element of validated.elements) {
      const [elementData] = await Element.create({
        ...element,
        stepId: step.id
      }, { transaction: t });

      if (element.condition) {
        await StepElementCondition.create({
          elementId: elementData.id,
          condition: element.condition
        }, { transaction: t });
      }
    }

    await t.commit();
    return step;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
```

---

## 8. Migration & Evolution Considerations

### Adding New Features
- **New Element Type**: Add to types, schemas, models, entities, and frontend components
- **Conditional Logic Enhancement**: Update condition model and entity methods
- **Data Migration**: Plan index additions or schema changes carefully

### Scaling Considerations
- Current architecture supports horizontal scaling via API layer
- Database indexing strategies critical for performance at scale
- Conditional logic evaluation should be optimized for runtime execution

---

*Documentation generated based on codebase exploration. Follows project rules: multi-file edits, no intermediate tests, clear commit messages focusing on "Why".*