# Import Path Mapping

This file serves as a reference for updating import paths when restructuring the codebase.

## Old to New Path Mappings

### Database/API
- `src/database/database` → `src/api/database`
- `src/database/schema` → `src/api/schema`
- `src/services/actionService` → `src/api/actions`
- `src/services/noteService` → `src/api/notes`
- `src/services/pathService` → `src/api/paths`
- `src/services/loopService` → `src/api/loops`
- `src/services/sparkService` → `src/api/sparks`
- `src/services/categoryService` → `src/api/categories`
- `src/services/sagaService` → `src/api/sagas`

### Redux/Store
- `src/redux/store` → `src/store`
- `src/redux/slices/actionSlice` → `src/store/actions/slice`
- `src/redux/selectors/actionSelectors` → `src/store/actions/selectors`
- `src/redux/hooks/useActionActions` → `src/store/actions/hooks`
- `src/redux/slices/noteSlice` → `src/store/notes/slice`
- `src/redux/selectors/noteSelectors` → `src/store/notes/selectors`
- `src/redux/hooks/useNoteActions` → `src/store/notes/hooks`
- `src/redux/slices/sparkSlice` → `src/store/sparks/slice`
- `src/redux/selectors/sparkSelectors` → `src/store/sparks/selectors`
- `src/redux/hooks/useSparkActions` → `src/store/sparks/hooks`
- `src/redux/slices/pathSlice` → `src/store/paths/slice`
- `src/redux/selectors/pathSelectors` → `src/store/paths/selectors`
- `src/redux/hooks/usePathActions` → `src/store/paths/hooks`
- `src/redux/slices/loopSlice` → `src/store/loops/slice`
- `src/redux/selectors/loopSelectors` → `src/store/loops/selectors`
- `src/redux/hooks/useLoopActions` → `src/store/loops/hooks`
- `src/redux/slices/sagaSlice` → `src/store/sagas/slice`
- `src/redux/selectors/sagaSelectors` → `src/store/sagas/selectors`
- `src/redux/hooks/useSagaActions` → `src/store/sagas/hooks`
- `src/redux/hooks/index` → `src/store/shared/hooks`

### Components
- `src/components/atoms/*` → `src/components/shared/*`
- `src/components/molecules/*` → `src/components/shared/*`
- `src/components/organisms/FilterableList` → `src/components/shared/FilterableList`
- `src/components/organisms/FilterableListHeader` → `src/components/shared/FilterableListHeader`
- `src/components/common/ConfirmationModal` → `src/components/shared/ConfirmationModal`
- `src/components/entries/actions/*` → `src/components/actions/*`
- `src/components/entries/notes/*` → `src/components/notes/*`
- `src/components/entries/sparks/*` → `src/components/sparks/*`
- `src/components/entries/paths/*` → `src/components/paths/*`
- `src/components/entries/loops/*` → `src/components/loops/*`
- `src/components/entries/EntryCard` → `src/components/entries/EntryCard`
- `src/components/organisms/EntryDetailHeader` → `src/components/entries/EntryDetailHeader`
- `src/components/organisms/EntryMetadataBar` → `src/components/entries/EntryMetadataBar`

### Screens
- `src/screens/HomeScreen` → `src/screens/home/HomeScreen`
- `src/screens/MomentumScreen` → `src/screens/home/MomentumScreen`
- `src/screens/ActionScreen` → `src/screens/actions/ActionScreen`
- `src/screens/NoteScreen` → `src/screens/notes/NoteScreen`
- `src/screens/SparkScreen` → `src/screens/sparks/SparkScreen`
- `src/screens/PathScreen` → `src/screens/paths/PathScreen`
- `src/screens/LoopScreen` → `src/screens/loops/LoopScreen`
- `src/screens/SagaScreen` → `src/screens/sagas/SagaScreen`
- `src/screens/SagaDetailScreen` → `src/screens/sagas/SagaDetailScreen`
- `src/screens/VaultScreen` → `src/screens/vault/VaultScreen`
- `src/screens/TestScreen` → `src/screens/dev/TestScreen`
- `src/screens/ThemeInspectorScreen` → `src/screens/dev/ThemeInspectorScreen`
- `src/screens/ComponentShowcaseScreen` → `src/screens/dev/ComponentShowcaseScreen`
- `src/components/templates/BaseEntityScreen` → `src/screens/templates/BaseEntityScreen`

### Styles
- `src/styles/*` → `src/theme/styles/*`

## Implementation Strategy

1. Update one module at a time, verifying it works before moving to the next
2. Start with the lowest level modules (database, utils) and work up to UI components
3. Run TypeScript compiler frequently to catch import errors early 