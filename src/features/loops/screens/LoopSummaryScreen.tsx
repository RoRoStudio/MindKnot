/**
 * LoopSummaryScreen - Shows detailed summary after loop completion
 * 
 * Features:
 * - Session overview with completion stats
 * - Activity list with durations and sub-items
 * - Editable session data (duration, sub-items)
 * - Share/export options
 * - Navigation to start new session or return to details
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    EntryDetailHeader,
    Button,
    Icon,
    Card,
} from '../../../shared/components';
import { useLoops } from '../hooks/useLoops';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { RootStackParamList } from '../../../shared/types/navigation';
import { ExecutionSession, Loop, ActivityProgress } from '../../../shared/types/loop';

type LoopSummaryRouteProp = RouteProp<{
    LoopSummaryScreen: {
        sessionId: string;
        loopId: string;
    };
}, 'LoopSummaryScreen'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopSummaryScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LoopSummaryRouteProp>();
    const { sessionId, loopId } = route.params || {};

    // Hooks
    const { getLoopById } = useLoops();
    const { getTemplateById } = useActivityTemplates();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [loop, setLoop] = useState<Loop | null>(null);
    const [session, setSession] = useState<ExecutionSession | null>(null);

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        celebrationSection: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
            marginBottom: theme.spacing.l,
        },
        celebrationEmoji: {
            fontSize: 80,
            marginBottom: theme.spacing.m,
        },
        celebrationTitle: {
            fontSize: theme.typography.fontSize.xxl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            textAlign: 'center',
            marginBottom: theme.spacing.s,
        },
        celebrationSubtitle: {
            fontSize: theme.typography.fontSize.l,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        statsSection: {
            marginBottom: theme.spacing.l,
        },
        statsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: theme.spacing.m,
        },
        statCard: {
            flex: 1,
            minWidth: '45%',
            padding: theme.spacing.m,
            alignItems: 'center',
        },
        statValue: {
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        statLabel: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        sectionTitle: {
            fontSize: theme.typography.fontSize.l,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.m,
        },
        activityItem: {
            marginBottom: theme.spacing.s,
        },
        activityHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.m,
        },
        activityInfo: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        activityEmoji: {
            fontSize: 24,
            marginRight: theme.spacing.m,
        },
        activityDetails: {
            flex: 1,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs,
        },
        activityDuration: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        activityStatus: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            alignSelf: 'flex-start',
        },
        statusCompleted: {
            backgroundColor: theme.colors.success + '20',
        },
        statusSkipped: {
            backgroundColor: theme.colors.warning + '20',
        },
        statusText: {
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.medium,
        },
        statusTextCompleted: {
            color: theme.colors.success,
        },
        statusTextSkipped: {
            color: theme.colors.warning,
        },
        subItemsList: {
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.m,
        },
        subItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
        },
        subItemText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.s,
        },
        actionsSection: {
            paddingTop: theme.spacing.l,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        primaryActions: {
            flexDirection: 'row',
            marginBottom: theme.spacing.m,
            gap: theme.spacing.m,
        },
        primaryButton: {
            flex: 1,
        },
        secondaryActions: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: theme.spacing.m,
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
    }));

    // Load data
    useEffect(() => {
        loadData();
    }, [sessionId, loopId]);

    const loadData = useCallback(async () => {
        if (!sessionId || !loopId) {
            console.error('LoopSummaryScreen: Missing sessionId or loopId');
            navigation.goBack();
            return;
        }

        try {
            setIsLoading(true);

            // Load loop data
            const loadedLoop = await getLoopById(loopId);
            if (!loadedLoop) {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
                return;
            }

            setLoop(loadedLoop);

            // TODO: Load session data from storage
            // For now, create a mock completed session
            const mockSession: ExecutionSession = {
                id: sessionId,
                loopId: loopId,
                startTime: new Date(Date.now() - 3600000), // 1 hour ago
                endTime: new Date(),
                currentActivityIndex: loadedLoop.activities.length - 1,
                status: 'completed',
                activityProgress: loadedLoop.activities.map((activity, index) => ({
                    activityId: activity.id,
                    status: 'completed',
                    startTime: new Date(Date.now() - 3600000 + (index * 600000)), // 10 min intervals
                    endTime: new Date(Date.now() - 3600000 + ((index + 1) * 600000)),
                    completedSubItems: activity.subItems?.map((si, idx) => idx).filter((idx) =>
                        activity.subItems?.[idx]?.completed) || [],
                    skipped: false,
                })),
                totalDuration: 3600, // 1 hour
                pausedDuration: 0,
            };

            setSession(mockSession);
        } catch (error) {
            console.error('LoopSummaryScreen: Error loading data:', error);
            Alert.alert('Error', 'Failed to load session data');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, loopId, getLoopById, navigation]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    const handleStartNewSession = useCallback(() => {
        if (!loop) return;

        navigation.navigate('LoopExecutionScreen', {
            loopId: loop.id,
        });
    }, [loop, navigation]);

    const handleBackToDetails = useCallback(() => {
        if (!loop) return;

        navigation.navigate('LoopDetailsScreen', {
            loopId: loop.id,
        });
    }, [loop, navigation]);

    const handleEditLoop = useCallback(() => {
        if (!loop) return;

        navigation.navigate('LoopBuilderScreen', {
            mode: 'edit',
            id: loop.id,
        });
    }, [loop, navigation]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    entryType="Loop Summary"
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyStateText}>
                        Loading session summary...
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    if (!loop || !session) {
        return (
            <SafeAreaView style={styles.container}>
                <EntryDetailHeader
                    entryType="Loop Summary"
                    onBackPress={() => navigation.goBack()}
                />
                <View style={styles.emptyState}>
                    <Typography style={styles.emptyStateText}>
                        Session data not found
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

    const completedActivities = session.activityProgress.filter(ap => ap.status === 'completed' && !ap.skipped).length;
    const skippedActivities = session.activityProgress.filter(ap => ap.skipped).length;
    const totalSubItems = loop.activities.reduce((sum, activity) => sum + (activity.subItems?.length || 0), 0);
    const completedSubItems = session.activityProgress.reduce((sum, ap) => sum + (ap.completedSubItems?.length || 0), 0);

    return (
        <SafeAreaView style={styles.container}>
            <EntryDetailHeader
                entryType="Loop Summary"
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Celebration Section */}
                <View style={styles.celebrationSection}>
                    <Typography style={styles.celebrationEmoji}>🎉</Typography>
                    <Typography style={styles.celebrationTitle}>
                        Loop Completed!
                    </Typography>
                    <Typography style={styles.celebrationSubtitle}>
                        {loop.title}
                    </Typography>
                </View>

                {/* Statistics */}
                <View style={styles.statsSection}>
                    <Typography style={styles.sectionTitle}>Session Statistics</Typography>
                    <View style={styles.statsGrid}>
                        <Card style={styles.statCard}>
                            <Typography style={styles.statValue}>
                                {formatDuration(session.totalDuration)}
                            </Typography>
                            <Typography style={styles.statLabel}>Total Duration</Typography>
                        </Card>

                        <Card style={styles.statCard}>
                            <Typography style={styles.statValue}>
                                {completedActivities}/{loop.activities.length}
                            </Typography>
                            <Typography style={styles.statLabel}>Activities Completed</Typography>
                        </Card>

                        <Card style={styles.statCard}>
                            <Typography style={styles.statValue}>
                                {completedSubItems}/{totalSubItems}
                            </Typography>
                            <Typography style={styles.statLabel}>Tasks Completed</Typography>
                        </Card>

                        <Card style={styles.statCard}>
                            <Typography style={styles.statValue}>
                                {skippedActivities}
                            </Typography>
                            <Typography style={styles.statLabel}>Activities Skipped</Typography>
                        </Card>
                    </View>
                </View>

                {/* Activity Breakdown */}
                <View style={styles.statsSection}>
                    <Typography style={styles.sectionTitle}>Activity Breakdown</Typography>
                    {loop.activities.map((activity, index) => {
                        const activityProgress = session.activityProgress[index];
                        const template = getTemplateById(activity.templateId);
                        const activityDuration = activityProgress.endTime && activityProgress.startTime
                            ? Math.floor((activityProgress.endTime.getTime() - activityProgress.startTime.getTime()) / 1000)
                            : 0;

                        return (
                            <Card key={activity.id} style={styles.activityItem}>
                                <View style={styles.activityHeader}>
                                    <View style={styles.activityInfo}>
                                        <Typography style={styles.activityEmoji}>
                                            {template?.emoji || '⚡'}
                                        </Typography>
                                        <View style={styles.activityDetails}>
                                            <Typography style={styles.activityTitle}>
                                                {activity.title || template?.title || `Activity ${index + 1}`}
                                            </Typography>
                                            <Typography style={styles.activityDuration}>
                                                Duration: {formatDuration(activityDuration)}
                                            </Typography>
                                        </View>
                                    </View>
                                    <View style={[
                                        styles.activityStatus,
                                        activityProgress.skipped ? styles.statusSkipped : styles.statusCompleted
                                    ]}>
                                        <Typography style={[
                                            styles.statusText,
                                            activityProgress.skipped ? styles.statusTextSkipped : styles.statusTextCompleted
                                        ]}>
                                            {activityProgress.skipped ? 'Skipped' : 'Completed'}
                                        </Typography>
                                    </View>
                                </View>

                                {/* Sub-items */}
                                {activity.subItems && activity.subItems.length > 0 && (
                                    <View style={styles.subItemsList}>
                                        {activity.subItems.map((subItem, subIndex) => {
                                            const isCompleted = activityProgress.completedSubItems?.includes(subIndex);
                                            return (
                                                <View key={subIndex} style={styles.subItem}>
                                                    <Icon
                                                        name={isCompleted ? 'check' : 'x'}
                                                        size={16}
                                                        color={isCompleted ? '#4CAF50' : '#FF6B6B'}
                                                    />
                                                    <Typography style={styles.subItemText}>
                                                        {subItem.label}
                                                    </Typography>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}
                            </Card>
                        );
                    })}
                </View>

                {/* Actions */}
                <View style={styles.actionsSection}>
                    <View style={styles.primaryActions}>
                        <Button
                            variant="primary"
                            label="Start New Session"
                            onPress={handleStartNewSession}
                            style={styles.primaryButton}
                        />
                        <Button
                            variant="secondary"
                            label="Back to Details"
                            onPress={handleBackToDetails}
                            style={styles.primaryButton}
                        />
                    </View>

                    <View style={styles.secondaryActions}>
                        <Button
                            variant="text"
                            label="Edit Loop"
                            onPress={handleEditLoop}
                        />
                        <Button
                            variant="text"
                            label="Share Results"
                            onPress={() => {
                                // TODO: Implement share functionality
                                Alert.alert('Coming Soon', 'Share functionality will be implemented soon!');
                            }}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
} 