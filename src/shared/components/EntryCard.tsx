// src/components/entries/EntryCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Category } from '../types/category';
import { useTheme } from '../../app/contexts/ThemeContext';
import { Icon, IconName } from './';
import { Typography } from './';
import { LabelRow } from './LabelRow';
import { CategoryPill } from './CategoryPill';
import { ConfirmationModal } from './ConfirmationModal';
import { RootStackParamList } from '../types/navigation';
import { getCategoryById } from '../services/categoryService';
import { generateUUID } from '../utils/uuid';

// Import all the services
import { updateNote, createNote, deleteNote, getNoteById } from '../../features/notes/hooks/useNoteService';
import { updateSpark, createSpark, deleteSpark, getSparkById } from '../../features/sparks/hooks/useSparkService';
import { updateAction, createAction, deleteAction, getActionById } from '../../features/actions/hooks/useActionService';
import { updatePath, createPath, getPathById, deletePath } from '../../features/paths/hooks/usePathService';
// TODO: Re-implement loop service in Phase 3
// import { updateLoop, createLoop, getLoopById, deleteLoop } from '../../features/loops/hooks/useLoopService';

interface EntryCardProps {
    id: string;
    title: string;
    description?: string;
    iconName: IconName;
    borderColor: string;
    createdAt: string;
    tags?: string[];
    categoryId?: string;
    onPress?: () => void;
    isStarred?: boolean;
    isHidden?: boolean;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onHide?: (id: string) => void;
    onDelete?: (id: string) => void;
    // Entry type for API calls
    entryType: 'note' | 'spark' | 'action' | 'path' | 'loop';
    // Callback for when entry is updated (for parent to refresh)
    onEntryUpdated?: () => void;
    // Expandable section props
    expandable?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
    expandedContent?: React.ReactNode;
    // Entry type specific props
    subtitle?: string;
    dueDate?: string;
    done?: boolean;
    // Navigation
    navigationScreen?: keyof RootStackParamList;
    navigationParams?: any;
    // Checkbox functionality for ActionCard
    showCheckbox?: boolean;
    checkboxChecked?: boolean;
    onCheckboxPress?: () => void;
    // Sub-task counter for ActionCard
    subTaskCounter?: string;
    // Show created date only for certain entry types
    showCreatedDate?: boolean;
    // Link information for general linking system
    linkedTo?: {
        type: string;
        id: string;
        label?: string;
    };
}

export const EntryCard: React.FC<EntryCardProps> = ({
    id,
    title,
    description,
    iconName,
    borderColor,
    createdAt,
    tags,
    categoryId,
    onPress,
    isStarred = false,
    isHidden = false,
    onStar,
    onDuplicate,
    onHide,
    onDelete,
    entryType,
    onEntryUpdated,
    expandable = false,
    expanded = false,
    onToggleExpand,
    expandedContent,
    subtitle,
    dueDate,
    done = false,
    navigationScreen,
    navigationParams,
    showCheckbox = false,
    checkboxChecked = false,
    onCheckboxPress,
    subTaskCounter,
    showCreatedDate = true,
    linkedTo,
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showActions, setShowActions] = useState(false);
    const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Create styles inside component to access theme
    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
            position: 'relative',
        },
        card: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.l,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderBottomWidth: 4,
            borderTopColor: theme.colors.border,
            borderLeftColor: theme.colors.border,
            borderRightColor: theme.colors.border,
            padding: theme.spacing.m,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        headerLeft: {
            flexDirection: 'row',
            flex: 1,
            alignItems: 'flex-start',
        },
        headerRight: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 8,
            flexShrink: 0,
        },
        contentContainer: {
            flex: 1,
            position: 'relative',
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 4,
            lineHeight: 24,
        },
        titleCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textDisabled,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 4,
            lineHeight: 18,
        },
        description: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: 8,
            lineHeight: 20,
        },
        pillsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            marginBottom: 8,
            gap: 8,
        },
        categoryPill: {
            alignSelf: 'flex-start',
        },
        linkPill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: theme.shape.radius.l,
            alignSelf: 'flex-start',
        },
        linkIcon: {
            marginRight: 4,
        },
        linkText: {
            fontSize: 11,
            fontWeight: '500',
            color: theme.colors.textSecondary,
        },
        dueDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        dueDateText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginLeft: 4,
        },
        metaContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        leftMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        rightMeta: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateText: {
            fontSize: 12,
            color: theme.colors.textDisabled,
        },
        starIcon: {
            marginLeft: 8,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        expandButton: {
            marginRight: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        moreButton: {
            padding: theme.spacing.xs,
        },
        expandedContainer: {
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        actionsMenu: {
            position: 'absolute',
            top: 40,
            right: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
            padding: theme.spacing.s,
            zIndex: 10,
            minWidth: 140,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionMenuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.s,
            borderRadius: theme.shape.radius.s,
        },
        actionMenuItemText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginLeft: 8,
        },
        checkboxContainer: {
            marginTop: 4,
            marginRight: 12,
            flexShrink: 0,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.s,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        subTaskCounter: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.pill,
            paddingHorizontal: 6,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 4,
        },
        subTaskCounterText: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.colors.textSecondary,
        },
    });

    // Fetch category info when categoryId changes
    useEffect(() => {
        const fetchCategoryInfo = async () => {
            if (categoryId) {
                try {
                    const category = await getCategoryById(categoryId);
                    setCategoryInfo(category);
                } catch (error) {
                    console.error('Error fetching category:', error);
                    setCategoryInfo(null);
                }
            } else {
                setCategoryInfo(null);
            }
        };

        fetchCategoryInfo();
    }, [categoryId]);

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (navigationScreen) {
            (navigation as any).navigate(navigationScreen, {
                mode: 'view',
                id: id,
                ...navigationParams
            });
        }
    };

    const handleToggleExpand = () => {
        if (expandable && onToggleExpand) {
            onToggleExpand();
        }
    };

    const toggleMenu = () => {
        setShowActions(!showActions);
    };

    // Get the appropriate service functions based on entry type
    const getServiceFunctions = () => {
        switch (entryType) {
            case 'note':
                return {
                    update: updateNote,
                    create: createNote,
                    delete: deleteNote,
                    getById: getNoteById
                };
            case 'spark':
                return {
                    update: updateSpark,
                    create: createSpark,
                    delete: deleteSpark,
                    getById: getSparkById
                };
            case 'action':
                return {
                    update: updateAction,
                    create: createAction,
                    delete: deleteAction,
                    getById: getActionById
                };
            case 'path':
                return {
                    update: updatePath,
                    create: createPath,
                    delete: deletePath,
                    getById: getPathById
                };
            case 'loop':
                // TODO: Re-implement when loops are available
                return {
                    update: async () => {
                        console.warn('Loop operations not available - loops are being re-implemented');
                        return false;
                    },
                    create: async () => {
                        console.warn('Loop operations not available - loops are being re-implemented');
                        return false;
                    },
                    delete: async () => {
                        console.warn('Loop operations not available - loops are being re-implemented');
                        return false;
                    },
                    getById: async () => {
                        console.warn('Loop operations not available - loops are being re-implemented');
                        return null;
                    }
                };
            default:
                throw new Error(`Unsupported entry type: ${entryType}`);
        }
    };

    // Handle star action
    const handleStarAction = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setShowActions(false);

        try {
            const { update } = getServiceFunctions();
            const success = await update(id, { starred: !isStarred } as any);

            if (success) {
                if (onStar) {
                    onStar(id);
                } else if (onEntryUpdated) {
                    onEntryUpdated();
                }
            } else {
                Alert.alert('Error', 'Failed to update star status');
            }
        } catch (error) {
            console.error('Error updating star status:', error);
            Alert.alert('Error', 'Failed to update star status');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle duplicate action
    const handleDuplicateAction = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setShowActions(false);

        try {
            const { getById, create } = getServiceFunctions();
            const originalEntry = await getById(id);

            if (!originalEntry) {
                Alert.alert('Error', 'Could not find original entry to duplicate');
                return;
            }

            // Create a copy with modified title and remove fields that shouldn't be copied
            const duplicateData: any = {
                ...originalEntry,
                title: `${originalEntry.title} (copy)`,
                starred: false, // Don't copy starred status
                hidden: false, // Don't copy hidden status
            };

            // Remove fields that shouldn't be copied
            if ('id' in duplicateData) delete duplicateData.id;
            if ('createdAt' in duplicateData) delete duplicateData.createdAt;
            if ('updatedAt' in duplicateData) delete duplicateData.updatedAt;
            if ('type' in duplicateData) delete duplicateData.type;
            if ('isStarred' in duplicateData) delete duplicateData.isStarred;

            await create(duplicateData);

            if (onDuplicate) {
                onDuplicate(id);
            } else if (onEntryUpdated) {
                onEntryUpdated();
            }
        } catch (error) {
            console.error('Error duplicating entry:', error);
            Alert.alert('Error', 'Failed to duplicate entry');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle hide action
    const handleHideAction = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setShowActions(false);

        try {
            const { update } = getServiceFunctions();
            const success = await update(id, { hidden: true } as any);

            if (success) {
                if (onHide) {
                    onHide(id);
                } else if (onEntryUpdated) {
                    onEntryUpdated();
                }
            } else {
                Alert.alert('Error', 'Failed to hide entry');
            }
        } catch (error) {
            console.error('Error hiding entry:', error);
            Alert.alert('Error', 'Failed to hide entry');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle delete action
    const handleDeleteAction = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setShowDeleteConfirmation(false);

        try {
            const { delete: deleteEntry } = getServiceFunctions();

            if (!deleteEntry) {
                Alert.alert('Error', 'Delete not supported for this entry type');
                return;
            }

            const success = await deleteEntry(id);

            if (success) {
                if (onDelete) {
                    onDelete(id);
                } else if (onEntryUpdated) {
                    onEntryUpdated();
                }
            } else {
                Alert.alert('Error', 'Failed to delete entry');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete entry');
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    };

    const formatDueDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    };

    // Don't render if hidden
    if (isHidden) {
        return null;
    }

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <View style={[
                    styles.card,
                    {
                        borderBottomColor: borderColor,
                    }
                ]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            {showCheckbox && (
                                <TouchableOpacity
                                    onPress={onCheckboxPress}
                                    style={styles.checkboxContainer}
                                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        checkboxChecked && {
                                            backgroundColor: borderColor,
                                            borderColor: borderColor
                                        }
                                    ]}>
                                        {checkboxChecked && (
                                            <Icon name="check" width={14} height={14} color={theme.colors.onPrimary} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}

                            <View style={styles.contentContainer}>
                                <Text style={[
                                    styles.title,
                                    done && styles.titleCompleted
                                ]}>
                                    {title}
                                </Text>

                                {subtitle && (
                                    <Text style={styles.subtitle}>
                                        {subtitle}
                                    </Text>
                                )}

                                {description && (
                                    <Text style={styles.description} numberOfLines={2}>
                                        {description}
                                    </Text>
                                )}

                                {/* Pills container for category and link pills */}
                                {(categoryInfo || linkedTo) && (
                                    <View style={styles.pillsContainer}>
                                        {categoryInfo && (
                                            <CategoryPill
                                                title={categoryInfo.title}
                                                color={categoryInfo.color}
                                                size="small"
                                                style={styles.categoryPill}
                                            />
                                        )}

                                        {linkedTo && (
                                            <View style={styles.linkPill}>
                                                <Icon
                                                    name="link"
                                                    width={12}
                                                    height={12}
                                                    color={theme.colors.textSecondary}
                                                    style={styles.linkIcon}
                                                />
                                                <Text style={styles.linkText}>
                                                    {linkedTo.label || `Linked to ${linkedTo.type}`}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {dueDate && (
                                    <View style={styles.dueDateContainer}>
                                        <Icon name="calendar" width={16} height={16} color={theme.colors.textSecondary} />
                                        <Text style={styles.dueDateText}>
                                            Target: {formatDueDate(dueDate)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.metaContainer}>
                                    <View style={styles.leftMeta}>
                                        {showCreatedDate && (
                                            <Text style={styles.dateText}>
                                                {formatDate(createdAt)}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.rightMeta}>
                                        {isStarred && (
                                            <Icon name="star" width={16} height={16} color={theme.colors.warning} />
                                        )}
                                    </View>
                                </View>

                                {tags && tags.length > 0 && (
                                    <View style={styles.tagsContainer}>
                                        <LabelRow
                                            labels={tags}
                                            size="small"
                                            maxLabelsToShow={3}
                                            gap={6}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={styles.headerRight}>
                            {expandable && (
                                <TouchableOpacity
                                    onPress={handleToggleExpand}
                                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                    style={styles.expandButton}
                                >
                                    {subTaskCounter && !expanded && (
                                        <View style={styles.subTaskCounter}>
                                            <Text style={styles.subTaskCounterText}>{subTaskCounter}</Text>
                                        </View>
                                    )}
                                    <Icon
                                        name={expanded ? "chevron-up" : "chevron-down"}
                                        width={24}
                                        height={24}
                                        color={theme.colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={toggleMenu}
                                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                style={styles.moreButton}
                            >
                                <Icon name="ellipsis-vertical" width={24} height={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {expanded && expandedContent && (
                        <View style={styles.expandedContainer}>
                            {expandedContent}
                        </View>
                    )}
                </View>

                {/* Actions Menu (Dropdown) */}
                {showActions && (
                    <View style={styles.actionsMenu}>
                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={handleStarAction}
                            disabled={isProcessing}
                        >
                            <Icon name={isStarred ? "star" : "star-off"} width={16} height={16} color={theme.colors.textSecondary} />
                            <Text style={styles.actionMenuItemText}>{isStarred ? "Unstar" : "Star"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={handleDuplicateAction}
                            disabled={isProcessing}
                        >
                            <Icon name="copy" width={16} height={16} color={theme.colors.textSecondary} />
                            <Text style={styles.actionMenuItemText}>Duplicate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={handleHideAction}
                            disabled={isProcessing}
                        >
                            <Icon name="eye-off" width={16} height={16} color={theme.colors.textSecondary} />
                            <Text style={styles.actionMenuItemText}>Hide</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={() => {
                                setShowActions(false);
                                setShowDeleteConfirmation(true);
                            }}
                            disabled={isProcessing}
                        >
                            <Icon name="trash" width={16} height={16} color={theme.colors.error} />
                            <Text style={[styles.actionMenuItemText, { color: theme.colors.error }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </TouchableOpacity>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                visible={showDeleteConfirmation}
                title="Delete Entry"
                message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
                icon="trash"
                isDestructive={true}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteAction}
                onCancel={() => setShowDeleteConfirmation(false)}
            />
        </>
    );
};