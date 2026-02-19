# Test Plan: Step Endpoints

## Endpoint 1: Create a new step
**Method:** POST /api/steps
**Request Body:**
```json
{
  "title": "User Registration",
  "description": "Collect user information for registration",
  "elements": {
    "name": {"type": "text", "label": "Full Name"},
    "email": {"type": "email", "label": "Email Address"}
  },
  "published": true
}
```

**Expected Response:**
```json
{
  "nodeId": "uuid-string",
  "title": "User Registration",
  "description": "Collect user information for registration",
  "elements": {
    "name": {"type": "text", "label": "Full Name"},
    "email": {"type": "email", "label": "Email Address"}
  },
  "published": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Endpoint 2: Submit to a step
**Method:** POST /api/steps/submit
**Request Body:**
```json
{
  "stepId": "uuid-string",
  "submissionData": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Expected Response:**
```json
{
  "id": "uuid-string",
  "stepId": "uuid-string",
  "submissionData": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "timestamp"
}
```