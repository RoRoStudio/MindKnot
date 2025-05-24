import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Icon } from '../../shared/Icon';
import { Loop, LoopExecutionState, LoopActivityInstance, ActivityTemplate } from '../../../types/loop';

interface LoopExecutionStatusCardProps {
    loop: Loop;
    executionState: LoopExecutionState;
    currentActivityProgress: {
        currentIndex: number;
        totalActivities: number;
        completedCount: number;
        progress: number;
        isComplete: boolean;
    } | null;
    currentActivity?: LoopActivityInstance;
    currentTemplate?: ActivityTemplate;
    onContinueExecution: () => void;
    onCompleteLoop: () => void;
    showActions?: boolean;
}

export const LoopExecutionStatusCard: React.FC<LoopExecutionStatusCardProps> = ({
    loop,
    executionState,
    currentActivityProgress,
    currentActivity,
    currentTemplate,
    onContinueExecution,
    onCompleteLoop,
    showActions = true,
}) => {
    const { theme } = useTheme();

    if (!currentActivityProgress) return null;

    const { currentIndex, totalActivities, progress, isComplete } = currentActivityProgress;
    const isPaused = executionState.isPaused;

    const getCurrentActivityTitle = () => {
        if (currentActivity && currentTemplate) {
            return currentActivity.overriddenTitle || currentTemplate.title;
        }
        return `Activity ${currentIndex + 1}`;
    };

    const getCurrentActivityIcon = () => {
        return currentTemplate?.icon || '📝';
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 16,
            marginVertical: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        loopInfo: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        loopTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginRight: 8,
        },
        pausedBadge: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.colors.warning,
            backgroundColor: theme.colors.warning + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
        },
        progressContainer: {
            alignItems: 'flex-end',
        },
        progressText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
        },
        progressBar: {
            height: 6,
            backgroundColor: theme.colors.border,
            borderRadius: 3,
            marginBottom: 12,
        },
        progressFill: {
            height: 6,
            backgroundColor: theme.colors.primary,
            borderRadius: 3,
        },
        currentActivity: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            padding: 12,
            backgroundColor: theme.colors.surface,
            borderRadius: 8,
        },
        currentActivityIcon: {
            fontSize: 24,
            marginRight: 12,
        },
        activityDetails: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 2,
        },
        activityMeta: {
            fontSize: 13,
            color: theme.colors.textSecondary,
        },
        actions: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 8,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            gap: 6,
        },
        primaryButton: {
            backgroundColor: theme.colors.primary,
        },
        secondaryButton: {
            backgroundColor: theme.colors.border,
        },
        completeButton: {
            backgroundColor: theme.colors.success,
        },
        primaryButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
        },
        secondaryButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        completeButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
        },
        timeInfo: {
            alignItems: 'center',
        },
        timeText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.loopInfo}>
                    <Text style={styles.loopTitle}>{loop.title}</Text>
                    {isPaused && <Text style={styles.pausedBadge}>Paused</Text>}
                </View>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {currentIndex + 1}/{totalActivities}
                    </Text>
                </View>
            </View>

            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {!isComplete && (
                <View style={styles.currentActivity}>
                    <Text style={styles.currentActivityIcon}>{getCurrentActivityIcon()}</Text>
                    <View style={styles.activityDetails}>
                        <Text style={styles.activityTitle}>{getCurrentActivityTitle()}</Text>
                        {currentActivity?.durationMinutes && (
                            <Text style={styles.activityMeta}>
                                {currentActivity.durationMinutes} min
                                {currentActivity.quantity && ` • ${currentActivity.quantity.value} ${currentActivity.quantity.unit}`}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {showActions && (
                <View style={styles.actions}>
                    {isComplete ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={onCompleteLoop}
                        >
                            <Icon name="circle-check" size={16} color={theme.colors.background} />
                            <Text style={styles.completeButtonText}>Complete Loop</Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={onCompleteLoop}
                            >
                                <Icon name="x" size={16} color={theme.colors.textSecondary} />
                                <Text style={styles.secondaryButtonText}>Stop</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.primaryButton]}
                                onPress={onContinueExecution}
                            >
                                <Icon
                                    name={isPaused ? "circle-play" : "circle-pause"}
                                    size={16}
                                    color={theme.colors.background}
                                />
                                <Text style={styles.primaryButtonText}>
                                    {isPaused ? 'Resume' : 'Continue'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            )}

            {executionState.timeSpentSeconds > 0 && (
                <View style={styles.timeInfo}>
                    <Text style={styles.timeText}>
                        Time spent: {formatDuration(executionState.timeSpentSeconds)}
                    </Text>
                </View>
            )}
        </View>
    );
}; 