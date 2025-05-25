MindKnot
├─ .pnp.cjs
├─ .pnp.loader.mjs
├─ App.tsx
├─ CODEBASE_STRUCTURE.md
├─ IMPORT_MAPPING.md
├─ README.md
├─ REFACTORING_PLAN.md
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
│  ├─ api
│  │  ├─ actionService.ts
│  │  ├─ actions.ts
│  │  ├─ categoryService.ts
│  │  ├─ database.ts
│  │  ├─ index.ts
│  │  ├─ loopService.ts
│  │  ├─ noteService.ts
│  │  ├─ pathService.ts
│  │  ├─ sagaService.ts
│  │  ├─ schema.ts
│  │  └─ sparkService.ts
│  ├─ assets
│  │  └─ icons
│  │     └─ lucide
│  │        ├─ a-arrow-down.svg
│  │        ├─ a-arrow-up.svg
│  │        ├─ (and a lots more)
│  ├─ components
│  │  ├─ common
│  │  │  └─ index.ts
│  │  ├─ entries
│  │  │  ├─ EntryCard.tsx
│  │  │  ├─ EntryDetailHeader.tsx
│  │  │  ├─ EntryMetadataBar.tsx
│  │  │  ├─ EntryTitleInput.tsx
│  │  │  ├─ actions
│  │  │  │  ├─ ActionCard.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ index.ts
│  │  │  ├─ loops
│  │  │  │  ├─ ActivityPicker.tsx
│  │  │  │  ├─ ActivityTemplateSelector.tsx
│  │  │  │  ├─ LoopCard.tsx
│  │  │  │  ├─ LoopCreationFlow.tsx
│  │  │  │  ├─ LoopExecutionStatusCard.tsx
│  │  │  │  ├─ LoopInterruptionModal.tsx
│  │  │  │  ├─ LoopProgressIndicator.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ notes
│  │  │  │  ├─ NoteCard.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ paths
│  │  │  │  ├─ ActionEmbedSheet.tsx
│  │  │  │  ├─ MilestoneSection.tsx
│  │  │  │  ├─ PathCard.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ sagas
│  │  │  │  ├─ AnimatedBookSaga.tsx
│  │  │  │  ├─ SagaCreationSheet.tsx
│  │  │  │  └─ index.ts
│  │  │  └─ sparks
│  │  │     ├─ SparkCard.tsx
│  │  │     └─ index.ts
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
│  │  │  ├─ FormTagInput.tsx
│  │  │  ├─ FormTextarea.tsx
│  │  │  └─ index.ts
│  │  ├─ navigation
│  │  │  ├─ CustomBottomNavBar.tsx
│  │  │  ├─ DiamondFab.tsx
│  │  │  └─ index.ts
│  │  ├─ shared
│  │  │  ├─ BeautifulTimer.tsx
│  │  │  ├─ BottomSheet.tsx
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ CategoryManager.tsx
│  │  │  ├─ CategoryPill.tsx
│  │  │  ├─ ColorPicker.tsx
│  │  │  ├─ ConfirmationModal.tsx
│  │  │  ├─ DottedPillButton.tsx
│  │  │  ├─ ExpandableLoopHeader.tsx
│  │  │  ├─ FilterableList.tsx
│  │  │  ├─ FilterableListHeader.tsx
│  │  │  ├─ Icon.tsx
│  │  │  ├─ IconPicker.tsx
│  │  │  ├─ Label.tsx
│  │  │  ├─ LabelRow.tsx
│  │  │  ├─ LoopExecutionHeader.tsx
│  │  │  ├─ Typography.tsx
│  │  │  └─ index.ts
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
│  ├─ hooks
│  │  ├─ index.ts
│  │  ├─ useActions.ts
│  │  ├─ useBackgroundTimer.ts
│  │  ├─ useCategories.ts
│  │  ├─ useExpandableLoopHeader.ts
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
│  ├─ screens
│  │  ├─ actions
│  │  │  └─ ActionScreen.tsx
│  │  ├─ detail
│  │  ├─ dev
│  │  │  ├─ ComponentShowcaseScreen.tsx
│  │  │  ├─ TestScreen.tsx
│  │  │  └─ ThemeInspectorScreen.tsx
│  │  ├─ home
│  │  │  └─ HomeScreen.tsx
│  │  ├─ loops
│  │  │  ├─ LoopExecutionScreen.tsx
│  │  │  └─ LoopScreen.tsx
│  │  ├─ momentum
│  │  │  └─ MomentumScreen.tsx
│  │  ├─ notes
│  │  │  └─ NoteScreen.tsx
│  │  ├─ paths
│  │  │  └─ PathScreen.tsx
│  │  ├─ sagas
│  │  │  ├─ SagaDetailScreen.tsx
│  │  │  └─ SagaScreen.tsx
│  │  ├─ sparks
│  │  │  └─ SparkScreen.tsx
│  │  └─ vault
│  │     ├─ BaseVaultScreen.tsx
│  │     ├─ VaultActionsScreen.tsx
│  │     ├─ VaultEmptyState.tsx
│  │     ├─ VaultLoopsScreen.tsx
│  │     ├─ VaultNotesScreen.tsx
│  │     ├─ VaultPathsScreen.tsx
│  │     ├─ VaultScreen.tsx
│  │     └─ VaultSparksScreen.tsx
│  ├─ store
│  │  ├─ actions
│  │  │  ├─ actionSelectors.ts
│  │  │  ├─ actionSlice.ts
│  │  │  ├─ index.ts
│  │  │  └─ useActionActions.ts
│  │  ├─ index.ts
│  │  ├─ loops
│  │  │  ├─ index.ts
│  │  │  ├─ loopSelectors.ts
│  │  │  ├─ loopSlice.ts
│  │  │  └─ useLoopActions.ts
│  │  ├─ notes
│  │  │  ├─ index.ts
│  │  │  ├─ noteSelectors.ts
│  │  │  ├─ noteSlice.ts
│  │  │  └─ useNoteActions.ts
│  │  ├─ paths
│  │  │  ├─ index.ts
│  │  │  ├─ pathSelectors.ts
│  │  │  ├─ pathSlice.ts
│  │  │  └─ usePathActions.ts
│  │  ├─ sagas
│  │  │  ├─ index.ts
│  │  │  ├─ sagaSelectors.ts
│  │  │  ├─ sagaSlice.ts
│  │  │  └─ useSagaActions.ts
│  │  ├─ shared
│  │  │  ├─ hooks.ts
│  │  │  ├─ index.ts
│  │  │  ├─ stateHooks.ts
│  │  │  └─ store.ts
│  │  └─ sparks
│  │     ├─ index.ts
│  │     ├─ sparkSelectors.ts
│  │     ├─ sparkSlice.ts
│  │     └─ useSparkActions.ts
│  ├─ theme
│  │  ├─ dark.ts
│  │  ├─ light.ts
│  │  ├─ styleConstants.ts
│  │  ├─ styles
│  │  │  ├─ colors.ts
│  │  │  ├─ index.ts
│  │  │  ├─ spacing.ts
│  │  │  └─ typography.ts
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
│     ├─ uuid.ts
│     └─ uuidUtil.ts
└─ tsconfig.json

```