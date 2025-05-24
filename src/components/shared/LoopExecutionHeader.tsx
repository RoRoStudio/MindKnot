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
import { useTheme } from '../../contexts/ThemeContext';
import { useLoopActions } from '../../store/loops';
import { Icon } from './Icon';
import { Loop, LoopExecutionState } from '../../types/loop';

const { width: screenWidth } = Dimensions.get('window');

interface LoopExecutionHeaderProps {
    loop: Loop;
    executionState: LoopExecutionState;
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
    const [isExpanded, setIsExpanded] = useState(false);

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
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandButton: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        expandedView: {
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.1)',
            marginTop: 8,
        },
        expandedControls: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 8,
        },
        expandedButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 16,
            gap: 6,
        },
        expandedButtonText: {
            fontSize: 12,
            fontWeight: '500',
            color: theme.colors.background,
        },
        progressBar: {
            height: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 1.5,
            marginTop: 8,
            overflow: 'hidden',
        },
        progressFill: {
            height: 3,
            backgroundColor: theme.colors.background,
            borderRadius: 1.5,
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

                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={() => setIsExpanded(!isExpanded)}
                        >
                            <Icon
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={12}
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

                {/* Expanded View */}
                {isExpanded && (
                    <View style={styles.expandedView}>
                        <View style={styles.expandedControls}>
                            <TouchableOpacity
                                style={styles.expandedButton}
                                onPress={onOpenExecution}
                            >
                                <Icon name="circle-play" size={14} color={theme.colors.background} />
                                <Text style={styles.expandedButtonText}>Open</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.expandedButton}
                                onPress={() => {
                                    // TODO: Implement stop loop functionality
                                }}
                            >
                                <Icon name="x" size={14} color={theme.colors.background} />
                                <Text style={styles.expandedButtonText}>Stop</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}; 