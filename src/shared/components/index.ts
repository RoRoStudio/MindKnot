// Core UI Components
export { default as Typography } from './Typography';
export { default as Icon } from './Icon';
export { default as Button } from './Button';
export { Card } from './Card';

// Form Components
export { default as Form } from './form/Form';
export { default as FormInput } from './form/FormInput';
export { default as FormTextarea } from './form/FormTextarea';
export { default as FormRichTextarea } from './form/FormRichTextarea';
export { default as FormSwitch } from './form/FormSwitch';
export { default as FormCheckbox } from './form/FormCheckbox';
export { default as FormSelect } from './form/FormSelect';
export { FormMultiSelect } from './form/FormMultiSelect';
export { default as FormRadioGroup } from './form/FormRadioGroup';
export { default as FormDatePicker } from './form/FormDatePicker';
export { FormErrorMessage } from './form/FormErrorMessage';
export { default as FormLabelInput } from './form/FormLabelInput';
export { default as FormMoodSelector } from './form/FormMoodSelector';
export { default as FormCategorySelector } from './form/FormCategorySelector';
export { default as FormArrayField } from './form/FormArrayField';
export { default as FormTagInput } from './form/FormTagInput';

// Shared Components
export { BottomSheet } from './BottomSheet';
export { FormModal } from './form/FormModal';
export { FormSheet } from './form/FormSheet';
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
export type { FormDatePickerRef } from './form/FormDatePicker';
export type { Category } from '../types/category';