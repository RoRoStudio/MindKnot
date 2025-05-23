import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    StatusBar,
    Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, ConfirmationModal } from '../../components/common';
import { createAction, updateAction, getActionById } from '../../api/actionService';
import { RootStackParamList } from '../../types/navigation-types';
import { useActions } from '../../hooks/useActions';
import { EntryDetailHeader, EntryMetadataBar, EntryTitleInput } from '../../components/entries';
import { FormDatePicker, FormDatePickerRef } from '../../components/form';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActionScreenMode = 'create' | 'edit' | 'view';

type ActionScreenRouteProp = RouteProp<
    {
        ActionScreen: {
            mode: ActionScreenMode;
            id?: string;
            parentId?: string;
            parentType?: 'path' | 'milestone' | 'loop-item';
        };
    },
    'ActionScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ActionFormValues {
    title: string;
    targetDate?: string;
    priority: 'low' | 'medium' | 'high' | null;
    subTasks: { id: string; text: string; completed: boolean }[];
    tags: string[];
    categoryId: string | null;
    done?: boolean;
    completed?: boolean;
}

export default function ActionScreen() {
    const route = useRoute<ActionScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadActions } = useActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState<ActionScreenMode>('create');
    const [actionId, setActionId] = useState<string | undefined>(undefined);
    const [parentId, setParentId] = useState<string | undefined>(undefined);
    const [parentType, setParentType] = useState<'path' | 'milestone' | 'loop-item' | undefined>(undefined);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [actionData, setActionData] = useState<ActionFormValues | null>(null);
    const [editingSubTaskIndex, setEditingSubTaskIndex] = useState<number | null>(null);
    const [editingSubTaskText, setEditingSubTaskText] = useState('');

    // Set up form with default values
    const { control, handleSubmit, setValue, watch, reset, getValues } = useForm<ActionFormValues>({
        defaultValues: {
            title: '',
            targetDate: undefined,
            priority: null,
            subTasks: [],
            tags: [],
            categoryId: null,
            done: false,
            completed: false,
        },
        mode: 'onChange'
    });

    const priority = watch('priority');
    const targetDate = watch('targetDate');
    const subTasks = watch('subTasks');
    const tags = watch('tags');
    const categoryId = watch('categoryId');
    const isDone = watch('done');
    const isCompleted = watch('completed');

    // Reference for FormDatePicker
    const datePickerRef = useRef<FormDatePickerRef>(null);

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id, parentId: routeParentId, parentType: routeParentType } = route.params;
            console.log(`ActionScreen: Route params loaded - mode: ${routeMode}, id: ${id}`);

            setMode(routeMode || 'create');
            setActionId(id);
            setParentId(routeParentId);
            setParentType(routeParentType);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                console.log(`ActionScreen: Loading existing action with id: ${id}`);
                loadActionData(id);
            }
        }
    }, [route.params]);

    // Load action data for edit or view mode
    const loadActionData = async (id: string) => {
        try {
            console.log(`ActionScreen: Fetching action data for id: ${id}`);
            const action = await getActionById(id);

            if (action) {
                console.log(`ActionScreen: Action loaded - done status: ${action.done}, title: ${action.title}`);
                reset({
                    title: action.title,
                    targetDate: action.dueDate,
                    priority: action.priority === 1 ? 'low' : action.priority === 3 ? 'high' : action.priority === 2 ? 'medium' : null,
                    subTasks: action.subTasks ? action.subTasks : [],
                    tags: action.tags || [],
                    categoryId: action.categoryId || null,
                    done: action.done || false,
                    completed: action.completed || false,
                });
            } else {
                console.error(`ActionScreen: Action with id ${id} not found`);
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading action:', error);
            navigation.goBack();
        }
    };

    // Handle form submission
    const onSubmit = async (data: ActionFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            console.log(`ActionScreen: onSubmit called, mode=${mode}, actionId=${actionId}`);
            console.log(`ActionScreen: Current done status before update: ${data.done}`);

            // Convert priority to number or undefined if not set
            let priorityValue = 0; // Default to 0 for no priority
            if (data.priority === 'low') priorityValue = 1;
            else if (data.priority === 'medium') priorityValue = 2;
            else if (data.priority === 'high') priorityValue = 3;

            // For existing actions in edit or view mode, toggle done status
            let isDone = data.done || false;
            let isCompleted = data.completed || false;

            // Check if we have an actionId, regardless of mode
            if (actionId) {
                // Toggle completion status for existing actions
                isDone = !isDone;
                console.log(`ActionScreen: Toggling done status to: ${isDone}`);

                // If marking as complete and there are incomplete sub-tasks, show confirmation modal
                const hasSubTasks = data.subTasks && data.subTasks.length > 0;
                const completedSubTasks = data.subTasks.filter(task => task.completed).length;
                const hasIncompleteSubTasks = hasSubTasks && completedSubTasks < data.subTasks.length;

                if (isDone && hasIncompleteSubTasks) {
                    // Store current form data for later use when modal is confirmed
                    setActionData(data);
                    setShowConfirmModal(true);
                    setIsSubmitting(false);
                    return;
                }
            }

            const actionData = {
                title: data.title,
                description: '',
                dueDate: data.targetDate,
                done: isDone,
                completed: isCompleted,
                priority: priorityValue,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                parentId: parentId,
                parentType: parentType,
                subTasks: data.subTasks,
                type: 'action' as const,
            };

            let success = false;
            // If we have an actionId, update the existing action regardless of mode
            if (actionId) {
                // We're updating an existing action
                console.log(`ActionScreen: Updating action ${actionId} with done=${isDone}`);
                success = await updateAction(actionId, actionData);
                console.log(`ActionScreen: Update result: ${success ? 'success' : 'failed'}`);
            } else {
                // We're creating a new action
                console.log(`ActionScreen: Creating new action with done=${isDone}`);
                const newActionId = await createAction(actionData);
                success = !!newActionId;
            }

            if (success) {
                // Make sure we reload the actions list to reflect changes
                await loadActions();
                console.log('ActionScreen: Actions reloaded, navigating back');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to update the action. Please try again.');
            }
        } catch (error) {
            console.error('Error handling action:', error);
            Alert.alert('Error', 'An error occurred while saving the action');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleToggleSubTaskCompletion = async (index: number) => {
        try {
            const updatedSubTasks = [...subTasks];
            const isBeingMarkedIncomplete = updatedSubTasks[index].completed;

            // Toggle the completion status
            updatedSubTasks[index] = {
                ...updatedSubTasks[index],
                completed: !updatedSubTasks[index].completed
            };

            // Update the form state
            setValue('subTasks', updatedSubTasks);

            // If we have an actionId and a subtask is being marked incomplete,
            // also mark the main action as incomplete if it was complete
            if (actionId && isBeingMarkedIncomplete && isDone) {
                setValue('done', false);

                // Update in database immediately
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: false, // Mark as not done
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined,
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: updatedSubTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            }

            // If we're in view/edit mode with an existing action, save changes immediately
            if (actionId && (mode === 'view' || mode === 'edit')) {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined,
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: updatedSubTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            }
        } catch (error) {
            console.error('Error toggling subtask completion:', error);
            Alert.alert('Error', 'Failed to update sub-task status');
        }
    };

    const handleAddSubTask = () => {
        const newSubTask = {
            id: Date.now().toString(),
            text: '',
            completed: false
        };
        const updatedSubTasks = [...subTasks, newSubTask];
        setValue('subTasks', updatedSubTasks);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            saveSubTasksToDatabase(updatedSubTasks);
        }

        // Set the new task to be in editing mode
        setTimeout(() => {
            setEditingSubTaskIndex(updatedSubTasks.length - 1);
            setEditingSubTaskText('');
        }, 100);
    };

    const saveSubTasksToDatabase = async (updatedSubTasks: any[]) => {
        try {
            if (!actionId) return;

            const currentData = getValues();
            const priorityValue = currentData.priority === 'low' ? 1 :
                currentData.priority === 'medium' ? 2 :
                    currentData.priority === 'high' ? 3 : 0;

            const actionData = {
                title: currentData.title,
                description: '',
                dueDate: currentData.targetDate,
                done: currentData.done,
                completed: currentData.completed,
                priority: priorityValue,
                tags: currentData.tags,
                categoryId: currentData.categoryId || undefined,
                parentId: parentId,
                parentType: parentType,
                subTasks: updatedSubTasks,
                type: 'action' as const,
            };

            await updateAction(actionId, actionData);
        } catch (error) {
            console.error('Error saving subtasks to database:', error);
            Alert.alert('Error', 'Failed to save sub-task changes');
        }
    };

    const startEditingSubTask = (index: number) => {
        setEditingSubTaskIndex(index);
        setEditingSubTaskText(subTasks[index].text);
    };

    const saveSubTaskEdit = async (index: number) => {
        if (editingSubTaskIndex === null) return;

        try {
            const updatedSubTasks = [...subTasks];
            const trimmedText = editingSubTaskText.trim();

            // If empty, keep original text
            if (trimmedText) {
                updatedSubTasks[index] = {
                    ...updatedSubTasks[index],
                    text: trimmedText
                };
                setValue('subTasks', updatedSubTasks);
            }

            // If we're in view/edit mode with an existing action, save changes immediately
            if (actionId && (mode === 'view' || mode === 'edit')) {
                await saveSubTasksToDatabase(updatedSubTasks);
            }
        } catch (error) {
            console.error('Error updating subtask text:', error);
            Alert.alert('Error', 'Failed to update sub-task text');
        } finally {
            setEditingSubTaskIndex(null);
            setEditingSubTaskText('');
        }
    };

    const handleCategoryChange = async (newCategoryId: string | null) => {
        setValue('categoryId', newCategoryId);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: newCategoryId || undefined, // Convert null to undefined
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error saving category change:', error);
                Alert.alert('Error', 'Failed to save category change');
            }
        }
    };

    const handleLabelsChange = async (newLabels: string[]) => {
        setValue('tags', newLabels);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: newLabels,
                    categoryId: currentData.categoryId || undefined, // Convert null to undefined
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error saving label changes:', error);
                Alert.alert('Error', 'Failed to save label changes');
            }
        }
    };

    // Toggle priority selection (select or deselect)
    const handlePriorityToggle = async (selectedPriority: 'low' | 'medium' | 'high') => {
        const newPriority = priority === selectedPriority ? null : selectedPriority;
        setValue('priority', newPriority);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = newPriority === 'low' ? 1 :
                    newPriority === 'medium' ? 2 :
                        newPriority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined, // Convert null to undefined
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error saving priority change:', error);
                Alert.alert('Error', 'Failed to save priority change');
            }
        }
    };

    // Clear target date function
    const handleClearTargetDate = async () => {
        setValue('targetDate', undefined);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: undefined,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined, // Convert null to undefined
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error clearing target date:', error);
                Alert.alert('Error', 'Failed to clear target date');
            }
        }
    };

    // Also, update the title onChange to save immediately
    const handleTitleChange = async (value: string) => {
        setValue('title', value);

        // If we're in view/edit mode with an existing action, save title changes after a short delay
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: value,
                    description: '',
                    dueDate: currentData.targetDate,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined, // Convert null to undefined
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error saving title change:', error);
                // Don't show alert for title changes as it could be disruptive during typing
            }
        }
    };

    // Function to handle opening the date picker
    const handleOpenDatePicker = () => {
        if (datePickerRef.current) {
            datePickerRef.current.openPicker();
        }
    };

    // Add function to handle modal confirmation
    const handleCompleteAllConfirm = async () => {
        if (!actionData || !actionId) {
            setShowConfirmModal(false);
            return;
        }

        try {
            setIsSubmitting(true);
            console.log(`ActionScreen: Confirming completion of all sub-tasks`);

            // Convert priority to number or undefined if not set
            let priorityValue = 0; // Default to 0 for no priority
            if (actionData.priority === 'low') priorityValue = 1;
            else if (actionData.priority === 'medium') priorityValue = 2;
            else if (actionData.priority === 'high') priorityValue = 3;

            // Mark all sub-tasks as complete
            const updatedSubTasks = actionData.subTasks.map(task => ({
                ...task,
                completed: true
            }));

            // Update form state
            setValue('subTasks', updatedSubTasks);
            setValue('done', true);

            const updatedActionData = {
                title: actionData.title,
                description: '',
                dueDate: actionData.targetDate,
                done: true, // Mark as done
                completed: actionData.completed,
                priority: priorityValue,
                tags: actionData.tags,
                categoryId: actionData.categoryId || undefined,
                parentId: parentId,
                parentType: parentType,
                subTasks: updatedSubTasks, // Updated sub-tasks
                type: 'action' as const,
            };

            console.log('ActionScreen: Updating action with all sub-tasks complete:', updatedActionData);
            const success = await updateAction(actionId, updatedActionData);

            if (success) {
                // Make sure we reload the actions list to reflect changes
                await loadActions();
                console.log('ActionScreen: Actions reloaded after marking all complete');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to update the action. Please try again.');
            }
        } catch (error) {
            console.error('Error handling action:', error);
            Alert.alert('Error', 'An error occurred while updating the action');
        } finally {
            setIsSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    // Add a handleDateChange function to save date changes immediately
    const handleDateChange = async (date: string | undefined) => {
        setValue('targetDate', date);

        // If we're in view/edit mode with an existing action, save changes immediately
        if (actionId && (mode === 'view' || mode === 'edit')) {
            try {
                const currentData = getValues();
                const priorityValue = currentData.priority === 'low' ? 1 :
                    currentData.priority === 'medium' ? 2 :
                        currentData.priority === 'high' ? 3 : 0;

                const actionData = {
                    title: currentData.title,
                    description: '',
                    dueDate: date,
                    done: currentData.done,
                    completed: currentData.completed,
                    priority: priorityValue,
                    tags: currentData.tags,
                    categoryId: currentData.categoryId || undefined,
                    parentId: parentId,
                    parentType: parentType,
                    subTasks: currentData.subTasks,
                    type: 'action' as const,
                };

                await updateAction(actionId, actionData);
            } catch (error) {
                console.error('Error saving date change:', error);
                // Don't show alert as it could be disruptive
            }
        }
    };

    // Add a useEffect to watch for changes to the targetDate field
    useEffect(() => {
        // Only run when we have an actionId and we're in view/edit mode
        if (actionId && (mode === 'view' || mode === 'edit') && targetDate !== undefined) {
            const saveDateChange = async () => {
                try {
                    const currentData = getValues();
                    const priorityValue = currentData.priority === 'low' ? 1 :
                        currentData.priority === 'medium' ? 2 :
                            currentData.priority === 'high' ? 3 : 0;

                    const actionData = {
                        title: currentData.title,
                        description: '',
                        dueDate: targetDate,
                        done: currentData.done,
                        completed: currentData.completed,
                        priority: priorityValue,
                        tags: currentData.tags,
                        categoryId: currentData.categoryId || undefined,
                        parentId: parentId,
                        parentType: parentType,
                        subTasks: currentData.subTasks,
                        type: 'action' as const,
                    };

                    await updateAction(actionId, actionData);
                } catch (error) {
                    console.error('Error saving date change:', error);
                    // Don't show alert as it could be disruptive
                }
            };

            saveDateChange();
        }
    }, [targetDate, actionId, mode]);

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
        titleInput: {
            fontSize: 32,
            fontWeight: '300',
            color: theme.colors.textPrimary,
            padding: 16,
            paddingTop: 16,
            paddingBottom: 16,
            fontFamily: 'KantumruyPro-Bold',
        },
        divider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginHorizontal: 16,
        },
        sectionContainer: {
            paddingVertical: 16,
            paddingHorizontal: 16,
        },
        sectionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        sectionLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            fontFamily: 'KantumruyPro-Medium',
        },
        targetDateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 50,
        },
        targetDateValueContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        targetDateValue: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            fontFamily: 'KantumruyPro-Regular',
            marginRight: 8,
        },
        targetDatePlaceholder: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            fontFamily: 'KantumruyPro-Regular',
        },
        clearButton: {
            padding: 4,
        },
        chevronRight: {
            marginLeft: 4,
        },
        prioritySection: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        priorityLabelContainer: {
            flex: 1,
        },
        priorityButtonsContainer: {
            flexDirection: 'row',
            flex: 2,
        },
        priorityButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 4,
            borderRadius: 50,
            borderWidth: 1,
        },
        priorityButtonFirst: {
            marginLeft: 0,
        },
        priorityButtonLast: {
            marginRight: 0,
        },
        lowButton: {
            backgroundColor: priority === 'low' ? theme.colors.surfaceVariant : theme.colors.surface,
            borderColor: priority === 'low' ? theme.colors.border : theme.colors.border,
        },
        mediumButton: {
            backgroundColor: priority === 'medium' ? theme.colors.warning : theme.colors.surface,
            borderColor: priority === 'medium' ? theme.colors.warning : theme.colors.border,
        },
        highButton: {
            backgroundColor: priority === 'high' ? theme.colors.error : theme.colors.surface,
            borderColor: priority === 'high' ? theme.colors.error : theme.colors.border,
        },
        lowButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            fontFamily: 'KantumruyPro-Medium',
        },
        mediumButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textPrimary,
            fontFamily: 'KantumruyPro-Medium',
        },
        highButtonText: {
            fontSize: 14,
            fontWeight: '500',
            color: priority === 'high' ? theme.colors.onPrimary : theme.colors.textPrimary,
            fontFamily: 'KantumruyPro-Medium',
        },
        subTasksHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        subTasksContainer: {
            marginTop: 8,
        },
        subTaskRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        checkBox: {
            width: 24,
            height: 24,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        checkBoxChecked: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        subTaskInput: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.textPrimary,
            padding: 0,
        },
        subTaskInputCompleted: {
            textDecorationLine: 'line-through',
            color: theme.colors.textDisabled,
        },
        subTaskTextContainer: {
            flex: 1,
            paddingVertical: 8,
        },
        subTaskText: {
            fontSize: 16,
            color: theme.colors.textPrimary,
        },
        newSubTaskRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
        },
        newSubTaskIcon: {
            marginRight: 12,
        },
        newSubTaskText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            fontFamily: 'KantumruyPro-Regular',
        },
        bottomContainer: {
            padding: 16,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        createButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 32,
            paddingVertical: 16,
            alignItems: 'center',
        },
        createButtonText: {
            color: theme.colors.onPrimary,
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'KantumruyPro-SemiBold',
        },
        hiddenDatePicker: {
            height: 0,
            width: 0,
            opacity: 0,
            position: 'absolute',
        },
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
            <View style={styles.container}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType="New Action"
                />

                <EntryMetadataBar
                    categoryId={categoryId}
                    onCategoryChange={handleCategoryChange}
                    labels={tags}
                    onLabelsChange={handleLabelsChange}
                    isEditing={true}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <ScrollView style={styles.content}>
                        <EntryTitleInput
                            control={control}
                            name="title"
                            placeholder="Action title"
                            onChangeText={handleTitleChange}
                        />

                        <View style={styles.divider} />

                        <View style={styles.sectionContainer}>
                            <TouchableOpacity
                                style={styles.targetDateContainer}
                                onPress={handleOpenDatePicker}
                            >
                                <Text style={styles.sectionLabel}>Target date</Text>
                                <View style={styles.targetDateValueContainer}>
                                    {targetDate ? (
                                        <>
                                            <Text style={styles.targetDateValue}>
                                                {new Date(targetDate).toLocaleDateString()}
                                            </Text>
                                            <TouchableOpacity
                                                style={styles.clearButton}
                                                onPress={handleClearTargetDate}
                                            >
                                                <Icon name="x" width={16} height={16} color={theme.colors.textSecondary} />
                                            </TouchableOpacity>
                                        </>
                                    ) : (
                                        <>
                                            <Text style={styles.targetDatePlaceholder}>Set target date</Text>
                                            <Icon
                                                name="chevron-right"
                                                width={16}
                                                height={16}
                                                color={theme.colors.textSecondary}
                                                style={styles.chevronRight}
                                            />
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.hiddenDatePicker}>
                                <FormDatePicker
                                    name="targetDate"
                                    control={control}
                                    ref={datePickerRef}
                                    placeholder=""
                                />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionContainer}>
                            <View style={styles.prioritySection}>
                                <View style={styles.priorityLabelContainer}>
                                    <Text style={styles.sectionLabel}>Priority</Text>
                                </View>
                                <View style={styles.priorityButtonsContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.priorityButton,
                                            styles.priorityButtonFirst,
                                            styles.lowButton
                                        ]}
                                        onPress={() => handlePriorityToggle('low')}
                                    >
                                        <Text style={styles.lowButtonText}>Low</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.priorityButton,
                                            styles.mediumButton
                                        ]}
                                        onPress={() => handlePriorityToggle('medium')}
                                    >
                                        <Text style={styles.mediumButtonText}>Medium</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.priorityButton,
                                            styles.priorityButtonLast,
                                            styles.highButton
                                        ]}
                                        onPress={() => handlePriorityToggle('high')}
                                    >
                                        <Text style={styles.highButtonText}>High</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionContainer}>
                            <View style={styles.subTasksHeader}>
                                <Text style={styles.sectionLabel}>Sub-actions</Text>
                            </View>
                            <View style={styles.subTasksContainer}>
                                {subTasks.map((subTask, index) => (
                                    <View key={subTask.id} style={styles.subTaskRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.checkBox,
                                                subTask.completed && styles.checkBoxChecked
                                            ]}
                                            onPress={() => handleToggleSubTaskCompletion(index)}
                                        >
                                            {subTask.completed && (
                                                <Icon name="check" width={16} height={16} color={theme.colors.onPrimary} />
                                            )}
                                        </TouchableOpacity>

                                        {editingSubTaskIndex === index ? (
                                            <TextInput
                                                style={[
                                                    styles.subTaskInput,
                                                    subTask.completed && styles.subTaskInputCompleted
                                                ]}
                                                value={editingSubTaskText}
                                                onChangeText={setEditingSubTaskText}
                                                onBlur={() => saveSubTaskEdit(index)}
                                                onSubmitEditing={() => saveSubTaskEdit(index)}
                                                autoFocus
                                                returnKeyType="done"
                                            />
                                        ) : (
                                            <TouchableOpacity
                                                style={styles.subTaskTextContainer}
                                                onPress={() => startEditingSubTask(index)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.subTaskText,
                                                    subTask.completed && styles.subTaskInputCompleted
                                                ]}>
                                                    {subTask.text}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                                <TouchableOpacity
                                    style={styles.newSubTaskRow}
                                    onPress={handleAddSubTask}
                                >
                                    <Icon
                                        name="plus"
                                        width={20}
                                        height={20}
                                        color={theme.colors.textSecondary}
                                        style={styles.newSubTaskIcon}
                                    />
                                    <Text style={styles.newSubTaskText}>Add sub-actions</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Extra space at the bottom */}
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            style={[
                                styles.createButton,
                                isDone && mode === 'edit' ? { backgroundColor: theme.colors.success } : {}  // Success color for completed actions
                            ]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.createButtonText}>
                                {isSubmitting ? 'Saving...' :
                                    mode === 'create' ? 'Create Action' :
                                        isDone ? 'Mark as Incomplete' : 'Mark as Complete'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>

            {/* Confirmation Modal for completing sub-tasks */}
            <ConfirmationModal
                visible={showConfirmModal}
                title="Complete All Sub-actions?"
                message={actionData && actionData.subTasks
                    ? `Marking this action as complete will also mark all ${actionData.subTasks.filter(t => !t.completed).length} incomplete sub-actions as complete. Would you like to proceed?`
                    : "Would you like to mark all sub-actions as complete?"}
                icon="check"
                confirmText="Complete All"
                cancelText="Cancel"
                onConfirm={handleCompleteAllConfirm}
                onCancel={() => setShowConfirmModal(false)}
                accentColor={theme.colors.success}
            />
        </SafeAreaView>
    );
} 