import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './Icon';

interface BeautifulTimerProps {
    durationMinutes?: number;
    elapsedSeconds: number;
    isRunning: boolean;
    isPaused: boolean;
    onPause: (paused: boolean) => void;
    onReset?: () => void;
    onSkip: () => void;
    onComplete: () => void;
    autoCompleteOnTimerEnd?: boolean;
    theme: any;
}

export const BeautifulTimer: React.FC<BeautifulTimerProps> = ({
    durationMinutes,
    elapsedSeconds,
    isRunning,
    isPaused,
    onPause,
    onReset,
    onSkip,
    onComplete,
    autoCompleteOnTimerEnd = true,
    theme
}) => {
    const progressAnimation = useRef(new Animated.Value(0)).current;
    const breatheAnimation = useRef(new Animated.Value(1)).current;
    const styles = createStyles(theme);

    // Auto-complete when timer reaches duration
    useEffect(() => {
        if (durationMinutes && autoCompleteOnTimerEnd && elapsedSeconds >= durationMinutes * 60) {
            onComplete();
        }
    }, [durationMinutes, autoCompleteOnTimerEnd, elapsedSeconds, onComplete]);

    // Animate progress bar
    useEffect(() => {
        if (durationMinutes) {
            const progress = Math.min(elapsedSeconds / (durationMinutes * 60), 1);
            Animated.timing(progressAnimation, {
                toValue: progress,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [elapsedSeconds, durationMinutes, progressAnimation]);

    // Gentle breathing animation when running
    useEffect(() => {
        if (isRunning && !isPaused) {
            const breathe = Animated.loop(
                Animated.sequence([
                    Animated.timing(breatheAnimation, {
                        toValue: 1.02,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(breatheAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            );
            breathe.start();
            return () => breathe.stop();
        } else {
            breatheAnimation.setValue(1);
        }
    }, [isRunning, isPaused, breatheAnimation]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!durationMinutes) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.noTimerContent}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Icon name="clock" size={24} color={theme.colors.textSecondary} />
                    </View>
                    <Text style={[styles.noTimerText, { color: theme.colors.textPrimary }]}>
                        No timer set
                    </Text>
                    <Text style={[styles.noTimerSubtext, { color: theme.colors.textSecondary }]}>
                        Complete when ready
                    </Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={onSkip}
                    >
                        <Icon name="skip-forward" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.controlButtonText, { color: theme.colors.textSecondary }]}>
                            Skip
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                        onPress={onComplete}
                    >
                        <Icon name="check" size={16} color={theme.colors.background} />
                        <Text style={[styles.controlButtonText, { color: theme.colors.background }]}>
                            Complete
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const totalSeconds = durationMinutes * 60;
    const timeLeft = Math.max(0, totalSeconds - elapsedSeconds);
    const isOvertime = elapsedSeconds > totalSeconds;
    const overtimeSeconds = Math.max(0, elapsedSeconds - totalSeconds);
    const progress = Math.min(elapsedSeconds / totalSeconds, 1);

    const progressWidth = progressAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    transform: [{ scale: breatheAnimation }]
                }
            ]}
        >
            {/* Progress Bar */}
            <View style={[styles.progressContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressWidth,
                            backgroundColor: isOvertime ? theme.colors.warning : theme.colors.primary,
                        },
                    ]}
                />
            </View>

            {/* Timer Display */}
            <View style={styles.timerContent}>
                <View style={styles.timeDisplay}>
                    <Text style={[styles.timeText, { color: theme.colors.textPrimary }]}>
                        {isOvertime ? formatTime(totalSeconds) : formatTime(timeLeft)}
                    </Text>
                    {isOvertime && (
                        <Text style={[styles.overtimeText, { color: theme.colors.warning }]}>
                            +{formatTime(overtimeSeconds)}
                        </Text>
                    )}
                </View>

                <View style={styles.statusContainer}>
                    <View style={[
                        styles.statusIndicator,
                        {
                            backgroundColor: isPaused
                                ? theme.colors.textSecondary
                                : isOvertime
                                    ? theme.colors.warning
                                    : theme.colors.primary
                        }
                    ]} />
                    <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                        {isPaused
                            ? 'Paused'
                            : isOvertime
                                ? 'Overtime'
                                : `${Math.floor(timeLeft / 60)} min remaining`
                        }
                    </Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => onReset && onReset()}
                >
                    <Icon name="refresh" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.controlButtonText, { color: theme.colors.textSecondary }]}>
                        Reset
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, styles.pauseButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => onPause(!isPaused)}
                >
                    <Icon
                        name={isPaused ? "circle-play" : "circle-pause"}
                        size={16}
                        color={theme.colors.background}
                    />
                    <Text style={[styles.controlButtonText, { color: theme.colors.background }]}>
                        {isPaused ? 'Resume' : 'Pause'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={onSkip}
                >
                    <Icon name="skip-forward" size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.controlButtonText, { color: theme.colors.textSecondary }]}>
                        Skip
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        borderRadius: theme.shape.radius.xl,
        padding: 20,
        marginVertical: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    progressContainer: {
        height: 4,
        borderRadius: theme.shape.radius.xs,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: theme.shape.radius.xs,
    },
    timerContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timeDisplay: {
        alignItems: 'center',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 32,
        fontWeight: '300',
        letterSpacing: 1,
    },
    overtimeText: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: theme.shape.radius.s,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    controlButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: theme.shape.radius.l,
        gap: 6,
    },
    primaryButton: {
        flex: 1.2,
    },
    pauseButton: {
        flex: 1.2,
    },
    controlButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    noTimerContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.shape.radius.xs4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    noTimerText: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 4,
    },
    noTimerSubtext: {
        fontSize: 14,
    },
}); 