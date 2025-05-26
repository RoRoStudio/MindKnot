# Complete Codebase Restructure: Simplified Clean Architecture

## Project Overview

**Objective**: Complete restructure of the entire codebase using simplified clean architecture, with special focus on implementing a robust Loop entry type with background execution capabilities.

**Current Status**: Planning phase - no implementation started
**Target Architecture**: Simplified feature-based architecture for ALL entry types
**Key Requirement**: Background execution for loops that persists across app navigation, backgrounding, and closure
**Migration Status**: No migration needed - app is in initial development phase
**Theme Requirement**: ALL components must use theme colors - NO hardcoded colors allowed
**Shared Components**: Maximize reuse through shared component library

---

## Architecture Philosophy

### Core Principles
1. **Simple Feature Organization**: Each entry type lives in its own `features/` folder with minimal subfolders
2. **Easy to Find**: If you need something for loops, it's in `features/loops/`
3. **Background Execution**: Persistent execution state with recovery mechanisms (loops only)
4. **Single Responsibility**: Each file has one clear purpose
5. **Shared First**: Reuse components across entry types via `shared/` folder
6. **Theme Consistency**: NEVER hardcode colors - ALWAYS use theme settings
7. **Code Reuse**: Eliminate duplicate code through shared utilities and components

### Simple Layer Structure
- **Shared Layer**: Reusable components, hooks, services, and utilities across all features
- **Feature Layer**: Entry-type specific screens, components, hooks, and state
- **App Layer**: Navigation, theme, contexts, and store setup
- **Background Services**: Only for loops - background execution capabilities

---

## Current Codebase Analysis

### Files to be MOVED to new structure:

#### Shared Infrastructure (MOVE + ENHANCE)
```
# Components to move to shared/
src/components/common/                  → src/shared/components/ (MOVE + ENHANCE)
src/components/form/                    → src/shared/components/ (MOVE + ENHANCE)
src/components/navigation/              → src/shared/components/ (MOVE)
src/components/shared/                  → src/shared/components/ (MOVE + MERGE)
src/components/templates/               → src/shared/components/ (MOVE + ENHANCE)

# Entry-shared components
src/components/entries/EntryCard.tsx           → src/shared/components/ (MOVE)
src/components/entries/EntryDetailHeader.tsx   → src/shared/components/ (MOVE)
src/components/entries/EntryMetadataBar.tsx    → src/shared/components/ (MOVE)
src/components/entries/EntryTitleInput.tsx     → src/shared/components/ (MOVE)

# App-level files to move
src/navigation/                         → src/app/navigation/ (MOVE)
src/theme/                              → src/app/theme/ (MOVE)
src/contexts/                           → src/app/contexts/ (MOVE)
src/constants/                          → src/shared/constants/ (MOVE)
src/utils/                              → src/shared/utils/ (MOVE)

# Shared services and hooks
src/hooks/useCategories.ts              → src/shared/hooks/ (MOVE)
src/hooks/useStyles.ts                  → src/shared/hooks/ (MOVE)
src/hooks/useThemedStyles.ts            → src/shared/hooks/ (MOVE)
src/hooks/useBackgroundTimer.ts         → src/shared/hooks/ (MOVE)
src/api/categoryService.ts              → src/shared/services/ (MOVE)
src/api/database.ts                     → src/shared/services/ (MOVE)
src/api/schema.ts                       → src/shared/services/ (MOVE)

# Shared types
src/types/baseEntry.ts                  → src/shared/types/ (MOVE)
src/types/category.ts                   → src/shared/types/ (MOVE)
src/types/navigation-types.ts           → src/shared/types/ (MOVE)
```

#### Entry-Specific Files (MOVE to features/)
```
# Actions feature
src/components/entries/actions/         → src/features/actions/components/ (MOVE)
src/screens/actions/                    → src/features/actions/screens/ (MOVE)
src/store/actions/                      → src/features/actions/store/ (MOVE)
src/api/actionService.ts                → src/features/actions/hooks/ (MOVE + ENHANCE)
src/hooks/useActions.ts                 → src/features/actions/hooks/ (MOVE)
src/types/action.ts                     → src/shared/types/ (MOVE)

# Notes feature
src/components/entries/notes/           → src/features/notes/components/ (MOVE)
src/screens/notes/                      → src/features/notes/screens/ (MOVE)
src/store/notes/                        → src/features/notes/store/ (MOVE)
src/api/noteService.ts                  → src/features/notes/hooks/ (MOVE + ENHANCE)
src/hooks/useNotes.ts                   → src/features/notes/hooks/ (MOVE)
src/types/note.ts                       → src/shared/types/ (MOVE)

# Paths feature
src/components/entries/paths/           → src/features/paths/components/ (MOVE)
src/screens/paths/                      → src/features/paths/screens/ (MOVE)
src/store/paths/                        → src/features/paths/store/ (MOVE)
src/api/pathService.ts                  → src/features/paths/hooks/ (MOVE + ENHANCE)
src/hooks/usePaths.ts                   → src/features/paths/hooks/ (MOVE)
src/types/path.ts                       → src/shared/types/ (MOVE)

# Sagas feature
src/components/entries/sagas/           → src/features/sagas/components/ (MOVE)
src/screens/sagas/                      → src/features/sagas/screens/ (MOVE)
src/store/sagas/                        → src/features/sagas/store/ (MOVE)
src/api/sagaService.ts                  → src/features/sagas/hooks/ (MOVE + ENHANCE)
src/hooks/useSagas.ts                   → src/features/sagas/hooks/ (MOVE)
src/types/saga.ts                       → src/shared/types/ (MOVE)

# Sparks feature
src/components/entries/sparks/          → src/features/sparks/components/ (MOVE)
src/screens/sparks/                     → src/features/sparks/screens/ (MOVE)
src/store/sparks/                       → src/features/sparks/store/ (MOVE)
src/api/sparkService.ts                 → src/features/sparks/hooks/ (MOVE + ENHANCE)
src/hooks/useSparks.ts                  → src/features/sparks/hooks/ (MOVE)
src/types/spark.ts                      → src/shared/types/ (MOVE)

# Cross-feature screens
src/screens/vault/                      → src/shared/screens/ (MOVE)
```

### Files to be DELETED (old loop implementation):
```
src/components/entries/loops/           # ALL files - complete rewrite
src/screens/loops/                      # ALL files - complete rewrite
src/store/loops/                        # ALL files - complete rewrite
src/api/loopService.ts                  # Single file - complete rewrite
src/hooks/useLoops.ts                   # Single file - complete rewrite
src/hooks/useExpandableLoopHeader.ts    # Single file - complete rewrite
src/types/loop.ts                       # Single file - complete rewrite
```

### Files to be CREATED (new architecture):
```
# Complete new loop implementation
src/features/loops/                     → COMPLETE NEW IMPLEMENTATION

# Background services for loops only
src/features/loops/services/            → NEW: Background execution services

# Centralized store setup
src/app/store/                          → NEW: Centralized store setup
```

---

## Target Architecture Structure (Simplified)

### Complete Folder Structure
```
src/
├── shared/                            # Truly shared utilities and components
│   ├── components/                    # All reusable UI components
│   │   ├── Button.tsx                 # MOVED + ENHANCED from components/shared/Button.tsx
│   │   ├── Card.tsx                   # MOVED + ENHANCED from components/shared/Card.tsx
│   │   ├── Input.tsx                  # MOVED + ENHANCED from components/form/FormInput.tsx
│   │   ├── Modal.tsx                  # MOVED + ENHANCED from components/shared/ConfirmationModal.tsx
│   │   ├── Typography.tsx             # MOVED from components/shared/Typography.tsx
│   │   ├── Icon.tsx                   # MOVED from components/shared/Icon.tsx
│   │   ├── BottomSheet.tsx            # MOVED from components/shared/BottomSheet.tsx
│   │   ├── Timer.tsx                  # MOVED from components/shared/BeautifulTimer.tsx
│   │   ├── ColorPicker.tsx            # MOVED from components/shared/ColorPicker.tsx
│   │   ├── IconPicker.tsx             # MOVED from components/shared/IconPicker.tsx
│   │   ├── ProgressBar.tsx            # NEW: Reusable progress visualization
│   │   ├── StatusBadge.tsx            # NEW: Status indicators
│   │   ├── EntryCard.tsx              # MOVED from components/entries/EntryCard.tsx
│   │   ├── EntryDetailHeader.tsx      # MOVED from components/entries/EntryDetailHeader.tsx
│   │   ├── EntryMetadataBar.tsx       # MOVED from components/entries/EntryMetadataBar.tsx
│   │   ├── EntryTitleInput.tsx        # MOVED from components/entries/EntryTitleInput.tsx
│   │   ├── FormInput.tsx              # MOVED from components/form/FormInput.tsx
│   │   ├── FormSelect.tsx             # MOVED from components/form/FormSelect.tsx
│   │   ├── FormTextarea.tsx           # MOVED from components/form/FormTextarea.tsx
│   │   ├── FormCheckbox.tsx           # MOVED from components/form/FormCheckbox.tsx
│   │   ├── FormSwitch.tsx             # MOVED from components/form/FormSwitch.tsx
│   │   ├── FormTagInput.tsx           # MOVED from components/form/FormTagInput.tsx
│   │   ├── FormCategorySelector.tsx   # MOVED from components/form/FormCategorySelector.tsx
│   │   ├── FormDatePicker.tsx         # MOVED from components/form/FormDatePicker.tsx
│   │   ├── FormMoodSelector.tsx       # MOVED from components/form/FormMoodSelector.tsx
│   │   ├── FormRadioGroup.tsx         # MOVED from components/form/FormRadioGroup.tsx
│   │   ├── FormRichTextarea.tsx       # MOVED from components/form/FormRichTextarea.tsx
│   │   ├── Screen.tsx                 # MOVED + ENHANCED from components/templates/BaseEntityScreen.tsx
│   │   ├── Section.tsx                # NEW: Content section wrapper
│   │   ├── Header.tsx                 # NEW: Reusable header component
│   │   ├── TabBar.tsx                 # MOVED from components/navigation/CustomBottomNavBar.tsx
│   │   ├── DiamondFab.tsx             # MOVED from components/navigation/DiamondFab.tsx
│   │   ├── FilterableList.tsx         # MOVED from components/shared/FilterableList.tsx
│   │   ├── FilterableListHeader.tsx   # MOVED from components/shared/FilterableListHeader.tsx
│   │   ├── CategoryPill.tsx           # MOVED from components/shared/CategoryPill.tsx
│   │   ├── Label.tsx                  # MOVED from components/shared/Label.tsx
│   │   ├── LabelRow.tsx               # MOVED from components/shared/LabelRow.tsx
│   │   └── index.ts                   # NEW: Export all shared components
│   ├── screens/                       # Cross-feature screens
│   │   ├── VaultScreen.tsx            # MOVED from screens/vault/VaultScreen.tsx
│   │   ├── BaseVaultScreen.tsx        # MOVED from screens/vault/BaseVaultScreen.tsx
│   │   ├── VaultEmptyState.tsx        # MOVED from screens/vault/VaultEmptyState.tsx
│   │   └── index.ts                   # NEW
│   ├── hooks/                         # Shared hooks
│   │   ├── useTheme.ts                # MOVED from contexts/ThemeContext.tsx (hook part)
│   │   ├── useStyles.ts               # MOVED from hooks/useStyles.ts
│   │   ├── useThemedStyles.ts         # MOVED from hooks/useThemedStyles.ts
│   │   ├── useBackgroundTimer.ts      # MOVED from hooks/useBackgroundTimer.ts
│   │   ├── useCategories.ts           # MOVED from hooks/useCategories.ts
│   │   ├── useDatabase.ts             # NEW: Generic database operations
│   │   ├── useAsyncStorage.ts         # NEW: Generic storage operations
│   │   └── index.ts                   # NEW
│   ├── services/                      # Shared services
│   │   ├── database.ts                # MOVED + ENHANCED from api/database.ts
│   │   ├── schema.ts                  # MOVED from api/schema.ts
│   │   ├── categoryService.ts         # MOVED from api/categoryService.ts
│   │   ├── storage.ts                 # NEW: Storage utilities
│   │   └── index.ts                   # NEW
│   ├── types/                         # Shared types
│   │   ├── common.ts                  # NEW: Shared type definitions
│   │   ├── navigation.ts              # MOVED from types/navigation-types.ts
│   │   ├── baseEntry.ts               # MOVED from types/baseEntry.ts
│   │   ├── category.ts                # MOVED from types/category.ts
│   │   ├── action.ts                  # MOVED from types/action.ts
│   │   ├── note.ts                    # MOVED from types/note.ts
│   │   ├── path.ts                    # MOVED from types/path.ts
│   │   ├── saga.ts                    # MOVED from types/saga.ts
│   │   ├── spark.ts                   # MOVED from types/spark.ts
│   │   ├── loop.ts                    # NEW: Loop type definitions
│   │   └── index.ts                   # NEW
│   ├── utils/                         # Shared utilities
│   │   ├── dateUtils.ts               # MOVED from utils/dateUtils.ts
│   │   ├── uuid.ts                    # MOVED + MERGED from utils/uuid.ts + utils/uuidUtil.ts
│   │   ├── themeUtils.ts              # MOVED from utils/themeUtils.ts
│   │   ├── validation.ts              # NEW: Input validation utilities
│   │   ├── databaseReset.ts           # MOVED from utils/databaseReset.ts
│   │   └── index.ts                   # NEW
│   ├── constants/                     # Shared constants
│   │   ├── entryTypes.ts              # MOVED from constants/entryTypes.ts
│   │   └── index.ts                   # NEW
│   └── index.ts                       # NEW

├── features/                          # Feature-specific code
│   ├── actions/                       # Actions feature
│   │   ├── screens/
│   │   │   ├── ActionScreen.tsx       # MOVED from screens/actions/ActionScreen.tsx
│   │   │   └── index.ts               # NEW
│   │   ├── components/
│   │   │   ├── ActionCard.tsx         # MOVED from components/entries/actions/ActionCard.tsx
│   │   │   ├── ActionForm.tsx         # MOVED + ENHANCED from components/entries/actions/
│   │   │   └── index.ts               # NEW
│   │   ├── hooks/
│   │   │   ├── useActions.ts          # MOVED from hooks/useActions.ts
│   │   │   ├── useActionService.ts    # MOVED + ENHANCED from api/actionService.ts
│   │   │   └── index.ts               # NEW
│   │   ├── store/
│   │   │   ├── actionSlice.ts         # MOVED from store/actions/actionSlice.ts
│   │   │   ├── actionSelectors.ts     # MOVED from store/actions/actionSelectors.ts
│   │   │   ├── useActionActions.ts    # MOVED from store/actions/useActionActions.ts
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── notes/                         # Notes feature (similar structure)
│   │   ├── screens/
│   │   │   ├── NoteScreen.tsx         # MOVED from screens/notes/NoteScreen.tsx
│   │   │   └── index.ts               # NEW
│   │   ├── components/
│   │   │   ├── NoteCard.tsx           # MOVED from components/entries/notes/
│   │   │   ├── NoteForm.tsx           # MOVED + ENHANCED
│   │   │   └── index.ts               # NEW
│   │   ├── hooks/
│   │   │   ├── useNotes.ts            # MOVED from hooks/useNotes.ts
│   │   │   ├── useNoteService.ts      # MOVED + ENHANCED from api/noteService.ts
│   │   │   └── index.ts               # NEW
│   │   ├── store/
│   │   │   ├── noteSlice.ts           # MOVED from store/notes/
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── paths/                         # Paths feature (similar structure)
│   │   ├── screens/
│   │   │   ├── PathScreen.tsx         # MOVED from screens/paths/
│   │   │   └── index.ts               # NEW
│   │   ├── components/
│   │   │   ├── PathCard.tsx           # MOVED from components/entries/paths/
│   │   │   ├── ChapterCard.tsx        # MOVED + ENHANCED
│   │   │   └── index.ts               # NEW
│   │   ├── hooks/
│   │   │   ├── usePaths.ts            # MOVED from hooks/usePaths.ts
│   │   │   ├── usePathService.ts      # MOVED + ENHANCED from api/pathService.ts
│   │   │   └── index.ts               # NEW
│   │   ├── store/
│   │   │   ├── pathSlice.ts           # MOVED from store/paths/
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── sagas/                         # Sagas feature (similar structure)
│   │   ├── screens/
│   │   │   ├── SagaScreen.tsx         # MOVED from screens/sagas/
│   │   │   └── index.ts               # NEW
│   │   ├── components/
│   │   │   ├── SagaCard.tsx           # MOVED from components/entries/sagas/
│   │   │   └── index.ts               # NEW
│   │   ├── hooks/
│   │   │   ├── useSagas.ts            # MOVED from hooks/useSagas.ts
│   │   │   ├── useSagaService.ts      # MOVED + ENHANCED from api/sagaService.ts
│   │   │   └── index.ts               # NEW
│   │   ├── store/
│   │   │   ├── sagaSlice.ts           # MOVED from store/sagas/
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── sparks/                        # Sparks feature (similar structure)
│   │   ├── screens/
│   │   │   ├── SparkScreen.tsx        # MOVED from screens/sparks/
│   │   │   └── index.ts               # NEW
│   │   ├── components/
│   │   │   ├── SparkCard.tsx          # MOVED from components/entries/sparks/
│   │   │   └── index.ts               # NEW
│   │   ├── hooks/
│   │   │   ├── useSparks.ts           # MOVED from hooks/useSparks.ts
│   │   │   ├── useSparkService.ts     # MOVED + ENHANCED from api/sparkService.ts
│   │   │   └── index.ts               # NEW
│   │   ├── store/
│   │   │   ├── sparkSlice.ts          # MOVED from store/sparks/
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   └── loops/                         # COMPLETE NEW IMPLEMENTATION
│       ├── screens/
│       │   ├── LoopListScreen.tsx     # NEW: List and manage loops
│       │   ├── LoopDetailScreen.tsx   # NEW: View loop details
│       │   ├── LoopBuilderScreen.tsx  # NEW: Create and edit loops
│       │   ├── ExecutionScreen.tsx    # NEW: Execute loops with background support
│       │   ├── TemplateLibraryScreen.tsx # NEW: Manage activity templates
│       │   └── index.ts               # NEW
│       ├── components/
│       │   ├── LoopCard.tsx           # NEW: Loop display card (uses shared EntryCard)
│       │   ├── ActivityCard.tsx       # NEW: Activity display card
│       │   ├── TemplateCard.tsx       # NEW: Template display card
│       │   ├── ExecutionCard.tsx      # NEW: Execution status card
│       │   ├── LoopBuilder.tsx        # NEW: Drag & drop loop builder
│       │   ├── ActivityBuilder.tsx    # NEW: Activity configuration
│       │   ├── TemplateSelector.tsx   # NEW: Template selection
│       │   ├── QuickActions.tsx       # NEW: Quick loop actions
│       │   ├── DragDropList.tsx       # NEW: Reorderable activity list
│       │   ├── ExecutionController.tsx # NEW: Execution controls
│       │   ├── ActivityRunner.tsx     # NEW: Current activity display
│       │   ├── ProgressTracker.tsx    # NEW: Progress visualization (uses shared ProgressBar)
│       │   ├── TimerDisplay.tsx       # NEW: Background-aware timer (uses shared Timer)
│       │   ├── BackgroundIndicator.tsx # NEW: Background execution status
│       │   ├── ExecutionHistory.tsx   # NEW: Execution history display
│       │   ├── LoopForm.tsx           # NEW: Loop creation/edit form (uses shared form components)
│       │   ├── ActivityForm.tsx       # NEW: Activity configuration form
│       │   ├── TemplateForm.tsx       # NEW: Template creation form
│       │   ├── ExecutionSettings.tsx  # NEW: Execution preferences
│       │   ├── LoopIcon.tsx           # NEW: Loop iconography (uses shared Icon)
│       │   ├── ActivityIcon.tsx       # NEW: Activity iconography
│       │   └── index.ts               # NEW
│       ├── hooks/
│       │   ├── useLoops.ts            # NEW: Loop CRUD operations
│       │   ├── useLoopExecution.ts    # NEW: Execution management
│       │   ├── useActivityTemplates.ts # NEW: Template operations
│       │   ├── useBackgroundExecution.ts # NEW: Background execution hooks
│       │   ├── useLoopTimer.ts        # NEW: Timer management hooks
│       │   ├── useLoopBuilder.ts      # NEW: Loop builder state
│       │   └── index.ts               # NEW
│       ├── services/                  # ONLY loops has this folder - for background execution
│       │   ├── ExecutionEngine.ts     # NEW: Background execution engine
│       │   ├── TimerService.ts        # NEW: Background-persistent timer service
│       │   ├── TemplateService.ts     # NEW: Template management service
│       │   ├── RecoveryService.ts     # NEW: App restart recovery service
│       │   ├── BackgroundService.ts   # NEW: Background task coordination
│       │   ├── BackgroundTasks.ts     # NEW: iOS/Android background processing
│       │   ├── AppStateManager.ts     # NEW: App lifecycle management
│       │   ├── NotificationManager.ts # NEW: Future notification support
│       │   ├── ExecutionStorage.ts    # NEW: Persistent execution state
│       │   ├── BackgroundStorage.ts   # NEW: Background state management
│       │   └── index.ts               # NEW
│       ├── store/
│       │   ├── loopSlice.ts           # NEW: Loop data state
│       │   ├── executionSlice.ts      # NEW: Execution state
│       │   ├── templateSlice.ts       # NEW: Template state
│       │   ├── builderSlice.ts        # NEW: Loop builder state
│       │   ├── loopSelectors.ts       # NEW: Loop data selectors
│       │   ├── executionSelectors.ts  # NEW: Execution selectors
│       │   ├── templateSelectors.ts   # NEW: Template selectors
│       │   ├── builderSelectors.ts    # NEW: Builder selectors
│       │   ├── executionMiddleware.ts # NEW: Background execution middleware
│       │   ├── persistenceMiddleware.ts # NEW: State persistence middleware
│       │   └── index.ts               # NEW
│       └── index.ts                   # NEW: Main feature export

└── app/                               # App-level concerns
    ├── navigation/
    │   ├── AppNavigator.tsx           # MOVED from navigation/AppNavigator.tsx
    │   ├── TabNavigator.tsx           # MOVED from navigation/TabNavigator.tsx
    │   ├── VaultTabNavigator.tsx      # MOVED from navigation/VaultTabNavigator.tsx
    │   └── index.ts                   # NEW
    ├── store/
    │   ├── store.ts                   # NEW: Redux store setup
    │   ├── rootReducer.ts             # NEW: Combine all feature reducers
    │   ├── middleware.ts              # NEW: Global middleware setup
    │   ├── hooks.ts                   # MOVED from store/shared/hooks.ts
    │   ├── stateHooks.ts              # MOVED from store/shared/stateHooks.ts
    │   └── index.ts                   # NEW
    ├── theme/
    │   ├── colors.ts                  # MOVED from theme/styles/colors.ts
    │   ├── typography.ts              # MOVED from theme/styles/typography.ts
    │   ├── spacing.ts                 # MOVED from theme/styles/spacing.ts
    │   ├── tokens.ts                  # MOVED from theme/tokens.ts
    │   ├── light.ts                   # MOVED from theme/light.ts
    │   ├── dark.ts                    # MOVED from theme/dark.ts
    │   ├── themeTypes.ts              # MOVED from theme/themeTypes.ts
    │   ├── themeUtils.ts              # MOVED from theme/themeUtils.ts
    │   ├── styleConstants.ts          # MOVED from theme/styleConstants.ts
    │   └── index.ts                   # NEW
    ├── contexts/
    │   ├── ThemeContext.tsx           # MOVED from contexts/ThemeContext.tsx
    │   ├── BottomSheetContext.tsx     # MOVED from contexts/BottomSheetContext.tsx
    │   ├── BottomSheetConfig.tsx      # MOVED from contexts/BottomSheetConfig.tsx
    │   ├── VaultFiltersContext.tsx    # MOVED from contexts/VaultFiltersContext.tsx
    │   └── index.ts                   # NEW
    └── App.tsx                        # MOVED from App.tsx
```

---

## Implementation Phases

### Phase 1: Foundation Setup (Days 1-3)
**Status**: Not started
**Goal**: Create shared infrastructure and app-level structure for ALL entry types

#### Tasks:
1. **Create shared folder structure**
   - [ ] **MOVE** all common components to `src/shared/components/` and **ENHANCE** with theme usage
   - [ ] **MOVE** common hooks to `src/shared/hooks/`
   - [ ] **MOVE** common services to `src/shared/services/`
   - [ ] **MOVE** all types to `src/shared/types/`
   - [ ] **MOVE** common utils to `src/shared/utils/`
   - [ ] **MOVE** constants to `src/shared/constants/`

2. **Create app-level structure**
   - [ ] **MOVE** navigation to `src/app/navigation/`
   - [ ] **MOVE** store setup to `src/app/store/`
   - [ ] **MOVE** theme to `src/app/theme/`
   - [ ] **MOVE** contexts to `src/app/contexts/`

3. **Update imports across codebase**
   - [ ] Update all import statements to use new shared structure
   - [ ] Ensure all existing functionality still works
   - [ ] Test app thoroughly after restructuring

#### Key Requirements:
- **Theme Enforcement**: All moved components must use `theme.colors.*` instead of hardcoded values
- **Shared Component Usage**: Identify and consolidate duplicate components across entry types
- **Component Enhancement**: Improve moved components with better TypeScript types and performance

#### Success Criteria:
- [ ] All existing functionality works with new structure
- [ ] No broken imports
- [ ] App runs without errors
- [ ] **ALL colors use theme system - NO hardcoded colors**
- [ ] Shared components are properly consolidated

### Phase 2: Move All Entry Types (Days 4-6)
**Status**: Not started
**Goal**: Move all existing entry types to feature folders (except loops - that's Phase 3)

#### Tasks:
1. **Move Actions Feature**
   - [ ] **MOVE** screens to `src/features/actions/screens/`
   - [ ] **MOVE** components to `src/features/actions/components/`
   - [ ] **MOVE** hooks to `src/features/actions/hooks/`
   - [ ] **MOVE** store to `src/features/actions/store/`
   - [ ] **ENHANCE** with shared component usage and theme compliance

2. **Move Notes Feature**
   - [ ] **MOVE** screens to `src/features/notes/screens/`
   - [ ] **MOVE** components to `src/features/notes/components/`
   - [ ] **MOVE** hooks to `src/features/notes/hooks/`
   - [ ] **MOVE** store to `src/features/notes/store/`
   - [ ] **ENHANCE** with shared component usage and theme compliance

3. **Move Paths Feature**
   - [ ] **MOVE** screens to `src/features/paths/screens/`
   - [ ] **MOVE** components to `src/features/paths/components/`
   - [ ] **MOVE** hooks to `src/features/paths/hooks/`
   - [ ] **MOVE** store to `src/features/paths/store/`
   - [ ] **ENHANCE** with shared component usage and theme compliance

4. **Move Sagas Feature**
   - [ ] **MOVE** screens to `src/features/sagas/screens/`
   - [ ] **MOVE** components to `src/features/sagas/components/`
   - [ ] **MOVE** hooks to `src/features/sagas/hooks/`
   - [ ] **MOVE** store to `src/features/sagas/store/`
   - [ ] **ENHANCE** with shared component usage and theme compliance

5. **Move Sparks Feature**
   - [ ] **MOVE** screens to `src/features/sparks/screens/`
   - [ ] **MOVE** components to `src/features/sparks/components/`
   - [ ] **MOVE** hooks to `src/features/sparks/hooks/`
   - [ ] **MOVE** store to `src/features/sparks/store/`
   - [ ] **ENHANCE** with shared component usage and theme compliance

#### Success Criteria:
- [ ] All entry types work in their new feature folders
- [ ] All entry types use shared components where appropriate
- [ ] All entry types follow theme system consistently
- [ ] Navigation between features works correctly

### Phase 3: Create New Loop Implementation (Days 7-12)
**Status**: Not started
**Goal**: Implement complete new loop feature with background execution (COMPLETE NEW IMPLEMENTATION)

#### Tasks:
1. **Create Loop Screens (Days 7-8)**
   - [ ] **CREATE** `LoopListScreen.tsx` - List and manage loops
   - [ ] **CREATE** `LoopDetailScreen.tsx` - View loop details
   - [ ] **CREATE** `LoopBuilderScreen.tsx` - Create and edit loops
   - [ ] **CREATE** `ExecutionScreen.tsx` - Execute loops with background support
   - [ ] **CREATE** `TemplateLibraryScreen.tsx` - Manage activity templates

2. **Create Loop Components (Days 8-9)**
   - [ ] **CREATE** `LoopCard.tsx` - Loop display card (uses shared EntryCard)
   - [ ] **CREATE** `ActivityCard.tsx` - Activity display card
   - [ ] **CREATE** `TemplateCard.tsx` - Template display card
   - [ ] **CREATE** `ExecutionCard.tsx` - Execution status card
   - [ ] **CREATE** `LoopBuilder.tsx` - Drag & drop loop builder
   - [ ] **CREATE** `ActivityBuilder.tsx` - Activity configuration
   - [ ] **CREATE** `TemplateSelector.tsx` - Template selection
   - [ ] **CREATE** `QuickActions.tsx` - Quick loop actions
   - [ ] **CREATE** `DragDropList.tsx` - Reorderable activity list
   - [ ] **CREATE** `ExecutionController.tsx` - Execution controls
   - [ ] **CREATE** `ActivityRunner.tsx` - Current activity display
   - [ ] **CREATE** `ProgressTracker.tsx` - Progress visualization (uses shared ProgressBar)
   - [ ] **CREATE** `TimerDisplay.tsx` - Background-aware timer (uses shared Timer)
   - [ ] **CREATE** `BackgroundIndicator.tsx` - Background execution status
   - [ ] **CREATE** `ExecutionHistory.tsx` - Execution history display
   - [ ] **CREATE** `LoopForm.tsx` - Loop creation/edit form (uses shared form components)
   - [ ] **CREATE** `ActivityForm.tsx` - Activity configuration form
   - [ ] **CREATE** `TemplateForm.tsx` - Template creation form
   - [ ] **CREATE** `ExecutionSettings.tsx` - Execution preferences
   - [ ] **CREATE** `LoopIcon.tsx` - Loop iconography (uses shared Icon)
   - [ ] **CREATE** `ActivityIcon.tsx` - Activity iconography

3. **Create Background Services (Days 10-11)**
   - [ ] **CREATE** `ExecutionEngine.ts` - Core background execution engine
   - [ ] **CREATE** `TimerService.ts` - Background-persistent timer service
   - [ ] **CREATE** `TemplateService.ts` - Template management service
   - [ ] **CREATE** `RecoveryService.ts` - App restart recovery service
   - [ ] **CREATE** `BackgroundService.ts` - Background task coordination
   - [ ] **CREATE** `BackgroundTasks.ts` - iOS/Android background processing
   - [ ] **CREATE** `AppStateManager.ts` - App lifecycle management
   - [ ] **CREATE** `NotificationManager.ts` - Future notification support
   - [ ] **CREATE** `ExecutionStorage.ts` - Persistent execution state
   - [ ] **CREATE** `BackgroundStorage.ts` - Background state management

4. **Create Loop Hooks (Day 11)**
   - [ ] **CREATE** `useLoops.ts` - Loop CRUD operations
   - [ ] **CREATE** `useLoopExecution.ts` - Execution management
   - [ ] **CREATE** `useActivityTemplates.ts` - Template operations
   - [ ] **CREATE** `useBackgroundExecution.ts` - Background execution hooks
   - [ ] **CREATE** `useLoopTimer.ts` - Timer management hooks
   - [ ] **CREATE** `useLoopBuilder.ts` - Loop builder state

5. **Create Loop State Management (Day 12)**
   - [ ] **CREATE** `loopSlice.ts` - Loop data state
   - [ ] **CREATE** `executionSlice.ts` - Execution state
   - [ ] **CREATE** `templateSlice.ts` - Template state
   - [ ] **CREATE** `builderSlice.ts` - Loop builder state
   - [ ] **CREATE** `loopSelectors.ts` - Loop data selectors
   - [ ] **CREATE** `executionSelectors.ts` - Execution selectors
   - [ ] **CREATE** `templateSelectors.ts` - Template selectors
   - [ ] **CREATE** `builderSelectors.ts` - Builder selectors
   - [ ] **CREATE** `executionMiddleware.ts` - Background execution middleware
   - [ ] **CREATE** `persistenceMiddleware.ts` - State persistence middleware

#### Key Implementation Details:

**ExecutionEngine.ts** - Core background execution:
```typescript
export class ExecutionEngine {
  private static instance: ExecutionEngine;
  private currentExecution: ExecutionState | null = null;
  private timer: NodeJS.Timeout | null = null;
  private eventEmitter: EventEmitter;
  private backgroundTaskId: number | null = null;
  private lastActiveTimestamp: number = Date.now();

  // Core execution lifecycle
  async startLoop(loopId: string): Promise<void> {
    // 1. Load loop data
    // 2. Initialize execution state
    // 3. Start timer
    // 4. Save state to storage
    // 5. Emit execution started event
    // 6. Register background task
  }

  async pauseLoop(): Promise<void> {
    // 1. Pause timer
    // 2. Update execution state
    // 3. Save state to storage
    // 4. Emit execution paused event
  }

  async resumeLoop(): Promise<void> {
    // 1. Resume timer
    // 2. Update execution state
    // 3. Save state to storage
    // 4. Emit execution resumed event
  }

  async stopLoop(): Promise<void> {
    // 1. Stop timer
    // 2. Clear execution state
    // 3. Clear storage
    // 4. Emit execution stopped event
    // 5. End background task
  }

  // Background state management
  async handleAppBackground(): Promise<void> {
    // 1. Record background start time
    // 2. Save current state
    // 3. Start background task
    // 4. Reduce timer frequency
  }

  async handleAppForeground(): Promise<void> {
    // 1. Calculate background time
    // 2. Update execution state
    // 3. Synchronize timers
    // 4. Resume normal timer frequency
    // 5. End background task
  }

  async recoverFromCrash(): Promise<void> {
    // 1. Load saved execution state
    // 2. Validate state integrity
    // 3. Calculate missed time
    // 4. Resume execution if needed
    // 5. Emit recovery event
  }

  // Event system for UI updates
  onExecutionUpdate(callback: (state: ExecutionState) => void): void {
    this.eventEmitter.on('execution_update', callback);
  }

  offExecutionUpdate(callback: (state: ExecutionState) => void): void {
    this.eventEmitter.off('execution_update', callback);
  }

  private emitExecutionUpdate(): void {
    this.eventEmitter.emit('execution_update', this.currentExecution);
  }
}
```

#### Background Task Management
```typescript
// iOS Background App Refresh and Android background processing
export class BackgroundTaskManager {
  private backgroundTaskId: number | null = null;
  private foregroundServiceId: string | null = null;

  async startBackgroundTask(): Promise<void> {
    if (Platform.OS === 'ios') {
      this.backgroundTaskId = await BackgroundTask.start({
        taskName: 'loop-execution',
        taskFn: () => this.handleBackgroundExecution()
      });
    } else if (Platform.OS === 'android') {
      // Future: Start foreground service for Android
      this.foregroundServiceId = await ForegroundService.start({
        taskName: 'loop-execution',
        notification: {
          title: 'Loop Running',
          body: 'Your loop is still running in the background'
        }
      });
    }
  }

  async endBackgroundTask(): Promise<void> {
    if (this.backgroundTaskId) {
      await BackgroundTask.finish(this.backgroundTaskId);
      this.backgroundTaskId = null;
    }
    
    if (this.foregroundServiceId) {
      await ForegroundService.stop(this.foregroundServiceId);
      this.foregroundServiceId = null;
    }
  }

  private async handleBackgroundExecution(): Promise<void> {
    // Minimal background processing
    // 1. Update timer state
    // 2. Save to storage
    // 3. Check for completion
    // 4. Schedule next update
  }
}
```

#### State Persistence Strategy
```typescript
// Multi-layer persistence for reliability
export class ExecutionStorage {
  // Immediate state persistence (AsyncStorage)
  async saveExecutionState(state: ExecutionState): Promise<void> {
    await AsyncStorage.setItem('loop_execution_state', JSON.stringify({
      ...state,
      lastSavedAt: Date.now()
    }));
  }

  // Durable state persistence (SQLite)
  async saveExecutionToDatabase(state: ExecutionState): Promise<void> {
    await executeSql(
      'INSERT OR REPLACE INTO execution_states (id, loopId, state, updatedAt) VALUES (?, ?, ?, ?)',
      [state.id, state.loopId, JSON.stringify(state), new Date().toISOString()]
    );
  }

  // Background state tracking
  async saveBackgroundState(backgroundData: BackgroundState): Promise<void> {
    await AsyncStorage.setItem('loop_background_state', JSON.stringify({
      ...backgroundData,
      backgroundStartTime: Date.now()
    }));
  }

  // State recovery and validation
  async loadExecutionState(): Promise<ExecutionState | null> {
    try {
      // Try AsyncStorage first (fastest)
      const asyncData = await AsyncStorage.getItem('loop_execution_state');
      if (asyncData) {
        const state = JSON.parse(asyncData);
        if (await this.validateExecutionState(state)) {
          return state;
        }
      }

      // Fallback to database
      const dbData = await this.loadExecutionFromDatabase();
      if (dbData && await this.validateExecutionState(dbData)) {
        return dbData;
      }

      return null;
    } catch (error) {
      console.error('Failed to load execution state:', error);
      return null;
    }
  }

  private async validateExecutionState(state: ExecutionState): Promise<boolean> {
    // Validate state structure and data integrity
    return (
      state &&
      typeof state.id === 'string' &&
      typeof state.loopId === 'string' &&
      typeof state.currentActivityIndex === 'number' &&
      state.startedAt &&
      Array.isArray(state.activities)
    );
  }
}
```

### Performance Considerations
1. **Timer Frequency**: Reduce timer frequency in background (1s → 10s)
2. **State Persistence**: Batch state saves to reduce I/O
3. **Memory Management**: Clean up event listeners and timers
4. **Battery Optimization**: Minimal background processing

### Future Notification Support
The architecture is designed to easily support notification controls:
```typescript
// Future notification integration
export class NotificationManager {
  async showExecutionNotification(execution: ExecutionState): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Loop Running',
        body: `${execution.currentActivity.title} - ${execution.progress}%`,
        data: { executionId: execution.id }
      },
      trigger: null, // Show immediately
    });
  }

  async updateExecutionNotification(execution: ExecutionState): Promise<void> {
    // Update existing notification with current progress
  }

  async clearExecutionNotification(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }
}
```

### Phase 4: Integration and Testing (Days 13-15)
**Status**: Not started
**Goal**: Integrate all features and test the complete system

#### Tasks:
1. **Feature Integration (Day 13)**
   - [ ] Update navigation to include all features
   - [ ] Integrate all Redux stores into centralized store
   - [ ] Test cross-feature functionality
   - [ ] Ensure shared components work across all features

2. **Background Execution Testing (Day 14)**
   - [ ] Test loop execution across app navigation
   - [ ] Test loop execution during app backgrounding
   - [ ] Test loop execution recovery after app closure
   - [ ] Test timer accuracy and persistence

3. **Final Testing and Optimization (Day 15)**
   - [ ] Performance testing across all features
   - [ ] Memory leak testing
   - [ ] Error handling testing
   - [ ] Theme consistency validation
   - [ ] Shared component usage validation

#### Success Criteria:
- [ ] All features work correctly in new structure
- [ ] Background execution works reliably for loops
- [ ] No performance regressions
- [ ] All components use theme system
- [ ] Shared components reduce code duplication

---

## Quality Assurance Checklist

### Code Quality
- [ ] All files follow TypeScript best practices
- [ ] All functions have proper error handling
- [ ] All components are properly memoized
- [ ] All hooks follow React best practices
- [ ] All async operations are properly handled
- [ ] **NO hardcoded colors - ALL use theme system**
- [ ] **Shared components are used where appropriate**

### Architecture Quality
- [ ] Feature folders are easy to navigate
- [ ] Shared components eliminate duplication
- [ ] Background execution is reliable (loops only)
- [ ] State management follows Redux best practices
- [ ] **ALL entry types follow same simple patterns**

### Performance Quality
- [ ] Components render efficiently
- [ ] State selectors are memoized
- [ ] Background tasks use minimal resources (loops only)
- [ ] Memory leaks are prevented
- [ ] Bundle size is optimized
- [ ] **Shared components reduce code duplication**

### User Experience Quality
- [ ] Background execution is clearly indicated (loops only)
- [ ] Loading states are handled gracefully
- [ ] Error states provide helpful feedback
- [ ] Navigation flows are intuitive
- [ ] Accessibility is properly implemented
- [ ] **Theme consistency across ALL features**

### Reliability Quality
- [ ] Background execution works across all scenarios (loops only)
- [ ] State recovery works after app restart (loops only)
- [ ] Error recovery is graceful
- [ ] Edge cases are handled properly
- [ ] **ALL entry types work consistently**

---

## Success Metrics

### Technical Metrics
- **Code Reduction**: Reduce overall codebase complexity by 40%
- **Performance**: 50% faster rendering across all entry types
- [ ] Memory: 30% reduction in memory usage
- [ ] Bundle Size: No increase in overall app bundle size despite new features
- [ ] Shared Components: 80% reduction in duplicate component code
- [ ] Theme Compliance: 100% of components use theme system (zero hardcoded colors)

### User Experience Metrics
- [ ] Background Execution: 99.9% reliability across app lifecycle (loops only)
- [ ] UI Responsiveness: <100ms response time for all interactions
- [ ] Error Rate: <0.1% error rate in production
- [ ] Theme Consistency: 100% visual consistency across all features

### Development Metrics
- [ ] Maintainability: 80% reduction in time to implement new features
- [ ] Testability: 100% unit test coverage for background services
- [ ] Debuggability: 90% reduction in time to debug issues
- [ ] Onboarding: New developers productive with any entry type in <1 day
- [ ] Cross-Feature Development: Easy to add features that work across entry types

---

## Risk Mitigation

### Technical Risks
1. **Background Execution Complexity (Loops Only)**
   - [ ] Risk: Background execution may not work reliably
   - [ ] Mitigation: Extensive testing across all app states, fallback mechanisms

2. **State Synchronization Issues**
   - [ ] Risk: UI state may get out of sync across features
   - [ ] Mitigation: Event-driven architecture, state validation, recovery mechanisms

3. **Performance Degradation**
   - [ ] Risk: Restructuring may impact app performance
   - [ ] Mitigation: Performance monitoring, optimization, shared component efficiency

4. **Theme Migration Issues**
   - [ ] Risk: Converting hardcoded colors may introduce visual bugs
   - [ ] Mitigation: Systematic color audit, visual regression testing, gradual migration

### Business Risks
1. **Development Timeline**
   - [ ] Risk: Restructuring all entry types may take longer than planned
   - [ ] Mitigation: Incremental delivery, parallel development, regular checkpoints

2. **Feature Regression**
   - [ ] Risk: Moving code may break existing functionality
   - [ ] Mitigation: Comprehensive testing, gradual migration, rollback plans

3. **User Experience Disruption**
   - [ ] Risk: Users may notice changes in familiar interfaces
   - [ ] Mitigation: Maintain UI consistency, improve UX during restructuring

---

## Implementation Status Tracking

### Phase 1: Foundation Setup (Days 1-3)
- [ ] **Day 1**: Move shared components and enhance with theme usage
- [ ] **Day 2**: Move app-level concerns (navigation, theme, contexts, store)
- [ ] **Day 3**: Update imports and test functionality

### Phase 2: Move All Entry Types (Days 4-6)
- [ ] **Day 4**: Move Actions and Notes features
- [ ] **Day 5**: Move Paths and Sagas features
- [ ] **Day 6**: Move Sparks feature and enhance all with shared components

### Phase 3: Create New Loop Implementation (Days 7-12)
- [ ] **Day 7**: Create loop screens
- [ ] **Day 8**: Create loop components (part 1)
- [ ] **Day 9**: Create loop components (part 2)
- [ ] **Day 10**: Create background services (part 1)
- [ ] **Day 11**: Create background services (part 2) and hooks
- [ ] **Day 12**: Create loop state management

### Phase 4: Integration and Testing (Days 13-15)
- [ ] **Day 13**: Feature integration and navigation setup
- [ ] **Day 14**: Background execution testing
- [ ] **Day 15**: Final testing and optimization

---

## Next Steps

1. **Review and Approve Plan**: Ensure all requirements are covered for all entry types
2. **Set Up Development Environment**: Prepare for comprehensive restructuring
3. **Begin Phase 1**: Start with foundation setup for all features
4. **Regular Check-ins**: Daily progress reviews across all entry types
5. **Testing at Each Phase**: Validate functionality incrementally
6. **Theme Compliance**: Ensure ALL components use theme system
7. **Shared Component Usage**: Maximize reuse across features
8. **Documentation**: Maintain implementation documentation
9. **Performance Monitoring**: Track performance improvements

This simplified plan provides a comprehensive roadmap for restructuring the entire codebase with easy-to-understand architecture, implementing robust background execution for loops, ensuring complete theme consistency, and maximizing code reuse through shared components. The new architecture will be much easier to navigate and understand while maintaining all the power and flexibility needed for future development.

**Key Success Factors:**
- **Simple Structure**: Easy to find what you need
- **NO hardcoded colors** - everything uses theme system
- **Maximum shared component usage** - reduce duplicate code
- **Background execution** - robust loop execution capabilities
- **Consistent patterns** - all entry types follow same simple structure
</rewritten_file> 