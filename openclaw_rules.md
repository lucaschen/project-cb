# OpenClaw Repository Rules & Guidelines

This document outlines the standard practices, conventions, and rules that should be followed when working with this repository. These guidelines help maintain consistency across codebase, documentation, and implementation.

## Code Style & Conventions

### TypeScript Typing
- Avoid `any` types in API payloads - use proper Zod schemas or interfaces
- Use descriptive variable names (e.g., `element` instead of `el`)
- Follow existing patterns from other routes when implementing new functionality
- Types should be imported from shared packages where available

### Documentation
- All functions must have JSDoc comments explaining purpose, parameters, and return values
- Inline documentation should explain complex logic or non-obvious implementation details  
- Comments should follow the same style as existing codebase
- Parameter descriptions should match API contracts exactly

## File Structure & Organization

### Project Layout
```
project-cb/
├── server/
│   └── src/http/routes/steps/elements/
│       └── createStepElement.ts  # Implementation file
├── packages/shared/
│   └── src/http/schemas/         # Shared schemas for API contracts
└── MENTAL_MAP.md                 # Current architecture overview
```

### File Naming Conventions
- Use kebab-case for filenames (e.g., `create-step-element.ts`)
- Use PascalCase for class and interface names (e.g., `StepElementType`)
- Directory names should be lowercase with hyphens

## API Implementation Rules

### Route Structure
- All routes follow the pattern: `/api/{resource}/{id}/{sub-resource}`
- Sub-routers are used to organize related endpoints (e.g., steps/elements)
- Parameters are validated through route definition and middleware

### Error Handling
- Use proper HTTP status codes (404 for missing resources, 500 for server errors)
- Return consistent error response format: `{ error: "message", message?: "details" }`
- Log errors appropriately with console.error() for debugging purposes

## Development Workflow

### Coding Tasks (CRITICAL)
- **Always use Opencode** for coding tasks — do not rawdog edits directly to files
- When given a coding task, first plan with Opencode then execute the approved changes
- Rawdogging file edits bypasses proper review and leads to broken builds (as seen in element schema generation)
- Use `/opencode plan` → get approval → `/opencode build` pattern for all implementation

### Build Process
- All code must pass TypeScript compilation without errors
- Run `npm run build` to verify implementation works in context
- Changes should not break existing functionality

### Testing Guidelines
- Implement appropriate validation checks before database operations  
- Ensure proper error handling with descriptive messages
- Test both success and failure scenarios where possible

## Repository-Specific Rules

### Shared Schemas
- When available, use Zod schemas from `@packages/shared` for API contracts
- These can be consumed by frontend applications to maintain consistency
- Schema validation should happen at the route level using existing utilities

### Database Operations  
- Use established database models (`models.Node`, `models.StepElement`) consistently
- Follow patterns used in other working endpoints like `createDecisionNode`
- Maintain proper relationship mapping between entities

## Architecture Management Rules

### Mental Map Maintenance (CRITICAL)
When making any changes to the codebase, architecture must be updated automatically:
1. **Always review MENTAL_MAP.md** before implementing new features or modifying existing ones
2. **Update MENTAL_MAP.md with any architectural changes** discovered during development  
3. **Automatically reflect new patterns and structures** in the mental map documentation

### Architecture Consistency (CRITICAL)
All implementation must follow established patterns from MENTAL_MAP.md:
1. **Entity-based services pattern**: Entities are primary service layer, not separate service objects
2. **Schema validation approach**: Use `enforceSchema()` with shared Zod schemas  
3. **Error handling consistency**: Use `handleRouteError()` wrapper
4. **Relationship management**: Proper entity associations through foreign keys

## Quality Assurance

### Code Review Standards
1. All changes must follow project conventions exactly
2. No `any` types should be present in public APIs or route handlers
3. Every function must have appropriate documentation comments
4. Implementation must integrate seamlessly with existing codebase patterns
5. Build process must complete successfully without warnings
6. **Always verify MENTAL_MAP.md reflects current state** before final review

These rules ensure consistency, maintainability, and clarity across the entire repository while maintaining proper architectural awareness.