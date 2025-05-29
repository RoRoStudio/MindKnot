/**
 * LoopNotificationOverlay Component
 * Persistent notification overlay with session controls
 * Shows when loop is running in background or minimized
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import {
    Typography,
    Button,
    Icon,
} from '../../../shared/components';
import { ExecutionSession, ActivityInstance } from '../../../shared/types/loop';

export interface LoopNotificationOverlayProps {
    /** Current execution session */
    session: ExecutionSession;

    /** Current activity */
    currentActivity: ActivityInstance | null;

    /** Whether the overlay is visible */
    visible: boolean;

    /** Callback to return to app */
    onReturnToApp: () => void;

    /** Callback to pause execution */
    onPause: () => void;

    /** Callback to resume execution */
    onResume: () => void;

    /** Callback to skip current activity */
    onSkip: () => void;

    /** Callback to complete current activity */
    onComplete: () => void;

    /** Callback to stop execution */
    onStop: () => void;

    /** Whether execution is paused */
    isPaused: boolean;

    /** Current progress percentage */
    progress: number;
}

/**
 * LoopNotificationOverlay component for background session controls
 */
export const LoopNotificationOverlay: React.FC<LoopNotificationOverlayProps> = ({
    session,
    currentActivity,
    visible,
    onReturnToApp,
    onPause,
    onResume,
    onSkip,
    onComplete,
    onStop,
    isPaused,
    progress,
}) => {
    const styles = useThemedStyles((theme) => ({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.colors.primary,
            paddingTop: theme.spacing.l,
            paddingHorizontal: theme.spacing.m,
            paddingBottom: theme.spacing.m,
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 1000,
        },
        hidden: {
            display: 'none',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.s,
        },
        title: {
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.onPrimary,
        },
        closeButton: {
            padding: theme.spacing.xs,
        },
        content: {
            marginBottom: theme.spacing.s,
        },
        activityInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        activityEmoji: {
            fontSize: 16,
            marginRight: theme.spacing.s,
        },
        activityTitle: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.onPrimary,
            flex: 1,
        },
        progressInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        progressText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.onPrimary,
            opacity: 0.9,
        },
        statusText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.onPrimary,
            opacity: 0.9,
            fontWeight: theme.typography.fontWeight.medium,
        },
        controls: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        controlButton: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: theme.shape.radius.s,
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            marginHorizontal: theme.spacing.xs,
        },
        controlButtonText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.onPrimary,
            fontWeight: theme.typography.fontWeight.medium,
        },
        primaryControl: {
            backgroundColor: theme.colors.onPrimary,
        },
        primaryControlText: {
            color: theme.colors.primary,
        },
        progressBar: {
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 1.5,
            marginVertical: theme.spacing.xs,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.onPrimary,
            borderRadius: 1.5,
        },
    }));

    if (!visible) {
        return null;
    }

    const currentActivityIndex = session.currentActivityIndex + 1;
    const totalActivities = session.activityProgress.length;

    return (
        <View style={[styles.overlay, !visible && styles.hidden]}>
            {/* Header */}
            <View style={styles.header}>
                <Typography style={styles.title}>
                    Loop Active
                </Typography>
                <TouchableOpacity style={styles.closeButton} onPress={onReturnToApp}>
                    <Icon name="arrow-right" size={16} color="white" />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
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
                        Activity {currentActivityIndex} of {totalActivities}
                    </Typography>
                    <Typography style={styles.statusText}>
                        {isPaused ? 'Paused' : 'Running'}
                    </Typography>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={isPaused ? onResume : onPause}
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
                        Complete
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={onStop}>
                    <Typography style={styles.controlButtonText}>
                        Stop
                    </Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
}; 