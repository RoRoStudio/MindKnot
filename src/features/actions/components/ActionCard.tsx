// src/components/entries/actions/ActionCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, TextInput } from 'react-native';
import { Action } from '../../../shared/types/action';
import { Category } from '../../../shared/types/category';
import { ENTRY_TYPES, EntryType } from '../../../shared/constants/entryTypes';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Icon } from '../../../shared/components';
import { EntryCard } from '../../../shared/components';
import { updateAction, getActionById } from '../hooks/useActionService';
import { getCategoryById } from '../../../shared/services/categoryService';
import { ConfirmationModal } from '../../../shared/components';

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
    const [expanded, setExpanded] = useState(false);
    const [newSubAction, setNewSubAction] = useState('');
    const [subTasks, setSubTasks] = useState(action.subTasks || []);
    const [isDone, setIsDone] = useState(action.done || false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
    const [editingSubTaskText, setEditingSubTaskText] = useState('');
    const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);

    const hasSubActions = subTasks && subTasks.length > 0;
    const inputRef = useRef<TextInput>(null);

    // Create styles using useThemedStyles hook
    const styles = useThemedStyles((theme) => ({
        subActionsContainer: {
            gap: theme.spacing.s,
        },
        subActionsHeading: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
        },
        subActionRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        subActionCheckboxContainer: {
            marginRight: theme.spacing.s,
        },
        subActionCheckbox: {
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.shape.radius.xs,
            justifyContent: 'center',
            alignItems: 'center',
        },
        subActionTextContainer: {
            flex: 1,
            paddingVertical: theme.spacing.xs,
        },
        subActionText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
        },
        subActionTextCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textSecondary,
        },
        subActionInput: {
            flex: 1,
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
            padding: 0,
            paddingVertical: theme.spacing.xs,
        },
        addSubActionContainer: {
            marginTop: theme.spacing.s,
        },
        addSubActionInputContainer: {
            marginBottom: theme.spacing.s,
        },
        addSubActionInput: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
            padding: 0,
            paddingVertical: theme.spacing.xs,
        },
        addSubActionButton: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        addSubActionText: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.s,
        },
        checkboxContainer: {
            marginTop: theme.spacing.xs,
            marginRight: theme.spacing.s,
            flexShrink: 0,
            // Increase touch area for better usability
            padding: theme.spacing.s,
            margin: -theme.spacing.s, // Negative margin to offset the padding
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: theme.shape.radius.xs,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.background,
        },
    }));

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

    const handleToggleDone = async () => {
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

    const handleToggleExpand = () => {
        setExpanded(!expanded);
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
    const plusCircleIcon = <Icon name="circle-plus" size={20} color={styles.addSubActionText.color} />;

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
                                backgroundColor: ENTRY_TYPES[EntryType.ACTION].color,
                                borderColor: ENTRY_TYPES[EntryType.ACTION].color
                            }
                        ]}>
                            {subTask.completed && (
                                <Icon name="check" size={14} color={styles.checkbox.backgroundColor} />
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
                        placeholderTextColor={styles.addSubActionText.color}
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
        <>
            <EntryCard
                id={action.id}
                title={action.title}
                description={action.description}
                iconName={ENTRY_TYPES[EntryType.ACTION].icon}
                borderColor={ENTRY_TYPES[EntryType.ACTION].color}
                createdAt={action.createdAt}
                tags={action.tags}
                categoryId={action.categoryId}
                onPress={onPress}
                isStarred={action.isStarred}
                entryType="action"
                onEntryUpdated={onToggleDone ? () => onToggleDone(action.id) : undefined}
                done={isDone}
                dueDate={action.dueDate}
                // Use new linking system instead of subtitle
                linkedTo={action.parentId && action.parentType ? {
                    type: action.parentType,
                    id: action.parentId,
                    label: action.parentType === 'path' ? 'Path' : 'Milestone'
                } : undefined}
                // Don't show created date for actions - only for notes and sparks
                showCreatedDate={false}
                // Checkbox functionality
                showCheckbox={true}
                checkboxChecked={isDone}
                onCheckboxPress={handleToggleDone}
                // Expandable functionality
                expandable={true}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
                expandedContent={renderExpandedContent()}
                // Sub-task counter
                subTaskCounter={hasSubActions ? `${completedSubTasks}/${totalSubTasks}` : undefined}
                navigationScreen="ActionScreen"
            />

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
                accentColor={ENTRY_TYPES[EntryType.ACTION].color}
            />
        </>
    );
};