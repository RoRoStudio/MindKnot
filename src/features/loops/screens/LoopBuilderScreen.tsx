/**
 * LoopBuilderScreen
 * 
 * Comprehensive interface for creating and editing loops.
 * Provides activity management, settings configuration, and validation.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    TextInput,
    Card,
    Switch,
    Icon
} from '../../../shared/components';
import { Loop, Activity, ActivityType, BuilderState } from '../../../shared/types/loop';
import { ActivityBuilder } from '../components/ActivityBuilder';
import { ActivityList } from '../components/ActivityList';
import { LoopSettings } from '../components/LoopSettings';
import { LoopPreview } from '../components/LoopPreview';
import { useLoops } from '../hooks/useLoops';
import { useLoopBuilder } from '../hooks/useLoopBuilder';

export interface LoopBuilderScreenProps {
    navigation: any;
    route: {
        params?: {
            loopId?: string;
        };
    };
}

export const LoopBuilderScreen: React.FC<LoopBuilderScreenProps> = ({
    navigation,
    route
}) => {
    const loopId = route.params?.loopId;
    const isEditing = !!loopId;

    const [activeTab, setActiveTab] = useState<'details' | 'activities' | 'settings' | 'preview'>('details');
    const [showActivityBuilder, setShowActivityBuilder] = useState(false);
    const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { getLoop, createLoop, updateLoop } = useLoops();

    const {
        builderState,
        updateTitle,
        updateDescription,
        updateTags,
        addActivity,
        updateActivity,
        removeActivity,
        reorderActivities,
        updateSettings,
        validateLoop,
        resetBuilder,
        loadLoop,
        getEstimatedDuration,
    } = useLoopBuilder();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            marginBottom: theme.spacing.s,
        },
        tabContainer: {
            flexDirection: 'row',
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        tab: {
            flex: 1,
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.s,
            alignItems: 'center',
        },
        activeTab: {
            backgroundColor: theme.colors.primary,
        },
        tabText: {
            fontSize: theme.typography.fontSize.s,
        },
        activeTabText: {
            color: theme.colors.onPrimary,
            fontWeight: 'bold',
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
        sectionTitle: {
            marginBottom: theme.spacing.m,
        },
        inputGroup: {
            marginBottom: theme.spacing.m,
        },
        label: {
            marginBottom: theme.spacing.s,
        },
        textInput: {
            marginBottom: theme.spacing.m,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: theme.spacing.s,
        },
        tag: {
            backgroundColor: theme.colors.surfaceVariant,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
        },
        tagText: {
            fontSize: theme.typography.fontSize.s,
            marginRight: theme.spacing.xs,
        },
        removeTagButton: {
            padding: theme.spacing.xs,
        },
        addActivityButton: {
            marginBottom: theme.spacing.m,
        },
        emptyActivities: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
            padding: theme.spacing.l,
        },
        validationError: {
            backgroundColor: theme.colors.errorContainer,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.m,
        },
        validationErrorText: {
            color: theme.colors.onErrorContainer,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            padding: theme.spacing.m,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        actionButton: {
            flex: 1,
        },
    }));

    // Load existing loop data if editing
    useFocusEffect(
        useCallback(() => {
            if (isEditing && loopId) {
                loadExistingLoop();
            } else {
                resetBuilder();
            }
        }, [isEditing, loopId])
    );

    const loadExistingLoop = useCallback(async () => {
        try {
            const loop = await getLoop(loopId!);
            if (loop) {
                loadLoop(loop);
            } else {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Failed to load loop:', error);
            Alert.alert('Error', 'Failed to load loop data');
            navigation.goBack();
        }
    }, [loopId, getLoop, loadLoop, navigation]);

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);

            // Validate the loop
            const validation = validateLoop();
            if (!validation.isValid) {
                Alert.alert('Validation Error', validation.errors.join('\n'));
                return;
            }

            // Create loop object
            const loopData: Partial<Loop> = {
                title: builderState.title,
                description: builderState.description,
                activities: builderState.activities,
                tags: builderState.tags,
                isRepeating: builderState.settings.isRepeating,
                repeatCycles: builderState.settings.repeatCycles,
                estimatedDuration: getEstimatedDuration(),
                backgroundExecution: builderState.settings.backgroundExecution,
                notifications: builderState.settings.notifications,
            };

            if (isEditing && loopId) {
                await updateLoop(loopId, loopData);
                Alert.alert('Success', 'Loop updated successfully');
            } else {
                await createLoop(loopData as Omit<Loop, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'lastExecutedAt'>);
                Alert.alert('Success', 'Loop created successfully');
            }

            navigation.goBack();
        } catch (error) {
            console.error('Failed to save loop:', error);
            Alert.alert('Error', 'Failed to save loop. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [builderState, validateLoop, getEstimatedDuration, isEditing, loopId, updateLoop, createLoop, navigation]);

    const handleCancel = useCallback(() => {
        if (hasUnsavedChanges()) {
            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to leave?',
                [
                    { text: 'Stay', style: 'cancel' },
                    { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
                ]
            );
        } else {
            navigation.goBack();
        }
    }, [navigation]);

    const hasUnsavedChanges = useCallback((): boolean => {
        // Check if there are any changes from the initial state
        return builderState.title.trim() !== '' ||
            builderState.description.trim() !== '' ||
            builderState.activities.length > 0 ||
            builderState.tags.length > 0;
    }, [builderState]);

    const handleAddActivity = useCallback(() => {
        setEditingActivity(null);
        setShowActivityBuilder(true);
    }, []);

    const handleEditActivity = useCallback((activity: Activity) => {
        setEditingActivity(activity);
        setShowActivityBuilder(true);
    }, []);

    const handleActivitySave = useCallback((activity: Activity) => {
        if (editingActivity) {
            updateActivity(editingActivity.id, activity);
        } else {
            addActivity(activity);
        }
        setShowActivityBuilder(false);
        setEditingActivity(null);
    }, [editingActivity, updateActivity, addActivity]);

    const handleActivityCancel = useCallback(() => {
        setShowActivityBuilder(false);
        setEditingActivity(null);
    }, []);

    const handleRemoveActivity = useCallback((activityId: string) => {
        Alert.alert(
            'Remove Activity',
            'Are you sure you want to remove this activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => removeActivity(activityId) },
            ]
        );
    }, [removeActivity]);

    const handleAddTag = useCallback((tag: string) => {
        if (tag.trim() && !builderState.tags.includes(tag.trim())) {
            updateTags([...builderState.tags, tag.trim()]);
        }
    }, [builderState.tags, updateTags]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        updateTags(builderState.tags.filter(tag => tag !== tagToRemove));
    }, [builderState.tags, updateTags]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return renderDetailsTab();
            case 'activities':
                return renderActivitiesTab();
            case 'settings':
                return renderSettingsTab();
            case 'preview':
                return renderPreviewTab();
            default:
                return null;
        }
    };

    const renderDetailsTab = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
                <Typography variant="h3" style={styles.sectionTitle}>
                    Basic Information
                </Typography>

                <View style={styles.inputGroup}>
                    <Typography variant="body2" style={styles.label}>
                        Title *
                    </Typography>
                    <TextInput
                        value={builderState.title}
                        onChangeText={updateTitle}
                        placeholder="Enter loop title"
                        style={styles.textInput}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Typography variant="body2" style={styles.label}>
                        Description
                    </Typography>
                    <TextInput
                        value={builderState.description}
                        onChangeText={updateDescription}
                        placeholder="Enter loop description"
                        multiline
                        numberOfLines={3}
                        style={styles.textInput}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Typography variant="body2" style={styles.label}>
                        Tags
                    </Typography>
                    <TextInput
                        placeholder="Add a tag and press enter"
                        onSubmitEditing={(event) => {
                            handleAddTag(event.nativeEvent.text);
                            event.target.clear();
                        }}
                        style={styles.textInput}
                    />

                    {builderState.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            {builderState.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Typography style={styles.tagText}>{tag}</Typography>
                                    <Button
                                        variant="ghost"
                                        leftIcon="x"
                                        onPress={() => handleRemoveTag(tag)}
                                        style={styles.removeTagButton}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );

    const renderActivitiesTab = () => (
        <View style={styles.content}>
            <View style={styles.scrollContent}>
                <Button
                    variant="primary"
                    label="Add Activity"
                    leftIcon="plus"
                    onPress={handleAddActivity}
                    style={styles.addActivityButton}
                />

                {builderState.activities.length > 0 ? (
                    <ActivityList
                        activities={builderState.activities}
                        onEdit={handleEditActivity}
                        onRemove={handleRemoveActivity}
                        onReorder={reorderActivities}
                        showReorderControls={true}
                    />
                ) : (
                    <Typography variant="body2" style={styles.emptyActivities}>
                        No activities added yet. Add your first activity to get started.
                    </Typography>
                )}
            </View>

            {showActivityBuilder && (
                <ActivityBuilder
                    activity={editingActivity}
                    onSave={handleActivitySave}
                    onCancel={handleActivityCancel}
                />
            )}
        </View>
    );

    const renderSettingsTab = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <LoopSettings
                settings={builderState.settings}
                onSettingsChange={updateSettings}
            />
        </ScrollView>
    );

    const renderPreviewTab = () => (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <LoopPreview
                builderState={builderState}
                estimatedDuration={getEstimatedDuration()}
            />
        </ScrollView>
    );

    const renderValidationErrors = () => {
        const validation = validateLoop();
        if (validation.isValid) return null;

        return (
            <View style={styles.validationError}>
                <Typography variant="body2" style={styles.validationErrorText}>
                    Please fix the following issues:
                </Typography>
                {validation.errors.map((error, index) => (
                    <Typography key={index} variant="body2" style={styles.validationErrorText}>
                        • {error}
                    </Typography>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Typography variant="h2" style={styles.headerTitle}>
                    {isEditing ? 'Edit Loop' : 'Create Loop'}
                </Typography>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {[
                    { key: 'details', label: 'Details' },
                    { key: 'activities', label: 'Activities' },
                    { key: 'settings', label: 'Settings' },
                    { key: 'preview', label: 'Preview' },
                ].map((tab) => (
                    <Button
                        key={tab.key}
                        variant="ghost"
                        label={tab.label}
                        onPress={() => setActiveTab(tab.key as any)}
                        style={[
                            styles.tab,
                            activeTab === tab.key && styles.activeTab,
                        ]}
                        textStyle={[
                            styles.tabText,
                            activeTab === tab.key && styles.activeTabText,
                        ]}
                    />
                ))}
            </View>

            {/* Validation Errors */}
            {renderValidationErrors()}

            {/* Tab Content */}
            {renderTabContent()}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <Button
                    variant="secondary"
                    label="Cancel"
                    onPress={handleCancel}
                    style={styles.actionButton}
                />
                <Button
                    variant="primary"
                    label={isEditing ? 'Update Loop' : 'Create Loop'}
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.actionButton}
                />
            </View>
        </View>
    );
}; 