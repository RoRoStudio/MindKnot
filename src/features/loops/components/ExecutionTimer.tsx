import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Icon } from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';

export interface ExecutionTimerProps extends StyleProps {
    /**
     * Duration in seconds for the timer
     */
    duration: number;

    /**
     * Whether the timer is currently running
     */
    isRunning: boolean;

    /**
     * Callback when timer completes
     */
    onComplete?: () => void;

    /**
     * Callback for timer updates (called every second)
     */
    onTick?: (remainingTime: number) => void;

    /**
     * Timer variant
     */
    variant?: 'circular' | 'linear';

    /**
     * Size of the timer
     */
    size?: 'small' | 'medium' | 'large';
}

/**
 * ExecutionTimer component for timing activities during loop execution
 * 
 * @example
 * ```tsx
 * <ExecutionTimer
 *   duration={300}
 *   isRunning={true}
 *   onComplete={handleTimerComplete}
 *   variant="circular"
 *   size="large"
 * />
 * ```
 */
export const ExecutionTimer: React.FC<ExecutionTimerProps> = ({
    duration,
    isRunning,
    onComplete,
    onTick,
    variant = 'circular',
    size = 'medium',
    style,
}) => {
    const [remainingTime, setRemainingTime] = useState(duration);

    const styles = useThemedStyles((theme) => ({
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.m,
        },
        circularContainer: {
            width: size === 'small' ? 80 : size === 'medium' ? 120 : 160,
            height: size === 'small' ? 80 : size === 'medium' ? 120 : 160,
            borderRadius: size === 'small' ? 40 : size === 'medium' ? 60 : 80,
            borderWidth: 4,
            borderColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.surface,
        },
        linearContainer: {
            width: '100%',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
            alignItems: 'center',
        },
        timeText: {
            fontSize: size === 'small' ? theme.typography.fontSize.m :
                size === 'medium' ? theme.typography.fontSize.l :
                    theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.textPrimary,
        },
        labelText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.xs,
        },
        progressBar: {
            width: '100%',
            height: 8,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.shape.radius.s,
            marginTop: theme.spacing.s,
            overflow: 'hidden',
        },
        progressFill: {
            height: '100%',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.shape.radius.s,
        },
        iconContainer: {
            marginBottom: theme.spacing.xs,
        },
    }));

    useEffect(() => {
        setRemainingTime(duration);
    }, [duration]);

    useEffect(() => {
        if (!isRunning || remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime((prev) => {
                const newTime = prev - 1;
                onTick?.(newTime);

                if (newTime <= 0) {
                    onComplete?.();
                    return 0;
                }

                return newTime;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, remainingTime, onComplete, onTick]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (duration - remainingTime) / duration : 0;

    if (variant === 'circular') {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.circularContainer}>
                    <View style={styles.iconContainer}>
                        <Icon
                            name={isRunning ? "play" : "pause"}
                            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
                            color={styles.timeText.color}
                        />
                    </View>
                    <Typography style={styles.timeText}>
                        {formatTime(remainingTime)}
                    </Typography>
                </View>
                <Typography style={styles.labelText}>
                    {isRunning ? 'Running' : 'Paused'}
                </Typography>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <View style={styles.linearContainer}>
                <Typography style={styles.timeText}>
                    {formatTime(remainingTime)}
                </Typography>
                <Typography style={styles.labelText}>
                    {isRunning ? 'Running' : 'Paused'}
                </Typography>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress * 100}%` }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}; 