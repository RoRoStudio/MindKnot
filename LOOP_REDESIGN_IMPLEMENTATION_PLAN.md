# Complete Codebase Restructure: Feature-Based Clean Architecture

## Project Overview

**Objective**: Complete restructure of the entire codebase using feature-based clean architecture, with special focus on implementing a robust Loop entry type with background execution capabilities.

**Current Status**: Planning phase - no implementation started
**Target Architecture**: Feature-based clean architecture with domain-driven design for ALL entry types
**Key Requirement**: Background execution for loops that persists across app navigation, backgrounding, and closure
**Migration Status**: No migration needed - app is in initial development phase
**Theme Requirement**: ALL components must use theme colors - NO hardcoded colors allowed
**Shared Components**: Maximize reuse through shared component library

---

## Architecture Philosophy

### Core Principles
1. **Feature-Based Organization**: Each entry type lives in its own `features/` folder
2. **Clean Architecture**: Clear separation between domain, data, and presentation layers
3. **Background Execution**: Persistent execution state with recovery mechanisms (loops only)
4. **Single Responsibility**: Each file has one clear purpose
5. **Dependency Inversion**: Domain layer independent of external concerns
6. **Shared Components**: Reuse components across entry types via `shared/` folder
7. **Theme Consistency**: NEVER hardcode colors - ALWAYS use theme settings
8. **Code Reuse**: Eliminate duplicate code through shared utilities and components

### Layer Responsibilities
- **Domain Layer**: Business logic, entities, and rules (what each entry type does)
- **Data Layer**: Data access, repositories, and external APIs (how to save/load)
- **Presentation Layer**: UI components, screens, and user interactions (what users see)
- **State Layer**: Redux state management and selectors
- **Shared Layer**: Reusable components, hooks, services, and utilities across all features

---

## Current Codebase Analysis

### Files to be MOVED to new structure:

#### Shared Infrastructure (MOVE + ENHANCE)
```
# Components to move to shared/
src/components/common/                  → src/shared/components/ui/ (MOVE + ENHANCE)
src/components/form/                    → src/shared/components/form/ (MOVE + ENHANCE)
src/components/navigation/              → src/shared/components/navigation/ (MOVE)
src/components/shared/                  → src/shared/components/ui/ (MOVE + MERGE)
src/components/templates/               → src/shared/components/layout/ (MOVE + ENHANCE)

# Entry-shared components
src/components/entries/EntryCard.tsx           → src/shared/components/entries/ (MOVE)
src/components/entries/EntryDetailHeader.tsx   → src/shared/components/entries/ (MOVE)
src/components/entries/EntryMetadataBar.tsx    → src/shared/components/entries/ (MOVE)
src/components/entries/EntryTitleInput.tsx     → src/shared/components/entries/ (MOVE)

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
src/api/categoryService.ts              → src/shared/services/api/ (MOVE)
src/api/database.ts                     → src/shared/services/database/ (MOVE)
src/api/schema.ts                       → src/shared/services/database/ (MOVE)

# Shared types
src/types/baseEntry.ts                  → src/shared/types/ (MOVE)
src/types/category.ts                   → src/shared/types/ (MOVE)
src/types/navigation-types.ts           → src/shared/types/ (MOVE)
```

#### Entry-Specific Files (MOVE to features/)
```
# Actions feature
src/components/entries/actions/         → src/features/actions/presentation/components/ (MOVE)
src/screens/actions/                    → src/features/actions/presentation/screens/ (MOVE)
src/store/actions/                      → src/features/actions/state/ (MOVE)
src/api/actionService.ts                → src/features/actions/data/api/ (MOVE + ENHANCE)
src/hooks/useActions.ts                 → src/features/actions/presentation/hooks/ (MOVE)
src/types/action.ts                     → src/features/actions/types/ (MOVE)

# Notes feature
src/components/entries/notes/           → src/features/notes/presentation/components/ (MOVE)
src/screens/notes/                      → src/features/notes/presentation/screens/ (MOVE)
src/store/notes/                        → src/features/notes/state/ (MOVE)
src/api/noteService.ts                  → src/features/notes/data/api/ (MOVE + ENHANCE)
src/hooks/useNotes.ts                   → src/features/notes/presentation/hooks/ (MOVE)
src/types/note.ts                       → src/features/notes/types/ (MOVE)

# Paths feature
src/components/entries/paths/           → src/features/paths/presentation/components/ (MOVE)
src/screens/paths/                      → src/features/paths/presentation/screens/ (MOVE)
src/store/paths/                        → src/features/paths/state/ (MOVE)
src/api/pathService.ts                  → src/features/paths/data/api/ (MOVE + ENHANCE)
src/hooks/usePaths.ts                   → src/features/paths/presentation/hooks/ (MOVE)
src/types/path.ts                       → src/features/paths/types/ (MOVE)

# Sagas feature
src/components/entries/sagas/           → src/features/sagas/presentation/components/ (MOVE)
src/screens/sagas/                      → src/features/sagas/presentation/screens/ (MOVE)
src/store/sagas/                        → src/features/sagas/state/ (MOVE)
src/api/sagaService.ts                  → src/features/sagas/data/api/ (MOVE + ENHANCE)
src/hooks/useSagas.ts                   → src/features/sagas/presentation/hooks/ (MOVE)
src/types/saga.ts                       → src/features/sagas/types/ (MOVE)

# Sparks feature
src/components/entries/sparks/          → src/features/sparks/presentation/components/ (MOVE)
src/screens/sparks/                     → src/features/sparks/presentation/screens/ (MOVE)
src/store/sparks/                       → src/features/sparks/state/ (MOVE)
src/api/sparkService.ts                 → src/features/sparks/data/api/ (MOVE + ENHANCE)
src/hooks/useSparks.ts                  → src/features/sparks/presentation/hooks/ (MOVE)
src/types/spark.ts                      → src/features/sparks/types/ (MOVE)

# Cross-feature screens
src/screens/vault/                      → src/shared/screens/vault/ (MOVE)
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

# Shared infrastructure enhancements
src/shared/services/background/         → NEW: Background task management
src/shared/services/storage/            → NEW: Storage abstractions
src/app/store/                          → NEW: Centralized store setup

# Domain layers for all entry types
src/features/*/domain/                  → NEW: Business logic layer for all features
src/features/*/data/repositories/       → NEW: Data access layer for all features
src/features/*/data/storage/            → NEW: Storage implementations where needed
```

---

## Target Architecture Structure

### Complete Folder Structure
```
src/
├── shared/                            # Truly shared utilities and components
│   ├── components/
│   │   ├── ui/                        # Basic reusable UI components
│   │   │   ├── Button.tsx             # MOVED + ENHANCED from components/shared/Button.tsx
│   │   │   ├── Card.tsx               # MOVED + ENHANCED from components/shared/Card.tsx
│   │   │   ├── Input.tsx              # MOVED + ENHANCED from components/form/FormInput.tsx
│   │   │   ├── Modal.tsx              # MOVED + ENHANCED from components/shared/ConfirmationModal.tsx
│   │   │   ├── Typography.tsx         # MOVED from components/shared/Typography.tsx
│   │   │   ├── Icon.tsx               # MOVED from components/shared/Icon.tsx
│   │   │   ├── BottomSheet.tsx        # MOVED from components/shared/BottomSheet.tsx
│   │   │   ├── Timer.tsx              # MOVED from components/shared/BeautifulTimer.tsx
│   │   │   ├── ColorPicker.tsx        # MOVED from components/shared/ColorPicker.tsx
│   │   │   ├── IconPicker.tsx         # MOVED from components/shared/IconPicker.tsx
│   │   │   ├── ProgressBar.tsx        # NEW: Reusable progress visualization
│   │   │   ├── StatusBadge.tsx        # NEW: Status indicators
│   │   │   └── index.ts               # NEW
│   │   ├── form/                      # Form-specific components
│   │   │   ├── FormInput.tsx          # MOVED from components/form/FormInput.tsx
│   │   │   ├── FormSelect.tsx         # MOVED from components/form/FormSelect.tsx
│   │   │   ├── FormTextarea.tsx       # MOVED from components/form/FormTextarea.tsx
│   │   │   ├── FormCheckbox.tsx       # MOVED from components/form/FormCheckbox.tsx
│   │   │   ├── FormSwitch.tsx         # MOVED from components/form/FormSwitch.tsx
│   │   │   ├── FormTagInput.tsx       # MOVED from components/form/FormTagInput.tsx
│   │   │   ├── FormCategorySelector.tsx # MOVED from components/form/FormCategorySelector.tsx
│   │   │   ├── FormDatePicker.tsx     # MOVED from components/form/FormDatePicker.tsx
│   │   │   ├── FormMoodSelector.tsx   # MOVED from components/form/FormMoodSelector.tsx
│   │   │   ├── FormRadioGroup.tsx     # MOVED from components/form/FormRadioGroup.tsx
│   │   │   ├── FormRichTextarea.tsx   # MOVED from components/form/FormRichTextarea.tsx
│   │   │   └── index.ts               # MOVED from components/form/index.ts
│   │   ├── layout/                    # Layout components
│   │   │   ├── Screen.tsx             # MOVED + ENHANCED from components/templates/BaseEntityScreen.tsx
│   │   │   ├── Section.tsx            # NEW: Content section wrapper
│   │   │   ├── Header.tsx             # NEW: Reusable header component
│   │   │   └── index.ts               # NEW
│   │   ├── navigation/                # Navigation components
│   │   │   ├── TabBar.tsx             # MOVED from components/navigation/CustomBottomNavBar.tsx
│   │   │   ├── DiamondFab.tsx         # MOVED from components/navigation/DiamondFab.tsx
│   │   │   └── index.ts               # NEW
│   │   ├── entries/                   # Shared entry components
│   │   │   ├── EntryCard.tsx          # MOVED from components/entries/EntryCard.tsx
│   │   │   ├── EntryDetailHeader.tsx  # MOVED from components/entries/EntryDetailHeader.tsx
│   │   │   ├── EntryMetadataBar.tsx   # MOVED from components/entries/EntryMetadataBar.tsx
│   │   │   ├── EntryTitleInput.tsx    # MOVED from components/entries/EntryTitleInput.tsx
│   │   │   └── index.ts               # NEW
│   │   ├── lists/                     # Shared list components
│   │   │   ├── FilterableList.tsx     # MOVED from components/shared/FilterableList.tsx
│   │   │   ├── FilterableListHeader.tsx # MOVED from components/shared/FilterableListHeader.tsx
│   │   │   ├── CategoryPill.tsx       # MOVED from components/shared/CategoryPill.tsx
│   │   │   ├── Label.tsx              # MOVED from components/shared/Label.tsx
│   │   │   ├── LabelRow.tsx           # MOVED from components/shared/LabelRow.tsx
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── screens/                       # Cross-feature screens
│   │   ├── vault/                     # Vault screens (cross-feature)
│   │   │   ├── BaseVaultScreen.tsx    # MOVED from screens/vault/BaseVaultScreen.tsx
│   │   │   ├── VaultScreen.tsx        # MOVED from screens/vault/VaultScreen.tsx
│   │   │   ├── VaultEmptyState.tsx    # MOVED from screens/vault/VaultEmptyState.tsx
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── hooks/
│   │   ├── useAsyncStorage.ts         # NEW: Generic storage operations
│   │   ├── useDatabase.ts             # NEW: Generic database operations
│   │   ├── useTheme.ts                # MOVED from contexts/ThemeContext.tsx (hook part)
│   │   ├── useStyles.ts               # MOVED from hooks/useStyles.ts
│   │   ├── useThemedStyles.ts         # MOVED from hooks/useThemedStyles.ts
│   │   ├── useBackgroundTimer.ts      # MOVED from hooks/useBackgroundTimer.ts
│   │   ├── useCategories.ts           # MOVED from hooks/useCategories.ts
│   │   └── index.ts                   # NEW
│   ├── services/
│   │   ├── database/                  # Database utilities
│   │   │   ├── Database.ts            # MOVED + ENHANCED from api/database.ts
│   │   │   ├── migrations.ts          # NEW: Database migration utilities
│   │   │   ├── schema.ts              # MOVED from api/schema.ts
│   │   │   └── index.ts               # NEW
│   │   ├── storage/                   # Storage utilities
│   │   │   ├── AsyncStorage.ts        # NEW: AsyncStorage wrapper
│   │   │   ├── SecureStorage.ts       # NEW: Secure storage wrapper
│   │   │   └── index.ts               # NEW
│   │   ├── background/                # Background task utilities
│   │   │   ├── BackgroundTasks.ts     # NEW: iOS/Android background processing
│   │   │   ├── AppStateManager.ts     # NEW: App lifecycle management
│   │   │   ├── NotificationManager.ts # NEW: Future notification support
│   │   │   └── index.ts               # NEW
│   │   ├── api/                       # Shared API services
│   │   │   ├── categoryService.ts     # MOVED from api/categoryService.ts
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── types/
│   │   ├── common.ts                  # NEW: Shared type definitions
│   │   ├── navigation.ts              # MOVED from types/navigation-types.ts
│   │   ├── database.ts                # NEW: Database-related types
│   │   ├── storage.ts                 # NEW: Storage-related types
│   │   ├── baseEntry.ts               # MOVED from types/baseEntry.ts
│   │   ├── category.ts                # MOVED from types/category.ts
│   │   └── index.ts                   # NEW
│   ├── utils/
│   │   ├── dateUtils.ts               # MOVED from utils/dateUtils.ts
│   │   ├── uuid.ts                    # MOVED + MERGED from utils/uuid.ts + utils/uuidUtil.ts
│   │   ├── themeUtils.ts              # MOVED from utils/themeUtils.ts
│   │   ├── validation.ts              # NEW: Input validation utilities
│   │   ├── databaseReset.ts           # MOVED from utils/databaseReset.ts
│   │   └── index.ts                   # NEW
│   ├── constants/
│   │   ├── entryTypes.ts              # MOVED from constants/entryTypes.ts
│   │   └── index.ts                   # NEW
│   └── index.ts                       # NEW

├── features/
│   ├── actions/                       # Actions feature
│   │   ├── domain/                    # NEW: Business logic layer
│   │   │   ├── entities/
│   │   │   │   ├── Action.ts          # NEW: Action entity with business rules
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── services/
│   │   │   │   ├── ActionService.ts   # NEW: Action business rules
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── repositories/
│   │   │   │   ├── IActionRepository.ts # NEW: Action data access contract
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── data/                      # NEW: Data access layer
│   │   │   ├── repositories/
│   │   │   │   ├── ActionRepository.ts # NEW: SQLite action operations
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── api/
│   │   │   │   ├── actionApi.ts       # MOVED + ENHANCED from api/actionService.ts
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── presentation/              # UI layer
│   │   │   ├── screens/
│   │   │   │   ├── ActionScreen.tsx   # MOVED from screens/actions/ActionScreen.tsx
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── components/
│   │   │   │   ├── ActionCard.tsx     # MOVED from components/entries/actions/ActionCard.tsx
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── hooks/
│   │   │   │   ├── useActions.ts      # MOVED from hooks/useActions.ts
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── state/                     # State management layer
│   │   │   ├── actionSlice.ts         # MOVED from store/actions/actionSlice.ts
│   │   │   ├── actionSelectors.ts     # MOVED from store/actions/actionSelectors.ts
│   │   │   ├── useActionActions.ts    # MOVED from store/actions/useActionActions.ts
│   │   │   └── index.ts               # NEW
│   │   ├── types/
│   │   │   ├── Action.ts              # MOVED from types/action.ts
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW
│   ├── loops/                         # COMPLETE NEW IMPLEMENTATION
│   │   ├── domain/                    # NEW: Business logic layer
│   │   │   ├── entities/
│   │   │   │   ├── Loop.ts            # NEW: Loop entity with business rules
│   │   │   │   ├── Activity.ts        # NEW: Activity entity with validation
│   │   │   │   ├── Template.ts        # NEW: Template entity with reuse logic
│   │   │   │   ├── Execution.ts       # NEW: Execution state entity
│   │   │   │   ├── Timer.ts           # NEW: Timer entity with background support
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── services/
│   │   │   │   ├── LoopService.ts     # NEW: Loop business rules and validation
│   │   │   │   ├── ExecutionEngine.ts # NEW: Background execution engine
│   │   │   │   ├── TimerService.ts    # NEW: Background-persistent timer service
│   │   │   │   ├── TemplateService.ts # NEW: Template management service
│   │   │   │   ├── RecoveryService.ts # NEW: App restart recovery service
│   │   │   │   ├── BackgroundService.ts # NEW: Background task coordination
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── events/
│   │   │   │   ├── LoopEvents.ts      # NEW: Loop lifecycle events
│   │   │   │   ├── ExecutionEvents.ts # NEW: Execution state events
│   │   │   │   ├── TimerEvents.ts     # NEW: Timer events
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── repositories/
│   │   │   │   ├── ILoopRepository.ts # NEW: Loop data access contract
│   │   │   │   ├── IActivityRepository.ts # NEW: Activity data access contract
│   │   │   │   ├── ITemplateRepository.ts # NEW: Template data access contract
│   │   │   │   ├── IExecutionRepository.ts # NEW: Execution data access contract
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── data/                      # NEW: Data access layer
│   │   │   ├── repositories/
│   │   │   │   ├── LoopRepository.ts  # NEW: SQLite loop operations
│   │   │   │   ├── ActivityRepository.ts # NEW: SQLite activity operations
│   │   │   │   ├── TemplateRepository.ts # NEW: SQLite template operations
│   │   │   │   ├── ExecutionRepository.ts # NEW: Execution state persistence
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── storage/
│   │   │   │   ├── LoopStorage.ts     # NEW: AsyncStorage for loops
│   │   │   │   ├── ExecutionStorage.ts # NEW: Persistent execution state
│   │   │   │   ├── BackgroundStorage.ts # NEW: Background state management
│   │   │   │   ├── CacheStorage.ts    # NEW: Performance caching
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── api/
│   │   │   │   ├── loopApi.ts         # NEW: External loop API calls (if needed)
│   │   │   │   ├── templateApi.ts     # NEW: Template sharing API (future)
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── database/
│   │   │   │   ├── schemas/
│   │   │   │   │   ├── loopSchema.ts  # NEW: Loop table schema
│   │   │   │   │   ├── activitySchema.ts # NEW: Activity table schema
│   │   │   │   │   ├── templateSchema.ts # NEW: Template table schema
│   │   │   │   │   ├── executionSchema.ts # NEW: Execution table schema
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 001_create_loops.ts # NEW: Initial loop tables
│   │   │   │   │   ├── 002_create_activities.ts # NEW: Activity tables
│   │   │   │   │   ├── 003_create_templates.ts # NEW: Template tables
│   │   │   │   │   ├── 004_create_execution.ts # NEW: Execution tables
│   │   │   │   │   ├── 005_add_background_support.ts # NEW: Background execution support
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── presentation/              # NEW: UI layer
│   │   │   ├── screens/
│   │   │   │   ├── LoopListScreen.tsx # NEW: List and manage loops
│   │   │   │   ├── LoopDetailScreen.tsx # NEW: View loop details
│   │   │   │   ├── LoopBuilderScreen.tsx # NEW: Create and edit loops
│   │   │   │   ├── ExecutionScreen.tsx # NEW: Execute loops with background support
│   │   │   │   ├── TemplateLibraryScreen.tsx # NEW: Manage activity templates
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── components/
│   │   │   │   ├── cards/
│   │   │   │   │   ├── LoopCard.tsx   # NEW: Loop display card (uses shared EntryCard)
│   │   │   │   │   ├── ActivityCard.tsx # NEW: Activity display card
│   │   │   │   │   ├── TemplateCard.tsx # NEW: Template display card
│   │   │   │   │   ├── ExecutionCard.tsx # NEW: Execution status card
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   ├── builders/
│   │   │   │   │   ├── LoopBuilder.tsx # NEW: Drag & drop loop builder
│   │   │   │   │   ├── ActivityBuilder.tsx # NEW: Activity configuration
│   │   │   │   │   ├── TemplateSelector.tsx # NEW: Template selection
│   │   │   │   │   ├── QuickActions.tsx # NEW: Quick loop actions
│   │   │   │   │   ├── DragDropList.tsx # NEW: Reorderable activity list
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   ├── execution/
│   │   │   │   │   ├── ExecutionController.tsx # NEW: Execution controls
│   │   │   │   │   ├── ActivityRunner.tsx # NEW: Current activity display
│   │   │   │   │   ├── ProgressTracker.tsx # NEW: Progress visualization (uses shared ProgressBar)
│   │   │   │   │   ├── TimerDisplay.tsx # NEW: Background-aware timer (uses shared Timer)
│   │   │   │   │   ├── BackgroundIndicator.tsx # NEW: Background execution status
│   │   │   │   │   ├── ExecutionHistory.tsx # NEW: Execution history display
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   ├── forms/
│   │   │   │   │   ├── LoopForm.tsx   # NEW: Loop creation/edit form (uses shared form components)
│   │   │   │   │   ├── ActivityForm.tsx # NEW: Activity configuration form
│   │   │   │   │   ├── TemplateForm.tsx # NEW: Template creation form
│   │   │   │   │   ├── ExecutionSettings.tsx # NEW: Execution preferences
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   ├── shared/
│   │   │   │   │   ├── LoopIcon.tsx   # NEW: Loop iconography (uses shared Icon)
│   │   │   │   │   ├── ActivityIcon.tsx # NEW: Activity iconography
│   │   │   │   │   └── index.ts       # NEW
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── hooks/
│   │   │   │   ├── useLoops.ts        # NEW: Loop CRUD operations
│   │   │   │   ├── useLoopExecution.ts # NEW: Execution management
│   │   │   │   ├── useActivityTemplates.ts # NEW: Template operations
│   │   │   │   ├── useBackgroundExecution.ts # NEW: Background execution hooks
│   │   │   │   ├── useLoopTimer.ts    # NEW: Timer management hooks
│   │   │   │   ├── useLoopBuilder.ts  # NEW: Loop builder state
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── navigation/
│   │   │   │   ├── LoopNavigator.tsx  # NEW: Loop stack navigator
│   │   │   │   ├── ExecutionNavigator.tsx # NEW: Execution flow navigator
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── styles/
│   │   │   │   ├── loopStyles.ts      # NEW: Loop component styles (THEME-BASED ONLY)
│   │   │   │   ├── executionStyles.ts # NEW: Execution component styles (THEME-BASED ONLY)
│   │   │   │   ├── builderStyles.ts   # NEW: Builder component styles (THEME-BASED ONLY)
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── state/                     # NEW: State management layer
│   │   │   ├── slices/
│   │   │   │   ├── loopSlice.ts       # NEW: Loop data state
│   │   │   │   ├── executionSlice.ts  # NEW: Execution state
│   │   │   │   ├── templateSlice.ts   # NEW: Template state
│   │   │   │   ├── builderSlice.ts    # NEW: Loop builder state
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── selectors/
│   │   │   │   ├── loopSelectors.ts   # NEW: Loop data selectors
│   │   │   │   ├── executionSelectors.ts # NEW: Execution selectors
│   │   │   │   ├── templateSelectors.ts # NEW: Template selectors
│   │   │   │   ├── builderSelectors.ts # NEW: Builder selectors
│   │   │   │   └── index.ts           # NEW
│   │   │   ├── middleware/
│   │   │   │   ├── executionMiddleware.ts # NEW: Background execution middleware
│   │   │   │   ├── persistenceMiddleware.ts # NEW: State persistence middleware
│   │   │   │   └── index.ts           # NEW
│   │   │   └── index.ts               # NEW
│   │   ├── types/
│   │   │   ├── Loop.ts                # NEW: Loop type definitions
│   │   │   ├── Activity.ts            # NEW: Activity type definitions
│   │   │   ├── Template.ts            # NEW: Template type definitions
│   │   │   ├── Execution.ts           # NEW: Execution type definitions
│   │   │   ├── Builder.ts             # NEW: Builder type definitions
│   │   │   ├── Events.ts              # NEW: Event type definitions
│   │   │   └── index.ts               # NEW
│   │   ├── utils/
│   │   │   ├── loopValidation.ts      # NEW: Loop validation utilities
│   │   │   ├── executionUtils.ts      # NEW: Execution helper functions
│   │   │   ├── templateUtils.ts       # NEW: Template helper functions
│   │   │   ├── timerUtils.ts          # NEW: Timer utility functions
│   │   │   └── index.ts               # NEW
│   │   ├── constants/
│   │   │   ├── loopConstants.ts       # NEW: Loop-related constants
│   │   │   ├── executionConstants.ts  # NEW: Execution constants
│   │   │   ├── templateConstants.ts   # NEW: Template constants
│   │   │   └── index.ts               # NEW
│   │   └── index.ts                   # NEW: Main feature export
│   ├── notes/                         # Notes feature (similar structure to actions)
│   │   ├── domain/                    # NEW: Business logic layer
│   │   ├── data/                      # NEW: Data access layer
│   │   ├── presentation/              # UI layer (MOVED + ENHANCED)
│   │   ├── state/                     # State management (MOVED)
│   │   ├── types/                     # Types (MOVED)
│   │   └── index.ts                   # NEW
│   ├── paths/                         # Paths feature (similar structure)
│   │   ├── domain/                    # NEW: Business logic layer
│   │   ├── data/                      # NEW: Data access layer
│   │   ├── presentation/              # UI layer (MOVED + ENHANCED)
│   │   ├── state/                     # State management (MOVED)
│   │   ├── types/                     # Types (MOVED)
│   │   └── index.ts                   # NEW
│   ├── sagas/                         # Sagas feature (similar structure)
│   │   ├── domain/                    # NEW: Business logic layer
│   │   ├── data/                      # NEW: Data access layer
│   │   ├── presentation/              # UI layer (MOVED + ENHANCED)
│   │   ├── state/                     # State management (MOVED)
│   │   ├── types/                     # Types (MOVED)
│   │   └── index.ts                   # NEW
│   └── sparks/                        # Sparks feature (similar structure)
│       ├── domain/                    # NEW: Business logic layer
│       ├── data/                      # NEW: Data access layer
│       ├── presentation/              # UI layer (MOVED + ENHANCED)
│       ├── state/                     # State management (MOVED)
│       ├── types/                     # Types (MOVED)
│       └── index.ts                   # NEW
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

### Phase 1: Foundation Setup (Days 1-4)
**Status**: Not started
**Goal**: Create shared infrastructure and app-level structure for ALL entry types

#### Tasks:
1. **Create shared folder structure**
   - [ ] Create `src/shared/` directory
   - [ ] **MOVE** common components to `src/shared/components/` and **ENHANCE** with theme usage
   - [ ] **MOVE** common hooks to `src/shared/hooks/`
   - [ ] **MOVE** common services to `src/shared/services/`
   - [ ] **MOVE** common types to `src/shared/types/`
   - [ ] **MOVE** common utils to `src/shared/utils/`
   - [ ] **MOVE** constants to `src/shared/constants/`

2. **Create app-level structure**
   - [ ] Create `src/app/` directory
   - [ ] **MOVE** navigation to `src/app/navigation/`
   - [ ] **MOVE** store setup to `src/app/store/`
   - [ ] **MOVE** theme to `src/app/theme/`
   - [ ] **MOVE** contexts to `src/app/contexts/`

3. **Create feature folder structure for ALL entry types**
   - [ ] Create `src/features/actions/` directory structure
   - [ ] Create `src/features/notes/` directory structure
   - [ ] Create `src/features/paths/` directory structure
   - [ ] Create `src/features/sagas/` directory structure
   - [ ] Create `src/features/sparks/` directory structure
   - [ ] Create `src/features/loops/` directory structure (empty for now)

4. **Update imports across codebase**
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

### Phase 2: All Entry Types Domain Layer (Days 5-8)
**Status**: Not started
**Goal**: Implement domain layer for ALL entry types (except loops - that's Phase 3)

#### Tasks:
1. **Actions Domain Layer**
   - [ ] **CREATE** `Action.ts` entity with business rules
   - [ ] **CREATE** `ActionService.ts` with business logic
   - [ ] **CREATE** `IActionRepository.ts` interface

2. **Notes Domain Layer**
   - [ ] **CREATE** `Note.ts` entity with business rules
   - [ ] **CREATE** `NoteService.ts` with business logic
   - [ ] **CREATE** `INoteRepository.ts` interface

3. **Paths Domain Layer**
   - [ ] **CREATE** `Path.ts` entity with business rules
   - [ ] **CREATE** `Chapter.ts` entity
   - [ ] **CREATE** `PathService.ts` with business logic
   - [ ] **CREATE** `IPathRepository.ts` interface

4. **Sagas Domain Layer**
   - [ ] **CREATE** `Saga.ts` entity with business rules
   - [ ] **CREATE** `SagaService.ts` with business logic
   - [ ] **CREATE** `ISagaRepository.ts` interface

5. **Sparks Domain Layer**
   - [ ] **CREATE** `Spark.ts` entity with business rules
   - [ ] **CREATE** `SparkService.ts` with business logic
   - [ ] **CREATE** `ISparkRepository.ts` interface

#### Success Criteria:
- [ ] All entry types have clean domain entities
- [ ] Business rules are properly encapsulated
- [ ] Repository interfaces define clear contracts
- [ ] Domain logic is independent of external concerns

### Phase 3: Loop Domain Layer (Days 9-11)
**Status**: Not started
**Goal**: Implement core business logic and entities for loops (COMPLETE NEW IMPLEMENTATION)

#### Tasks:
1. **Create domain entities**
   - [ ] **CREATE** `Loop.ts` entity with business rules
   - [ ] **CREATE** `Activity.ts` entity with validation
   - [ ] **CREATE** `Template.ts` entity with reuse logic
   - [ ] **CREATE** `Execution.ts` entity with state management
   - [ ] **CREATE** `Timer.ts` entity with background support

2. **Create domain services**
   - [ ] **CREATE** `LoopService.ts` with business rules
   - [ ] **CREATE** `ExecutionEngine.ts` with background execution
   - [ ] **CREATE** `TimerService.ts` with background persistence
   - [ ] **CREATE** `TemplateService.ts` with template management
   - [ ] **CREATE** `RecoveryService.ts` with app restart recovery
   - [ ] **CREATE** `BackgroundService.ts` with background coordination

3. **Create event system**
   - [ ] **CREATE** `LoopEvents.ts` for loop lifecycle events
   - [ ] **CREATE** `ExecutionEvents.ts` for execution state events
   - [ ] **CREATE** `TimerEvents.ts` for timer events

4. **Define repository interfaces**
   - [ ] **CREATE** `ILoopRepository.ts` interface
   - [ ] **CREATE** `IActivityRepository.ts` interface
   - [ ] **CREATE** `ITemplateRepository.ts` interface
   - [ ] **CREATE** `IExecutionRepository.ts` interface

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
- [ ] Domain layer is independent of external concerns
- [ ] Data layer implements repository pattern correctly
- [ ] Presentation layer is decoupled from business logic
- [ ] State management follows Redux best practices
- [ ] Dependencies flow in correct direction (inward)
- [ ] **ALL entry types follow same architectural patterns**

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
- **Memory**: 30% reduction in memory usage
- **Bundle Size**: No increase in overall app bundle size despite new features
- **Shared Components**: 80% reduction in duplicate component code
- **Theme Compliance**: 100% of components use theme system (zero hardcoded colors)

### User Experience Metrics
- **Background Execution**: 99.9% reliability across app lifecycle (loops only)
- **UI Responsiveness**: <100ms response time for all interactions
- **Error Rate**: <0.1% error rate in production
- **Theme Consistency**: 100% visual consistency across all features

### Development Metrics
- **Maintainability**: 80% reduction in time to implement new features
- [ ] Testability**: 100% unit test coverage for domain layers
- [ ] Debuggability**: 90% reduction in time to debug issues
- [ ] Onboarding**: New developers productive with any entry type in <1 day
- [ ] Cross-Feature Development**: Easy to add features that work across entry types

---

## Risk Mitigation

### Technical Risks
1. **Background Execution Complexity (Loops Only)**
   - **Risk**: Background execution may not work reliably
   - **Mitigation**: Extensive testing across all app states, fallback mechanisms

2. **State Synchronization Issues**
   - **Risk**: UI state may get out of sync across features
   - **Mitigation**: Event-driven architecture, state validation, recovery mechanisms

3. **Performance Degradation**
   - **Risk**: Restructuring may impact app performance
   - **Mitigation**: Performance monitoring, optimization, shared component efficiency

4. **Theme Migration Issues**
   - **Risk**: Converting hardcoded colors may introduce visual bugs
   - **Mitigation**: Systematic color audit, visual regression testing, gradual migration

### Business Risks
1. **Development Timeline**
   - **Risk**: Restructuring all entry types may take longer than planned
   - **Mitigation**: Incremental delivery, parallel development, regular checkpoints

2. **Feature Regression**
   - **Risk**: Moving code may break existing functionality
   - **Mitigation**: Comprehensive testing, gradual migration, rollback plans

3. **User Experience Disruption**
   - **Risk**: Users may notice changes in familiar interfaces
   - **Mitigation**: Maintain UI consistency, improve UX during restructuring

---

## Implementation Status Tracking

### Phase 1: Foundation Setup (Days 1-4)
- [ ] **Day 1**: Create shared and app folder structures
- [ ] **Day 2**: Move common components and enhance with theme usage
- [ ] **Day 3**: Move navigation, theme, contexts, and constants
- [ ] **Day 4**: Create feature folder structures and update imports

### Phase 2: All Entry Types Domain Layer (Days 5-8)
- [ ] **Day 5**: Actions and Notes domain layers
- [ ] **Day 6**: Paths and Sagas domain layers
- [ ] **Day 7**: Sparks domain layer
- [ ] **Day 8**: Testing and validation of all domain layers

### Phase 3: Loop Domain Layer (Days 9-11)
- [ ] **Day 9**: Loop entities and basic services
- [ ] **Day 10**: ExecutionEngine and TimerService
- [ ] **Day 11**: Event system and repository interfaces

### Phase 4: Data Layer Implementation (Days 12-15)
- [ ] **Day 12**: Repository implementations for all entry types
- [ ] **Day 13**: Database schemas and migrations
- [ ] **Day 14**: Storage implementations (loops) and API enhancements
- [ ] **Day 15**: Testing and validation of data layer

### Phase 5: State Management Layer (Days 16-18)
- [ ] **Day 16**: Move existing Redux slices to features
- [ ] **Day 17**: Create new loop Redux slices and middleware
- [ ] **Day 18**: Create centralized store and test integration

### Phase 6: Presentation Layer (Days 19-23)
- [ ] **Day 19**: Move existing screens and components to features
- [ ] **Day 20**: Enhance moved components with theme usage and shared components
- [ ] **Day 21**: Create loop presentation layer (screens)
- [ ] **Day 22**: Create loop presentation layer (components and hooks)
- [ ] **Day 23**: Create loop navigation and styles

### Phase 7: Integration and Testing (Days 24-26)
- [ ] **Day 24**: Feature integration and navigation setup
- [ ] **Day 25**: Background execution testing and cross-feature testing
- [ ] **Day 26**: Performance optimization and error handling

### Phase 8: Final Polish (Days 27-28)
- [ ] **Day 27**: Final testing and optimization
- [ ] **Day 28**: Code cleanup and documentation

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

This plan provides a comprehensive roadmap for restructuring the entire codebase with feature-based clean architecture, implementing robust background execution for loops, ensuring complete theme consistency, and maximizing code reuse through shared components. The new architecture will serve as a foundation for future development and make the codebase much easier to understand and maintain across all entry types.

**Key Success Factors:**
- **NO hardcoded colors** - everything uses theme system
- **Maximum shared component usage** - reduce duplicate code
- **Clean architecture** - proper separation of concerns
- **Background execution** - robust loop execution capabilities
- **Consistent patterns** - all entry types follow same structure
</rewritten_file> 