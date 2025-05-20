// src/components/form/index.ts
import Form from './Form';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FormRichTextarea from './FormRichTextarea';
import FormSelect from './FormSelect';
import FormCheckbox from './FormCheckbox';
import FormSwitch from './FormSwitch';
import FormRadioGroup from './FormRadioGroup';
import FormDatePicker from './FormDatePicker';
import FormArrayField from './FormArrayField';
import FormErrorMessage from './FormErrorMessage';
import FormMoodSelector from './FormMoodSelector';
import FormLabelInput from './FormLabelInput';
import FormCategorySelector from './FormCategorySelector';
import { FormModal } from './FormModal';
import { FormSheet } from './FormSheet';

export {
    Form,
    FormInput,
    FormTextarea,
    FormRichTextarea,
    FormSelect,
    FormCheckbox,
    FormSwitch,
    FormRadioGroup,
    FormDatePicker,
    FormArrayField,
    FormErrorMessage,
    FormMoodSelector,
    FormLabelInput,
    FormCategorySelector,
    FormModal,
    FormSheet
};

// Backward compatibility
export { FormLabelInput as FormTagInput };