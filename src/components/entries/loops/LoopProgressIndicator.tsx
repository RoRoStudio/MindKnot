import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { LoopActivityInstance, ActivityTemplate } from '../../../types/loop';

interface LoopProgressIndicatorProps {
    currentIndex: number;
    totalActivities: number;
    completedCount: number;
    activityInstances?: LoopActivityInstance[];
    activityTemplates?: ActivityTemplate[];
    compact?: boolean;
}

export const LoopProgressIndicator: React.FC<LoopProgressIndicatorProps> = ({
    currentIndex,
    totalActivities,
    completedCount,
    activityInstances = [],
    activityTemplates = [],
    compact = false,
}) => {
    const { theme } = useTheme();

    const progress = totalActivities > 0 ? (currentIndex / totalActivities) * 100 : 0;

    const getTemplateForInstance = (instance: LoopActivityInstance) => {
        return activityTemplates.find(template => template.id === instance.templateId);
    };

    const getActivityName = (index: number) => {
        if (index < activityInstances.length) {
            const instance = activityInstances[index];
            const template = getTemplateForInstance(instance);
            return instance.overriddenTitle || template?.title || `Activity ${index + 1}`;
        }
        return `Activity ${index + 1}`;
    };

    const getActivityIcon = (index: number) => {
        if (index < activityInstances.length) {
            const instance = activityInstances[index];
            const template = getTemplateForInstance(instance);
            return template?.icon || '📝';
        }
        return '📝';
    };

    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 16,
            marginVertical: 8,
        },
        compactContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textPrimary,
        },
        progressText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.textSecondary,
        },
        progressBarContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        progressBar: {
            flex: 1,
            height: 8,
            backgroundColor: theme.colors.border,
            borderRadius: 4,
            marginRight: 8,
        },
        progressFill: {
            height: 8,
            backgroundColor: theme.colors.primary,
            borderRadius: 4,
        },
        compactProgressBar: {
            flex: 1,
            height: 4,
            backgroundColor: theme.colors.border,
            borderRadius: 2,
        },
        compactProgressFill: {
            height: 4,
            backgroundColor: theme.colors.primary,
            borderRadius: 2,
        },
        percentageText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
            minWidth: 40,
            textAlign: 'right',
        },
        compactText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        activitiesContainer: {
            gap: 8,
        },
        activityItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        activityDot: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
        },
        activityDotCompleted: {
            backgroundColor: theme.colors.success,
            borderColor: theme.colors.success,
        },
        activityDotCurrent: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        activityDotUpcoming: {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
        },
        activityIcon: {
            fontSize: 16,
        },
        checkmark: {
            fontSize: 16,
            color: theme.colors.background,
            fontWeight: 'bold',
        },
        activityName: {
            flex: 1,
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        activityNameCompleted: {
            color: theme.colors.textSecondary,
            textDecorationLine: 'line-through',
        },
        activityNameCurrent: {
            color: theme.colors.textPrimary,
            fontWeight: '600',
        },
        activityNameUpcoming: {
            color: theme.colors.textSecondary,
        },
        moreIndicator: {
            paddingVertical: 8,
            alignItems: 'center',
        },
        moreText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontStyle: 'italic',
        },
        completedSection: {
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        completedText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    });

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactProgressBar}>
                    <View style={[styles.compactProgressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.compactText}>
                    {currentIndex + 1} of {totalActivities}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Progress</Text>
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {totalActivities}
                </Text>
            </View>

            <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.activitiesContainer}>
                {Array.from({ length: Math.min(totalActivities, 5) }, (_, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUpcoming = index > currentIndex;

                    return (
                        <View key={index} style={styles.activityItem}>
                            <View style={[
                                styles.activityDot,
                                isCompleted && styles.activityDotCompleted,
                                isCurrent && styles.activityDotCurrent,
                                isUpcoming && styles.activityDotUpcoming,
                            ]}>
                                {isCompleted ? (
                                    <Text style={styles.checkmark}>✓</Text>
                                ) : (
                                    <Text style={styles.activityIcon}>
                                        {getActivityIcon(index)}
                                    </Text>
                                )}
                            </View>
                            <Text style={[
                                styles.activityName,
                                isCompleted && styles.activityNameCompleted,
                                isCurrent && styles.activityNameCurrent,
                                isUpcoming && styles.activityNameUpcoming,
                            ]}>
                                {getActivityName(index)}
                            </Text>
                        </View>
                    );
                })}

                {totalActivities > 5 && (
                    <View style={styles.moreIndicator}>
                        <Text style={styles.moreText}>+{totalActivities - 5} more</Text>
                    </View>
                )}
            </View>

            {completedCount > 0 && (
                <View style={styles.completedSection}>
                    <Text style={styles.completedText}>
                        {completedCount} activities completed
                    </Text>
                </View>
            )}
        </View>
    );
}; 