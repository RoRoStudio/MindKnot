import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Button, Typography } from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';

export interface ExecutionControlsProps extends StyleProps {
    /**
     * Whether the loop is currently running
     */
    isRunning: boolean;

    /**
     * Whether the loop is paused
     */
    isPaused: boolean;

    /**
     * Whether controls should be disabled
     */
    disabled?: boolean;

    /**
     * Callback to start/resume execution
     */
    onPlay?: () => void;

    /**
     * Callback to pause execution
     */
    onPause?: () => void;

    /**
     * Callback to stop execution
     */
    onStop?: () => void;

    /**
     * Callback to skip current activity
     */
    onSkip?: () => void;

    /**
     * Callback to go to previous activity
     */
    onPrevious?: () => void;

    /**
     * Whether to show extended controls
     */
    showExtendedControls?: boolean;

    /**
     * Layout variant
     */
    variant?: 'horizontal' | 'vertical' | 'compact';
}

/**
 * ExecutionControls component provides playback controls for loop execution
 * 
 * @example
 * ```tsx
 * <ExecutionControls
 *   isRunning={isExecuting}
 *   isPaused={isPaused}
 *   onPlay={handlePlay}
 *   onPause={handlePause}
 *   onStop={handleStop}
 *   onSkip={handleSkip}
 *   showExtendedControls={true}
 * />
 * ```
 */
export const ExecutionControls: React.FC<ExecutionControlsProps> = ({
    isRunning,
    isPaused,
    disabled = false,
    onPlay,
    onPause,
    onStop,
    onSkip,
    onPrevious,
    showExtendedControls = false,
    variant = 'horizontal',
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.shape.radius.m,
        },
        horizontalContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.s,
        },
        verticalContainer: {
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        compactContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.xs,
        },
        primaryControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        secondaryControls: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.xs,
            marginTop: variant === 'vertical' ? theme.spacing.s : 0,
        },
        playButton: {
            minWidth: 60,
        },
        controlButton: {
            minWidth: 48,
        },
        statusText: {
            fontSize: theme.typography.fontSize.s,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xs,
        },
        statusRunning: {
            color: theme.colors.success,
        },
        statusPaused: {
            color: theme.colors.warning,
        },
        statusStopped: {
            color: theme.colors.textSecondary,
        },
    }));

    const getStatusText = () => {
        if (isRunning && !isPaused) return 'Running';
        if (isPaused) return 'Paused';
        return 'Stopped';
    };

    const getStatusStyle = () => {
        if (isRunning && !isPaused) return styles.statusRunning;
        if (isPaused) return styles.statusPaused;
        return styles.statusStopped;
    };

    const renderPrimaryControls = () => (
        <View style={styles.primaryControls}>
            {showExtendedControls && (
                <Button
                    variant="secondary"
                    size="medium"
                    leftIcon="skip-back"
                    label=""
                    onPress={onPrevious}
                    disabled={disabled}
                    style={styles.controlButton}
                />
            )}

            <Button
                variant="primary"
                size="large"
                leftIcon={isRunning && !isPaused ? "pause" : "play"}
                label={isRunning && !isPaused ? "Pause" : "Play"}
                onPress={isRunning && !isPaused ? onPause : onPlay}
                disabled={disabled}
                style={styles.playButton}
            />

            {showExtendedControls && (
                <Button
                    variant="secondary"
                    size="medium"
                    leftIcon="skip-forward"
                    label=""
                    onPress={onSkip}
                    disabled={disabled}
                    style={styles.controlButton}
                />
            )}
        </View>
    );

    const renderSecondaryControls = () => {
        if (!showExtendedControls) return null;

        return (
            <View style={styles.secondaryControls}>
                <Button
                    variant="outline"
                    size="small"
                    leftIcon="square"
                    label="Stop"
                    onPress={onStop}
                    disabled={disabled}
                />
            </View>
        );
    };

    const renderCompactControls = () => (
        <View style={styles.compactContainer}>
            <Button
                variant="secondary"
                size="small"
                leftIcon="skip-back"
                label=""
                onPress={onPrevious}
                disabled={disabled}
            />

            <Button
                variant="primary"
                size="medium"
                leftIcon={isRunning && !isPaused ? "pause" : "play"}
                label=""
                onPress={isRunning && !isPaused ? onPause : onPlay}
                disabled={disabled}
            />

            <Button
                variant="secondary"
                size="small"
                leftIcon="skip-forward"
                label=""
                onPress={onSkip}
                disabled={disabled}
            />

            <Button
                variant="outline"
                size="small"
                leftIcon="square"
                label=""
                onPress={onStop}
                disabled={disabled}
            />
        </View>
    );

    if (variant === 'compact') {
        return (
            <View style={[styles.container, style]}>
                {renderCompactControls()}
            </View>
        );
    }

    const containerStyle = variant === 'horizontal'
        ? styles.horizontalContainer
        : styles.verticalContainer;

    return (
        <View style={[styles.container, style]}>
            {variant === 'vertical' && (
                <Typography style={[styles.statusText, getStatusStyle()]}>
                    {getStatusText()}
                </Typography>
            )}

            <View style={containerStyle}>
                {renderPrimaryControls()}
                {variant === 'horizontal' && renderSecondaryControls()}
            </View>

            {variant === 'vertical' && renderSecondaryControls()}
        </View>
    );
}; 