import React from 'react';
import { View } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography } from '../../../shared/components';
import { StyleProps } from '../../../shared/components/shared-props';
import { ExecutionState } from '../../../shared/types/loop';

export interface ExecutionProgressProps extends StyleProps {
    /**
     * Current execution state
     */
    execution: ExecutionState;

    /**
     * Whether to show detailed progress
     */
    showDetails?: boolean;
}

export const ExecutionProgress: React.FC<ExecutionProgressProps> = ({
    execution,
    showDetails = false,
    style,
}) => {
    const styles = useThemedStyles(createStyles);

    const getProgressPercentage = (): number => {
        if (execution.activities.length === 0) return 0;
        return (execution.currentActivityIndex / execution.activities.length) * 100;
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const progressPercentage = getProgressPercentage();

    return (
        <View style={[styles.container, style]}>
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${progressPercentage}%` }
                    ]}
                />
            </View>

            <View style={styles.progressInfo}>
                <Typography style={styles.progressText}>
                    {execution.currentActivityIndex + 1} of {execution.activities.length} activities
                </Typography>

                {showDetails && (
                    <Typography style={styles.timeText}>
                        {formatTime(execution.totalElapsed)} elapsed
                    </Typography>
                )}
            </View>
        </View>
    );
};

const createStyles = (theme: any) => ({
    container: {
        padding: theme.spacing.m,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.shape.radius.s,
        overflow: 'hidden' as 'hidden',
        marginBottom: theme.spacing.s,
    },
    progressFill: {
        height: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.shape.radius.s,
    },
    progressInfo: {
        flexDirection: 'row' as 'row',
        justifyContent: 'space-between' as 'space-between',
        alignItems: 'center' as 'center',
    },
    progressText: {
        ...theme.typography.preset.body2,
        color: theme.colors.textSecondary,
    },
    timeText: {
        ...theme.typography.preset.caption,
        color: theme.colors.textSecondary,
    },
}); 