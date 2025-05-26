// Core UI Components
export { default as Typography } from './Typography';
export { default as Icon } from './Icon';
export { default as Button } from './Button';
export { Card } from './Card';

// Form Components
export { default as Form } from './Form';
export { default as FormInput } from './FormInput';
export { default as FormTextarea } from './FormTextarea';
export { default as FormRichTextarea } from './FormRichTextarea';
export { default as FormSwitch } from './FormSwitch';
export { default as FormCheckbox } from './FormCheckbox';
export { default as FormSelect } from './FormSelect';
export { default as FormRadioGroup } from './FormRadioGroup';
export { default as FormDatePicker } from './FormDatePicker';
export { default as FormErrorMessage } from './FormErrorMessage';
export { default as FormLabelInput } from './FormLabelInput';
export { default as FormMoodSelector } from './FormMoodSelector';
export { default as FormCategorySelector } from './FormCategorySelector';
export { default as FormArrayField } from './FormArrayField';
export { default as FormTagInput } from './FormTagInput';

// Shared Components
export { BottomSheet } from './BottomSheet';
export { FormModal } from './FormModal';
export { FormSheet } from './FormSheet';
export { ConfirmationModal } from './ConfirmationModal';

// Entry Components
export { EntryCard } from './EntryCard';
export { EntryDetailHeader } from './EntryDetailHeader';
export { EntryMetadataBar } from './EntryMetadataBar';
export { default as EntryTitleInput } from './EntryTitleInput';
export { NoteCard } from '../../features/notes/components/NoteCard';
export { SparkCard } from '../../features/sparks/components/SparkCard';
export { ActionCard } from '../../features/actions/components/ActionCard';
export { PathCard } from '../../features/paths/components/PathCard';

// Navigation Components
export { CustomBottomNavBar } from './CustomBottomNavBar';
export { DiamondFab } from './DiamondFab';

// Utility Components
export { default as ColorPicker } from './ColorPicker';
export { default as CategoryPill } from './CategoryPill';
export { IconPicker } from './IconPicker';
export { default as DottedPillButton } from './DottedPillButton';
export { ProgressBar } from './ProgressBar';

// List Components
export { FilterableList } from './FilterableList';
export { FilterableListHeader } from './FilterableListHeader';
export { default as LabelRow } from './LabelRow';
export { default as Label } from './Label';

// Screen Components
export { BaseEntityScreen } from './BaseEntityScreen';
export { default as CategoryManager } from './CategoryManager';

// Loop Components (will be implemented in Phase 3)
// export { default as LoopExecutionHeader } from './LoopExecutionHeader';
// export { default as ExpandableLoopHeader } from './ExpandableLoopHeader';

// Re-export types
export type { IconName } from './Icon';
export type { FormDatePickerRef } from './FormDatePicker';
export type { Category } from '../types/category';