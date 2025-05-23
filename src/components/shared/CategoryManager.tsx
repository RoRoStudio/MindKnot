import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    RefreshControl,
    Modal,
} from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { Typography, Button, Card, Icon, ConfirmationModal } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import ColorPicker from './ColorPicker';
import { Category } from '../../types/category';
import {
    getAllCategories,
    updateCategory,
    deleteCategory,
    checkCategoryUsage,
    cleanupTestCategories
} from '../../api/categoryService';

interface CategoryManagerProps {
    onCategoryUpdated?: () => void;
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

const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryUpdated }) => {
    const { theme } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
        visible: false,
        category: null,
        usageInfo: null,
    });
    const [showCleanupConfirmation, setShowCleanupConfirmation] = useState(false);

    const styles = useStyles((theme) => ({
        container: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        cleanupButton: {
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        scrollContainer: {
            flex: 1,
            paddingHorizontal: theme.spacing.m,
        },
        categoryCard: {
            marginBottom: theme.spacing.m,
            borderRadius: theme.shape.radius.l,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        },
        categoryContent: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
        },
        colorIndicator: {
            width: 24,
            height: 24,
            borderRadius: 12,
            marginRight: theme.spacing.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        categoryInfo: {
            flex: 1,
        },
        categoryTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: 2,
        },
        categoryMeta: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        actionsContainer: {
            flexDirection: 'row',
            gap: theme.spacing.s,
        },
        actionButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
        },
        editButton: {
            backgroundColor: theme.colors.primary + '15',
        },
        deleteButton: {
            backgroundColor: theme.colors.error + '15',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
        },
        emptyText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.m,
        },
        // Edit Modal Styles
        editModalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        editModalContainer: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.l,
            width: '90%',
            maxWidth: 400,
            shadowColor: '#000',
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
        formGroup: {
            marginBottom: theme.spacing.l,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.s,
        },
        textInput: {
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.m,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.m,
            fontSize: 16,
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
        },
        colorPickerContainer: {
            marginTop: theme.spacing.s,
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
    }));

    const loadCategories = async () => {
        try {
            setLoading(true);
            const categoriesData = await getAllCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadCategories();
        setRefreshing(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleEditCategory = (category: Category) => {
        setEditingCategory({
            id: category.id,
            title: category.title,
            color: category.color,
        });
        setShowEditModal(true);
    };

    const handleDeleteCategory = async (category: Category) => {
        try {
            // Check if category is being used
            const usage = await checkCategoryUsage(category.id);
            setDeleteConfirmation({
                visible: true,
                category,
                usageInfo: usage,
            });
        } catch (error) {
            console.error('Error checking category usage:', error);
            Alert.alert('Error', 'Failed to check category usage');
        }
    };

    const confirmDeleteCategory = async () => {
        if (!deleteConfirmation.category) return;

        try {
            const success = await deleteCategory(deleteConfirmation.category.id);
            if (success) {
                await loadCategories();
                onCategoryUpdated?.();
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

    const handleSaveEdit = async () => {
        if (!editingCategory) return;

        if (!editingCategory.title.trim()) {
            Alert.alert('Error', 'Category title cannot be empty');
            return;
        }

        try {
            const success = await updateCategory(
                editingCategory.id,
                editingCategory.title.trim(),
                editingCategory.color
            );

            if (success) {
                setShowEditModal(false);
                setEditingCategory(null);
                await loadCategories();
                onCategoryUpdated?.();
                Alert.alert('Success', 'Category updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update category');
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Alert.alert('Error', 'Failed to update category');
        }
    };

    const handleCleanupTestCategories = async () => {
        try {
            const result = await cleanupTestCategories();
            await loadCategories();
            onCategoryUpdated?.();
            setShowCleanupConfirmation(false);

            if (result.errors.length > 0) {
                Alert.alert(
                    'Cleanup Complete',
                    `Deleted ${result.deleted} test categories.\n\nSkipped: ${result.errors.length} categories\n\n${result.errors.join('\n')}`
                );
            } else {
                Alert.alert('Success', `Deleted ${result.deleted} test categories`);
            }
        } catch (error) {
            console.error('Cleanup error:', error);
            Alert.alert('Error', 'Failed to cleanup test categories');
        }
    };

    const renderCategoryCard = (category: Category) => (
        <Card key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryContent}>
                <View style={[styles.colorIndicator, { backgroundColor: category.color }]} />
                <View style={styles.categoryInfo}>
                    <Typography style={styles.categoryTitle}>{category.title}</Typography>
                    <Typography style={styles.categoryMeta}>
                        Created {new Date(category.createdAt).toLocaleDateString()}
                    </Typography>
                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => handleEditCategory(category)}
                    >
                        <Icon name="pencil" width={16} height={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteCategory(category)}
                    >
                        <Icon name="trash" width={16} height={16} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Typography style={styles.headerTitle}>Category Management</Typography>
                <Button
                    label="Cleanup Tests"
                    variant="outline"
                    onPress={() => setShowCleanupConfirmation(true)}
                    style={styles.cleanupButton}
                />
            </View>

            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {categories.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="tag" width={48} height={48} color={theme.colors.textSecondary} />
                        <Typography style={styles.emptyText}>
                            No categories found.{'\n'}Create some categories to get started!
                        </Typography>
                    </View>
                ) : (
                    categories.map(renderCategoryCard)
                )}
            </ScrollView>

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
                            <View style={styles.formGroup}>
                                <Typography style={styles.label}>Category Name</Typography>
                                <TextInput
                                    style={styles.textInput}
                                    value={editingCategory?.title || ''}
                                    onChangeText={(text) =>
                                        setEditingCategory(prev => prev ? { ...prev, title: text } : null)
                                    }
                                    placeholder="Enter category name"
                                    placeholderTextColor={theme.colors.textSecondary}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Typography style={styles.label}>Color</Typography>
                                <View style={styles.colorPickerContainer}>
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

            {/* Cleanup Confirmation Modal */}
            <ConfirmationModal
                visible={showCleanupConfirmation}
                title="Cleanup Test Categories"
                message="This will remove all categories that appear to be test data. Categories that are currently in use will be skipped. Continue?"
                icon="trash"
                isDestructive={true}
                confirmText="Cleanup"
                cancelText="Cancel"
                onConfirm={handleCleanupTestCategories}
                onCancel={() => setShowCleanupConfirmation(false)}
            />
        </View>
    );
};

export default CategoryManager; 