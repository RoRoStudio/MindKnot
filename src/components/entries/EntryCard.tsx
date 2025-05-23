// src/components/entries/EntryCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Category } from '../../types/category';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, IconName } from '../common';
import { Typography } from '../common';
import { LabelRow } from '../shared/LabelRow';
import { CategoryPill } from '../shared/CategoryPill';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { RootStackParamList } from '../../types/navigation-types';
import { getCategoryById } from '../../api/categoryService';
import { generateUUID } from '../../utils/uuidUtil';

// Import all the services
import { updateNote, createNote, deleteNote, getNoteById } from '../../api/noteService';
import { updateSpark, createSpark, deleteSpark, getSparkById } from '../../api/sparkService';
import { updateAction, createAction, deleteAction, getActionById } from '../../api/actionService';
import { updatePath, createPath, getPathById, deletePath } from '../../api/pathService';
import { updateLoop, createLoop, getLoopById, deleteLoop } from '../../api/loopService';

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
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [showActions, setShowActions] = useState(false);
    const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

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
            navigation.navigate(navigationScreen, {
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
                return {
                    update: updateLoop,
                    create: createLoop,
                    delete: deleteLoop,
                    getById: getLoopById
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
                        borderTopColor: borderColor,
                        borderLeftColor: borderColor,
                        borderRightColor: borderColor,
                        borderBottomColor: borderColor,
                    }
                ]}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            {showCheckbox && (
                                <TouchableOpacity
                                    onPress={onCheckboxPress}
                                    style={styles.checkboxContainer}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        checkboxChecked && {
                                            backgroundColor: borderColor,
                                            borderColor: borderColor
                                        }
                                    ]}>
                                        {checkboxChecked && (
                                            <Icon name="check" width={14} height={14} color="#FFFFFF" />
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

                                {done && (
                                    <View style={[styles.doneIndicator, { backgroundColor: borderColor }]} />
                                )}

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

                                {categoryInfo && (
                                    <CategoryPill
                                        title={categoryInfo.title}
                                        color={categoryInfo.color}
                                        size="small"
                                        style={styles.categoryPill}
                                    />
                                )}

                                {dueDate && (
                                    <View style={styles.dueDateContainer}>
                                        <Icon name="calendar" width={16} height={16} color="#6B7280" />
                                        <Text style={styles.dueDateText}>
                                            Target: {formatDueDate(dueDate)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.metaContainer}>
                                    <Text style={styles.dateText}>
                                        {formatDate(createdAt)}
                                    </Text>
                                    {isStarred && (
                                        <Icon name="star" width={16} height={16} color="#FFB800" style={styles.starIcon} />
                                    )}
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
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={toggleMenu}
                                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                                style={styles.moreButton}
                            >
                                <Icon name="ellipsis-vertical" width={24} height={24} color="#9CA3AF" />
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
                            <Icon name={isStarred ? "star" : "star-off"} width={16} height={16} color="#6B7280" />
                            <Text style={styles.actionMenuItemText}>{isStarred ? "Unstar" : "Star"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={handleDuplicateAction}
                            disabled={isProcessing}
                        >
                            <Icon name="copy" width={16} height={16} color="#6B7280" />
                            <Text style={styles.actionMenuItemText}>Duplicate</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionMenuItem}
                            onPress={handleHideAction}
                            disabled={isProcessing}
                        >
                            <Icon name="eye-off" width={16} height={16} color="#6B7280" />
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
                            <Icon name="trash" width={16} height={16} color="#DC2626" />
                            <Text style={[styles.actionMenuItemText, { color: '#DC2626' }]}>Delete</Text>
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        position: 'relative',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 4,
        padding: 16,
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
        color: '#111827',
        marginBottom: 4,
        lineHeight: 24,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    doneIndicator: {
        position: 'absolute',
        top: 2,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
        lineHeight: 18,
    },
    description: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    categoryPill: {
        marginTop: 4,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dueDateText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
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
        padding: 4,
    },
    expandedContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionsMenu: {
        position: 'absolute',
        top: 40,
        right: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        padding: 8,
        zIndex: 10,
        minWidth: 140,
    },
    actionMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 4,
    },
    actionMenuItemText: {
        fontSize: 14,
        color: '#4B5563',
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
        borderColor: '#D1D5DB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subTaskCounter: {
        backgroundColor: '#E5E7EB',
        borderRadius: 999,
        paddingHorizontal: 6,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 4,
    },
    subTaskCounterText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
});