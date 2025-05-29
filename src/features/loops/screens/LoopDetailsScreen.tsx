/**
 * LoopDetailsScreen - Display loop details with execution options
 * 
 * Features:
 * - Loop information display
 * - Activity list with templates
 * - Execution controls (start, edit, delete)
 * - Execution history
 * - Settings overview
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    EntryDetailHeader,
    Button,
    Icon,
    Card,
} from '../../../shared/components';
import {
    useLoops,
    useActivityTemplates,
    useLoopExecution,
} from '../hooks';
import { RootStackParamList } from '../../../shared/types/navigation';
import { Loop, ActivityInstance, ExecutionHistory } from '../../../shared/types/loop';

type LoopDetailsRouteProp = RouteProp<{
    LoopDetailsScreen: {
        loopId: string;
    };
}, 'LoopDetailsScreen'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopDetailsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LoopDetailsRouteProp>();
    const { loopId } = route.params || {};

    // Hooks
    const { getLoopById, deleteLoop, loadLoops } = useLoops();
    const { getTemplateById } = useActivityTemplates();
    const { startExecution } = useLoopExecution();

    // Local state
    const [isLoading, setIsLoading] = useState(true);
    const [loop, setLoop] = useState<Loop | null>(null);
    const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
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
        loopTitle: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.s,
        },
        loopDescription: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.m,
            lineHeight: 24,
        },
        metadataRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        metadataLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        metadataValue: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textPrimary,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.m,
            paddingHorizontal: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.s,
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
            marginBottom: theme.spacing.xs,
        },
        activityMeta: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        primaryActions: {
            flexDirection: 'row',
            gap: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        primaryButton: {
            flex: 1,
        },
        secondaryActions: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.m,
        },
        secondaryButton: {
            minWidth: 100,
        },
        emptyState: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyStateText: {
            fontSize: theme.typography.fontSize.l,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.l,
        },
        tagContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.s,
        },
        tag: {
            backgroundColor: theme.colors.primaryLight,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
        },
        tagText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.primary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        settingsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.s,
        },
        settingsLabel: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textPrimary,
        },
        settingsValue: {
            fontSize: theme.typography.fontSize.m,
            color: theme.colors.textSecondary,
        },
        historyItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.s,
        },
        historyHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        historyDate: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        historyStatus: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
        },
        historyStats: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        historyStat: {
            alignItems: 'center',
        },
        historyStatValue: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        historyStatLabel: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textSecondary,
        },
    }));

    // Load loop data
    const loadLoopData = useCallback(async () => {
        if (!loopId) {
            console.error('LoopDetailsScreen: No loopId provided');
            Alert.alert('Error', 'No loop ID provided');
            navigation.goBack();
            return;
        }

        try {
            console.log('LoopDetailsScreen: Loading loop with ID:', loopId);
            setIsLoading(true);
            const loopData = await getLoopById(loopId);
            console.log('LoopDetailsScreen: Loop data received:', loopData ? 'Found' : 'Not found');

            if (loopData) {
                setLoop(loopData);
                // TODO: Load execution history
                setExecutionHistory([]);
            } else {
                console.error('LoopDetailsScreen: Loop not found for ID:', loopId);
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
            }
        } catch (error) {
            console.error('LoopDetailsScreen: Error loading loop:', error);
            Alert.alert('Error', 'Failed to load loop');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [loopId, getLoopById, navigation]);

    // Load data when screen focuses
    useFocusEffect(
        useCallback(() => {
            loadLoopData();
        }, [loadLoopData])
    );

    // Handle start execution
    const handleStartExecution = useCallback(async () => {
        if (!loop) return;

        try {
            await startExecution(loop);
            navigation.navigate('LoopExecutionScreen', { loopId: loop.id });
        } catch (error) {
            console.error('Error starting execution:', error);
            Alert.alert('Error', 'Failed to start loop execution');
        }
    }, [loop, startExecution, navigation]);

    // Handle edit loop
    const handleEditLoop = useCallback(() => {
        if (!loop) return;
        navigation.navigate('LoopBuilderScreen', { mode: 'edit', id: loop.id });
    }, [loop, navigation]);

    // Handle delete loop
    const handleDeleteLoop = useCallback(async () => {
        if (!loop) return;

        Alert.alert(
            'Delete Loop',
            'Are you sure you want to delete this loop? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteLoop(loop.id);
                            await loadLoops(); // Refresh loops list
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting loop:', error);
                            Alert.alert('Error', 'Failed to delete loop');
                        }
                    },
                },
            ]
        );
    }, [loop, deleteLoop, loadLoops, navigation]);

    // Format duration
    const formatDuration = (activities: ActivityInstance[]) => {
        const totalMinutes = activities.reduce((sum, activity) => {
            return sum + (activity.duration || 0);
        }, 0);

        if (totalMinutes < 60) {
            return `${totalMinutes} min`;
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    };

    // Format date
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return '#4CAF50';
            case 'cancelled':
                return '#F44336';
            case 'stopped':
                return '#FF9800';
            default:
                return '#9E9E9E';
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    entryType="Loop Details"
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyStateText}>
                        Loading loop...
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    if (!loop) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    entryType="Loop Details"
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyStateText}>
                        Loop not found
                    </Typography>
                    <Button
                        variant="primary"
                        label="Go Back"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <EntryDetailHeader
                entryType="Loop Details"
                onBackPress={() => navigation.goBack()}
                showEditButton={true}
                onEditPress={handleEditLoop}
                isSaved={true}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Loop Information */}
                <View style={styles.section}>
                    <Typography style={styles.loopTitle}>
                        {loop.title}
                    </Typography>

                    {loop.description && (
                        <Typography style={styles.loopDescription}>
                            {loop.description}
                        </Typography>
                    )}

                    {/* Metadata */}
                    <View style={styles.metadataRow}>
                        <Typography style={styles.metadataLabel}>Activities</Typography>
                        <Typography style={styles.metadataValue}>
                            {loop.activities.length}
                        </Typography>
                    </View>

                    <View style={styles.metadataRow}>
                        <Typography style={styles.metadataLabel}>Duration</Typography>
                        <Typography style={styles.metadataValue}>
                            {formatDuration(loop.activities)}
                        </Typography>
                    </View>

                    <View style={styles.metadataRow}>
                        <Typography style={styles.metadataLabel}>Created</Typography>
                        <Typography style={styles.metadataValue}>
                            {formatDate(loop.createdAt)}
                        </Typography>
                    </View>

                    {/* Tags */}
                    {loop.tags && loop.tags.length > 0 && (
                        <View style={styles.tagContainer}>
                            {loop.tags.map((tag, index) => (
                                <View key={index} style={styles.tag}>
                                    <Typography style={styles.tagText}>
                                        {tag}
                                    </Typography>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Activities */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        Activities ({loop.activities.length})
                    </Typography>

                    {loop.activities.map((activity, index) => {
                        const template = getTemplateById(activity.templateId);

                        return (
                            <View key={activity.id} style={styles.activityItem}>
                                <Typography style={styles.activityEmoji}>
                                    {template?.emoji || '⚡'}
                                </Typography>

                                <View style={styles.activityContent}>
                                    <Typography style={styles.activityTitle}>
                                        {activity.title || template?.title || 'Activity'}
                                    </Typography>

                                    <Typography style={styles.activityMeta}>
                                        {activity.duration ? `${activity.duration} min` : 'No duration'} •
                                        {activity.quantity ? ` ${activity.quantity.number} ${activity.quantity.unit}` : ' No quantity'}
                                        {activity.subItems && activity.subItems.length > 0 && ` • ${activity.subItems.length} tasks`}
                                    </Typography>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Settings */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        Settings
                    </Typography>

                    <Card>
                        <View style={styles.settingsRow}>
                            <Typography style={styles.settingsLabel}>
                                Background Execution
                            </Typography>
                            <Typography style={styles.settingsValue}>
                                {loop.backgroundExecution ? 'Enabled' : 'Disabled'}
                            </Typography>
                        </View>

                        <View style={styles.settingsRow}>
                            <Typography style={styles.settingsLabel}>
                                Notifications
                            </Typography>
                            <Typography style={styles.settingsValue}>
                                {loop.notifications.enabled ? 'Enabled' : 'Disabled'}
                            </Typography>
                        </View>

                        {loop.scheduling && (
                            <View style={styles.settingsRow}>
                                <Typography style={styles.settingsLabel}>
                                    Scheduling
                                </Typography>
                                <Typography style={styles.settingsValue}>
                                    {loop.scheduling.enabled ? 'Enabled' : 'Disabled'}
                                </Typography>
                            </View>
                        )}
                    </Card>
                </View>

                {/* Execution History */}
                <View style={styles.section}>
                    <Typography style={styles.sectionTitle}>
                        Execution History
                    </Typography>

                    {executionHistory.length > 0 ? (
                        executionHistory.map((execution, index) => (
                            <View key={execution.id} style={styles.historyItem}>
                                <View style={styles.historyHeader}>
                                    <Typography style={styles.historyDate}>
                                        {formatDate(execution.startTime)}
                                    </Typography>
                                    <Typography
                                        style={[
                                            styles.historyStatus,
                                            { color: getStatusColor(execution.status) }
                                        ]}
                                    >
                                        {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                                    </Typography>
                                </View>

                                <View style={styles.historyStats}>
                                    <View style={styles.historyStat}>
                                        <Typography style={styles.historyStatValue}>
                                            {Math.floor(execution.duration / 60)}m
                                        </Typography>
                                        <Typography style={styles.historyStatLabel}>
                                            Duration
                                        </Typography>
                                    </View>

                                    <View style={styles.historyStat}>
                                        <Typography style={styles.historyStatValue}>
                                            {execution.activitiesCompleted}
                                        </Typography>
                                        <Typography style={styles.historyStatLabel}>
                                            Completed
                                        </Typography>
                                    </View>

                                    <View style={styles.historyStat}>
                                        <Typography style={styles.historyStatValue}>
                                            {execution.activitiesSkipped}
                                        </Typography>
                                        <Typography style={styles.historyStatLabel}>
                                            Skipped
                                        </Typography>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Card>
                            <Typography style={styles.settingsValue}>
                                No execution history yet. Start your first loop execution!
                            </Typography>
                        </Card>
                    )}
                </View>

                {/* Actions */}
                <View style={styles.section}>
                    {/* Primary Actions */}
                    <View style={styles.primaryActions}>
                        <Button
                            variant="primary"
                            label="Start Execution"
                            onPress={handleStartExecution}
                            style={styles.primaryButton}
                        />
                        <Button
                            variant="secondary"
                            label="Edit Loop"
                            onPress={handleEditLoop}
                            style={styles.primaryButton}
                        />
                    </View>

                    {/* Secondary Actions */}
                    <View style={styles.secondaryActions}>
                        <Button
                            variant="text"
                            label="Delete Loop"
                            onPress={handleDeleteLoop}
                            style={styles.secondaryButton}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 