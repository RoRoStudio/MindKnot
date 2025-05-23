import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    StatusBar,
    Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { Typography, Icon } from '../../components/common';
import { EntryDetailHeader, EntryMetadataBar, EntryTitleInput } from '../../components/entries';
import { ActionCard } from '../../components/entries/actions/ActionCard';
import { MilestoneSection, ActionEmbedSheet } from '../../components/entries/paths';
import {
    createPath,
    updatePath,
    getPathById,
    createMilestone,
    getMilestonesByPath,
    getPathActions
} from '../../api/pathService';
import { createAction } from '../../api/actionService';
import { RootStackParamList } from '../../types/navigation-types';
import { usePaths } from '../../hooks/usePaths';
import { Path, Milestone } from '../../types/path';
import { Action } from '../../types/action';

type PathScreenMode = 'create' | 'edit' | 'view';

type PathScreenRouteProp = RouteProp<
    {
        PathScreen: {
            mode: PathScreenMode;
            id?: string;
        };
    },
    'PathScreen'
>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PathFormValues {
    title: string;
    description: string;
    target: string;
    expectedDuration: string;
    tags: string[];
    categoryId: string | null;
}

export default function PathScreen() {
    const route = useRoute<PathScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { loadPaths } = usePaths();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<PathScreenMode>('create');
    const [pathId, setPathId] = useState<string | undefined>(undefined);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [ungroupedActions, setUngroupedActions] = useState<Action[]>([]);
    const [showActionEmbedSheet, setShowActionEmbedSheet] = useState(false);
    const [embedTargetMilestone, setEmbedTargetMilestone] = useState<string | undefined>();

    // Set up form with default values
    const { control, handleSubmit, reset, getValues, setValue, watch } = useForm<PathFormValues>({
        defaultValues: {
            title: '',
            description: '',
            target: '',
            expectedDuration: '',
            tags: [],
            categoryId: null,
        },
        mode: 'onChange'
    });

    const categoryId = watch('categoryId');
    const tags = watch('tags');

    // Initialize from route params
    useEffect(() => {
        if (route.params) {
            const { mode: routeMode, id } = route.params;
            setMode(routeMode);
            setPathId(id);

            if ((routeMode === 'edit' || routeMode === 'view') && id) {
                loadPathData(id);
            }
        }
    }, [route.params]);

    // Load path data for edit or view mode
    const loadPathData = async (id: string) => {
        try {
            setIsLoading(true);
            const path = await getPathById(id);

            if (path) {
                reset({
                    title: path.title,
                    description: path.description || '',
                    target: path.target || '',
                    expectedDuration: path.expectedDuration || '',
                    tags: path.tags || [],
                    categoryId: path.categoryId || null,
                });

                // Load milestones and actions
                await loadMilestonesAndActions(id);
            } else {
                Alert.alert('Error', 'Path not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading path:', error);
            Alert.alert('Error', 'Failed to load path');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const loadMilestonesAndActions = async (pathId: string) => {
        try {
            const [milestonesData, ungroupedActionsData] = await Promise.all([
                getMilestonesByPath(pathId),
                getPathActions(pathId) // This gets ungrouped actions (parentType = 'path')
            ]);

            setMilestones(milestonesData);
            setUngroupedActions(ungroupedActionsData);
        } catch (error) {
            console.error('Error loading milestones and actions:', error);
        }
    };

    // Handle form submission for path metadata
    const onSubmit = async (data: PathFormValues) => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            const pathData = {
                title: data.title,
                description: data.description,
                target: data.target,
                expectedDuration: data.expectedDuration,
                tags: data.tags,
                categoryId: data.categoryId || undefined,
                type: 'path' as const,
            };

            let success;
            if (mode === 'edit' && pathId) {
                success = await updatePath(pathId, pathData);
            } else {
                const newPath = await createPath(pathData);
                success = !!newPath;
                if (success && newPath) {
                    setPathId(newPath.id);
                    setMode('view');
                }
            }

            if (success) {
                await loadPaths(); // Refresh paths list immediately
                if (mode === 'edit') {
                    setMode('view');
                }
            } else {
                Alert.alert('Error', 'Failed to save the path. Please try again.');
            }
        } catch (error) {
            console.error('Error handling path:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle metadata changes in edit/view mode (auto-save)
    const handleCategoryChange = async (newCategoryId: string | null) => {
        setValue('categoryId', newCategoryId);
        if (pathId && (mode === 'view' || mode === 'edit')) {
            await autoSave({ categoryId: newCategoryId });
            await loadPaths(); // Refresh paths list
        }
    };

    const handleLabelsChange = async (newLabels: string[]) => {
        setValue('tags', newLabels);
        if (pathId && (mode === 'view' || mode === 'edit')) {
            await autoSave({ tags: newLabels });
            await loadPaths(); // Refresh paths list
        }
    };

    const handleTitleChange = async (value: string) => {
        setValue('title', value);
        if (pathId && (mode === 'view' || mode === 'edit')) {
            await autoSave({ title: value });
            await loadPaths(); // Refresh paths list
        }
    };

    const autoSave = async (updates: Partial<PathFormValues>) => {
        if (!pathId) return;

        try {
            const currentData = getValues();
            const pathData = {
                ...currentData,
                ...updates,
                categoryId: updates.categoryId || currentData.categoryId || undefined,
                type: 'path' as const,
            };
            await updatePath(pathId, pathData);
        } catch (error) {
            console.error('Error auto-saving path:', error);
        }
    };

    // Switch to edit mode from view mode
    const handleEditPress = () => {
        setMode('edit');
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    // Milestone management
    const handleCreateMilestone = async () => {
        // Auto-save path if not saved yet
        if (!pathId) {
            await autoSavePath();
            if (!pathId) return; // If auto-save failed, don't proceed
        }

        try {
            const newMilestone = await createMilestone(pathId, 'New Milestone');
            await loadMilestonesAndActions(pathId);
            await loadPaths(); // Refresh paths list
        } catch (error) {
            console.error('Error creating milestone:', error);
            Alert.alert('Error', 'Failed to create milestone');
        }
    };

    const handleMilestoneUpdate = async (updatedMilestone: Milestone) => {
        setMilestones(prev =>
            prev.map(m => m.id === updatedMilestone.id ? updatedMilestone : m)
        );
        await loadPaths(); // Refresh paths list
    };

    const handleMilestoneDelete = async (milestoneId: string) => {
        setMilestones(prev => prev.filter(m => m.id !== milestoneId));
        // Reload ungrouped actions as deleted milestone actions become ungrouped
        if (pathId) {
            await loadMilestonesAndActions(pathId);
        }
        await loadPaths(); // Refresh paths list
    };

    // Action management
    const handleCreateUngroupedAction = async () => {
        // Auto-save path if not saved yet
        if (!pathId) {
            await autoSavePath();
            if (!pathId) return; // If auto-save failed, don't proceed
        }

        try {
            await createAction({
                title: 'New Action',
                description: '',
                done: false,
                completed: false,
                priority: 0,
                tags: [],
                parentId: pathId,
                parentType: 'path'
            });

            await loadMilestonesAndActions(pathId);
            await loadPaths(); // Refresh paths list
        } catch (error) {
            console.error('Error creating ungrouped action:', error);
            Alert.alert('Error', 'Failed to create action');
        }
    };

    const handleLinkExistingAction = async (milestoneId?: string) => {
        // Auto-save path if not saved yet
        if (!pathId) {
            await autoSavePath();
            if (!pathId) return; // If auto-save failed, don't proceed
        }

        setEmbedTargetMilestone(milestoneId);
        setShowActionEmbedSheet(true);
    };

    const handleActionLinked = async () => {
        if (pathId) {
            await loadMilestonesAndActions(pathId);
            await loadPaths(); // Refresh paths list
        }
    };

    const handleActionUpdate = async () => {
        if (pathId) {
            await loadMilestonesAndActions(pathId);
            await loadPaths(); // Refresh paths list
        }
    };

    const handleActionToggleDone = async (actionId: string) => {
        await loadMilestonesAndActions(pathId!);
        await loadPaths(); // Refresh paths list
    };

    // Auto-save function for when path doesn't exist yet
    const autoSavePath = async () => {
        if (pathId) return; // Already saved

        try {
            const currentData = getValues();
            if (!currentData.title.trim()) {
                currentData.title = 'New Path'; // Set default title if empty
                setValue('title', 'New Path');
            }

            const pathData = {
                title: currentData.title,
                description: currentData.description,
                target: currentData.target,
                expectedDuration: currentData.expectedDuration,
                tags: currentData.tags,
                categoryId: currentData.categoryId || undefined,
                type: 'path' as const,
            };

            const newPath = await createPath(pathData);
            if (newPath) {
                setPathId(newPath.id);
                setMode('view');
                await loadPaths(); // Update paths list
            }
        } catch (error) {
            console.error('Error auto-saving path:', error);
            Alert.alert('Error', 'Failed to save path automatically');
        }
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: '#FFFFFF',
        },
        container: {
            flex: 1,
            backgroundColor: '#FFFFFF',
        },
        content: {
            flex: 1,
        },
        titleInput: {
            fontSize: 32,
            fontWeight: '300',
            color: '#000000',
            padding: 16,
            paddingTop: 16,
            paddingBottom: 16,
            fontFamily: 'KantumruyPro-Bold',
        },
        divider: {
            height: 1,
            backgroundColor: '#EEEEEE',
            marginHorizontal: 16,
        },
        sectionsContainer: {
            padding: 16,
        },
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            marginTop: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#111827',
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: '#F3F4F6',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderStyle: 'dashed',
        },
        addButtonText: {
            fontSize: 14,
            color: '#6B7280',
            marginLeft: 6,
            fontWeight: '500',
        },
        ungroupedSection: {
            marginTop: 16,
        },
        ungroupedHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        ungroupedTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginLeft: 8,
        },
        actionsContainer: {
            gap: 12,
        },
        addActionsRow: {
            flexDirection: 'row',
            gap: 8,
            marginTop: 12,
        },
        emptyState: {
            alignItems: 'center',
            padding: 32,
        },
        emptyIcon: {
            marginBottom: 12,
        },
        emptyTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 4,
        },
        emptyText: {
            fontSize: 14,
            color: '#6B7280',
            textAlign: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        bottomContainer: {
            padding: 16,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: '#F5F5F5',
        },
        saveButton: {
            backgroundColor: '#1B1B1B',
            borderRadius: 32,
            paddingVertical: 16,
            alignItems: 'center',
        },
        saveButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            fontFamily: 'KantumruyPro-SemiBold',
        },
    });

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType="Path"
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    const isEditing = mode === 'edit' || mode === 'create';
    const headerTitle = mode === 'create' ? 'New Path' : 'Path';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <View style={styles.container}>
                <EntryDetailHeader
                    onBackPress={handleBackPress}
                    entryType={headerTitle}
                    showEditButton={mode === 'view'}
                    onEditPress={handleEditPress}
                    isSaved={!!pathId}
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
                            placeholder="Path title"
                            editable={isEditing}
                            onChangeText={handleTitleChange}
                        />

                        <View style={styles.divider} />

                        {/* Path content sections */}
                        <View style={styles.sectionsContainer}>
                            {/* Milestones Section */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Milestones</Text>
                                {isEditing && (
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={handleCreateMilestone}
                                    >
                                        <Icon name="plus" width={16} height={16} color="#6B7280" />
                                        <Text style={styles.addButtonText}>Add Milestone</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {milestones.length > 0 ? (
                                milestones.map((milestone) => (
                                    <MilestoneSection
                                        key={milestone.id}
                                        milestone={milestone}
                                        onMilestoneUpdate={handleMilestoneUpdate}
                                        onMilestoneDelete={handleMilestoneDelete}
                                        onActionUpdate={handleActionUpdate}
                                        onLinkExistingAction={handleLinkExistingAction}
                                        isEditing={isEditing}
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Icon name="flag" width={48} height={48} color="#D1D5DB" style={styles.emptyIcon} />
                                    <Text style={styles.emptyTitle}>No milestones yet</Text>
                                    <Text style={styles.emptyText}>
                                        Create milestones to organize your actions into logical phases
                                    </Text>
                                </View>
                            )}

                            {/* Ungrouped Actions Section */}
                            <View style={styles.ungroupedSection}>
                                <View style={styles.ungroupedHeader}>
                                    <Icon name="list" width={20} height={20} color="#6B7280" />
                                    <Text style={styles.ungroupedTitle}>Ungrouped Actions</Text>
                                </View>

                                {ungroupedActions.length > 0 ? (
                                    <View style={styles.actionsContainer}>
                                        {ungroupedActions.map((action) => (
                                            <ActionCard
                                                key={action.id}
                                                action={action}
                                                onToggleDone={handleActionToggleDone}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View style={[styles.emptyState, { paddingVertical: 16 }]}>
                                        <Text style={styles.emptyText}>No ungrouped actions</Text>
                                    </View>
                                )}

                                {isEditing && (
                                    <View style={styles.addActionsRow}>
                                        <TouchableOpacity
                                            style={[styles.addButton, { flex: 1 }]}
                                            onPress={handleCreateUngroupedAction}
                                        >
                                            <Icon name="plus" width={16} height={16} color="#6B7280" />
                                            <Text style={styles.addButtonText}>Add Action</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.addButton, { flex: 1 }]}
                                            onPress={() => handleLinkExistingAction()}
                                        >
                                            <Icon name="link" width={16} height={16} color="#6B7280" />
                                            <Text style={styles.addButtonText}>Link Existing</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Extra space at the bottom */}
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    {/* Save button for create/edit modes */}
                    {(mode === 'create' || mode === 'edit') && (
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleSubmit(onSubmit)}
                                disabled={isSubmitting}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Path' : 'Save Changes'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </View>

            {/* Action Embed Sheet */}
            <ActionEmbedSheet
                visible={showActionEmbedSheet}
                onClose={() => setShowActionEmbedSheet(false)}
                pathId={pathId || ''}
                milestoneId={embedTargetMilestone}
                onActionLinked={handleActionLinked}
            />
        </SafeAreaView>
    );
} 