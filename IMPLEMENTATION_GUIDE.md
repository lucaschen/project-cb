# Step Element Creation Implementation

## Overview

This document describes the implementation of step element creation with automatic property handling, which was implemented in `/server/src/http/routes/flows/steps/elements/createStepElement.ts`.

## Requirements

The system needs to:
1. Create step elements with associated properties
2. Automatically create property records when elements are created
3. Validate step and element existence
4. Handle property data properly (serialize to JSON strings)
5. Maintain consistency with existing architecture patterns

## Implementation Details

### File: `server/src/http/routes/flows/steps/elements/createStepElement.ts`

#### Key Features Implemented:

1. **Property Handling**: Automatic creation of `StepElementProperties` records when properties are provided
2. **Data Serialization**: Properties are serialized to JSON strings before storage
3. **Error Handling**: Proper error handling with descriptive messages
4. **Consistent Pattern**: Follows existing architecture patterns

#### Code Structure:

```typescript
// Import required modules
import { StepElementProperties } from "~db/models/StepElementProperties";
import ElementEntity from "~entities/ElementEntity";
import StepElementEntity from "~entities/StepElementEntity";
import StepEntity from "~entities/StepEntity";

// Main handler function
const createStepElement = enforceSchema({
  handler: async (req, res) => {
    // Extract properties from request body
    const { name, elementId, order, properties } = req.body;

    // Validate step exists
    const step = await StepEntity.findById(stepId);

    // Validate element exists
    const element = await ElementEntity.findById(elementId);

    // Create StepElement
    const stepElement = await StepElementEntity.create({
      id: uuidv4(),
      name: name,
      elementId: element.dbModel.id,
      stepId,
      order,
    });

    // Handle properties if provided
    if (properties && typeof properties === "object") {
      const propertyPromises = Object.entries(properties).map(
        async ([propertyId, propertyValue]) => {
          return await StepElementProperties.create({
            id: uuidv4(),
            stepElementId: stepElement.dbModel.id,
            propertyId,
            propertyValue: JSON.stringify(propertyValue),
          });
        }
      );
      await Promise.all(propertyPromises);
    }

    // Return created element
    res.status(201).json({
      id: stepElement.dbModel.id,
      name: stepElement.dbModel.name,
      elementId: stepElement.dbModel.elementId,
      stepId: stepElement.dbModel.stepId,
      order: stepElement.dbModel.order,
    });
  },
  // Schema validation
  inputSchema: createStepElementInput,
  outputSchema: createStepElementOutput,
});
```

## Database Schema Requirements

### StepElementProperties Table
```sql
CREATE TABLE stepElementsProperties (
  id UUID PRIMARY KEY,
  stepElementId UUID NOT NULL,
  propertyId VARCHAR(255) NOT NULL,
  propertyValue TEXT NOT NULL,
  FOREIGN KEY (stepElementId) REFERENCES stepElements(id)
);
```

## API Contract

### Input Schema
```typescript
// Uses shared schema from @packages/shared
export const createStepElementInput = elementZodSchemas;
```

### Output Schema
```typescript
export const createStepElementOutput = z.object({
  id: z.string(),
  name: z.string(),
  elementId: z.string(),
  stepId: z.string(),
  order: z.number(),
});
```

## Usage Example

### Request
```json
POST /flows/{flowId}/steps/{stepId}/elements
{
  "name": "My Element",
  "elementId": "some-element-id",
  "order": 1,
  "properties": {
    "color": "red",
    "size": "large",
    "enabled": true
  }
}
```

### Response
```json
{
  "id": "generated-uuid",
  "name": "My Element",
  "elementId": "some-element-id",
  "stepId": "step-uuid",
  "order": 1
}
```

## Architecture Integration

This implementation follows the established patterns:
1. **Entity Pattern**: Uses `StepElementEntity` and `ElementEntity` for business logic
2. **Schema Validation**: Leverages shared Zod schemas for input/output validation
3. **Error Handling**: Consistent error handling with `handleRouteError` wrapper
4. **Database Access**: Direct model interaction for data persistence

## Testing Considerations

### Unit Tests Needed
- Test property creation with various data types
- Test error handling for invalid properties
- Test validation of step and element existence
- Test successful creation flow

### Integration Tests Needed
- Test complete API endpoint with property handling
- Test database records creation for properties
- Test relationship integrity between entities