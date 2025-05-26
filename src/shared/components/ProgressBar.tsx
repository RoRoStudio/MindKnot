import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

export interface ProgressBarProps {
    /**
     * Progress value between 0 and 1
     */
    progress: number;

    /**
     * Height of the progress bar
     */
    height?: number;

    /**
     * Color of the progress bar
     */
    color?: string;

    /**
     * Background color of the progress bar
     */
    backgroundColor?: string;

    /**
     * Border radius of the progress bar
     */
    borderRadius?: number;

    /**
     * Additional styles for the container
     */
    style?: ViewStyle;
}

/**
 * ProgressBar component for showing progress
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    color,
    backgroundColor,
    borderRadius,
    style,
}) => {
    const styles = useThemedStyles((theme) => ({
        container: {
            height,
            backgroundColor: backgroundColor || theme.colors.surfaceVariant,
            borderRadius: borderRadius ?? theme.shape.radius.s,
            overflow: 'hidden',
        },
        progress: {
            height: '100%',
            backgroundColor: color || theme.colors.primary,
            borderRadius: borderRadius ?? theme.shape.radius.s,
        },
    }));

    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.progress,
                    { width: `${clampedProgress * 100}%` }
                ]}
            />
        </View>
    );
}; 