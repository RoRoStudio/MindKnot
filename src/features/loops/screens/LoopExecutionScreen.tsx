/**
 * LoopExecutionScreen
 * 
 * Handles real-time execution of a loop.
 * Shows current activity, progress, timer, and execution controls.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Alert, AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    Card,
    ProgressBar,
    Icon
} from '../../../shared/components';
import { ExecutionState, Activity, Loop } from '../../../shared/types/loop';
import { ActivityCard } from '../components/ActivityCard';
import { ExecutionTimer } from '../components/ExecutionTimer';
// ExecutionProgress component will be implemented later
import { ExecutionControls } from '../components/ExecutionControls';
import { useLoops } from '../hooks/useLoops';
import { ExecutionEngine } from '../services/ExecutionEngine';
import { formatDuration } from '../../../shared/utils/dateUtils';

// Simple ExecutionProgress component
interface ExecutionProgressProps {
    executionState: ExecutionState;
    loop: Loop;
}

const ExecutionProgress: React.FC<ExecutionProgressProps> = ({ executionState, loop }) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            marginBottom: theme.spacing.m,
        },
        progressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        progressText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
    }));

    const progress = executionState.progress || 0;
    const currentActivity = executionState.currentActivityIndex + 1;
    const totalActivities = loop.activities.length;

    return (
        <View style={styles.container}>
            <View style={styles.progressHeader}>
                <Typography variant="body2" style={styles.progressText}>
                    Activity {currentActivity} of {totalActivities}
                </Typography>
                <Typography variant="body2" style={styles.progressText}>
                    {Math.round(progress * 100)}%
                </Typography>
            </View>
            <ProgressBar progress={progress} />
        </View>
    );
};

export interface LoopExecutionScreenProps {
    navigation: any;
    route: {
        params: {
            loopId: string;
        };
    };
}

export const LoopExecutionScreen: React.FC<LoopExecutionScreenProps> = ({
    navigation,
    route
}) => {
    const { loopId } = route.params;
    const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
    const [loop, setLoop] = useState<Loop | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { getLoop } = useLoops();

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing.m,
        },
        header: {
            marginBottom: theme.spacing.l,
        },
        loopTitle: {
            textAlign: 'center',
            marginBottom: theme.spacing.s,
        },
        cycleInfo: {
            textAlign: 'center',
            marginBottom: theme.spacing.m,
        },
        currentActivitySection: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            marginBottom: theme.spacing.m,
        },
        activityCard: {
            marginBottom: theme.spacing.m,
        },
        timerSection: {
            marginBottom: theme.spacing.l,
        },
        progressSection: {
            marginBottom: theme.spacing.l,
        },
        controlsSection: {
            marginTop: 'auto',
            paddingTop: theme.spacing.l,
        },
        statusCard: {
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.m,
        },
        statusText: {
            textAlign: 'center',
        },
        completionCard: {
            backgroundColor: theme.colors.success,
            padding: theme.spacing.l,
            borderRadius: theme.shape.radius.m,
            alignItems: 'center',
            marginBottom: theme.spacing.l,
        },
        completionText: {
            color: theme.colors.success,
            textAlign: 'center',
            marginBottom: theme.spacing.m,
        },
        completionButton: {
            backgroundColor: theme.colors.success,
        },
        errorCard: {
            backgroundColor: theme.colors.error,
            padding: theme.spacing.m,
            borderRadius: theme.shape.radius.m,
            marginBottom: theme.spacing.m,
        },
        errorText: {
            color: theme.colors.error,
            textAlign: 'center',
        },
    }));

    // Load initial data and set up execution listener
    useFocusEffect(
        useCallback(() => {
            loadInitialData();
            setupExecutionListener();

            return () => {
                // Cleanup listener when screen loses focus
                const executionEngine = ExecutionEngine.getInstance();
                executionEngine.removeAllListeners();
            };
        }, [loopId])
    );

    const loadInitialData = useCallback(async () => {
        try {
            setIsLoading(true);

            // Load loop data
            const loopData = await getLoop(loopId);
            if (!loopData) {
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
                return;
            }
            setLoop(loopData);

            // Get current execution state
            const executionEngine = ExecutionEngine.getInstance();
            const currentExecution = executionEngine.getCurrentExecution();

            if (!currentExecution || currentExecution.loopId !== loopId) {
                Alert.alert('Error', 'No active execution found for this loop');
                navigation.goBack();
                return;
            }

            setExecutionState(currentExecution);
        } catch (error) {
            console.error('Failed to load execution data:', error);
            Alert.alert('Error', 'Failed to load execution data');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    }, [loopId, getLoop, navigation]);

    const setupExecutionListener = useCallback(() => {
        const executionEngine = ExecutionEngine.getInstance();

        // Listen for execution updates
        executionEngine.on('executionUpdated', (newState: ExecutionState) => {
            setExecutionState(newState);
        });

        executionEngine.on('activityCompleted', (activityId: string) => {
            // Activity completed - state will be updated via executionUpdated
        });

        executionEngine.on('loopCompleted', () => {
            // Loop completed - show completion screen
        });

        executionEngine.on('executionError', (error: Error) => {
            console.error('Execution error:', error);
            Alert.alert('Execution Error', error.message);
        });
    }, []);

    const handlePauseResume = useCallback(async () => {
        try {
            const executionEngine = ExecutionEngine.getInstance();

            if (executionState?.status === 'paused') {
                await executionEngine.resumeLoop();
            } else {
                await executionEngine.pauseLoop();
            }
        } catch (error) {
            console.error('Failed to pause/resume execution:', error);
            Alert.alert('Error', 'Failed to pause/resume execution');
        }
    }, [executionState]);

    const handleStop = useCallback(async () => {
        Alert.alert(
            'Stop Loop',
            'Are you sure you want to stop this loop? Your progress will be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Stop',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const executionEngine = ExecutionEngine.getInstance();
                            await executionEngine.stopLoop();
                            navigation.goBack();
                        } catch (error) {
                            console.error('Failed to stop execution:', error);
                            Alert.alert('Error', 'Failed to stop execution');
                        }
                    },
                },
            ]
        );
    }, [navigation]);

    const handleCompleteActivity = useCallback(async () => {
        try {
            const executionEngine = ExecutionEngine.getInstance();
            await executionEngine.completeCurrentActivity();
        } catch (error) {
            console.error('Failed to complete activity:', error);
            Alert.alert('Error', 'Failed to complete activity');
        }
    }, []);

    const handleSkipActivity = useCallback(async () => {
        Alert.alert(
            'Skip Activity',
            'Are you sure you want to skip this activity?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Skip',
                    onPress: async () => {
                        try {
                            const executionEngine = ExecutionEngine.getInstance();
                            await executionEngine.skipCurrentActivity();
                        } catch (error) {
                            console.error('Failed to skip activity:', error);
                            Alert.alert('Error', 'Failed to skip activity');
                        }
                    },
                },
            ]
        );
    }, []);

    const handleBackToLoops = useCallback(() => {
        navigation.navigate('LoopList');
    }, [navigation]);

    const getCurrentActivity = useCallback((): Activity | null => {
        if (!loop || !executionState) return null;
        return loop.activities[executionState.currentActivityIndex] || null;
    }, [loop, executionState]);

    const renderStatusCard = () => {
        if (!executionState) return null;

        let statusText = '';

        switch (executionState.status) {
            case 'running':
                statusText = 'Loop is running';
                break;
            case 'paused':
                statusText = 'Loop is paused';
                break;
            case 'completed':
                statusText = 'Loop completed!';
                break;
            case 'stopped':
                statusText = 'Loop stopped';
                break;
        }

        return (
            <Card style={styles.statusCard}>
                <Typography variant="body1" style={styles.statusText}>
                    {statusText}
                </Typography>
            </Card>
        );
    };

    const renderCompletionCard = () => {
        if (!executionState || executionState.status !== 'completed') return null;

        return (
            <Card style={styles.completionCard}>
                <Icon name="circle-check" size={48} color={styles.completionText.color} />
                <Typography variant="h2" style={styles.completionText}>
                    Loop Completed!
                </Typography>
                <Typography variant="body1" style={styles.completionText}>
                    Great job! You've successfully completed this loop.
                </Typography>
                <Button
                    variant="secondary"
                    label="Back to Loops"
                    onPress={handleBackToLoops}
                    style={styles.completionButton}
                />
            </Card>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Typography variant="body1" style={styles.statusText}>
                        Loading execution...
                    </Typography>
                </View>
            </View>
        );
    }

    if (!loop || !executionState) {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <Card style={styles.errorCard}>
                        <Typography variant="body1" style={styles.errorText}>
                            Execution data not found
                        </Typography>
                    </Card>
                    <Button
                        variant="secondary"
                        label="Back to Loops"
                        onPress={handleBackToLoops}
                    />
                </View>
            </View>
        );
    }

    const currentActivity = getCurrentActivity();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Typography variant="h2" style={styles.loopTitle}>
                        {loop.title}
                    </Typography>

                    {loop.isRepeating && (
                        <Typography variant="body2" color="secondary" style={styles.cycleInfo}>
                            Cycle {executionState.currentCycle} of {loop.repeatCycles || '∞'}
                        </Typography>
                    )}
                </View>

                {/* Status */}
                {renderStatusCard()}

                {/* Completion Card */}
                {renderCompletionCard()}

                {/* Current Activity */}
                {currentActivity && executionState.status !== 'completed' && (
                    <View style={styles.currentActivitySection}>
                        <Typography variant="h3" style={styles.sectionTitle}>
                            Current Activity
                        </Typography>
                        <ActivityCard
                            activity={currentActivity}
                            isActive={true}
                            style={styles.activityCard}
                        />
                    </View>
                )}

                {/* Timer */}
                {executionState.status !== 'completed' && (
                    <View style={styles.timerSection}>
                        <ExecutionTimer
                            duration={currentActivity?.duration || 0}
                            isRunning={executionState.status === 'running'}
                            onComplete={handleCompleteActivity}
                        />
                    </View>
                )}

                {/* Progress */}
                <View style={styles.progressSection}>
                    <ExecutionProgress
                        executionState={executionState}
                        loop={loop}
                    />
                </View>

                {/* Controls */}
                {executionState.status !== 'completed' && (
                    <View style={styles.controlsSection}>
                        <ExecutionControls
                            isRunning={executionState.status === 'running'}
                            isPaused={executionState.status === 'paused'}
                            onPlay={handlePauseResume}
                            onPause={handlePauseResume}
                            onStop={handleStop}
                            onSkip={handleSkipActivity}
                            showExtendedControls={true}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}; 