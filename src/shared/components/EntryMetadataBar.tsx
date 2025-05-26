import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useStyles } from '../hooks/useStyles';
import { Typography, Label, Icon } from './';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types/category';
import { FormLabelInput } from './';
import FormCategorySelector from './FormCategorySelector';
import { useTheme } from '../../app/contexts/ThemeContext';
import Form from './Form';
import { useForm } from 'react-hook-form';
import { BottomSheet } from './BottomSheet';
import DottedPillButton from './DottedPillButton';

// For form state
type FormValues = {
    labels: string[];
    categoryId: string | null;
};

export interface EntryMetadataBarProps {
    /**
     * The ID of the category currently selected
     */
    categoryId: string | null;

    /**
     * Callback when category is changed
     */
    onCategoryChange: (categoryId: string | null) => void;

    /**
     * Array of labels for the entry 
     */
    labels: string[];

    /**
     * Callback when labels are updated
     */
    onLabelsChange: (labels: string[]) => void;

    /**
     * Whether this is in edit mode
     * @default false
     */
    isEditing?: boolean;
}

export const EntryMetadataBar: React.FC<EntryMetadataBarProps> = ({
    categoryId,
    onCategoryChange,
    labels,
    onLabelsChange,
    isEditing = false,
}) => {
    const { theme } = useTheme();
    const [category, setCategory] = useState<Category | null>(null);
    const { getCategory } = useCategories();
    const [showCategorySheet, setShowCategorySheet] = useState(false);
    const [showLabelsSheet, setShowLabelsSheet] = useState(false);

    // Set up form
    const { control } = useForm<FormValues>({
        defaultValues: {
            labels: labels || [],
            categoryId: categoryId
        }
    });

    // Load the selected category
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                if (categoryId) {
                    const loadedCategory = await getCategory(categoryId);
                    setCategory(loadedCategory);
                } else {
                    setCategory(null);
                }
            } catch (error) {
                console.error('Error loading category:', error);
                setCategory(null);
            }
        };

        fetchCategory();
    }, [categoryId, getCategory]);

    const styles = useStyles((theme) => ({
        container: {
            backgroundColor: theme.colors.background,
            padding: theme.spacing.m,
            width: '100%',
        },
        section: {
            marginBottom: theme.spacing.m,
        },
        labelsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        addButtonContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        categoryPill: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 100,
            backgroundColor: category ? `${category.color}20` : 'transparent',
            borderWidth: 1,
            borderColor: category ? category.color : theme.colors.border,
            marginBottom: theme.spacing.xs,
            alignSelf: 'flex-start',
            height: 24, // Consistent height matching Label "small" component
        },
        categoryDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: category ? category.color : theme.colors.textSecondary,
            marginRight: theme.spacing.xs,
        },
        categoryText: {
            color: category ? category.color : theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            textAlignVertical: 'center',
            includeFontPadding: false,
            lineHeight: 16,
        },
        bottomSheetContent: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.xl * 2,
        },
        labelChip: {
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
        keyboardAvoidingView: {
            flex: 1,
            width: '100%',
            minHeight: 400,
        },
        bottomSpacer: {
            height: 100,
        }
    }));

    const handleCategoryPress = () => {
        if (isEditing) {
            Keyboard.dismiss();
            setShowCategorySheet(true);
        }
    };

    const handleAddLabelPress = () => {
        if (isEditing) {
            Keyboard.dismiss();
            setShowLabelsSheet(true);
        }
    };

    const handleCategoryChange = (newCategoryId: string | null) => {
        onCategoryChange(newCategoryId);
        setShowCategorySheet(false);
    };

    const handleLabelsChange = (newLabels: string[]) => {
        onLabelsChange(newLabels);
    };

    const handleLabelsSheetClose = () => {
        setShowLabelsSheet(false);
    };

    return (
        <>
            <View style={styles.container}>
                {/* Category Section */}
                <View style={styles.section}>
                    {category ? (
                        <TouchableOpacity
                            style={styles.categoryPill}
                            onPress={handleCategoryPress}
                            disabled={!isEditing}
                        >
                            <View style={styles.categoryDot} />
                            <Typography style={styles.categoryText}>
                                {category.title}
                            </Typography>
                        </TouchableOpacity>
                    ) : (
                        <DottedPillButton
                            iconName="plus"
                            label="Add Category"
                            onPress={handleCategoryPress}
                            disabled={!isEditing}
                        />
                    )}
                </View>

                {/* Labels Section */}
                <View style={styles.section}>
                    <View style={styles.addButtonContainer}>
                        {/* Display existing labels */}
                        {labels && labels.map((label, index) => (
                            <Label
                                key={index}
                                label={label}
                                size="small"
                                removable={isEditing}
                                onRemove={() => {
                                    if (isEditing) {
                                        const newLabels = [...labels];
                                        newLabels.splice(index, 1);
                                        onLabelsChange(newLabels);
                                    }
                                }}
                                style={styles.labelChip}
                            />
                        ))}

                        {/* Add Label button - use iconOnly when labels exist */}
                        {isEditing && (
                            <DottedPillButton
                                iconName="plus"
                                label={labels && labels.length > 0 ? undefined : "Add Label"}
                                iconOnly={labels && labels.length > 0}
                                onPress={handleAddLabelPress}
                            />
                        )}
                    </View>
                </View>
            </View>

            {/* Category Selection Bottom Sheet */}
            <BottomSheet
                visible={showCategorySheet}
                onClose={() => setShowCategorySheet(false)}
                snapPoints={[0.9]}
                dismissible={true}
                maxHeight={0.9}
            >
                <KeyboardAvoidingView
                    behavior={Platform.select({ ios: 'padding', android: undefined })}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <View style={styles.bottomSheetContent}>
                        <FormCategorySelector
                            name="categoryId"
                            control={control}
                            label="Select Category"
                            onSelectCategory={handleCategoryChange}
                            showNoneOption={true}
                            helperText=""
                        />
                        <View style={styles.bottomSpacer} />
                    </View>
                </KeyboardAvoidingView>
            </BottomSheet>

            {/* Labels Selection Bottom Sheet */}
            <BottomSheet
                visible={showLabelsSheet}
                onClose={handleLabelsSheetClose}
                snapPoints={[0.9]}
                dismissible={true}
                maxHeight={0.9}
            >
                <KeyboardAvoidingView
                    behavior={Platform.select({ ios: 'padding', android: undefined })}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                >
                    <View style={styles.bottomSheetContent}>
                        <Form>
                            <FormLabelInput
                                name="labels"
                                control={control}
                                label="Add Labels"
                                currentLabels={labels}
                                onLabelsChange={handleLabelsChange}
                                onDone={handleLabelsSheetClose}
                                value={labels}
                            />
                        </Form>
                        <View style={styles.bottomSpacer} />
                    </View>
                </KeyboardAvoidingView>
            </BottomSheet>
        </>
    );
};