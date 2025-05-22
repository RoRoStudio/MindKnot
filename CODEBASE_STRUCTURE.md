# MindKnot Codebase Structure

This document outlines a recommended structure for the MindKnot codebase that is designed to be intuitive for non-technical team members while following software engineering best practices.

## Current vs. Recommended Structure

The current codebase uses an "atomic design" structure (atoms, molecules, organisms), which can be confusing. The recommended structure below organizes files by feature instead, making it easier to find related code.

## Recommended Project Structure

```
MindKnot/
├── assets/                       # Static assets
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
│
├── src/                          # All source code
│   ├── api/                      # Data access layer (currently in services/)
│   │   ├── database.ts           # From src/database/database.ts
│   │   ├── schema.ts             # From src/database/schema.ts
│   │   ├── actions.ts            # From src/services/actionService.ts
│   │   ├── notes.ts              # From src/services/noteService.ts
│   │   ├── paths.ts              # From src/services/pathService.ts
│   │   ├── loops.ts              # From src/services/loopService.ts
│   │   ├── sparks.ts             # From src/services/sparkService.ts
│   │   ├── categories.ts         # From src/services/categoryService.ts
│   │   └── sagas.ts              # From src/services/sagaService.ts
│   │
│   ├── components/               # UI components organized by feature
│   │   ├── shared/               # Common components used across features
│   │   │   ├── Button.tsx        # From src/components/atoms/Button.tsx
│   │   │   ├── DottedPillButton.tsx # From src/components/atoms/DottedPillButton.tsx
│   │   │   ├── Icon.tsx          # From src/components/atoms/Icon.tsx
│   │   │   ├── Label.tsx         # From src/components/atoms/Label.tsx
│   │   │   ├── Typography.tsx    # From src/components/atoms/Typography.tsx
│   │   │   ├── Card.tsx          # From src/components/molecules/Card.tsx
│   │   │   ├── CategoryPill.tsx  # From src/components/molecules/CategoryPill.tsx
│   │   │   ├── ColorPicker.tsx   # From src/components/molecules/ColorPicker.tsx
│   │   │   ├── BottomSheet.tsx   # From src/components/molecules/BottomSheet.tsx
│   │   │   ├── IconPicker.tsx    # From src/components/molecules/IconPicker.tsx
│   │   │   ├── FilterableList.tsx # From src/components/organisms/FilterableList.tsx
│   │   │   ├── FilterableListHeader.tsx # From src/components/organisms/FilterableListHeader.tsx
│   │   │   ├── ConfirmationModal.tsx # From src/components/common/ConfirmationModal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── form/                 # Form components
│   │   │   ├── Form.tsx          # From src/components/form/Form.tsx
│   │   │   ├── FormArrayField.tsx # From src/components/form/FormArrayField.tsx
│   │   │   ├── FormCategorySelector.tsx # From src/components/form/FormCategorySelector.tsx
│   │   │   ├── FormCheckbox.tsx  # From src/components/form/FormCheckbox.tsx
│   │   │   ├── FormDatePicker.tsx # From src/components/form/FormDatePicker.tsx
│   │   │   ├── FormErrorMessage.tsx # From src/components/form/FormErrorMessage.tsx
│   │   │   ├── FormInput.tsx     # From src/components/form/FormInput.tsx
│   │   │   ├── FormLabelInput.tsx # From src/components/form/FormLabelInput.tsx
│   │   │   ├── FormModal.tsx     # From src/components/form/FormModal.tsx
│   │   │   ├── FormMoodSelector.tsx # From src/components/form/FormMoodSelector.tsx
│   │   │   ├── FormRadioGroup.tsx # From src/components/form/FormRadioGroup.tsx
│   │   │   ├── FormRichTextarea.tsx # From src/components/form/FormRichTextarea.tsx
│   │   │   ├── FormSelect.tsx    # From src/components/form/FormSelect.tsx
│   │   │   ├── FormSheet.tsx     # From src/components/form/FormSheet.tsx
│   │   │   ├── FormSwitch.tsx    # From src/components/form/FormSwitch.tsx
│   │   │   ├── FormTextarea.tsx  # From src/components/form/FormTextarea.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── actions/              # Action-related components
│   │   │   ├── ActionCard.tsx    # From src/components/entries/actions/ActionCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── notes/                # Note-related components
│   │   │   ├── NoteCard.tsx      # From src/components/entries/notes/NoteCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── sparks/               # Spark-related components
│   │   │   ├── SparkCard.tsx     # From src/components/entries/sparks/SparkCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── paths/                # Path-related components
│   │   │   ├── PathCard.tsx      # From src/components/entries/paths/PathCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── loops/                # Loop-related components
│   │   │   ├── LoopCard.tsx      # From src/components/entries/loops/LoopCard.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── sagas/                # Saga-related components
│   │   │   ├── AnimatedBookSaga.tsx # From src/components/sagas/AnimatedBookSaga.tsx
│   │   │   ├── SagaCreationSheet.tsx # From src/components/sagas/SagaCreationSheet.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── navigation/           # Navigation components
│   │   │   ├── CustomBottomNavBar.tsx # From src/components/navigation/CustomBottomNavBar.tsx
│   │   │   ├── DiamondFab.tsx    # From src/components/navigation/DiamondFab.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── entries/              # Shared entry components
│   │       ├── EntryCard.tsx     # From src/components/entries/EntryCard.tsx
│   │       ├── EntryDetailHeader.tsx # From src/components/organisms/EntryDetailHeader.tsx
│   │       ├── EntryMetadataBar.tsx # From src/components/organisms/EntryMetadataBar.tsx
│   │       └── index.ts
│   │
│   ├── screens/                  # Full screens in the app
│   │   ├── home/                 # Home screens
│   │   │   ├── HomeScreen.tsx    # From src/screens/HomeScreen.tsx
│   │   │   └── MomentumScreen.tsx # From src/screens/MomentumScreen.tsx
│   │   │
│   │   ├── actions/              # Action screens
│   │   │   └── ActionScreen.tsx  # From src/screens/ActionScreen.tsx
│   │   │
│   │   ├── notes/                # Note screens
│   │   │   └── NoteScreen.tsx    # From src/screens/NoteScreen.tsx
│   │   │
│   │   ├── sparks/               # Spark screens
│   │   │   └── SparkScreen.tsx   # From src/screens/SparkScreen.tsx
│   │   │
│   │   ├── paths/                # Path screens
│   │   │   └── PathScreen.tsx    # From src/screens/PathScreen.tsx
│   │   │
│   │   ├── loops/                # Loop screens
│   │   │   └── LoopScreen.tsx    # From src/screens/LoopScreen.tsx
│   │   │
│   │   ├── sagas/                # Saga screens
│   │   │   ├── SagaScreen.tsx    # From src/screens/SagaScreen.tsx
│   │   │   └── SagaDetailScreen.tsx # From src/screens/SagaDetailScreen.tsx
│   │   │
│   │   ├── vault/                # Vault screens
│   │   │   ├── VaultScreen.tsx   # From src/screens/VaultScreen.tsx
│   │   │   ├── BaseVaultScreen.tsx # From src/screens/vault/BaseVaultScreen.tsx
│   │   │   ├── VaultActionsScreen.tsx # From src/screens/vault/VaultActionsScreen.tsx
│   │   │   ├── VaultEmptyState.tsx # From src/screens/vault/VaultEmptyState.tsx
│   │   │   ├── VaultLoopsScreen.tsx # From src/screens/vault/VaultLoopsScreen.tsx
│   │   │   ├── VaultNotesScreen.tsx # From src/screens/vault/VaultNotesScreen.tsx
│   │   │   ├── VaultPathsScreen.tsx # From src/screens/vault/VaultPathsScreen.tsx
│   │   │   └── VaultSparksScreen.tsx # From src/screens/vault/VaultSparksScreen.tsx
│   │   │
│   │   ├── detail/               # Detail screens
│   │   │   └── ...               # From src/screens/detail/...
│   │   │
│   │   ├── templates/            # Base screen templates
│   │   │   └── BaseEntityScreen.tsx # From src/components/templates/BaseEntityScreen.tsx
│   │   │
│   │   └── dev/                  # Development/testing screens
│   │       ├── TestScreen.tsx    # From src/screens/TestScreen.tsx
│   │       ├── ThemeInspectorScreen.tsx # From src/screens/ThemeInspectorScreen.tsx
│   │       └── ComponentShowcaseScreen.tsx # From src/screens/ComponentShowcaseScreen.tsx
│   │
│   ├── store/                    # State management (Redux)
│   │   ├── index.ts              # From src/redux/store.ts
│   │   ├── actions/              # Actions state management
│   │   │   ├── slice.ts          # From src/redux/slices/actionSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/actionSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/useActionActions.ts
│   │   │
│   │   ├── notes/                # Notes state management
│   │   │   ├── slice.ts          # From src/redux/slices/noteSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/noteSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/useNoteActions.ts
│   │   │
│   │   ├── sparks/               # Sparks state management
│   │   │   ├── slice.ts          # From src/redux/slices/sparkSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/sparkSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/useSparkActions.ts
│   │   │
│   │   ├── paths/                # Paths state management
│   │   │   ├── slice.ts          # From src/redux/slices/pathSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/pathSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/usePathActions.ts
│   │   │
│   │   ├── loops/                # Loops state management
│   │   │   ├── slice.ts          # From src/redux/slices/loopSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/loopSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/useLoopActions.ts
│   │   │
│   │   ├── sagas/                # Sagas state management
│   │   │   ├── slice.ts          # From src/redux/slices/sagaSlice.ts
│   │   │   ├── selectors.ts      # From src/redux/selectors/sagaSelectors.ts
│   │   │   └── hooks.ts          # From src/redux/hooks/useSagaActions.ts
│   │   │
│   │   └── shared/               # Shared Redux utilities
│   │       └── hooks.ts          # From src/redux/hooks/index.ts
│   │
│   ├── hooks/                    # App-wide custom hooks
│   │   ├── useActions.ts         # From src/hooks/useActions.ts
│   │   ├── useCategories.ts      # From src/hooks/useCategories.ts
│   │   ├── useLoops.ts           # From src/hooks/useLoops.ts
│   │   ├── useNotes.ts           # From src/hooks/useNotes.ts
│   │   ├── usePaths.ts           # From src/hooks/usePaths.ts
│   │   ├── useSagas.ts           # From src/hooks/useSagas.ts
│   │   ├── useSparks.ts          # From src/hooks/useSparks.ts
│   │   ├── useStyles.ts          # From src/hooks/useStyles.ts
│   │   └── useThemedStyles.ts    # From src/hooks/useThemedStyles.ts
│   │
│   ├── navigation/               # Navigation configuration
│   │   ├── AppNavigator.tsx      # From src/navigation/AppNavigator.tsx
│   │   ├── TabNavigator.tsx      # From src/navigation/TabNavigator.tsx
│   │   └── VaultTabNavigator.tsx # From src/navigation/VaultTabNavigator.tsx
│   │
│   ├── contexts/                 # React contexts
│   │   ├── BottomSheetConfig.tsx # From src/contexts/BottomSheetConfig.tsx
│   │   ├── BottomSheetContext.tsx # From src/contexts/BottomSheetContext.tsx
│   │   ├── ThemeContext.tsx      # From src/contexts/ThemeContext.tsx
│   │   └── VaultFiltersContext.tsx # From src/contexts/VaultFiltersContext.tsx
│   │
│   ├── theme/                    # Styling and theming
│   │   ├── light.ts              # From src/theme/light.ts
│   │   ├── dark.ts               # From src/theme/dark.ts
│   │   ├── styleConstants.ts     # From src/theme/styleConstants.ts
│   │   ├── themeTypes.ts         # From src/theme/themeTypes.ts
│   │   ├── themeUtils.ts         # From src/theme/themeUtils.ts
│   │   ├── tokens.ts             # From src/theme/tokens.ts
│   │   └── styles/               # From src/styles/
│   │       ├── colors.ts         # From src/styles/colors.ts
│   │       ├── spacing.ts        # From src/styles/spacing.ts
│   │       ├── typography.ts     # From src/styles/typography.ts
│   │       └── index.ts          # From src/styles/index.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── databaseReset.ts      # From src/utils/databaseReset.ts
│   │   ├── dateUtils.ts          # From src/utils/dateUtils.ts
│   │   ├── themeUtils.ts         # From src/utils/themeUtils.ts
│   │   └── uuidUtil.ts           # From src/utils/uuidUtil.ts
│   │
│   ├── constants/                # Constants and enums
│   │   └── entryTypes.ts         # From src/constants/entryTypes.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── index.ts              # From src/types/index.ts
│   │   ├── action.ts             # From src/types/action.ts
│   │   ├── baseEntry.ts          # From src/types/baseEntry.ts
│   │   ├── category.ts           # From src/types/category.ts
│   │   ├── chapter.ts            # From src/types/chapter.ts
│   │   ├── loop.ts               # From src/types/loop.ts
│   │   ├── navigation-types.ts   # From src/types/navigation-types.ts
│   │   ├── note.ts               # From src/types/note.ts
│   │   ├── path.ts               # From src/types/path.ts
│   │   ├── saga.ts               # From src/types/saga.ts
│   │   ├── spark.ts              # From src/types/spark.ts
│   │   └── svg.d.ts              # From src/types/svg.d.ts
│   │
│   └── assets/                   # Source assets
│       └── icons/                # Icon assets
│           └── lucide/           # From src/assets/icons/lucide/
│               ├── a-arrow-down.svg
│               ├── a-arrow-up.svg
│               └── ...           # (and more SVG files)
│
├── App.tsx                      # Root component
├── app.json                     # Expo config
├── babel.config.js              # Babel configuration
├── eslint.config.js             # ESLint configuration
├── index.ts                     # Entry point
├── metro.config.js              # Metro bundler config
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Lock file for dependencies
├── tsconfig.json                # TypeScript configuration
├── commands.md                  # Command reference
└── README.md                    # Project documentation
```

## Directory Explanations

### `/api` (formerly services and database)

The api directory contains all code related to data access. Each entity (actions, notes, etc.) has its own file with functions for creating, reading, updating, and deleting data.

**Before:** Database functions were split between `database/` and `services/` folders.
**After:** All database interaction is in one `/api` folder organized by entity.

### `/components`

Components are now organized by feature rather than by complexity (atoms/molecules/organisms).

**Before:** Components were organized as:
- `atoms/` (small, basic components)
- `molecules/` (medium complexity)
- `organisms/` (complex components)
- `entries/` (entry-specific components)

**After:** Components are organized by what they're used for:
- `shared/` (components used everywhere)
- `form/` (all form-related components)
- `actions/`, `notes/`, etc. (feature-specific components)

### `/screens`

Screen components represent full pages in your app, now organized by feature.

**Before:** All screens were in a flat structure with some in sub-folders.
**After:** Screens are grouped by the feature they belong to.

### `/store` (formerly redux)

State management using Redux, organized by entity.

**Before:** Redux files were split across multiple folders (slices, selectors, hooks).
**After:** All Redux files for a specific entity are grouped together.

### `/hooks`

Custom hooks that provide reusable functionality across the app.

### `/navigation`

Navigation configuration for the app, including navigators and route definitions.

### `/contexts`

React context providers that manage app-wide state like themes and bottom sheets.

### `/theme` (includes former styles)

All styling-related code, including colors, typography, spacing, and component-specific styles.

### `/utils`

Utility functions that provide common functionality across the app.

### `/types`

TypeScript type definitions, organized by entity.

## Key Benefits of New Structure

1. **Feature-First Organization**: Related code is grouped together by feature
2. **Reduced Folder Depth**: Fewer nested folders makes navigation easier
3. **Clear File Purpose**: Each file has an obvious place in the structure
4. **Simplified Component Structure**: No more confusing atomic design categories
5. **Entity-Focused**: Easy to find all files related to a specific entity (e.g., Actions)

## Migration Strategy

1. **Start with Core Infrastructure**: First move database, schema, and store setup

2. **Migrate One Feature at a Time**: Choose one feature (e.g., Actions), migrate all its components, screens, and state management

3. **Test Thoroughly**: Ensure the migrated feature works correctly before moving to the next

4. **Update References**: Update imports in other files that reference the migrated code

5. **Repeat**: Continue with each feature until the migration is complete

## Best Practices

1. **Feature-First Organization**: Group related code by feature rather than by type
2. **Clear File Naming**: Use descriptive names that indicate a file's purpose
3. **Consistent Patterns**: Follow the same patterns across all features
4. **Minimal Nesting**: Avoid deep folder hierarchies
5. **Single Responsibility**: Each file should have a single, clear purpose

This structure provides a clear organization that's easy to navigate for both technical and non-technical team members, while following industry best practices. 