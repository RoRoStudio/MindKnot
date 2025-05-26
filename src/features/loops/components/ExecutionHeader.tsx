import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useThemedStyles } from '../../../shared/hooks/useThemedStyles';
import { Typography, Icon, Button } from '../../../shared/components';
import { ExecutionState } from '../../../shared/types/loop';

export interface ExecutionHeaderProps {
    execution: ExecutionState;
    currentActivityName: string;
    onPause: () => void;
    onResume: () => void;
    onSkip: () => void;
    onOpenExecution: () => void;
}

/**
 * ExecutionHeader component displays a compact header when a loop is executing
 * Shows current activity, progress, and basic controls
 */
export const ExecutionHeader: React.FC<ExecutionHeaderProps> = ({
    execution,
    currentActivityName,
    onPause,
    onResume,
    onSkip,
    onOpenExecution,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
        },
        leftSection: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        rightSection: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.s,
        },
        activityInfo: {
            flex: 1,
            marginLeft: theme.spacing.s,
        },
        activityName: {
            color: theme.colors.onPrimary,
            fontSize: theme.typography.fontSize.m,
            fontWeight: theme.typography.fontWeight.medium,
        },
        progressText: {
            color: theme.colors.onPrimary,
            fontSize: theme.typography.fontSize.s,
            opacity: 0.8,
        },
        controlButton: {
            padding: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        openButton: {
            paddingHorizontal: theme.spacing.s,
            paddingVertical: theme.spacing.xs,
            borderRadius: theme.shape.radius.s,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        openButtonText: {
            color: theme.colors.onPrimary,
            fontSize: theme.typography.fontSize.s,
            fontWeight: theme.typography.fontWeight.medium,
        },
    }));

    const progress = `${execution.currentActivityIndex + 1}/${execution.activities.length}`;
    const isPaused = execution.status === 'paused';

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.leftSection} onPress={onOpenExecution}>
                <Icon
                    name="infinity"
                    size={20}
                    color={styles.activityName.color}
                />
                <View style={styles.activityInfo}>
                    <Typography style={styles.activityName} numberOfLines={1}>
                        {currentActivityName}
                    </Typography>
                    <Typography style={styles.progressText}>
                        Activity {progress} • {isPaused ? 'Paused' : 'Running'}
                    </Typography>
                </View>
            </TouchableOpacity>

            <View style={styles.rightSection}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={isPaused ? onResume : onPause}
                >
                    <Icon
                        name={isPaused ? 'play' : 'pause'}
                        size={16}
                        color={styles.activityName.color}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
                    <Icon
                        name="skip-forward"
                        size={16}
                        color={styles.activityName.color}
                    />
                </TouchableOpacity>

                <TouchableOpacity style={styles.openButton} onPress={onOpenExecution}>
                    <Typography style={styles.openButtonText}>Open</Typography>
                </TouchableOpacity>
            </View>
        </View>
    );
}; 