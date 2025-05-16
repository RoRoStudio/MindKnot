
```
MindKnot
├─ .pnp.cjs
├─ .pnp.loader.mjs
├─ App.tsx
├─ README.md
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
│  │  ├─ common
│  │  │  ├─ BottomSheet.tsx
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ ColorPicker.tsx
│  │  │  ├─ FormModal.tsx
│  │  │  ├─ FormSheet.tsx
│  │  │  ├─ Icon.tsx
│  │  │  ├─ IconPicker.tsx
│  │  │  └─ Typography.tsx
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
│  │  │  ├─ FormMoodSelector.tsx
│  │  │  ├─ FormRadioGroup.tsx
│  │  │  ├─ FormRichTextarea.tsx
│  │  │  ├─ FormSelect.tsx
│  │  │  ├─ FormSwitch.tsx
│  │  │  ├─ FormTagInput.tsx
│  │  │  ├─ FormTextarea.tsx
│  │  │  └─ index.ts
│  │  ├─ navigation
│  │  │  ├─ CustomBottomNavBar.tsx
│  │  │  └─ DiamondFab.tsx
│  │  └─ sagas
│  │     ├─ AnimatedBookSaga.tsx
│  │     └─ SagaCreationSheet.tsx
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
│  │  └─ useStyles.ts
│  ├─ navigation
│  │  ├─ AppNavigator.tsx
│  │  ├─ TabNavigator.tsx
│  │  └─ VaultTabNavigator.tsx
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
│  │     ├─ VaultSearchHeader.tsx
│  │     └─ VaultSparksScreen.tsx
│  ├─ services
│  │  ├─ actionService.ts
│  │  ├─ categoryService.ts
│  │  ├─ loopService.ts
│  │  ├─ noteService.ts
│  │  ├─ pathService.ts
│  │  ├─ sagaService.ts
│  │  └─ sparkService.ts
│  ├─ state
│  │  ├─ loopStore.ts
│  │  ├─ pathStore.ts
│  │  └─ sagaStore.ts
│  ├─ styles
│  │  ├─ colors.ts
│  │  ├─ index.ts
│  │  ├─ spacing.ts
│  │  └─ typography.ts
│  ├─ theme
│  │  ├─ dark.ts
│  │  ├─ light.ts
│  │  └─ themeTypes.ts
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