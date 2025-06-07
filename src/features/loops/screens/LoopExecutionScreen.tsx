/**
 * LoopExecutionScreen - Beautiful focused loop execution interface
 * Features modern, distraction-free design with proper theme adherence
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Typography } from '../../../shared/components/Typography';
import { Icon } from '../../../shared/components/Icon';
import { BeautifulTimer } from '../../../shared/components/BeautifulTimer';
import { useTheme } from '../../../app/contexts/ThemeContext';
import { RootState } from '../../../app/store';
import { updateLoopExecution, completeLoopExecution } from '../store/loopSlice';
import { ActivityInstance, LoopExecution } from '../types';
import { RootStackParamList } from '../../../app/navigation/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type LoopExecutionRouteProp = RouteProp<{
    LoopExecutionScreen: {
        loopId: string;
        executionId?: string;
    };
}, 'LoopExecutionScreen'>;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoopExecutionScreen() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<LoopExecutionRouteProp>();
    const { loopId, executionId } = route.params;

    // State
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showSubItems, setShowSubItems] = useState(false);
    const [completedSubItems, setCompletedSubItems] = useState<Set<string>>(new Set());

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Redux state
    const loop = useSelector((state: RootState) =>
        state.loops.loops.find(l => l.id === loopId)
    );
    const execution = useSelector((state: RootState) =>
        executionId ? state.loops.executions.find(e => e.id === executionId) : null
    );

    const currentActivity = loop?.activities[currentActivityIndex];
    const totalActivities = loop?.activities.length || 0;
    const progress = totalActivities > 0 ? (currentActivityIndex + 1) / totalActivities : 0;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
                toValue: progress,
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        // Update progress animation when activity changes
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (currentActivityIndex < totalActivities - 1) {
            setCurrentActivityIndex(prev => prev + 1);
            setCompletedSubItems(new Set());
            setShowSubItems(false);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentActivityIndex > 0) {
            setCurrentActivityIndex(prev => prev - 1);
            setCompletedSubItems(new Set());
            setShowSubItems(false);
        }
    };

    const handleComplete = () => {
        Alert.alert(
            'Complete Loop',
            'Are you sure you want to complete this loop execution?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    style: 'default',
                    onPress: () => {
                        dispatch(completeLoopExecution({
                            loopId,
                            executionId: executionId || 'new',
                            totalTime: elapsedTime,
                        }));
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleSubItemToggle = (subItemId: string) => {
        const newCompleted = new Set(completedSubItems);
        if (newCompleted.has(subItemId)) {
            newCompleted.delete(subItemId);
        } else {
            newCompleted.add(subItemId);
        }
        setCompletedSubItems(newCompleted);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!loop || !currentActivity) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <Icon name="circle-alert" size={64} color={theme.colors.error} />
                    <Typography style={[styles.errorTitle, { color: theme.colors.error }]}>
                        Loop Not Found
                    </Typography>
                </View>
            </SafeAreaView>
        );
    }

    const styles = {
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 8,
        },
        headerRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
        },
        backButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        loopTitle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: theme.colors.textPrimary,
            flex: 1,
            textAlign: 'center' as const,
            marginHorizontal: 16,
        },
        menuButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.surface,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        progressContainer: {
            paddingHorizontal: 24,
            paddingVertical: 16,
        },
        progressBar: {
            height: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 4,
            overflow: 'hidden' as const,
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
        },
        progressText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center' as const,
            marginTop: 8,
        },
        content: {
            flex: 1,
            paddingHorizontal: 24,
        },
        activityCard: {
            backgroundColor: theme.colors.surface,
            borderRadius: 28,
            padding: 32,
            marginBottom: 24,
            ...theme.elevation.m,
        },
        activityHeader: {
            alignItems: 'center' as const,
            marginBottom: 24,
        },
        activityIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginBottom: 16,
            ...theme.elevation.xs,
        },
        activityTitle: {
            fontSize: 24,
            fontWeight: '700' as const,
            color: theme.colors.textPrimary,
            textAlign: 'center' as const,
            marginBottom: 8,
        },
        activityDuration: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center' as const,
        },
        activityDescription: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            lineHeight: 24,
            textAlign: 'center' as const,
            marginBottom: 24,
        },
        subItemsSection: {
            marginTop: 24,
        },
        subItemsHeader: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            marginBottom: 16,
        },
        subItemsTitle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: theme.colors.textPrimary,
        },
        toggleButton: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: theme.colors.surfaceVariant,
        },
        toggleText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginLeft: 8,
        },
        subItemsList: {
            gap: 12,
        },
        subItem: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            padding: 16,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
        },
        subItemCompleted: {
            backgroundColor: theme.colors.primaryContainer,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.outline,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: 12,
        },
        checkboxChecked: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        subItemText: {
            fontSize: 16,
            color: theme.colors.textPrimary,
            flex: 1,
        },
        subItemTextCompleted: {
            color: theme.colors.textSecondary,
            textDecorationLine: 'line-through' as const,
        },
        // Sticky bottom controls
        stickyBottom: {
            position: 'absolute' as const,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 24,
            paddingBottom: 34, // Account for safe area
            paddingHorizontal: 24,
            ...theme.elevation.xl,
        },
        timerSection: {
            alignItems: 'center' as const,
            marginBottom: 24,
        },
        timerDisplay: {
            fontSize: 48,
            fontWeight: '300' as const,
            color: theme.colors.textPrimary,
            marginBottom: 8,
        },
        timerLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
        },
        controlsRow: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            justifyContent: 'space-between' as const,
            marginBottom: 16,
        },
        controlButton: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            ...theme.elevation.xs,
        },
        previousButton: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        playPauseButton: {
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.colors.primary,
        },
        nextButton: {
            backgroundColor: theme.colors.surfaceVariant,
        },
        disabledButton: {
            opacity: 0.3,
        },
        completeButton: {
            backgroundColor: theme.colors.secondary,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 28,
            alignItems: 'center' as const,
            ...theme.elevation.m,
        },
        completeButtonText: {
            fontSize: 16,
            fontWeight: '600' as const,
            color: theme.colors.onSecondary,
        },
        errorContainer: {
            flex: 1,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            padding: 24,
        },
        errorTitle: {
            fontSize: 24,
            fontWeight: '600' as const,
            marginTop: 16,
            textAlign: 'center' as const,
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <Typography style={styles.loopTitle} numberOfLines={1}>
                        {loop.title}
                    </Typography>

                    <TouchableOpacity style={styles.menuButton}>
                        <Icon name="more-horizontal" size={20} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                })
                            }
                        ]}
                    />
                </View>
                <Typography style={styles.progressText}>
                    Activity {currentActivityIndex + 1} of {totalActivities}
                </Typography>
            </View>

            {/* Main Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 280 }} // Space for sticky controls
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                >
                    <View style={styles.activityCard}>
                        {/* Activity Header */}
                        <View style={styles.activityHeader}>
                            <View style={styles.activityIcon}>
                                <Icon name="zap" size={32} color={theme.colors.onPrimary} />
                            </View>

                            <Typography style={styles.activityTitle}>
                                {currentActivity.title}
                            </Typography>

                            <Typography style={styles.activityDuration}>
                                {currentActivity.estimatedDuration} minutes
                            </Typography>
                        </View>

                        {/* Activity Description */}
                        {currentActivity.description && (
                            <Typography style={styles.activityDescription}>
                                {currentActivity.description}
                            </Typography>
                        )}

                        {/* Sub-items */}
                        {currentActivity.subItems && currentActivity.subItems.length > 0 && (
                            <View style={styles.subItemsSection}>
                                <View style={styles.subItemsHeader}>
                                    <Typography style={styles.subItemsTitle}>
                                        Sub-tasks ({completedSubItems.size}/{currentActivity.subItems.length})
                                    </Typography>
                                    <TouchableOpacity
                                        style={styles.toggleButton}
                                        onPress={() => setShowSubItems(!showSubItems)}
                                    >
                                        <Icon
                                            name={showSubItems ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={theme.colors.textSecondary}
                                        />
                                        <Typography style={styles.toggleText}>
                                            {showSubItems ? 'Hide' : 'Show'}
                                        </Typography>
                                    </TouchableOpacity>
                                </View>

                                {showSubItems && (
                                    <View style={styles.subItemsList}>
                                        {currentActivity.subItems.map((subItem, index) => {
                                            const isCompleted = completedSubItems.has(subItem.id);
                                            return (
                                                <TouchableOpacity
                                                    key={subItem.id}
                                                    style={[
                                                        styles.subItem,
                                                        isCompleted && styles.subItemCompleted
                                                    ]}
                                                    onPress={() => handleSubItemToggle(subItem.id)}
                                                >
                                                    <View style={[
                                                        styles.checkbox,
                                                        isCompleted && styles.checkboxChecked
                                                    ]}>
                                                        {isCompleted && (
                                                            <Icon name="check" size={14} color={theme.colors.onPrimary} />
                                                        )}
                                                    </View>
                                                    <Typography style={[
                                                        styles.subItemText,
                                                        isCompleted && styles.subItemTextCompleted
                                                    ]}>
                                                        {subItem.title}
                                                    </Typography>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Sticky Bottom Controls */}
            <View style={styles.stickyBottom}>
                {/* Timer */}
                <View style={styles.timerSection}>
                    <Typography style={styles.timerDisplay}>
                        {formatTime(elapsedTime)}
                    </Typography>
                    <Typography style={styles.timerLabel}>
                        Elapsed Time
                    </Typography>
                </View>

                {/* Play Controls */}
                <View style={styles.controlsRow}>
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            styles.previousButton,
                            currentActivityIndex === 0 && styles.disabledButton
                        ]}
                        onPress={handlePrevious}
                        disabled={currentActivityIndex === 0}
                    >
                        <Icon name="skip-back" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.playPauseButton]}
                        onPress={handlePlayPause}
                    >
                        <Icon
                            name={isPlaying ? "pause" : "play"}
                            size={28}
                            color={theme.colors.onPrimary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            styles.nextButton,
                            currentActivityIndex === totalActivities - 1 && styles.disabledButton
                        ]}
                        onPress={handleNext}
                        disabled={currentActivityIndex === totalActivities - 1}
                    >
                        <Icon name="skip-forward" size={24} color={theme.colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Complete Button */}
                <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                    <Typography style={styles.completeButtonText}>
                        Complete Loop
                    </Typography>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}