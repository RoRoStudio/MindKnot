/**
 * LoopSessionWidget Component
 * Floating widget for active loop sessions
 * Shows current activity, timer, and quick controls
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Icon,
} from '../../../shared/components';
import { ExecutionSession, ActivityInstance } from '../../../shared/types/loop';

export interface LoopSessionWidgetProps {
    /** Current execution session */
    session: ExecutionSession;

    /** Current activity */
    currentActivity: ActivityInstance | null;

    /** Whether the widget is visible */
    visible: boolean;

    /** Timer state */
    timer: {
        currentTime: number;
        totalTime: number;
        isRunning: boolean;
        hasTimer: boolean;
    };

    /** Whether execution is paused */
    isPaused: boolean;

    /** Current progress percentage */
    progress: number;

    /** Callback to expand to full screen */
    onExpand: () => void;

    /** Callback to pause/resume */
    onTogglePause: () => void;

    /** Callback to skip activity */
    onSkip: () => void;

    /** Callback to complete activity */
    onComplete: () => void;

    /** Whether widget is minimized */
    isMinimized?: boolean;

    /** Callback to toggle minimize */
    onToggleMinimize?: () => void;
}

/**
 * LoopSessionWidget component for floating session controls
 */
export const LoopSessionWidget: React.FC<LoopSessionWidgetProps> = ({
    session,
    currentActivity,
    visible,
    timer,
    isPaused,
    progress,
    onExpand,
    onTogglePause,
    onSkip,
    onComplete,
    isMinimized = false,
    onToggleMinimize,
}) => {
    const [animatedValue] = useState(new Animated.Value(1));

    const styles = useThemedStyles((theme) => ({
        widget: {
            position: 'absolute',
            bottom: theme.spacing.l,
            right: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.l,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            zIndex: 999,
            overflow: 'hidden',
        },
        minimized: {
            width: 60,
            height: 60,
        },
        expanded: {
            width: 280,
            minHeight: 120,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerMinimized: {
            padding: theme.spacing.s,
            borderBottomWidth: 0,
            justifyContent: 'center',
        },
        title: {
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        minimizedIcon: {
            alignSelf: 'center',
        },
        content: {
            padding: theme.spacing.m,
        },
        activityInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.s,
        },
        activityEmoji: {
            fontSize: 18,
            marginRight: theme.spacing.s,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.textPrimary,
            flex: 1,
        },
        progressInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        progressText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
        },
        timerText: {
            fontSize: theme.typography.fontSize.s,
            color: timer.isRunning ? theme.colors.primary : theme.colors.textSecondary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        controls: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        controlButton: {
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginHorizontal: theme.spacing.xs,
            flex: 1,
            alignItems: 'center',
        },
        controlButtonText: {
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        primaryControl: {
            backgroundColor: theme.colors.primary,
        },
        primaryControlText: {
            color: theme.colors.onPrimary,
        },
        progressBar: {
            height: 2,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 1,
            marginBottom: theme.spacing.s,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: 1,
        },
        minimizedProgress: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: theme.colors.surfaceVariant,
        },
        minimizedProgressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
        },
    }));

    if (!visible) {
        return null;
    }

    const currentActivityIndex = session.currentActivityIndex + 1;
    const totalActivities = session.activityProgress.length;

    // Format timer
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const timerDisplay = timer.hasTimer
        ? `${formatTime(timer.currentTime)} / ${formatTime(timer.totalTime)}`
        : isPaused ? 'Paused' : 'Running';

    if (isMinimized) {
        return (
            <TouchableOpacity
                style={[styles.widget, styles.minimized]}
                onPress={onToggleMinimize}
            >
                <View style={[styles.header, styles.headerMinimized]}>
                    <Icon
                        name={isPaused ? "pause" : "play"}
                        size={24}
                        color={isPaused ? "#666" : "#007AFF"}
                        style={styles.minimizedIcon}
                    />
                </View>

                {/* Minimized Progress Bar */}
                <View style={styles.minimizedProgress}>
                    <View style={[styles.minimizedProgressFill, { width: `${progress}%` }]} />
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <Animated.View style={[styles.widget, styles.expanded, { opacity: animatedValue }]}>
            {/* Header */}
            <View style={styles.header}>
                <Typography style={styles.title}>
                    Loop Active
                </Typography>
                <View style={{ flexDirection: 'row' }}>
                    {onToggleMinimize && (
                        <TouchableOpacity onPress={onToggleMinimize} style={{ marginRight: 8 }}>
                            <Icon name="minus" size={16} color="#666" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={onExpand}>
                        <Icon name="arrow-right" size={16} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>

                {/* Current Activity */}
                {currentActivity && (
                    <View style={styles.activityInfo}>
                        <Typography style={styles.activityEmoji}>
                            ⚡
                        </Typography>
                        <Typography style={styles.activityTitle} numberOfLines={1}>
                            {currentActivity.title || 'Current Activity'}
                        </Typography>
                    </View>
                )}

                {/* Progress Info */}
                <View style={styles.progressInfo}>
                    <Typography style={styles.progressText}>
                        {currentActivityIndex} of {totalActivities}
                    </Typography>
                    <Typography style={styles.timerText}>
                        {timerDisplay}
                    </Typography>
                </View>

                {/* Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={onTogglePause}
                    >
                        <Typography style={styles.controlButtonText}>
                            {isPaused ? 'Resume' : 'Pause'}
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
                        <Typography style={styles.controlButtonText}>
                            Skip
                        </Typography>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.controlButton, styles.primaryControl]}
                        onPress={onComplete}
                    >
                        <Typography style={[styles.controlButtonText, styles.primaryControlText]}>
                            Done
                        </Typography>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
}; 