import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../../components/shared/Icon';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { BeautifulTimer } from '../../components/shared/BeautifulTimer';
import { useBackgroundTimer } from '../../hooks/useBackgroundTimer';

import { useLoopActions } from '../../store/loops';
import {
    Loop,
    LoopActivityInstance,
    LoopExecutionState,
    ActivityTemplate,
    ActivityExecutionResult,
    ActivitySubAction,
    NavigateTarget
} from '../../types/loop';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoopExecutionScreenProps {
    visible: boolean;
    onClose: () => void;
}

interface SubActionsComponentProps {
    subActions: Array<{ id: string; text: string; done: boolean }>;
    completedSubActions: string[];
    onToggleSubAction: (id: string) => void;
    styles: any;
    theme: any;
}

interface ActivityDisplayProps {
    activity: LoopActivityInstance;
    template: ActivityTemplate;
    currentIndex: number;
    totalActivities: number;
    styles: any;
    theme: any;
}

// Helper function to get navigation label
const getNavigationLabel = (target: NavigateTarget): string => {
    const modeLabel = target.mode === 'create' ? 'Create' :
        target.mode === 'review' ? 'Review' :
            target.mode === 'select' ? 'Select' : 'View';
    const typeLabel = target.type.charAt(0).toUpperCase() + target.type.slice(1);
    return `${modeLabel} ${typeLabel}`;
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingTop: 20,
        backgroundColor: theme.colors.primary,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loopTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.background,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    activityHeader: {
        marginBottom: 32,
    },
    progressHeader: {
        marginBottom: 24,
    },
    progressText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
    },
    progressBarFill: {
        height: 4,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
    },
    activityTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    activityIcon: {
        fontSize: 48,
        marginRight: 16,
    },
    activityTitleWrapper: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    quantityContainer: {
        alignItems: 'center',
    },
    quantityBadge: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginRight: 4,
    },
    quantityUnit: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    activityNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    navButtonText: {
        color: theme.colors.textPrimary,
        fontSize: 14,
        fontWeight: '500',
    },
    timerContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    timerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    timerLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    timerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        gap: 16,
    },
    timerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    pauseButton: {
        backgroundColor: theme.colors.primary,
    },
    skipButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    resetButton: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    skipButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    resetButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    noTimerContainer: {
        alignItems: 'center',
        marginVertical: 40,
    },
    manualTimerIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    noTimerText: {
        fontSize: 18,
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    noTimerSubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    subActionsContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginVertical: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    subActionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 16,
    },
    subActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    subActionText: {
        fontSize: 16,
        color: theme.colors.textPrimary,
        flex: 1,
    },
    subActionTextDone: {
        opacity: 0.6,
        textDecorationLine: 'line-through',
    },
    navigationContainer: {
        marginVertical: 20,
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginVertical: 8,
    },
    navigationSection: {
        marginVertical: 16,
    },
    navigationButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        marginLeft: 8,
    },
    nextActivityContainer: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginVertical: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    nextActivityLabel: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    nextActivityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    completeButton: {
        backgroundColor: theme.colors.primary,
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.background,
    },
    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exitModal: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 40,
        minWidth: 280,
    },
    exitModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        textAlign: 'center',
        marginBottom: 12,
    },
    exitModalText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    exitModalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    exitModalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.border,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    confirmButton: {
        backgroundColor: theme.colors.primary,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.background,
    },
    overtimeText: {
        fontSize: 14,
        color: theme.colors.secondary,
        marginTop: 4,
        fontWeight: '600',
    },
});

const SubActionsComponent: React.FC<SubActionsComponentProps> = ({
    subActions,
    completedSubActions,
    onToggleSubAction,
    styles,
    theme
}) => {
    if (!subActions || subActions.length === 0) return null;

    return (
        <View style={styles.subActionsContainer}>
            <Text style={styles.subActionsTitle}>Sub-actions</Text>
            {subActions.map((subAction) => {
                const isCompleted = completedSubActions.includes(subAction.id) || subAction.done;

                return (
                    <TouchableOpacity
                        key={subAction.id}
                        style={styles.subActionItem}
                        onPress={() => onToggleSubAction(subAction.id)}
                    >
                        <View style={[
                            styles.checkbox,
                            isCompleted && styles.checkboxChecked
                        ]}>
                            {isCompleted && (
                                <Icon name="check" size={16} color={theme.colors.background} />
                            )}
                        </View>
                        <Text style={[
                            styles.subActionText,
                            isCompleted && styles.subActionTextDone
                        ]}>
                            {subAction.text}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const ActivityDisplay: React.FC<ActivityDisplayProps> = ({
    activity,
    template,
    currentIndex,
    totalActivities,
    styles,
    theme
}) => {
    const title = 'overriddenTitle' in activity ?
        (activity.overriddenTitle || template.title) :
        template.title;

    return (
        <View style={styles.activityHeader}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                    {currentIndex + 1} of {totalActivities}
                </Text>
                <View style={styles.progressBarBackground}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${((currentIndex + 1) / totalActivities) * 100}%` }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.activityTitleContainer}>
                <Text style={styles.activityIcon}>{template.icon}</Text>
                <View style={styles.activityTitleWrapper}>
                    <Text style={styles.activityTitle}>{title}</Text>
                    {template.description && (
                        <Text style={styles.activityDescription}>{template.description}</Text>
                    )}
                </View>
            </View>

            {'quantity' in activity && activity.quantity && (
                <View style={styles.quantityContainer}>
                    <View style={styles.quantityBadge}>
                        <Text style={styles.quantityValue}>{activity.quantity.value}</Text>
                        <Text style={styles.quantityUnit}>{activity.quantity.unit}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export const LoopExecutionScreen: React.FC<LoopExecutionScreenProps> = ({ visible, onClose }) => {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const {
        activeExecution,
        currentActivityWithTemplate,
        currentActivityProgress,
        activityTimers,
        advanceActivity,
        pauseLoopExecution,
        completeLoopExecution,
        loadActiveExecution,
        activityTemplates,
        navigateToActivity,
        updateActivityTimer,
        syncActivityTimer
    } = useLoopActions();

    const [completedSubActions, setCompletedSubActions] = useState<string[]>([]);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showSubActionConfirmModal, setShowSubActionConfirmModal] = useState(false);
    const [pendingCompletion, setPendingCompletion] = useState<{ skipped: boolean } | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const { startBackgroundTimer, stopBackgroundTimer, pauseBackgroundTimer, resumeBackgroundTimer } = useBackgroundTimer();

    // Initialize timer when component mounts or activity changes
    useEffect(() => {
        if (visible && activeExecution && currentActivityWithTemplate) {
            const currentActivity = currentActivityWithTemplate.activity;
            const currentTimer = activityTimers[currentActivity.id];

            // Initialize timer if it doesn't exist
            if (!currentTimer) {
                const now = new Date().toISOString();
                updateActivityTimer({
                    activityId: currentActivity.id,
                    startTime: now,
                    elapsedSeconds: 0,
                    isRunning: !activeExecution.executionState.isPaused,
                    lastUpdateTime: now
                });
            }
        }
    }, [visible, activeExecution, currentActivityWithTemplate, activityTimers, updateActivityTimer]);

    useEffect(() => {
        if (visible) {
            loadActiveExecution();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, fadeAnim, loadActiveExecution]);

    const handleNavigateToTarget = () => {
        const currentActivity = currentActivityWithTemplate?.activity;
        const currentTemplate = currentActivityWithTemplate?.template;
        const target = currentActivity?.navigateTarget || currentTemplate?.navigateTarget;

        if (!target) return;

        try {
            // Close the execution screen but keep the loop running
            onClose();

            // Navigate to the target screen
            switch (target.type) {
                case 'note':
                    if (target.mode === 'create') {
                        navigation.navigate('NoteCreate');
                    } else if (target.mode === 'review') {
                        if (target.filter?.starred) {
                            navigation.navigate('NoteList', { filter: 'starred' });
                        } else {
                            navigation.navigate('NoteList');
                        }
                    } else {
                        navigation.navigate('NoteList');
                    }
                    break;

                case 'action':
                    if (target.mode === 'create') {
                        navigation.navigate('ActionCreate');
                    } else if (target.mode === 'select') {
                        if (target.filter?.done === false) {
                            navigation.navigate('ActionList', { filter: 'pending' });
                        } else {
                            navigation.navigate('ActionList');
                        }
                    } else {
                        navigation.navigate('ActionList');
                    }
                    break;

                case 'spark':
                    if (target.mode === 'review' || target.mode === 'view') {
                        navigation.navigate('SparkList');
                    } else if (target.mode === 'create') {
                        navigation.navigate('SparkCreate');
                    } else {
                        navigation.navigate('SparkList');
                    }
                    break;

                case 'path':
                    if (target.mode === 'view' || target.mode === 'review') {
                        navigation.navigate('PathList');
                    } else if (target.mode === 'create') {
                        navigation.navigate('PathCreate');
                    } else {
                        navigation.navigate('PathList');
                    }
                    break;

                case 'saga':
                    navigation.navigate('SagaList');
                    break;

                default:
                    console.warn('Unknown navigation target type:', target.type);
                    break;
            }
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert(
                'Navigation Error',
                'Unable to navigate to the target screen. Please continue with the loop.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleNavigateToPrevious = async () => {
        if (!activeExecution || !currentActivityProgress) return;

        const currentIndex = currentActivityProgress.currentIndex;
        if (currentIndex <= 0) return;

        try {
            const success = await navigateToActivity({
                loopId: activeExecution.loop.id,
                activityIndex: currentIndex - 1
            });
            if (!success) {
                Alert.alert('Error', 'Failed to navigate to previous activity');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Failed to navigate to previous activity');
        }
    };

    const handleNavigateToNext = async () => {
        if (!activeExecution || !currentActivityProgress) return;

        const currentIndex = currentActivityProgress.currentIndex;
        if (currentIndex >= currentActivityProgress.totalActivities - 1) return;

        try {
            const success = await navigateToActivity({
                loopId: activeExecution.loop.id,
                activityIndex: currentIndex + 1
            });
            if (!success) {
                Alert.alert('Error', 'Failed to navigate to next activity');
            }
        } catch (error) {
            console.error('Navigation error:', error);
            Alert.alert('Error', 'Failed to navigate to next activity');
        }
    };

    const handleCompleteActivity = useCallback(async (skipped: boolean = false) => {
        if (!activeExecution || !currentActivityWithTemplate) return;

        // Check if there are incomplete sub-activities when not skipping
        if (!skipped && currentActivityWithTemplate.activity.subActions && currentActivityWithTemplate.activity.subActions.length > 0) {
            const totalSubActions = currentActivityWithTemplate.activity.subActions.length;
            const completedCount = completedSubActions.length;

            if (completedCount < totalSubActions) {
                // Show confirmation modal for incomplete sub-activities
                setPendingCompletion({ skipped });
                setShowSubActionConfirmModal(true);
                return;
            }
        }

        // Proceed with completion
        await executeActivityCompletion(skipped);
    }, [
        activeExecution,
        currentActivityWithTemplate,
        completedSubActions,
    ]);

    const executeActivityCompletion = useCallback(async (skipped: boolean = false) => {
        if (!activeExecution || !currentActivityWithTemplate) return;

        const currentTimer = activityTimers[currentActivityWithTemplate.activity.id];
        const timeSpent = currentTimer?.elapsedSeconds || 0;

        const result: ActivityExecutionResult = {
            activityId: currentActivityWithTemplate.activity.id,
            completed: !skipped,
            skipped,
            timeSpentSeconds: timeSpent,
            completedSubActions,
        };

        try {
            const success = await advanceActivity({ loopId: activeExecution.loop.id, result });
            if (success) {
                setCompletedSubActions([]);
                await stopBackgroundTimer();

                // Check if this was the last activity
                if (currentActivityProgress &&
                    currentActivityProgress.currentIndex >= currentActivityProgress.totalActivities - 1) {
                    // Loop completed
                    await completeLoopExecution(activeExecution.loop.id);
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error completing activity:', error);
            Alert.alert('Error', 'Failed to complete activity. Please try again.');
        }
    }, [
        activeExecution,
        currentActivityWithTemplate,
        activityTimers,
        completedSubActions,
        advanceActivity,
        currentActivityProgress,
        completeLoopExecution,
        onClose,
        stopBackgroundTimer
    ]);

    const handleSubActionConfirmation = (proceed: boolean) => {
        setShowSubActionConfirmModal(false);

        if (proceed && pendingCompletion) {
            executeActivityCompletion(pendingCompletion.skipped);
        }

        setPendingCompletion(null);
    };

    const handleExitLoop = () => {
        setShowExitModal(true);
    };

    const confirmExitLoop = async () => {
        if (activeExecution) {
            await pauseLoopExecution({ loopId: activeExecution.loop.id, isPaused: true });
        }
        setShowExitModal(false);
        onClose();
    };

    const handlePauseLoop = async (isPaused: boolean) => {
        if (activeExecution) {
            await pauseLoopExecution({ loopId: activeExecution.loop.id, isPaused });

            if (isPaused) {
                await pauseBackgroundTimer();
            } else {
                await resumeBackgroundTimer();
            }
        }
    };

    const handleToggleSubAction = (subActionId: string) => {
        setCompletedSubActions(prev => {
            const updated = prev.includes(subActionId)
                ? prev.filter(id => id !== subActionId)
                : [...prev, subActionId];

            // Also update the actual activity instance to persist the changes
            if (currentActivityWithTemplate?.activity && 'subActions' in currentActivityWithTemplate.activity) {
                const activity = currentActivityWithTemplate.activity;
                if (activity.subActions) {
                    const updatedSubActions = activity.subActions.map(subAction => {
                        if (typeof subAction === 'string') {
                            // Convert string to ActivitySubAction if needed
                            return {
                                id: subAction,
                                text: subAction,
                                done: updated.includes(subAction)
                            };
                        } else {
                            // Already an ActivitySubAction object
                            return {
                                ...subAction,
                                done: updated.includes(subAction.id)
                            };
                        }
                    });

                    // Update the activity instance with the new sub-action states
                    // This will be saved when the activity is completed
                }
            }

            return updated;
        });
    };

    if (!visible || !activeExecution || !currentActivityWithTemplate) {
        return null;
    }

    const { activity, template } = currentActivityWithTemplate;

    // Ensure we have the right activity structure
    const currentActivity = currentActivityWithTemplate?.activity as LoopActivityInstance;
    const currentTemplate = currentActivityWithTemplate?.template;

    if (!currentActivity || !currentTemplate) {
        return null;
    }

    const canNavigate = currentActivity.navigateTarget || currentTemplate.navigateTarget;
    const navigationTarget = currentActivity.navigateTarget || currentTemplate.navigateTarget;
    const currentTimer = activityTimers[currentActivity.id];
    const isPaused = activeExecution.executionState.isPaused;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent
        >
            <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    <SafeAreaView style={styles.safeArea}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={handleExitLoop}
                            >
                                <Icon name="x" size={24} color={theme.colors.textPrimary} />
                            </TouchableOpacity>

                            <Text style={styles.loopTitle}>{activeExecution.loop.title}</Text>

                            <TouchableOpacity
                                style={styles.headerButton}
                                onPress={() => handlePauseLoop(!isPaused)}
                            >
                                <Icon
                                    name={isPaused ? "circle-play" : "circle-pause"}
                                    size={24}
                                    color={theme.colors.textPrimary}
                                />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            {/* Activity Display */}
                            <ActivityDisplay
                                activity={currentActivity}
                                template={currentTemplate}
                                currentIndex={currentActivityProgress?.currentIndex || 0}
                                totalActivities={currentActivityProgress?.totalActivities || 1}
                                styles={styles}
                                theme={theme}
                            />

                            {/* Activity Navigation */}
                            <View style={styles.activityNavigation}>
                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        (currentActivityProgress?.currentIndex || 0) === 0 && styles.navButtonDisabled
                                    ]}
                                    onPress={handleNavigateToPrevious}
                                    disabled={(currentActivityProgress?.currentIndex || 0) === 0}
                                >
                                    <Icon name="chevron-left" size={20} color={theme.colors.background} />
                                    <Text style={styles.navButtonText}>Previous</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        (currentActivityProgress?.currentIndex || 0) >= (currentActivityProgress?.totalActivities || 1) - 1 && styles.navButtonDisabled
                                    ]}
                                    onPress={handleNavigateToNext}
                                    disabled={(currentActivityProgress?.currentIndex || 0) >= (currentActivityProgress?.totalActivities || 1) - 1}
                                >
                                    <Text style={styles.navButtonText}>Next</Text>
                                    <Icon name="chevron-right" size={20} color={theme.colors.background} />
                                </TouchableOpacity>
                            </View>

                            {/* Timer */}
                            <BeautifulTimer
                                durationMinutes={'durationMinutes' in currentActivity ?
                                    currentActivity.durationMinutes : undefined}
                                elapsedSeconds={currentTimer?.elapsedSeconds || 0}
                                isRunning={!isPaused}
                                isPaused={isPaused}
                                onPause={handlePauseLoop}
                                onReset={() => {
                                    // Reset timer state
                                    if (currentActivityWithTemplate) {
                                        updateActivityTimer({
                                            activityId: currentActivityWithTemplate.activity.id,
                                            startTime: new Date().toISOString(),
                                            elapsedSeconds: 0,
                                            isRunning: !isPaused,
                                            lastUpdateTime: new Date().toISOString()
                                        });
                                    }
                                }}
                                onSkip={() => handleCompleteActivity(true)}
                                onComplete={() => handleCompleteActivity(false)}
                                autoCompleteOnTimerEnd={currentActivity.autoCompleteOnTimerEnd !== false}
                                theme={theme}
                            />

                            {/* Sub-actions */}
                            {currentActivity.subActions && currentActivity.subActions.length > 0 && (
                                <SubActionsComponent
                                    subActions={currentActivity.subActions}
                                    completedSubActions={completedSubActions}
                                    onToggleSubAction={handleToggleSubAction}
                                    styles={styles}
                                    theme={theme}
                                />
                            )}

                            {/* Navigation Target Button */}
                            {(() => {
                                const navigationTarget = currentActivity?.navigateTarget || currentTemplate?.navigateTarget;

                                if (!navigationTarget) return null;

                                return (
                                    <View style={styles.navigationSection}>
                                        <TouchableOpacity
                                            style={styles.navigationButton}
                                            onPress={handleNavigateToTarget}
                                        >
                                            <Icon name="arrow-right" size={20} color={theme.colors.primary} />
                                            <Text style={styles.navigationButtonText}>
                                                Go to {getNavigationLabel(navigationTarget)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })()}

                            {/* Next Activity Preview */}
                            {(() => {
                                if (!currentActivityProgress || currentActivityProgress.currentIndex >= currentActivityProgress.totalActivities - 1) {
                                    return null;
                                }

                                // Get the next activity instance
                                const nextIndex = currentActivityProgress.currentIndex + 1;
                                const nextActivityInstance = activeExecution?.loop?.activityInstances?.[nextIndex];

                                if (!nextActivityInstance) {
                                    return null;
                                }

                                // Find the template for the next activity
                                const nextTemplate = activityTemplates.find(t => t.id === nextActivityInstance.templateId);
                                const nextActivityTitle = nextActivityInstance.overriddenTitle || nextTemplate?.title || `Activity ${nextIndex + 1}`;

                                return (
                                    <View style={styles.nextActivityContainer}>
                                        <Text style={styles.nextActivityLabel}>Next up:</Text>
                                        <Text style={styles.nextActivityTitle}>
                                            {nextActivityTitle}
                                        </Text>
                                    </View>
                                );
                            })()}
                        </ScrollView>

                        {/* Bottom Actions */}
                        <View style={styles.bottomActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.skipButton]}
                                onPress={() => handleCompleteActivity(true)}
                            >
                                <Icon name="skip-forward" size={20} color={theme.colors.textSecondary} />
                                <Text style={styles.actionButtonText}>Skip</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.completeButton]}
                                onPress={() => handleCompleteActivity(false)}
                            >
                                <Icon name="check" size={24} color={theme.colors.background} />
                                <Text style={styles.completeButtonText}>Complete</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </Animated.View>
            </View>

            {/* Exit Confirmation Modal */}
            <Modal
                visible={showExitModal}
                transparent
                animationType="fade"
            >
                <BlurView intensity={50} style={styles.modalOverlay}>
                    <View style={styles.exitModal}>
                        <Text style={styles.exitModalTitle}>Exit Loop?</Text>
                        <Text style={styles.exitModalText}>
                            Your progress will be saved and you can continue later.
                        </Text>
                        <View style={styles.exitModalActions}>
                            <TouchableOpacity
                                style={[styles.exitModalButton, styles.cancelButton]}
                                onPress={() => setShowExitModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.exitModalButton, styles.confirmButton]}
                                onPress={confirmExitLoop}
                            >
                                <Text style={styles.confirmButtonText}>Exit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>

            {/* Sub-Activity Completion Confirmation Modal */}
            <ConfirmationModal
                visible={showSubActionConfirmModal}
                title="Incomplete Sub-activities"
                message={`You have ${(currentActivityWithTemplate?.activity?.subActions?.length || 0) - completedSubActions.length} incomplete sub-activities. Do you want to complete this activity anyway?`}
                icon="circle-alert"
                confirmText="Complete Anyway"
                cancelText="Go Back"
                onConfirm={() => handleSubActionConfirmation(true)}
                onCancel={() => handleSubActionConfirmation(false)}
                isDestructive={false}
            />
        </Modal>
    );
}; 