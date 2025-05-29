/**
 * LoopTestScreen - Test screen to verify loop functionality
 * This screen tests all the major loop components and hooks
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    Card,
    EntryDetailHeader,
} from '../../../shared/components';
import { ActivityTemplateSelector } from '../components/ActivityTemplateSelector';
import { ActivityInstanceEditor } from '../components/ActivityInstanceEditor';
import { LoopPreviewCard } from '../components/LoopPreviewCard';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { useLoops } from '../hooks/useLoops';
import { useLoopExecution } from '../hooks/useLoopExecution';
import { ActivityInstance, ActivityTemplate, Loop } from '../../../shared/types/loop';
import { generateUUID } from '../../../shared/utils/uuid';

export default function LoopTestScreen() {
    const { templates, categories, getTemplatesByCategory } = useActivityTemplates();
    const { loops, createLoop, isLoading: loopsLoading } = useLoops();
    const { startExecution, currentSession, isExecuting } = useLoopExecution();

    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    const [activities, setActivities] = useState<ActivityInstance[]>([]);
    const [editingActivity, setEditingActivity] = useState<ActivityInstance | null>(null);
    const [testLoop, setTestLoop] = useState<Loop | null>(null);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            padding: theme.spacing.m,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.m,
        },
        statsCard: {
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        statRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        statLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
        },
        statValue: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        button: {
            flex: 1,
        },
        activityList: {
            marginTop: theme.spacing.m,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.s,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        activityEmoji: {
            fontSize: 24,
            marginRight: theme.spacing.m,
        },
        activityContent: {
            flex: 1,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
        },
        activityMeta: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
    }));

    // Handle template selection
    const handleTemplateToggle = (templateId: string) => {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        if (selectedTemplateIds.includes(templateId)) {
            // Remove template
            setSelectedTemplateIds(prev => prev.filter(id => id !== templateId));
            setActivities(prev => prev.filter(a => a.templateId !== templateId));
        } else {
            // Add template
            setSelectedTemplateIds(prev => [...prev, templateId]);

            const newActivity: ActivityInstance = {
                id: generateUUID(),
                templateId: template.id,
                title: undefined,
                quantity: undefined,
                duration: undefined,
                subItems: undefined,
                linkedTarget: template.linkedTarget,
                order: activities.length,
                status: 'pending' as const,
            };

            setActivities(prev => [...prev, newActivity]);
        }
    };

    // Handle activity update
    const handleActivityUpdate = (updatedActivity: ActivityInstance) => {
        setActivities(prev =>
            prev.map(a => a.id === updatedActivity.id ? updatedActivity : a)
        );
        setEditingActivity(null);
    };

    // Create test loop
    const handleCreateTestLoop = async () => {
        if (activities.length === 0) {
            Alert.alert('Error', 'Please add some activities first');
            return;
        }

        try {
            const loopData = {
                title: 'Test Loop',
                description: 'A test loop created from the test screen',
                activities,
                tags: ['test'],
                categoryId: undefined,
                backgroundExecution: true,
                notifications: {
                    enabled: true,
                    activityReminders: true,
                    sessionProgress: true,
                    completionCelebration: true,
                    soundEnabled: true,
                    vibrationEnabled: true,
                    persistentOverlay: true,
                },
                scheduling: undefined,
            };

            const newLoop = await createLoop(loopData);
            if (newLoop) {
                setTestLoop(newLoop);
                Alert.alert('Success', 'Test loop created successfully!');
            } else {
                Alert.alert('Error', 'Failed to create test loop');
            }
        } catch (error) {
            console.error('Error creating test loop:', error);
            Alert.alert('Error', 'An error occurred while creating the test loop');
        }
    };

    // Start execution
    const handleStartExecution = async () => {
        if (!testLoop) {
            Alert.alert('Error', 'Please create a test loop first');
            return;
        }

        try {
            await startExecution(testLoop);
            Alert.alert('Success', 'Loop execution started!');
        } catch (error) {
            console.error('Error starting execution:', error);
            Alert.alert('Error', 'Failed to start loop execution');
        }
    };

    // Clear test data
    const handleClearTest = () => {
        setSelectedTemplateIds([]);
        setActivities([]);
        setEditingActivity(null);
        setTestLoop(null);
    };

    // Create simple test loop
    const handleCreateSimpleTestLoop = async () => {
        try {
            const loopData = {
                title: 'Simple Test Loop',
                description: 'A simple test loop created from the test screen',
                activities: [
                    {
                        id: generateUUID(),
                        templateId: templates[0].id,
                        title: 'Activity 1',
                        quantity: { number: 1, unit: 'unit' },
                        duration: 30,
                        subItems: undefined,
                        linkedTarget: undefined,
                        order: 0,
                        status: 'pending' as const,
                    },
                    {
                        id: generateUUID(),
                        templateId: templates[1].id,
                        title: 'Activity 2',
                        quantity: { number: 2, unit: 'units' },
                        duration: 45,
                        subItems: undefined,
                        linkedTarget: undefined,
                        order: 1,
                        status: 'pending' as const,
                    },
                ],
                tags: ['test'],
                categoryId: undefined,
                backgroundExecution: true,
                notifications: {
                    enabled: true,
                    activityReminders: true,
                    sessionProgress: true,
                    completionCelebration: true,
                    soundEnabled: true,
                    vibrationEnabled: true,
                    persistentOverlay: true,
                },
                scheduling: undefined,
            };

            const newLoop = await createLoop(loopData);
            if (newLoop) {
                setTestLoop(newLoop);
                Alert.alert('Success', 'Simple test loop created successfully!');
            } else {
                Alert.alert('Error', 'Failed to create simple test loop');
            }
        } catch (error) {
            console.error('Error creating simple test loop:', error);
            Alert.alert('Error', 'An error occurred while creating the simple test loop');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <EntryDetailHeader
                entryType="Loop Test"
                onBackPress={() => {/* navigation.goBack() */ }}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Statistics */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        System Statistics
                    </Typography>
                    <Card style={styles.statsCard}>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Templates Available:</Typography>
                            <Typography style={styles.statValue}>{templates.length}</Typography>
                        </View>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Categories:</Typography>
                            <Typography style={styles.statValue}>{categories.length}</Typography>
                        </View>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Loops Created:</Typography>
                            <Typography style={styles.statValue}>{loops.length}</Typography>
                        </View>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Selected Templates:</Typography>
                            <Typography style={styles.statValue}>{selectedTemplateIds.length}</Typography>
                        </View>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Activities:</Typography>
                            <Typography style={styles.statValue}>{activities.length}</Typography>
                        </View>
                        <View style={styles.statRow}>
                            <Typography style={styles.statLabel}>Execution Status:</Typography>
                            <Typography style={styles.statValue}>
                                {isExecuting ? 'Running' : 'Idle'}
                            </Typography>
                        </View>
                    </Card>
                </View>

                {/* Template Selection */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        Template Selection Test
                    </Typography>
                    <ActivityTemplateSelector
                        selectedTemplateIds={selectedTemplateIds}
                        onTemplateToggle={handleTemplateToggle}
                        multiSelect={true}
                    />
                </View>

                {/* Selected Activities */}
                {activities.length > 0 && (
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Selected Activities ({activities.length})
                        </Typography>
                        <View style={styles.activityList}>
                            {activities.map((activity, index) => {
                                const template = templates.find(t => t.id === activity.templateId);
                                return (
                                    <View key={activity.id} style={styles.activityItem}>
                                        <Typography style={styles.activityEmoji}>
                                            {template?.emoji || '⚡'}
                                        </Typography>
                                        <View style={styles.activityContent}>
                                            <Typography style={styles.activityTitle}>
                                                {index + 1}. {activity.title || template?.title || 'Untitled'}
                                            </Typography>
                                            <Typography style={styles.activityMeta}>
                                                {activity.duration ? `${activity.duration} min` : 'No duration'}
                                                {activity.quantity && ` • ${activity.quantity.number} ${activity.quantity.unit}`}
                                            </Typography>
                                        </View>
                                        <Button
                                            variant="text"
                                            label="Edit"
                                            size="small"
                                            onPress={() => setEditingActivity(activity)}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Activity Editor */}
                {editingActivity && (
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Activity Editor Test
                        </Typography>
                        <ActivityInstanceEditor
                            activityInstance={editingActivity}
                            template={templates.find(t => t.id === editingActivity.templateId)!}
                            onUpdate={handleActivityUpdate}
                        />
                    </View>
                )}

                {/* Loop Preview */}
                {activities.length > 0 && (
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Loop Preview Test
                        </Typography>
                        <LoopPreviewCard
                            title="Test Loop"
                            description="A test loop created from the test screen"
                            activities={activities}
                            templates={templates}
                        />
                    </View>
                )}

                {/* Actions */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        Actions
                    </Typography>

                    <View style={styles.buttonRow}>
                        <Button
                            variant="primary"
                            label="Create Test Loop"
                            onPress={handleCreateTestLoop}
                            disabled={activities.length === 0 || loopsLoading}
                            isLoading={loopsLoading}
                            style={styles.button}
                        />
                        <Button
                            variant="secondary"
                            label="Start Execution"
                            onPress={handleStartExecution}
                            disabled={!testLoop || isExecuting}
                            style={styles.button}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <Button
                            variant="outline"
                            label="Create Simple Test Loop"
                            onPress={handleCreateSimpleTestLoop}
                            disabled={loopsLoading}
                            isLoading={loopsLoading}
                            style={styles.button}
                        />
                    </View>

                    <Button
                        variant="outline"
                        label="Clear Test Data"
                        onPress={handleClearTest}
                        fullWidth
                    />
                </View>

                {/* Current Session Info */}
                {currentSession && (
                    <View style={styles.section}>
                        <Typography style={styles.sectionTitle}>
                            Current Execution Session
                        </Typography>
                        <Card style={styles.statsCard}>
                            <View style={styles.statRow}>
                                <Typography style={styles.statLabel}>Session ID:</Typography>
                                <Typography style={styles.statValue}>{currentSession.id.slice(0, 8)}...</Typography>
                            </View>
                            <View style={styles.statRow}>
                                <Typography style={styles.statLabel}>Status:</Typography>
                                <Typography style={styles.statValue}>{currentSession.status}</Typography>
                            </View>
                            <View style={styles.statRow}>
                                <Typography style={styles.statLabel}>Current Activity:</Typography>
                                <Typography style={styles.statValue}>{currentSession.currentActivityIndex + 1}</Typography>
                            </View>
                            <View style={styles.statRow}>
                                <Typography style={styles.statLabel}>Total Activities:</Typography>
                                <Typography style={styles.statValue}>{currentSession.activityProgress.length}</Typography>
                            </View>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
} 