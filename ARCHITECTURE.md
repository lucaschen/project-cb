# Project Architecture

## Overview
This is a Turborepo-based monorepo with separate frontend and backend applications.

## Directory Structure
```
project-cb/
├── app/                 # React/Vite frontend application
├── server/              # Express/TypeScript backend API
│   ├── src/
│   │   ├── http/
│   │   │   └── routes/  # HTTP route handlers
│   │   │       └── steps/  # Step-related endpoints
│   │   ├── db/
│   │   │   └── models/  # Database models for entities
│   │   └── index.ts     # Entry point and API setup
├── package.json         # Project configuration and dependencies
└── ARCHITECTURE.md      # This document
```

## Core Entities

### Step
Represents a single form or step within a flow. The entity has the following structure:
- `nodeId`: UUID primary key, linking to Node table 
- `nextNodeId`: UUID foreign key to next node in flow (nullable)
- `title`: String, required field for step name
- `description`: Text, optional description of the step
- `elements`: JSONB object containing form elements and their configurations  
- `published`: Boolean flag indicating if step is published
- `createdAt`: Timestamp when record was created
- `updatedAt`: Timestamp when record was last updated

### StepSubmission
Tracks individual submissions for steps:
- `id`: String primary key (auto-generated)
- `stepId`: String foreign key referencing the step 
- `submissionData`: JSONB object containing submitted form data
- `createdAt`: Timestamp of submission

## API Routes

### Steps Endpoint (`/api/steps`)
- **POST /**: Create a new step/form with title, description, elements and published status
- **POST /submit**: Submit form data for a specific step
- **GET /:stepId/submissions**: Retrieve all submissions for a given step

## Database Schema

The database uses PostgreSQL with Sequelize ORM. Key relationships include:
- Step connects to Node via nodeId (1:1)
- Steps can be part of Flows (N:1 relationship)

## Flow of Data
1. A user creates a form/step using the POST /api/steps endpoint
2. Form elements are stored in the `elements` field as JSONB 
3. When users submit forms, data is sent to POST /api/steps/submit
4. Submissions are tracked in StepSubmission table with references to the step ID

## Implementation Details

The implementation follows RESTful conventions with:
- Proper HTTP status codes (201 for creation, 400 for validation errors)
- JSON responses for API interactions  
- Error handling with appropriate logging
- Sequelize models that map directly to database tables

This architecture supports dynamic form building and submission tracking for multi-step processes.