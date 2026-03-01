# Implementation Guide - Form Builder System

## Getting Started

### Prerequisites
- Familiarity with TypeScript and RESTful API development
- Understanding of Sequelize ORM and Zod validation
- Experience with monorepo structures (pnpm workspaces)

---

## Core Implementation Patterns

### 1. Adding a New API Endpoint (Step-by-Step)

#### Step 1: Define Shared Schema
```bash
# Create in packages/shared/src/http/schemas/flows/steps/
# File: getSteps.ts

import { z } from "zod";

export const getStepsSchema = z.object({
  flowId: z.string().uuid(),
  includeProperties: z.boolean().default(true),
});
```

**Why:** Shared schemas ensure frontend and backend validation consistency.

#### Step 2: Implement Route Layer
```bash
# File: server/src/http/routes/flows/steps/getSteps.ts

import { Router } from "express";
import { getStepsSchema, getStepsResponseSchema } from "@shared/schemas/flows/steps";
import { handleRouteError } from "@server/utils/errorHandling";
import { StepEntity } from "@server/entities/StepEntity";

const router = Router();

router.get(":flowId/elements", async (req, res) => {
  try {
    // Validate input
    const validated = enforceSchema(req.params, getStepsSchema);

    // Business logic via entity layer
    const steps = await StepEntity.getSteps(validated.flowId);

    // Transform response
    const response = transformResponse(steps, validated.includeProperties);
    res.json(response);
  } catch (error) {
    await handleRouteError(error, req, res, getStepsResponseSchema);
  }
});

export default router;
```

**Key Points:**
- Use `enforceSchema()` for input validation
- Delegate business logic to entity layer
- Transform data before sending response
- Use error handler for consistency

#### Step 3: Create Entity Methods
```bash
// File: server/src/entities/StepEntity/instanceMethods/getSteps.ts

import { Step } from "@server/db/models";
import { StepElementCondition } from "@server/db/models/StepElementCondition";

export const getSteps = async (flowId: string) => {
  const transactions = await StepEntity.db.sequelize.transaction();
  try {
    // Get steps with related elements
    const steps = await Step.findAll({
      where: { flowId },
      include: [
        {
          model: StepElementCondition,
          as: "conditions",
          through: true
        }
      ],
      transaction: transactions
    });

    // Transform for API response
    return steps.map(step => ({
      id: step.id,
      name: step.name,
      elements: step.Elements.map(element => ({
        id: element.id,
        type: element.type,
        label: element.label,
        conditions: element.StepElementConditions?.map(c => c.condition)
      }))
    }));
  } finally {
    await transactions?.commit();
  }
};
```

**Why Entity Layer:** Contains business logic, handles relationships, transforms data for API consistency.

#### Step 4: Define Database Model (if new)
```bash
// File: server/src/db/models/StepElementCondition.ts

import { Model } from "sequelize";

export default class StepElementCondition extends Model {
  // Fields defined in migration files

  static associate = (model) => {
    model.hasMany(StepElementCondition, { as: "conditions", foreignKey: "stepElementId" });
  }
}
```

---

### 2. Creating New Element Types

#### Pattern for New Element Type (e.g., "Matrix")

**Step A: Define Type and Schema**
```bash
// packages/shared/src/types/elementTypes.ts
export enum ElementType {
  INPUT = "input",
  BUTTON = "button",
  LABEL = "label",
  MATRIX = "matrix", // New type
  // ... existing types
}
```

```bash
// packages/shared/src/http/schemas/elements/matrix.ts
groupMatrixSchema = z.object({
  type: z.literal(ElementType.Matrix),
  label: z.string().min(1),
  rows: z.number().int().positive().default(3),
  columns: z.number().int().positive().default(3),
  choices: z.array(z.string()).optional(),
});
```

**Step B: Implement Element Entity Methods**
```bash
// server/src/entities/ElementEntity/staticMethods/create.ts
groupMatrix = async (data: CreateElementInput) => {
  // Validate using enforceSchema
  const validated = enforceSchema(data, groupMatrixSchema);

  const t = await sequelize.transaction();
  try {
    const [element] = await Element.create({
      type: ElementType.Matrix,
      ...validated,
      stepId: data.stepId
    }, { transaction: t });

    return element;
  } finally {
    await t?.commit();
  }
};
```

**Step C: Conditional Logic Support**
```bash
// server/src/db/models/StepElementCondition.ts
// Already supports any condition type via JSONB storage
// No changes needed - conditions work with all element types
```

---

### 3. Implementing Conditional Logic

#### Pattern: Add Condition to Existing Element

```bash
// In entity method for updating an element
export const addElementCondition = async (
  stepId: string,
  elementId: string,
  conditionData: ConditionData
) => {
  try {
    // Validate condition data
    const validated = enforceSchema(conditionData, elementConditionSchema);

    // Create condition record
    await StepElementCondition.create({
      stepId,
      elementId,
      condition: validated.condition
    });

    return { success: true };
  } catch (error) {
    throw new Error(`Failed to add condition: ${error.message}`);
  }
};
```

#### Pattern: Evaluate Conditions at Runtime
```bash
// server/src/entities/StepEntity/instanceMethods/evaluateConditions.ts
export const evaluateConditions = async (
  stepId: string,
  stepContext: StepContext
) => {
  try {
    const conditions = await StepElementCondition.findAll({
      where: { stepId },
      include: [
        Model.Element
      ]
    });

    // Evaluate each condition based on context
    return conditions.map(condition => ({
      elementId: condition.elementId,
      shouldShow: evaluateCondition(
        condition.condition,
        stepContext.values
      )
    }));
  } catch (error) {
    throw error;
  }
};
```

---

## Common Operations Cheat Sheet

### 1. Transaction Pattern (Essential!)
```typescript
// Always use transactions for multi-step operations
const transaction = await sequelize.transaction();
try {
  // Multiple database operations
  const [step] = await Step.create(..., { transaction });
  const [element1] = await Element.create(..., { transaction });

  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 2. Error Handling Pattern
```typescript
try {
  // Business logic
} catch (error) {
  await handleRouteError(error, req, res, responseSchema);
}
```

### 3. Entity Method Structure
```typescript
// Static methods: create, update, delete, query
static create(data) { ... }
static getSteps(flowId) { ... }

// Instance methods: operations on a specific entity
getStepElements(elementId) { ... }
evaluateConditions(context) { ... }
```

### 4. Response Transformation Pattern
```typescript
const raw = await StepEntity.getSteps(flowId);
return raw.map(step => transformStepForAPI(step, includeProperties));
```

---

## Best Practices Checklist

### Before Implementation
- [ ] Have shared Zod schema defined in `packages/shared`?
- [ ] Document the business requirement (what problem does this solve?)
- [ ] Identify if new entity types/models are needed
- [ ] Consider conditional logic requirements

### During Implementation
- [ ] Use `enforceSchema()` for all input validation
- [ ] Keep business logic in entity layer, not routes
- [ ] Always use transactions for related operations
- [ ] Implement proper error handling with `handleRouteError()`
- [ ] Transform data consistently before sending responses
- [ ] Follow existing code patterns and naming conventions

### After Implementation
- [ ] Add unit tests (if project has testing)
- [ ] Update documentation (this guide!)
- [ ] Verify all error cases are handled
- [ ] Check performance at scale (especially conditions evaluation)

---

## Troubleshooting Common Issues

### Issue: Data not persisting after transaction
**Check:** Are you committing the transaction? Forgetting `await transaction.commit()` is a common mistake.

### Issue: Conditions not working
**Check:**
- Is condition data properly validated with Zod?
- Are conditions being stored in the database?
- Is the evaluation logic using correct context values?

### Issue: Validation errors not matching user input
**Check:** Are you using `enforceSchema()` consistently? Make sure you're passing the right parameters.

### Issue: Performance degradation with many conditions
**Check:** Consider optimizing condition evaluation - cache evaluated conditions when possible, avoid re-evaluating on every request if the condition logic hasn't changed.

---

## Migration Examples

### Adding a New Field to Existing Element
1. **Update Type Definitions**: Add optional field to enum/type
2. **Update Schemas**: Make field optional in create/update schemas
3. **Update Database Model**: Add column to migration (or use JSONB for flexibility)
4. **Update Entity Methods**: Handle new field in create and transformation methods
5. **Backward Compatibility**: Keep field optional - existing data won't break

### Changing Condition Logic Format
1. **Add New Condition Type**: Extend condition schema with new operator/field options
2. **Update Evaluation Logic**: Modify the condition evaluation function to handle new formats
3. **Keep Old Logic**: Support old condition format during transition period
4. **Data Migration Script**: Write a script to transform old conditions to new format (if needed)

---

*Remember: Focus on "Why" in commit messages. The patterns above ensure maintainability and consistency across the codebase.*