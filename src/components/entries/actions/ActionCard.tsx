// src/components/entries/actions/ActionCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Action } from '../../../types/action';
import { Category } from '../../../types/category';
import { ENTRY_TYPES, EntryType } from '../../../constants/entryTypes';
import { useTheme } from '../../../contexts/ThemeContext';
import { Icon } from '../../common';
import { Typography } from '../../common';
import { LabelRow } from '../../shared/LabelRow';
import { CategoryPill } from '../../shared/CategoryPill';
import { RootStackParamList } from '../../../types/navigation-types';
import { updateAction, getActionById } from '../../../api/actionService';
import { getCategoryById } from '../../../api/categoryService';
import { ConfirmationModal } from '../../shared/ConfirmationModal';

interface ActionCardProps {
    action: Action;
    onPress?: () => void;
    onToggleDone?: (id: string) => void;
    onStar?: (id: string) => void;
    onDuplicate?: (id: string) => void;
    onArchive?: (id: string) => void;
    onHide?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    action,
    onPress,
    onToggleDone,
    onStar,
    onDuplicate,
    onArchive,
    onHide
}) => {
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [expanded, setExpanded] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [newSubAction, setNewSubAction] = useState('');
    const [subTasks, setSubTasks] = useState(action.subTasks || []);
    const [isDone, setIsDone] = useState(action.done || false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
    const [editingSubTaskText, setEditingSubTaskText] = useState('');
    const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);

    const hasSubActions = subTasks && subTasks.length > 0;
    const inputRef = useRef<TextInput>(null);

    // Fetch category info when action.categoryId changes
    useEffect(() => {
        const fetchCategoryInfo = async () => {
            if (action.categoryId) {
                try {
                    const category = await getCategoryById(action.categoryId);
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
    }, [action.categoryId]);

    // Refresh data from database when action ID changes
    useEffect(() => {
        const refreshActionData = async () => {
            if (action.id) {
                try {
                    const refreshedAction = await getActionById(action.id);
                    if (refreshedAction && refreshedAction.subTasks) {
                        setSubTasks(refreshedAction.subTasks);
                        setIsDone(refreshedAction.done || false);
                    }
                } catch (error) {
                    console.error('Error refreshing action data:', error);
                }
            }
        };

        refreshActionData();
    }, [action.id]);

    // Focus on input when editing a sub-task
    useEffect(() => {
        if (editingSubTaskId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingSubTaskId]);

    // Count completed sub-tasks
    const completedSubTasks = subTasks.filter(task => task.completed).length;
    const totalSubTasks = subTasks.length;
    const hasIncompleteSubTasks = hasSubActions && completedSubTasks < totalSubTasks;

    const handleToggleDone = async (e: { stopPropagation: () => void }) => {
        e.stopPropagation();

        // If marking as complete and there are incomplete sub-tasks, show confirmation modal
        if (!isDone && hasIncompleteSubTasks) {
            setShowConfirmModal(true);
            return;
        }

        // Otherwise proceed with normal toggle
        await toggleActionCompletion();
    };

    const toggleActionCompletion = async (completeSubTasks = false) => {
        try {
            // Update local state immediately for responsive UI
            setIsDone(!isDone);

            let updatedSubTasks = [...subTasks];

            // If marking as complete AND completeSubTasks is true, mark all sub-tasks as complete
            if (!isDone && completeSubTasks) {
                updatedSubTasks = subTasks.map(task => ({
                    ...task,
                    completed: true
                }));
                setSubTasks(updatedSubTasks);
            }

            // Toggle done status in database
            const updatedAction = {
                ...action,
                done: !isDone,
                subTasks: updatedSubTasks
            };

            console.log('ActionCard: Updating action with done =', !isDone, 'and completeSubTasks =', completeSubTasks);

            const success = await updateAction(action.id, updatedAction);

            // If database update was successful, call onToggleDone to update parent state
            if (success && onToggleDone) {
                onToggleDone(action.id);
            } else if (!success) {
                // Revert local state if update failed
                console.error('ActionCard: Failed to update action in database');
                setIsDone(isDone);
                setSubTasks(subTasks);
            }
        } catch (error) {
            console.error('Error toggling action done status:', error);
            // Revert local state on error
            setIsDone(isDone);
            setSubTasks(subTasks);
        }
    };

    const handleToggleSubTaskDone = async (subTaskId: string) => {
        try {
            // Find the subtask and toggle its completed status
            const subTaskIndex = subTasks.findIndex(task => task.id === subTaskId);
            if (subTaskIndex === -1) return;

            const updatedSubTasks = [...subTasks];
            const isBeingMarkedIncomplete = updatedSubTasks[subTaskIndex].completed;

            // Toggle the subtask completion status
            updatedSubTasks[subTaskIndex] = {
                ...updatedSubTasks[subTaskIndex],
                completed: !updatedSubTasks[subTaskIndex].completed
            };

            // Update local state immediately
            setSubTasks(updatedSubTasks);

            // If main action is complete and a subtask is being marked incomplete,
            // also mark the main action as incomplete
            let shouldUpdateMainAction = false;
            if (isDone && isBeingMarkedIncomplete) {
                setIsDone(false);
                shouldUpdateMainAction = true;
            }

            // Update the action with new subtasks
            const updatedAction = {
                ...action,
                done: shouldUpdateMainAction ? false : isDone,
                subTasks: updatedSubTasks
            };

            const success = await updateAction(action.id, updatedAction);

            if (!success) {
                // Revert if the update failed
                setSubTasks(subTasks);
                if (shouldUpdateMainAction) {
                    setIsDone(true);
                }
            } else if (onToggleDone && shouldUpdateMainAction) {
                // Notify parent component that main action is now incomplete
                onToggleDone(action.id);
            }
        } catch (error) {
            console.error('Error toggling subtask completion:', error);
            // Revert on error
            setSubTasks(subTasks);
        }
    };

    const handlePress = () => {
        // Navigate to ActionScreen
        navigation.navigate('ActionScreen', {
            mode: 'view',
            id: action.id
        });
    };

    const handleToggleExpand = () => {
        setExpanded(!expanded);
    };

    const toggleMenu = () => {
        setShowActions(!showActions);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    };

    const addNewSubAction = async () => {
        if (!newSubAction.trim()) return;

        try {
            const newSubTask = {
                id: Date.now().toString(),
                text: newSubAction,
                completed: false
            };

            const updatedSubTasks = [...subTasks, newSubTask];

            // Update local state immediately
            setSubTasks(updatedSubTasks);
            setNewSubAction('');

            // Update the action with new subtasks
            const updatedAction = {
                ...action,
                subTasks: updatedSubTasks
            };

            const success = await updateAction(action.id, updatedAction);

            if (!success) {
                // Revert if update failed
                setSubTasks(subTasks);
            }
        } catch (error) {
            console.error('Error adding new subtask:', error);
            // Revert on error
            setSubTasks(subTasks);
        }
    };

    const startEditingSubTask = (subTaskId: string, currentText: string) => {
        setEditingSubTaskId(subTaskId);
        setEditingSubTaskText(currentText);
    };

    const saveSubTaskEdit = async () => {
        if (!editingSubTaskId) return;

        try {
            // Find the subtask and update its text
            const updatedSubTasks = subTasks.map(task =>
                task.id === editingSubTaskId
                    ? { ...task, text: editingSubTaskText.trim() || task.text }
                    : task
            );

            // Update local state
            setSubTasks(updatedSubTasks);

            // Update the action with new subtasks
            const updatedAction = {
                ...action,
                subTasks: updatedSubTasks
            };

            const success = await updateAction(action.id, updatedAction);

            if (!success) {
                // Revert if update failed
                setSubTasks(subTasks);
            }
        } catch (error) {
            console.error('Error updating subtask text:', error);
            setSubTasks(subTasks);
        } finally {
            // Reset editing state
            setEditingSubTaskId(null);
            setEditingSubTaskText('');
        }
    };

    // Handle modal confirm action
    const handleModalConfirm = () => {
        console.log('ActionCard: Modal confirmed, marking all sub-tasks as complete');
        setShowConfirmModal(false);
        toggleActionCompletion(true);
    };

    // Handle modal cancel action
    const handleModalCancel = () => {
        console.log('ActionCard: Modal cancelled');
        setShowConfirmModal(false);
        // Revert the checkbox state since we toggled it before showing the modal
        setIsDone(isDone);
    };

    // Fix the plus-circle icon
    const plusCircleIcon = <Icon name="circle-plus" width={20} height={20} color="#6B7280" />;

    // Handle quick actions
    const handleStar = () => {
        if (onStar) onStar(action.id);
    };

    const handleDuplicate = () => {
        if (onDuplicate) onDuplicate(action.id);
    };

    const handleArchive = () => {
        if (onArchive) onArchive(action.id);
    };

    const handleHide = () => {
        if (onHide) onHide(action.id);
    };

    // Render the expanded content with sub-actions
    const renderExpandedContent = () => (
        <View style={styles.subActionsContainer}>
            {hasSubActions && (
                <Text style={styles.subActionsHeading}>Sub-actions</Text>
            )}

            {subTasks.map((subTask) => (
                <View key={subTask.id} style={styles.subActionRow}>
                    <TouchableOpacity
                        onPress={() => handleToggleSubTaskDone(subTask.id)}
                        style={styles.subActionCheckboxContainer}
                    >
                        <View style={[
                            styles.subActionCheckbox,
                            subTask.completed && {
                                backgroundColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                                borderColor: ENTRY_TYPES[EntryType.ACTION].borderColor
                            }
                        ]}>
                            {subTask.completed && (
                                <Icon name="check" width={14} height={14} color="#FFFFFF" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {editingSubTaskId === subTask.id ? (
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.subActionInput,
                                subTask.completed && styles.subActionTextCompleted
                            ]}
                            value={editingSubTaskText}
                            onChangeText={setEditingSubTaskText}
                            onBlur={saveSubTaskEdit}
                            onSubmitEditing={saveSubTaskEdit}
                            autoFocus
                            returnKeyType="done"
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.subActionTextContainer}
                            onPress={() => startEditingSubTask(subTask.id, subTask.text)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.subActionText,
                                subTask.completed && styles.subActionTextCompleted
                            ]}>
                                {subTask.text}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}

            <View style={styles.addSubActionContainer}>
                <View style={styles.addSubActionInputContainer}>
                    <TextInput
                        style={styles.addSubActionInput}
                        placeholder="Add a sub-action..."
                        placeholderTextColor="#9CA3AF"
                        value={newSubAction}
                        onChangeText={setNewSubAction}
                        onSubmitEditing={addNewSubAction}
                        returnKeyType="done"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addSubActionButton}
                    onPress={addNewSubAction}
                >
                    {plusCircleIcon}
                    <Text style={styles.addSubActionText}>Add sub-action</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={[
                styles.card,
                {
                    borderTopColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                    borderLeftColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                    borderRightColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                    borderBottomColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                }
            ]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            onPress={handleToggleDone}
                            style={styles.checkboxContainer}
                        >
                            <View style={[
                                styles.checkbox,
                                isDone && {
                                    backgroundColor: ENTRY_TYPES[EntryType.ACTION].borderColor,
                                    borderColor: ENTRY_TYPES[EntryType.ACTION].borderColor
                                }
                            ]}>
                                {isDone && (
                                    <Icon name="check" width={14} height={14} color="#FFFFFF" />
                                )}
                            </View>
                        </TouchableOpacity>

                        <View style={styles.contentContainer}>
                            <Text style={[
                                styles.title,
                                isDone && styles.titleCompleted
                            ]}>
                                {action.title}
                            </Text>

                            {categoryInfo && (
                                <CategoryPill
                                    title={categoryInfo.title}
                                    color={categoryInfo.color}
                                    size="small"
                                    style={styles.categoryPill}
                                />
                            )}

                            {action.dueDate && (
                                <View style={styles.dueDateContainer}>
                                    <Icon name="calendar" width={16} height={16} color="#6B7280" />
                                    <Text style={styles.dueDateText}>
                                        Target: {formatDate(action.dueDate)}
                                    </Text>
                                </View>
                            )}

                            {action.tags && action.tags.length > 0 && (
                                <View style={styles.tagsContainer}>
                                    <LabelRow
                                        labels={action.tags}
                                        size="small"
                                        maxLabelsToShow={3}
                                        gap={6}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            onPress={handleToggleExpand}
                            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            style={styles.expandButton}
                        >
                            {hasSubActions && !expanded && (
                                <View style={styles.subTaskCounter}>
                                    <Text style={styles.subTaskCounterText}>{completedSubTasks}/{totalSubTasks}</Text>
                                </View>
                            )}
                            <Icon
                                name={expanded ? "chevron-up" : "chevron-down"}
                                width={24}
                                height={24}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={toggleMenu}
                            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            style={styles.moreButton}
                        >
                            <Icon name="ellipsis-vertical" width={24} height={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {expanded && (
                    <View style={styles.expandedContainer}>
                        {renderExpandedContent()}
                    </View>
                )}
            </View>

            {/* Actions Menu (Dropdown) - Will be shown when showActions is true */}
            {showActions && (
                <View style={styles.actionsMenu}>
                    <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => {
                            handleStar();
                            setShowActions(false);
                        }}
                    >
                        <Icon name="star" width={16} height={16} color="#6B7280" />
                        <Text style={styles.actionMenuItemText}>Star</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => {
                            handleDuplicate();
                            setShowActions(false);
                        }}
                    >
                        <Icon name="copy" width={16} height={16} color="#6B7280" />
                        <Text style={styles.actionMenuItemText}>Duplicate</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => {
                            handleArchive();
                            setShowActions(false);
                        }}
                    >
                        <Icon name="archive" width={16} height={16} color="#6B7280" />
                        <Text style={styles.actionMenuItemText}>Archive</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionMenuItem}
                        onPress={() => {
                            handleHide();
                            setShowActions(false);
                        }}
                    >
                        <Icon name="eye-off" width={16} height={16} color="#6B7280" />
                        <Text style={styles.actionMenuItemText}>Hide</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Confirmation Modal for completing sub-tasks */}
            <ConfirmationModal
                visible={showConfirmModal}
                title="Complete All Sub-actions?"
                message={`Marking "${action.title}" as complete will also mark all ${totalSubTasks - completedSubTasks} incomplete sub-actions as complete. Would you like to proceed?`}
                icon="check"
                confirmText="Complete All"
                cancelText="Cancel"
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
                accentColor={ENTRY_TYPES[EntryType.ACTION].borderColor}
            />
        </TouchableOpacity>
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
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    categoryPill: {
        marginTop: 4,
    },
    dueDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    dueDateText: {
        fontSize: 14,
        color: '#6B7280',
        marginLeft: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
    },
    expandButton: {
        marginRight: 8,
        flexDirection: 'row',
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
    moreButton: {
        // No specific styling needed
    },
    expandedContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    subActionsContainer: {
        gap: 12,
    },
    subActionsHeading: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginBottom: 4,
    },
    subActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subActionCheckboxContainer: {
        marginRight: 12,
    },
    subActionCheckbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subActionTextContainer: {
        flex: 1,
        paddingVertical: 4,
    },
    subActionText: {
        fontSize: 14,
        color: '#374151',
    },
    subActionTextCompleted: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    subActionInput: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        padding: 0,
        paddingVertical: 4,
    },
    addSubActionContainer: {
        marginTop: 8,
    },
    addSubActionInputContainer: {
        marginBottom: 8,
    },
    addSubActionInput: {
        fontSize: 14,
        color: '#374151',
        padding: 0,
        paddingVertical: 4,
    },
    addSubActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addSubActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        marginLeft: 8,
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
});