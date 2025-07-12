# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start development server on port 54581
npm run build           # Create production build
npm run typecheck       # TypeScript type checking
npm run lint            # ESLint code analysis

# Testing
npm run test            # Run Vitest unit tests
npm run test:unit       # Run unit tests once
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run Playwright end-to-end tests
```

## Architecture Overview

SQLiteZen is a browser-based SQLite database management tool built with React, TypeScript, and WebAssembly.

### Core Architecture Patterns

- **Singleton SQLiteService**: `src/services/sqliteService.ts` manages all database operations through sql.js WebAssembly
- **Zustand State Management**: `src/store/databaseStore.ts` handles global application state with reactive updates
- **Service Layer**: Business logic separated into focused services (storage, export, query templates)
- **Component-Based UI**: React components with TypeScript, styled with Tailwind CSS

### Key Services

- **SQLiteService** (`src/services/sqliteService.ts`): WebAssembly SQLite operations, query execution, schema introspection
- **StorageService** (`src/services/storageService.ts`): IndexedDB persistence for database files
- **ExportService** (`src/services/exportService.ts`): Multi-format data export (SQLite, SQL, CSV, JSON, Excel)
- **QueryTemplateService** (`src/services/queryTemplateService.ts`): Parameterized query templates

### State Management Flow

1. `useDatabaseStore` (Zustand) manages global state
2. Services are injected into store for business logic
3. Components consume store state reactively
4. Database connections tracked with UUIDs
5. Schema changes trigger reactive updates via `schemaVersion` counter

### WebAssembly Integration

- sql.js loads SQLite as WebAssembly module
- WASM file served from `/sql-wasm.wasm` via webpack copy
- Requires COOP/COEP headers for SharedArrayBuffer support
- Database operations run in main thread with full SQLite functionality

### Import Path Convention

Uses `@/*` path mapping (configured in tsconfig.json) for src imports:
```typescript
import { SQLiteService } from '@/services/sqliteService';
import { useDatabaseStore } from '@/store/databaseStore';
```

### Component Organization

- **Layout Components**: Header, Sidebar, Layout provide app structure
- **Panel Components**: EditorPanel (Monaco SQL editor), ResultsPanel (query results), DataGrid (table data)
- **Dialog Components**: Modal interfaces for import/export, row editing, search
- **UI Components**: Reusable primitives in `src/components/ui/`

### Data Flow

1. User interactions trigger store actions
2. Store delegates to appropriate service
3. Service performs business logic (DB operations, file I/O)
4. Store updates reactive state
5. UI components re-render automatically
6. Toast notifications provide user feedback

### Testing Structure

- Unit tests in `tests/unit/` using Vitest and Testing Library
- E2E tests in `tests/e2e/` using Playwright
- Test utilities in `tests/utils/test-utils.tsx`
- Coverage reporting available via `npm run test:coverage`