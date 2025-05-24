import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Text,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Icon } from '../../components/common';
import { EntryDetailHeader, EntryMetadataBar, EntryTitleInput } from '../../components/entries';
import { LoopCreationFlow, LoopProgressIndicator, ActivityPicker, LoopExecutionStatusCard, LoopInterruptionModal } from '../../components/entries/loops';
import { LoopExecutionScreen } from './LoopExecutionScreen';
import { useLoopActions } from '../../store/loops/useLoopActions';
import { RootStackParamList } from '../../types/navigation-types';
import { Loop, ActivityTemplate, LoopActivity, LoopActivityInstance } from '../../types/loop';
import { ENTRY_TYPES, EntryType } from '../../constants/entryTypes';

type LoopScreenMode = 'create' | 'edit' | 'view';

type LoopScreenRouteProp = RouteProp<
    {
        LoopScreen: {
            mode: LoopScreenMode;
            id?: string;
        };
    },
    'LoopScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoopFormValues {
    title: string;
    description: string;
    tags: string[];
    categoryId: string | null;
}

export default function LoopScreen() {
    const route = useRoute<LoopScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();

    const {
        loops,
        activeExecution,
        currentActivityProgress,
        loadLoops,
        updateLoop,
        deleteLoop,
        startLoopExecution,
        getLoopById,
        getActivityTemplatesByIds,
        loadActiveExecution,
        addLoopActivity,
        removeLoopActivity,
        completeLoopExecution,
        addLoopActivityInstance,
        reorderActivityInstances,
        removeLoopActivityInstance,
        editLoopActivityInstance,
    } = useLoopActions();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<LoopScreenMode>('create');
    const [loopId, setLoopId] = useState<string | undefined>(undefined);
    const [currentLoop, setCurrentLoop] = useState<Loop | null>(null);
    const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
    const [showCreationFlow, setShowCreationFlow] = useState(false);
    const [showExecutionScreen, setShowExecutionScreen] = useState(false);
    const [showActivityPicker, setShowActivityPicker] = useState(false);
    const [showInterruptionModal, setShowInterruptionModal] = useState(false);
    const [interruptionLoop, setInterruptionLoop] = useState<Loop | null>(null);

    // Get loop theme color
    const loopColor = ENTRY_TYPES[EntryType.LOOP].color;

    // Set up form with default values
    const { control, handleSubmit, reset, getValues, setValue, watch } = useForm<LoopFormValues>({
        defaultValues: {
            title: '',
            description: '',
            tags: [],
            categoryId: null,
        },
        mode: 'onChange'
    });

    const categoryId = watch('categoryId');
    const tags = watch('tags');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.m,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        activitiesContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: theme.spacing.m,
            borderLeftWidth: 4,
            borderLeftColor: loopColor,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            marginBottom: theme.spacing.s,
        },
        activityIcon: {
            fontSize: 24,
            marginRight: theme.spacing.m,
        },
        activityInfo: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 16,
            fontWeight: '500',
            color: theme.colors.textPrimary,
        },
        activityType: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textTransform: 'capitalize',
            marginTop: 2,
        },
        activityActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        removeActivityButton: {
            padding: 4,
            marginLeft: 8,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderStyle: 'dashed',
        },
        addButtonText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.s,
        },
        actionButton: {
            backgroundColor: loopColor,
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.l,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: theme.spacing.m,
        },
        actionButtonText: {
            color: theme.colors.onPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
        executionCard: {
            backgroundColor: loopColor + '20',
            borderRadius: 12,
            padding: theme.spacing.m,
            borderWidth: 1,
            borderColor: loopColor,
            marginBottom: theme.spacing.l,
        },
        executionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: loopColor,
            marginBottom: theme.spacing.s,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.l,
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        emptyText: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.m,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bottomContainer: {
            padding: theme.spacing.m,
            paddingBottom: theme.spacing.l,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        saveButton: {
            backgroundColor: loopColor,
            borderRadius: 8,
            paddingVertical: theme.spacing.m,
            alignItems: 'center',
        },
        saveButtonText: {
            color: theme.colors.onPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id } = route.params;
            setMode(routeMode);
            setLoopId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadLoopData(id);
            } else if (routeMode === 'create') {
                setShowCreationFlow(true);
            }
        }
    }, [route.params]);

    // Load loop data for edit or view mode
    const loadLoopData = async (id: string) => {
        try {
            setIsLoading(true);
            const loop = await getLoopById(id);

            if (loop) {
                setCurrentLoop(loop);
                reset({
                    title: loop.title,
                    description: loop.description || '',
                    tags: loop.tags || [],
                    categoryId: loop.categoryId || null,
                });

                // Load activity templates for this loop
                await loadActivityTemplates(loop);
            } else {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading loop:', error);
            Alert.alert('Error', 'Failed to load loop');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const loadActivityTemplates = async (loop: Loop) => {
        if (loop.activityInstances && loop.activityInstances.length > 0) {
            try {
                const templateIds = loop.activityInstances.map(instance => instance.templateId);
                const templates = await getActivityTemplatesByIds(templateIds);
                setActivityTemplates(templates);
            } catch (error) {
                console.error('Error loading activity templates:', error);
            }
        }
    };

    // Handle form submission for loop metadata
    const onSubmit = async (data: LoopFormValues) => {
        if (isSubmitting || !currentLoop) return;

        try {
            setIsSubmitting(true);

            const loopData = {
                ...currentLoop,
                title: data.title,
                description: data.description,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
            };

            const success = await updateLoop(currentLoop.id, loopData);

            if (success) {
                setCurrentLoop(loopData);
                await loadLoops(); // Refresh loops list
                if (mode === 'edit') {
                    setMode('view');
                }
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

    // Handle metadata changes in edit/view mode (auto-save)
    const handleCategoryChange = async (newCategoryId: string | null) => {
        setValue('categoryId', newCategoryId);
        if (currentLoop && (mode === 'view' || mode === 'edit')) {
            await autoSave({ categoryId: newCategoryId });
        }
    };

    const handleLabelsChange = async (newLabels: string[]) => {
        setValue('tags', newLabels);
        if (currentLoop && (mode === 'view' || mode === 'edit')) {
            await autoSave({ tags: newLabels });
        }
    };

    const handleTitleChange = async (value: string) => {
        setValue('title', value);
        if (currentLoop && (mode === 'view' || mode === 'edit')) {
            await autoSave({ title: value });
        }
    };

    const autoSave = async (updates: Partial<LoopFormValues>) => {
        if (!currentLoop) return;

        try {
            const updatedLoop = {
                ...currentLoop,
                ...updates,
                categoryId: updates.categoryId || undefined,
            };

            const success = await updateLoop(currentLoop.id, updatedLoop);
            if (success) {
                setCurrentLoop(updatedLoop);
                await loadLoops(); // Refresh loops list
            }
        } catch (error) {
            console.error('Error auto-saving loop:', error);
        }
    };

    const handleEditPress = () => {
        setMode('edit');
    };

    const handleBackPress = () => {
        if (mode === 'edit' && currentLoop) {
            // Auto-save before going back
            handleSubmit(onSubmit)();
        }
        navigation.goBack();
    };

    const handleStartExecution = async () => {
        if (!currentLoop) return;

        try {
            // Check if there's an active execution first
            if (activeExecution && activeExecution.loop.id !== currentLoop.id) {
                // Show the new interruption modal instead of Alert
                setInterruptionLoop(currentLoop);
                setShowInterruptionModal(true);
                return;
            }

            await startNewLoopExecution();
        } catch (error) {
            console.error('Error starting loop execution:', error);
            Alert.alert('Error', 'Failed to start loop execution');
        }
    };

    const handleInterruptionContinueCurrentLoop = () => {
        setShowInterruptionModal(false);
        setInterruptionLoop(null);
        setShowExecutionScreen(true);
    };

    const handleInterruptionStartNewLoop = async () => {
        setShowInterruptionModal(false);
        if (interruptionLoop) {
            try {
                const success = await startLoopExecution(interruptionLoop.id);
                if (success) {
                    await loadActiveExecution();
                    setShowExecutionScreen(true);
                } else {
                    Alert.alert('Error', 'Failed to start loop execution');
                }
            } catch (error) {
                console.error('Error starting new loop execution:', error);
                Alert.alert('Error', 'Failed to start loop execution');
            }
        }
        setInterruptionLoop(null);
    };

    const handleInterruptionCancel = () => {
        setShowInterruptionModal(false);
        setInterruptionLoop(null);
    };

    const handleContinueExecution = () => {
        setShowExecutionScreen(true);
    };

    const handleLoopCreated = async (loop: Loop) => {
        setShowCreationFlow(false);

        // Reload loops to ensure we have the latest data
        await loadLoops();

        // Find the most recently created loop (since we don't have the actual ID)
        // This is a bit of a hack, but necessary since createLoop returns boolean
        const latestLoop = loops.length > 0 ? loops[0] : null;

        if (latestLoop) {
            setCurrentLoop(latestLoop);
            setLoopId(latestLoop.id);
            setMode('view');
            await loadLoopData(latestLoop.id);
        } else {
            // Fallback: try to create a mock loop object
            setCurrentLoop(loop);
            setLoopId(loop.id);
            setMode('view');
        }
    };

    const handleActivitySelect = async (activityInstance: Omit<LoopActivityInstance, 'id'>) => {
        if (!currentLoop) {
            setShowActivityPicker(false);
            return;
        }

        try {
            const success = await addLoopActivityInstance(currentLoop.id, activityInstance);

            if (success) {
                // Reload the loop data to get the updated activities
                await loadLoopData(currentLoop.id);
                setShowActivityPicker(false);
            } else {
                Alert.alert('Error', 'Failed to add activity to loop');
            }
        } catch (error) {
            console.error('Error adding activity to loop:', error);
            Alert.alert('Error', 'Failed to add activity to loop');
        }
    };

    const handleActivityReorder = async (reorderedInstances: LoopActivityInstance[]) => {
        if (!currentLoop) return;

        try {
            const instanceOrders = reorderedInstances.map((instance, index) => ({
                id: instance.id,
                order: index
            }));

            const success = await reorderActivityInstances(currentLoop.id, instanceOrders);
            if (success) {
                await loadLoopData(currentLoop.id);
            }
        } catch (error) {
            console.error('Error reordering activities:', error);
            Alert.alert('Error', 'Failed to reorder activities');
        }
    };

    const handleActivityRemoveFromPicker = async (instanceId: string) => {
        try {
            const success = await removeLoopActivityInstance(instanceId);
            if (success && currentLoop) {
                await loadLoopData(currentLoop.id);
            }
        } catch (error) {
            console.error('Error removing activity:', error);
            Alert.alert('Error', 'Failed to remove activity');
        }
    };

    const handleActivityEdit = async (instanceId: string, updates: Partial<LoopActivityInstance>) => {
        try {
            const success = await editLoopActivityInstance(instanceId, updates);
            if (success && currentLoop) {
                await loadLoopData(currentLoop.id);
            }
        } catch (error) {
            console.error('Error editing activity:', error);
            Alert.alert('Error', 'Failed to edit activity');
        }
    };

    const handleRemoveActivity = async (activityId: string) => {
        if (!currentLoop) return;

        Alert.alert(
            'Remove Activity',
            'Are you sure you want to remove this activity from the loop?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await removeLoopActivity(activityId);
                            if (success) {
                                // Reload the loop data
                                await loadLoopData(currentLoop.id);
                            } else {
                                Alert.alert('Error', 'Failed to remove activity');
                            }
                        } catch (error) {
                            console.error('Error removing activity:', error);
                            Alert.alert('Error', 'Failed to remove activity');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteLoop = async () => {
        if (!currentLoop) return;

        Alert.alert(
            'Delete Loop',
            `Are you sure you want to delete "${currentLoop.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await deleteLoop(currentLoop.id);
                            if (success) {
                                await loadLoops();
                                navigation.goBack();
                            } else {
                                Alert.alert('Error', 'Failed to delete loop');
                            }
                        } catch (error) {
                            console.error('Error deleting loop:', error);
                            Alert.alert('Error', 'Failed to delete loop');
                        }
                    },
                },
            ]
        );
    };

    const startNewLoopExecution = async () => {
        if (!currentLoop) return;

        try {
            const success = await startLoopExecution(currentLoop.id);
            if (success) {
                await loadActiveExecution();
                setShowExecutionScreen(true);
            } else {
                Alert.alert('Error', 'Failed to start loop execution');
            }
        } catch (error) {
            console.error('Error starting new loop execution:', error);
            Alert.alert('Error', 'Failed to start loop execution');
        }
    };

    const renderExecutionStatus = () => {
        if (!currentLoop) return null;

        const isCurrentlyExecuting = activeExecution && activeExecution.loop.id === currentLoop.id;

        if (isCurrentlyExecuting && currentActivityProgress && activeExecution) {
            return (
                <LoopExecutionStatusCard
                    loop={activeExecution.loop}
                    executionState={activeExecution.executionState}
                    currentActivityProgress={currentActivityProgress}
                    onContinueExecution={handleContinueExecution}
                    onCompleteLoop={async () => {
                        try {
                            await completeLoopExecution(currentLoop.id);
                            await loadLoops();
                        } catch (error) {
                            console.error('Error completing loop:', error);
                            Alert.alert('Error', 'Failed to complete loop');
                        }
                    }}
                />
            );
        }

        return null;
    };

    const renderLoopStats = () => {
        if (!currentLoop) return null;

        const totalActivities = currentLoop.activityInstances?.length || 0;
        const completedExecutions = 0; // TODO: Track execution history

        return (
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{totalActivities}</Text>
                    <Text style={styles.statLabel}>Activities</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{completedExecutions}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{currentLoop.active ? 'Active' : 'Inactive'}</Text>
                    <Text style={styles.statLabel}>Status</Text>
                </View>
            </View>
        );
    };

    const renderActivities = () => {
        if (!currentLoop || !currentLoop.activityInstances || currentLoop.activityInstances.length === 0) {
            return (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Activities</Text>
                    </View>
                    <View style={styles.activitiesContainer}>
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No activities added yet.{'\n'}
                                Add activities to build your loop.
                            </Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowActivityPicker(true)}
                            >
                                <Icon name="circle-plus" width={20} height={20} color={theme.colors.textSecondary} />
                                <Text style={styles.addButtonText}>Add Activity</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Activities ({currentLoop.activityInstances.length})</Text>
                    <TouchableOpacity onPress={() => setShowActivityPicker(true)}>
                        <Icon name="circle-plus" width={24} height={24} color={loopColor} />
                    </TouchableOpacity>
                </View>
                <View style={styles.activitiesContainer}>
                    {currentLoop.activityInstances.map((instance, index) => {
                        const template = activityTemplates.find(t => t.id === instance.templateId);
                        const displayTitle = instance.overriddenTitle || template?.title || `Activity ${index + 1}`;
                        const displayIcon = template?.icon || '📝';

                        return (
                            <View key={instance.id} style={styles.activityItem}>
                                <Text style={styles.activityIcon}>{displayIcon}</Text>
                                <View style={styles.activityInfo}>
                                    <Text style={styles.activityTitle}>{displayTitle}</Text>
                                    <Text style={styles.activityType}>
                                        {template?.type || 'custom'}
                                        {instance.durationMinutes && ` • ${instance.durationMinutes}min`}
                                        {instance.quantity && ` • ${instance.quantity.value} ${instance.quantity.unit}`}
                                    </Text>
                                </View>
                                {mode === 'edit' && (
                                    <View style={styles.activityActions}>
                                        <TouchableOpacity
                                            style={styles.removeActivityButton}
                                            onPress={() => handleActivityRemoveFromPicker(instance.id)}
                                        >
                                            <Icon name="x" width={20} height={20} color={theme.colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderActionButtons = () => {
        if (!currentLoop || !currentLoop.activityInstances || currentLoop.activityInstances.length === 0) {
            return null;
        }

        const isCurrentlyExecuting = activeExecution && activeExecution.loop.id === currentLoop.id;

        if (isCurrentlyExecuting) {
            return null; // Execution button is in the execution card
        }

        return (
            <TouchableOpacity
                style={styles.actionButton}
                onPress={handleStartExecution}
            >
                <Text style={styles.actionButtonText}>Start Loop Execution</Text>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType="Loop"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={loopColor} />
                    <Typography style={{ marginTop: 16, color: theme.colors.textSecondary }}>
                        Loading loop...
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    // Show creation flow for new loops
    if (mode === 'create' || (!currentLoop && showCreationFlow)) {
        return (
            <>
                <SafeAreaView style={styles.container}>
                    <EntryDetailHeader
                        onBackPress={() => navigation.goBack()}
                        entryType="Loop"
                    />
                    <View style={styles.loadingContainer}>
                        <Typography style={{ color: theme.colors.textSecondary }}>
                            Creating new loop...
                        </Typography>
                    </View>
                </SafeAreaView>
                <LoopCreationFlow
                    visible={true}
                    onClose={() => navigation.goBack()}
                    onLoopCreated={handleLoopCreated}
                />
            </>
        );
    }

    if (!currentLoop) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType="Loop"
                />
                <View style={styles.loadingContainer}>
                    <Typography style={{ color: theme.colors.error }}>
                        Loop not found
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <EntryDetailHeader
                isStarred={currentLoop.isStarred}
                onStarPress={() => {/* TODO: Implement star toggle */ }}
                showEditButton={mode === 'view'}
                onEditPress={handleEditPress}
                onBackPress={handleBackPress}
                onDuplicatePress={() => {/* TODO: Implement duplicate */ }}
                onArchivePress={() => {/* TODO: Implement archive */ }}
                onHidePress={handleDeleteLoop}
                isSaved={!!currentLoop.id && mode === 'view'}
                entryType="Loop"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Title Input */}
                    <EntryTitleInput
                        name="title"
                        control={control}
                        placeholder="Loop title..."
                        editable={mode === 'edit'}
                        onChangeText={mode === 'view' ? handleTitleChange : undefined}
                    />

                    {/* Metadata Bar */}
                    <EntryMetadataBar
                        categoryId={categoryId}
                        onCategoryChange={handleCategoryChange}
                        labels={tags}
                        onLabelsChange={handleLabelsChange}
                        isEditing={mode === 'edit' || mode === 'view'}
                    />

                    {/* Execution Status */}
                    {renderExecutionStatus()}

                    {/* Loop Statistics */}
                    {renderLoopStats()}

                    {/* Activities */}
                    {renderActivities()}

                    {/* Action Buttons */}
                    {renderActionButtons()}

                    {/* Extra space at the bottom */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save button for edit mode only (create mode uses creation flow) */}
            {mode === 'edit' && (
                <View style={styles.bottomContainer}>
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Activity Picker */}
            <ActivityPicker
                visible={showActivityPicker}
                onClose={() => setShowActivityPicker(false)}
                onSelectActivity={handleActivitySelect}
                selectedActivityInstances={currentLoop.activityInstances || []}
                onReorderActivities={handleActivityReorder}
                onRemoveActivity={handleActivityRemoveFromPicker}
                onEditActivity={handleActivityEdit}
            />

            {/* Loop Execution Screen */}
            <LoopExecutionScreen
                visible={showExecutionScreen}
                onClose={() => setShowExecutionScreen(false)}
            />

            {/* Loop Interruption Modal */}
            <LoopInterruptionModal
                visible={showInterruptionModal}
                currentLoop={activeExecution?.loop || currentLoop}
                newLoop={interruptionLoop || currentLoop}
                onContinueCurrentLoop={handleInterruptionContinueCurrentLoop}
                onStartNewLoop={handleInterruptionStartNewLoop}
                onCancel={handleInterruptionCancel}
            />
        </SafeAreaView>
    );
} 