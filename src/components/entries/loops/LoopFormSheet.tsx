import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useForm, Control, FieldValues } from 'react-hook-form';
import { useTheme } from '../../../contexts/ThemeContext';
import { useStyles } from '../../../hooks/useStyles';
import { Typography } from '../../common/Typography';
import { Icon } from '../../common/Icon';
import { FormSheet } from '../../common/FormSheet';
import {
    Form,
    FormInput,
    FormRichTextarea,
    FormSelect,
    FormArrayField,
    FormCategorySelector,
    FormTagInput
} from '../../form';
import { useLoops } from '../../../hooks/useLoops';
import { generateSimpleId } from '../../../utils/uuidUtil';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';
import { Loop, LoopItem } from '../../../types/loop';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoopItemForm {
    id?: string;
    name: string;
    description?: string;
    durationMinutes?: string;
    quantity?: string;
}

interface LoopFormValues {
    title: string;
    description: string;
    frequency: string;
    items: LoopItemForm[];
    tags: string[];
    categoryId: string | null;
}

interface LoopFormSheetProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    loopToEdit?: Partial<LoopFormValues> & { id?: string };
}

export default function LoopFormSheet({
    visible,
    onClose,
    onSuccess,
    loopToEdit
}: LoopFormSheetProps) {
    const { theme } = useTheme();
    const { addLoop, updateLoop } = useLoops();
    const { showCategoryForm } = useBottomSheet();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditMode = !!loopToEdit?.id;

    const styles = useStyles((theme) => ({
        loopItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        itemHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        deleteButton: {
            padding: theme.spacing.xs,
        },
        formContainer: {
            width: '100%',
        },
    }));

    // Define specific bottom sheet properties to ensure visibility
    const bottomSheetProps = {
        maxHeight: 0.87, // 87% of screen height
        minHeight: 500,  // Minimum height to ensure content is visible
        snapPoints: [0.87, 0.5], // Snap to 87% or 50% of screen height
    };

    // Frequency options
    const FREQUENCY_OPTIONS = [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekdays', value: 'weekdays' },
        { label: 'Weekends', value: 'weekends' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Custom', value: 'custom' },
    ];

    const defaultValues: LoopFormValues = {
        title: loopToEdit?.title || '',
        description: loopToEdit?.description || '',
        frequency: loopToEdit?.frequency || 'daily',
        items: loopToEdit?.items || [],
        tags: loopToEdit?.tags || [],
        categoryId: loopToEdit?.categoryId || null,
    };

    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<LoopFormValues>({
        defaultValues,
        mode: 'onChange'
    });

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            reset(defaultValues);
            setIsSubmitting(false);
        }
    }, [visible, loopToEdit]);

    const handleFormSubmit = async (data: LoopFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Convert form items to Loop items with proper types
            const formattedItems: LoopItem[] = data.items.map((item) => ({
                id: item.id || generateSimpleId(),
                loopId: loopToEdit?.id || 'temp', // Will be set by the service for new items
                name: item.name,
                description: item.description,
                durationMinutes: item.durationMinutes ? parseInt(item.durationMinutes, 10) : undefined,
                quantity: item.quantity,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));

            // Create the loop data object with the required type field
            const loopData: Omit<Loop, 'id' | 'createdAt' | 'updatedAt'> = {
                type: 'loop',
                title: data.title,
                description: data.description,
                frequency: typeof data.frequency === 'string' ? data.frequency : JSON.stringify(data.frequency),
                items: formattedItems,
                tags: data.tags,
                categoryId: data.categoryId || undefined
            };

            let success;
            if (isEditMode && loopToEdit?.id) {
                success = await updateLoop(loopToEdit.id, loopData);
            } else {
                success = await addLoop(loopData);
            }

            if (success) {
                if (onSuccess) onSuccess();
                onClose();
            } else {
                Alert.alert('Error', 'Failed to save the loop. Please try again.');
            }
        } catch (error) {
            console.error('Error handling loop:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderLoopItem = (item: any, index: number, remove: (index: number) => void) => {
        return (
            <View style={styles.loopItem}>
                <View style={styles.itemHeader}>
                    <Typography variant="h4">Item {index + 1}</Typography>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => remove(index)}
                        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                    >
                        <Icon name="minus" width={16} height={16} color="red" />
                    </TouchableOpacity>
                </View>

                <FormInput
                    name={`items.${index}.name`}
                    control={control as unknown as Control<FieldValues>}
                    label="Name"
                    placeholder="Item name"
                    rules={{ required: 'Name is required' }}
                />

                <FormRichTextarea
                    name={`items.${index}.description`}
                    control={control as unknown as Control<FieldValues>}
                    label="Description (optional)"
                    placeholder="Describe this item..."
                    numberOfLines={3}
                />

                <FormInput
                    name={`items.${index}.durationMinutes`}
                    control={control as unknown as Control<FieldValues>}
                    label="Duration (minutes, optional)"
                    placeholder="e.g. 30"
                    keyboardType="numeric"
                />

                <FormInput
                    name={`items.${index}.quantity`}
                    control={control as unknown as Control<FieldValues>}
                    label="Quantity (optional)"
                    placeholder="e.g. 3 sets"
                />
            </View>
        );
    };

    const handleCreateCategory = () => {
        // We need to close the current sheet first to avoid UI issues
        onClose();
        // Then show the category form
        setTimeout(() => {
            showCategoryForm(undefined, () => {
                // Re-open the loop form after creating a category
                setTimeout(() => {
                    if (onSuccess) onSuccess();
                }, 100);
            });
        }, 300);
    };

    if (!visible) return null;

    return (
        <FormSheet
            visible={visible}
            onClose={onClose}
            title={isEditMode ? "Edit Loop" : "Create Loop"}
            onSubmit={handleSubmit(handleFormSubmit)}
            isSubmitting={isSubmitting}
            isEdit={isEditMode}
            submitLabel={isEditMode ? "Update" : "Create"}
            bottomSheetProps={bottomSheetProps}
        >
            <View style={styles.formContainer}>
                <Form>
                    <FormInput
                        name="title"
                        control={control as unknown as Control<FieldValues>}
                        label="Title"
                        placeholder="Enter a title..."
                        rules={{ required: 'Title is required' }}
                    />

                    <FormRichTextarea
                        name="description"
                        control={control as unknown as Control<FieldValues>}
                        label="Description"
                        placeholder="Describe the loop..."
                        rules={{ required: 'Description is required' }}
                        numberOfLines={3}
                    />

                    <FormSelect
                        name="frequency"
                        control={control as unknown as Control<FieldValues>}
                        label="Frequency"
                        options={FREQUENCY_OPTIONS}
                        rules={{ required: 'Frequency is required' }}
                    />

                    <FormCategorySelector
                        name="categoryId"
                        control={control as unknown as Control<FieldValues>}
                        label="Category (optional)"
                        onCreateCategory={handleCreateCategory}
                    />

                    <FormTagInput
                        name="tags"
                        control={control as unknown as Control<FieldValues>}
                        label="Tags (optional)"
                    />

                    <FormArrayField
                        name="items"
                        control={control as unknown as Control<FieldValues>}
                        label="Items"
                        renderItem={renderLoopItem}
                        addButtonLabel="Add Item"
                        defaultItem={{
                            id: generateSimpleId(),
                            name: '',
                            description: '',
                        }}
                    />
                </Form>
            </View>
        </FormSheet>
    );
} 