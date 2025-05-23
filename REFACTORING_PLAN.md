# MindKnot Codebase Refactoring Plan

This document outlines the step-by-step plan for refactoring the MindKnot codebase from the current atomic design structure to a feature-based organization.

## Progress Tracking

- [x] Create new directory structure
- [x] Copy files to new locations
- [x] Create index files for main directories
- [x] Update imports in example files
- [ ] Update all remaining imports
- [ ] Run TypeScript to verify correctness
- [ ] Remove old files once everything is working

## Implementation Strategy

The refactoring will follow a bottom-up approach, starting with core functionality and working up to UI components.

### Phase 1: Core Infrastructure (Current)

1. **Database and API Layer**
   - Move database files to `src/api/`
   - Rename service files to entity names (`actionService.ts` → `actions.ts`)
   - Update imports within these files

2. **State Management**
   - Reorganize Redux files by feature
   - Update imports to reflect new paths
   - Create index files for each feature to simplify imports

### Phase 2: Components and UI

1. **Shared Components**
   - Reorganize atomic design components into shared folder
   - Update imports

2. **Feature-Specific Components**
   - Organize by feature (actions, notes, etc.)
   - Update imports

3. **Screens**
   - Organize by feature
   - Update imports

### Phase 3: Integration and Testing

1. **Run TypeScript Compiler**
   - Verify all imports are correctly updated
   - Fix any remaining errors

2. **Test Key Functionality**
   - Ensure app loads correctly
   - Test CRUD operations for each entity
   - Test navigation and UI components

3. **Clean Up**
   - Remove duplicated files once everything is working
   - Update documentation

## Import Path Updates

For a complete reference of import path changes, see [IMPORT_MAPPING.md](./IMPORT_MAPPING.md).

## Guidance for Developers

When updating imports, follow these patterns:

1. **API/Database Imports**
   ```typescript
   // Old
   import { executeSql } from '../database/database';
   // New
   import { executeSql } from '../api/database';
   ```

2. **Redux/Store Imports**
   ```typescript
   // Old
   import { useActionActions } from '../redux/hooks/useActionActions';
   // New
   import { useActionActions } from '../store/actions/hooks';
   ```

3. **Component Imports**
   ```typescript
   // Old
   import { Button } from '../components/atoms/Button';
   // New
   import { Button } from '../components/shared/Button';
   // OR using index files
   import { Button } from '../components/shared';
   ```

## Rollback Plan

If issues arise during the refactoring:

1. Keep both old and new file structures until testing is complete
2. If major problems occur, revert to the previous structure
3. Consider a more gradual approach, refactoring one feature at a time