import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../app/contexts/ThemeContext';
// TODO: Re-implement in Phase 3
// import { useLoopActions } from '../../features/loops/store';
import { Icon } from './Icon';
// TODO: Re-enable when loops are implemented
// import { Loop, LoopExecutionState } from '../types/loop';

const { width: screenWidth } = Dimensions.get('window');

interface LoopExecutionHeaderProps {
    loop: any; // TODO: Re-type when Loop is implemented in Phase 3
    executionState: any; // TODO: Re-type when LoopExecutionState is implemented in Phase 3
    currentActivityName: string;
    currentIndex: number;
    totalActivities: number;
    onResume: () => void;
    onPause: () => void;
    onSkip: () => void;
    onOpenExecution: () => void;
    isPaused: boolean;
}

export const LoopExecutionHeader: React.FC<LoopExecutionHeaderProps> = ({
    loop,
    executionState,
    currentActivityName,
    currentIndex,
    totalActivities,
    onResume,
    onPause,
    onSkip,
    onOpenExecution,
    isPaused,
}) => {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.primary,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primaryDark || theme.colors.primary,
        },
        content: {
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        compactView: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        leftSection: {
            flex: 1,
            marginRight: 12,
        },
        activityName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.background,
        },
        progressText: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            marginTop: 2,
        },
        rightSection: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        actionButton: {
            width: 32,
            height: 32,
            borderRadius: theme.shape.radius.xl,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        progressBar: {
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: theme.shape.radius.xs,
            marginTop: 8,
            overflow: 'hidden',
        },
        progressFill: {
            height: 3,
            backgroundColor: theme.colors.background,
            borderRadius: theme.shape.radius.xs,
        },
    });

    const progress = totalActivities > 0 ? ((currentIndex + 1) / totalActivities) * 100 : 0;

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.content}>
                {/* Compact View */}
                <View style={styles.compactView}>
                    <TouchableOpacity style={styles.leftSection} onPress={onOpenExecution}>
                        <Text style={styles.activityName} numberOfLines={1}>{currentActivityName}</Text>
                        <Text style={styles.progressText}>
                            {currentIndex + 1} of {totalActivities} • {loop.title}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.rightSection}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={isPaused ? onResume : onPause}
                        >
                            <Icon
                                name={isPaused ? "circle-play" : "circle-pause"}
                                size={16}
                                color={theme.colors.background}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={onSkip}
                        >
                            <Icon
                                name="skip-forward"
                                size={16}
                                color={theme.colors.background}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress}%` }
                        ]}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}; 