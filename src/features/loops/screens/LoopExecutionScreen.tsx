/**
 * LoopExecutionScreen - Step-by-step loop execution
 * 
 * Features:
 * - Step-by-step focused execution
 * - Activity navigation and progress tracking
 * - Timer management for timed activities
 * - Background execution support
 * - Session persistence and recovery
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    TouchableOpacity,
    Alert,
    AppState,
    AppStateStatus,
    Image,
    StatusBar,
} from 'react-native';
import { RouteProp, useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../shared/types/navigation';
import { useLoopExecution } from '../hooks/useLoopExecution';
import { useLoops } from '../hooks/useLoops';
import { useActivityTemplates } from '../hooks/useActivityTemplates';
import { Typography, Button, Icon, BottomSheet, ConfirmationModal } from '../../../shared/components';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { ExecutionSession, Loop, ActivityTemplate } from '../../../shared/types/loop';

type LoopExecutionRouteProp = RouteProp<{
    LoopExecutionScreen: {
        loopId: string;
        sessionId?: string;
    };
}, 'LoopExecutionScreen'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopExecutionScreen() {
    const route = useRoute<LoopExecutionRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme } = useTheme();
    const { getLoopById } = useLoops();
    const { getTemplateById } = useActivityTemplates();

    const {
        currentSession,
        currentLoop,
        currentActivity,
        currentActivityIndex,
        isExecuting,
        isPaused,
        progress,
        timer,
        startExecution,
        stopExecution,
        pauseExecution,
        resumeExecution,
        completeActivity,
        skipActivity,
        previousActivity,
        updateSubItemProgress,
        saveSession,
        loadActiveSession,
    } = useLoopExecution();

    // Local state
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const appState = useRef(AppState.currentState);

    // Load loop data and start execution
    const loadLoopData = useCallback(async () => {
        try {
            console.log('Loading loop data for loopId:', route.params.loopId);
            const loop = await getLoopById(route.params.loopId);

            if (!loop) {
                console.error('Loop not found:', route.params.loopId);
                Alert.alert('Error', 'Loop not found');
                navigation.goBack();
                return;
            }

            console.log('Loop loaded successfully:', {
                id: loop.id,
                title: loop.title,
                activitiesCount: loop.activities?.length || 0
            });

            // Start execution if not already running
            if (!isExecuting && !currentSession) {
                console.log('Starting loop execution...');
                await startExecution(loop);
            }
        } catch (error) {
            console.error('Error loading loop data:', error);
            Alert.alert('Error', 'Failed to load loop data');
            navigation.goBack();
        }
    }, [route.params.loopId, getLoopById, startExecution, isExecuting, currentSession, navigation]);

    // Initialize screen
    useEffect(() => {
        loadLoopData();
    }, [loadLoopData]);

    // Handle app state changes for background mode
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App has come to the foreground');
                // Auto-save when returning to foreground
                if (currentSession && isExecuting) {
                    saveSession();
                }
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [currentSession, isExecuting, saveSession]);

    // Save session periodically and on screen blur
    useFocusEffect(
        useCallback(() => {
            const saveInterval = setInterval(() => {
                if (currentSession && isExecuting) {
                    saveSession();
                }
            }, 30000); // Save every 30 seconds

            return () => {
                clearInterval(saveInterval);
                // Save when leaving screen
                if (currentSession && isExecuting) {
                    saveSession();
                }
            };
        }, [currentSession, isExecuting, saveSession])
    );

    const handleCompleteActivity = async () => {
        if (!currentActivity) return;

        // Check if all sub-items are completed
        const allSubItemsCompleted = currentActivity.subItems?.every(item => item.completed) ?? true;

        if (!allSubItemsCompleted) {
            setShowConfirmationModal(true);
            return;
        }

        await performActivityCompletion();
    };

    const performActivityCompletion = async () => {
        try {
            console.log('Completing current activity...');
            await completeActivity();

            // Check if loop is completed
            if (progress.completed + 1 >= progress.total) {
                console.log('Loop completed, navigating to summary...');
                if (currentSession) {
                    navigation.replace('LoopSummaryScreen', {
                        sessionId: currentSession.id,
                        loopId: route.params.loopId
                    });
                }
            }
        } catch (error) {
            console.error('Error completing activity:', error);
            Alert.alert('Error', 'Failed to complete activity');
        }
    };

    const handleSkipActivity = async () => {
        try {
            console.log('Skipping current activity...');
            await skipActivity();

            // Check if loop is completed
            if (progress.completed + 1 >= progress.total) {
                console.log('Loop completed, navigating to summary...');
                if (currentSession) {
                    navigation.replace('LoopSummaryScreen', {
                        sessionId: currentSession.id,
                        loopId: route.params.loopId
                    });
                }
            }
        } catch (error) {
            console.error('Error skipping activity:', error);
            Alert.alert('Error', 'Failed to skip activity');
        }
    };

    const handlePauseResume = async () => {
        try {
            if (isPaused) {
                console.log('Resuming execution...');
                await resumeExecution();
            } else {
                console.log('Pausing execution...');
                await pauseExecution();
            }
        } catch (error) {
            console.error('Error toggling pause state:', error);
        }
    };

    const handleStopLoop = async () => {
        try {
            console.log('Stopping loop execution...');
            await stopExecution();
            navigation.goBack();
        } catch (error) {
            console.error('Error stopping loop:', error);
            Alert.alert('Error', 'Failed to stop loop');
        }
    };

    const handleActivityPress = async (activityIndex: number) => {
        // Only allow navigation to completed or current activity
        if (activityIndex > currentActivityIndex) {
            return; // Can't navigate to future activities
        }

        try {
            console.log(`Navigating to activity at index: ${activityIndex}`);
            // Implementation would depend on useLoopExecution hook having a method to jump to specific activity
            // For now, we'll just log this action
        } catch (error) {
            console.error('Error navigating to activity:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.abs(seconds) % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerDisplayText = () => {
        if (timer.isOvertime) {
            return formatTime(timer.overtimeElapsed);
        }
        return formatTime(timer.timeRemaining);
    };

    const getActivityStatus = (index: number) => {
        if (index < currentActivityIndex) return 'completed';
        if (index === currentActivityIndex) return 'current';
        return 'pending';
    };

    const getActivityTemplate = (templateId: string): ActivityTemplate | undefined => {
        return getTemplateById(templateId);
    };

    const getActivityColors = (template: ActivityTemplate | undefined, status: string) => {
        // Different colors for different activities like in HTML
        const colorSets = [
            { border: '#6366F1', bg: '#EEF2FF', icon: '#4F46E5' }, // indigo
            { border: '#14B8A6', bg: '#F0FDFA', icon: '#0F766E' }, // teal
            { border: '#F97316', bg: '#FFF7ED', icon: '#EA580C' }, // orange
            { border: '#D1D5DB', bg: '#F9FAFB', icon: '#6B7280' }, // gray
            { border: '#D1D5DB', bg: '#F9FAFB', icon: '#6B7280' }, // gray
        ];

        if (status === 'pending') {
            return { border: '#D1D5DB', bg: '#F9FAFB', icon: '#6B7280' };
        }

        const activityIndex = currentActivityIndex % colorSets.length;
        return colorSets[activityIndex];
    };

    const styles = useThemedStyles((theme) => ({
        container: {
            flex: 1,
            backgroundColor: '#F3F4F6', // bg-gray-100
            alignItems: 'center',
            justifyContent: 'center',
        },
        innerContainer: {
            width: '100%',
            maxWidth: 448, // max-w-md in pixels
            minHeight: '100%',
            backgroundColor: '#FFFFFF', // bg-white
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 25 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 25, // shadow-2xl
        },
        header: {
            padding: 24, // p-6
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB', // border-gray-200
        },
        headerButton: {
            padding: 4,
        },
        headerCenter: {
            alignItems: 'center',
            flex: 1,
            marginHorizontal: 16,
        },
        headerTitle: {
            fontFamily: 'Inter', // inter-font
            fontSize: 30, // text-3xl
            fontWeight: '700', // font-bold
            letterSpacing: -0.025, // tracking-tight
            color: '#4338CA', // text-indigo-700
            textAlign: 'center',
            lineHeight: 36,
        },
        headerSubtitle: {
            fontSize: 12, // text-xs
            color: '#6B7280', // text-gray-500
            marginTop: 2,
            lineHeight: 16,
        },
        mainContent: {
            flex: 1,
            padding: 24, // p-6
            alignItems: 'center',
        },
        activitiesContainer: {
            width: '100%',
            paddingVertical: 12, // py-3
            marginBottom: 16, // mb-4
        },
        activitiesScroll: {
            gap: 16, // space-x-4
            paddingHorizontal: 4,
        },
        activityCircle: {
            width: 80, // w-20
            height: 80, // h-20
            borderRadius: 40,
            borderWidth: 4,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4, // shadow-md
        },
        timerContainer: {
            alignItems: 'center',
            marginBottom: 16,
        },
        timerWrapper: {
            position: 'relative',
        },
        timerText: {
            fontFamily: 'Inter', // inter-font
            fontSize: 72, // text-7xl - equivalent to 72px
            fontWeight: '700', // font-bold
            color: '#4F46E5', // text-indigo-600
            lineHeight: 80,
            textAlign: 'center',
        },
        overtimeText: {
            fontSize: 12, // text-xs
            color: '#EF4444', // text-red-500
            marginTop: 4,
            lineHeight: 16,
        },
        resetButton: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            paddingVertical: 4,
            paddingHorizontal: 8,
        },
        resetButtonText: {
            fontSize: 10, // text-[10px]
            color: '#6366F1', // text-indigo-500
            fontWeight: '500',
            marginLeft: 2,
            lineHeight: 12,
        },
        activityDetailsContainer: {
            alignItems: 'center',
            marginTop: 24, // mt-6
            marginBottom: 24,
        },
        activityImage: {
            width: 96, // w-24
            height: 96, // h-24
            borderRadius: 48,
            borderWidth: 4,
            borderColor: '#A5B4FC', // border-indigo-300
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10, // shadow-lg
        },
        activityTitle: {
            fontFamily: 'Inter', // inter-font
            fontSize: 36, // text-4xl
            fontWeight: '700', // font-bold
            color: '#111827', // text-gray-900
            lineHeight: 40,
            textAlign: 'center',
        },
        activityDescription: {
            color: '#4B5563', // text-gray-600
            marginTop: 4,
            fontSize: 18, // text-lg
            lineHeight: 28,
            textAlign: 'center',
        },
        activityMeta: {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        activityMetaText: {
            fontSize: 14, // text-sm
            color: '#4B5563', // text-gray-600
            lineHeight: 20,
        },
        subActivitiesContainer: {
            width: '100%',
            maxWidth: 320, // max-w-xs
            marginTop: 24, // mt-6
        },
        subActivitiesHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8, // mb-2
        },
        subActivitiesTitle: {
            fontFamily: 'Inter', // inter-font
            fontSize: 20, // text-xl
            fontWeight: '600', // font-semibold
            color: '#374151', // text-gray-700
            lineHeight: 28,
        },
        subActivitiesList: {
            gap: 12, // space-y-3
        },
        subActivityItem: {
            backgroundColor: '#EEF2FF', // bg-indigo-50
            padding: 12, // p-3
            borderRadius: 12, // rounded-xl
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        subActivityLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        subActivityIcon: {
            marginRight: 12, // mr-3
        },
        subActivityText: {
            color: '#374151', // text-gray-700
            fontSize: 18, // text-lg
            lineHeight: 28,
        },
        subActivityTextCompleted: {
            textDecorationLine: 'line-through',
            opacity: 0.6,
        },
        nextActivityContainer: {
            alignItems: 'center',
            width: '100%',
            maxWidth: 320, // max-w-xs
            paddingTop: 16, // pt-4
            marginTop: 'auto',
        },
        nextActivityLabel: {
            fontSize: 14, // text-sm
            color: '#6B7280', // text-gray-500
            marginBottom: 4,
            lineHeight: 20,
        },
        nextActivityText: {
            fontSize: 18, // text-lg
            fontWeight: '500', // font-medium
            color: '#4F46E5', // text-indigo-600
            lineHeight: 28,
            textAlign: 'center',
        },
        footer: {
            padding: 12, // p-3
            backgroundColor: '#F9FAFB', // bg-gray-50
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB', // border-gray-200
        },
        footerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8, // space-x-2
        },
        footerButton: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8, // py-2
            paddingHorizontal: 12, // px-3
            borderRadius: 8, // rounded-lg
        },
        footerButtonIcon: {
            marginBottom: 2,
        },
        footerButtonText: {
            fontSize: 12, // text-xs
            marginTop: 2,
            lineHeight: 16,
        },
        playPauseButton: {
            backgroundColor: '#4F46E5', // bg-indigo-600
            width: 56, // w-14
            height: 56, // h-14
            borderRadius: 12, // rounded-xl
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 10, // shadow-lg
        },
        menuItem: {
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
        },
    }));

    if (!currentLoop || !currentActivity) {
        return (
            <View style={[styles.container]}>
                <View style={styles.innerContainer}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h3">Loading...</Typography>
                    </View>
                </View>
            </View>
        );
    }

    const nextActivity = currentLoop.activities?.[currentActivityIndex + 1];
    const currentTemplate = getActivityTemplate(currentActivity.templateId);
    const nextTemplate = nextActivity ? getActivityTemplate(nextActivity.templateId) : undefined;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.innerContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color="#4F46E5" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Typography style={styles.headerTitle}>
                            {currentLoop.title}
                        </Typography>
                        <Typography style={styles.headerSubtitle}>
                            Activity {currentActivityIndex + 1} of {progress.total}
                        </Typography>
                    </View>

                    <TouchableOpacity style={styles.headerButton} onPress={() => setShowMenu(true)}>
                        <Icon name="ellipsis-vertical" size={24} color="#4F46E5" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Activity Indicators */}
                    <View style={styles.activitiesContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.activitiesScroll}
                        >
                            {currentLoop.activities?.map((activity, index) => {
                                const status = getActivityStatus(index);
                                const template = getActivityTemplate(activity.templateId);
                                const colors = getActivityColors(template, status);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.activityCircle,
                                            {
                                                borderColor: colors.border,
                                                backgroundColor: colors.bg,
                                            }
                                        ]}
                                        onPress={() => handleActivityPress(index)}
                                        disabled={index > currentActivityIndex}
                                    >
                                        <Icon
                                            name="zap"
                                            size={32}
                                            color={colors.icon}
                                        />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <View style={styles.timerWrapper}>
                            <Typography style={styles.timerText}>
                                {getTimerDisplayText()}
                            </Typography>
                        </View>
                        {timer.isOvertime && (
                            <Typography style={styles.overtimeText}>
                                + {formatTime(timer.overtimeElapsed)} OVERTIME
                            </Typography>
                        )}
                        <TouchableOpacity style={styles.resetButton}>
                            <Icon name="refresh" size={16} color="#6366F1" />
                            <Typography style={styles.resetButtonText}>Reset timer</Typography>
                        </TouchableOpacity>
                    </View>

                    {/* Activity Details */}
                    <View style={styles.activityDetailsContainer}>
                        {/* Placeholder for activity image */}
                        <View style={[styles.activityImage, { backgroundColor: '#A5B4FC' }]}>
                            <Icon name="zap" size={48} color="#4F46E5" />
                        </View>

                        <Typography style={styles.activityTitle}>
                            {currentActivity.title || currentTemplate?.title || 'Activity'}
                        </Typography>
                        <Typography style={styles.activityDescription}>
                            {currentTemplate?.description || 'Complete this activity'}
                        </Typography>
                        {currentActivity.duration && (
                            <View style={styles.activityMeta}>
                                <Typography style={styles.activityMetaText}>
                                    {currentActivity.duration} min
                                </Typography>
                            </View>
                        )}
                    </View>

                    {/* Sub-activities */}
                    {currentActivity.subItems && currentActivity.subItems.length > 0 && (
                        <View style={styles.subActivitiesContainer}>
                            <View style={styles.subActivitiesHeader}>
                                <Typography style={styles.subActivitiesTitle}>Sub-activities</Typography>
                            </View>
                            <View style={styles.subActivitiesList}>
                                {currentActivity.subItems.map((subItem, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.subActivityItem}
                                        onPress={() => updateSubItemProgress(index, !subItem.completed)}
                                    >
                                        <View style={styles.subActivityLeft}>
                                            <View style={styles.subActivityIcon}>
                                                {subItem.completed ? (
                                                    <Icon name="check-circle" size={24} color="#14B8A6" />
                                                ) : (
                                                    <Icon name="circle" size={24} color="#6366F1" />
                                                )}
                                            </View>
                                            <Typography style={[
                                                styles.subActivityText,
                                                subItem.completed && styles.subActivityTextCompleted
                                            ]}>
                                                {subItem.label}
                                            </Typography>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Next Activity */}
                    {nextActivity && (
                        <View style={styles.nextActivityContainer}>
                            <Typography style={styles.nextActivityLabel}>Next Activity:</Typography>
                            <Typography style={styles.nextActivityText}>
                                {nextActivity.title || nextTemplate?.title} {nextActivity.duration ? `(${nextActivity.duration} min)` : ''}
                            </Typography>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        {/* Skip Button */}
                        <TouchableOpacity style={styles.footerButton} onPress={handleSkipActivity}>
                            <View style={styles.footerButtonIcon}>
                                <Icon name="skip-forward" size={24} color="#4B5563" />
                            </View>
                            <Typography style={[styles.footerButtonText, { color: '#4B5563' }]}>
                                Skip
                            </Typography>
                        </TouchableOpacity>

                        {/* Play/Pause Button */}
                        <TouchableOpacity style={styles.playPauseButton} onPress={handlePauseResume}>
                            <Icon
                                name={isPaused ? "play" : "pause"}
                                size={24}
                                color="#FFFFFF"
                            />
                        </TouchableOpacity>

                        {/* Complete Button */}
                        <TouchableOpacity style={styles.footerButton} onPress={handleCompleteActivity}>
                            <View style={styles.footerButtonIcon}>
                                <Icon name="check" size={24} color="#4B5563" />
                            </View>
                            <Typography style={[styles.footerButtonText, { color: '#4B5563' }]}>
                                Complete
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Bottom Sheet */}
                <BottomSheet visible={showMenu} onClose={() => setShowMenu(false)}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleStopLoop}>
                        <Typography variant="body1" color="error">Stop Loop</Typography>
                    </TouchableOpacity>
                </BottomSheet>

                {/* Confirmation Modal */}
                <ConfirmationModal
                    visible={showConfirmationModal}
                    title="Incomplete Tasks"
                    message="Some sub-activities are not completed. Do you want to complete this activity anyway?"
                    confirmText="Complete Anyway"
                    cancelText="Cancel"
                    onConfirm={async () => {
                        setShowConfirmationModal(false);
                        await performActivityCompletion();
                    }}
                    onCancel={() => setShowConfirmationModal(false)}
                />
            </View>
        </View>
    );
}