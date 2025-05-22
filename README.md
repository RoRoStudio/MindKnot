
```
MindKnot

├─ app.json
├─ assets
│  ├─ adaptive-icon.png
│  ├─ favicon.png
│  ├─ icon.png
│  └─ splash-icon.png
├─ babel.config.js
├─ commands.md
├─ eslint.config.js
├─ index.ts
├─ metro.config.js
├─ package-lock.json
├─ package.json
├─ src
│  ├─ assets
│  │  └─ icons
│  │     └─ lucide
│  │        ├─ a-arrow-down.svg
│  │        ├─ a-arrow-up.svg
│  │        ├─ (and a lot more)
│  ├─ components
│  │  ├─ atoms
│  │  │  ├─ Button.tsx
│  │  │  ├─ DottedPillButton.tsx
│  │  │  ├─ Icon.tsx
│  │  │  ├─ Label.tsx
│  │  │  ├─ Typography.tsx
│  │  │  └─ index.ts
│  │  ├─ common
│  │  │  ├─ ConfirmationModal.tsx
│  │  │  └─ index.ts
│  │  ├─ entries
│  │  │  ├─ EntryCard.tsx
│  │  │  ├─ actions
│  │  │  │  └─ ActionCard.tsx
│  │  │  ├─ index.ts
│  │  │  ├─ loops
│  │  │  │  └─ LoopCard.tsx
│  │  │  ├─ notes
│  │  │  │  └─ NoteCard.tsx
│  │  │  ├─ paths
│  │  │  │  └─ PathCard.tsx
│  │  │  └─ sparks
│  │  │     └─ SparkCard.tsx
│  │  ├─ form
│  │  │  ├─ Form.tsx
│  │  │  ├─ FormArrayField.tsx
│  │  │  ├─ FormCategorySelector.tsx
│  │  │  ├─ FormCheckbox.tsx
│  │  │  ├─ FormDatePicker.tsx
│  │  │  ├─ FormErrorMessage.tsx
│  │  │  ├─ FormInput.tsx
│  │  │  ├─ FormLabelInput.tsx
│  │  │  ├─ FormModal.tsx
│  │  │  ├─ FormMoodSelector.tsx
│  │  │  ├─ FormRadioGroup.tsx
│  │  │  ├─ FormRichTextarea.tsx
│  │  │  ├─ FormSelect.tsx
│  │  │  ├─ FormSheet.tsx
│  │  │  ├─ FormSwitch.tsx
│  │  │  ├─ FormTextarea.tsx
│  │  │  └─ index.ts
│  │  ├─ molecules
│  │  │  ├─ BottomSheet.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ CategoryPill.tsx
│  │  │  ├─ ColorPicker.tsx
│  │  │  ├─ IconPicker.tsx
│  │  │  └─ index.ts
│  │  ├─ navigation
│  │  │  ├─ CustomBottomNavBar.tsx
│  │  │  └─ DiamondFab.tsx
│  │  ├─ organisms
│  │  │  ├─ EntryDetailHeader.tsx
│  │  │  ├─ EntryMetadataBar.tsx
│  │  │  ├─ FilterableList.tsx
│  │  │  ├─ FilterableListHeader.tsx
│  │  │  └─ index.ts
│  │  ├─ sagas
│  │  │  ├─ AnimatedBookSaga.tsx
│  │  │  └─ SagaCreationSheet.tsx
│  │  ├─ shared-props.ts
│  │  └─ templates
│  │     ├─ BaseEntityScreen.tsx
│  │     └─ index.ts
│  ├─ constants
│  │  └─ entryTypes.ts
│  ├─ contexts
│  │  ├─ BottomSheetConfig.tsx
│  │  ├─ BottomSheetContext.tsx
│  │  ├─ ThemeContext.tsx
│  │  └─ VaultFiltersContext.tsx
│  ├─ database
│  │  ├─ database.ts
│  │  └─ schema.ts
│  ├─ hooks
│  │  ├─ useActions.ts
│  │  ├─ useCategories.ts
│  │  ├─ useLoops.ts
│  │  ├─ useNotes.ts
│  │  ├─ usePaths.ts
│  │  ├─ useSagas.ts
│  │  ├─ useSparks.ts
│  │  ├─ useStyles.ts
│  │  └─ useThemedStyles.ts
│  ├─ navigation
│  │  ├─ AppNavigator.tsx
│  │  ├─ TabNavigator.tsx
│  │  └─ VaultTabNavigator.tsx
│  ├─ redux
│  │  ├─ hooks
│  │  │  ├─ index.ts
│  │  │  ├─ stateHooks.ts
│  │  │  ├─ useActionActions.ts
│  │  │  ├─ useLoopActions.ts
│  │  │  ├─ useNoteActions.ts
│  │  │  ├─ usePathActions.ts
│  │  │  ├─ useSagaActions.ts
│  │  │  └─ useSparkActions.ts
│  │  ├─ selectors
│  │  │  ├─ actionSelectors.ts
│  │  │  ├─ loopSelectors.ts
│  │  │  ├─ noteSelectors.ts
│  │  │  ├─ pathSelectors.ts
│  │  │  ├─ sagaSelectors.ts
│  │  │  └─ sparkSelectors.ts
│  │  ├─ slices
│  │  │  ├─ actionSlice.ts
│  │  │  ├─ loopSlice.ts
│  │  │  ├─ noteSlice.ts
│  │  │  ├─ pathSlice.ts
│  │  │  ├─ sagaSlice.ts
│  │  │  └─ sparkSlice.ts
│  │  └─ store.ts
│  ├─ screens
│  │  ├─ ActionScreen.tsx
│  │  ├─ ComponentShowcaseScreen.tsx
│  │  ├─ HomeScreen.tsx
│  │  ├─ LoopScreen.tsx
│  │  ├─ MomentumScreen.tsx
│  │  ├─ NoteScreen.tsx
│  │  ├─ PathScreen.tsx
│  │  ├─ SagaDetailScreen.tsx
│  │  ├─ SagaScreen.tsx
│  │  ├─ SparkScreen.tsx
│  │  ├─ TestScreen.tsx
│  │  ├─ ThemeInspectorScreen.tsx
│  │  ├─ VaultScreen.tsx
│  │  ├─ detail
│  │  └─ vault
│  │     ├─ BaseVaultScreen.tsx
│  │     ├─ VaultActionsScreen.tsx
│  │     ├─ VaultEmptyState.tsx
│  │     ├─ VaultLoopsScreen.tsx
│  │     ├─ VaultNotesScreen.tsx
│  │     ├─ VaultPathsScreen.tsx
│  │     └─ VaultSparksScreen.tsx
│  ├─ services
│  │  ├─ actionService.ts
│  │  ├─ categoryService.ts
│  │  ├─ loopService.ts
│  │  ├─ noteService.ts
│  │  ├─ pathService.ts
│  │  ├─ sagaService.ts
│  │  └─ sparkService.ts
│  ├─ styles
│  │  ├─ colors.ts
│  │  ├─ index.ts
│  │  ├─ spacing.ts
│  │  └─ typography.ts
│  ├─ theme
│  │  ├─ dark.ts
│  │  ├─ light.ts
│  │  ├─ styleConstants.ts
│  │  ├─ themeTypes.ts
│  │  ├─ themeUtils.ts
│  │  └─ tokens.ts
│  ├─ types
│  │  ├─ action.ts
│  │  ├─ baseEntry.ts
│  │  ├─ category.ts
│  │  ├─ chapter.ts
│  │  ├─ index.ts
│  │  ├─ loop.ts
│  │  ├─ navigation-types.ts
│  │  ├─ note.ts
│  │  ├─ path.ts
│  │  ├─ saga.ts
│  │  ├─ spark.ts
│  │  └─ svg.d.ts
│  └─ utils
│     ├─ databaseReset.ts
│     ├─ dateUtils.ts
│     ├─ themeUtils.ts
│     └─ uuidUtil.ts
└─ tsconfig.json

```