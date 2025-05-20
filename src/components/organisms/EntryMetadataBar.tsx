import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Label, Icon } from '../common';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';
import { FormLabelInput } from '../form';
import FormCategorySelector from '../form/FormCategorySelector';
import { useTheme } from '../../contexts/ThemeContext';
import Form from '../form/Form';
import { useForm } from 'react-hook-form';
import { BottomSheet } from '../molecules/BottomSheet';

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
    const { getCategory, categories } = useCategories();
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
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.m,
            width: '100%',
        },
        section: {
            marginBottom: theme.spacing.m,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.s,
        },
        labelsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            borderRadius: theme.shape.radius.pill,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            alignSelf: 'flex-start',
        },
        addButtonText: {
            marginLeft: theme.spacing.xs,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.s,
        },
        categoryPill: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.s,
            borderRadius: theme.shape.radius.pill,
            backgroundColor: category ? `${category.color}20` : 'transparent',
            borderWidth: 1,
            borderColor: category ? category.color : theme.colors.border,
            marginBottom: theme.spacing.s,
            alignSelf: 'flex-start',
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
            fontSize: theme.typography.fontSize.s,
        },
        bottomSheetContent: {
            padding: theme.spacing.m,
        },
        labelChip: {
            marginRight: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
        },
    }));

    const handleCategoryPress = () => {
        if (isEditing) {
            setShowCategorySheet(true);
        }
    };

    const handleAddLabelPress = () => {
        if (isEditing) {
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
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleCategoryPress}
                            disabled={!isEditing}
                        >
                            <Icon
                                name="plus"
                                size={14}
                                color={theme.colors.textSecondary}
                            />
                            <Typography style={styles.addButtonText}>
                                Add Category
                            </Typography>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Labels Section */}
                <View style={styles.section}>
                    <View style={styles.labelsContainer}>
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

                        {isEditing && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleAddLabelPress}
                            >
                                <Icon
                                    name="plus"
                                    size={14}
                                    color={theme.colors.textSecondary}
                                />
                                <Typography style={styles.addButtonText}>
                                    Add Label
                                </Typography>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Category Selection Bottom Sheet */}
            <BottomSheet
                visible={showCategorySheet}
                onClose={() => setShowCategorySheet(false)}
                snapPoints={[0.6]}
            >
                <View style={styles.bottomSheetContent}>
                    <FormCategorySelector
                        name="categoryId"
                        control={control}
                        label="Select Category"
                        onSelectCategory={handleCategoryChange}
                        helperText=""
                    />
                </View>
            </BottomSheet>

            {/* Labels Selection Bottom Sheet */}
            <BottomSheet
                visible={showLabelsSheet}
                onClose={handleLabelsSheetClose}
                snapPoints={[0.7]}
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
                        />
                    </Form>
                </View>
            </BottomSheet>
        </>
    );
}; 