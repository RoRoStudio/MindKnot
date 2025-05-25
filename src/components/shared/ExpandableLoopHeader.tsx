import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { useLoopActions } from '../../store/loops';
import { Icon } from './Icon';
import { ConfirmationModal } from './ConfirmationModal';
import { Loop, LoopExecutionState, LoopActivityInstance, ActivityTemplate } from '../../types/loop';

const { width: screenWidth } = Dimensions.get('window');

interface ExpandableLoopHeaderProps {
    visible: boolean;
    onOpenExecution: () => void;
}

interface TimerDisplayProps {
    durationMinutes?: number;
    elapsedSeconds: number;
    isRunning: boolean;
    theme: any;
    compact?: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
    durationMinutes,
    elapsedSeconds,
    isRunning,
    theme,
    compact = false
}) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return compact ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
            : `${minutes}m ${remainingSeconds}s`;
    };

    if (!durationMinutes) {
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="clock" size={compact ? 12 : 16} color={theme.colors.textSecondary} />
                {!compact && <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginLeft: 4 }}>No timer</Text>}
            </View>
        );
    }

    const totalSeconds = durationMinutes * 60;
    const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);
    const isOvertime = elapsedSeconds > totalSeconds;
    const overtimeSeconds = Math.max(0, elapsedSeconds - totalSeconds);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
                width: compact ? 16 : 24,
                height: compact ? 16 : 24,
                borderRadius: compact ? 8 : 12,
                backgroundColor: isOvertime ? theme.colors.warning : theme.colors.primary,
                marginRight: 4,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon
                    name={isRunning ? "circle-play" : "circle-pause"}
                    size={compact ? 8 : 12}
                    color={theme.colors.background}
                />
            </View>
            <Text style={{
                fontSize: compact ? 10 : 12,
                fontWeight: '600',
                color: isOvertime ? theme.colors.warning : theme.colors.textPrimary
            }}>
                {isOvertime ? `+${formatTime(overtimeSeconds)}` : formatTime(timeLeft)}
            </Text>
        </View>
    );
};

interface SubActionItemProps {
    subAction: { id: string; text: string; done: boolean };
    onToggle: (id: string) => void;
    theme: any;
}

const SubActionItem: React.FC<SubActionItemProps> = ({ subAction, onToggle, theme }) => (
    <TouchableOpacity
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
        }}
        onPress={() => onToggle(subAction.id)}
    >
        <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: subAction.done ? theme.colors.success : theme.colors.border,
            backgroundColor: subAction.done ? theme.colors.success : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        }}>
            {subAction.done && (
                <Icon name="check" size={12} color={theme.colors.background} />
            )}
        </View>
        <Text style={{
            flex: 1,
            fontSize: 14,
            color: theme.colors.textPrimary,
            textDecorationLine: subAction.done ? 'line-through' : 'none',
            opacity: subAction.done ? 0.6 : 1,
        }}>
            {subAction.text}
        </Text>
    </TouchableOpacity>
);

export const ExpandableLoopHeader: React.FC<ExpandableLoopHeaderProps> = ({
    visible,
    onOpenExecution,
}) => {
    const { theme } = useTheme();
    const {
        activeExecution,
        currentActivityWithTemplate,
        currentActivityProgress,
        activityTimers,
        pauseLoopExecution,
        completeLoopExecution,
        advanceActivity,
        navigateToActivity,
        syncActivityTimer,
        loadActiveExecution,
        activityTemplates,
    } = useLoopActions();

    const [isExpanded, setIsExpanded] = useState(false);
    const [showEndConfirmation, setShowEndConfirmation] = useState(false);
    const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);
    const [targetActivityIndex, setTargetActivityIndex] = useState<number | null>(null);

    const expandAnimation = useRef(new Animated.Value(0)).current;

    // Sync timer every second
    useEffect(() => {
        if (!activeExecution || !currentActivityWithTemplate) return;

        const interval = setInterval(() => {
            syncActivityTimer({ activityId: currentActivityWithTemplate.activity.id });
        }, 1000);

        return () => clearInterval(interval);
    }, [activeExecution, currentActivityWithTemplate, syncActivityTimer]);

    // Expand/collapse animation
    useEffect(() => {
        Animated.timing(expandAnimation, {
            toValue: isExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isExpanded, expandAnimation]);

    if (!visible || !activeExecution || !currentActivityWithTemplate || !currentActivityProgress) {
        return null;
    }

    const { loop, executionState } = activeExecution;
    const { activity: currentActivity, template: currentTemplate } = currentActivityWithTemplate;
    const currentTimer = activityTimers[currentActivity.id];

    // Safely get next activity from the loop instances
    const nextActivityIndex = currentActivityProgress.currentIndex + 1;
    const nextActivity = nextActivityIndex < loop.activityInstances.length ?
        loop.activityInstances[nextActivityIndex] : null;

    // Find template for next activity
    const nextTemplate = nextActivity ?
        activityTemplates.find(t => t.id === nextActivity.templateId) : null;

    const handlePauseResume = async () => {
        await pauseLoopExecution({
            loopId: loop.id,
            isPaused: !executionState.isPaused
        });
    };

    const handleMarkDone = async () => {
        const timeSpent = currentTimer?.elapsedSeconds || 0;

        // Safely get completed sub-actions
        const completedSubActionIds: string[] = [];
        if (currentActivity.subActions) {
            currentActivity.subActions.forEach(sa => {
                if (typeof sa === 'object' && sa.done) {
                    completedSubActionIds.push(sa.id);
                }
            });
        }

        await advanceActivity({
            loopId: loop.id,
            result: {
                activityId: currentActivity.id,
                completed: true,
                skipped: false,
                timeSpentSeconds: timeSpent,
                completedSubActions: completedSubActionIds,
            }
        });
    };

    const handleSkipActivity = async () => {
        const timeSpent = currentTimer?.elapsedSeconds || 0;
        await advanceActivity({
            loopId: loop.id,
            result: {
                activityId: currentActivity.id,
                completed: false,
                skipped: true,
                timeSpentSeconds: timeSpent,
                completedSubActions: [],
            }
        });
        setShowSkipConfirmation(false);
    };

    const handleEndLoop = async () => {
        await completeLoopExecution(loop.id);
        setShowEndConfirmation(false);
        setIsExpanded(false);
    };

    const handleNavigateToActivity = async (index: number) => {
        if (index === currentActivityProgress.currentIndex) return;

        setTargetActivityIndex(index);
        setShowSkipConfirmation(true);
    };

    const confirmNavigateToActivity = async () => {
        if (targetActivityIndex !== null) {
            await navigateToActivity({
                loopId: loop.id,
                activityIndex: targetActivityIndex
            });
        }
        setShowSkipConfirmation(false);
        setTargetActivityIndex(null);
    };

    const handleOpenTarget = () => {
        setIsExpanded(false);
        onOpenExecution();
    };

    const styles = StyleSheet.create({
        container: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: theme.colors.primary,
        },
        collapsedHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            minHeight: 56,
        },
        activityInfo: {
            flex: 1,
            marginRight: 12,
        },
        activityName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
            marginBottom: 2,
        },
        progressText: {
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.8)',
        },
        progressDots: {
            flexDirection: 'row',
            marginTop: 4,
        },
        progressDot: {
            width: 4,
            height: 4,
            borderRadius: 2,
            marginRight: 3,
        },
        timerSection: {
            marginRight: 12,
        },
        actionButtons: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandedContainer: {
            backgroundColor: theme.colors.background,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
        },
        expandedContent: {
            padding: 20,
        },
        loopTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: 16,
            textAlign: 'center',
        },
        currentActivityCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        activityHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        activityIcon: {
            fontSize: 32,
            marginRight: 12,
        },
        activityDetails: {
            flex: 1,
        },
        activityTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        activityProgress: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        timerDisplay: {
            alignItems: 'center',
            marginVertical: 12,
        },
        timerText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.textPrimary,
            marginBottom: 4,
        },
        actionButtonsRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 12,
        },
        primaryButton: {
            flex: 1,
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        primaryButtonText: {
            color: theme.colors.background,
            fontSize: 16,
            fontWeight: '600',
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        secondaryButtonText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
        subActionsSection: {
            marginTop: 16,
        },
        subActionsTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        nextActivitySection: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
        },
        nextActivityLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        nextActivityName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        progressTracker: {
            marginBottom: 16,
        },
        progressTrackerTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        progressStep: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
        },
        stepIndicator: {
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        stepText: {
            flex: 1,
            fontSize: 14,
        },
        endLoopButton: {
            backgroundColor: theme.colors.error,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 16,
        },
        endLoopButtonText: {
            color: theme.colors.background,
            fontSize: 14,
            fontWeight: '600',
        },
    });

    const expandedHeight = expandAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 400],
    });

    return (
        <>
            <View style={styles.container}>
                <SafeAreaView edges={['top']}>
                    {/* Collapsed Header */}
                    <TouchableOpacity
                        style={styles.collapsedHeader}
                        onPress={() => setIsExpanded(!isExpanded)}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={styles.activityInfo}>
                            <Text style={styles.activityName} numberOfLines={1}>
                                Now: {'overriddenTitle' in currentActivity ?
                                    (currentActivity.overriddenTitle || currentTemplate?.title) :
                                    currentTemplate?.title}
                            </Text>
                            <Text style={styles.progressText}>
                                {currentActivityProgress.currentIndex + 1} of {currentActivityProgress.totalActivities} • {loop.title}
                            </Text>
                            <View style={styles.progressDots}>
                                {Array.from({ length: currentActivityProgress.totalActivities }).map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.progressDot,
                                            {
                                                backgroundColor: index <= currentActivityProgress.currentIndex
                                                    ? theme.colors.background
                                                    : 'rgba(255, 255, 255, 0.3)',
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </Animated.View>

                        <View style={styles.timerSection}>
                            <TimerDisplay
                                durationMinutes={'durationMinutes' in currentActivity ?
                                    currentActivity.durationMinutes : undefined}
                                elapsedSeconds={currentTimer?.elapsedSeconds || 0}
                                isRunning={currentTimer?.isRunning && !executionState.isPaused}
                                theme={theme}
                                compact
                            />
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handlePauseResume}
                            >
                                <Icon
                                    name={executionState.isPaused ? "circle-play" : "circle-pause"}
                                    size={16}
                                    color={theme.colors.background}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <Icon
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={16}
                                    color={theme.colors.background}
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>

                    {/* Expanded Panel */}
                    <Animated.View style={[styles.expandedContainer, { height: expandedHeight }]}>
                        <ScrollView style={styles.expandedContent} showsVerticalScrollIndicator={false}>
                            <Text style={styles.loopTitle}>{loop.title}</Text>

                            {/* Current Activity Card */}
                            <View style={styles.currentActivityCard}>
                                <View style={styles.activityHeader}>
                                    <Text style={styles.activityIcon}>{currentTemplate?.icon}</Text>
                                    <View style={styles.activityDetails}>
                                        <Text style={styles.activityTitle}>
                                            {'overriddenTitle' in currentActivity ?
                                                (currentActivity.overriddenTitle || currentTemplate?.title) :
                                                currentTemplate?.title}
                                        </Text>
                                        <Text style={styles.activityProgress}>
                                            Step {currentActivityProgress.currentIndex + 1} of {currentActivityProgress.totalActivities}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.timerDisplay}>
                                    <TimerDisplay
                                        durationMinutes={'durationMinutes' in currentActivity ?
                                            currentActivity.durationMinutes : undefined}
                                        elapsedSeconds={currentTimer?.elapsedSeconds || 0}
                                        isRunning={currentTimer?.isRunning && !executionState.isPaused}
                                        theme={theme}
                                    />
                                </View>

                                <View style={styles.actionButtonsRow}>
                                    <TouchableOpacity style={styles.primaryButton} onPress={handleMarkDone}>
                                        <Text style={styles.primaryButtonText}>Mark as Done</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenTarget}>
                                        <Text style={styles.secondaryButtonText}>Open Target</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Sub-actions */}
                                {currentActivity.subActions && currentActivity.subActions.length > 0 && (
                                    <View style={styles.subActionsSection}>
                                        <Text style={styles.subActionsTitle}>Sub-actions</Text>
                                        {currentActivity.subActions.map((subAction, index) => {
                                            // Handle both string and object sub-actions
                                            const subActionObj = typeof subAction === 'string' ?
                                                { id: `${index}`, text: subAction, done: false } :
                                                subAction;

                                            return (
                                                <SubActionItem
                                                    key={subActionObj.id}
                                                    subAction={subActionObj}
                                                    onToggle={() => {
                                                        // Handle sub-action toggle
                                                        // This would need to be implemented in the store
                                                    }}
                                                    theme={theme}
                                                />
                                            );
                                        })}
                                    </View>
                                )}
                            </View>

                            {/* Next Activity Preview */}
                            {nextActivity && nextTemplate && (
                                <View style={styles.nextActivitySection}>
                                    <Text style={styles.nextActivityLabel}>Next up:</Text>
                                    <Text style={styles.nextActivityName}>
                                        {'overriddenTitle' in nextActivity ?
                                            (nextActivity.overriddenTitle || nextTemplate.title) :
                                            nextTemplate.title}
                                    </Text>
                                </View>
                            )}

                            {/* Progress Tracker */}
                            <View style={styles.progressTracker}>
                                <Text style={styles.progressTrackerTitle}>Progress</Text>
                                {loop.activityInstances.map((activity, index) => {
                                    const isCompleted = executionState.completedActivities.includes(activity.id);
                                    const isCurrent = index === currentActivityProgress.currentIndex;
                                    const activityTemplate = activityTemplates.find(t => t.id === activity.templateId);
                                    const activityTitle = 'overriddenTitle' in activity ?
                                        (activity.overriddenTitle || activityTemplate?.title || `Activity ${index + 1}`) :
                                        (activityTemplate?.title || `Activity ${index + 1}`);

                                    return (
                                        <TouchableOpacity
                                            key={activity.id}
                                            style={styles.progressStep}
                                            onPress={() => handleNavigateToActivity(index)}
                                            disabled={index === currentActivityProgress.currentIndex}
                                        >
                                            <View style={[
                                                styles.stepIndicator,
                                                {
                                                    backgroundColor: isCompleted
                                                        ? theme.colors.success
                                                        : isCurrent
                                                            ? theme.colors.primary
                                                            : theme.colors.border,
                                                },
                                            ]}>
                                                {isCompleted ? (
                                                    <Icon name="check" size={12} color={theme.colors.background} />
                                                ) : (
                                                    <Text style={{
                                                        fontSize: 12,
                                                        fontWeight: '600',
                                                        color: isCurrent ? theme.colors.background : theme.colors.textSecondary,
                                                    }}>
                                                        {index + 1}
                                                    </Text>
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.stepText,
                                                {
                                                    color: isCurrent
                                                        ? theme.colors.textPrimary
                                                        : theme.colors.textSecondary,
                                                    fontWeight: isCurrent ? '600' : '400',
                                                },
                                            ]}>
                                                {activityTitle}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* End Loop Button */}
                            <TouchableOpacity
                                style={styles.endLoopButton}
                                onPress={() => setShowEndConfirmation(true)}
                            >
                                <Text style={styles.endLoopButtonText}>End Loop Early</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </SafeAreaView>
            </View>

            {/* Confirmation Modals */}
            <ConfirmationModal
                visible={showEndConfirmation}
                title="End Loop Early?"
                message="Your progress will be saved. Are you sure you want to end this loop?"
                icon="circle-alert"
                confirmText="End Loop"
                cancelText="Continue"
                onConfirm={handleEndLoop}
                onCancel={() => setShowEndConfirmation(false)}
                isDestructive={true}
            />

            <ConfirmationModal
                visible={showSkipConfirmation}
                title="Skip to Activity?"
                message={targetActivityIndex !== null
                    ? `Skip to "${loop.activityInstances[targetActivityIndex]?.overriddenTitle || 'Activity'}"?`
                    : "Skip current activity?"
                }
                icon="skip-forward"
                confirmText="Skip"
                cancelText="Cancel"
                onConfirm={targetActivityIndex !== null ? confirmNavigateToActivity : handleSkipActivity}
                onCancel={() => {
                    setShowSkipConfirmation(false);
                    setTargetActivityIndex(null);
                }}
                isDestructive={false}
            />
        </>
    );
}; 