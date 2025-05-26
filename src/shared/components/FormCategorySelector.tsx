// src/components/form/FormCategorySelector.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { Control, Controller, FieldValues, Path, useForm } from 'react-hook-form';
import { useStyles } from '../hooks/useStyles';
import { Typography, Button, Icon, ConfirmationModal } from './';
import { useTheme } from '../../app/contexts/ThemeContext';
import FormErrorMessage from './FormErrorMessage';
import { useCategories } from '../hooks/useCategories';
import { Category } from '../types/category';
import CategoryPill from './CategoryPill';
import ColorPicker from './ColorPicker';
import { createCategory, updateCategory, deleteCategory, checkCategoryUsage } from '../services/categoryService';
import { executeWrite, executeQuery } from '../services/database';
import { generateUUID } from '../utils/uuid';

interface FormCategorySelectorProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    helperText?: string;
    placeholder?: string;
    isRequired?: boolean;
    customErrorMessage?: string;
    showNoneOption?: boolean;
    onSelectCategory?: (newCategoryId: string | null) => void;
}

interface EditingCategory {
    id: string;
    title: string;
    color: string;
}

interface DeleteConfirmation {
    visible: boolean;
    category: Category | null;
    usageInfo: {
        isUsed: boolean;
        usage: {
            notes: number;
            sparks: number;
            actions: number;
            loops: number;
            paths: number;
        };
        totalUsage: number;
    } | null;
}

const FormCategorySelector = <T extends FieldValues>({
    name,
    control,
    label,
    helperText,
    placeholder,
    isRequired,
    customErrorMessage,
    showNoneOption,
    onSelectCategory,
}: FormCategorySelectorProps<T>) => {
    const { theme } = useTheme();
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategoryTitle, setNewCategoryTitle] = useState('');
    const [selectedColor, setSelectedColor] = useState('#FF5733');
    const [isCreating, setIsCreating] = useState(false);

    // Edit/Delete states
    const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
        visible: false,
        category: null,
        usageInfo: null,
    });
    const [longPressedCategory, setLongPressedCategory] = useState<string | null>(null);

    // Debug the hook
    console.log('-------- FormCategorySelector RENDERING --------');

    // Extract and log all properties from useCategories
    const categoriesHook = useCategories();
    console.log('useCategories hook returned:', {
        categories: categoriesHook.categories?.length || 0,
        loading: categoriesHook.loading,
        error: categoriesHook.error?.message,
        addCategory: typeof categoriesHook.addCategory,
        loadCategories: typeof categoriesHook.loadCategories,
        editCategory: typeof categoriesHook.editCategory,
        removeCategory: typeof categoriesHook.removeCategory,
        getCategory: typeof categoriesHook.getCategory
    });

    const { categories, loading, error, loadCategories, addCategory, editCategory, removeCategory } = categoriesHook;

    console.log('Destructured from hook:', {
        categoriesLength: categories?.length || 0,
        loading,
        error: error?.message,
        addCategoryType: typeof addCategory,
        loadCategoriesType: typeof loadCategories
    });

    const { control: categoryFormControl, handleSubmit: handleCategorySubmit } = useForm({
        defaultValues: {
            title: '',
            color: '#FF5733',
        },
    });

    useEffect(() => {
        if (!categories || categories.length === 0) {
            loadCategories();
        }
    }, []);

    // Add a function for direct category creation
    const createCategoryDirectly = async (title: string, color: string) => {
        console.log('ATTEMPTING DIRECT CATEGORY CREATION');
        console.log('Params:', { title, color });

        try {
            // Generate UUID and timestamps
            const id = generateUUID();
            const now = new Date().toISOString();
            console.log('Generated values:', { id, now });

            // Insert directly with executeWrite
            console.log('Executing direct SQL insertion...');
            const result = await executeWrite(
                'INSERT INTO categories (id, title, color, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
                [id, title, color, now, now]
            );

            console.log('Direct insertion result:', result);

            if (result.changes <= 0) {
                console.error('Direct insertion failed - no rows affected');
                return null;
            }

            // Query to verify the category was created
            console.log('Verifying category was created...');
            const categories = await executeQuery(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );
            console.log('Verification result:', categories);

            if (categories.length === 0) {
                console.error('Category verification failed - not found after insertion');
                return null;
            }

            // Create the category object
            const newCategory = {
                id,
                title,
                color,
                createdAt: now,
                updatedAt: now
            };

            console.log('Category created directly:', newCategory);
            return newCategory;
        } catch (error) {
            console.error('Error in direct category creation:', error);
            const errorDetails = error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : {
                message: 'Unknown error',
                stack: 'No stack trace available'
            };
            console.error('Error details:', errorDetails);
            return null;
        }
    };

    // Update the handleCreateButtonPress function to attempt both methods
    const handleCreateButtonPress = () => {
        console.log('CREATE CATEGORY BUTTON PRESSED');
        console.log('Current state:', {
            newCategoryTitle,
            selectedColor,
            isCreating
        });

        if (isCreating) {
            console.log('Already creating a category, ignoring press');
            return;
        }

        console.log('Calling handleCreateCategory function');
        handleCreateCategory()
            .then(result => {
                console.log('handleCreateCategory resolved with:', result);
                if (!result) {
                    console.log('Standard method failed, trying direct database approach');
                    return createCategoryDirectly(newCategoryTitle.trim(), selectedColor);
                }
                return result;
            })
            .then(finalResult => {
                console.log('Final creation result:', finalResult);
                if (finalResult) {
                    // If we have a result from either method, select it
                    if (onSelectCategory) {
                        onSelectCategory(finalResult.id);
                        // Update form control value using Controller's onChange
                        // We'll handle this in the Controller component itself
                    }

                    // Reset form state
                    setShowCreateCategory(false);
                    setNewCategoryTitle('');
                    loadCategories(); // Reload categories
                }
            })
            .catch(err => {
                console.error('Category creation completely failed:', err);
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                Alert.alert('Error', `Failed to create category: ${errorMessage}`);
            })
            .finally(() => {
                // Always ensure loading state is reset
                setIsCreating(false);
            });
    };

    const handleCreateCategory = async () => {
        console.log('handleCreateCategory STARTED');

        if (!newCategoryTitle.trim()) {
            console.log('Category title is empty, showing alert');
            Alert.alert('Error', 'Please enter a category title');
            return null;
        }

        try {
            console.log('Setting isCreating to true');
            setIsCreating(true);
            console.log('Creating category:', { title: newCategoryTitle.trim(), color: selectedColor });

            console.log('Calling addCategory function from useCategories hook');
            console.log('addCategory function type:', typeof addCategory);

            // Check if addCategory is actually a function
            if (typeof addCategory !== 'function') {
                console.error('addCategory is not a function!', addCategory);
                Alert.alert('Error', 'Internal error: addCategory is not available');
                setIsCreating(false);
                return null;
            }

            // Use the addCategory function from useCategories hook
            const newCategory = await addCategory(newCategoryTitle.trim(), selectedColor);

            console.log('Category created:', newCategory);
            console.log('Resetting creation state');
            setIsCreating(false);
            setShowCreateCategory(false);
            setNewCategoryTitle('');

            // Select the newly created category if available and callback exists
            if (newCategory && onSelectCategory) {
                console.log('Selecting newly created category');
                onSelectCategory(newCategory.id);
                // Update form control value using Controller's onChange
                // We'll handle this in the Controller component itself
            } else {
                console.log('Not selecting category:', {
                    newCategoryExists: !!newCategory,
                    callbackExists: !!onSelectCategory
                });
            }

            return newCategory;
        } catch (error) {
            console.error('Error creating category in try/catch:', error);
            setIsCreating(false);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to create category: ${errorMessage}`);
            return null;
        }
    };

    // Edit category functionality
    const handleEditCategory = (category: Category) => {
        setEditingCategory({
            id: category.id,
            title: category.title,
            color: category.color,
        });
        setShowEditModal(true);
        setLongPressedCategory(null);
    };

    const handleSaveEdit = async () => {
        if (!editingCategory) return;

        if (!editingCategory.title.trim()) {
            Alert.alert('Error', 'Category title cannot be empty');
            return;
        }

        try {
            const success = await editCategory(
                editingCategory.id,
                editingCategory.title.trim(),
                editingCategory.color
            );

            if (success) {
                setShowEditModal(false);
                setEditingCategory(null);
                Alert.alert('Success', 'Category updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Alert.alert('Error', 'Failed to update category');
        }
    };

    // Delete category functionality
    const handleDeleteCategory = async (category: Category) => {
        try {
            const usage = await checkCategoryUsage(category.id);
            setDeleteConfirmation({
                visible: true,
                category,
                usageInfo: usage,
            });
            setLongPressedCategory(null);
        } catch (error) {
            console.error('Error checking category usage:', error);
            Alert.alert('Error', 'Failed to check category usage');
        }
    };

    const confirmDeleteCategory = async () => {
        if (!deleteConfirmation.category) return;

        try {
            const success = await removeCategory(deleteConfirmation.category.id);
            if (success) {
                setDeleteConfirmation({ visible: false, category: null, usageInfo: null });
                Alert.alert('Success', 'Category deleted successfully');
            } else {
                Alert.alert('Error', 'Failed to delete category');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            Alert.alert('Error', 'Failed to delete category');
        }
    };

    const getDeleteMessage = () => {
        if (!deleteConfirmation.category || !deleteConfirmation.usageInfo) {
            return '';
        }

        const { category } = deleteConfirmation;
        const { usageInfo } = deleteConfirmation;

        if (usageInfo.isUsed) {
            const usageDetails = [];
            if (usageInfo.usage.notes > 0) usageDetails.push(`${usageInfo.usage.notes} notes`);
            if (usageInfo.usage.sparks > 0) usageDetails.push(`${usageInfo.usage.sparks} sparks`);
            if (usageInfo.usage.actions > 0) usageDetails.push(`${usageInfo.usage.actions} actions`);
            if (usageInfo.usage.loops > 0) usageDetails.push(`${usageInfo.usage.loops} loops`);
            if (usageInfo.usage.paths > 0) usageDetails.push(`${usageInfo.usage.paths} paths`);

            return `This category is currently being used by ${usageDetails.join(', ')}.\n\nDeleting it will remove the category from all these entries. Are you sure you want to continue?`;
        } else {
            return `Are you sure you want to delete "${category.title}"? This action cannot be undone.`;
        }
    };

    const styles = useStyles((theme) => ({
        container: {
            marginBottom: 16,
        },
        label: {
            marginBottom: 8,
            fontWeight: '500',
        },
        required: {
            color: theme.colors.error,
        },
        helperText: {
            marginBottom: 8,
            color: theme.colors.textSecondary,
        },
        categoriesContainer: {
            flexDirection: 'row' as const,
            marginBottom: 8,
        },
        categoriesContentContainer: {
            paddingVertical: 8,
        },
        categoryPillContainer: {
            marginRight: 8,
            borderRadius: 100,
            borderWidth: 2,
            borderColor: 'transparent',
            position: 'relative',
        },
        selectedPill: {
            borderColor: theme.colors.primary,
        },
        pill: {
            marginBottom: 0,
        },
        categoryActionsContainer: {
            position: 'absolute',
            top: -8,
            right: -8,
            flexDirection: 'row',
            gap: 2,
        },
        actionButton: {
            width: 20,
            height: 20,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        editActionButton: {
            backgroundColor: theme.colors.primary + '15',
            borderColor: theme.colors.primary,
        },
        deleteActionButton: {
            backgroundColor: theme.colors.error + '15',
            borderColor: theme.colors.error,
        },
        addCategoryButton: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 100,
            borderWidth: 1,
            borderStyle: 'dashed' as const,
            borderColor: theme.colors.border,
            marginRight: 8,
        },
        addCategoryText: {
            color: theme.colors.primary,
        },
        loadingContainer: {
            flexDirection: 'row' as const,
            alignItems: 'center',
            marginBottom: 16,
        },
        errorContainer: {
            marginBottom: 16,
        },
        errorText: {
            color: theme.colors.error,
        },
        createCategoryContainer: {
            marginBottom: 16,
            paddingBottom: 16,
        },
        sectionTitle: {
            marginBottom: 16,
        },
        formGroup: {
            marginBottom: 16,
        },
        inputLabel: {
            marginBottom: 8,
        },
        textInput: {
            height: 40,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 8,
        },
        colorPicker: {
            marginTop: 8,
            minHeight: 200,
        },
        buttonContainer: {
            marginTop: 16,
        },
        createButton: {
            width: '100%',
        },
        nonePill: {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        noneText: {
            color: theme.colors.textSecondary,
        },
        // Edit Modal Styles
        editModalOverlay: {
            flex: 1,
            backgroundColor: theme.colors.overlay,
            justifyContent: 'center',
            alignItems: 'center',
        },
        editModalContainer: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.l,
            width: '90%',
            maxWidth: 400,
            shadowColor: theme.colors.shadow,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 10,
        },
        editModalHeader: {
            padding: theme.spacing.l,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        editModalTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        editModalContent: {
            padding: theme.spacing.l,
        },
        editModalFooter: {
            flexDirection: 'row',
            padding: theme.spacing.l,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            gap: theme.spacing.m,
        },
        modalButton: {
            flex: 1,
        },
        editFormGroup: {
            marginBottom: theme.spacing.l,
        },
        editLabel: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.s,
        },
        editTextInput: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            fontSize: 16,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
        },
        editColorPickerContainer: {
            marginTop: theme.spacing.s,
        },
    }));

    const renderCategorySelector = () => (
        <ScrollView style={styles.categoriesContainer}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContentContainer}
        >
            <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowCreateCategory(true)}
            >
                <Typography variant="body2" style={styles.addCategoryText}>
                    + Create Category
                </Typography>
            </TouchableOpacity>

            {categories.map((category) => (
                <Controller
                    key={category.id}
                    control={control}
                    name={name}
                    render={({ field: { onChange, value } }) => (
                        <View style={[
                            styles.categoryPillContainer,
                            value?.id === category.id && styles.selectedPill,
                        ]}>
                            <TouchableOpacity
                                onPress={() => {
                                    // If this category is already selected, deselect it
                                    if (value?.id === category.id) {
                                        onChange(null);
                                        if (onSelectCategory) onSelectCategory(null);
                                    } else {
                                        onChange(category);
                                        if (onSelectCategory) onSelectCategory(category.id);
                                    }
                                }}
                                onLongPress={() => setLongPressedCategory(category.id)}
                            >
                                <CategoryPill
                                    title={category.title}
                                    color={category.color}
                                    style={styles.pill}
                                />
                            </TouchableOpacity>

                            {/* Show action buttons when long pressed */}
                            {longPressedCategory === category.id && (
                                <View style={styles.categoryActionsContainer}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.editActionButton]}
                                        onPress={() => handleEditCategory(category)}
                                    >
                                        <Icon name="pencil" width={10} height={10} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteActionButton]}
                                        onPress={() => handleDeleteCategory(category)}
                                    >
                                        <Icon name="trash" width={10} height={10} color={theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                />
            ))}
        </ScrollView>
    );

    const renderCreateCategoryForm = () => (
        <View style={styles.createCategoryContainer}>
            <Typography variant="h3" style={styles.sectionTitle}>Create New Category</Typography>

            <View style={styles.formGroup}>
                <Typography variant="body2" style={styles.inputLabel}>Title</Typography>
                <TextInput
                    style={styles.textInput}
                    placeholder="Category title"
                    value={newCategoryTitle}
                    onChangeText={setNewCategoryTitle}
                />
            </View>

            <View style={styles.formGroup}>
                <Typography variant="body2" style={styles.inputLabel}>Color</Typography>
                <ColorPicker
                    selectedColor={selectedColor}
                    onColorSelected={setSelectedColor}
                    style={styles.colorPicker}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    label={isCreating ? 'Creating...' : 'Create Category'}
                    onPress={handleCreateButtonPress}
                    isLoading={isCreating}
                    disabled={isCreating || !newCategoryTitle.trim()}
                    style={styles.createButton}
                />
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Typography variant="body2">Loading categories...</Typography>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Typography variant="body2" style={styles.errorText}>
                    Error loading categories. Please try again.
                </Typography>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {label && (
                <Typography variant="body2" style={styles.label}>
                    {label} {isRequired && <Typography style={styles.required}>*</Typography>}
                </Typography>
            )}

            {helperText && (
                <Typography variant="caption" style={styles.helperText}>
                    {helperText}
                </Typography>
            )}

            {/* Tap outside to close action buttons */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => setLongPressedCategory(null)}
                style={{ flex: 1 }}
            >
                {showCreateCategory ? renderCreateCategoryForm() : renderCategorySelector()}
            </TouchableOpacity>

            <Controller
                control={control}
                name={name}
                rules={{ required: isRequired }}
                render={({ fieldState: { error } }) => (
                    <FormErrorMessage
                        message={error ? (customErrorMessage || 'Please select a category') : undefined}
                        visible={!!error}
                    />
                )}
            />

            {/* Edit Category Modal */}
            <Modal
                visible={showEditModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEditModal(false)}
            >
                <TouchableOpacity
                    style={styles.editModalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowEditModal(false)}
                >
                    <TouchableOpacity
                        style={styles.editModalContainer}
                        activeOpacity={1}
                        onPress={e => e.stopPropagation()}
                    >
                        <View style={styles.editModalHeader}>
                            <Typography style={styles.editModalTitle}>Edit Category</Typography>
                        </View>

                        <View style={styles.editModalContent}>
                            <View style={styles.editFormGroup}>
                                <Typography style={styles.editLabel}>Category Name</Typography>
                                <TextInput
                                    style={styles.editTextInput}
                                    value={editingCategory?.title || ''}
                                    onChangeText={(text) =>
                                        setEditingCategory(prev => prev ? { ...prev, title: text } : null)
                                    }
                                    placeholder="Enter category name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                            </View>

                            <View style={styles.editFormGroup}>
                                <Typography style={styles.editLabel}>Color</Typography>
                                <View style={styles.editColorPickerContainer}>
                                    <ColorPicker
                                        selectedColor={editingCategory?.color || '#FF5733'}
                                        onColorSelected={(color) =>
                                            setEditingCategory(prev => prev ? { ...prev, color } : null)
                                        }
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.editModalFooter}>
                            <Button
                                label="Cancel"
                                variant="outline"
                                onPress={() => {
                                    setShowEditModal(false);
                                    setEditingCategory(null);
                                }}
                                style={styles.modalButton}
                            />
                            <Button
                                label="Save Changes"
                                variant="primary"
                                onPress={handleSaveEdit}
                                style={styles.modalButton}
                            />
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                visible={deleteConfirmation.visible}
                title="Delete Category"
                message={getDeleteMessage()}
                icon="trash"
                isDestructive={true}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDeleteCategory}
                onCancel={() => setDeleteConfirmation({ visible: false, category: null, usageInfo: null })}
            />
        </View>
    );
};

export default FormCategorySelector;